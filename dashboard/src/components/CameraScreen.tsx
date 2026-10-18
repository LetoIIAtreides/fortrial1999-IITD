import React, { useState } from 'react';
import { X, Zap, MapPin, CheckCircle2 } from 'lucide-react';

interface LiveCameraScreenProps {
  onClose: () => void;
  onPhotoCaptured: (photoData: { timestamp: string; waterDepth: string; coordinates: string }) => void;
  onSendTextOnly: () => void;
  isOnline: boolean;
}

export const LiveCameraScreen: React.FC<LiveCameraScreenProps> = ({
  onClose,
  onPhotoCaptured,
  onSendTextOnly,
  isOnline,
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'video' | 'sweep'>('photo');
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      onPhotoCaptured({
        timestamp: '18 Oct 2026 · 09:14 · Ward 4',
        waterDepth: '~1.2 m (low confidence)',
        coordinates: '30.5564 N, 79.5662 E',
      });
    }, 400);
  };

  return (
    <div className="camera-screen-box">
      {/* Top Bar: Close [X], LIVE CAMERA badge, Flash */}
      <div className="camera-top-bar">
        <button
          onClick={onClose}
          style={{
            background: 'rgba(30, 41, 59, 0.8)',
            color: '#ffffff',
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>

        <div className="live-badge">
          <span className="live-record-dot" />
          <span>LIVE CAMERA</span>
        </div>

        <button
          onClick={() => setFlashOn(!flashOn)}
          style={{
            background: flashOn ? '#eab308' : 'rgba(30, 41, 59, 0.8)',
            color: flashOn ? '#0f172a' : '#ffffff',
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={18} />
        </button>
      </div>

      {/* GPS Locked Overlay Card */}
      <div style={{
        margin: '12px 18px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: 14,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 10,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <MapPin size={18} color="#22c55e" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
            GPS locked · within 8 m
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            30.5564 N, 79.5662 E (Chamoli Sector)
          </div>
          <div style={{ fontSize: 11, color: '#cbd5e1' }}>
            18 Oct 2026 · 09:14 · Ward 4
          </div>
        </div>
      </div>

      {/* Viewfinder with Waterline & Depth Estimate */}
      <div className="camera-viewfinder">
        {/* House / Building Silhouette scale reference */}
        <div style={{
          width: 170,
          height: 140,
          border: '2px dashed #f59e0b',
          borderRadius: 8,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(245, 158, 11, 0.05)',
        }}>
          {/* Depth badge above structure */}
          <div style={{
            position: 'absolute',
            top: -16,
            background: '#eab308',
            color: '#0f172a',
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 10px',
            borderRadius: 6,
            whiteSpace: 'nowrap'
          }}>
            Water depth ~1.2 m (low confidence)
          </div>

          <div style={{ fontSize: 44, opacity: 0.8 }}>🏠</div>
        </div>

        {/* Dashed Estimated Waterline */}
        <div className="waterline-guide">
          <span className="waterline-label">estimated waterline</span>
        </div>

        {/* Tip Box */}
        <div style={{
          position: 'absolute',
          bottom: 14,
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '8px 14px',
          borderRadius: 10,
          fontSize: 11,
          color: '#e2e8f0',
          maxWidth: '85%',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          Tip: keep a door, pole or person in frame. It gives scale for the depth estimate.
        </div>
      </div>

      {/* Controls Panel */}
      <div className="camera-controls-panel">
        {/* Mode Tabs */}
        <div className="camera-mode-tabs">
          <span 
            className={`camera-mode-tab ${activeTab === 'photo' ? 'active' : ''}`}
            onClick={() => setActiveTab('photo')}
          >
            Photo
          </span>
          <span 
            className="camera-mode-tab" 
            style={{ opacity: 0.4, cursor: 'not-allowed' }}
            title="Video mode unavailable"
          >
            Video
          </span>
          <span 
            className="camera-mode-tab" 
            style={{ opacity: 0.4, cursor: 'not-allowed' }}
            title="Area sweep mode requires specialized sensor"
          >
            Area sweep
          </span>
        </div>

        {/* Shutter Circle Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 20px' }}>
          <button 
            onClick={onSendTextOnly}
            style={{
              background: 'transparent',
              color: '#94a3b8',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'underline'
            }}
          >
            Send text only
          </button>

          <div 
            className="shutter-btn-outer"
            onClick={handleCapture}
            style={{ transform: isCapturing ? 'scale(0.92)' : 'none' }}
          >
            <div className="shutter-btn-inner" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isOnline ? '#22c55e' : '#ef4444' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#22c55e' : '#ef4444' }} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Disclaimers per prompt instructions */}
        <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', lineHeight: 1.4, padding: '0 10px' }}>
          Camera only. Gallery photos are not accepted, so old pictures cannot be reused.<br />
          AI estimates depth and area from the photo and nearby reports. A responder confirms.
        </div>
      </div>
    </div>
  );
};
