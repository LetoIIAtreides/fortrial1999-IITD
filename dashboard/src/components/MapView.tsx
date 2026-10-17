import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { EmergencyReport, HealthcareFacility } from '../types';

interface MapViewProps {
  reports: EmergencyReport[];
  facilities: HealthcareFacility[];
  onSelectReport: (report: EmergencyReport) => void;
  lastUpdated: Date;
}

export const MapView: React.FC<MapViewProps> = ({
  reports,
  facilities,
  onSelectReport,
  lastUpdated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Uttarakhand disaster-prone region (30.4, 79.2)
      const map = L.map(mapContainerRef.current, {
        center: [30.35, 79.15],
        zoom: 9,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // 1. Add Healthcare Facilities Pins (Blue / Green markers)
    facilities.forEach((fac) => {
      if (fac.latitude && fac.longitude) {
        const marker = L.circleMarker([fac.latitude, fac.longitude], {
          radius: 9,
          fillColor: '#2563eb',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <div style="font-weight: 700; color: #1e3a8a; font-size: 14px;">${fac.name}</div>
            <div style="font-size: 12px; color: #475569; margin: 4px 0;">${fac.facility_type}</div>
            <div style="font-size: 12px; color: #0284c7;"><strong>Capacity:</strong> ${fac.emergency_capacity}</div>
            <div style="font-size: 12px; color: #16a34a; margin-top: 4px;"><strong>Contact:</strong> ${fac.phone}</div>
          </div>
        `);
      }
    });

    // 2. Add Emergency Reports Pins (Red / Amber / Violet)
    reports.forEach((rep) => {
      if (rep.latitude && rep.longitude) {
        // Coarse location (slight privacy jitter or rounded)
        const lat = rep.latitude;
        const lng = rep.longitude;
        const isUrgent = rep.urgency === 'High';
        const color =
          rep.verification_status === 'VERIFIED'
            ? '#10b981'
            : isUrgent
            ? '#ef4444'
            : '#f59e0b';

        const marker = L.circleMarker([lat, lng], {
          radius: isUrgent ? 11 : 8,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <div style="font-weight: 700; color: #991b1b; font-size: 14px;">${rep.emergency_type}</div>
            <div style="font-size: 12px; margin: 4px 0;">Urgency: <strong>${rep.urgency}</strong></div>
            <div style="font-size: 12px; color: #475569;">Status: <strong>${rep.verification_status}</strong></div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${rep.location_name || 'Coordinates recorded'}</div>
          </div>
        `);

        marker.on('click', () => {
          onSelectReport(rep);
        });
      }
    });
  }, [reports, facilities, onSelectReport]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>
          Displaying verified regional facilities ({facilities.length}) & reported emergency hotspots ({reports.filter((r) => r.latitude).length})
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
        </div>
      </div>
      <div ref={mapContainerRef} className="map-box" />
      <div style={{ display: 'flex', gap: 18, fontSize: 12, color: '#cbd5e1', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
          <span>Operational Healthcare Facility</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span>High Urgency Incident</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span>Verified Responder Dispatched</span>
        </div>
      </div>
    </div>
  );
};
