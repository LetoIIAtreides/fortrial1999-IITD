import React from 'react';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { tokens } from '../../tokens';

interface WidgetCardProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  updatedMinutesAgo?: number;
  isStale?: boolean;
  children: React.ReactNode;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  actionText,
  onAction,
  isLoading,
  error,
  onRetry,
  updatedMinutesAgo,
  isStale,
  children,
}) => {
  return (
    <div
      style={{
        backgroundColor: tokens.colors.white,
        borderRadius: tokens.radius.card,
        padding: '16px',
        boxShadow: tokens.shadow.card,
        border: `1px solid ${tokens.colors.border}`,
        marginBottom: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: tokens.colors.navyText,
          }}
        >
          {title}
        </span>
        {actionText && onAction && (
          <button
            onClick={onAction}
            style={{
              background: 'none',
              border: 'none',
              color: tokens.colors.primaryBlue,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '2px 4px',
            }}
          >
            {actionText}
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div
          style={{
            padding: '20px 0',
            textAlign: 'center',
            color: tokens.colors.mutedText,
            fontSize: 13,
          }}
        >
          Loading data...
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: tokens.colors.warningBg,
            borderRadius: tokens.radius.chip,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} color={tokens.colors.warningAmber} />
            <span style={{ fontSize: 13, color: tokens.colors.warningAmber, fontWeight: 600 }}>
              {error}
            </span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                background: tokens.colors.white,
                border: `1px solid ${tokens.colors.warningAmber}`,
                color: tokens.colors.warningAmber,
                padding: '4px 8px',
                borderRadius: tokens.radius.chip,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} style={{ marginRight: 4, display: 'inline' }} />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && children}

      {/* Footer "Updated X min ago" */}
      {updatedMinutesAgo !== undefined && !isLoading && !error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: '10px',
            fontSize: 11,
            color: isStale ? tokens.colors.warningAmber : tokens.colors.mutedText,
            fontWeight: isStale ? 600 : 500,
          }}
        >
          <Clock size={12} />
          <span>Updated {updatedMinutesAgo} min ago</span>
          {isStale && <span style={{ color: tokens.colors.warningAmber }}>(May be out of date)</span>}
        </div>
      )}
    </div>
  );
};
