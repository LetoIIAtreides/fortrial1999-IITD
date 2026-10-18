import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, CheckSquare, XCircle, ShieldAlert, History, MapPin, Clock, FileText } from 'lucide-react';
import { EmergencyReport, VerificationAuditLog, UserProfile, VerificationStatus } from '../types';
import { api } from '../api/client';

interface ReportDetailModalProps {
  report: EmergencyReport;
  user: UserProfile | null;
  onClose: () => void;
  onUpdated: (updatedReport: EmergencyReport) => void;
  onPromptLogin: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  user,
  onClose,
  onUpdated,
  onPromptLogin,
}) => {
  const [auditLogs, setAuditLogs] = useState<VerificationAuditLog[]>([]);
  const [responderNotes, setResponderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      api.getAuditLogs(report.report_id)
        .then((logs) => {
          if (isMounted) setAuditLogs(logs);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [report.report_id, user]);

  const handleVerificationAction = async (newStatus: VerificationStatus) => {
    if (!user) {
      onPromptLogin();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Direct backend call - update UI only upon confirmed backend response
      const updated = await api.updateVerification(report.report_id, newStatus, responderNotes);
      onUpdated(updated);
      setResponderNotes('');
      // Reload audit trail
      const logs = await api.getAuditLogs(report.report_id);
      setAuditLogs(logs);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification update failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: 13, color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase' }}>
              Emergency Incident Review
            </div>
            <h2 style={{ fontSize: 22, color: '#ffffff', marginTop: 2 }}>{report.emergency_type}</h2>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ minHeight: 36, padding: '6px 12px' }}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {errorMsg}
          </div>
        )}

        {/* Status bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Reported Urgency</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: report.urgency === 'High' ? '#f87171' : report.urgency === 'Medium' ? '#fbbf24' : '#34d399' }}>
              {report.urgency} Urgency
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Verification State</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: report.verification_status === 'VERIFIED' ? '#34d399' : report.verification_status === 'RESOLVED' ? '#22d3ee' : '#c084fc' }}>
              {report.verification_status}
            </div>
          </div>
        </div>

        {/* Location & Time info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <MapPin size={18} color="#60a5fa" />
            <div>
              <span style={{ color: '#94a3b8' }}>Location: </span>
              <strong style={{ color: '#f8fafc' }}>
                {report.location_name || 'Descriptive location not specified'}
              </strong>
              {report.latitude && report.longitude && (
                <span style={{ color: '#64748b', marginLeft: 8 }}>
                  ({report.latitude.toFixed(4)}, {report.longitude.toFixed(4)})
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Clock size={18} color="#60a5fa" />
            <div>
              <span style={{ color: '#94a3b8' }}>Created: </span>
              <strong style={{ color: '#f8fafc' }}>
                {new Date(report.created_at).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
            Report Description / Medical Notes
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8, padding: 14, fontSize: 14, color: '#e2e8f0', minHeight: 60 }}>
            {report.description || 'No additional descriptive details entered by citizen.'}
          </div>
        </div>

        {/* Verification Action Panel */}
        <div style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 12, padding: 18, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldAlert size={18} color="#60a5fa" />
            <h4 style={{ fontSize: 15, color: '#ffffff' }}>Authorized Responder Verification Action</h4>
          </div>

          {!user ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                Authentication required. Log in with responder or administrator credentials to verify, dispatch, or resolve reports.
              </p>
              <button onClick={onPromptLogin} className="btn-primary" style={{ margin: '0 auto' }}>
                Log In as Responder
              </button>
            </div>
          ) : (
            <div>
              <textarea
                placeholder="Enter responder verification notes, triage action, or dispatched team details..."
                value={responderNotes}
                onChange={(e) => setResponderNotes(e.target.value)}
                style={{ width: '100%', minHeight: 70, marginBottom: 14 }}
              />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleVerificationAction('VERIFIED')}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ background: '#10b981', flex: 1 }}
                >
                  <CheckCircle2 size={16} />
                  <span>Verify Incident</span>
                </button>
                <button
                  onClick={() => handleVerificationAction('RESOLVED')}
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ background: '#0891b2', flex: 1 }}
                >
                  <CheckSquare size={16} />
                  <span>Mark Resolved</span>
                </button>
                <button
                  onClick={() => handleVerificationAction('REJECTED')}
                  disabled={isSubmitting}
                  className="btn-secondary"
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <XCircle size={16} />
                  <span>Reject / Duplicate</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Audit Log Trail */}
        {auditLogs.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <History size={16} color="#94a3b8" />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                Verification Audit History ({auditLogs.length})
              </div>
            </div>
            <div className="audit-timeline">
              {auditLogs.map((log) => (
                <div key={log.log_id} className="audit-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ color: '#60a5fa' }}>{log.responder_username}</strong>
                    <span style={{ color: '#64748b', fontSize: 12 }}>
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#cbd5e1' }}>
                    Status changed from <em>{log.previous_status}</em> → <strong>{log.new_status}</strong>
                  </div>
                  {log.notes && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>
                      "{log.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
