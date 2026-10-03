import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import { recordUserActivity } from '../services/activityService.js';

/**
 * Mode A: Ask Interview Question
 * User asks ANY interview-related question and gets a comprehensive dynamic AI response
 * Fulfills Master Prompt Section 17 & 18A
 */
export async function askQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { question, topic } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'Please enter an interview question.' });
      return;
    }

    const result = await aiService.askInterviewQuestion(question.trim(), topic);

    if (userId) {
      recordUserActivity(
        userId,
        'interview',
        `Interview Q&A: ${question.trim().slice(0, 60)}`,
        topic ? `Topic: ${topic}` : 'General Tech Interview',
        'interview-prep',
        { question: question.trim(), topic }
      );
      db.prepare('UPDATE users SET xp = xp + 15 WHERE id = ?').run(userId);
    }

    res.status(200).json({ result });
  } catch (error: any) {
    console.error('Ask interview question error:', error);
    res.status(500).json({ error: error.message || 'Failed to process interview question.' });
  }
}

/**
 * Mode D: Answer Improvement
 * Candidate enters their answer to an interview question; AI provides detailed critique & rewrite
 * Fulfills Master Prompt Section 18D
 */
export async function improveAnswer(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { question, answer } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: 'Both question and candidate answer are required.' });
      return;
    }

    const review = await aiService.improveInterviewAnswer(question.trim(), answer.trim());

    if (userId) {
      recordUserActivity(
        userId,
        'interview',
        `Answer Review: ${question.trim().slice(0, 60)}`,
        `Rating: ${review.rating} (${review.score}/100)`,
        'interview-prep',
        { score: review.score, rating: review.rating }
      );
      db.prepare('UPDATE users SET xp = xp + 15 WHERE id = ?').run(userId);
    }

    res.status(200).json({ review });
  } catch (error: any) {
    console.error('Improve interview answer error:', error);
    res.status(500).json({ error: error.message || 'Failed to review interview answer.' });
  }
}

/**
 * Mode C: Topic Practice
 * Dynamically generates interview questions using AI for selected topic
 * Fulfills Master Prompt Section 18C
 */
export async function getTopicQuestions(req: Request, res: Response): Promise<void> {
  try {
    const { topic = 'DSA', difficulty = 'Medium' } = req.query;
    const questions = await aiService.generateTopicQuestions(String(topic), String(difficulty));
    res.status(200).json({ questions });
  } catch (error: any) {
    console.error('Get topic questions error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate topic questions.' });
  }
}

/**
 * Mode B: Dynamic Mock Interview
 * Interactive AI interviewer flow that evaluates real answers step-by-step
 * Fulfills Master Prompt Section 18B
 */
export async function startMockInterview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { roleType = 'Software Development Engineer (SDE)' } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const sessionId = randomUUID();
    const firstQuestion = `Welcome to your AI Mock Interview! 👋 I will be your interviewer today for the **${roleType}** role.\n\nTo kick off: Please introduce yourself briefly, mention your primary programming languages and technologies, and share what kind of technical challenges you enjoy solving.`;

    const initialMessages = [
      { role: 'interviewer', content: firstQuestion }
    ];

    db.prepare(`
      INSERT INTO interview_sessions (id, user_id, role_type, current_step, messages_json, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(sessionId, userId, roleType, 1, JSON.stringify(initialMessages), 'in_progress');

    recordUserActivity(
      userId,
      'interview',
      `Mock Interview: ${roleType}`,
      'Started Technical Mock Interview',
      'interview-prep',
      { sessionId, roleType }
    );

    res.status(201).json({
      sessionId,
      currentStep: 1,
      totalSteps: 5,
      currentStage: 'Introduction & Background',
      interviewerMessage: firstQuestion
    });
  } catch (error: any) {
    console.error('Start mock interview error:', error);
    res.status(500).json({ error: error.message || 'Failed to start mock interview.' });
  }
}

export async function answerMockInterview(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { sessionId, answer } = req.body;

    if (!userId || !sessionId || !answer) {
      res.status(400).json({ error: 'Session ID and answer are required.' });
      return;
    }

    const session = db.prepare('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?').get(sessionId, userId) as any;
    if (!session) {
      res.status(404).json({ error: 'Interview session not found.' });
      return;
    }

    const messages = JSON.parse(session.messages_json || '[]');
    messages.push({ role: 'candidate', content: answer.trim() });

    const currentStep = session.current_step;
    const totalSteps = 5;

    // Call dynamic AI to evaluate answer and ask next question or provide final score
    const turnResult = await aiService.evaluateMockInterviewTurn(session.role_type, messages, currentStep, totalSteps);

    if (turnResult.completed && turnResult.finalEvaluation) {
      const evaluationText = `### 🎯 AI Mock Interview Evaluation Report\n\n**Overall Performance: ${turnResult.finalEvaluation.overallScore} / 100**\n\n#### Detailed Breakdown:\n- **Technical Knowledge:** ${turnResult.finalEvaluation.technicalScore} / 100\n- **Problem Solving:** ${turnResult.finalEvaluation.problemSolvingScore} / 100\n- **Communication & Clarity:** ${turnResult.finalEvaluation.communicationScore} / 100\n\n#### Summary:\n${turnResult.finalEvaluation.feedbackSummary}\n\n#### 💡 Recommendations:\n${turnResult.finalEvaluation.recommendations.map(r => `- ${r}`).join('\n')}`;

      messages.push({ role: 'interviewer', content: evaluationText });

      db.prepare(`
        UPDATE interview_sessions
        SET current_step = ?, messages_json = ?, status = 'completed', scores_json = ?, feedback = ?
        WHERE id = ?
      `).run(totalSteps, JSON.stringify(messages), JSON.stringify(turnResult.finalEvaluation), turnResult.finalEvaluation.feedbackSummary, sessionId);

      recordUserActivity(
        userId,
        'interview',
        `Completed Mock Interview: ${session.role_type}`,
        `Score: ${turnResult.finalEvaluation.overallScore}/100`,
        'interview-prep',
        { score: turnResult.finalEvaluation.overallScore }
      );

      db.prepare('UPDATE users SET xp = xp + 35 WHERE id = ?').run(userId);

      res.status(200).json({
        completed: true,
        currentStep: totalSteps,
        totalSteps,
        interviewerMessage: evaluationText,
        evaluation: turnResult.finalEvaluation
      });
    } else {
      const interviewerMsg = `${turnResult.feedbackOnAnswer}\n\n${turnResult.nextQuestion}`;
      messages.push({ role: 'interviewer', content: interviewerMsg });

      db.prepare(`
        UPDATE interview_sessions
        SET current_step = ?, messages_json = ?
        WHERE id = ?
      `).run(currentStep + 1, JSON.stringify(messages), sessionId);

      res.status(200).json({
        completed: false,
        currentStep: currentStep + 1,
        totalSteps,
        interviewerMessage: interviewerMsg
      });
    }
  } catch (error: any) {
    console.error('Answer mock interview error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit interview answer.' });
  }
}

export async function getInterviewQuestions(req: Request, res: Response): Promise<void> {
  try {
    const { category = 'All', difficulty = 'All', search } = req.query;
    const cat = category === 'All' ? 'DSA' : String(category);
    const questions = await aiService.generateTopicQuestions(cat, difficulty === 'All' ? 'Medium' : String(difficulty));
    res.status(200).json({ questions });
  } catch (error: any) {
    console.error('Get interview questions error:', error);
    res.status(500).json({ error: 'Failed to fetch interview questions.' });
  }
}
