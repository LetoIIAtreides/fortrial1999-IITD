import React from 'react';
import { BellRing } from 'lucide-react';
import { tokens } from '../../tokens';
import { Language, translations } from '../../i18n/translations';

interface PrimaryActionCardProps {
  onClick: () => void;
  lang: Language;
}

export const PrimaryActionCard: React.FC<PrimaryActionCardProps> = ({ onClick, lang }) => {
  const t = translations[lang];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="Report Emergency: Request immediate medical assistance"
      style={{
        margin: '0 16px 14px 16px',
        padding: '20px 18px',
        borderRadius: tokens.radius.card,
        backgroundColor: tokens.colors.primaryBlue,
        color: tokens.colors.white,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        boxShadow: tokens.shadow.active,
        transition: 'transform 0.1s ease',
        minHeight: 88,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <BellRing size={28} color={tokens.colors.white} strokeWidth={2.2} />
      </div>

      <div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: tokens.colors.white,
            lineHeight: '24px',
            marginBottom: 4,
          }}
        >
          {t.reportEmergency}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '18px',
          }}
        >
          {t.reportEmergencyDesc}
        </div>
      </div>
    </div>
  );
};
