export interface User {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  xp: number;
  level: number;
  streak: number;
  xpInCurrentLevel?: number;
  xpRequiredForNextLevel?: number;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: 'beginner' | 'coder' | 'interview' | 'exam';
  code_snippet?: string;
  created_at: string;
}

export interface DebugResult {
  errorFound: boolean;
  location: string;
  problem: string;
  whyItHappens: string;
  howToFix: string;
  correctedCode: string;
}

export interface ErrorExplanation {
  meaning: string;
  whyItHappened: string;
  commonCauses: string[];
  howToFix: string;
  codeExample: string;
  preventionTips: string[];
}

export interface ComplexityResult {
  timeComplexity: string;
  spaceComplexity: string;
  timeReason: string;
  spaceReason: string;
  canBeOptimized: boolean;
  suggestedOptimization?: string;
  optimizedCodeSnippet?: string;
}

export interface CodeImprovement {
  readabilityScore: number;
  performanceScore: number;
  problemsIdentified: string[];
  improvedCode: string;
  whyBetter: string[];
}

export interface TestCase {
  testCaseNumber: number;
  type: 'Normal' | 'Edge' | 'Boundary' | 'Large Input' | 'Empty / Negative';
  input: string;
  expectedOutput: string;
  reason: string;
}

export interface DSAPerformance {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string;
  examples?: Array<{ input: string; output: string; explanation?: string }>;
  constraints?: string[];
  hints?: string[];
  approach?: string;
  solutions?: Record<string, string>;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface KeywordConcept {
  id: string;
  keyword: string;
  category: string;
  definition: string;
  simple_explanation: string;
  syntax: string;
  example_code: string;
  example_output: string;
  common_mistakes: string;
  interview_question: string;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  hours: number;
  description: string;
}

export interface Roadmap {
  id: string;
  title: string;
  category: string;
  description: string;
  topics: RoadmapTopic[];
}

export interface ResourceItem {
  id: string;
  name: string;
  category: string;
  type: 'YouTube Playlist' | 'Documentation' | 'Free Course' | 'Practice Site' | 'Interactive Book';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  description: string;
  link: string;
  whyRecommended: string;
}

export interface StudyPlanMonth {
  monthNumber: number;
  theme: string;
  weeks: Array<{
    weekNumber: number;
    topic: string;
    tasks: string[];
  }>;
}

export interface StudyPlan {
  id: string;
  goalTitle: string;
  durationMonths: number;
  weeklyCommitmentHours: number;
  months: StudyPlanMonth[];
  completedTasks: string[];
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    portfolio: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa: string;
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    coursework: string[];
  };
  projects: Array<{
    title: string;
    technologies: string;
    bulletPoints: string[];
  }>;
  experience: Array<{
    role: string;
    company: string;
    period: string;
    bulletPoints: string[];
  }>;
  achievements: string[];
}

export interface ATSAnalysis {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  actionableSuggestions: string[];
}

export interface InterviewQuestion {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  answer: string;
  explanation: string;
  followUp: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_bonus: number;
  unlocked: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  task_type: string;
  xp_reward: number;
  completed: boolean;
}

export interface DashboardStats {
  codingScore: string;
  dsaProgress: string;
  interviewReadiness: string;
  learningStreak: string;
  problemsSolved: number;
  codingSessionsCount: number;
  mockInterviewsCount: number;
}
