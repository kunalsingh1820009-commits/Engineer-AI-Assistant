import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import {
  Play,
  Bug,
  Sparkles,
  Zap,
  FlaskConical,
  Copy,
  Check,
  CheckCircle,
  AlertTriangle,
  Code2,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CodeLabPage: React.FC = () => {
  const { showToast } = useToast();
  const [language, setLanguage] = useState<string>('cpp');
  // CRITICAL: Code editor MUST start completely empty. No default code, no samples.
  const [code, setCode] = useState<string>('');

  // Primary Workspace Mode: 'analysis' (Section 1) vs 'complexity' (Section 2)
  const [activeSection, setActiveSection] = useState<'analysis' | 'complexity'>('analysis');

  // Execution state
  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState<any | null>(null);

  // Section 1: Code Analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analysisTab, setAnalysisTab] = useState<'explanation' | 'debugging' | 'testcases'>('explanation');

  // Section 2: Complexity & Improvement state
  const [complexityLoading, setComplexityLoading] = useState(false);
  const [complexityResult, setComplexityResult] = useState<any | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Run Code Simulation
  const handleRunCode = async () => {
    if (!code.trim()) {
      showToast('Write or paste your code to begin.', 'warning');
      return;
    }
    setRunLoading(true);
    try {
      const res = await api.runCode(code.trim(), language);
      setRunResult(res);
      showToast('Code executed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Run failed', 'error');
    } finally {
      setRunLoading(false);
    }
  };

  // SECTION 1: Full Code Analysis
  const handleRunCodeAnalysis = async () => {
    if (!code.trim()) {
      showToast('Write or paste your code to begin.', 'warning');
      return;
    }
    setAnalysisLoading(true);
    setActiveSection('analysis');
    try {
      const res = await api.analyzeCode(code.trim(), language);
      setAnalysisResult(res.analysis);
      showToast('Detailed Code Analysis ready.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Code analysis failed', 'error');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // SECTION 2: Complexity & Improvement
  const handleRunComplexityAndImprovement = async () => {
    if (!code.trim()) {
      showToast('Write or paste your code to begin.', 'warning');
      return;
    }
    setComplexityLoading(true);
    setActiveSection('complexity');
    try {
      const res = await api.analyzeComplexityAndImprovement(code.trim(), language);
      setComplexityResult(res.result);
      showToast('Complexity & Optimization analysis ready.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Complexity analysis failed', 'error');
    } finally {
      setComplexityLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Code Lab</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            One unified coding workspace with Code Analysis, Complexity & Optimization
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ width: '150px', padding: '6px 12px', fontSize: '13px', fontWeight: 500 }}
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
      </div>

      {/* Code Editor Box */}
      <div
        style={{
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}
        >
          <span>Editor ({language.toUpperCase()})</span>
          {code && (
            <button
              onClick={() => handleCopy(code)}
              style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '2px 8px' }}
            >
              {copiedCode ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              {copiedCode ? 'Copied' : 'Copy Code'}
            </button>
          )}
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write or paste your code here..."
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: '240px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13.5px',
            lineHeight: 1.6,
            padding: '16px',
            border: 'none',
            borderRadius: 0,
            outline: 'none',
            resize: 'vertical',
            backgroundColor: '#ffffff',
            color: '#0f172a'
          }}
        />
      </div>

      {/* Action Buttons Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleRunCode}
          disabled={runLoading}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Play size={15} color="#2563eb" /> {runLoading ? 'Running...' : 'Run Code'}
        </button>

        <button
          onClick={handleRunCodeAnalysis}
          disabled={analysisLoading}
          className={activeSection === 'analysis' && analysisResult ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 18px', fontSize: '13px' }}
        >
          <Bug size={15} /> {analysisLoading ? 'Analyzing...' : 'Code Analysis'}
        </button>

        <button
          onClick={handleRunComplexityAndImprovement}
          disabled={complexityLoading}
          className={activeSection === 'complexity' && complexityResult ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 18px', fontSize: '13px' }}
        >
          <TrendingUp size={15} /> {complexityLoading ? 'Computing Big-O...' : 'Complexity & Improvement'}
        </button>
      </div>

      {/* Terminal Output if Run Code clicked */}
      {runResult && (
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '8px',
            padding: '14px 18px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px'
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
            Output (Execution: {runResult.executionTimeMs}ms | Memory: {runResult.memoryMb})
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {runResult.output}
          </pre>
        </div>
      )}

      {/* Section Switcher & Panels */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginTop: '4px' }}>
        <button
          onClick={() => setActiveSection('analysis')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: activeSection === 'analysis' ? 700 : 500,
            color: activeSection === 'analysis' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeSection === 'analysis' ? '2px solid var(--primary)' : '2px solid transparent',
            borderRadius: 0
          }}
        >
          1. Code Analysis
        </button>
        <button
          onClick={() => setActiveSection('complexity')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: activeSection === 'complexity' ? 700 : 500,
            color: activeSection === 'complexity' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeSection === 'complexity' ? '2px solid var(--primary)' : '2px solid transparent',
            borderRadius: 0
          }}
        >
          2. Complexity & Improvement
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: CODE ANALYSIS PANEL */}
      {/* ======================================================== */}
      {activeSection === 'analysis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {analysisLoading ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Analyzing your code with AI...
            </div>
          ) : !analysisResult ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: '#ffffff' }}>
              <Code2 size={32} color="var(--text-light)" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>Write or paste your code to begin.</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Click &quot;Code Analysis&quot; to get step-by-step explanations, error detection, and test cases.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Analysis Sub-tabs */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setAnalysisTab('explanation')}
                  className={analysisTab === 'explanation' ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '13px', padding: '6px 14px' }}
                >
                  <Sparkles size={14} /> Detailed Explanation
                </button>
                <button
                  onClick={() => setAnalysisTab('debugging')}
                  className={analysisTab === 'debugging' ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '13px', padding: '6px 14px' }}
                >
                  <Bug size={14} /> Debug & Errors {analysisResult.debugging?.hasIssues && <span style={{ color: '#ef4444', fontWeight: 800 }}>!</span>}
                </button>
                <button
                  onClick={() => setAnalysisTab('testcases')}
                  className={analysisTab === 'testcases' ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '13px', padding: '6px 14px' }}
                >
                  <FlaskConical size={14} /> Test Cases ({analysisResult.testCases?.length || 0})
                </button>
              </div>

              {/* Sub-tab 1: Detailed Explanation */}
              {analysisTab === 'explanation' && (
                <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      What the Code is Trying to Do:
                    </h3>
                    <p style={{ fontSize: '14px', color: '#0f172a', lineHeight: 1.6, margin: 0 }}>
                      {analysisResult.explanation.summary}
                    </p>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      How the Code Works (Step-by-Step for Beginners):
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {analysisResult.explanation.howItWorksStepByStep?.map((step: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variables & Functions Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    {analysisResult.explanation.importantVariables?.length > 0 && (
                      <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Important Variables:
                        </div>
                        <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {analysisResult.explanation.importantVariables.map((v: string, i: number) => (
                            <li key={i}>{v}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.explanation.importantFunctions?.length > 0 && (
                      <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Functions & Methods:
                        </div>
                        <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {analysisResult.explanation.importantFunctions.map((fn: string, i: number) => (
                            <li key={i}>{fn}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Control Flow, I/O, Edge Cases */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <div style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Control Flow:</div>
                      <div style={{ fontSize: '13px', color: '#334155' }}>{analysisResult.explanation.controlFlow}</div>
                    </div>
                    <div style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Input Handling:</div>
                      <div style={{ fontSize: '13px', color: '#334155' }}>{analysisResult.explanation.inputHandling}</div>
                    </div>
                    <div style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Output Generation:</div>
                      <div style={{ fontSize: '13px', color: '#334155' }}>{analysisResult.explanation.outputGeneration}</div>
                    </div>
                  </div>

                  {analysisResult.explanation.edgeCasesToConsider?.length > 0 && (
                    <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Edge Cases to Consider:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {analysisResult.explanation.edgeCasesToConsider.map((ec: string, i: number) => (
                          <span key={i} style={{ fontSize: '12.5px', color: '#92400e', backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '4px' }}>
                            {ec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Debug & Errors */}
              {analysisTab === 'debugging' && (
                <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {analysisResult.debugging?.hasIssues ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 700, fontSize: '14px' }}>
                        <AlertTriangle size={18} /> Issues Identified in Code
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '14px' }}>
                        <CheckCircle size={18} /> No Syntax or Runtime Errors Found
                      </div>
                    )}
                  </div>

                  {analysisResult.debugging?.issues?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analysisResult.debugging.issues.map((iss: any, i: number) => (
                        <div key={i} style={{ padding: '14px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#991b1b' }}>
                            Problem {i + 1}: {iss.problem}
                          </div>
                          <div style={{ fontSize: '13px', color: '#7f1d1d' }}>
                            <strong>Why it happens:</strong> {iss.whyItHappens}
                          </div>
                          <div style={{ fontSize: '13px', color: '#047857', backgroundColor: '#ecfdf5', padding: '8px 12px', borderRadius: '6px', marginTop: '4px' }}>
                            <strong>How to fix:</strong> {iss.howToFix}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                      The code follows correct language grammar, loop bounds, and control flow without critical bugs.
                    </p>
                  )}

                  {analysisResult.debugging?.correctedCode && analysisResult.debugging.hasIssues && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Corrected Code:
                        </span>
                        <button
                          onClick={() => setCode(analysisResult.debugging.correctedCode)}
                          className="btn-secondary"
                          style={{ fontSize: '12px', padding: '3px 10px' }}
                        >
                          Apply to Editor
                        </button>
                      </div>
                      <pre
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#f8fafc',
                          padding: '14px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontFamily: 'JetBrains Mono, monospace',
                          overflowX: 'auto',
                          margin: 0
                        }}
                      >
                        <code>{analysisResult.debugging.correctedCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 3: Dynamic Test Cases */}
              {analysisTab === 'testcases' && (
                <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                    Generated Test Cases for Your Actual Code ({analysisResult.testCases?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {analysisResult.testCases?.map((tc: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          padding: '14px 16px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                            Test Case #{tc.testCaseNumber || i + 1}
                          </span>
                          <span className="badge badge-primary">{tc.scenario}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>INPUT:</div>
                            <code style={{ fontSize: '12.5px', color: '#0f172a' }}>{tc.input}</code>
                          </div>
                          <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>EXPECTED OUTPUT:</div>
                            <code style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: 600 }}>{tc.expectedOutput}</code>
                          </div>
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          <strong>Why:</strong> {tc.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: COMPLEXITY & IMPROVEMENT PANEL */}
      {/* ======================================================== */}
      {activeSection === 'complexity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {complexityLoading ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Computing detailed Time & Space complexity and optimization avenues...
            </div>
          ) : !complexityResult ? (
            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: '#ffffff' }}>
              <TrendingUp size={32} color="var(--text-light)" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#334155' }}>Write or paste your code to begin.</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Click &quot;Complexity & Improvement&quot; to evaluate Big-O with operational reasons and optimized alternatives.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Complexity Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time Complexity</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>{complexityResult.timeComplexity}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                    <strong>Reason:</strong> {complexityResult.timeReason}
                  </div>
                </div>

                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Space Complexity</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>{complexityResult.spaceComplexity}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                    <strong>Reason:</strong> {complexityResult.spaceReason}
                  </div>
                </div>
              </div>

              {/* Bottlenecks Card */}
              {complexityResult.bottlenecks && (
                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc' }}>
                  <Cpu size={20} color="#64748b" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Identified Bottleneck:</div>
                    <div style={{ fontSize: '13.5px', color: '#0f172a' }}>{complexityResult.bottlenecks}</div>
                  </div>
                </div>
              )}

              {/* Optimal Status / Optimization Recommendation */}
              {complexityResult.isOptimal ? (
                <div className="card" style={{ padding: '20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                    <CheckCircle size={18} /> Code is Already Optimal
                  </div>
                  <p style={{ fontSize: '13px', color: '#047857', margin: 0, lineHeight: 1.5 }}>
                    Your current implementation already runs within the optimal theoretical Big-O complexity for this problem without requiring forced refactoring.
                  </p>
                </div>
              ) : (
                <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="#d97706" />
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Algorithmic Optimization Available
                    </h3>
                  </div>

                  {/* Comparison Approaches */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Approach 1 — Current:
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{complexityResult.approach1Simple?.name || 'Current Approach'}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: 700, margin: '4px 0' }}>
                        Time: {complexityResult.approach1Simple?.timeComplexity} | Space: {complexityResult.approach1Simple?.spaceComplexity}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{complexityResult.approach1Simple?.explanation}</div>
                    </div>

                    <div style={{ padding: '14px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', marginBottom: '4px' }}>
                        Approach 2 — Optimized:
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e3a8a' }}>{complexityResult.approach2Optimized?.name || complexityResult.optimizationDetails?.betterApproach || 'Optimized Approach'}</div>
                      <div style={{ fontSize: '12.5px', color: '#059669', fontWeight: 700, margin: '4px 0' }}>
                        Time: {complexityResult.approach2Optimized?.timeComplexity || 'Optimized'} | Space: {complexityResult.approach2Optimized?.spaceComplexity || 'O(1)'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#1e40af' }}>{complexityResult.approach2Optimized?.explanation || complexityResult.optimizationDetails?.whyBetter}</div>
                    </div>
                  </div>

                  {/* Why Better Explanation */}
                  {complexityResult.optimizationDetails?.whyBetter && (
                    <div style={{ padding: '12px 14px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#166534' }}>
                      <strong>Why this is better:</strong> {complexityResult.optimizationDetails.whyBetter}
                    </div>
                  )}

                  {/* Optimized Code Snippet */}
                  {complexityResult.optimizationDetails?.optimizedCode && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Optimized Implementation:
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleCopy(complexityResult.optimizationDetails.optimizedCode)}
                            className="btn-secondary"
                            style={{ fontSize: '12px', padding: '3px 10px' }}
                          >
                            Copy Code
                          </button>
                          <button
                            onClick={() => setCode(complexityResult.optimizationDetails.optimizedCode)}
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '3px 10px' }}
                          >
                            Use in Editor
                          </button>
                        </div>
                      </div>
                      <pre
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#f8fafc',
                          padding: '14px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontFamily: 'JetBrains Mono, monospace',
                          overflowX: 'auto',
                          margin: 0
                        }}
                      >
                        <code>{complexityResult.optimizationDetails.optimizedCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
