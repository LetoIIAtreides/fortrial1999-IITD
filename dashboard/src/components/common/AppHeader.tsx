import React from 'react';
import { ShieldAlert, Volume2, VolumeX, Settings as SettingsIcon } from 'lucide-react';
import { tokens } from '../../tokens';
import { Language } from '../../i18n/translations';

interface AppHeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  onOpenSettings: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  lang,
  onLanguageChange,
  isTtsEnabled,
  onToggleTts,
  onOpenSettings,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: tokens.colors.background,
      }}
    >
      {/* Brand & Vector Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: tokens.colors.primaryBlue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colors.white,
            boxShadow: '0 2px 8px rgba(30,91,216,0.3)',
          }}
        >
          <ShieldAlert size={26} strokeWidth={2.2} />
        </div>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: tokens.colors.navyText,
              letterSpacing: '-0.3px',
              lineHeight: '22px',
            }}
          >
            AAROGYA LINK
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: tokens.colors.primaryBlue,
              lineHeight: '14px',
            }}
          >
            Share Help. Save Lives.
          </div>
        </div>
      </div>

      {/* Header Actions: TTS toggle, Language pill, Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onToggleTts}
          title={isTtsEnabled ? 'Text-to-speech enabled' : 'Text-to-speech disabled'}
          aria-label="Toggle spoken audio read-aloud"
          style={{
            width: 38,
            height: 38,
            borderRadius: tokens.radius.chip,
            backgroundColor: isTtsEnabled ? tokens.colors.paleBlue : tokens.colors.cardGrey,
            color: isTtsEnabled ? tokens.colors.primaryBlue : tokens.colors.mutedText,
            border: `1px solid ${tokens.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isTtsEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </button>

        {/* Language selector toggle button */}
        <button
          onClick={() => onLanguageChange(lang === 'en' ? 'hi' : 'en')}
          title="Switch language (English / Hindi)"
          aria-label={`Current language ${lang.toUpperCase()}, tap to switch`}
          style={{
            minWidth: 42,
            height: 38,
            borderRadius: tokens.radius.chip,
            backgroundColor: tokens.colors.cardGrey,
            border: `1.5px solid ${tokens.colors.border}`,
            color: tokens.colors.navyText,
            fontWeight: 700,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '0 10px',
          }}
        >
          {lang === 'en' ? 'EN' : 'हिं'}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Settings and system info"
          aria-label="Open settings"
          style={{
            width: 38,
            height: 38,
            borderRadius: tokens.radius.chip,
            backgroundColor: tokens.colors.cardGrey,
            border: `1px solid ${tokens.colors.border}`,
            color: tokens.colors.navyText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <SettingsIcon size={19} />
        </button>
      </div>
    </header>
  );
};
