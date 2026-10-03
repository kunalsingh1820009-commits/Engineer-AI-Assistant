import { Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function generateStudyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { goalTitle = 'Placements in 3 Months', durationMonths = 3, weeklyCommitmentHours = 15 } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const planId = randomUUID();

    // Generate tailored multi-phase schedule
    const months = [];
    if (durationMonths >= 1) {
      months.push({
        monthNumber: 1,
        theme: 'Core Programming & Foundational DSA',
        weeks: [
          { weekNumber: 1, topic: 'Language Syntax & Pointers/Memory Model', tasks: ['Understand Stack vs Heap memory', 'Master pointers and references', 'Solve 10 basic array manipulation problems'] },
          { weekNumber: 2, topic: 'Time & Space Complexity + Two Pointers', tasks: ['Learn Big-O asymptotic notation', 'Master Two Pointers & Sliding Window', 'Solve Two Sum, 3Sum, and Container With Most Water'] },
          { weekNumber: 3, topic: 'Strings & Hash Tables', tasks: ['Implement custom String hashing', 'Solve Longest Substring Without Repeating Characters', 'Build Group Anagrams solution'] },
          { weekNumber: 4, topic: 'Linked Lists & Fast/Slow Pointers', tasks: ['Reverse a Linked List in O(1) space', 'Detect Cycle in Linked List (Floyd\'s algorithm)', 'Merge Two Sorted Lists'] }
        ]
      });
    }

    if (durationMonths >= 2) {
      months.push({
        monthNumber: 2,
        theme: 'Advanced DSA & CS Core Fundamentals',
        weeks: [
          { weekNumber: 5, topic: 'Stacks, Queues & Monotonic Stack', tasks: ['Solve Valid Parentheses', 'Implement Min Stack with O(1) getMin()', 'Daily Temperatures (Monotonic Stack)'] },
          { weekNumber: 6, topic: 'Trees & Binary Search Trees', tasks: ['Implement Inorder/Preorder/Postorder traversals', 'Invert Binary Tree', 'Validate Binary Search Tree'] },
          { weekNumber: 7, topic: 'Graphs (BFS, DFS, Dijkstra)', tasks: ['Number of Islands (Flood fill DFS)', 'Clone Graph', 'Course Schedule (Topological Sort / Cycle detection)'] },
          { weekNumber: 8, topic: 'Operating Systems & DBMS Core', tasks: ['Review Process scheduling & Virtual Memory', 'Understand Deadlock conditions & Mutex vs Semaphore', 'Practice SQL Joins, Indexing (B+ Trees), and Normalization'] }
        ]
      });
    }

    if (durationMonths >= 3) {
      months.push({
        monthNumber: 3,
        theme: 'Dynamic Programming, System Design & Placement Mocks',
        weeks: [
          { weekNumber: 9, topic: 'Dynamic Programming (1D & 2D)', tasks: ['Climbing Stairs & House Robber (1D DP)', 'Coin Change (0/1 Knapsack variation)', 'Longest Common Subsequence (2D Grid)'] },
          { weekNumber: 10, topic: 'Full Stack Project Polish & README', tasks: ['Complete production-ready portfolio project', 'Optimize REST APIs and add JWT authentication', 'Generate ATS-friendly resume descriptions with Engineer AI'] },
          { weekNumber: 11, topic: 'System Design & Computer Networks', tasks: ['Review OSI model, TCP/UDP, DNS, and HTTP/HTTPS', 'Design URL Shortener (TinyURL) or Rate Limiter', 'Learn Caching strategies (Redis) and Load Balancers'] },
          { weekNumber: 12, topic: 'AI Mock Interviews & HR Preparation', tasks: ['Complete 3 AI Technical Mock Interviews on Engineer AI', 'Prepare STAR method behavioral stories', 'Conduct company-specific past placement question sweeps'] }
        ]
      });
    }

    const planData = {
      goalTitle,
      durationMonths,
      weeklyCommitmentHours,
      months,
      completedTaskIds: []
    };

    db.prepare(`
      INSERT INTO study_plans (id, user_id, goal_title, duration_months, weekly_commitment_hours, plan_data_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(planId, userId, goalTitle, durationMonths, weeklyCommitmentHours, JSON.stringify(planData));

    db.prepare('UPDATE users SET xp = xp + 25 WHERE id = ?').run(userId);

    res.status(201).json({
      plan: {
        id: planId,
        ...planData
      }
    });
  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({ error: 'Failed to generate study plan.' });
  }
}

export async function getUserStudyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const plan = db.prepare('SELECT * FROM study_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any;
    if (!plan) {
      res.status(200).json({ plan: null });
      return;
    }

    res.status(200).json({
      plan: {
        id: plan.id,
        goalTitle: plan.goal_title,
        durationMonths: plan.duration_months,
        weeklyCommitmentHours: plan.weekly_commitment_hours,
        ...JSON.parse(plan.plan_data_json || '{}')
      }
    });
  } catch (error) {
    console.error('Get study plan error:', error);
    res.status(500).json({ error: 'Failed to get study plan.' });
  }
}

export async function toggleTaskCompletion(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { planId, taskText } = req.body;

    if (!userId || !planId || !taskText) {
      res.status(400).json({ error: 'Missing required parameters.' });
      return;
    }

    const plan = db.prepare('SELECT plan_data_json FROM study_plans WHERE id = ? AND user_id = ?').get(planId, userId) as any;
    if (!plan) {
      res.status(404).json({ error: 'Study plan not found.' });
      return;
    }

    const parsed = JSON.parse(plan.plan_data_json || '{}');
    let completed = parsed.completedTasks || [];
    if (completed.includes(taskText)) {
      completed = completed.filter((t: string) => t !== taskText);
    } else {
      completed.push(taskText);
      db.prepare('UPDATE users SET xp = xp + 15 WHERE id = ?').run(userId);
    }
    parsed.completedTasks = completed;

    db.prepare('UPDATE study_plans SET plan_data_json = ? WHERE id = ?').run(JSON.stringify(parsed), planId);

    res.status(200).json({ completedTasks: completed });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Failed to toggle study task.' });
  }
}
