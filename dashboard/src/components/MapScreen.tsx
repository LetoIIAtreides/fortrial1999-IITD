import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  HeartHandshake, 
  Info,
  Droplet,
  Pill,
  User,
  Activity,
  Truck,
  Compass,
  Navigation
} from 'lucide-react';
import L from 'leaflet';
import { EmergencyReport } from '../types';

interface EmergencyMapScreenProps {
  reports: EmergencyReport[];
  isOnline: boolean;
  onNavigate: (screen: any) => void;
  onSelectReportForDetails: (report: EmergencyReport) => void;
  onOfferHelp: (report: EmergencyReport) => void;
}

export const EmergencyMapScreen: React.FC<EmergencyMapScreenProps> = ({
  reports,
  isOnline,
  onNavigate,
  onSelectReportForDetails,
  onOfferHelp,
}) => {
  const [filter, setFilter] = useState<'all' | 'needs' | 'offers' | 'roads'>('all');
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const filteredReports = useMemo(() => reports.filter((report) => {
    if (filter === 'needs') return (report.report_type || 'NEED') === 'NEED';
    if (filter === 'offers') return report.report_type === 'OFFER';
    return true; // 'all' or 'roads'
  }), [filter, reports]);
  const visibleSelectedReport = filteredReports.find(
    (report) => report.report_id === selectedReport?.report_id,
  ) ?? filteredReports[0] ?? null;

  // Keep the details card on a report that belongs to the active filter.
  useEffect(() => {
    const selectionIsVisible = filteredReports.some(
      (report) => report.report_id === selectedReport?.report_id,
    );
    if (selectionIsVisible) return;

    if (filteredReports.length === 0) {
      setSelectedReport(null);
      return;
    }

    const initialInsulinNeed = !selectedReport && filter === 'all'
      ? filteredReports.find(
          (report) => report.emergency_type.toLowerCase().includes('insulin') && report.report_type === 'NEED',
        )
      : undefined;
    setSelectedReport(initialInsulinNeed || filteredReports[0]);
  }, [filter, filteredReports, selectedReport]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center at Joshimath / Chamoli disaster sector (Ward 4 / Ward 3 / Ward 5)
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([30.558, 79.567], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear report markers while keeping the base map.
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add Markers with distinct Red Circle (Need) and Green Square (Offer)
    filteredReports.forEach((rep) => {
      if (rep.latitude == null || rep.longitude == null) return;
      const lat = rep.latitude;
      const lng = rep.longitude;

      const isNeed = (rep.report_type || 'NEED') === 'NEED';
      const isVerified = rep.verification_status === 'VERIFIED';
      const isFlagged = rep.verification_status === 'FLAGGED' || !!rep.flagged_reason;

      // Status badge overlay
      let badgeHtml = '';
      if (isVerified) {
        badgeHtml = '<div class="marker-status-badge verified">✓</div>';
      } else if (isFlagged) {
        badgeHtml = '<div class="marker-status-badge flagged">!</div>';
      } else {
        badgeHtml = '<div class="marker-status-badge unverified">?</div>';
      }

      // Icon symbol based on emergency type
      let symbol = '●';
      const typeLower = (rep.emergency_type || '').toLowerCase();
      if (typeLower.includes('insulin') || typeLower.includes('water')) symbol = '💧';
      else if (typeLower.includes('medicine')) symbol = '💊';
      else if (typeLower.includes('pregnancy')) symbol = '🤰';
      else if (typeLower.includes('first aid')) symbol = '✚';
      else if (typeLower.includes('transport') || typeLower.includes('ambulance')) symbol = '🚑';
      else if (typeLower.includes('food')) symbol = '🍲';
      else symbol = isNeed ? '●' : '■';

      const markerClass = isNeed ? 'marker-need-circle' : 'marker-offer-square';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="${markerClass}">
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
  }, [reports, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', letterSpacing: 0.5 }}>MED-LINK</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Area map</h2>
          {reports.some((report) => report.report_id.startsWith('rep-demo-')) && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>
              Includes demonstration reports
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: isOnline ? '#dcfce7' : '#fef2f2',
          padding: '6px 14px',
          borderRadius: 20,
          border: `1px solid ${isOnline ? '#bbf7d0' : '#fecaca'}`
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#16a34a' : '#dc2626' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: isOnline ? '#15803d' : '#b91c1c' }}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="map-filter-pills">
        <button 
          className={`map-filter-pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`map-filter-pill ${filter === 'needs' ? 'active' : ''}`}
          onClick={() => setFilter('needs')}
        >
          Needs
        </button>
        <button 
          className={`map-filter-pill ${filter === 'offers' ? 'active' : ''}`}
          onClick={() => setFilter('offers')}
        >
          Offers
        </button>
        <button 
          className={`map-filter-pill ${filter === 'roads' ? 'active' : ''}`}
          onClick={() => {
            setFilter('roads');
            onNavigate('roads_transport');
          }}
        >
          Roads
        </button>
      </div>

      {/* Interactive Map Box */}
      <div style={{ position: 'relative', width: '100%', height: 350, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Report marker legend */}
        <div className="impact-overlay-card">
          <div style={{ fontWeight: 800, fontSize: 11, marginBottom: 4, color: '#0f172a' }}>Map markers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626' }} /> Needs
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#15803d' }} /> Offers
            </span>
          </div>
        </div>
        {reports.some((report) => report.latitude == null || report.longitude == null) && (
          <div className="heatmap-empty" style={{ bottom: 12, top: 'auto' }}>
            Reports without coordinates are not shown on this map.
          </div>
        )}
      </div>

      {/* Bottom Selected Incident Details Card */}
      {visibleSelectedReport ? (
        <div className="map-selected-card">
          <div className="map-selected-header">
            <div className={`selected-cat-icon ${(visibleSelectedReport.report_type || 'NEED') === 'NEED' ? 'need' : 'offer'}`}>
              {(visibleSelectedReport.report_type || 'NEED') === 'NEED' ? '💧' : '■'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                  {visibleSelectedReport.emergency_type} {((visibleSelectedReport.report_type || 'NEED') === 'NEED' && !visibleSelectedReport.emergency_type.toLowerCase().includes('needed')) ? 'needed' : ''}
                </h3>
                <span className={`badge-pill ${visibleSelectedReport.urgency.toLowerCase()}`}>
                  {visibleSelectedReport.urgency}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {visibleSelectedReport.location_name || visibleSelectedReport.ward || 'Location not provided'} · {new Date(visibleSelectedReport.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#f8fafc',
              border: visibleSelectedReport.verification_status === 'VERIFIED' ? '1px solid #16a34a' : '1px dashed #64748b',
              color: visibleSelectedReport.verification_status === 'VERIFIED' ? '#15803d' : '#475569'
            }}>
              {visibleSelectedReport.verification_status === 'VERIFIED' ? '✓ Verified' : visibleSelectedReport.verification_status}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0'
            }}>
              {visibleSelectedReport.ai_check_status || 'No automated assessment'}
            </span>
          </div>

          {/* Action Buttons: Green "I can help" & White "Details" */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => onOfferHelp(visibleSelectedReport)}
              style={{
                height: 44,
                background: '#15803d',
                color: '#ffffff',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
              }}
            >
              <HeartHandshake size={16} /> I can help
            </button>
            <button
              onClick={() => onSelectReportForDetails(visibleSelectedReport)}
              style={{
                height: 44,
                background: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #0f172a',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Details
            </button>
          </div>
        </div>
      ) : (
        <div className="map-selected-card" role="status">
          No {filter === 'offers' ? 'offers' : filter === 'needs' ? 'needs' : 'reports'} match this filter.
        </div>
      )}
    </div>
  );
};
