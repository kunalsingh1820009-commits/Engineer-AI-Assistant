import { Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import aiService from '../services/aiService.js';
import { recordUserActivity } from '../services/activityService.js';

export async function sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { message, mode = 'coder', codeSnippet } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    // Retrieve previous conversation context for this user (up to 12 recent messages in chronological order)
    const rawHistory = db.prepare(`
      SELECT role, content
      FROM chats
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 12
    `).all(userId) as Array<{ role: 'user' | 'assistant'; content: string }>;

    const historyMessages = rawHistory.reverse().map((h) => ({
      role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: h.content
    }));

    const userMessageContent = codeSnippet ? `${message.trim()}\n\n\`\`\`\n${codeSnippet}\n\`\`\`` : message.trim();

    // Save user message to database
    const userMsgId = randomUUID();
    db.prepare(`
      INSERT INTO chats (id, user_id, mode, role, content, code_snippet)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userMsgId, userId, mode, 'user', userMessageContent, codeSnippet || null);

    // Record user activity for Streak & Recent Work
    recordUserActivity(
      userId,
      'chat',
      message.trim().slice(0, 100),
      'AI Assistant conversation',
      'ai-assistant'
    );

    // Formulate General-Purpose Conversational AI System Instruction
    const systemInstruction = `You are a helpful, conversational, and versatile AI assistant.
Answer any reasonable question naturally, directly, and accurately — covering engineering, programming, science, general knowledge, writing, daily life, recipes, and more.
Understand conversation context and follow-up queries seamlessly.
Decide formatting naturally:
- If asked a simple question (e.g., "What is 2 + 2?"), reply with a direct, simple answer ("4").
- Use paragraphs when appropriate, bullet points or numbered lists when listing items, and code blocks only when code is relevant.
- Do NOT force rigid repetitive sections like "Definition", "Explanation", "Example", "Advantages", "Summary" unless specifically asked.
- Avoid unnecessary markdown heading symbols (# or ##) for short or straightforward responses.
- Always provide helpful, friendly, and practical answers.`;

    const messages = [
      { role: 'system' as const, content: systemInstruction },
      ...historyMessages,
      { role: 'user' as const, content: userMessageContent }
    ];

    const aiResponseText = await aiService.generateChat(messages);

    // Save AI response to database
    const aiMsgId = randomUUID();
    db.prepare(`
      INSERT INTO chats (id, user_id, mode, role, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(aiMsgId, userId, mode, 'assistant', aiResponseText);

    // Award user 10 XP for active chat learning
    db.prepare('UPDATE users SET xp = xp + 10 WHERE id = ?').run(userId);

    res.status(200).json({
      id: aiMsgId,
      role: 'assistant',
      content: aiResponseText,
      mode,
      created_at: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat message.' });
  }
}

export async function getChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const messages = db.prepare(`
      SELECT id, role, content, mode, code_snippet, created_at
      FROM chats
      WHERE user_id = ?
      ORDER BY created_at ASC
      LIMIT 100
    `).all(userId);

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history.' });
  }
}

export async function clearChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    db.prepare('DELETE FROM chats WHERE user_id = ?').run(userId);
    res.status(200).json({ message: 'Chat history cleared successfully.' });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ error: 'Failed to clear chat history.' });
  }
}
