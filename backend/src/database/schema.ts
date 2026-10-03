import { getDbInstance, db } from './db.js';
import { seedDatabase } from './seed.js';

export async function initDatabase() {
  await getDbInstance();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      target_role TEXT DEFAULT 'Full Stack Software Engineer',
      xp INTEGER DEFAULT 120,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 1,
      last_active_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      mode TEXT DEFAULT 'coder',
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      code_snippet TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coding_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      session_type TEXT NOT NULL,
      title TEXT,
      output_analysis TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dsa_problems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      description TEXT NOT NULL,
      examples_json TEXT NOT NULL,
      constraints_json TEXT NOT NULL,
      hints_json TEXT NOT NULL,
      approach_md TEXT NOT NULL,
      solution_code_json TEXT NOT NULL,
      time_complexity TEXT,
      space_complexity TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dsa_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      language TEXT NOT NULL,
      code TEXT NOT NULL,
      status TEXT NOT NULL,
      analysis TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS keywords (
      id TEXT PRIMARY KEY,
      keyword TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      definition TEXT NOT NULL,
      simple_explanation TEXT NOT NULL,
      syntax TEXT NOT NULL,
      example_code TEXT NOT NULL,
      example_output TEXT NOT NULL,
      common_mistakes TEXT NOT NULL,
      interview_question TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      topics_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_roadmap_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      roadmap_id TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, roadmap_id, topic_id)
    );

    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      goal_title TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      weekly_commitment_hours INTEGER DEFAULT 15,
      plan_data_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT DEFAULT 'My Engineering Resume',
      content_json TEXT NOT NULL,
      ats_score INTEGER DEFAULT 75,
      feedback_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS interview_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role_type TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Medium',
      current_step INTEGER DEFAULT 1,
      messages_json TEXT NOT NULL,
      scores_json TEXT,
      feedback TEXT,
      status TEXT DEFAULT 'in_progress',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_matches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      job_title TEXT,
      company TEXT,
      raw_description TEXT NOT NULL,
      match_score INTEGER NOT NULL,
      matched_skills_json TEXT NOT NULL,
      missing_skills_json TEXT NOT NULL,
      recommendations_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      xp_bonus INTEGER DEFAULT 50
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS daily_challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      task_type TEXT NOT NULL,
      xp_reward INTEGER DEFAULT 50
    );

    CREATE TABLE IF NOT EXISTS user_challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      UNIQUE(user_id, challenge_id, date)
    );

    CREATE TABLE IF NOT EXISTS user_activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      target_tab TEXT NOT NULL,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ats_analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      ats_score INTEGER NOT NULL,
      target_job_title TEXT,
      analysis_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Ensure longest_streak column exists on users
  try {
    db.exec(`ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 1;`);
  } catch {
    // Column already exists, safe to ignore
  }

  console.log('SQLite Schema initialized successfully.');
  seedDatabase();
}

