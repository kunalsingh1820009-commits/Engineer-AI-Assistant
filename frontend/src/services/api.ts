const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('engineer_ai_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('engineer_ai_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('engineer_ai_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred during network request';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (data: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Dashboard
  getDashboardSummary: () => request<any>('/progress/dashboard-summary'),

  // Chat (General Purpose Assistant)
  sendMessage: (message: string, mode: string = 'coder', codeSnippet?: string) =>
    request<any>('/chat', { method: 'POST', body: JSON.stringify({ message, mode, codeSnippet }) }),
  getChatHistory: () => request<any>('/chat/history'),
  clearChatHistory: () => request<any>('/chat/history', { method: 'DELETE' }),

  // Code Lab (Unified Code Analysis & Complexity)
  analyzeCode: (code: string, language: string, title?: string) =>
    request<any>('/code/analyze', { method: 'POST', body: JSON.stringify({ code, language, title }) }),
  analyzeComplexityAndImprovement: (code: string, language: string, title?: string) =>
    request<any>('/code/complexity-improvement', { method: 'POST', body: JSON.stringify({ code, language, title }) }),
  debugCode: (code: string, language: string, title?: string) =>
    request<any>('/code/debug', { method: 'POST', body: JSON.stringify({ code, language, title }) }),
  explainError: (errorMessage: string) =>
    request<any>('/code/explain-error', { method: 'POST', body: JSON.stringify({ errorMessage }) }),
  explainCode: (code: string, language: string) =>
    request<any>('/code/explain', { method: 'POST', body: JSON.stringify({ code, language }) }),
  improveCode: (code: string, language: string) =>
    request<any>('/code/improve', { method: 'POST', body: JSON.stringify({ code, language }) }),
  analyzeComplexity: (code: string, language: string, title?: string) =>
    request<any>('/code/complexity', { method: 'POST', body: JSON.stringify({ code, language, title }) }),
  generateTestCases: (code: string, language: string) =>
    request<any>('/code/testcases', { method: 'POST', body: JSON.stringify({ code, language }) }),
  runCode: (code: string, language: string, input?: string) =>
    request<any>('/code/run', { method: 'POST', body: JSON.stringify({ code, language, input }) }),

  // DSA
  getDSAProblems: (params?: { category?: string; difficulty?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/dsa/problems?${query}`);
  },
  getDSAProblemDetail: (id: string) => request<any>(`/dsa/problems/${id}`),
  submitDSAAttempt: (problemId: string, language: string, code: string, status: string) =>
    request<any>('/dsa/attempt', { method: 'POST', body: JSON.stringify({ problemId, language, code, status }) }),
  detectDSAPattern: (problemDescription: string) =>
    request<any>('/dsa/pattern-detect', { method: 'POST', body: JSON.stringify({ problemDescription }) }),

  // Keywords
  getKeywords: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/keywords?${query}`);
  },
  getKeywordDetail: (id: string) => request<any>(`/keywords/${id}`),

  // Roadmaps & Learn Topic Search
  getRoadmaps: () => request<any>('/roadmaps'),
  getRoadmapProgress: (roadmapId: string) => request<any>(`/roadmaps/${roadmapId}/progress`),
  updateRoadmapProgress: (roadmapId: string, topicId: string, status: string, topicTitle?: string) =>
    request<any>('/roadmaps/progress', { method: 'POST', body: JSON.stringify({ roadmapId, topicId, status, topicTitle }) }),
  searchLearnTopic: (query: string) =>
    request<any>('/roadmaps/search', { method: 'POST', body: JSON.stringify({ query }) }),

  // Resources
  getResources: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/resources?${query}`);
  },
  recommendResources: (topic: string) =>
    request<any>('/resources/recommend', { method: 'POST', body: JSON.stringify({ topic }) }),

  // Study Planner
  generateStudyPlan: (goalTitle: string, durationMonths: number, weeklyCommitmentHours: number) =>
    request<any>('/study-plan/generate', { method: 'POST', body: JSON.stringify({ goalTitle, durationMonths, weeklyCommitmentHours }) }),
  getStudyPlan: () => request<any>('/study-plan'),
  toggleStudyTask: (planId: string, taskText: string) =>
    request<any>('/study-plan/toggle-task', { method: 'POST', body: JSON.stringify({ planId, taskText }) }),

  // Resume (Builder + ATS Scorer)
  saveResume: (title: string, content: any) =>
    request<any>('/resume/save', { method: 'POST', body: JSON.stringify({ title, content }) }),
  getResume: () => request<any>('/resume'),
  enhanceBullet: (rawText: string) =>
    request<any>('/resume/enhance', { method: 'POST', body: JSON.stringify({ rawText }) }),
  analyzeATS: (resumeText: string, jobDescription?: string) =>
    request<any>('/resume/ats', { method: 'POST', body: JSON.stringify({ resumeText, jobDescription }) }),

  // Interview Prep (All 4 Modes)
  askInterviewQuestion: (question: string, topic?: string) =>
    request<any>('/interview/ask', { method: 'POST', body: JSON.stringify({ question, topic }) }),
  improveInterviewAnswer: (question: string, answer: string) =>
    request<any>('/interview/improve-answer', { method: 'POST', body: JSON.stringify({ question, answer }) }),
  getTopicQuestions: (topic: string, difficulty?: string) => {
    const query = new URLSearchParams({ topic, difficulty: difficulty || 'Medium' }).toString();
    return request<any>(`/interview/topic-questions?${query}`);
  },
  getInterviewQuestions: (params?: { category?: string; difficulty?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any>(`/interview/questions?${query}`);
  },
  startMockInterview: (roleType: string) =>
    request<any>('/interview/start', { method: 'POST', body: JSON.stringify({ roleType }) }),
  answerMockInterview: (sessionId: string, answer: string) =>
    request<any>('/interview/answer', { method: 'POST', body: JSON.stringify({ sessionId, answer }) }),

  // Progress & Gamification
  getDashboardProgress: () => request<any>('/progress/dashboard'),
  getGamification: () => request<any>('/progress/gamification'),
  claimChallenge: (challengeId: string) =>
    request<any>('/progress/claim-challenge', { method: 'POST', body: JSON.stringify({ challengeId }) }),

  // History
  getUserHistory: () => request<any>('/history')
};
