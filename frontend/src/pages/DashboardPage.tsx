import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  Flame,
  Trophy,
  Bot,
  Code2,
  Target,
  FileText,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatRelativeTime = (dateStr: string): string => {
    try {
      const now = new Date().getTime();
      const past = new Date(dateStr).getTime();
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'code':
        return <Code2 size={16} color="#2563eb" />;
      case 'chat':
        return <Bot size={16} color="#7c3aed" />;
      case 'interview':
        return <Target size={16} color="#d97706" />;
      case 'resume':
        return <FileText size={16} color="#059669" />;
      case 'learn':
        return <BookOpen size={16} color="#0284c7" />;
      default:
        return <Sparkles size={16} color="#2563eb" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'code':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'chat':
        return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'interview':
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'resume':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'learn':
        return { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' };
      default:
        return { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* SECTION A & B: Welcome & Streak */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            {summary?.greeting || 'Good day'}, {user?.name || 'Engineer'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            {summary?.welcomeMessage || 'Continue learning and building your skills.'}
          </p>
        </div>

        {/* Streak Information */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '12px 20px',
            borderRadius: '10px'
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '8px',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}
          >
            🔥
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{summary?.streak?.current || 1} Day Streak</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Trophy size={13} />
              <span>Longest: {summary?.streak?.longest || summary?.streak?.current || 1} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION D: Quick Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Quick Actions
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}
        >
          <div
            onClick={() => onNavigate('ai-assistant')}
            className="card"
            style={{
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Ask AI</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>General purpose assistance</div>
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-light)" />
          </div>

          <div
            onClick={() => onNavigate('code-lab')}
            className="card"
            style={{
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <Code2 size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Open Code Lab</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Analyze & optimize code</div>
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-light)" />
          </div>

          <div
            onClick={() => onNavigate('interview-prep')}
            className="card"
            style={{
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706' }}>
                <Target size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Practice Interview</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mock interviews & Q&A</div>
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-light)" />
          </div>

          <div
            onClick={() => onNavigate('resume')}
            className="card"
            style={{
              padding: '16px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669' }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Improve Resume</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Builder & ATS scorer</div>
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-light)" />
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID: Recent Work & Learning Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '20px' }}>
        {/* SECTION C: Recent Work */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Recent Work</h2>
            <button
              onClick={() => onNavigate('history')}
              style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View History <ArrowRight size={13} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading recent activity...
            </div>
          ) : !summary?.recentWork || summary.recentWork.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={28} color="var(--text-light)" />
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>No recent work recorded yet</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '320px' }}>
                Your code analyses, AI conversations, interview sessions, and resume reviews will show up here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary.recentWork.map((item: any) => {
                const badge = getActivityBadgeColor(item.activityType);
                return (
                  <div
                    key={item.id}
                    onClick={() => item.targetTab && onNavigate(item.targetTab)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '6px',
                          backgroundColor: badge.bg,
                          border: `1px solid ${badge.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {getActivityIcon(item.activityType)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: '13.5px',
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-light)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {formatRelativeTime(item.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION E: Learning Progress */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Learning Progress</h2>
            <button
              onClick={() => onNavigate('learn')}
              style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Explore Learn <ArrowRight size={13} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading learning progress...
            </div>
          ) : !summary?.learningProgress || summary.learningProgress.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <CheckCircle2 size={28} color="var(--text-light)" />
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>No topics completed yet</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.5 }}>
                Track your real learning milestones in DSA, C++, Java, and Web Development in the Learn section.
              </div>
              <button
                onClick={() => onNavigate('learn')}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 14px', marginTop: '4px' }}
              >
                Start Learning
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {summary.learningProgress.map((item: any) => (
                <div key={item.roadmapId} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.percentage}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-subtle)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        backgroundColor: 'var(--primary)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.completedTopics} of {item.totalTopics} milestones completed
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
