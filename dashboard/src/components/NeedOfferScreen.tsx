import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  Mic, 
  MapPin, 
  Check, 
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { api } from '../api/client';
import { EmergencyReport } from '../types';

interface AddNeedOfferScreenProps {
  initialMode?: 'NEED' | 'OFFER';
  onNavigateBack: () => void;
  onReportCreated: (newReport: EmergencyReport) => void;
  onOpenLiveCamera: () => void;
}

const CATEGORIES = [
  { id: 'Insulin', label: 'Insulin', icon: '💧' },
  { id: 'Medicines', label: 'Medicines', icon: '💊' },
  { id: 'Pregnancy', label: 'Pregnancy', icon: '🤰' },
  { id: 'First aid', label: 'First aid', icon: '✚' },
  { id: 'Clean water', label: 'Clean water', icon: '🍶' },
  { id: 'Food', label: 'Food', icon: '🍲' },
  { id: 'Blankets', label: 'Blankets', icon: '🛏️' },
  { id: 'Oxygen', label: 'Oxygen', icon: '🤿' },
  { id: 'Transport', label: 'Transport', icon: '🚐' },
];

export const AddNeedOfferScreen: React.FC<AddNeedOfferScreenProps> = ({
  initialMode = 'NEED',
  onNavigateBack,
  onReportCreated,
  onOpenLiveCamera,
}) => {
  const [reportType, setReportType] = useState<'NEED' | 'OFFER'>(initialMode);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Insulin', 'Medicines']);
  const [peopleCount, setPeopleCount] = useState<number>(3);
  const [urgency, setUrgency] = useState<'Critical' | 'Urgent' | 'Can wait'>('Urgent');
  const [hasPhoto, setHasPhoto] = useState<boolean>(false);
  const [voiceNoteRecorded, setVoiceNoteRecorded] = useState<boolean>(false);
  const [ward, setWard] = useState<string>('Ward 4');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== catId));
      }
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newId = `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const catString = selectedCategories.join(', ');
    const nowIso = new Date().toISOString();

    const payload = {
      report_id: newId,
      report_type: reportType,
      emergency_type: selectedCategories[0] || 'Insulin',
      urgency: urgency,
      ward: ward,
      people_affected: peopleCount,
      location_name: `Pinned by GPS: ${ward}`,
      latitude: 30.5564,
      longitude: 79.5662,
      description: description || `${catString} needed for ${peopleCount} people in ${ward}.`,
      evidence_type: hasPhoto ? 'photo' : (voiceNoteRecorded ? 'voice' : 'none'),
      water_depth: hasPhoto ? '~1.2 m' : null,
      created_at: nowIso,
    };

    try {
      const result = await api.createReport(payload);
      onReportCreated(result);
    } catch {
      // Local fallback if offline
      const fallbackReport: EmergencyReport = {
        ...payload,
        evidence_type: (hasPhoto ? 'photo' : (voiceNoteRecorded ? 'voice' : 'none')) as 'photo' | 'voice' | 'none',
        sync_status: 'LOCAL_PENDING',
        verification_status: 'UNVERIFIED',
        last_synced_at: nowIso,
      };
      onReportCreated(fallbackReport);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Header with back navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={onNavigateBack}
          style={{
            width: 40,
            height: 40,
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
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Add to the map</h2>
      </div>

      {/* Choice Toggle: I need help (Red) vs I can give help (Green) */}
      <div className="choice-toggle-container">
        <button
          className={`choice-toggle-btn ${reportType === 'NEED' ? 'active-need' : ''}`}
          onClick={() => setReportType('NEED')}
        >
          I need help
        </button>
        <button
          className={`choice-toggle-btn ${reportType === 'OFFER' ? 'active-offer' : ''}`}
          onClick={() => setReportType('OFFER')}
        >
          I can give help
        </button>
      </div>

      {/* Categories Header */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
          {reportType === 'NEED' ? 'What is short? Tap all that apply' : 'What can you offer? Tap all that apply'}
        </div>

        {/* 3x3 Category Grid */}
        <div className="category-chips-grid">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            const chipClass = isSelected
              ? (reportType === 'NEED' ? 'selected-need' : 'selected-offer')
              : '';

            return (
              <div
                key={cat.id}
                className={`category-chip ${chipClass}`}
                onClick={() => toggleCategory(cat.id)}
              >
                {isSelected && (
                  <div className="category-chip-check">
                    <Check size={11} strokeWidth={3} />
                  </div>
                )}
                <span className="category-chip-icon">{cat.icon}</span>
                <span className="category-chip-label">{cat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* People Affected Counter */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          {reportType === 'NEED' ? 'People affected' : 'People capacity / stock units'}
        </div>
        <div className="counter-box">
          <button 
            className="counter-btn"
            onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
          >
            <Minus size={16} />
          </button>
          <span className="counter-value">{peopleCount}</span>
          <button 
            className="counter-btn"
            onClick={() => setPeopleCount(peopleCount + 1)}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Urgency Selector */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>Urgency</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <button
            onClick={() => setUrgency('Critical')}
            style={{
              padding: '12px 6px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              background: urgency === 'Critical' ? '#b91c1c' : '#fef2f2',
              color: urgency === 'Critical' ? '#ffffff' : '#b91c1c',
              border: '1.5px solid #fecaca',
            }}
          >
            Critical
          </button>
          <button
            onClick={() => setUrgency('Urgent')}
            style={{
              padding: '12px 6px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              background: urgency === 'Urgent' ? '#0f172a' : '#f1f5f9',
              color: urgency === 'Urgent' ? '#ffffff' : '#0f172a',
              border: '1.5px solid #e2e8f0',
            }}
          >
            Urgent
          </button>
          <button
            onClick={() => setUrgency('Can wait')}
            style={{
              padding: '12px 6px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              background: urgency === 'Can wait' ? '#15803d' : '#f0fdf4',
              color: urgency === 'Can wait' ? '#ffffff' : '#15803d',
              border: '1.5px solid #bbf7d0',
            }}
          >
            Can wait
          </button>
        </div>
      </div>

      {/* Live Photo & Voice Note Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
        <button
          onClick={onOpenLiveCamera}
          style={{
            height: 48,
            background: hasPhoto ? '#ecfdf5' : '#ffffff',
            border: hasPhoto ? '2px solid #16a34a' : '1.5px solid #0f172a',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 700,
            fontSize: 13,
            color: '#0f172a'
          }}
        >
          <Camera size={18} /> {hasPhoto ? 'Photo Attached' : 'Live photo'}
        </button>

        <button
          onClick={() => setVoiceNoteRecorded(!voiceNoteRecorded)}
          style={{
            height: 48,
            background: voiceNoteRecorded ? '#ecfdf5' : '#ffffff',
            border: voiceNoteRecorded ? '2px solid #16a34a' : '1.5px solid #0f172a',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 700,
            fontSize: 13,
            color: '#0f172a'
          }}
        >
          <Mic size={18} /> {voiceNoteRecorded ? 'Voice Attached' : 'Voice note'}
        </button>
      </div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' }}>
        Voice is turned into text for responders. Text only is fine too.
      </div>

      {/* Pinned by GPS Card */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: 14,
        padding: '14px 16px',
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={20} color="#16a34a" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Pinned by GPS: {ward}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Exact spot is shown only to verified responders</div>
          </div>
        </div>
        <button
          onClick={() => {
            const nextWard = ward === 'Ward 4' ? 'Ward 3' : (ward === 'Ward 3' ? 'Ward 5' : 'Ward 4');
            setWard(nextWard);
          }}
          style={{
            background: 'transparent',
            color: '#15803d',
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          Move
        </button>
      </div>

      {/* Submit Button: Red "Send need" or Green "Send offer" */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={reportType === 'NEED' ? 'btn-send-need' : 'btn-send-offer'}
      >
        {isSubmitting ? 'Sending...' : (reportType === 'NEED' ? 'Send need' : 'Send offer')}
      </button>

      {/* Disclaimer */}
      <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
        Every report is checked before it is marked verified. Repeated false reports can get a device blocked.
      </div>
    </div>
  );
};
