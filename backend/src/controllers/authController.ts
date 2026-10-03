import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import db from '../database/db.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, confirmPassword, targetRole } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Please provide full name, email, and password.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists. Please login.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = randomUUID();

    db.prepare(`
      INSERT INTO users (id, name, email, password, target_role, xp, level, streak)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name.trim(), email.toLowerCase().trim(), hashedPassword, targetRole || 'Full Stack Software Engineer', 100, 1, 1);

    const token = generateToken({ id: userId, email: email.toLowerCase().trim(), name: name.trim() });

    res.status(201).json({
      message: 'Account successfully created.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        targetRole: targetRole || 'Full Stack Software Engineer',
        xp: 100,
        level: 1,
        streak: 1
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Update streak if needed
    const today = new Date().toISOString().slice(0, 10);
    let streak = user.streak || 1;
    if (user.last_active_date) {
      const lastDate = new Date(user.last_active_date);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        streak += 1;
      } else if (diffDays > 1) {
        streak = 1;
      }
    }

    db.prepare('UPDATE users SET last_active_date = ?, streak = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(today, streak, user.id);

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        targetRole: user.target_role,
        xp: user.xp,
        level: user.level,
        streak: streak
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = db.prepare('SELECT id, name, email, target_role, xp, level, streak, created_at FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        targetRole: user.target_role,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { name, targetRole } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    db.prepare('UPDATE users SET name = COALESCE(?, name), target_role = COALESCE(?, target_role), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name ? name.trim() : null, targetRole ? targetRole.trim() : null, userId);

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}
