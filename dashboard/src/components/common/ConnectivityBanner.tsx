import React from 'react';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { tokens } from '../../tokens';
import { Language, translations } from '../../i18n/translations';

export type ConnectivityState = 'ONLINE' | 'CHECKING' | 'OFFLINE';

interface ConnectivityBannerProps {
  status: ConnectivityState;
  onRetry: () => void;
  lang: Language;
}

export const ConnectivityBanner: React.FC<ConnectivityBannerProps> = ({
  status,
  onRetry,
  lang,
}) => {
  const t = translations[lang];

  if (status === 'ONLINE') {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          margin: '4px 16px 12px 16px',
          padding: '10px 16px',
          borderRadius: tokens.radius.chip,
          backgroundColor: tokens.colors.successBg,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: tokens.radius.full,
            backgroundColor: tokens.colors.successGreen,
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: tokens.colors.successGreen,
            letterSpacing: '0.1px',
          }}
        >
          {t.onlineConnected}
        </span>
      </div>
    );
  }

  if (status === 'CHECKING') {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          margin: '4px 16px 12px 16px',
          padding: '10px 16px',
          borderRadius: tokens.radius.chip,
          backgroundColor: tokens.colors.cardGrey,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: tokens.colors.mutedText,
        }}
      >
        <Loader2 size={16} className="animate-spin" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{t.checkingConnection}</span>
      </div>
    );
  }

  // OFFLINE / Server unreachable
  return (
    <div
      role="alert"
      style={{
        margin: '4px 16px 12px 16px',
        padding: '12px 16px',
        borderRadius: tokens.radius.chip,
        backgroundColor: tokens.colors.warningBg,
        border: `1px solid #FCD34D`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircle size={20} color={tokens.colors.warningAmber} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.colors.warningAmber }}>
            {t.serverUnreachable}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#78350F' }}>
            {t.savedOnPhone}
          </div>
        </div>
      </div>

      <button
        onClick={onRetry}
        style={{
          padding: '6px 14px',
          height: 38,
          borderRadius: tokens.radius.chip,
          backgroundColor: tokens.colors.white,
          border: `1px solid ${tokens.colors.warningAmber}`,
          color: tokens.colors.warningAmber,
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <RefreshCw size={14} />
        <span>{t.retry}</span>
      </button>
    </div>
  );
};
