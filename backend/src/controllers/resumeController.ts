import { Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import { recordUserActivity } from '../services/activityService.js';

export async function saveResume(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { title = 'My Engineering Resume', content } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM resumes WHERE user_id = ?').get(userId) as any;
    if (existing) {
      db.prepare(`
        UPDATE resumes
        SET title = ?, content_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(title, JSON.stringify(content), userId);
    } else {
      const resumeId = randomUUID();
      db.prepare(`
        INSERT INTO resumes (id, user_id, title, content_json)
        VALUES (?, ?, ?, ?)
      `).run(resumeId, userId, title, JSON.stringify(content));
    }

    db.prepare('UPDATE users SET xp = xp + 30 WHERE id = ?').run(userId);

    recordUserActivity(
      userId,
      'resume',
      'Saved Engineering Resume',
      title,
      'resume'
    );

    res.status(200).json({
      message: 'Resume saved successfully.'
    });
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({ error: 'Failed to save resume.' });
  }
}

export async function getResume(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const resume = db.prepare('SELECT * FROM resumes WHERE user_id = ?').get(userId) as any;
    if (!resume) {
      const defaultContent = {
        personalInfo: {
          fullName: req.user?.name || 'Alex Morgan',
          email: req.user?.email || 'alex.morgan@email.com',
          phone: '+1 (555) 234-5678',
          github: 'github.com/alexmorgan',
          linkedin: 'linkedin.com/in/alexmorgan',
          portfolio: 'alexmorgan.dev'
        },
        education: [
          { degree: 'B.Tech in Computer Science & Engineering', institution: 'University Institute of Technology', year: '2023 - 2027', gpa: '8.8 / 10.0' }
        ],
        skills: {
          languages: ['C++', 'Python', 'JavaScript', 'TypeScript', 'SQL'],
          frameworks: ['React', 'Node.js', 'Express.js', 'Vite'],
          tools: ['Git', 'Docker', 'Postman', 'Linux / Bash', 'VS Code'],
          coursework: ['Data Structures & Algorithms', 'Operating Systems', 'Database Management', 'Computer Networks']
        },
        projects: [
          {
            title: 'Engineer AI Assistant Platform',
            technologies: 'React, TypeScript, Node.js, Express, SQLite',
            bulletPoints: [
              'Architected a full-stack engineering assistant with intelligent code debugging, Big-O complexity analysis, and multi-mode AI mentoring.',
              'Integrated JWT token authentication and SQLite database with sub-25ms response latency across 30+ interactive modules.',
              'Developed an ATS resume parser and mock interview coach serving student placement readiness metrics.'
            ]
          }
        ],
        experience: [
          {
            role: 'Software Engineering Intern',
            company: 'Tech Solutions Inc.',
            period: 'June 2025 - August 2025',
            bulletPoints: [
              'Built reusable React UI components and optimized frontend bundle size by 28%.',
              'Refactored legacy REST endpoints in Express.js and wrote automated integration tests.'
            ]
          }
        ],
        achievements: [
          'Solved 300+ Data Structure & Algorithm problems across LeetCode and Codeforces.',
          'Winner of Annual College Hackathon 2025 (1st place out of 60 teams).'
        ]
      };

      res.status(200).json({ resume: { content: defaultContent, atsScore: 82 } });
      return;
    }

    res.status(200).json({
      resume: {
        id: resume.id,
        title: resume.title,
        content: JSON.parse(resume.content_json || '{}'),
        atsScore: resume.ats_score,
        analysis: JSON.parse(resume.feedback_json || '{}')
      }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to retrieve resume.' });
  }
}

export async function enhanceBullet(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { rawText } = req.body;
    if (!rawText) {
      res.status(400).json({ error: 'Text content is required.' });
      return;
    }

    const enhanced = await aiService.enhanceBulletPoint(rawText);

    if (userId) {
      recordUserActivity(
        userId,
        'resume',
        'Enhanced Resume Bullet Point',
        enhanced.slice(0, 70),
        'resume'
      );
    }

    res.status(200).json({ enhanced });
  } catch (error) {
    console.error('Enhance bullet error:', error);
    res.status(500).json({ error: 'Failed to enhance bullet point.' });
  }
}

/**
 * ATS Resume Scorer & Analyzer
 * Fulfills Master Prompt Sections 19, 20, 21
 */
export async function analyzeATS(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      res.status(400).json({ error: 'Please provide your resume text or upload your resume file.' });
      return;
    }

    const analysis = await aiService.analyzeResumeATS(resumeText.trim(), jobDescription);

    if (userId) {
      const recordId = randomUUID();
      try {
        db.prepare(`
          INSERT INTO ats_analyses (id, user_id, ats_score, target_job_title, analysis_json, created_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(recordId, userId, analysis.atsScore, jobDescription ? 'Target Role Job Description' : 'General SDE', JSON.stringify(analysis));
      } catch (dbErr) {
        console.warn('Failed to insert into ats_analyses table:', dbErr);
      }

      recordUserActivity(
        userId,
        'resume',
        `ATS Resume Scored: ${analysis.atsScore}/100`,
        analysis.summary.slice(0, 80),
        'resume',
        { atsScore: analysis.atsScore }
      );

      db.prepare('UPDATE users SET xp = xp + 25 WHERE id = ?').run(userId);
    }

    res.status(200).json({ analysis });
  } catch (error: any) {
    console.error('ATS Analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume with ATS.' });
  }
}
