import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Settings, User, Briefcase, Key, Shield, Download, LogOut } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Full Stack Software Engineer');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(name, targetRole);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Profile update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user,
      exportedAt: new Date().toISOString(),
      platform: 'Engineer AI Assistant'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engineer_ai_profile_${user?.email || 'user'}.json`;
    a.click();
    showToast('Profile data exported to JSON!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Settings size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Account & Application Settings</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Manage your engineering student profile, target role specialization, and account security.
            </p>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 540 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Target Engineering Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
              <option value="Backend Software Engineer">Backend Software Engineer</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Systems & C++ Engineer">Systems & C++ Engineer</option>
              <option value="Data Structures & Algorithms / SDE">Data Structures & SDE Track</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ width: 'fit-content', padding: '10px 20px', fontSize: 14, marginTop: 4 }}
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Security & Data Export */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Data Privacy & Security</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Export Learning Data</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Download your complete progress and profile history in JSON format.</div>
          </div>
          <button onClick={handleExportData} className="btn-secondary" style={{ fontSize: 13 }}>
            <Download size={15} /> Export JSON
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#991b1b' }}>Logout Current Session</div>
            <div style={{ fontSize: 12, color: '#7f1d1d' }}>Sign out of your Engineer AI assistant session securely.</div>
          </div>
          <button onClick={logout} className="btn-primary" style={{ backgroundColor: '#dc2626', fontSize: 13 }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};
