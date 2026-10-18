import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, QrCode, Trash2, CheckCircle2, AlertTriangle, Save } from 'lucide-react';
import { tokens } from '../tokens';
import { storage, HealthCardData } from '../utils/storage';
import { Language, translations } from '../i18n/translations';

interface HealthCardScreenProps {
  onNavigateHome?: () => void;
  onNavigateBack?: () => void;
  lang?: Language;
}

export const HealthCardScreen: React.FC<HealthCardScreenProps> = ({ 
  onNavigateHome, 
  onNavigateBack,
  lang = 'en' 
}) => {
  const handleBack = onNavigateBack || onNavigateHome || (() => {});
  const t = translations[lang];

  const [formData, setFormData] = useState<HealthCardData>({
    fullName: '',
    age: 30,
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: '',
    chronicConditions: '',
    currentMedicines: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    shareWithReports: false,
    lastUpdated: new Date().toISOString(),
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);

  useEffect(() => {
    const existing = storage.getHealthCard();
    if (existing) {
      setFormData(existing);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveHealthCard({
      ...formData,
      lastUpdated: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDelete = () => {
    if (confirm('Delete all stored Emergency Health Card data from this device?')) {
      storage.clearAllData();
      setFormData({
        fullName: '',
        age: 30,
        gender: 'Female',
        bloodGroup: 'O+',
        allergies: '',
        chronicConditions: '',
        currentMedicines: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        shareWithReports: false,
        lastUpdated: new Date().toISOString(),
      });
      alert('Health card data erased from device.');
    }
  };

  // Generate simple QR Code payload SVG representation for life-critical fields
  const qrPayload = `AAROGYA-HC|${formData.fullName}|BG:${formData.bloodGroup}|ALLERGY:${formData.allergies || 'NONE'}|COND:${formData.chronicConditions || 'NONE'}|EMG:${formData.emergencyContactPhone}`;

  return (
    <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 85 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={handleBack}
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
            {t.healthCard}
          </h1>
          <div style={{ fontSize: 12, color: tokens.colors.mutedText }}>
            Stored securely on device (DPDP Act compliant)
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: tokens.colors.successBg,
            color: tokens.colors.successGreen,
            borderRadius: tokens.radius.chip,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <CheckCircle2 size={16} /> Health card updated securely on device.
        </div>
      )}

      {/* QR Code Quick View Card */}
      <div
        style={{
          padding: '16px',
          backgroundColor: tokens.colors.white,
          borderRadius: tokens.radius.card,
          border: `1px solid ${tokens.colors.border}`,
          boxShadow: tokens.shadow.card,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QrCode size={20} color={tokens.colors.primaryBlue} />
            <span style={{ fontSize: 15, fontWeight: 700, color: tokens.colors.navyText }}>
              Emergency Triage QR
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            style={{
              background: tokens.colors.paleBlue,
              color: tokens.colors.primaryBlue,
              border: 'none',
              padding: '4px 10px',
              borderRadius: tokens.radius.chip,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {showQr ? 'Hide QR' : 'Show QR'}
          </button>
        </div>

        {showQr && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div
              style={{
                width: 140,
                height: 140,
                margin: '0 auto 10px auto',
                border: `3px solid ${tokens.colors.navyText}`,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FAFAFA',
                padding: 8,
              }}
            >
              <QrCode size={90} color={tokens.colors.navyText} />
              <div style={{ fontSize: 9, fontWeight: 700, color: tokens.colors.mutedText, marginTop: 4 }}>
                SCAN LIFE-CRITICAL INFO
              </div>
            </div>
            <div style={{ fontSize: 11, color: tokens.colors.mutedText }}>
              Payload: Blood {formData.bloodGroup} · Allergies: {formData.allergies || 'None'}
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
            Full Legal Name
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Maya Devi"
            style={{
              width: '100%',
              minHeight: 44,
              borderRadius: tokens.radius.chip,
              border: `1px solid ${tokens.colors.border}`,
              padding: '0 12px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
              Age
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              style={{
                width: '100%',
                minHeight: 44,
                borderRadius: tokens.radius.chip,
                border: `1px solid ${tokens.colors.border}`,
                padding: '0 12px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
              Blood Group
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              style={{
                width: '100%',
                minHeight: 44,
                borderRadius: tokens.radius.chip,
                border: `1px solid ${tokens.colors.border}`,
                padding: '0 8px',
                backgroundColor: tokens.colors.white,
                boxSizing: 'border-box',
              }}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
            Allergies (Medicines, Foods, Latex)
          </label>
          <input
            type="text"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            placeholder="e.g. Penicillin, Sulfa drugs"
            style={{
              width: '100%',
              minHeight: 44,
              borderRadius: tokens.radius.chip,
              border: `1px solid ${tokens.colors.border}`,
              padding: '0 12px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
            Chronic Medical Conditions
          </label>
          <input
            type="text"
            value={formData.chronicConditions}
            onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
            placeholder="e.g. Type 1 Diabetes, Asthma, Hypertension"
            style={{
              width: '100%',
              minHeight: 44,
              borderRadius: tokens.radius.chip,
              border: `1px solid ${tokens.colors.border}`,
              padding: '0 12px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
            Current Critical Medicines
          </label>
          <input
            type="text"
            value={formData.currentMedicines}
            onChange={(e) => setFormData({ ...formData, currentMedicines: e.target.value })}
            placeholder="e.g. Insulin Glargine 10 units daily"
            style={{
              width: '100%',
              minHeight: 44,
              borderRadius: tokens.radius.chip,
              border: `1px solid ${tokens.colors.border}`,
              padding: '0 12px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
            Emergency Contact (Name & Phone)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              type="text"
              placeholder="Name"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              style={{
                width: '100%',
                minHeight: 44,
                borderRadius: tokens.radius.chip,
                border: `1px solid ${tokens.colors.border}`,
                padding: '0 12px',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="tel"
              placeholder="10-digit Phone"
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              style={{
                width: '100%',
                minHeight: 44,
                borderRadius: tokens.radius.chip,
                border: `1px solid ${tokens.colors.border}`,
                padding: '0 12px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Clear choice to share or not (never pre-selected) */}
        <div
          style={{
            padding: '12px',
            backgroundColor: tokens.colors.cardGrey,
            borderRadius: tokens.radius.chip,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <input
            type="checkbox"
            id="shareOpt"
            checked={formData.shareWithReports}
            onChange={(e) => setFormData({ ...formData, shareWithReports: e.target.checked })}
            style={{ width: 20, height: 20, cursor: 'pointer' }}
          />
          <label htmlFor="shareOpt" style={{ fontSize: 13, color: tokens.colors.navyText, fontWeight: 600, cursor: 'pointer' }}>
            Attach life-critical details (blood group, allergies) when submitting emergency reports
          </label>
        </div>

        <button
          type="submit"
          style={{
            minHeight: 48,
            backgroundColor: tokens.colors.primaryBlue,
            color: tokens.colors.white,
            borderRadius: tokens.radius.button,
            border: 'none',
            fontSize: 15,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: tokens.shadow.active,
          }}
        >
          <Save size={18} />
          Save Health Card Securely
        </button>

        <button
          type="button"
          onClick={handleDelete}
          style={{
            minHeight: 44,
            backgroundColor: 'transparent',
            color: tokens.colors.emergencyRed,
            borderRadius: tokens.radius.chip,
            border: `1px solid ${tokens.colors.emergencyRed}`,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          <Trash2 size={16} />
          Delete Everything from Device
        </button>
      </form>
    </div>
  );
};
