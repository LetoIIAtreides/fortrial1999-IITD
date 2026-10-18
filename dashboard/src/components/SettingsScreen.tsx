import React from 'react';
import { ArrowLeft, Globe, Shield, Trash2, CheckCircle2, CreditCard } from 'lucide-react';
import { tokens } from '../tokens';
import { storage } from '../utils/storage';
import { Language, translations } from '../i18n/translations';

interface SettingsScreenProps {
  onNavigateHome?: () => void;
  onNavigateBack?: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenHealthCard?: () => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: (val: boolean) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigateHome,
  onNavigateBack,
  lang,
  onLanguageChange,
  onOpenHealthCard,
  isDemoMode = false,
  onToggleDemoMode,
}) => {
  const handleBack = onNavigateBack || onNavigateHome || (() => {});
  const t = translations[lang];

  const handleClearData = () => {
    if (confirm(t.confirmClearData)) {
      storage.clearAllData();
      alert('Local reports and health card data cleared successfully.');
      handleBack();
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 85 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
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
            {t.settings}
          </h1>
          <div style={{ fontSize: 12, color: tokens.colors.mutedText }}>
            Application Preferences & Compliance
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Language Selection */}
        <div
          style={{
            padding: '16px',
            backgroundColor: tokens.colors.white,
            borderRadius: tokens.radius.card,
            border: `1px solid ${tokens.colors.border}`,
            boxShadow: tokens.shadow.card,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Globe size={20} color={tokens.colors.primaryBlue} />
            <span style={{ fontSize: 16, fontWeight: 700, color: tokens.colors.navyText }}>
              {t.language}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => onLanguageChange('en')}
              style={{
                minHeight: 46,
                borderRadius: tokens.radius.chip,
                border: lang === 'en' ? `2px solid ${tokens.colors.primaryBlue}` : `1px solid ${tokens.colors.border}`,
                backgroundColor: lang === 'en' ? tokens.colors.paleBlue : tokens.colors.cardGrey,
                color: lang === 'en' ? tokens.colors.primaryBlue : tokens.colors.navyText,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              English
            </button>

            <button
              onClick={() => onLanguageChange('hi')}
              style={{
                minHeight: 46,
                borderRadius: tokens.radius.chip,
                border: lang === 'hi' ? `2px solid ${tokens.colors.primaryBlue}` : `1px solid ${tokens.colors.border}`,
                backgroundColor: lang === 'hi' ? tokens.colors.paleBlue : tokens.colors.cardGrey,
                color: lang === 'hi' ? tokens.colors.primaryBlue : tokens.colors.navyText,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        {/* DPDP Act 2023 Privacy Notice */}
        <div
          style={{
            padding: '16px',
            backgroundColor: tokens.colors.white,
            borderRadius: tokens.radius.card,
            border: `1px solid ${tokens.colors.border}`,
            boxShadow: tokens.shadow.card,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Shield size={20} color={tokens.colors.successGreen} />
            <span style={{ fontSize: 16, fontWeight: 700, color: tokens.colors.navyText }}>
              {t.privacySummary}
            </span>
          </div>
          <p style={{ fontSize: 13, color: tokens.colors.mutedText, lineHeight: '19px', margin: 0 }}>
            {t.privacyNote}
          </p>
        </div>

        {/* Demo Mode Switch (Allowed only in development builds) */}
        <div
          style={{
            padding: '16px',
            backgroundColor: tokens.colors.white,
            borderRadius: tokens.radius.card,
            border: `1px solid ${tokens.colors.border}`,
            boxShadow: tokens.shadow.card,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: tokens.colors.navyText }}>
                Demo Data Mode
              </div>
              <div style={{ fontSize: 12, color: tokens.colors.mutedText }}>
                Load sample fixtures for demonstration
              </div>
            </div>
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => onToggleDemoMode?.(e.target.checked)}
              style={{ width: 22, height: 22, cursor: 'pointer' }}
            />
          </div>
          {isDemoMode && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>
              {t.demoModeNotice}
            </div>
          )}
        </div>

        {/* Clear Local Data Button */}
        <div
          style={{
            padding: '16px',
            backgroundColor: tokens.colors.white,
            borderRadius: tokens.radius.card,
            border: `1px solid ${tokens.colors.border}`,
            boxShadow: tokens.shadow.card,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: tokens.colors.emergencyRed, marginBottom: 6 }}>
            Erase Local Storage
          </div>
          <div style={{ fontSize: 12, color: tokens.colors.mutedText, marginBottom: 12 }}>
            Delete all pending and saved reports and health card data stored on this device.
          </div>
          <button
            onClick={handleClearData}
            style={{
              width: '100%',
              minHeight: 44,
              backgroundColor: tokens.colors.palePink,
              color: tokens.colors.emergencyRed,
              border: `1px solid ${tokens.colors.emergencyRed}`,
              borderRadius: tokens.radius.chip,
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={16} />
            <span>{t.clearData}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
