import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Trash2,
  Droplets,
  Activity,
  Baby,
  Thermometer,
  Pill,
  HelpCircle,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { BandageIcon } from './common/BandageIcon';
import { tokens } from '../tokens';
import { EmergencyReport } from '../types';
import { storage } from '../utils/storage';
import { api } from '../api/client';
import { ReportStatusBadge, VerificationBadge } from './common/Badges';
import { Language, translations } from '../i18n/translations';

interface ReportsScreenProps {
  onNavigateHome?: () => void;
  onNavigateBack?: () => void;
  onStartReport: () => void;
  selectedReportId?: string | null;
  lang: Language;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  onNavigateHome,
  onNavigateBack,
  onStartReport,
  selectedReportId,
  lang,
}) => {
  const t = translations[lang];

  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('ALL');
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Load and merge local and server reports
  const refreshReports = async () => {
    setIsRefreshing(true);
    const local = storage.getReports();

    try {
      const server = await api.getReports({ page_size: 50 });
      if (server && server.items) {
        // Merge server verified states into local records
        local.forEach((loc) => {
          const match = server.items.find((s) => s.report_id === loc.report_id);
          if (match) {
            storage.markReportServerReceived(loc.report_id, {
              verification_status: match.verification_status,
              verified_by: match.verified_by,
              verification_notes: match.verification_notes,
              last_synced_at: match.last_synced_at,
            });
          }
        });
      }
    } catch {
      // Server unreachable: show local records faithfully
    } finally {
      const updated = storage.getReports();
      setReports(updated);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshReports();
  }, []);

  useEffect(() => {
    if (selectedReportId) {
      const r = storage.getReports().find((item) => item.report_id === selectedReportId);
      if (r) setSelectedReport(r);
    }
  }, [selectedReportId]);

  // Retry upload for pending reports
  const handleRetryUpload = async (report: EmergencyReport) => {
    setRetryingId(report.report_id);
    try {
      const res = await api.createReport({
        report_id: report.report_id,
        report_type: report.report_type || 'NEED',
        emergency_type: report.emergency_type,
        urgency: report.urgency,
        latitude: report.latitude,
        longitude: report.longitude,
        location_name: report.location_name,
        people_affected: report.people_affected,
        description: report.description,
        evidence_type: report.evidence_type,
        created_at: report.created_at,
      });

      storage.markReportServerReceived(report.report_id, {
        sync_status: 'RECEIVED_BY_SERVER',
        verification_status: res.verification_status,
      });
      refreshReports();
    } catch {
      alert('Upload retry failed: Server is still unreachable. Will retry automatically.');
    } finally {
      setRetryingId(null);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Delete this report copy from device local storage?')) {
      storage.deleteReport(reportId);
      setSelectedReport(null);
      refreshReports();
    }
  };

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('bleed')) return <Droplets size={22} color="#dc2626" />;
    if (c.includes('diabet') || c.includes('insulin')) return <Activity size={22} color="#0284c7" />;
    if (c.includes('pregnan')) return <Baby size={22} color="#ec4899" />;
    if (c.includes('fever')) return <Thermometer size={22} color="#ea580c" />;
    if (c.includes('injur')) return <BandageIcon size={22} color="#b45309" />;
    if (c.includes('medicin')) return <Pill size={22} color="#8b5cf6" />;
    return <HelpCircle size={22} color="#4b5563" />;
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (filter === 'PENDING') return r.sync_status === 'LOCAL_PENDING';
    if (filter === 'VERIFIED') return r.verification_status === 'VERIFIED';
    return true;
  });

  return (
    <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 85 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onNavigateBack || onNavigateHome}
            aria-label="Back"
            style={{
              width: 40,
              height: 40,
              borderRadius: tokens.radius.chip,
              border: `1px solid ${tokens.colors.border}`,
              backgroundColor: tokens.colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} color={tokens.colors.navyText} />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: tokens.colors.navyText, margin: 0 }}>
              {t.myReports}
            </h1>
            <div style={{ fontSize: 12, color: tokens.colors.mutedText }}>
              Local storage merged with server records
            </div>
          </div>
        </div>

        <button
          onClick={refreshReports}
          disabled={isRefreshing}
          title="Refresh server status"
          style={{
            width: 38,
            height: 38,
            borderRadius: tokens.radius.chip,
            border: `1px solid ${tokens.colors.border}`,
            backgroundColor: tokens.colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} color={tokens.colors.primaryBlue} />
        </button>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['ALL', 'PENDING', 'VERIFIED'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            style={{
              flex: 1,
              minHeight: 38,
              borderRadius: tokens.radius.chip,
              backgroundColor: filter === mode ? tokens.colors.primaryBlue : tokens.colors.cardGrey,
              color: filter === mode ? tokens.colors.white : tokens.colors.navyText,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {mode === 'ALL' ? 'All' : mode === 'PENDING' ? 'Pending Upload' : 'Verified'}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            backgroundColor: tokens.colors.white,
            borderRadius: tokens.radius.card,
            boxShadow: tokens.shadow.card,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: tokens.radius.full,
              backgroundColor: tokens.colors.paleBlue,
              color: tokens.colors.primaryBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
            }}
          >
            <Clock size={28} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 6 }}>
            {t.noReportsSentYet}
          </div>
          <p style={{ fontSize: 13, color: tokens.colors.mutedText, marginBottom: 16 }}>
            Medical emergency reports you submit will be saved and tracked here.
          </p>
          <button
            onClick={onStartReport}
            style={{
              backgroundColor: tokens.colors.primaryBlue,
              color: tokens.colors.white,
              border: 'none',
              borderRadius: tokens.radius.button,
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: tokens.shadow.active,
            }}
          >
            Report Emergency
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredReports.map((rep) => {
            const isPending = rep.sync_status === 'LOCAL_PENDING';

            return (
              <div
                key={rep.report_id}
                style={{
                  padding: '16px',
                  backgroundColor: tokens.colors.white,
                  borderRadius: tokens.radius.card,
                  border: `1px solid ${tokens.colors.border}`,
                  boxShadow: tokens.shadow.card,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: tokens.colors.paleBlue,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getCategoryIcon(rep.emergency_type)}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: tokens.colors.navyText }}>
                        {rep.emergency_type}
                      </div>
                      <div style={{ fontSize: 12, color: tokens.colors.mutedText }}>
                        {new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {rep.urgency} urgency
                      </div>
                    </div>
                  </div>

                  <ReportStatusBadge status={rep.sync_status} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <VerificationBadge status={rep.verification_status} />
                  {rep.location_name && (
                    <span style={{ fontSize: 12, color: tokens.colors.mutedText }}>
                      • {rep.location_name}
                    </span>
                  )}
                </div>

                {rep.description && (
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: '18px', marginBottom: 12, backgroundColor: tokens.colors.cardGrey, padding: '8px 10px', borderRadius: 8 }}>
                    {rep.description}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setSelectedReport(rep)}
                    style={{
                      flex: 1,
                      minHeight: 40,
                      backgroundColor: tokens.colors.paleBlue,
                      color: tokens.colors.primaryBlue,
                      border: 'none',
                      borderRadius: tokens.radius.chip,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Open Details
                  </button>

                  {isPending && (
                    <button
                      onClick={() => handleRetryUpload(rep)}
                      disabled={retryingId === rep.report_id}
                      style={{
                        minHeight: 40,
                        padding: '0 14px',
                        backgroundColor: tokens.colors.warningBg,
                        color: tokens.colors.warningAmber,
                        border: `1px solid ${tokens.colors.warningAmber}`,
                        borderRadius: tokens.radius.chip,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <RefreshCw size={14} className={retryingId === rep.report_id ? 'animate-spin' : ''} />
                      Retry Upload
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Detail Modal / View */}
      {selectedReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 35, 66, 0.65)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedReport(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: '85vh',
              overflowY: 'auto',
              backgroundColor: tokens.colors.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '24px 20px',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: tokens.colors.navyText, margin: 0 }}>
                  Report Timeline & Details
                </h3>
                <div style={{ fontSize: 12, color: tokens.colors.mutedText }}>
                  ID: <code>{selectedReport.report_id}</code>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  background: tokens.colors.cardGrey,
                  border: 'none',
                  borderRadius: tokens.radius.chip,
                  padding: '6px 12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>

            {/* Status Timeline */}
            <div style={{ backgroundColor: tokens.colors.cardGrey, borderRadius: tokens.radius.card, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 10 }}>
                Status History:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <CheckCircle2 size={16} color={tokens.colors.successGreen} />
                  <span>
                    Created & Saved on Phone: <strong>{new Date(selectedReport.created_at).toLocaleTimeString()}</strong>
                  </span>
                </div>
                {selectedReport.sync_status === 'RECEIVED_BY_SERVER' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <CheckCircle2 size={16} color={tokens.colors.successGreen} />
                    <span>
                      Confirmed by Server: <strong>{selectedReport.last_synced_at ? new Date(selectedReport.last_synced_at).toLocaleTimeString() : 'Yes'}</strong>
                    </span>
                  </div>
                )}
                {selectedReport.verification_status === 'VERIFIED' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <CheckCircle2 size={16} color={tokens.colors.successGreen} />
                    <span>
                      Verified by Responder: <strong>{selectedReport.verified_by || 'Officer'}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Responder notes if any */}
            {selectedReport.verification_notes && (
              <div style={{ padding: 12, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: tokens.radius.chip, marginBottom: 16, fontSize: 13 }}>
                <strong>Responder Message:</strong> {selectedReport.verification_notes}
              </div>
            )}

            {/* Summary fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, fontSize: 13 }}>
              <div>
                <span style={{ color: tokens.colors.mutedText }}>Category:</span> <strong>{selectedReport.emergency_type}</strong>
              </div>
              <div>
                <span style={{ color: tokens.colors.mutedText }}>Urgency:</span> <strong>{selectedReport.urgency}</strong>
              </div>
              <div>
                <span style={{ color: tokens.colors.mutedText }}>People:</span> <strong>{selectedReport.people_affected || 1}</strong>
              </div>
              <div>
                <span style={{ color: tokens.colors.mutedText }}>Ward:</span> <strong>{selectedReport.ward || 'Ward 4'}</strong>
              </div>
            </div>

            {/* Delete local copy */}
            <button
              onClick={() => handleDeleteReport(selectedReport.report_id)}
              style={{
                width: '100%',
                minHeight: 44,
                backgroundColor: tokens.colors.palePink,
                color: tokens.colors.emergencyRed,
                border: 'none',
                borderRadius: tokens.radius.chip,
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={16} />
              Delete Local Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
