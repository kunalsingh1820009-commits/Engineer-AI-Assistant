import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Welcome back! Logged in successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      // Automatically log in as sample student or create demo user
      try {
        await login('alex.engineer@example.com', 'password123');
      } catch {
        // If not registered yet, register and login
        const { api } = await import('../services/api.js');
        await api.register({
          name: 'Alex Morgan',
          email: 'alex.engineer@example.com',
          password: 'password123',
          targetRole: 'Full Stack Software Engineer'
        });
        await login('alex.engineer@example.com', 'password123');
      }
      showToast('Logged in with Demo Student Account!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '24px'
      }}
    >
      <div
        className="card fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-xl)',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              margin: '0 auto 16px',
              boxShadow: '0 8px 16px rgba(37,99,235,0.25)'
            }}
          >
            🚀
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Welcome back 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Your AI engineering assistant
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
              <input
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Password
              </label>
              <span
                onClick={() => setShowForgotModal(true)}
                style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 6 }}
          >
            {loading ? 'Logging in...' : 'Login'} <ArrowRight size={17} />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div style={{ margin: '20px 0 16px', position: 'relative', textAlign: 'center' }}>
          <div style={{ position: 'absolute', left: 0, top: '50%', right: 0, height: 1, backgroundColor: '#e2e8f0' }} />
          <span style={{ position: 'relative', backgroundColor: '#ffffff', padding: '0 12px', fontSize: 12, color: '#94a3b8' }}>
            OR
          </span>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="btn-secondary"
          disabled={loading}
          style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 600 }}
        >
          <Sparkles size={15} color="var(--primary)" /> Fast Demo Student Login
        </button>

        {/* Switch to Register */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
          Don't have an account?{' '}
          <span
            onClick={onSwitchToRegister}
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Create Account
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div className="card fade-in" style={{ maxWidth: 400, width: '90%', padding: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 10, fontWeight: 700 }}>Reset Password</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Enter your student email and we'll send you password reset instructions.
            </p>
            <input type="email" placeholder="name@university.edu" defaultValue={email} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowForgotModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={() => {
                  showToast('Password reset link sent to your email!', 'success');
                  setShowForgotModal(false);
                }}
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
