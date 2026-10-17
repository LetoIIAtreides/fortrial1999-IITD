import React, { useState } from 'react';
import { X, Lock, Shield, User } from 'lucide-react';
import { api } from '../api/client';
import { UserProfile } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const [username, setUsername] = useState('responder_ravi');
  const [password, setPassword] = useState('Responder@12345');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.login(username, password);
      localStorage.setItem('aarogya_token', data.access_token);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel modal-content"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-icon" style={{ width: 38, height: 38 }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, color: '#ffffff' }}>Responder Authentication</h3>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>AAROGYA LINK Emergency Command</div>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ minHeight: 32, padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#cbd5e1', marginBottom: 6, fontWeight: 500 }}>
              Responder Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', paddingLeft: 38 }}
                placeholder="e.g. responder_ravi or admin"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#cbd5e1', marginBottom: 6, fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: 38 }}
                placeholder="Enter password"
              />
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 8, padding: 12, fontSize: 12, color: '#94a3b8' }}>
            <strong style={{ color: '#cbd5e1' }}>Pre-configured Demo Credentials:</strong>
            <div style={{ marginTop: 4 }}>• SDRF Responder: <code>responder_ravi</code> / <code>Responder@12345</code></div>
            <div>• Health Officer: <code>responder_anita</code> / <code>Responder@12345</code></div>
            <div>• Chief Admin: <code>admin</code> / <code>Admin@12345</code></div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In as Responder'}
          </button>
        </form>
      </div>
    </div>
  );
};
