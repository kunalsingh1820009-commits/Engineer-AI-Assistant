import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { MarkdownView } from '../components/MarkdownView.js';
import {
  Target,
  MessageSquare,
  Sparkles,
  UserCheck,
  Send,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const InterviewPrepPage: React.FC = () => {
  const { showToast } = useToast();
  // 4 Modes: ask (A), mock (B), topic (C), improve (D)
  const [activeMode, setActiveMode] = useState<'ask' | 'mock' | 'topic' | 'improve'>('ask');

  // MODE A: Ask Interview Question
  const [askQuery, setAskQuery] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askResult, setAskResult] = useState<any | null>(null);

  // MODE B: Interactive Mock Interview
  const [roleType, setRoleType] = useState('Software Development Engineer (SDE)');
  const [mockSessionId, setMockSessionId] = useState<string | null>(null);
  const [mockStep, setMockStep] = useState(1);
  const [mockTotalSteps, setMockTotalSteps] = useState(5);
  const [mockMessages, setMockMessages] = useState<Array<{ role: 'interviewer' | 'candidate'; content: string }>>([]);
  const [candidateInput, setCandidateInput] = useState('');
  const [mockLoading, setMockLoading] = useState(false);
  const [mockCompleted, setMockCompleted] = useState(false);

  // MODE C: Topic Practice
  const [selectedTopic, setSelectedTopic] = useState('DSA');
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicQuestions, setTopicQuestions] = useState<any[]>([]);
  const [expandedTopicQId, setExpandedTopicQId] = useState<string | null>(null);

  const topicsList = ['Java', 'C++', 'DSA', 'DBMS', 'OS', 'Computer Networks', 'OOP', 'AI/ML', 'HR'];

  // MODE D: Answer Improvement
  const [improveQuestion, setImproveQuestion] = useState('');
  const [improveAnswer, setImproveAnswer] = useState('');
  const [improveLoading, setImproveLoading] = useState(false);
  const [improveReview, setImproveReview] = useState<any | null>(null);

  // Mode A handler
  const handleAskQuestion = async (customQ?: string) => {
    const q = customQ || askQuery;
    if (!q.trim()) {
      showToast('Please type your interview question.', 'warning');
      return;
    }
    setAskLoading(true);
    try {
      const res = await api.askInterviewQuestion(q.trim());
      setAskResult(res.result);
      if (!customQ) setAskQuery('');
    } catch (err: any) {
      showToast(err.message || 'Failed to process question', 'error');
    } finally {
      setAskLoading(false);
    }
  };

  // Mode B handlers
  const handleStartMock = async () => {
    setMockLoading(true);
    try {
      const res = await api.startMockInterview(roleType);
      setMockSessionId(res.sessionId);
      setMockStep(res.currentStep);
      setMockTotalSteps(res.totalSteps);
      setMockMessages([{ role: 'interviewer', content: res.interviewerMessage }]);
      setMockCompleted(false);
      showToast('Mock Interview started! Good luck.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to start mock interview', 'error');
    } finally {
      setMockLoading(false);
    }
  };

  const handleSendMockAnswer = async () => {
    if (!mockSessionId || !candidateInput.trim() || mockLoading) return;
    const answerText = candidateInput.trim();
    setCandidateInput('');
    setMockMessages((prev) => [...prev, { role: 'candidate', content: answerText }]);
    setMockLoading(true);

    try {
      const res = await api.answerMockInterview(mockSessionId, answerText);
      setMockMessages((prev) => [...prev, { role: 'interviewer', content: res.interviewerMessage }]);
      setMockStep(res.currentStep);
      if (res.completed) {
        setMockCompleted(true);
        showToast('Mock Interview completed! Review evaluation report.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit answer', 'error');
    } finally {
      setMockLoading(false);
    }
  };

  // Mode C handler
  const handleLoadTopicQuestions = async (topic: string) => {
    setSelectedTopic(topic);
    setTopicLoading(true);
    try {
      const res = await api.getTopicQuestions(topic, 'Medium');
      setTopicQuestions(res.questions || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate topic questions', 'error');
    } finally {
      setTopicLoading(false);
    }
  };

  // Mode D handler
  const handleReviewAnswer = async () => {
    if (!improveQuestion.trim() || !improveAnswer.trim()) {
      showToast('Please provide both the question and your drafted answer.', 'warning');
      return;
    }
    setImproveLoading(true);
    try {
      const res = await api.improveInterviewAnswer(improveQuestion.trim(), improveAnswer.trim());
      setImproveReview(res.review);
      showToast('Answer feedback generated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Review failed', 'error');
    } finally {
      setImproveLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706' }}>
            <Target size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Interview Preparation Assistant
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              AI coaching for technical interviews, mock simulations, topic drills, and answer improvements
            </p>
          </div>
        </div>

        {/* 4 Mode Selectors */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveMode('ask')}
            className={activeMode === 'ask' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '13px', padding: '7px 14px' }}
          >
            <MessageSquare size={14} /> Ask Interview Question
          </button>
          <button
            onClick={() => setActiveMode('mock')}
            className={activeMode === 'mock' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '13px', padding: '7px 14px' }}
          >
            <UserCheck size={14} /> Mock Interview
          </button>
          <button
            onClick={() => {
              setActiveMode('topic');
              if (topicQuestions.length === 0) handleLoadTopicQuestions(selectedTopic);
            }}
            className={activeMode === 'topic' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '13px', padding: '7px 14px' }}
          >
            <BookOpen size={14} /> Topic Practice
          </button>
          <button
            onClick={() => setActiveMode('improve')}
            className={activeMode === 'improve' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '13px', padding: '7px 14px' }}
          >
            <Sparkles size={14} /> Answer Improvement
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE A: ASK INTERVIEW QUESTION */}
      {/* ======================================================== */}
      {activeMode === 'ask' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Ask Any Interview-Related Question
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Ask conceptual questions, behavioral phrasing, or algorithmic explanations.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                placeholder="e.g. 'What is polymorphism?', 'How do I answer tell me about yourself?', 'Explain DBMS normalization'"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={askLoading}
                className="btn-primary"
                style={{ padding: '9px 18px', fontSize: '13px' }}
              >
                <Send size={15} /> {askLoading ? 'Consulting AI...' : 'Ask AI'}
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Try:</span>
              {[
                'What is polymorphism in OOP?',
                'How should I answer "Tell me about yourself"?',
                'Explain binary search for an interview.',
                'What are ACID properties in DBMS?'
              ].map((sample, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setAskQuery(sample);
                    handleAskQuestion(sample);
                  }}
                  style={{
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-subtle)',
                    color: '#334155',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Mode A Results */}
          {askResult && (
            <div className="card fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#047857', marginBottom: '6px' }}>
                  Model Answer (What to say):
                </h3>
                <div style={{ padding: '14px 16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '14px', color: '#065f46', lineHeight: 1.6 }}>
                  {askResult.answer}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Architectural Breakdown & In-Depth Explanation:
                </h3>
                <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '13.5px', color: '#1e293b', lineHeight: 1.6 }}>
                  {askResult.explanation}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '4px' }}>
                    What Interviewers Evaluate:
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.5 }}>
                    {askResult.evaluatorCriteria}
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Common Traps / Red Flags:
                  </div>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12.5px', color: '#7f1d1d', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {askResult.commonTraps?.map((t: string, idx: number) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {askResult.followUpQuestions?.length > 0 && (
                <div style={{ padding: '14px 16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Recruiter Follow-up Questions:
                  </div>
                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#92400e', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {askResult.followUpQuestions.map((fq: string, idx: number) => (
                      <li key={idx}>{fq}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE B: MOCK INTERVIEW */}
      {/* ======================================================== */}
      {activeMode === 'mock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!mockSessionId ? (
            <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={24} color="#d97706" />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Interactive AI Mock Technical Interview
                </h2>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '480px' }}>
                  Simulate a 5-step engineering round. The AI asks questions, evaluates your answers progressively, and provides a final scoring report.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Target Position:</label>
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                  style={{ width: '260px', padding: '8px 12px', fontSize: '13.5px' }}
                >
                  <option value="Software Development Engineer (SDE)">Software Development Engineer (SDE)</option>
                  <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
                  <option value="Backend Software Engineer">Backend Software Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Systems & C++ Engineer">Systems & C++ Engineer</option>
                </select>
              </div>

              <button
                onClick={handleStartMock}
                disabled={mockLoading}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '14px', marginTop: '6px' }}
              >
                {mockLoading ? 'Starting Session...' : 'Start Mock Interview Round'}
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Progress Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>MOCK INTERVIEW ROUND</span>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{roleType}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                    Stage {mockStep} of {mockTotalSteps}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset this interview session?')) setMockSessionId(null);
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    <RotateCcw size={13} /> Reset
                  </button>
                </div>
              </div>

              {/* Chat-style Interview Transcript */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
                {mockMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'candidate' ? 'flex-end' : 'flex-start',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {msg.role === 'candidate' ? 'You' : 'AI Interviewer'}
                    </span>
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        maxWidth: '85%',
                        fontSize: '13.5px',
                        lineHeight: 1.6,
                        backgroundColor: msg.role === 'candidate' ? '#2563eb' : '#f8fafc',
                        color: msg.role === 'candidate' ? '#ffffff' : '#0f172a',
                        border: msg.role === 'candidate' ? 'none' : '1px solid var(--border-color)'
                      }}
                    >
                      <MarkdownView content={msg.content} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Input for next response */}
              {!mockCompleted ? (
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <textarea
                    value={candidateInput}
                    onChange={(e) => setCandidateInput(e.target.value)}
                    placeholder="Type your response to the interviewer..."
                    rows={3}
                    style={{ flex: 1, resize: 'vertical' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSendMockAnswer();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMockAnswer}
                    disabled={mockLoading || !candidateInput.trim()}
                    className="btn-primary"
                    style={{ padding: '0 20px', alignSelf: 'flex-end', height: '42px', fontSize: '13px' }}
                  >
                    <Send size={15} /> {mockLoading ? 'Evaluating...' : 'Submit'}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#065f46', fontSize: '14px' }}>
                    🎉 Mock interview round completed!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE C: TOPIC PRACTICE */}
      {/* ======================================================== */}
      {activeMode === 'topic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Select a Topic for Dynamic AI Questions
            </h2>
            {/* Topic Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {topicsList.map((t) => (
                <button
                  key={t}
                  onClick={() => handleLoadTopicQuestions(t)}
                  className={selectedTopic === t ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Questions List */}
          {topicLoading ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              Generating high-yield {selectedTopic} interview questions with AI...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topicQuestions.map((q) => {
                const isExpanded = expandedTopicQId === q.id;
                return (
                  <div
                    key={q.id}
                    className="card"
                    style={{ padding: '18px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onClick={() => setExpandedTopicQId(isExpanded ? null : q.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                          <span className="badge badge-primary">{q.category}</span>
                          <span className="badge badge-warning">{q.difficulty}</span>
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {q.question}
                        </h3>
                      </div>
                      <button style={{ color: 'var(--text-light)', padding: 4 }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div
                        className="fade-in"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          marginTop: '14px',
                          paddingTop: '14px',
                          borderTop: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '14px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>
                            Model Answer:
                          </div>
                          <p style={{ fontSize: '13.5px', color: '#047857', lineHeight: 1.6, margin: 0 }}>{q.answer}</p>
                        </div>

                        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                            Architectural Reasoning:
                          </div>
                          <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>{q.explanation}</p>
                        </div>

                        {q.followUp && (
                          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '12px 14px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', marginBottom: '2px' }}>
                              Follow-up Question:
                            </div>
                            <div style={{ fontSize: '13px', color: '#92400e' }}>{q.followUp}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE D: ANSWER IMPROVEMENT */}
      {/* ======================================================== */}
      {activeMode === 'improve' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Submit an Answer for AI Coaching & Rewrite
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Paste an interview question and your drafted answer to receive strengths, areas for growth, communication tips, and a refined rewrite.
            </p>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Interview Question:
              </label>
              <input
                type="text"
                value={improveQuestion}
                onChange={(e) => setImproveQuestion(e.target.value)}
                placeholder="e.g. 'Why should we hire you?', 'Explain the difference between a process and a thread.'"
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Your Drafted Answer:
              </label>
              <textarea
                value={improveAnswer}
                onChange={(e) => setImproveAnswer(e.target.value)}
                rows={4}
                placeholder="Write or paste your answer here..."
              />
            </div>

            <button
              onClick={handleReviewAnswer}
              disabled={improveLoading}
              className="btn-primary"
              style={{ padding: '9px 18px', width: 'fit-content', fontSize: '13px' }}
            >
              <Sparkles size={15} /> {improveLoading ? 'Evaluating Answer...' : 'Evaluate & Improve Answer'}
            </button>
          </div>

          {/* Mode D Results */}
          {improveReview && (
            <div className="card fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>CANDIDATE RATING</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: improveReview.score >= 80 ? '#16a34a' : '#d97706' }}>
                    {improveReview.rating} ({improveReview.score} / 100)
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '14px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', marginBottom: '6px' }}>
                    What Was Good:
                  </div>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '13px', color: '#047857', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {improveReview.whatWasGood?.map((g: string, i: number) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '6px' }}>
                    What Can Improve:
                  </div>
                  <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '13px', color: '#92400e', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {improveReview.whatCanImprove?.map((imp: string, i: number) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '6px' }}>
                  Recommended High-Scoring Answer:
                </h3>
                <div style={{ padding: '14px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '14px', color: '#1e3a8a', lineHeight: 1.6 }}>
                  {improveReview.betterAnswer}
                </div>
              </div>

              {improveReview.communicationTips?.length > 0 && (
                <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Communication & Delivery Tips:
                  </div>
                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {improveReview.communicationTips.map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
