import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Code2,
  Target,
  FileText,
  BookOpen,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const { logout } = useAuth();

  const mainItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Bot size={18} /> },
    { id: 'code-lab', label: 'Code Lab', icon: <Code2 size={18} /> },
    { id: 'interview-prep', label: 'Interview Prep', icon: <Target size={18} /> },
    { id: 'resume', label: 'Resume', icon: <FileText size={18} /> },
    { id: 'learn', label: 'Learn', icon: <BookOpen size={18} /> },
    { id: 'history', label: 'History', icon: <History size={18} /> }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        {!collapsed ? (
          <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
            <div className="brand-icon">🚀</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#ffffff', letterSpacing: -0.3 }}>
                Engineer AI
              </div>
            </div>
          </div>
        ) : (
          <div className="brand-icon" style={{ margin: '0 auto', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
            🚀
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            padding: 6,
            borderRadius: '6px',
            color: '#bfdbfe',
            backgroundColor: 'rgba(255, 255, 255, 0.12)'
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {mainItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <span style={{ color: isActive ? '#ffffff' : '#bfdbfe', display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="nav-text" style={{ whiteSpace: 'nowrap', color: isActive ? '#ffffff' : '#dbeafe' }}>
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions: Settings and Logout */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={18} style={{ color: activeTab === 'settings' ? '#ffffff' : '#bfdbfe' }} />
            {!collapsed && <span className="nav-text" style={{ color: activeTab === 'settings' ? '#ffffff' : '#dbeafe' }}>Settings</span>}
          </div>

          <div
            className="nav-item"
            onClick={logout}
            style={{ color: '#fca5a5' }}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} style={{ color: '#fca5a5' }} />
            {!collapsed && <span className="nav-text font-medium" style={{ color: '#fca5a5' }}>Logout</span>}
          </div>
        </div>
      </div>
    </aside>
  );
};
