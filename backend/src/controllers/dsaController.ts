import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import aiService from '../services/aiService.js';

export async function getProblems(req: Request, res: Response): Promise<void> {
  try {
    const { category, difficulty, search } = req.query;
    let query = 'SELECT id, title, category, difficulty, time_complexity, space_complexity FROM dsa_problems WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (difficulty && difficulty !== 'All') {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY difficulty ASC';
    const problems = db.prepare(query).all(...params);
    res.status(200).json({ problems });
  } catch (error) {
    console.error('Get DSA problems error:', error);
    res.status(500).json({ error: 'Failed to fetch DSA problems.' });
  }
}

export async function getProblemDetail(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const problem = db.prepare('SELECT * FROM dsa_problems WHERE id = ?').get(id) as any;
    if (!problem) {
      res.status(404).json({ error: 'Problem not found.' });
      return;
    }

    res.status(200).json({
      problem: {
        ...problem,
        examples: JSON.parse(problem.examples_json || '[]'),
        constraints: JSON.parse(problem.constraints_json || '[]'),
        hints: JSON.parse(problem.hints_json || '[]'),
        solutions: JSON.parse(problem.solution_code_json || '{}')
      }
    });
  } catch (error) {
    console.error('Get problem detail error:', error);
    res.status(500).json({ error: 'Failed to fetch problem detail.' });
  }
}

export async function submitProblemAttempt(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { problemId, language, code, status } = req.body;

    if (!userId || !problemId || !code) {
      res.status(400).json({ error: 'Missing required attempt fields.' });
      return;
    }

    const attemptId = randomUUID();
    db.prepare(`
      INSERT INTO dsa_attempts (id, user_id, problem_id, language, code, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(attemptId, userId, problemId, language, code, status || 'solved');

    // Award XP
    const xpGain = status === 'solved' ? 50 : 20;
    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(xpGain, userId);

    res.status(200).json({
      message: status === 'solved' ? 'Problem solved successfully! +50 XP' : 'Attempt recorded. +20 XP',
      xpGain
    });
  } catch (error) {
    console.error('Submit DSA attempt error:', error);
    res.status(500).json({ error: 'Failed to save DSA attempt.' });
  }
}

export async function detectPattern(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { problemDescription } = req.body;
    if (!problemDescription) {
      res.status(400).json({ error: 'Problem description is required.' });
      return;
    }

    const patternResult = await aiService.detectPattern(problemDescription);
    res.status(200).json({ patternResult });
  } catch (error) {
    console.error('Detect pattern error:', error);
    res.status(500).json({ error: 'Failed to detect DSA pattern.' });
  }
}
