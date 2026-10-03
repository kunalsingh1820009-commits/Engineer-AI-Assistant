import { Response } from 'express';
import db from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getUserHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const codingSessions = db.prepare(`
      SELECT id, language, session_type, title, created_at
      FROM coding_sessions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(userId);

    const interviewSessions = db.prepare(`
      SELECT id, role_type, status, scores_json, feedback, created_at
      FROM interview_sessions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 15
    `).all(userId);

    const recentChats = db.prepare(`
      SELECT id, mode, content, created_at
      FROM chats
      WHERE user_id = ? AND role = 'user'
      ORDER BY created_at DESC
      LIMIT 20
    `).all(userId);

    const userActivities = db.prepare(`
      SELECT id, activity_type, title, subtitle, target_tab, created_at
      FROM user_activities
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 30
    `).all(userId);

    const atsAnalyses = db.prepare(`
      SELECT id, ats_score, target_job_title, created_at
      FROM ats_analyses
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(userId);

    res.status(200).json({
      codingSessions,
      interviewSessions: interviewSessions.map((i: any) => ({
        ...i,
        scores: i.scores_json ? JSON.parse(i.scores_json) : null
      })),
      recentChats,
      userActivities,
      atsAnalyses
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to retrieve user history.' });
  }
}
