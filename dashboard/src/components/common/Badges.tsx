import React from 'react';
import { CheckCircle2, HelpCircle, AlertTriangle, Clock, Check, ShieldCheck } from 'lucide-react';
import { tokens } from '../../tokens';

export const ReportStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toUpperCase();
  if (s === 'LOCAL_PENDING' || s === 'SAVED_LOCAL') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          borderRadius: 6,
          backgroundColor: tokens.colors.warningBg,
          color: tokens.colors.warningAmber,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <Clock size={12} />
        Pending upload
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        backgroundColor: tokens.colors.successBg,
        color: tokens.colors.successGreen,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      <Check size={12} />
      Received by server
    </span>
  );
};

export const VerificationBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toUpperCase();
  if (s === 'VERIFIED') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          borderRadius: 6,
          backgroundColor: tokens.colors.successBg,
          color: tokens.colors.successGreen,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <CheckCircle2 size={13} />
        Verified
      </span>
    );
  }
  if (s === 'FLAGGED' || s === 'REJECTED') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          borderRadius: 6,
          backgroundColor: tokens.colors.palePink,
          color: tokens.colors.emergencyRed,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <AlertTriangle size={13} />
        Flagged / Needs Review
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        backgroundColor: tokens.colors.cardGrey,
        color: tokens.colors.mutedText,
        fontSize: 12,
        fontWeight: 600,
        border: `1px dashed ${tokens.colors.border}`,
      }}
    >
      <HelpCircle size={13} />
      Unverified
    </span>
  );
};

export const TrustBadge: React.FC<{ score?: number; label?: string }> = ({ score, label }) => {
  let displayLabel = label || 'Needs review';
  let color = tokens.colors.warningAmber;
  let bg = tokens.colors.warningBg;

  if (score !== undefined) {
    if (score >= 70) {
      displayLabel = 'Likely genuine';
      color = tokens.colors.successGreen;
      bg = tokens.colors.successBg;
    } else if (score < 40) {
      displayLabel = 'Low confidence';
      color = tokens.colors.emergencyRed;
      bg = tokens.colors.palePink;
    }
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        backgroundColor: bg,
        color: color,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      <ShieldCheck size={13} />
      {displayLabel} {score !== undefined ? `(${score})` : ''}
    </span>
  );
};

export const DemoBadge: React.FC = () => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: '#7C3AED',
        color: tokens.colors.white,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.4px',
      }}
    >
      DEMO
    </span>
  );
};
