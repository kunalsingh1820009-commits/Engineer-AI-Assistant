import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => {
          let bgColor = 'var(--bg-card)';
          let borderColor = 'var(--border-color)';
          let icon = <Info size={18} color="var(--primary)" />;

          if (toast.type === 'success') {
            borderColor = '#10b981';
            icon = <CheckCircle2 size={18} color="#10b981" />;
          } else if (toast.type === 'error') {
            borderColor = '#ef4444';
            icon = <AlertCircle size={18} color="#ef4444" />;
          } else if (toast.type === 'warning') {
            borderColor = '#f59e0b';
            icon = <AlertTriangle size={18} color="#f59e0b" />;
          }

          return (
            <div
              key={toast.id}
              className="fade-in"
              style={{
                pointerEvents: 'auto',
                minWidth: 300,
                maxWidth: 420,
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                borderLeft: `4px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-main)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {icon}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ color: 'var(--text-light)', padding: 2, background: 'none' }}
                aria-label="Close Toast"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
