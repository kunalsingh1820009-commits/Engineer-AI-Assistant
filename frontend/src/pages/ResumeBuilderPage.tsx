import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import {
  FileText,
  Sparkles,
  Printer,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Briefcase,
  Layers,
  Search,
  Check
} from 'lucide-react';

export const ResumeBuilderPage: React.FC = () => {
  const { showToast } = useToast();
  // Tabs: 'builder' | 'ats'
  const [activeTab, setActiveTab] = useState<'builder' | 'ats'>('builder');

  // BUILDER STATE
  const [resumeData, setResumeData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enhancingIndex, setEnhancingIndex] = useState<string | null>(null);

  // ATS SCORER STATE
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<any | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const loadResume = async () => {
    setLoading(true);
    try {
      const res = await api.getResume();
      setResumeData(res.resume.content);
    } catch (err: any) {
      showToast(err.message || 'Failed to load resume', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, []);

  const handleSave = async () => {
    if (!resumeData) return;
    setSaving(true);
    try {
      await api.saveResume('My Engineering Resume', resumeData);
      showToast('Resume saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEnhanceBullet = async (section: 'projects' | 'experience', itemIdx: number, bulletIdx: number) => {
    const raw = resumeData[section][itemIdx].bulletPoints[bulletIdx];
    if (!raw) return;
    const key = `${section}-${itemIdx}-${bulletIdx}`;
    setEnhancingIndex(key);
    try {
      const res = await api.enhanceBullet(raw);
      const updated = { ...resumeData };
      updated[section][itemIdx].bulletPoints[bulletIdx] = res.enhanced;
      setResumeData(updated);
      showToast('Bullet point transformed with strong engineering action verbs!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Enhancement failed', 'error');
    } finally {
      setEnhancingIndex(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Handle file upload for ATS
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setResumeText(content);
        showToast(`Loaded ${file.name}`, 'info');
      }
    };
    reader.readAsText(file);
  };

  // Populate ATS from Current Builder Resume
  const handleUseBuilderResumeForATS = () => {
    if (!resumeData) return;
    let fullText = `${resumeData.personalInfo?.fullName || ''}\nEmail: ${resumeData.personalInfo?.email || ''}\n`;
    fullText += `GitHub: ${resumeData.personalInfo?.github || ''} | LinkedIn: ${resumeData.personalInfo?.linkedin || ''}\n\n`;

    fullText += `EDUCATION:\n`;
    resumeData.education?.forEach((ed: any) => {
      fullText += `${ed.degree} - ${ed.institution} (${ed.year}) GPA: ${ed.gpa}\n`;
    });

    fullText += `\nSKILLS:\n`;
    fullText += `Languages: ${resumeData.skills?.languages?.join(', ')}\n`;
    fullText += `Frameworks: ${resumeData.skills?.frameworks?.join(', ')}\n`;
    fullText += `Tools: ${resumeData.skills?.tools?.join(', ')}\n`;
    fullText += `Coursework: ${resumeData.skills?.coursework?.join(', ')}\n\n`;

    fullText += `PROJECTS:\n`;
    resumeData.projects?.forEach((p: any) => {
      fullText += `${p.title} (${p.technologies})\n`;
      p.bulletPoints?.forEach((b: string) => {
        fullText += `- ${b}\n`;
      });
    });

    fullText += `\nEXPERIENCE:\n`;
    resumeData.experience?.forEach((ex: any) => {
      fullText += `${ex.role} at ${ex.company} (${ex.period})\n`;
      ex.bulletPoints?.forEach((b: string) => {
        fullText += `- ${b}\n`;
      });
    });

    setResumeText(fullText);
    showToast('Loaded resume content from your Resume Builder!', 'info');
  };

  // Run ATS Analysis
  const handleRunATSAnalysis = async () => {
    if (!resumeText.trim()) {
      showToast('Please upload or paste your resume text to begin.', 'warning');
      return;
    }
    setAtsLoading(true);
    try {
      const res = await api.analyzeATS(resumeText.trim(), jobDescription.trim() || undefined);
      setAtsResult(res.analysis);
      showToast(`ATS Score: ${res.analysis.atsScore} / 100`, 'success');
    } catch (err: any) {
      showToast(err.message || 'ATS analysis failed', 'error');
    } finally {
      setAtsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Top Header & Tab Controls */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669' }}>
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Career & Resume Suite
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Craft an engineering resume with AI bullet enhancement and audit with the ATS Resume Scorer
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('builder')}
            className={activeTab === 'builder' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '13px', padding: '7px 16px' }}
          >
            <FileText size={15} /> Resume Builder
          </button>
          <button
            onClick={() => setActiveTab('ats')}
            className={activeTab === 'ats' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '13px', padding: '7px 16px' }}
          >
            <FileCheck size={15} /> ATS Resume Scorer
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: RESUME BUILDER */}
      {/* ======================================================== */}
      {activeTab === 'builder' && resumeData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Builder Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: '13px' }}>
              <Printer size={15} /> Print / Export PDF
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: '13px' }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Resume'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: '20px' }}>
            {/* LEFT: Form Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. Personal Information */}
              <div className="card" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
                  1. Personal Information
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={resumeData.personalInfo?.fullName || ''}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }
                      })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={resumeData.personalInfo?.email || ''}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={resumeData.personalInfo?.phone || ''}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="GitHub (e.g. github.com/user)"
                    value={resumeData.personalInfo?.github || ''}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, github: e.target.value }
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn (e.g. linkedin.com/in/user)"
                    value={resumeData.personalInfo?.linkedin || ''}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Portfolio (e.g. alex.dev)"
                    value={resumeData.personalInfo?.portfolio || ''}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, portfolio: e.target.value }
                      })
                    }
                  />
                </div>
              </div>

              {/* 2. Technical Skills */}
              <div className="card" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
                  2. Technical Skills
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Languages:</label>
                    <input
                      type="text"
                      value={resumeData.skills?.languages?.join(', ') || ''}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, languages: e.target.value.split(',').map((s) => s.trim()) }
                        })
                      }
                      placeholder="C++, Python, Java, JavaScript, TypeScript, SQL"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Frameworks & Web:</label>
                    <input
                      type="text"
                      value={resumeData.skills?.frameworks?.join(', ') || ''}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, frameworks: e.target.value.split(',').map((s) => s.trim()) }
                        })
                      }
                      placeholder="React, Node.js, Express, Vite"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Developer Tools:</label>
                    <input
                      type="text"
                      value={resumeData.skills?.tools?.join(', ') || ''}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, tools: e.target.value.split(',').map((s) => s.trim()) }
                        })
                      }
                      placeholder="Git, Docker, Postman, Linux"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Core Coursework:</label>
                    <input
                      type="text"
                      value={resumeData.skills?.coursework?.join(', ') || ''}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, coursework: e.target.value.split(',').map((s) => s.trim()) }
                        })
                      }
                      placeholder="DSA, Operating Systems, DBMS, Networks"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Projects */}
              <div className="card" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
                  3. Technical Projects
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {resumeData.projects?.map((proj: any, pIdx: number) => (
                    <div key={pIdx} style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Project Title"
                          value={proj.title || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[pIdx].title = e.target.value;
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Technologies Used"
                          value={proj.technologies || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[pIdx].technologies = e.target.value;
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bullet Points:</span>
                        {proj.bulletPoints?.map((bullet: string, bIdx: number) => (
                          <div key={bIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[pIdx].bulletPoints[bIdx] = e.target.value;
                                setResumeData({ ...resumeData, projects: updated });
                              }}
                              style={{ flex: 1, fontSize: '12.5px' }}
                            />
                            <button
                              onClick={() => handleEnhanceBullet('projects', pIdx, bIdx)}
                              disabled={enhancingIndex === `projects-${pIdx}-${bIdx}`}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
                              title="Enhance with Action Verbs & Metrics"
                            >
                              <Sparkles size={12} color="#7c3aed" />
                              {enhancingIndex === `projects-${pIdx}-${bIdx}` ? 'Enhancing...' : 'AI Enhance'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Experience */}
              <div className="card" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px', color: '#0f172a' }}>
                  4. Professional Experience
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {resumeData.experience?.map((exp: any, eIdx: number) => (
                    <div key={eIdx} style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Role (e.g. Intern)"
                          value={exp.role || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[eIdx].role = e.target.value;
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company || ''}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[eIdx].company = e.target.value;
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Period (e.g. May 2025 - August 2025)"
                        value={exp.period || ''}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          updated[eIdx].period = e.target.value;
                          setResumeData({ ...resumeData, experience: updated });
                        }}
                      />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {exp.bulletPoints?.map((bullet: string, bIdx: number) => (
                          <div key={bIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[eIdx].bulletPoints[bIdx] = e.target.value;
                                setResumeData({ ...resumeData, experience: updated });
                              }}
                              style={{ flex: 1, fontSize: '12.5px' }}
                            />
                            <button
                              onClick={() => handleEnhanceBullet('experience', eIdx, bIdx)}
                              disabled={enhancingIndex === `experience-${eIdx}-${bIdx}`}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
                            >
                              <Sparkles size={12} color="#7c3aed" /> AI Enhance
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Live Printable A4 Preview */}
            <div
              className="card"
              style={{
                padding: '28px',
                backgroundColor: '#ffffff',
                fontFamily: "'Times New Roman', serif",
                fontSize: '12px',
                lineHeight: 1.45,
                color: '#000000',
                border: '1px solid #cbd5e1',
                boxShadow: 'var(--shadow-md)',
                height: 'fit-content'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '1px solid #333333', paddingBottom: '8px', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {resumeData.personalInfo?.fullName || 'Alex Morgan'}
                </h2>
                <div style={{ fontSize: '11px', marginTop: '4px', color: '#333333' }}>
                  {resumeData.personalInfo?.email} | {resumeData.personalInfo?.phone} | {resumeData.personalInfo?.github} | {resumeData.personalInfo?.linkedin}
                </div>
              </div>

              {/* Education */}
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '0.5px solid #666', margin: '0 0 4px', paddingBottom: '2px' }}>
                  Education
                </h3>
                {resumeData.education?.map((ed: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div>
                      <strong>{ed.institution}</strong> — <em>{ed.degree}</em>
                    </div>
                    <span>{ed.year}</span>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '0.5px solid #666', margin: '0 0 4px', paddingBottom: '2px' }}>
                  Technical Skills
                </h3>
                <div><strong>Languages:</strong> {resumeData.skills?.languages?.join(', ')}</div>
                <div><strong>Frameworks:</strong> {resumeData.skills?.frameworks?.join(', ')}</div>
                <div><strong>Tools:</strong> {resumeData.skills?.tools?.join(', ')}</div>
              </div>

              {/* Projects */}
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '0.5px solid #666', margin: '0 0 4px', paddingBottom: '2px' }}>
                  Projects
                </h3>
                {resumeData.projects?.map((p: any, i: number) => (
                  <div key={i} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{p.title}</strong>
                      <span style={{ fontSize: '11px', color: '#555' }}>{p.technologies}</span>
                    </div>
                    <ul style={{ paddingLeft: '16px', margin: '2px 0 0' }}>
                      {p.bulletPoints?.map((b: string, bi: number) => (
                        <li key={bi} style={{ marginBottom: '1px' }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Experience */}
              {resumeData.experience?.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', borderBottom: '0.5px solid #666', margin: '0 0 4px', paddingBottom: '2px' }}>
                    Experience
                  </h3>
                  {resumeData.experience.map((exp: any, i: number) => (
                    <div key={i} style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{exp.role}</strong> — {exp.company}
                        <span style={{ fontSize: '11px', color: '#555' }}>{exp.period}</span>
                      </div>
                      <ul style={{ paddingLeft: '16px', margin: '2px 0 0' }}>
                        {exp.bulletPoints?.map((b: string, bi: number) => (
                          <li key={bi} style={{ marginBottom: '1px' }}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ATS RESUME SCORER */}
      {/* ======================================================== */}
      {activeTab === 'ats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  ATS Resume Scorer & Analyzer
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Upload a resume or paste text, optionally provide a target job description, and calculate a realistic ATS score.
                </p>
              </div>

              {resumeData && (
                <button onClick={handleUseBuilderResumeForATS} className="btn-secondary" style={{ fontSize: '12.5px' }}>
                  Use My Built Resume
                </button>
              )}
            </div>

            {/* Upload Area */}
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)',
                position: 'relative'
              }}
            >
              <UploadCloud size={28} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>
                {fileName ? `Loaded: ${fileName}` : 'Upload Resume File (.txt, .md)'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Or paste your resume text in the box below
              </div>
              <input
                type="file"
                accept=".txt,.md,.doc"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Resume Text Input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Resume Text (Required):
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your full resume text here..."
                rows={7}
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
              />
            </div>

            {/* Optional Target Job Description */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Target Job Description (Optional):
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description to measure keyword alignment and matching skills..."
                rows={4}
                style={{ fontSize: '13px' }}
              />
            </div>

            <button
              onClick={handleRunATSAnalysis}
              disabled={atsLoading || !resumeText.trim()}
              className="btn-primary"
              style={{ width: 'fit-content', padding: '10px 22px', fontSize: '13.5px' }}
            >
              <FileCheck size={16} /> {atsLoading ? 'Auditing Resume with ATS...' : 'Calculate ATS Score & Audit'}
            </button>
          </div>

          {/* ATS Analysis Results */}
          {atsResult && (
            <div className="card fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Score Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  backgroundColor: '#f8fafc',
                  padding: '18px 24px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Calculated ATS Compatibility Score
                  </span>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: atsResult.atsScore >= 75 ? '#16a34a' : '#d97706', lineHeight: 1.2 }}>
                    {atsResult.atsScore} / 100
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                    {atsResult.summary}
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Keyword Relevance:</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{atsResult.scoreBreakdown?.keywordRelevance}%</div>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Skills Match:</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{atsResult.scoreBreakdown?.skillsMatch}%</div>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Action Verbs Impact:</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{atsResult.scoreBreakdown?.actionVerbsImpact}%</div>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Metrics & Quantifiers:</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{atsResult.scoreBreakdown?.quantifiableMetrics}%</div>
                  </div>
                </div>
              </div>

              {/* Matched vs Missing Keywords */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', marginBottom: '8px' }}>
                    ✅ Matching Technical Skills Found:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {atsResult.matchingSkills?.map((s: string, i: number) => (
                      <span key={i} style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#d1fae5', color: '#047857', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '8px' }}>
                    ⚠️ Missing Important Keywords:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {atsResult.missingKeywords?.map((k: string, i: number) => (
                      <span key={i} style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 21: ATS Improvement Techniques */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                  Specific Improvement Techniques & Example Rewrites
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {atsResult.improvements?.map((imp: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: 700, fontSize: '13.5px' }}>
                        <AlertTriangle size={16} /> 1. Issue: {imp.currentIssue}
                      </div>

                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        <strong>2. Why it matters:</strong> {imp.whyItMatters}
                      </div>

                      <div style={{ fontSize: '13px', color: '#334155' }}>
                        <strong>3. Suggested improvement:</strong> {imp.suggestedImprovement}
                      </div>

                      <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '13px', color: '#166534' }}>
                        <strong>4. Example rewrite:</strong> &quot;{imp.exampleRewrite}&quot;
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
