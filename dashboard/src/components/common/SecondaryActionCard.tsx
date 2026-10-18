import React from 'react';
import { LucideIcon } from 'lucide-react';
import { tokens } from '../../tokens';

interface SecondaryActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export const SecondaryActionCard: React.FC<SecondaryActionCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => {
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
      aria-label={`${title}: ${description}`}
      style={{
        padding: '16px',
        borderRadius: tokens.radius.card,
        backgroundColor: tokens.colors.cardGrey,
        boxShadow: tokens.shadow.card,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        minHeight: 76,
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Pale blue circle container behind vector icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: tokens.colors.paleBlue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: tokens.colors.primaryBlue,
        }}
      >
        <Icon size={24} strokeWidth={2.2} />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: tokens.colors.navyText,
            lineHeight: '20px',
            marginBottom: 3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: tokens.colors.mutedText,
            lineHeight: '17px',
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};
