import { Response } from 'express';
import db from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getRecentActivities, getUserLearningProgress } from '../services/activityService.js';

/**
 * Clean student-focused Dashboard Summary
 * Fulfills Master Prompt Section 3 (Welcome, Streak, Recent Work, Learning Progress)
 */
export async function getDashboardSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = db.prepare('SELECT id, name, email, target_role, xp, level, streak, longest_streak, last_active_date FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Determine time-appropriate greeting
    const currentHour = new Date().getHours();
    let greeting = 'Good evening';
    if (currentHour >= 5 && currentHour < 12) {
      greeting = 'Good morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      greeting = 'Good afternoon';
    }

    // Get real recent activities
    const recentActivities = getRecentActivities(userId, 10);

    // If recent activities table is empty (e.g. initial run), aggregate from existing tables
    let finalRecentWork = recentActivities;
    if (finalRecentWork.length === 0) {
      const pastSessions = db.prepare('SELECT id, title, language, created_at FROM coding_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 3').all(userId) as any[];
      const pastChats = db.prepare('SELECT id, content, created_at FROM chats WHERE user_id = ? AND role = "user" ORDER BY created_at DESC LIMIT 3').all(userId) as any[];
      const pastInterviews = db.prepare('SELECT id, role_type, created_at FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 2').all(userId) as any[];

      const aggregated: any[] = [];
      for (const s of pastSessions) {
        aggregated.push({
          id: s.id,
          activityType: 'code',
          title: s.title || `Coding (${s.language?.toUpperCase()})`,
          subtitle: 'Code Lab session',
          targetTab: 'code-lab',
          createdAt: s.created_at
        });
      }
      for (const c of pastChats) {
        aggregated.push({
          id: c.id,
          activityType: 'chat',
          title: c.content?.slice(0, 60),
          subtitle: 'AI conversation',
          targetTab: 'ai-assistant',
          createdAt: c.created_at
        });
      }
      for (const i of pastInterviews) {
        aggregated.push({
          id: i.id,
          activityType: 'interview',
          title: `Interview Practice: ${i.role_type}`,
          subtitle: 'Interview Prep session',
          targetTab: 'interview-prep',
          createdAt: i.created_at
        });
      }

      aggregated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      finalRecentWork = aggregated.slice(0, 6);
    }

    // Get real learning progress (from user_roadmap_progress)
    const learningProgress = getUserLearningProgress(userId);

    const currentStreak = user.streak || 0;
    const longestStreak = Math.max(user.longest_streak || 0, currentStreak);

    res.status(200).json({
      greeting,
      userName: user.name,
      welcomeMessage: 'Continue learning and building your skills.',
      streak: {
        current: currentStreak,
        longest: longestStreak,
        display: `🔥 ${currentStreak} Day Streak`,
        lastActiveDate: user.last_active_date
      },
      recentWork: finalRecentWork,
      learningProgress,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        targetRole: user.target_role,
        xp: user.xp,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard summary.' });
  }
}

export async function getDashboardProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = db.prepare('SELECT id, name, email, target_role, xp, level, streak, longest_streak FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const totalDSA = db.prepare('SELECT count(*) as count FROM dsa_problems').get() as { count: number };
    const solvedDSA = db.prepare('SELECT count(DISTINCT problem_id) as count FROM dsa_attempts WHERE user_id = ? AND status = ?').get(userId, 'solved') as { count: number };
    const dsaPercentage = totalDSA.count > 0 ? Math.round((solvedDSA.count / totalDSA.count) * 100) : 0;

    const codingSessions = db.prepare('SELECT count(*) as count FROM coding_sessions WHERE user_id = ?').get(userId) as { count: number };
    const completedMocks = db.prepare('SELECT count(*) as count FROM interview_sessions WHERE user_id = ? AND status = ?').get(userId, 'completed') as { count: number };
    const interviewReadiness = Math.min(95, 50 + completedMocks.count * 15 + Math.round(dsaPercentage * 0.3));
    const codingScore = Math.min(98, 60 + Math.min(25, codingSessions.count * 5) + Math.round(dsaPercentage * 0.2));

    const computedLevel = Math.max(1, Math.floor((user.xp || 100) / 200) + 1);
    const xpInCurrentLevel = (user.xp || 100) % 200;

    const placementReadiness = {
      overallScore: Math.round((codingScore + dsaPercentage + interviewReadiness) / 3),
      categories: [
        { name: 'DSA & Problem Solving', score: Math.max(45, dsaPercentage + 30) },
        { name: 'Core CS Fundamentals', score: 68 },
        { name: 'System Design & Web', score: 75 },
        { name: 'Interview & Soft Skills', score: interviewReadiness },
        { name: 'Resume & Portfolio', score: 82 }
      ],
      weakestArea: 'Operating Systems (Memory Management & Deadlocks)',
      advisorMessage: 'Focus on core system fundamentals and practice algorithmic problem solving.'
    };

    res.status(200).json({
      user: {
        ...user,
        level: computedLevel,
        xpInCurrentLevel,
        xpRequiredForNextLevel: 200
      },
      stats: {
        codingScore: `${codingScore}%`,
        dsaProgress: `${dsaPercentage}%`,
        interviewReadiness: `${interviewReadiness}%`,
        learningStreak: `🔥 ${user.streak || 1} Days`,
        problemsSolved: solvedDSA.count,
        codingSessionsCount: codingSessions.count,
        mockInterviewsCount: completedMocks.count
      },
      placementReadiness
    });
  } catch (error) {
    console.error('Get dashboard progress error:', error);
    res.status(500).json({ error: 'Failed to compute dashboard progress.' });
  }
}

export async function getGamificationData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const allBadges = db.prepare('SELECT * FROM badges').all() as any[];
    const unlockedBadges = db.prepare('SELECT badge_id, unlocked_at FROM user_badges WHERE user_id = ?').all(userId) as any[];
    const unlockedSet = new Set(unlockedBadges.map(b => b.badge_id));

    const today = new Date().toISOString().slice(0, 10);
    const dailyChallenges = db.prepare('SELECT * FROM daily_challenges').all() as any[];
    const userChallenges = db.prepare('SELECT challenge_id, completed FROM user_challenges WHERE user_id = ? AND date = ?').all(userId, today) as any[];
    const completedChallengesSet = new Set(userChallenges.filter(c => c.completed === 1).map(c => c.challenge_id));

    const enrichedBadges = allBadges.map(b => ({
      ...b,
      unlocked: unlockedSet.has(b.id) || b.id === 'b1'
    }));

    const enrichedChallenges = dailyChallenges.map(c => ({
      ...c,
      completed: completedChallengesSet.has(c.id)
    }));

    res.status(200).json({
      badges: enrichedBadges,
      challenges: enrichedChallenges
    });
  } catch (error) {
    console.error('Get gamification error:', error);
    res.status(500).json({ error: 'Failed to retrieve gamification details.' });
  }
}

export async function claimDailyChallenge(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { challengeId } = req.body;

    if (!userId || !challengeId) {
      res.status(400).json({ error: 'Missing challenge parameters.' });
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const challenge = db.prepare('SELECT xp_reward FROM daily_challenges WHERE id = ?').get(challengeId) as any;
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found.' });
      return;
    }

    const existing = db.prepare('SELECT id, completed FROM user_challenges WHERE user_id = ? AND challenge_id = ? AND date = ?').get(userId, challengeId, today) as any;
    if (existing && existing.completed) {
      res.status(400).json({ error: 'Challenge already claimed for today.' });
      return;
    }

    if (existing) {
      db.prepare('UPDATE user_challenges SET completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?').run(existing.id);
    } else {
      const id = `${userId}_${challengeId}_${today}`;
      db.prepare('INSERT INTO user_challenges (id, user_id, challenge_id, date, completed, completed_at) VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)')
        .run(id, userId, challengeId, today);
    }

    db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').run(challenge.xp_reward || 50, userId);

    res.status(200).json({ message: 'Challenge reward claimed successfully!', xpGain: challenge.xp_reward || 50 });
  } catch (error) {
    console.error('Claim challenge error:', error);
    res.status(500).json({ error: 'Failed to claim challenge.' });
  }
}
