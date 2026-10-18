import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import L from 'leaflet';
import { api } from '../api/client';
import { EmergencyReport, UserProfile } from '../types';

interface ResponderConsoleScreenProps {
  reports: EmergencyReport[];
  reportsError?: string | null;
  user: UserProfile | null;
  onNavigateHome: () => void;
  onLoginClick: () => void;
  onOpenHeatmap?: () => void;
}

export const ResponderConsoleScreen: React.FC<ResponderConsoleScreenProps> = ({
  reports,
  reportsError,
  user,
  onNavigateHome,
  onLoginClick,
  onOpenHeatmap,
}) => {
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const locatedReports = reports.filter(
    (report) => report.latitude != null && report.longitude != null
  );
  const sortedReports = useMemo(() => {
    const urgencyRank: Record<string, number> = {
      Critical: 5,
      Urgent: 4,
      High: 3,
      Medium: 2,
      Low: 1,
      'Can wait': 0,
    };
    return [...reports].sort(
      (a, b) =>
        (urgencyRank[b.urgency] ?? 0) - (urgencyRank[a.urgency] ?? 0) ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [reports]);

  // Pick the first available report when the queue changes.
  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      const insulinNeed = reports.find(r => r.emergency_type.toLowerCase().includes('insulin'));
      setSelectedReport(insulinNeed || reports[0]);
    }
  }, [reports, selectedReport]);

  // Leaflet Map for Responder Console Center Column
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([30.558, 79.567], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    locatedReports.forEach((rep) => {
      const lat = rep.latitude as number;
      const lng = rep.longitude as number;
      const isNeed = (rep.report_type || 'NEED') === 'NEED';
      const isVerified = rep.verification_status === 'VERIFIED';
      const isFlagged = rep.verification_status === 'FLAGGED' || !!rep.flagged_reason;

      let badgeHtml = '';
      if (isVerified) badgeHtml = '<div class="marker-status-badge verified">✓</div>';
      else if (isFlagged) badgeHtml = '<div class="marker-status-badge flagged">!</div>';
      else badgeHtml = '<div class="marker-status-badge unverified">?</div>';

      let symbol = isNeed ? '●' : '■';
      const typeLower = (rep.emergency_type || '').toLowerCase();
      if (typeLower.includes('insulin')) symbol = '💧';
      else if (typeLower.includes('medicine')) symbol = '💊';
      else if (typeLower.includes('pregnancy')) symbol = '🤰';
      else if (typeLower.includes('food')) symbol = '🍲';
      else if (typeLower.includes('ambulance') || typeLower.includes('transport')) symbol = '🚑';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="${isNeed ? 'marker-need-circle' : 'marker-offer-square'}">
            <span style="font-size: 15px;">${symbol}</span>
            ${badgeHtml}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedReport(rep);
      });
    });
    if (locatedReports.length > 0) {
      map.fitBounds(
        locatedReports.map((report) => [report.latitude as number, report.longitude as number]),
        { padding: [24, 24], maxZoom: 14 }
      );
    }
  }, [reports]);

  // Actions
  const handleVerify = async () => {
    if (!selectedReport) return;
    if (!user) {
      onLoginClick();
      return;
    }
    setIsProcessing(true);
    try {
      const updated = await api.updateVerification(
        selectedReport.report_id,
        'VERIFIED',
        actionNotes || 'Verified by control room responder',
        user.username
      );
      setSelectedReport(updated);
      alert(`Report ${selectedReport.report_id} verified and assigned to ${user.username}`);
    } catch (err: any) {
      alert(err.message || 'Verification update failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedReport) return;
    if (!user) {
      onLoginClick();
      return;
    }
    setIsProcessing(true);
    try {
      const updated = await api.requestMoreInfo(selectedReport.report_id, actionNotes);
      setSelectedReport(updated);
      alert('Request for additional information sent.');
    } catch (err: any) {
      alert(err.message || 'Failed to request info.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkFalse = async () => {
    if (!selectedReport) return;
    if (!user) {
      onLoginClick();
      return;
    }
    setIsProcessing(true);
    try {
      const updated = await api.updateVerification(
        selectedReport.report_id,
        'REJECTED',
        actionNotes || 'Flagged by verification checks as false report',
        user.username
      );
      setSelectedReport(updated);
      alert(`Report ${selectedReport.report_id} marked as FALSE.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openCount = reports.filter(r => r.verification_status !== 'RESOLVED').length;
  const needsCount = reports.filter(r => (r.report_type || 'NEED') === 'NEED').length;
  const offersCount = reports.filter(r => r.report_type === 'OFFER').length;
  const verifiedCount = reports.filter(r => r.verification_status === 'VERIFIED').length;

  return (
    <div style={{ background: '#090d16', minHeight: '100vh', color: '#f8fafc', padding: 14 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #1e293b', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onNavigateHome}
            style={{
              background: '#1e293b',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowLeft size={16} /> Home
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: 0.5 }}>MED-LINK</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>Responder console</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>District control room</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: '#1e293b', color: '#cbd5e1', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
            {reports.some((report) => report.report_id.startsWith('rep-demo-')) ? 'Includes demo reports' : 'Live reports'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#14532d', color: '#86efac', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} /> Online
          </div>

          {onOpenHeatmap && (
            <button
              onClick={onOpenHeatmap}
              style={{
                background: '#7f1d1d',
                color: '#fecaca',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Supply heatmap
            </button>
          )}
          {!user ? (
            <button
              onClick={onLoginClick}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700
              }}
            >
              Responder Login
            </button>
          ) : (
            <div style={{ fontSize: 12, color: '#86efac', fontWeight: 600 }}>
              Logged in: <strong>{user.username}</strong> ({user.role})
            </div>
          )}
        </div>
      </div>

      {/* 3-Column Desktop Grid Layout */}
      <div className="responder-grid">
        {/* Column 1: Incoming requests */}
        <div className="console-column">
          <div className="console-col-header">
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Incoming requests</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{openCount} open · sorted by urgency</div>
            </div>
          </div>

          <div className="queue-items-scroll">
            {reportsError && (
              <div role="alert" style={{ padding: 12, color: '#b91c1c', background: '#fef2f2', borderRadius: 8 }}>
                {reportsError}
              </div>
            )}
            {!reportsError && reports.length === 0 && (
              <div style={{ padding: 16, color: '#64748b' }}>
                {user ? 'No reports are available.' : 'Sign in as a responder to review reports.'}
              </div>
            )}
            {sortedReports.map((rep) => {
              const isSelected = selectedReport?.report_id === rep.report_id;
              const isNeed = (rep.report_type || 'NEED') === 'NEED';
              const isFlagged = rep.verification_status === 'FLAGGED' || !!rep.flagged_reason;
              const isVerified = rep.verification_status === 'VERIFIED';

              return (
                <div
                  key={rep.report_id}
                  className={`queue-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedReport(rep)}
                  style={{
                    borderStyle: isFlagged ? 'dashed' : 'solid',
                    borderColor: isFlagged ? '#ef4444' : (isSelected ? '#2563eb' : '#e2e8f0')
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: isNeed ? '50%' : 8,
                      background: isNeed ? '#dc2626' : '#15803d',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      flexShrink: 0
                    }}>
                      {isNeed ? '💧' : '■'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                          {rep.emergency_type} {isNeed && !rep.emergency_type.toLowerCase().includes('needed') ? 'needed' : ''}
                        </h4>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 6,
                          background: rep.urgency === 'Critical' ? '#fee2e2' : (rep.urgency === 'Urgent' ? '#fef3c7' : '#f0fdf4'),
                          color: rep.urgency === 'Critical' ? '#b91c1c' : (rep.urgency === 'Urgent' ? '#b45309' : '#15803d'),
                        }}>
                          {rep.urgency}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {rep.location_name || rep.ward || 'Location not provided'} · {new Date(rep.created_at).toLocaleString()}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: isVerified ? '#dcfce7' : (isFlagged ? '#fee2e2' : '#f1f5f9'),
                          color: isVerified ? '#15803d' : (isFlagged ? '#b91c1c' : '#475569')
                        }}>
                          {isVerified ? '✓ Verified' : (isFlagged ? '! Flagged' : rep.verification_status)}
                        </span>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>
                          {rep.ai_check_status || 'No automated assessment'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Impact map and live resources */}
        <div className="console-column">
          <div className="console-col-header">
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Impact map and live resources</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 12 }}>
                {needsCount} needs
              </span>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 12 }}>
                {offersCount} offers
              </span>
              <span style={{ background: '#0f172a', color: '#ffffff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 12 }}>
                {verifiedCount} verified
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', flex: 1, minHeight: 400 }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

            {reports.length > locatedReports.length && (
              <div className="heatmap-empty" style={{ bottom: 12, top: 'auto' }}>
                {reports.length - locatedReports.length} reports have no coordinates and are not shown on this map.
              </div>
            )}
          </div>

          <div style={{ padding: '8px 14px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: 11, color: '#64748b' }}>
            Circle = need. Square = offer. Check = verified. Dashed ? = not yet verified. ! = flagged by checks.
          </div>
        </div>

        {/* Column 3: Selected report details & verification */}
        <div className="console-column">
          {selectedReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: (selectedReport.report_type || 'NEED') === 'NEED' ? '50%' : 8,
                  background: (selectedReport.report_type || 'NEED') === 'NEED' ? '#dc2626' : '#15803d',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0
                }}>
                  {(selectedReport.report_type || 'NEED') === 'NEED' ? '💧' : '■'}
                </div>

                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    {selectedReport.emergency_type} {((selectedReport.report_type || 'NEED') === 'NEED' && !selectedReport.emergency_type.toLowerCase().includes('needed')) ? 'needed' : ''}
                  </h3>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {selectedReport.people_affected ?? 'Population not provided'} people · {selectedReport.urgency} · {selectedReport.ward || selectedReport.location_name || 'Location not provided'} · {new Date(selectedReport.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10, marginBottom: 14, fontSize: 13, color: '#334155' }}>
                <div><strong>Status:</strong> {selectedReport.verification_status}</div>
                <div><strong>Location:</strong> {selectedReport.location_name || selectedReport.ward || 'Not provided'}{selectedReport.latitude != null && selectedReport.longitude != null ? ` · ${selectedReport.latitude.toFixed(4)}, ${selectedReport.longitude.toFixed(4)}` : ''}</div>
                <div><strong>Description:</strong> {selectedReport.description || 'No description provided.'}</div>
                {selectedReport.trust_score != null && <div><strong>Automated score:</strong> {selectedReport.trust_score} / 100</div>}
                {selectedReport.nearby_match && <div><strong>Nearby resource:</strong> {selectedReport.nearby_match}</div>}
                {selectedReport.evidence_url && <a href={selectedReport.evidence_url} target="_blank" rel="noreferrer">Open attached evidence</a>}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                <button
                  onClick={handleVerify}
                  disabled={isProcessing}
                  style={{
                    height: 44,
                    background: '#15803d',
                    color: '#ffffff',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 14,
                    boxShadow: '0 4px 10px rgba(21, 128, 61, 0.25)'
                  }}
                >
                  Verify and assign
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={handleRequestInfo}
                    disabled={isProcessing}
                    style={{
                      height: 40,
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1.5px solid #0f172a',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13
                    }}
                  >
                    Ask for more info
                  </button>

                  <button
                    onClick={handleMarkFalse}
                    disabled={isProcessing}
                    style={{
                      height: 40,
                      background: '#ffffff',
                      color: '#b91c1c',
                      border: '1.5px solid #b91c1c',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 13
                    }}
                  >
                    Mark as false
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
              Select a report from the queue to review verification checks and dispatch resources.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
