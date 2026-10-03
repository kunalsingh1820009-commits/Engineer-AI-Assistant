import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as chatController from '../controllers/chatController.js';
import * as codeController from '../controllers/codeController.js';
import * as dsaController from '../controllers/dsaController.js';
import * as keywordController from '../controllers/keywordController.js';
import * as roadmapController from '../controllers/roadmapController.js';
import * as resourceController from '../controllers/resourceController.js';
import * as studyPlanController from '../controllers/studyPlanController.js';
import * as resumeController from '../controllers/resumeController.js';
import * as interviewController from '../controllers/interviewController.js';
import * as progressController from '../controllers/progressController.js';
import * as historyController from '../controllers/historyController.js';

export const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);
router.put('/auth/profile', authMiddleware, authController.updateProfile);

// AI Chatbot Assistant (General Purpose + Context History)
router.post('/chat', authMiddleware, chatController.sendMessage);
router.get('/chat/history', authMiddleware, chatController.getChatHistory);
router.delete('/chat/history', authMiddleware, chatController.clearChatHistory);

// Code Lab Suite
router.post('/code/analyze', authMiddleware, codeController.analyzeCode);
router.post('/code/complexity-improvement', authMiddleware, codeController.analyzeComplexityAndImprovement);
router.post('/code/debug', authMiddleware, codeController.debugCode);
router.post('/code/explain-error', authMiddleware, codeController.explainError);
router.post('/code/explain', authMiddleware, codeController.explainCode);
router.post('/code/improve', authMiddleware, codeController.improveCode);
router.post('/code/complexity', authMiddleware, codeController.analyzeComplexity);
router.post('/code/testcases', optionalAuthMiddleware, codeController.generateTestCases);
router.post('/code/run', authMiddleware, codeController.runCodeSimulation);

// DSA Practice & Patterns
router.get('/dsa/problems', dsaController.getProblems);
router.get('/dsa/problems/:id', dsaController.getProblemDetail);
router.post('/dsa/attempt', authMiddleware, dsaController.submitProblemAttempt);
router.post('/dsa/pattern-detect', authMiddleware, dsaController.detectPattern);

// Keyword Explorer
router.get('/keywords', keywordController.getKeywords);
router.get('/keywords/:id', keywordController.getKeywordDetail);

// Learning Roadmaps & Topic Search
router.get('/roadmaps', roadmapController.getRoadmaps);
router.get('/roadmaps/:roadmapId/progress', authMiddleware, roadmapController.getUserRoadmapProgress);
router.post('/roadmaps/progress', authMiddleware, roadmapController.updateTopicStatus);
router.post('/roadmaps/search', authMiddleware, roadmapController.searchTopic);

// Learning Resources
router.get('/resources', resourceController.getResources);
router.post('/resources/recommend', resourceController.recommendResources);

// AI Study Planner
router.post('/study-plan/generate', authMiddleware, studyPlanController.generateStudyPlan);
router.get('/study-plan', authMiddleware, studyPlanController.getUserStudyPlan);
router.post('/study-plan/toggle-task', authMiddleware, studyPlanController.toggleTaskCompletion);

// Resume Builder & ATS Scorer
router.post('/resume/save', authMiddleware, resumeController.saveResume);
router.get('/resume', authMiddleware, resumeController.getResume);
router.post('/resume/enhance', authMiddleware, resumeController.enhanceBullet);
router.post('/resume/ats', authMiddleware, resumeController.analyzeATS);

// Interview Preparation & Mock Interviews (All 4 Modes)
router.post('/interview/ask', authMiddleware, interviewController.askQuestion);
router.post('/interview/improve-answer', authMiddleware, interviewController.improveAnswer);
router.get('/interview/topic-questions', interviewController.getTopicQuestions);
router.get('/interview/questions', interviewController.getInterviewQuestions);
router.post('/interview/start', authMiddleware, interviewController.startMockInterview);
router.post('/interview/answer', authMiddleware, interviewController.answerMockInterview);

// Progress, Gamification & Dashboard Summary
router.get('/progress/dashboard-summary', authMiddleware, progressController.getDashboardSummary);
router.get('/progress/dashboard', authMiddleware, progressController.getDashboardProgress);
router.get('/progress/gamification', authMiddleware, progressController.getGamificationData);
router.post('/progress/claim-challenge', authMiddleware, progressController.claimDailyChallenge);

// Unified History
router.get('/history', authMiddleware, historyController.getUserHistory);

export default router;
