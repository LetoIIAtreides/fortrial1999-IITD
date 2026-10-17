import React from 'react';
import { Activity, ShieldCheck, LogIn, LogOut, Radio } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  isOnline: boolean;
  user: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isOnline, user, onOpenLogin, onLogout }) => {
  return (
    <header className="glass-panel header-bar">
      <div className="brand-section">
        <div className="brand-icon">
          <Activity size={28} />
        </div>
        <div>
          <div className="brand-title">AAROGYA LINK</div>
          <div className="brand-tagline">Share Help. Save Lives. • Operations Center</div>
        </div>
      </div>

      <div className="header-actions">
        <div className={`status-pill ${isOnline ? '' : 'offline'}`}>
          <div className="status-dot" />
          <span>{isOnline ? 'Backend Online (Synced)' : 'Backend Offline'}</span>
        </div>

        {user ? (
          <div className="user-badge">
            <ShieldCheck size={18} color="#34d399" />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.full_name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {user.role.toUpperCase()} {user.badge_number ? `• ${user.badge_number}` : ''}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{ minHeight: 32, padding: '4px 10px', fontSize: 12, marginLeft: 8 }}
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenLogin} className="btn-primary">
            <LogIn size={16} />
            <span>Responder Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
