import { randomUUID } from 'crypto';
import db from '../database/db.js';

export interface UserActivityRecord {
  id: string;
  userId: string;
  activityType: 'chat' | 'code' | 'interview' | 'learn' | 'resume';
  title: string;
  subtitle?: string;
  targetTab: string;
  metadata?: any;
  createdAt: string;
}

/**
 * Record a meaningful learning/coding/interview/resume activity for the user.
 * Automatically updates streak based on real dates.
 */
export function recordUserActivity(
  userId: string,
  activityType: 'chat' | 'code' | 'interview' | 'learn' | 'resume',
  title: string,
  subtitle?: string,
  targetTab: string = 'dashboard',
  metadata?: any
): void {
  try {
    if (!userId) return;

    // 1. Insert into user_activities
    const activityId = randomUUID();
    db.prepare(`
      INSERT INTO user_activities (id, user_id, activity_type, title, subtitle, target_tab, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      activityId,
      userId,
      activityType,
      title.slice(0, 150),
      subtitle ? subtitle.slice(0, 200) : null,
      targetTab,
      metadata ? JSON.stringify(metadata) : null
    );

    // 2. Real Streak Calculation
    const user = db.prepare('SELECT streak, longest_streak, last_active_date FROM users WHERE id = ?').get(userId) as any;
    if (!user) return;

    const now = new Date();
    const today = now.toISOString().slice(0, 10); // YYYY-MM-DD

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().slice(0, 10);

    const currentStreak = user.streak || 0;
    const currentLongest = user.longest_streak || currentStreak || 1;
    const lastActive = user.last_active_date ? user.last_active_date.slice(0, 10) : null;

    let newStreak = currentStreak;
    let newLongest = currentLongest;

    if (!lastActive) {
      // First activity ever
      newStreak = 1;
      newLongest = Math.max(newLongest, 1);
    } else if (lastActive === today) {
      // Already active today; maintain streak
      newStreak = Math.max(currentStreak, 1);
    } else if (lastActive === yesterday) {
      // Active yesterday; streak increments!
      newStreak = currentStreak + 1;
      newLongest = Math.max(newLongest, newStreak);
    } else {
      // Gap of more than 1 day; reset streak to 1
      newStreak = 1;
      newLongest = Math.max(newLongest, 1);
    }

    db.prepare(`
      UPDATE users
      SET streak = ?, longest_streak = ?, last_active_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStreak, newLongest, today, userId);
  } catch (err) {
    console.error('[activityService] Failed to record user activity:', err);
  }
}

/**
 * Retrieve recent activities for user
 */
export function getRecentActivities(userId: string, limit: number = 10): any[] {
  try {
    const rows = db.prepare(`
      SELECT id, activity_type, title, subtitle, target_tab, metadata_json, created_at
      FROM user_activities
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, limit) as any[];

    return rows.map((r) => ({
      id: r.id,
      activityType: r.activity_type,
      title: r.title,
      subtitle: r.subtitle,
      targetTab: r.target_tab,
      metadata: r.metadata_json ? JSON.parse(r.metadata_json) : null,
      createdAt: r.created_at
    }));
  } catch (err) {
    console.error('[activityService] Failed to get recent activities:', err);
    return [];
  }
}

/**
 * Get user learning progress summary from roadmaps
 */
export function getUserLearningProgress(userId: string): any[] {
  try {
    // Get distinct roadmaps and compute progress based on user_roadmap_progress
    const roadmaps = db.prepare('SELECT id, title, topics_json FROM roadmaps').all() as any[];
    const userProgress = db.prepare('SELECT roadmap_id, topic_id, status FROM user_roadmap_progress WHERE user_id = ? AND status = ?').all(userId, 'completed') as any[];

    const completedTopicSet = new Set(userProgress.map(p => `${p.roadmap_id}:${p.topic_id}`));

    const result = [];
    for (const rm of roadmaps) {
      let topics = [];
      try {
        topics = JSON.parse(rm.topics_json || '[]');
      } catch {
        topics = [];
      }
      if (topics.length === 0) continue;

      const completed = topics.filter((t: any) => completedTopicSet.has(`${rm.id}:${t.id}`)).length;
      if (completed > 0) {
        const percentage = Math.round((completed / topics.length) * 100);
        result.push({
          roadmapId: rm.id,
          title: rm.title,
          totalTopics: topics.length,
          completedTopics: completed,
          percentage
        });
      }
    }

    return result;
  } catch (err) {
    console.error('[activityService] Failed to get user learning progress:', err);
    return [];
  }
}
