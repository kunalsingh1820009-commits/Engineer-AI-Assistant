import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import {
  BookOpen,
  Search,
  ExternalLink,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers,
  Code,
  FolderGit2
} from 'lucide-react';

export const LearnPage: React.FC = () => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [learningPlan, setLearningPlan] = useState<any | null>(null);

  // Completed items tracking (synced with user progress)
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const sampleTopics = [
    'C++',
    'Java',
    'DSA',
    'Web Development',
    'AI/ML',
    'DBMS',
    'Operating Systems',
    'Computer Networks',
    'Git/GitHub'
  ];

  const handleSearch = async (topicToSearch?: string) => {
    const q = topicToSearch || searchQuery;
    if (!q.trim()) {
      showToast('Please enter a topic to explore.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.searchLearnTopic(q.trim());
      setLearningPlan(res.learningPlan);
      if (!topicToSearch) setSearchQuery('');
      showToast(`Learning plan for ${res.learningPlan.topic} ready!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate learning plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load: search C++ DSA by default
    handleSearch('C++ DSA');
  }, []);

  const toggleMilestone = async (tier: string, index: number, milestoneName: string) => {
    const key = `${learningPlan?.topic || 'topic'}-${tier}-${index}`;
    const nextVal = !completedItems[key];
    setCompletedItems((prev) => ({ ...prev, [key]: nextVal }));

    try {
      await api.updateRoadmapProgress(
        `learn-${(learningPlan?.topic || 'general').toLowerCase().replace(/\s+/g, '-')}`,
        key,
        nextVal ? 'completed' : 'in_progress',
        milestoneName
      );
      showToast(nextVal ? 'Milestone marked complete!' : 'Milestone marked in progress', 'info');
    } catch (err: any) {
      console.warn('Failed to update progress on backend:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
      {/* Header & Search */}
      <div className="card" style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#eff6ff', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Student Learning Hub
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Search any engineering topic to get a structured roadmap from Beginner to Advanced with practice challenges
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-light)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search topic: C++, Java, DSA, Web Development, AI/ML, DBMS, OS, Networks, Git..."
              style={{ paddingLeft: '38px' }}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '9px 20px', fontSize: '13px' }}
          >
            {loading ? 'Searching...' : 'Explore Topic'}
          </button>
        </div>

        {/* Suggested Topic Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Popular:</span>
          {sampleTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setSearchQuery(topic);
                handleSearch(topic);
              }}
              style={{
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: learningPlan?.topic === topic ? 'var(--primary-light)' : 'var(--bg-subtle)',
                color: learningPlan?.topic === topic ? 'var(--primary)' : '#334155',
                border: '1px solid var(--border-color)',
                fontWeight: learningPlan?.topic === topic ? 700 : 500
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Learning Plan Results */}
      {loading ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          Generating structured curriculum and project roadmap...
        </div>
      ) : !learningPlan ? (
        <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Search for an engineering topic above to generate your learning path.
        </div>
      ) : (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Topic Overview */}
          <div className="card" style={{ padding: '20px 24px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '6px' }}>ENGINEERING TOPIC</span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0', color: '#0f172a' }}>
                  {learningPlan.topic}
                </h2>
                <p style={{ fontSize: '13.5px', color: '#475569', margin: '4px 0 0', lineHeight: 1.6 }}>
                  {learningPlan.description}
                </p>
              </div>
            </div>
          </div>

          {/* Learning Order: Beginner → Intermediate → Advanced */}
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Learning Order: Beginner → Intermediate → Advanced
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Tier 1: Beginner */}
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Beginner Foundations
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {learningPlan.learningOrder?.beginner?.map((item: string, i: number) => {
                    const key = `${learningPlan.topic}-beginner-${i}`;
                    const isDone = Boolean(completedItems[key]);
                    return (
                      <div
                        key={i}
                        onClick={() => toggleMilestone('beginner', i, item)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: isDone ? '#64748b' : '#0f172a',
                          textDecoration: isDone ? 'line-through' : 'none'
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                        ) : (
                          <Circle size={16} color="#86efac" style={{ flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tier 2: Intermediate */}
              <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Intermediate Applied
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {learningPlan.learningOrder?.intermediate?.map((item: string, i: number) => {
                    const key = `${learningPlan.topic}-intermediate-${i}`;
                    const isDone = Boolean(completedItems[key]);
                    return (
                      <div
                        key={i}
                        onClick={() => toggleMilestone('intermediate', i, item)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: isDone ? '#64748b' : '#0f172a',
                          textDecoration: isDone ? 'line-through' : 'none'
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                        ) : (
                          <Circle size={16} color="#93c5fd" style={{ flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tier 3: Advanced */}
              <div style={{ padding: '16px', backgroundColor: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  3. Advanced Architecture
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {learningPlan.learningOrder?.advanced?.map((item: string, i: number) => {
                    const key = `${learningPlan.topic}-advanced-${i}`;
                    const isDone = Boolean(completedItems[key]);
                    return (
                      <div
                        key={i}
                        onClick={() => toggleMilestone('advanced', i, item)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: isDone ? '#64748b' : '#0f172a',
                          textDecoration: isDone ? 'line-through' : 'none'
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                        ) : (
                          <Circle size={16} color="#c4b5fd" style={{ flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Practice Suggestions & Project Ideas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Practice Suggestions */}
            <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Practice Suggestions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {learningPlan.practiceSuggestions?.map((ps: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#334155' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{i + 1}.</span>
                    <span>{ps}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Vetted Resources */}
            <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Curated Free Resources
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {learningPlan.resources?.map((res: any, i: number) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary)' }}>
                        {res.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{res.description}</div>
                    </div>
                    <ExternalLink size={14} color="var(--text-light)" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Project Ideas */}
          {learningPlan.projectIdeas?.length > 0 && (
            <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Real-World Portfolio Project Ideas
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {learningPlan.projectIdeas.map((proj: any, i: number) => (
                  <div key={i} style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{proj.title}</div>
                    <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: 1.5 }}>{proj.description}</p>
                    <div style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                      Skills: {proj.skillsGained}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
