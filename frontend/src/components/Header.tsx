import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';

interface HeaderProps {
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Welcome, {user?.name || 'Engineer'}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Engineer AI Workspace
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* User Profile Avatar with Clean Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer'
            }}
            title="User Profile Menu"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
          </div>

          {dropdownOpen && (
            <div
              className="fade-in card"
              style={{
                position: 'absolute',
                top: 46,
                right: 0,
                width: 200,
                padding: 8,
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>

              <div
                className="nav-item"
                onClick={() => { onNavigate('settings'); setDropdownOpen(false); }}
                style={{ fontSize: 13, padding: '7px 10px' }}
              >
                <SettingsIcon size={15} />
                <span>Settings</span>
              </div>

              <div
                className="nav-item"
                onClick={() => { logout(); setDropdownOpen(false); }}
                style={{ fontSize: 13, padding: '7px 10px', color: '#ef4444', borderTop: '1px solid var(--border-color)', marginTop: 4 }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
