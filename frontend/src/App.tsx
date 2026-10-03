import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.js';
import { Layout } from './components/Layout.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { AIChatPage } from './pages/AIChatPage.js';
import { CodeLabPage } from './pages/CodeLabPage.js';
import { InterviewPrepPage } from './pages/InterviewPrepPage.js';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage.js';
import { LearnPage } from './pages/LearnPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  // Default to Dashboard as the primary student command center
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          color: 'var(--primary)',
          gap: 16
        }}
      >
        <div style={{ fontSize: 36 }}>🚀</div>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#1e293b' }}>
          Loading Engineer AI Assistant...
        </div>
      </div>
    );
  }

  // Unauthenticated user -> Show Login or Register Page
  if (!user) {
    if (authMode === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
  }

  // Authenticated user -> Render selected core feature page
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'ai-assistant':
        return <AIChatPage />;
      case 'code-lab':
        return <CodeLabPage />;
      case 'interview-prep':
        return <InterviewPrepPage />;
      case 'resume':
        return <ResumeBuilderPage />;
      case 'learn':
        return <LearnPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  );
};
