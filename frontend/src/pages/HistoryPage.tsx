import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import {
  History,
  Code2,
  UserCheck,
  MessageSquare,
  FileCheck,
  Activity,
  Calendar
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [historyData, setHistoryData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'coding' | 'interviews' | 'chats' | 'resume'>('timeline');
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getUserHistory();
      setHistoryData(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <History size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Student Activity & Session History
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Complete chronological audit of your code analyses, AI conversations, interview rounds, and resume scorings
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('timeline')}
            className={activeTab === 'timeline' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '7px 14px', borderRadius: 20 }}
          >
            <Activity size={15} /> Activity Timeline ({historyData?.userActivities?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('coding')}
            className={activeTab === 'coding' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '7px 14px', borderRadius: 20 }}
          >
            <Code2 size={15} /> Coding Sessions ({historyData?.codingSessions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={activeTab === 'interviews' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '7px 14px', borderRadius: 20 }}
          >
            <UserCheck size={15} /> Mock Interviews ({historyData?.interviewSessions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={activeTab === 'chats' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '7px 14px', borderRadius: 20 }}
          >
            <MessageSquare size={15} /> AI Chats ({historyData?.recentChats?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={activeTab === 'resume' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13, padding: '7px 14px', borderRadius: 20 }}
          >
            <FileCheck size={15} /> ATS Audits ({historyData?.atsAnalyses?.length || 0})
          </button>
        </div>
      </div>

      {/* History Content */}
      <div className="card fade-in" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading audit history...
          </div>
        ) : (
          <>
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                  Unified Activity Timeline
                </h2>
                {!historyData?.userActivities || historyData.userActivities.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No activities recorded yet. Activities will automatically log as you use the workspace.</p>
                ) : (
                  historyData.userActivities.map((act: any) => (
                    <div
                      key={act.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{act.title}</div>
                        {act.subtitle && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{act.subtitle}</div>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Coding Sessions */}
            {activeTab === 'coding' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                  Code Lab & Inspection Sessions
                </h2>
                {!historyData?.codingSessions || historyData.codingSessions.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No coding sessions recorded yet.</p>
                ) : (
                  historyData.codingSessions.map((s: any) => (
                    <div
                      key={s.id}
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{s.title || 'Code Inspection'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Language: <strong>{s.language?.toUpperCase()}</strong> | Type: <strong>{s.session_type}</strong>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        {new Date(s.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Mock Interviews */}
            {activeTab === 'interviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                  Mock Interview Records
                </h2>
                {!historyData?.interviewSessions || historyData.interviewSessions.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No mock interview sessions recorded yet.</p>
                ) : (
                  historyData.interviewSessions.map((i: any) => (
                    <div
                      key={i.id}
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{i.role_type}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Status: <strong>{i.status}</strong> {i.scores?.overallScore && `| Score: ${i.scores.overallScore}/100`}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        {new Date(i.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* AI Chats */}
            {activeTab === 'chats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                  AI Assistant Question Logs
                </h2>
                {!historyData?.recentChats || historyData.recentChats.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No chat messages recorded yet.</p>
                ) : (
                  historyData.recentChats.map((c: any) => (
                    <div
                      key={c.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ fontSize: 13.5, color: '#0f172a', maxWidth: '75%' }}>{c.content}</div>
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ATS Audits */}
            {activeTab === 'resume' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                  ATS Resume Audit Records
                </h2>
                {!historyData?.atsAnalyses || historyData.atsAnalyses.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No ATS resume audits recorded yet.</p>
                ) : (
                  historyData.atsAnalyses.map((a: any) => (
                    <div
                      key={a.id}
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                          ATS Score: <strong>{a.ats_score} / 100</strong>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Target: {a.target_job_title || 'General Engineering Role'}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
