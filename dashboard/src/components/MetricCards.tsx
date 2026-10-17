import React from 'react';
import { AlertCircle, Clock, CheckCircle2, CheckSquare, Flame } from 'lucide-react';
import { EmergencyReport } from '../types';

interface MetricCardsProps {
  reports: EmergencyReport[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ reports }) => {
  const total = reports.length;
  const unverified = reports.filter((r) => r.verification_status === 'UNVERIFIED').length;
  const verified = reports.filter((r) => r.verification_status === 'VERIFIED').length;
  const resolved = reports.filter((r) => r.verification_status === 'RESOLVED').length;
  const highUrgency = reports.filter((r) => r.urgency === 'High' && r.verification_status !== 'RESOLVED').length;

  return (
    <div className="metrics-grid">
      <div className="glass-panel metric-card">
        <div className="metric-header">
          <span className="metric-label">Total Reports</span>
          <div className="metric-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <AlertCircle size={20} />
          </div>
        </div>
        <div className="metric-value">{total}</div>
        <div className="metric-subtext">Live synced community entries</div>
      </div>

      <div className="glass-panel metric-card" style={{ borderColor: unverified > 0 ? 'rgba(168, 85, 247, 0.4)' : undefined }}>
        <div className="metric-header">
          <span className="metric-label">Unverified Reports</span>
          <div className="metric-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Clock size={20} />
          </div>
        </div>
        <div className="metric-value" style={{ color: '#c084fc' }}>{unverified}</div>
        <div className="metric-subtext">Awaiting responder review</div>
      </div>

      <div className="glass-panel metric-card">
        <div className="metric-header">
          <span className="metric-label">Active Verified</span>
          <div className="metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="metric-value" style={{ color: '#34d399' }}>{verified}</div>
        <div className="metric-subtext">Responder action dispatched</div>
      </div>

      <div className="glass-panel metric-card">
        <div className="metric-header">
          <span className="metric-label">Resolved</span>
          <div className="metric-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <CheckSquare size={20} />
          </div>
        </div>
        <div className="metric-value" style={{ color: '#22d3ee' }}>{resolved}</div>
        <div className="metric-subtext">Assisted and completed</div>
      </div>

      <div className="glass-panel metric-card" style={{ borderColor: highUrgency > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
        <div className="metric-header">
          <span className="metric-label">High Urgency Active</span>
          <div className="metric-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <Flame size={20} />
          </div>
        </div>
        <div className="metric-value" style={{ color: '#f87171' }}>{highUrgency}</div>
        <div className="metric-subtext">Immediate attention needed</div>
      </div>
    </div>
  );
};
