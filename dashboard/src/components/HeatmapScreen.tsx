import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Flame,
  HeartHandshake,
  Lock,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import L from 'leaflet';
import { api } from '../api/client';
import { HeatmapCell, HeatmapResponse, UserProfile } from '../types';

type LayerMode = 'both' | 'victims' | 'rescuers' | 'gap';

interface HeatmapScreenProps {
  user: UserProfile | null;
  onNavigateHome: () => void;
  onLoginClick: () => void;
  onUserRestored?: (user: UserProfile) => void;
}

const CATEGORIES = [
  'All',
  'Pregnancy',
  'Diabetes',
  'Bleeding',
  'Fever',
  'Injury',
  'Medicine needed',
  'Insulin',
  'Medicines',
  'First aid',
  'Food',
  'Clean water',
  'Blankets',
  'Oxygen',
  'Transport',
];

export const HeatmapScreen: React.FC<HeatmapScreenProps> = ({
  user,
  onNavigateHome,
  onLoginClick,
  onUserRestored,
}) => {
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [layer, setLayer] = useState<LayerMode>('both');
  const [category, setCategory] = useState('All');
  const [urgency, setUrgency] = useState('All');
  const [hideFlagged, setHideFlagged] = useState(false);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);

  const loadHeatmap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        const token = localStorage.getItem('medlink_token');
        if (token) {
          const me = await api.getMe();
          onUserRestored?.(me);
        }
      }
      const heatmap = await api.getHeatmap({
        category: category === 'All' ? undefined : category,
        urgency: urgency === 'All' ? undefined : urgency,
        hide_flagged: hideFlagged,
        include_resolved: includeResolved,
      });
      setData(heatmap);
      setSelectedCell((prev) => heatmap.cells.find((c) => c.cell_id === prev?.cell_id) || heatmap.cells[0] || null);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Could not load heatmap');
    } finally {
      setLoading(false);
    }
  }, [category, hideFlagged, includeResolved, onUserRestored, urgency, user]);

  useEffect(() => {
    loadHeatmap();
  }, [loadHeatmap]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([30.556, 79.567], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      overlayRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }
    return () => {
      // Keep map instance across filter updates; destroy only on unmount.
    };
  }, []);

  useEffect(() => {
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay || !data) return;
    overlay.clearLayers();

    const maxVictim = Math.max(1, ...data.cells.map((c) => c.victim_people));
    const maxRescue = Math.max(1, ...data.cells.map((c) => c.rescuer_units));
    const maxGap = Math.max(1, ...data.cells.map((c) => c.supply_gap));
    const half = 0.00175;

    data.cells.forEach((cell) => {
      const showVictim = layer === 'both' || layer === 'victims' || layer === 'gap';
      const showRescue = layer === 'both' || layer === 'rescuers';
      const showGap = layer === 'gap' || (layer === 'both' && cell.supply_gap > 0);

      if (showVictim && cell.victim_people > 0) {
        L.circle([cell.latitude, cell.longitude], {
          radius: 90 + (cell.victim_people / maxVictim) * 220,
          color: '#b91c1c',
          fillColor: '#ef4444',
          fillOpacity: 0.18 + (cell.victim_people / maxVictim) * 0.45,
          weight: 1,
        }).addTo(overlay);
      }

      if (showRescue && cell.rescuer_units > 0) {
        L.circle([cell.latitude, cell.longitude], {
          radius: 70 + (cell.rescuer_units / maxRescue) * 180,
          color: '#15803d',
          fillColor: '#22c55e',
          fillOpacity: 0.16 + (cell.rescuer_units / maxRescue) * 0.4,
          weight: 1,
        }).addTo(overlay);
      }

      if (showGap && cell.supply_gap > 0) {
        L.rectangle(
          [
            [cell.latitude - half, cell.longitude - half],
            [cell.latitude + half, cell.longitude + half],
          ],
          {
            color: '#d97706',
            weight: 2,
            dashArray: cell.flagged_reports ? '4 4' : undefined,
            fillColor: '#f59e0b',
            fillOpacity: 0.08 + (cell.supply_gap / maxGap) * 0.22,
          }
        )
          .on('click', () => setSelectedCell(cell))
          .addTo(overlay);
      }

      const marker = L.circleMarker([cell.latitude, cell.longitude], {
        radius: 7,
        color: selectedCell?.cell_id === cell.cell_id ? '#ffffff' : '#0f172a',
        weight: selectedCell?.cell_id === cell.cell_id ? 3 : 1,
        fillColor: cell.supply_gap > 0 ? '#dc2626' : '#16a34a',
        fillOpacity: 0.95,
      });
      marker.on('click', () => setSelectedCell(cell));
      marker.bindTooltip(
        `${cell.victim_people} victims · ${cell.rescuer_units} rescue units · gap ${cell.supply_gap}`,
        { direction: 'top' }
      );
      marker.addTo(overlay);
    });

    data.facilities.forEach((facility) => {
      L.circleMarker([facility.latitude, facility.longitude], {
        radius: 6,
        color: '#1d4ed8',
        fillColor: '#93c5fd',
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip(facility.name, { direction: 'top' })
        .addTo(overlay);
    });
  }, [data, layer, selectedCell]);

  const priorityCells = useMemo(
    () => [...(data?.cells || [])]
      .filter((cell) => cell.victim_people > 0)
      .sort((a, b) => b.victim_people - a.victim_people)
      .slice(0, 8),
    [data]
  );

  const needsLogin = Boolean(error?.toLowerCase().includes('login') || error?.toLowerCase().includes('401'));

  return (
    <div className="heatmap-portal">
      <header className="heatmap-header">
        <div className="heatmap-header-left">
          <button className="heatmap-icon-btn" onClick={onNavigateHome} aria-label="Back to home">
            <ArrowLeft size={18} />
            Home
          </button>
          <div>
            <div className="heatmap-kicker">MED-LINK · Authorized authority portal</div>
            <h1>Victim population and location tracker</h1>
            <p>
              Track self-reported affected population by area and see where help is needed. Locations are
              grouped for privacy; this view is not a person-by-person tracker.
            </p>
          </div>
        </div>
        <div className="heatmap-header-actions">
          {data?.contains_demo_data && <span className="heatmap-chip warn">Includes demonstration reports</span>}
          <button className="heatmap-icon-btn" onClick={loadHeatmap} disabled={loading}>
            <RefreshCw size={16} />
            {loading ? 'Updating…' : 'Refresh'}
          </button>
          {!user ? (
            <button className="heatmap-primary-btn" onClick={onLoginClick}>
              <Lock size={16} /> Responder login
            </button>
          ) : (
            <span className="heatmap-chip ok">
              <ShieldCheck size={14} /> {user.full_name}
            </span>
          )}
        </div>
      </header>

      <div className="heatmap-toolbar">
        <div className="heatmap-layers" role="tablist" aria-label="Heatmap layer">
          {(
            [
              ['both', 'Victims and rescuers'],
              ['victims', 'Victims only'],
              ['rescuers', 'Rescuers only'],
              ['gap', 'Supply gap'],
            ] as Array<[LayerMode, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={layer === id}
              className={layer === id ? 'active' : ''}
              onClick={() => setLayer(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="heatmap-select">
          Emergency / supply type
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="heatmap-select">
          Urgency
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            {['All', 'Critical', 'Urgent', 'High', 'Medium', 'Low', 'Can wait'].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="heatmap-check">
          <input
            type="checkbox"
            checked={hideFlagged}
            onChange={(e) => setHideFlagged(e.target.checked)}
          />
          Hide flagged reports
        </label>
        <label className="heatmap-check">
          <input
            type="checkbox"
            checked={includeResolved}
            onChange={(e) => setIncludeResolved(e.target.checked)}
          />
          Include resolved
        </label>
      </div>

      <div className="heatmap-metrics">
        <article>
          <Users size={18} />
          <strong>{data?.victim_people_total ?? '—'}</strong>
          <span>Reported victims in located areas</span>
        </article>
        <article>
          <HeartHandshake size={18} />
          <strong>{data?.reports_with_location ?? '—'}</strong>
          <span>Reports with location</span>
        </article>
        <article>
          <Flame size={18} />
          <strong>{data?.unlocated_reports ?? '—'}</strong>
          <span>Reports without location</span>
        </article>
        <article>
          <Building2 size={18} />
          <strong>{data?.facilities.length ?? '—'}</strong>
          <span>Operational facilities on map</span>
        </article>
      </div>

      {error && (
        <div className="heatmap-banner" role="alert">
          <AlertTriangle size={18} />
          <div>
            <strong>{needsLogin ? 'Authorized responders only' : 'Heatmap unavailable'}</strong>
            <p>{error}</p>
          </div>
          {needsLogin && (
            <button className="heatmap-primary-btn" onClick={onLoginClick}>
              Sign in
            </button>
          )}
        </div>
      )}

      <div className="heatmap-body">
        <section className="heatmap-map-wrap">
          <div ref={mapContainerRef} className="heatmap-map" aria-label="Supply heatmap" />
          {loading && !data && (
            <div className="heatmap-empty" role="status">Loading reported locations…</div>
          )}
          {!loading && !error && data?.cells.length === 0 && (
            <div className="heatmap-empty">No located reports match the selected filters.</div>
          )}
          <div className="heatmap-legend" aria-label="Map legend">
            <div><span className="swatch victim" /> Victims (needs)</div>
            <div><span className="swatch rescue" /> Rescuers / offers</div>
            <div><span className="swatch gap" /> Supply gap cell</div>
            <div><span className="swatch facility" /> Healthcare facility</div>
          </div>
        </section>

        <aside className="heatmap-side">
          <h2>Population by area</h2>
          <p className="heatmap-note">
            {data?.privacy_note} Counts are community reported and may include demonstration reports. Last updated{' '}
            {data ? new Date(data.last_updated).toLocaleString() : '—'}. Grid size about{' '}
            {data?.grid_size_meters ?? 390} m.
          </p>
          {data && data.unlocated_reports > 0 && (
            <p className="heatmap-note warn">
              {data.unlocated_reports} reports have no coordinates and are not drawn. Location was not invented.
            </p>
          )}

          {priorityCells.length === 0 && (
            <p className="heatmap-note">No located victim reports match this filter.</p>
          )}

          <ul className="heatmap-priority-list">
            {priorityCells.map((cell) => (
              <li key={cell.cell_id}>
                <button
                  className={selectedCell?.cell_id === cell.cell_id ? 'active' : ''}
                  onClick={() => {
                    setSelectedCell(cell);
                    mapInstanceRef.current?.setView([cell.latitude, cell.longitude], 15);
                  }}
                >
                  <div className="priority-title">Area {cell.cell_id} · {cell.victim_people} people</div>
                  <div className="priority-meta">
                    {cell.victim_reports} reports · {cell.top_category || 'Mixed needs'} · {cell.supply_gap} supply gap
                    {cell.flagged_reports > 0 ? ` · ${cell.flagged_reports} flagged` : ''}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {selectedCell && (
            <div className="heatmap-detail">
              <h3>Selected cell</h3>
              <p>{selectedCell.recommended_action}</p>
              <ul>
                {selectedCell.categories.map((split) => (
                  <li key={split.category}>
                    <strong>{split.category}</strong>
                    <span>
                      {split.victim_people} need · {split.rescuer_units} offer · gap {split.supply_gap}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
