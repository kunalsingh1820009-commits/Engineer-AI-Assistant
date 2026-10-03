import React, { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className={`main-content ${collapsed ? 'expanded' : ''}`}>
        <Header onNavigate={setActiveTab} />
        <main className="page-container fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
