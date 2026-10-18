import React, { useState, useEffect, useRef } from 'react';
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
  Navigation,
  Check,
  Package
} from 'lucide-react';
import L from 'leaflet';
import { EmergencyReport } from '../types';

interface EmergencyMapScreenProps {
  reports: EmergencyReport[];
  isOnline: boolean;
  onNavigate: (screen: any) => void;
  onSelectReportForDetails: (report: EmergencyReport) => void;
  onOfferHelp?: (report: EmergencyReport) => void;
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

  // Set default selected report to Insulin needed or first report
  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      const insulinNeed = reports.find(r => r.emergency_type.toLowerCase().includes('insulin') && r.report_type === 'NEED');
      setSelectedReport(insulinNeed || reports[0]);
    }
  }, [reports, selectedReport]);

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

      // Add High Impact Probability Zone (Reddish concentric circle ~2.4 km²)
      L.circle([30.556, 79.567], {
        radius: 600,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.35,
        weight: 1.5,
      }).addTo(map);

      // Medium Zone (Amber)
      L.circle([30.556, 79.567], {
        radius: 1100,
        color: '#f59e0b',
        fillColor: '#fbbf24',
        fillOpacity: 0.18,
        weight: 1,
      }).addTo(map);

      // Outer Low Zone (Light dashed blue/green)
      L.circle([30.556, 79.567], {
        radius: 1700,
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '5, 8',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing report markers (keep base tile & zones)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Filter reports based on active tab
    const filteredReports = reports.filter((r) => {
      if (filter === 'needs') return (r.report_type || 'NEED') === 'NEED';
      if (filter === 'offers') return r.report_type === 'OFFER';
      return true; // 'all' or 'roads'
    });

    // Add Markers with distinct Red Circle (Need) and Green Square (Offer)
    filteredReports.forEach((rep) => {
      const lat = rep.latitude || (30.556 + (Math.random() - 0.5) * 0.015);
      const lng = rep.longitude || (79.567 + (Math.random() - 0.5) * 0.015);

      const isNeed = (rep.report_type || 'NEED') === 'NEED';
      const isVerified = rep.verification_status === 'VERIFIED';
      const isFlagged = rep.verification_status === 'FLAGGED' || !!rep.flagged_reason;

      // Status badge overlay
      let badgeHtml = '';
      if (isVerified) {
        badgeHtml = '<div class="marker-status-badge verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></div>';
      } else if (isFlagged) {
        badgeHtml = '<div class="marker-status-badge flagged"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>';
      } else {
        badgeHtml = '<div class="marker-status-badge unverified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg></div>';
      }

      // Vector SVG icon symbol based on emergency type
      const typeLower = (rep.emergency_type || '').toLowerCase();
      let iconSvg = '';
      if (typeLower.includes('bleed') || typeLower.includes('water') || typeLower.includes('insulin')) {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
      } else if (typeLower.includes('medicine')) {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>';
      } else if (typeLower.includes('pregnan')) {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>';
      } else if (typeLower.includes('first aid')) {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>';
      } else if (typeLower.includes('transport') || typeLower.includes('ambulance')) {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>';
      } else {
        iconSvg = isNeed
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="12" r="10"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
      }

      const markerClass = isNeed ? 'marker-need-circle' : 'marker-offer-square';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="${markerClass}">
            <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">${iconSvg}</div>
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

        {/* Impact Probability Legend */}
        <div className="impact-overlay-card">
          <div style={{ fontWeight: 800, fontSize: 11, marginBottom: 4, color: '#0f172a' }}>Impact probability</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#dc2626' }} /> High
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b' }} /> Medium
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#334155' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#eab308' }} /> Low
            </span>
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, borderTop: '1px solid #f1f5f9', paddingTop: 3 }}>
            ● Circle = need<br />■ Square = offer
          </div>
        </div>

        {/* Affected Area Indicator */}
        <div className="affected-area-badge">
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Estimated affected area</div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>~2.4 km²</div>
          <div style={{ fontSize: 9, color: '#94a3b8' }}>AI estimate. Sample data.</div>
        </div>
      </div>

      {/* Bottom Selected Incident Details Card */}
      {selectedReport && (
        <div className="map-selected-card">
          <div className="map-selected-header">
            <div className={`selected-cat-icon ${(selectedReport.report_type || 'NEED') === 'NEED' ? 'need' : 'offer'}`}>
              {(selectedReport.report_type || 'NEED') === 'NEED' ? <Droplet size={18} /> : <Package size={18} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                  {selectedReport.emergency_type} {((selectedReport.report_type || 'NEED') === 'NEED' && !selectedReport.emergency_type.toLowerCase().includes('needed')) ? 'needed' : ''}
                </h3>
                <span className={`badge-pill ${selectedReport.urgency.toLowerCase()}`}>
                  {selectedReport.urgency}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {selectedReport.location_name || `${selectedReport.ward || 'Ward 4'} · 3 reports within 200 m · 1 live photo`}
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
              border: selectedReport.verification_status === 'VERIFIED' ? '1px solid #16a34a' : '1px dashed #64748b',
              color: selectedReport.verification_status === 'VERIFIED' ? '#15803d' : '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              {selectedReport.verification_status === 'VERIFIED' ? (
                <>
                  <Check size={12} strokeWidth={3} /> Verified
                </>
              ) : (
                <>
                  <HelpCircle size={12} /> Unverified
                </>
              )}
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
              {selectedReport.ai_check_status || 'AI check: likely genuine'}
            </span>
          </div>

          {/* Action Buttons: Green "I can help" & White "Details" */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => onOfferHelp?.(selectedReport)}
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
              onClick={() => onSelectReportForDetails(selectedReport)}
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
      )}
    </div>
  );
};
