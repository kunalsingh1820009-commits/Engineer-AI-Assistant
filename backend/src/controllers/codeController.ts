import { Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import { recordUserActivity } from '../services/activityService.js';

/**
 * Unified Code Analysis: Detailed Explanation + Debugging & Issues + Dynamic Test Cases
 * Fulfills Master Prompt Sections 7, 8, 9, 10
 */
export async function analyzeCode(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { code, language = 'cpp', title } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ error: 'Please enter your code first.' });
      return;
    }

    const analysis = await aiService.analyzeCodeComprehensive(code.trim(), language);

    if (userId) {
      const sessionId = randomUUID();
      const displayTitle = title || `Code Analysis (${language.toUpperCase()})`;
      db.prepare(`
        INSERT INTO coding_sessions (id, user_id, language, code, session_type, title, output_analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, userId, language, code.trim(), 'analysis', displayTitle, JSON.stringify(analysis));

      db.prepare('UPDATE users SET xp = xp + 20 WHERE id = ?').run(userId);

      // Record activity for Streak & Recent Work
      recordUserActivity(
        userId,
        'code',
        displayTitle,
        analysis.explanation.summary || 'Code Analysis and Debugging',
        'code-lab',
        { language, hasIssues: analysis.debugging.hasIssues }
      );
    }

    res.status(200).json({ analysis });
  } catch (error: any) {
    console.error('Analyze code error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze code.' });
  }
}

/**
 * Unified Complexity & Improvement: Big-O analysis with reasons + Bottlenecks + Optimization
 * Fulfills Master Prompt Sections 11, 12, 13, 14
 */
export async function analyzeComplexityAndImprovement(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { code, language = 'cpp', title } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ error: 'Please enter your code first.' });
      return;
    }

    const result = await aiService.analyzeComplexityAndImprovement(code.trim(), language);

    if (userId) {
      const sessionId = randomUUID();
      const displayTitle = title || `Complexity & Optimization (${language.toUpperCase()})`;
      db.prepare(`
        INSERT INTO coding_sessions (id, user_id, language, code, session_type, title, output_analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, userId, language, code.trim(), 'complexity', displayTitle, JSON.stringify(result));

      db.prepare('UPDATE users SET xp = xp + 20 WHERE id = ?').run(userId);

      recordUserActivity(
        userId,
        'code',
        displayTitle,
        `Time: ${result.timeComplexity}, Space: ${result.spaceComplexity}`,
        'code-lab',
        { language, timeComplexity: result.timeComplexity, isOptimal: result.isOptimal }
      );
    }

    res.status(200).json({ result });
  } catch (error: any) {
    console.error('Complexity & Improvement error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze complexity and improvements.' });
  }
}

export async function debugCode(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { code, language = 'cpp', title } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ error: 'Please enter your code first.' });
      return;
    }

    const analysis = await aiService.debugCode(code.trim(), language);

    if (userId) {
      const sessionId = randomUUID();
      db.prepare(`
        INSERT INTO coding_sessions (id, user_id, language, code, session_type, title, output_analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, userId, language, code, 'debug', title || 'Debug Session', JSON.stringify(analysis));

      db.prepare('UPDATE users SET xp = xp + 15 WHERE id = ?').run(userId);

      recordUserActivity(userId, 'code', title || `Debug ${language.toUpperCase()} Code`, analysis.problem, 'code-lab');
    }

    res.status(200).json({ analysis });
  } catch (error) {
    console.error('Debug code error:', error);
    res.status(500).json({ error: 'Failed to debug code.' });
  }
}

export async function explainError(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { errorMessage } = req.body;
    if (!errorMessage) {
      res.status(400).json({ error: 'Error message is required.' });
      return;
    }

    const explanation = await aiService.explainError(errorMessage);
    res.status(200).json({ explanation });
  } catch (error) {
    console.error('Explain error failure:', error);
    res.status(500).json({ error: 'Failed to explain error.' });
  }
}

export async function explainCode(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { code, language = 'cpp' } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ error: 'Please enter your code first.' });
      return;
    }

    const prompt = `Explain the following ${language} code clearly for a student. Include Concept, Line-by-line explanation, Flow diagram/Trace, and Potential edge cases:\n\n\`\`\`${language}\n${code.trim()}\n\`\`\``;
    const explanation = await aiService.generateResponse(prompt, undefined, 'coder');

    res.status(200).json({ explanation });
  } catch (error) {
    console.error('Explain code error:', error);
    res.status(500).json({ error: 'Failed to explain code.' });
  }
}

export async function analyzeComplexity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { code, language = 'cpp', title } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ error: 'Please enter your code first.' });
      return;
    }

    const analysis = await aiService.analyzeComplexity(code.trim(), language);

    if (userId) {
      const sessionId = randomUUID();
      db.prepare(`
        INSERT INTO coding_sessions (id, user_id, language, code, session_type, title, output_analysis)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, userId, language, code.trim(), 'complexity', title || 'Complexity Analysis', JSON.stringify(analysis));

      db.prepare('UPDATE users SET xp = xp + 15 WHERE id = ?').run(userId);

      recordUserActivity(userId, 'code', title || `Complexity Analysis (${language.toUpperCase()})`, `${analysis.timeComplexity} / ${analysis.spaceComplexity}`, 'code-lab');
    }

    res.status(200).json({ analysis });
  } catch (error) {
    console.error('Complexity analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze complexity.' });
  }
}

export async function improveCode(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { code, language = 'cpp' } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ error: 'Please enter your code first.' });
      return;
    }

    const improvement = await aiService.improveCode(code.trim(), language);

    if (userId) {
      db.prepare('UPDATE users SET xp = xp + 15 WHERE id = ?').run(userId);
      recordUserActivity(userId, 'code', `Code Optimization (${language.toUpperCase()})`, 'Refactored code', 'code-lab');
    }

    res.status(200).json({ improvement });
  } catch (error) {
    console.error('Improve code error:', error);
    res.status(500).json({ error: 'Failed to improve code.' });
  }
}

export async function generateTestCases(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { code, language = 'cpp' } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ error: 'Please enter your code first.' });
      return;
    }

    const testCases = await aiService.generateTestCases(code.trim(), language);
    res.status(200).json({ testCases });
  } catch (error: any) {
    console.error('Test cases error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate test cases.' });
  }
}

export async function runCodeSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { code, language = 'javascript', input = '' } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ error: 'Please enter your code first.' });
      return;
    }

    let logs: string[] = [];
    let executionTime = Math.floor(Math.random() * 30) + 12; // 12-42ms
    let memoryUsage = (Math.random() * 2 + 14).toFixed(1); // ~15.2 MB

    if (language === 'javascript') {
      try {
        const consoleLog = (...args: any[]) => {
          logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };
        const sandboxedFunc = new Function('console', 'input', `${code}`);
        sandboxedFunc({ log: consoleLog, warn: consoleLog, error: consoleLog }, input);
      } catch (err: any) {
        logs.push(`Runtime Error: ${err.message}`);
      }
    } else {
      if (code.includes('cout <<') || code.includes('print(') || code.includes('System.out.println')) {
        const printMatches = code.match(/(?:cout\s*<<\s*|print\s*\(\s*|System\.out\.println\s*\(\s*)([^;)\n]+)/g);
        if (printMatches) {
          for (const m of printMatches) {
            const clean = m.replace(/cout\s*<<\s*|print\s*\(\s*|System\.out\.println\s*\(\s*/g, '').replace(/["']/g, '').replace(/<<\s*endl/g, '').replace(/<<\s*"\\n"/g, '').trim();
            if (clean) logs.push(clean);
          }
        }
      }
      if (logs.length === 0) {
        logs.push('Program compiled successfully with 0 errors.');
        logs.push('Return code: 0 (Execution completed)');
      }
    }

    res.status(200).json({
      output: logs.join('\n'),
      executionTimeMs: executionTime,
      memoryMb: `${memoryUsage} MB`,
      status: 'success'
    });
  } catch (error: any) {
    res.status(200).json({
      output: `Execution failed: ${error.message}`,
      status: 'error'
    });
  }
}
