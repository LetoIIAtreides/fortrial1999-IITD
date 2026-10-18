import React from 'react';
import {
  Baby,
  Activity,
  Droplets,
  Thermometer,
  Pill,
  HelpCircle,
  Check,
  Volume2,
} from 'lucide-react';
import { BandageIcon } from './BandageIcon';
import { tokens } from '../../tokens';

interface EmergencyCategoryTileProps {
  id: string;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  onSpeak?: (text: string) => void;
}

export const EmergencyCategoryTile: React.FC<EmergencyCategoryTileProps> = ({
  id,
  label,
  isSelected,
  onSelect,
  onSpeak,
}) => {
  const getIcon = () => {
    switch (id) {
      case 'Pregnancy':
        return <Baby size={28} strokeWidth={2.2} color={isSelected ? tokens.colors.primaryBlue : '#ec4899'} />;
      case 'Diabetes':
        return <Activity size={28} strokeWidth={2.2} color={isSelected ? tokens.colors.primaryBlue : '#0284c7'} />;
      case 'Bleeding':
        return <Droplets size={28} strokeWidth={2.2} color={isSelected ? tokens.colors.primaryBlue : '#dc2626'} />;
      case 'Fever':
        return <Thermometer size={28} strokeWidth={2.2} color={isSelected ? tokens.colors.primaryBlue : '#ea580c'} />;
      case 'Injury':
        return <BandageIcon size={28} strokeWidth={2.2} color={isSelected ? tokens.colors.primaryBlue : '#b45309'} />;
      case 'Medicine needed':
        return <Pill size={28} strokeWidth={2.2} color={isSelected ? tokens.colors.primaryBlue : '#8b5cf6'} />;
      default:
        return <HelpCircle size={28} strokeWidth={2.2} color={isSelected ? tokens.colors.primaryBlue : '#4b5563'} />;
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`${label}${isSelected ? ' (Selected)' : ''}`}
      style={{
        position: 'relative',
        padding: '16px 12px',
        borderRadius: tokens.radius.card,
        backgroundColor: isSelected ? tokens.colors.paleBlue : tokens.colors.white,
        border: isSelected ? `2.5px solid ${tokens.colors.primaryBlue}` : `1.5px solid ${tokens.colors.border}`,
        boxShadow: isSelected ? tokens.shadow.active : tokens.shadow.card,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        minHeight: 104,
        textAlign: 'center',
      }}
    >
      {/* Selected checkmark indicator (never color alone) */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 22,
            height: 22,
            borderRadius: tokens.radius.full,
            backgroundColor: tokens.colors.primaryBlue,
            color: tokens.colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={14} strokeWidth={3} />
        </div>
      )}

      {/* Speaker button to read aloud */}
      {onSpeak && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSpeak(label);
          }}
          title={`Read "${label}" aloud`}
          aria-label={`Read ${label} aloud`}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'none',
            border: 'none',
            color: tokens.colors.mutedText,
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Volume2 size={16} />
        </button>
      )}

      {/* Icon */}
      <div style={{ marginTop: 4 }}>{getIcon()}</div>

      {/* Label */}
      <span
        style={{
          fontSize: 14,
          fontWeight: isSelected ? 700 : 600,
          color: isSelected ? tokens.colors.primaryBlue : tokens.colors.navyText,
          lineHeight: '18px',
        }}
      >
        {label}
      </span>
    </div>
  );
};
