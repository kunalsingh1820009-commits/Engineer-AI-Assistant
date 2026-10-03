import { Request, Response } from 'express';

interface ResourceItem {
  id: string;
  name: string;
  category: string;
  type: 'YouTube Playlist' | 'Documentation' | 'Free Course' | 'Practice Site' | 'Interactive Book';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  description: string;
  link: string;
  whyRecommended: string;
}

const verifiedResources: ResourceItem[] = [
  {
    id: 'res-1',
    name: 'freeCodeCamp.org - Full Stack & Algorithms',
    category: 'Full Stack & Web',
    type: 'Free Course',
    level: 'All Levels',
    description: 'Comprehensive, interactive curriculum covering HTML, CSS, JavaScript, React, Backend APIs, and DSA with hands-on certifications.',
    link: 'https://www.freecodecamp.org/learn',
    whyRecommended: '100% free, interactive browser-based coding environments, and globally recognized curriculum.'
  },
  {
    id: 'res-2',
    name: 'React Official Documentation (react.dev)',
    category: 'React',
    type: 'Documentation',
    level: 'All Levels',
    description: 'The definitive modern React handbook featuring interactive sandboxes, hooks, state architecture, and suspense.',
    link: 'https://react.dev/learn',
    whyRecommended: 'Created by the core React team with rich visual diagrams and modern best practices.'
  },
  {
    id: 'res-3',
    name: 'NeetCode.io - DSA Practice & Video Explanations',
    category: 'DSA & Algorithms',
    type: 'Practice Site',
    level: 'All Levels',
    description: 'Curated 150/75 DSA problem lists organized cleanly by pattern (Sliding Window, Two Pointers, Trees, DP) with video walk-throughs.',
    link: 'https://neetcode.io/practice',
    whyRecommended: 'Categorizes problems by core patterns rather than random grinding.'
  },
  {
    id: 'res-4',
    name: 'The Cherno - C++ Masterclass Series',
    category: 'C++',
    type: 'YouTube Playlist',
    level: 'All Levels',
    description: 'Industry-standard C++ video series diving deep into memory layout, pointers, stack vs heap, move semantics, and game engine architecture.',
    link: 'https://www.youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4G4b',
    whyRecommended: 'Explains under-the-hood assembly and hardware memory management clearly.'
  },
  {
    id: 'res-5',
    name: 'CS50x: Introduction to Computer Science (Harvard)',
    category: 'CS Fundamentals',
    type: 'Free Course',
    level: 'Beginner',
    description: 'Harvard University\'s renowned introduction to the intellectual enterprises of computer science and the art of programming (C, Python, SQL, Web).',
    link: 'https://cs50.harvard.edu/x/',
    whyRecommended: 'World-class pedagogical clarity and profound foundation in fundamental computer science.'
  },
  {
    id: 'res-6',
    name: 'MDN Web Docs (Mozilla)',
    category: 'JavaScript & Web',
    type: 'Documentation',
    level: 'All Levels',
    description: 'The golden standard reference for JavaScript (ES6+), Web APIs, CSS Grid/Flexbox, and DOM manipulation.',
    link: 'https://developer.mozilla.org/',
    whyRecommended: 'Maintained by major browser vendors; reliable, precise, and standard-compliant.'
  },
  {
    id: 'res-7',
    name: 'Roadmap.sh - Developer Roadmaps',
    category: 'Career & Architecture',
    type: 'Interactive Book',
    level: 'All Levels',
    description: 'Community-driven visual roadmaps, study guides, and skill trees for Frontend, Backend, DevOps, and Computer Science.',
    link: 'https://roadmap.sh',
    whyRecommended: 'High-level visual bird-eye view of tech stacks and industry expectations.'
  }
];

export async function getResources(req: Request, res: Response): Promise<void> {
  try {
    const { category, search } = req.query;
    let filtered = verifiedResources;

    if (category && category !== 'All') {
      filtered = filtered.filter(r => r.category.toLowerCase().includes(String(category).toLowerCase()) || r.name.toLowerCase().includes(String(category).toLowerCase()));
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }

    res.status(200).json({ resources: filtered });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to retrieve learning resources.' });
  }
}

export async function recommendResources(req: Request, res: Response): Promise<void> {
  try {
    const { topic } = req.body;
    if (!topic) {
      res.status(400).json({ error: 'Topic query is required.' });
      return;
    }

    const t = String(topic).toLowerCase();
    let matches = verifiedResources.filter(r => r.category.toLowerCase().includes(t) || r.name.toLowerCase().includes(t) || r.description.toLowerCase().includes(t));

    if (matches.length === 0) {
      matches = verifiedResources.slice(0, 4);
    }

    res.status(200).json({
      topic,
      recommendations: matches
    });
  } catch (error) {
    console.error('Recommend resources error:', error);
    res.status(500).json({ error: 'Failed to recommend resources.' });
  }
}
