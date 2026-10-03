import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import {
  UserCheck,
  Bot,
  User,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export const MockInterviewPage: React.FC = () => {
  const { showToast } = useToast();
  const [roleType, setRoleType] = useState('Software Development Engineer (SDE)');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputAnswer, setInputAnswer] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(5);
  const [currentStage, setCurrentStage] = useState('Introduction');
  const [completed, setCompleted] = useState(false);
  const [finalReport, setFinalReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await api.startMockInterview(roleType);
      setSessionId(res.sessionId);
      setCurrentStep(res.currentStep);
      setTotalSteps(res.totalSteps);
      setCurrentStage(res.currentStage);
      setMessages([{ role: 'interviewer', content: res.interviewerMessage }]);
      setCompleted(false);
      setFinalReport(null);
      showToast('Mock Interview Started! Good luck!', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to start mock interview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !inputAnswer.trim() || loading) return;

    const candidateMsg = { role: 'candidate', content: inputAnswer.trim() };
    setMessages((prev) => [...prev, candidateMsg]);
    const answerText = inputAnswer.trim();
    setInputAnswer('');
    setLoading(true);

    try {
      const res = await api.answerMockInterview(sessionId, answerText);
      setCurrentStep(res.currentStep);
      setCurrentStage(res.currentStage || 'Completed');

      setMessages((prev) => [...prev, { role: 'interviewer', content: res.interviewerMessage }]);

      if (res.completed) {
        setCompleted(true);
        setFinalReport({
          scores: res.scores,
          feedback: res.feedback
        });
        showToast('Mock Interview finished! Report generated. +100 XP', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit answer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Configuration Header */}
      {!sessionId ? (
        <div className="card" style={{ padding: '36px', maxWidth: 640, margin: '20px auto', textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <UserCheck size={32} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            AI Interactive Mock Interview Coach
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
            Experience a realistic multi-stage technical interview covering Introduction, CS Fundamentals, DSA Problem Solving, Architecture Deep Dive, and HR behavioral questions.
          </p>

          <div style={{ textAlign: 'left', marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Target Job Role Track:
            </label>
            <select
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              style={{ width: '100%', padding: '12px' }}
            >
              <option value="Software Development Engineer (SDE)">Software Development Engineer (SDE)</option>
              <option value="Full Stack Web Engineer">Full Stack Web Engineer</option>
              <option value="Backend Systems & C++ Engineer">Backend Systems & C++ Engineer</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
            </select>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 15, borderRadius: '10px' }}
          >
            <Sparkles size={18} /> {loading ? 'Initializing Interviewer...' : 'Start Mock Interview Now'}
          </button>
        </div>
      ) : (
        /* Active Interview Chat & Progress */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progress Tracker */}
          <div
            className="card"
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div>
              <span className="badge badge-purple" style={{ marginBottom: 4 }}>
                STAGE {currentStep} OF {totalSteps}: {currentStage}
              </span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                Role: {roleType}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleStartInterview}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                <RefreshCw size={14} /> Restart Interview
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            className="card"
            style={{
              maxHeight: '480px',
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18
            }}
          >
            {messages.map((m, idx) => {
              const isInterviewer = m.role === 'interviewer';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignSelf: isInterviewer ? 'flex-start' : 'flex-end',
                    maxWidth: isInterviewer ? '85%' : '80%'
                  }}
                >
                  {isInterviewer && (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Bot size={20} />
                    </div>
                  )}

                  <div
                    style={{
                      backgroundColor: isInterviewer ? 'var(--bg-subtle)' : 'var(--primary)',
                      color: isInterviewer ? 'var(--text-main)' : '#ffffff',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      borderTopLeftRadius: isInterviewer ? '4px' : '16px',
                      borderTopRightRadius: !isInterviewer ? '4px' : '16px',
                      fontSize: 14,
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      border: isInterviewer ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    {m.content}
                  </div>

                  {!isInterviewer && (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        backgroundColor: '#334155',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <User size={18} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Evaluation Report Card if Completed */}
          {completed && finalReport && (
            <div className="card fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={24} color="#7c3aed" />
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Comprehensive Interview Evaluation</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>TECHNICAL KNOWLEDGE</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                    {finalReport.scores.technicalKnowledge}/100
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>PROBLEM SOLVING</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                    {finalReport.scores.problemSolving}/100
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>COMMUNICATION</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
                    {finalReport.scores.communication}/100
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-subtle)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>CLARITY</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                    {finalReport.scores.clarity}/100
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Answer Input */}
          {!completed && (
            <form onSubmit={handleSendAnswer} style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="Type your response to the interviewer..."
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                disabled={loading}
                style={{ flex: 1, padding: '14px 18px', fontSize: 14 }}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !inputAnswer.trim()}
                style={{ padding: '0 24px', backgroundColor: '#7c3aed' }}
              >
                <Send size={16} /> {loading ? 'Submitting...' : 'Send Answer'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
