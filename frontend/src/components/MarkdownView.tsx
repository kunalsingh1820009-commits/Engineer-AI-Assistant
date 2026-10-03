import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split into code blocks and normal markdown segments
  const segments: Array<{ type: 'code' | 'text'; language?: string; code?: string; text?: string }> = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: content.slice(lastIndex, match.index)
      });
    }
    segments.push({
      type: 'code',
      language: match[1]?.trim() || 'code',
      code: match[2]?.trim() || ''
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      text: content.slice(lastIndex)
    });
  }

  // Parse inline text (bold, italic, inline code)
  const renderInline = (str: string): React.ReactNode[] => {
    // Regex splits on bold, code, and italic
    const tokens = str.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
        return (
          <code
            key={idx}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#0f172a',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              border: '1px solid #e2e8f0'
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
        return <strong key={idx}>{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
        return <em key={idx}>{token.slice(1, -1)}</em>;
      }
      return token;
    });
  };

  // Parse a text segment into structured blocks (headers, lists, blockquotes, paragraphs)
  const renderTextSegment = (rawText: string, segKey: number) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'ul') {
          elements.push(
            <ul
              key={`list-${elements.length}`}
              style={{
                paddingLeft: '22px',
                margin: '6px 0 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              {currentList.items.map((it, i) => (
                <li key={i} style={{ lineHeight: '1.6' }}>{it}</li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol
              key={`list-${elements.length}`}
              style={{
                paddingLeft: '22px',
                margin: '6px 0 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              {currentList.items.map((it, i) => (
                <li key={i} style={{ lineHeight: '1.6' }}>{it}</li>
              ))}
            </ol>
          );
        }
        currentList = null;
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      // Check headings (no raw # display!)
      if (trimmed.startsWith('#### ')) {
        flushList();
        elements.push(
          <h5
            key={`h4-${lineIdx}`}
            style={{ fontSize: '14px', fontWeight: 700, margin: '12px 0 6px', color: '#1e293b' }}
          >
            {renderInline(trimmed.slice(5))}
          </h5>
        );
        return;
      }
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h4
            key={`h3-${lineIdx}`}
            style={{ fontSize: '15px', fontWeight: 700, margin: '14px 0 6px', color: '#0f172a' }}
          >
            {renderInline(trimmed.slice(4))}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h3
            key={`h2-${lineIdx}`}
            style={{ fontSize: '16px', fontWeight: 700, margin: '16px 0 6px', color: '#0f172a' }}
          >
            {renderInline(trimmed.slice(3))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h2
            key={`h1-${lineIdx}`}
            style={{ fontSize: '18px', fontWeight: 700, margin: '18px 0 8px', color: '#0f172a' }}
          >
            {renderInline(trimmed.slice(2))}
          </h2>
        );
        return;
      }

      // Unordered list item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(renderInline(trimmed.slice(2)));
        return;
      }

      // Ordered list item (e.g. 1. , 2. )
      const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (olMatch) {
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(renderInline(olMatch[2]));
        return;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote
            key={`bq-${lineIdx}`}
            style={{
              borderLeft: '3px solid var(--primary)',
              paddingLeft: '12px',
              margin: '8px 0',
              color: 'var(--text-muted)',
              fontStyle: 'italic'
            }}
          >
            {renderInline(trimmed.slice(2))}
          </blockquote>
        );
        return;
      }

      // Regular paragraph line
      flushList();
      elements.push(
        <p
          key={`p-${lineIdx}`}
          style={{ margin: '4px 0', lineHeight: '1.6', fontSize: '14.5px' }}
        >
          {renderInline(trimmed)}
        </p>
      );
    });

    flushList();

    return (
      <div key={`seg-${segKey}`} style={{ display: 'flex', flexDirection: 'column' }}>
        {elements}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {segments.map((segment, idx) => {
        if (segment.type === 'code') {
          const isCopied = copiedIndex === idx;
          return (
            <div
              key={idx}
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                margin: '10px 0'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#1e293b',
                  padding: '6px 14px',
                  fontSize: '12px',
                  color: '#94a3b8'
                }}
              >
                <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {segment.language}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(segment.code || '', idx)}
                  style={{
                    color: isCopied ? '#10b981' : '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '12px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  {isCopied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre
                style={{
                  padding: '14px 16px',
                  overflowX: 'auto',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  fontFamily: 'JetBrains Mono, monospace',
                  margin: 0
                }}
              >
                <code>{segment.code}</code>
              </pre>
            </div>
          );
        }
        return renderTextSegment(segment.text || '', idx);
      })}
    </div>
  );
};
