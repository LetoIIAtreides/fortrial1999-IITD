import React from 'react';
import { AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { tokens } from '../../tokens';

interface UrgencyChipsProps {
  selectedUrgency: string;
  onSelect: (urgency: string) => void;
}

export const UrgencyChips: React.FC<UrgencyChipsProps> = ({ selectedUrgency, onSelect }) => {
  const options = [
    { id: 'Low', label: 'Low', icon: AlertCircle, color: '#0284c7', bg: '#E0F2FE' },
    { id: 'Medium', label: 'Medium', icon: AlertTriangle, color: '#d97706', bg: '#FEF3C7' },
    { id: 'High', label: 'High', icon: ShieldAlert, color: '#dc2626', bg: '#FEE2E2' },
  ];

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map((opt) => {
        const isSelected = selectedUrgency === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: tokens.radius.chip,
              backgroundColor: isSelected ? opt.bg : tokens.colors.cardGrey,
              border: isSelected ? `2px solid ${opt.color}` : `1px solid ${tokens.colors.border}`,
              color: isSelected ? opt.color : tokens.colors.navyText,
              fontWeight: isSelected ? 800 : 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon size={16} color={isSelected ? opt.color : tokens.colors.mutedText} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
