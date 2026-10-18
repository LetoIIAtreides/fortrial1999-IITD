import React from 'react';
import { AlertTriangle, PhoneCall, Ambulance } from 'lucide-react';
import { tokens } from '../../tokens';
import { config } from '../../config';
import { Language, translations } from '../../i18n/translations';

interface EmergencyCallCardProps {
  lang: Language;
}

export const EmergencyCallCard: React.FC<EmergencyCallCardProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div
      style={{
        margin: '0 16px 14px 16px',
        padding: '16px',
        borderRadius: tokens.radius.card,
        backgroundColor: tokens.colors.palePink,
        boxShadow: tokens.shadow.card,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <div style={{ color: tokens.colors.emergencyRed, marginTop: 1 }}>
          <AlertTriangle size={20} />
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: tokens.colors.emergencyRed,
            lineHeight: '19px',
          }}
        >
          {t.call112Notice}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Prominent Call 112 Button */}
        <a
          href={`tel:${config.emergencyNumbers.nationalEmergency}`}
          style={{ textDecoration: 'none' }}
          aria-label="Call National Emergency 112"
        >
          <button
            style={{
              width: '100%',
              minHeight: 48,
              borderRadius: tokens.radius.button,
              backgroundColor: tokens.colors.emergencyRed,
              color: tokens.colors.white,
              border: 'none',
              fontWeight: 700,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(217, 45, 32, 0.28)',
            }}
          >
            <PhoneCall size={20} />
            <span>{t.call112}</span>
          </button>
        </a>

        {/* Secondary Ambulance 108 Button */}
        <a
          href={`tel:${config.emergencyNumbers.ambulance}`}
          style={{ textDecoration: 'none' }}
          aria-label="Call Ambulance 108"
        >
          <button
            style={{
              width: '100%',
              minHeight: 40,
              borderRadius: tokens.radius.chip,
              backgroundColor: tokens.colors.white,
              color: tokens.colors.emergencyRed,
              border: `1.5px solid ${tokens.colors.emergencyRed}`,
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Ambulance size={17} />
            <span>{t.ambulance108}</span>
          </button>
        </a>
      </div>
    </div>
  );
};
