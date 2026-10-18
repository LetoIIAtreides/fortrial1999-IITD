import React from 'react';
import { Home, Map as MapIcon, PlusCircle, ClipboardList, HelpCircle } from 'lucide-react';
import { tokens } from '../../tokens';
import { Language, translations } from '../../i18n/translations';

export type NavTab = 'home' | 'map' | 'report' | 'reports' | 'help';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  lang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, lang }) => {
  const t = translations[lang];

  return (
    <nav
      role="navigation"
      aria-label="App bottom navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 520,
        margin: '0 auto',
        height: 64,
        backgroundColor: tokens.colors.white,
        borderTop: `1px solid ${tokens.colors.border}`,
        boxShadow: tokens.shadow.bottomNav,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* 1. Home */}
      <button
        onClick={() => onSelectTab('home')}
        aria-label={t.navHome}
        style={{
          flex: 1,
          height: '100%',
          border: 'none',
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          cursor: 'pointer',
          color: currentTab === 'home' ? tokens.colors.primaryBlue : tokens.colors.mutedText,
        }}
      >
        <Home size={22} strokeWidth={currentTab === 'home' ? 2.4 : 1.8} />
        <span style={{ fontSize: 11, fontWeight: currentTab === 'home' ? 700 : 500 }}>
          {t.navHome}
        </span>
      </button>

      {/* 2. Map */}
      <button
        onClick={() => onSelectTab('map')}
        aria-label={t.navMap}
        style={{
          flex: 1,
          height: '100%',
          border: 'none',
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          cursor: 'pointer',
          color: currentTab === 'map' ? tokens.colors.primaryBlue : tokens.colors.mutedText,
        }}
      >
        <MapIcon size={22} strokeWidth={currentTab === 'map' ? 2.4 : 1.8} />
        <span style={{ fontSize: 11, fontWeight: currentTab === 'map' ? 700 : 500 }}>
          {t.navMap}
        </span>
      </button>

      {/* 3. Report - Raised Center Button */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => onSelectTab('report')}
          aria-label={t.navReport}
          title={t.reportEmergency}
          style={{
            width: 48,
            height: 48,
            borderRadius: tokens.radius.full,
            backgroundColor: tokens.colors.primaryBlue,
            color: tokens.colors.white,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(30,91,216,0.38)',
            cursor: 'pointer',
            transform: 'translateY(-6px)',
          }}
        >
          <PlusCircle size={28} strokeWidth={2.4} />
        </button>
      </div>

      {/* 4. My Reports */}
      <button
        onClick={() => onSelectTab('reports')}
        aria-label={t.navReports}
        style={{
          flex: 1,
          height: '100%',
          border: 'none',
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          cursor: 'pointer',
          color: currentTab === 'reports' ? tokens.colors.primaryBlue : tokens.colors.mutedText,
        }}
      >
        <ClipboardList size={22} strokeWidth={currentTab === 'reports' ? 2.4 : 1.8} />
        <span style={{ fontSize: 11, fontWeight: currentTab === 'reports' ? 700 : 500 }}>
          {t.navReports}
        </span>
      </button>

      {/* 5. Help */}
      <button
        onClick={() => onSelectTab('help')}
        aria-label={t.navHelp}
        style={{
          flex: 1,
          height: '100%',
          border: 'none',
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          cursor: 'pointer',
          color: currentTab === 'help' ? tokens.colors.primaryBlue : tokens.colors.mutedText,
        }}
      >
        <HelpCircle size={22} strokeWidth={currentTab === 'help' ? 2.4 : 1.8} />
        <span style={{ fontSize: 11, fontWeight: currentTab === 'help' ? 700 : 500 }}>
          {t.navHelp}
        </span>
      </button>
    </nav>
  );
};
