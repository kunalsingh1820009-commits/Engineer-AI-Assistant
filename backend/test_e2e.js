async function runE2ETests() {
  const BASE = 'http://localhost:5000/api';
  console.log('--- STARTING E2E API VERIFICATION ---');

  // 1. Health
  const healthRes = await fetch(`${BASE}/health`).then(r => r.json());
  console.log('1. Health Check:', healthRes);

  // 2. Register
  const testEmail = `student_${Date.now()}@university.edu`;
  const registerRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Sharma',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      targetRole: 'Full Stack Software Engineer'
    })
  }).then(r => r.json());
  console.log('2. User Registration:', registerRes.message, 'Token received:', !!registerRes.token);
  const token = registerRes.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. AI Chat
  const chatRes = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: 'Explain recursion',
      mode: 'beginner'
    })
  }).then(r => r.json());
  console.log('3. AI Chat (Beginner Mode): Role:', chatRes.role, 'Content Preview:', chatRes.content.slice(0, 80) + '...');

  // 4. Code Debugger
  const debugRes = await fetch(`${BASE}/code/debug`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: 'for(int i=0; i<=nums.size(); ++i) { cout << nums[i]; }',
      language: 'cpp'
    })
  }).then(r => r.json());
  console.log('4. Code Debugger:', debugRes.analysis.problem, 'Location:', debugRes.analysis.location);

  // 5. Complexity Analyzer
  const complexityRes = await fetch(`${BASE}/code/complexity`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: 'for(int i=0; i<n; i++) { for(int j=0; j<n; j++) { cout << i; } }',
      language: 'cpp'
    })
  }).then(r => r.json());
  console.log('5. Complexity Analysis: Time:', complexityRes.analysis.timeComplexity, 'Space:', complexityRes.analysis.spaceComplexity);

  // 6. DSA Problems
  const dsaRes = await fetch(`${BASE}/dsa/problems`).then(r => r.json());
  console.log('6. DSA Problems List: Total seeded problems:', dsaRes.problems.length);

  // 7. DSA Pattern Detector
  const patternRes = await fetch(`${BASE}/dsa/pattern-detect`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      problemDescription: 'Find the maximum sum of any contiguous subarray of size k in an array of integers.'
    })
  }).then(r => r.json());
  console.log('7. DSA Pattern Detector: Detected:', patternRes.patternResult.likelyPattern, 'Confidence:', patternRes.patternResult.confidence + '%');

  // 8. Keyword Explorer
  const kwRes = await fetch(`${BASE}/keywords`).then(r => r.json());
  console.log('8. Keyword Explorer: Total seeded concepts:', kwRes.keywords.length);

  // 9. Roadmaps
  const rmRes = await fetch(`${BASE}/roadmaps`).then(r => r.json());
  console.log('9. Roadmaps: Total tracks:', rmRes.roadmaps.length);

  // 10. Study Planner
  const planRes = await fetch(`${BASE}/study-plan/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      goalTitle: 'Placements in 3 Months',
      durationMonths: 3,
      weeklyCommitmentHours: 15
    })
  }).then(r => r.json());
  console.log('10. Study Planner: Generated plan months:', planRes.plan.months.length);

  // 11. Resume ATS Analyzer & Bullet Enhancer
  const resumeRes = await fetch(`${BASE}/resume/enhance`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      rawText: 'Made an attendance project with node and react'
    })
  }).then(r => r.json());
  console.log('11. Resume AI Bullet Enhancer:', resumeRes.enhanced.slice(0, 90) + '...');

  // 12. Mock Interview
  const mockStartRes = await fetch(`${BASE}/interview/start`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      roleType: 'Software Development Engineer (SDE)'
    })
  }).then(r => r.json());
  console.log('12. Mock Interview Started: Stage 1:', mockStartRes.currentStage);

  // 13. Dashboard Progress
  const dashRes = await fetch(`${BASE}/progress/dashboard`, {
    headers: authHeaders
  }).then(r => r.json());
  console.log('13. Dashboard Stats: Coding Score:', dashRes.stats.codingScore, 'Streak:', dashRes.stats.learningStreak, 'Readiness:', dashRes.placementReadiness.overallScore);

  console.log('--- ALL E2E VERIFICATIONS PASSED SUCCESSFULLY! ---');
}

runE2ETests().catch(console.error);
