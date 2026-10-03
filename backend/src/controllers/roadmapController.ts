import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import { recordUserActivity } from '../services/activityService.js';

export async function getRoadmaps(req: Request, res: Response): Promise<void> {
  try {
    const roadmaps = db.prepare('SELECT id, title, category, description, topics_json FROM roadmaps').all();
    const formatted = roadmaps.map((r: any) => ({
      ...r,
      topics: JSON.parse(r.topics_json || '[]')
    }));
    res.status(200).json({ roadmaps: formatted });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ error: 'Failed to retrieve roadmaps.' });
  }
}

export async function getUserRoadmapProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { roadmapId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const progressRecords = db.prepare('SELECT topic_id, status FROM user_roadmap_progress WHERE user_id = ? AND roadmap_id = ?').all(userId, roadmapId);
    const progressMap: Record<string, string> = {};
    for (const r of progressRecords as any[]) {
      progressMap[r.topic_id] = r.status;
    }

    res.status(200).json({ progress: progressMap });
  } catch (error) {
    console.error('Get user roadmap progress error:', error);
    res.status(500).json({ error: 'Failed to get roadmap progress.' });
  }
}

export async function updateTopicStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { roadmapId, topicId, status, topicTitle } = req.body; // status: 'not_started' | 'in_progress' | 'completed'

    if (!userId || !roadmapId || !topicId) {
      res.status(400).json({ error: 'Missing required roadmap parameters.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM user_roadmap_progress WHERE user_id = ? AND roadmap_id = ? AND topic_id = ?').get(userId, roadmapId, topicId);
    if (existing) {
      db.prepare('UPDATE user_roadmap_progress SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND roadmap_id = ? AND topic_id = ?')
        .run(status, userId, roadmapId, topicId);
    } else {
      const progId = randomUUID();
      db.prepare('INSERT INTO user_roadmap_progress (id, user_id, roadmap_id, topic_id, status) VALUES (?, ?, ?, ?, ?)')
        .run(progId, userId, roadmapId, topicId, status);
    }

    if (status === 'completed') {
      db.prepare('UPDATE users SET xp = xp + 30 WHERE id = ?').run(userId);
    }

    // Record activity for Streak & Recent Work
    recordUserActivity(
      userId,
      'learn',
      `Milestone: ${topicTitle || topicId}`,
      `Status: ${status.replace('_', ' ').toUpperCase()}`,
      'learn',
      { roadmapId, topicId, status }
    );

    res.status(200).json({ message: 'Roadmap progress updated successfully.' });
  } catch (error) {
    console.error('Update roadmap progress error:', error);
    res.status(500).json({ error: 'Failed to update topic status.' });
  }
}

/**
 * Dynamic Topic Learning Search
 * Fulfills Master Prompt Section 23
 */
export async function searchTopic(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Please enter a topic to search.' });
      return;
    }

    const learningPlan = await aiService.searchLearnTopic(query.trim());

    if (userId) {
      recordUserActivity(
        userId,
        'learn',
        `Explored Topic: ${query.trim()}`,
        learningPlan.description.slice(0, 80),
        'learn',
        { topic: query.trim() }
      );
    }

    res.status(200).json({ learningPlan });
  } catch (error: any) {
    console.error('Search topic error:', error);
    res.status(500).json({ error: error.message || 'Failed to search topic learning path.' });
  }
}
