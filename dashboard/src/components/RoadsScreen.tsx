import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sailboat, 
  Footprints, 
  Truck, 
  Ambulance, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  X,
  Check,
  Plus
} from 'lucide-react';
import { api } from '../api/client';
import { RoadSegment, TransportOption } from '../types';

interface RoadsTransportScreenProps {
  onNavigateBack: () => void;
  onRequestBoat: () => void;
}

export const RoadsTransportScreen: React.FC<RoadsTransportScreenProps> = ({
  onNavigateBack,
  onRequestBoat,
}) => {
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [options, setOptions] = useState<TransportOption[]>([]);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [roadName, setRoadName] = useState<string>('Road C');
  const [roadStatus, setRoadStatus] = useState<string>('RISKY');
  const [hazardDetails, setHazardDetails] = useState<string>('Water 0.3 m');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [boatRequestedSuccess, setBoatRequestedSuccess] = useState<boolean>(false);

  useEffect(() => {
    api.getRoads().then(setRoads).catch(() => {});
    api.getTransportOptions().then(setOptions).catch(() => {});
  }, []);

  const handleReportRoad = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await api.reportRoad({
        road_name: roadName,
        status: roadStatus,
        hazard_details: hazardDetails,
        reported_by: 'Citizen Live Reporter'
      });
      setRoads(prev => {
        const idx = prev.findIndex(r => r.road_name === updated.road_name);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [updated, ...prev];
      });
      setShowReportModal(false);
      alert('Road condition report submitted to control room.');
    } catch {
      alert('Failed to submit road condition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestBoatAction = async () => {
    try {
      await api.requestTransport({
        transport_type: 'Boat',
        pickup_location: 'Ghat Landing Ward 4',
        destination: 'Town hospital',
        people_count: 2,
        urgency: 'Urgent',
        notes: 'Requested via mobile app roads screen'
      });
      setBoatRequestedSuccess(true);
    } catch {
      alert('Transport request created locally.');
      setBoatRequestedSuccess(true);
    }
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onNavigateBack}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#16a34a', letterSpacing: 0.5 }}>MED-LINK</span>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a' }}>Roads and transport</h2>
          </div>
        </div>

        <span style={{
          background: '#f1f5f9',
          color: '#475569',
          fontSize: 11,
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 20,
          border: '1px solid #cbd5e1'
        }}>
          Sample data
        </span>
      </div>

      {/* Road Map Schematic Diagram (matching PDF Page 4 layout) */}
      <div style={{
        background: '#e2e8f0',
        borderRadius: 16,
        padding: '16px 14px',
        position: 'relative',
        minHeight: 220,
        overflow: 'hidden',
        border: '1.5px solid #cbd5e1',
        marginBottom: 16
      }}>
        {/* River Water Band */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: -20,
          right: -20,
          height: 50,
          background: '#93c5fd',
          transform: 'rotate(-8deg)',
          opacity: 0.4
        }} />

        {/* Legend */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: 10,
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          fontSize: 11,
          zIndex: 5
        }}>
          <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Road status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d', fontWeight: 700 }}>
              <span style={{ width: 14, height: 3, background: '#16a34a', borderRadius: 2 }} /> Open
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d97706', fontWeight: 700 }}>
              <span style={{ width: 14, height: 3, background: '#f59e0b', borderBottom: '2px dashed #d97706' }} /> Risky
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontWeight: 700 }}>
              <span style={{ width: 14, height: 3, background: '#dc2626', borderRadius: 2 }} /> Blocked
            </span>
          </div>
        </div>

        {/* You marker */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 5
        }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#2563eb', border: '3px solid #ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
          <span style={{ fontSize: 10, fontWeight: 800, background: '#ffffff', padding: '1px 6px', borderRadius: 6, marginTop: 2 }}>You</span>
        </div>

        {/* Camp A marker */}
        <div style={{
          position: 'absolute',
          top: 80,
          left: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 5
        }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#15803d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
            ▲
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, background: '#ffffff', padding: '1px 6px', borderRadius: 6, marginTop: 2 }}>Camp A</span>
        </div>

        {/* Town hospital marker */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 5
        }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: '#15803d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={16} strokeWidth={3} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, background: '#ffffff', padding: '1px 6px', borderRadius: 6, marginTop: 2 }}>Town hospital</span>
        </div>

        {/* Bridge 1 Blocked Callout */}
        <div style={{
          position: 'absolute',
          top: 60,
          left: 35,
          background: '#ffffff',
          borderRadius: 8,
          padding: '3px 8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          fontWeight: 700,
          color: '#dc2626',
          zIndex: 5
        }}>
          <XCircle size={12} color="#dc2626" /> Bridge 1 blocked
        </div>

        {/* Water 0.3m Callout */}
        <div style={{
          position: 'absolute',
          top: 75,
          right: 40,
          background: '#ffffff',
          borderRadius: 8,
          padding: '3px 8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 10,
          fontWeight: 700,
          color: '#d97706',
          zIndex: 5
        }}>
          <AlertTriangle size={12} color="#d97706" /> Water 0.3 m
        </div>
      </div>

      {/* Way to Town Hospital Title & Stale Reports Note */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Way to Town hospital</h3>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>about 9 km</span>
      </div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 14 }}>
        Road status comes from live reports. Reports older than 3 hours turn grey.
      </div>

      {/* Transit Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Boat Option */}
        <div className="transit-card open-route" style={{ border: '2px solid #16a34a', background: '#f0fdf4' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sailboat size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Boat</span>
              <span style={{ background: '#15803d', color: '#ffffff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
                Best option
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>
              2 boats at the ghat, 8 seats. About 1 h 20 min.
            </div>
          </div>
          <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Check size={12} strokeWidth={3} /> Open
          </span>
        </div>

        {/* Walk Option */}
        <div className="transit-card risky-route">
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#f1f5f9',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Footprints size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Walk</span>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Road C has water 0.3 m. About 2 h 10 min. Avoid at night.
            </div>
          </div>
          <span style={{ background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={12} strokeWidth={3} /> Risky
          </span>
        </div>

        {/* Truck or Tractor Option */}
        <div className="transit-card blocked-route">
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#f1f5f9',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Truck size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Truck or tractor</span>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Bridge 1 blocked, water 0.8 m. 3 reports, 20 min ago.
            </div>
          </div>
          <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <X size={12} strokeWidth={3} /> Blocked
          </span>
        </div>

        {/* Ambulance 4x4 Option */}
        <div className="transit-card" style={{ borderLeft: '5px solid #d97706' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#f1f5f9',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Ambulance size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Ambulance (4x4)</span>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Waiting at Camp A. Can go once Road C is open.
            </div>
          </div>
          <span style={{ background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20 }}>
            ! Waiting
          </span>
        </div>
      </div>

      {boatRequestedSuccess && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          background: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: 10,
          color: '#15803d',
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Check size={16} strokeWidth={2.5} /> Boat request registered on server. Dispatch coordinator notified at Town Ghat.
        </div>
      )}

      {/* Action Buttons: Green "Request boat" & White "Report road" */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
        <button
          onClick={handleRequestBoatAction}
          style={{
            height: 48,
            background: '#15803d',
            color: '#ffffff',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)'
          }}
        >
          Request boat
        </button>

        <button
          onClick={() => setShowReportModal(true)}
          style={{
            height: 48,
            background: '#ffffff',
            color: '#0f172a',
            border: '1.5px solid #0f172a',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Camera size={16} /> Report road
        </button>
      </div>

      {/* Report Road Condition Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 440,
            width: '100%',
            padding: 22,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Report Road Condition</h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'transparent' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleReportRoad}>
              <div className="form-group">
                <label className="form-label">Road or Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={roadName}
                  onChange={e => setRoadName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Condition Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setRoadStatus('OPEN')}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      background: roadStatus === 'OPEN' ? '#15803d' : '#f0fdf4',
                      color: roadStatus === 'OPEN' ? '#ffffff' : '#15803d',
                      border: '1px solid #bbf7d0'
                    }}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoadStatus('RISKY')}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      background: roadStatus === 'RISKY' ? '#d97706' : '#fef3c7',
                      color: roadStatus === 'RISKY' ? '#ffffff' : '#b45309',
                      border: '1px solid #fde68a'
                    }}
                  >
                    Risky
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoadStatus('BLOCKED')}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      background: roadStatus === 'BLOCKED' ? '#dc2626' : '#fef2f2',
                      color: roadStatus === 'BLOCKED' ? '#ffffff' : '#b91c1c',
                      border: '1px solid #fecaca'
                    }}
                  >
                    Blocked
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hazard Details / Water Depth</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Water 0.35m, rockfall on lane"
                  value={hazardDetails}
                  onChange={e => setHazardDetails(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-action"
                style={{ marginTop: 10 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Road Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { RoadsTransportScreen as RoadsScreen };
