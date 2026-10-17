import React from 'react';
import { Eye, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { EmergencyReport } from '../types';

interface ReportListProps {
  reports: EmergencyReport[];
  isLoading: boolean;
  onSelectReport: (report: EmergencyReport) => void;
}

export const ReportList: React.FC<ReportListProps> = ({ reports, isLoading, onSelectReport }) => {
  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 16, marginBottom: 8 }}>Fetching live reports from AAROGYA LINK backend...</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>Querying verified database records</div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
        <AlertTriangle size={36} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', marginBottom: 6 }}>
          No Matching Emergency Reports Found
        </div>
        <div style={{ fontSize: 14, color: '#94a3b8', maxWidth: 450, margin: '0 auto' }}>
          No reports match your selected criteria or search term. Try resetting your filters.
        </div>
      </div>
    );
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high':
        return <span className="badge badge-high">High Urgency</span>;
      case 'medium':
        return <span className="badge badge-medium">Medium</span>;
      default:
        return <span className="badge badge-low">Low</span>;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="badge badge-verified">Verified</span>;
      case 'RESOLVED':
        return <span className="badge badge-resolved">Resolved</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge badge-unverified">Unverified</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Category</th>
            <th>Urgency</th>
            <th>Location</th>
            <th>Reported Time</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr
              key={report.report_id}
              onClick={() => onSelectReport(report)}
              style={{ cursor: 'pointer' }}
            >
              <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#93c5fd' }}>
                {report.report_id.length > 14
                  ? `${report.report_id.substring(0, 14)}...`
                  : report.report_id}
              </td>
              <td style={{ fontWeight: 600, color: '#ffffff' }}>
                {report.emergency_type}
              </td>
              <td>{getUrgencyBadge(report.urgency)}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1' }}>
                  <MapPin size={14} color="#60a5fa" />
                  <span>
                    {report.location_name
                      ? report.location_name
                      : report.latitude && report.longitude
                      ? `${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}`
                      : 'Not provided'}
                  </span>
                </div>
              </td>
              <td style={{ color: '#94a3b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} />
                  <span>{formatDate(report.created_at)}</span>
                </div>
              </td>
              <td>{getVerificationBadge(report.verification_status)}</td>
              <td style={{ textAlign: 'right' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectReport(report);
                  }}
                  className="btn-secondary"
                  style={{ minHeight: 32, padding: '4px 10px', fontSize: 13 }}
                >
                  <Eye size={14} />
                  <span>Review</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
