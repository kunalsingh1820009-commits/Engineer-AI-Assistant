import { Request, Response } from 'express';
import db from '../database/db.js';

export async function getKeywords(req: Request, res: Response): Promise<void> {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM keywords WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (keyword LIKE ? OR definition LIKE ? OR simple_explanation LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY keyword ASC';
    const keywords = db.prepare(query).all(...params);
    res.status(200).json({ keywords });
  } catch (error) {
    console.error('Get keywords error:', error);
    res.status(500).json({ error: 'Failed to fetch keywords.' });
  }
}

export async function getKeywordDetail(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const keyword = db.prepare('SELECT * FROM keywords WHERE id = ? OR keyword = ?').get(id, id);
    if (!keyword) {
      res.status(404).json({ error: 'Keyword concept not found.' });
      return;
    }
    res.status(200).json({ keyword });
  } catch (error) {
    console.error('Get keyword detail error:', error);
    res.status(500).json({ error: 'Failed to retrieve keyword details.' });
  }
}
