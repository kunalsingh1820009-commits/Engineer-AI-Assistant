import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';
import { MarkdownView } from '../components/MarkdownView.js';
import {
  Send,
  Sparkles,
  User,
  Bot,
  Plus,
  Trash2
} from 'lucide-react';

export const AIChatPage: React.FC = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'What is inheritance?',
    'Explain black holes simply.',
    'What is the capital of Japan?',
    'Write a C++ palindrome program.',
    'Give me a biryani recipe.',
    'Write an email to my professor.'
  ];

  const loadHistory = async () => {
    try {
      const res = await api.getChatHistory();
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (err: any) {
      console.error('Failed to load chat history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendMessage(text.trim(), 'coder');
      setMessages((prev) => [...prev, res]);
    } catch (err: any) {
      showToast(err.message || 'Failed to get response', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (messages.length === 0) return;
    if (!window.confirm('Start a new chat conversation? This will clear current chat messages.')) return;
    try {
      await api.clearChatHistory();
      setMessages([]);
      showToast('Started new conversation', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear chat', 'error');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>AI Assistant</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              General-purpose conversational assistant
            </p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="btn-secondary"
          style={{ fontSize: '13px', padding: '6px 14px' }}
        >
          <Plus size={15} /> New Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: '#fafafa'
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              maxWidth: '520px',
              padding: '40px 20px'
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Sparkles size={26} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
              How can I help you today?
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Ask anything — from algorithms and code explanations to everyday questions, writing assistance, or science topics.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left' }}>
              {samplePrompts.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSend(p)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id || Math.random()}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: isUser ? '78%' : '88%'
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Bot size={18} />
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: isUser ? 'var(--primary)' : '#ffffff',
                    color: isUser ? '#ffffff' : 'var(--text-main)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {isUser ? (
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '14.5px' }}>
                      {m.content}
                    </div>
                  ) : (
                    <MarkdownView content={m.content} />
                  )}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: '#334155',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)', padding: '6px 0' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bot size={18} />
            </div>
            <div style={{ fontSize: '14px' }}>Thinking...</div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Message Input Bottom Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '10px',
          backgroundColor: '#ffffff'
        }}
      >
        <input
          type="text"
          placeholder="Ask a question or enter a prompt..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '14.5px',
            borderRadius: '8px'
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: '0 20px', borderRadius: '8px', fontSize: '14px' }}
        >
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
};
