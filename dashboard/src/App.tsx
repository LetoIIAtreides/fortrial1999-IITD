import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import { EmergencyReport, HealthcareFacility, UserProfile, RoadSegment } from './types';
import { HomeScreen } from './components/HomeScreen';
import { ReportFlow } from './components/ReportFlow';
import { ReportsScreen } from './components/ReportsScreen';
import { EmergencyMapScreen } from './components/MapScreen';
import { AddNeedOfferScreen } from './components/NeedOfferScreen';
import { RoadsTransportScreen } from './components/RoadsScreen';
import { FacilitiesList } from './components/FacilityList';
import { HelpScreen } from './components/HelpScreen';
import { HealthCardScreen } from './components/HealthCardScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ResponderConsoleScreen } from './components/ConsoleScreen';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { ConnectivityState } from './components/common/ConnectivityBanner';
import { DemoBadge } from './components/common/Badges';
import { LoginModal } from './components/LoginModal';
import { ReportDetailModal } from './components/DetailModal';
import { storage } from './utils/storage';
import { isDemoMode } from './config';
import { Language } from './i18n/translations';

export type ScreenType =
  | 'home'
  | 'report'
  | 'reports'
  | 'map'
  | 'resources'
  | 'roads'
  | 'facilities'
  | 'help'
  | 'settings'
  | 'health-card'
  | 'responder';

export const App: React.FC = () => {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('home');

  // Language & TTS settings
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('aarogya_lang');
      return (saved === 'hi' ? 'hi' : 'en') as Language;
    } catch {
      return 'en';
    }
  });

  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aarogya_tts') === 'true';
    } catch {
      return false;
    }
  });

  // Connectivity: 'ONLINE' | 'CHECKING' | 'OFFLINE'
  const [connectivity, setConnectivity] = useState<ConnectivityState>('CHECKING');

  // Data states
  const [reports, setReports] = useState<EmergencyReport[]>(() => storage.getReports());
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState<boolean>(false);
  const [facilitiesError, setFacilitiesError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [openNeedsCount, setOpenNeedsCount] = useState<number>(0);
  const [openOffersCount, setOpenOffersCount] = useState<number>(0);
  const [blockedRoadsCount, setBlockedRoadsCount] = useState<number>(0);

  // Responder user session
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('aarogya_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [selectedReportForModal, setSelectedReportForModal] = useState<EmergencyReport | null>(null);

  // Language change handler
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('aarogya_lang', newLang);
    } catch {}
  };

  const handleToggleTts = () => {
    setIsTtsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aarogya_tts', String(next));
      } catch {}
      return next;
    });
  };

  // Real backend health check with 5s timeout
  const checkBackendHealth = useCallback(async () => {
    setConnectivity('CHECKING');
    try {
      await api.checkHealth();
      setConnectivity('ONLINE');
    } catch {
      setConnectivity('OFFLINE');
    }
  }, []);

  // Poll health every 30 seconds and on window visibility change
  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkBackendHealth();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkBackendHealth]);

  // Load facilities and backend data
  const loadBackendData = useCallback(async () => {
    setFacilitiesLoading(true);
    setFacilitiesError(null);
    try {
      const facs = await api.getFacilities();
      setFacilities(facs);
    } catch (err: any) {
      setFacilitiesError(err.message || 'Could not load facilities');
    } finally {
      setFacilitiesLoading(false);
    }

    try {
      const al = await api.getAlerts();
      setAlerts(al);
    } catch {}

    try {
      const res = await api.getResources();
      const needs = res.filter((r: EmergencyReport) => (r.report_type || 'NEED') === 'NEED');
      const offers = res.filter((r: EmergencyReport) => r.report_type === 'OFFER');
      setOpenNeedsCount(needs.length);
      setOpenOffersCount(offers.length);
    } catch {}

    try {
      const roads = await api.getRoads();
      const blocked = roads.filter((r: RoadSegment) => r.status === 'BLOCKED');
      setBlockedRoadsCount(blocked.length);
    } catch {}
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  // Refresh reports from local storage and backend
  const refreshReports = useCallback(async () => {
    // 1. Load local reports
    const local = storage.getReports();
    try {
      // 2. Fetch server reports if connected
      const serverResult = await api.getReports();
      const serverList = serverResult.items || [];
      // Merge: server takes precedence for synced reports
      const mergedMap = new Map<string, EmergencyReport>();
      local.forEach((r) => mergedMap.set(r.report_id, r));
      serverList.forEach((r: EmergencyReport) => mergedMap.set(r.report_id, { ...r, sync_status: 'RECEIVED_BY_SERVER' }));
      const merged = Array.from(mergedMap.values());
      setReports(merged);
    } catch {
      // Offline fallback: keep local reports honestly
      setReports(local);
    }
  }, []);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  // Navigation handlers
  const navigateTo = (screen: ScreenType) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const navigateBack = () => {
    setCurrentScreen(previousScreen === currentScreen ? 'home' : previousScreen);
    window.scrollTo(0, 0);
  };

  // BottomNav selection
  const handleNavSelect = (tab: NavTab) => {
    if (tab === 'home') navigateTo('home');
    else if (tab === 'map') navigateTo('map');
    else if (tab === 'report') navigateTo('report');
    else if (tab === 'reports') navigateTo('reports');
    else if (tab === 'help') navigateTo('help');
  };

  // Latest user report
  const latestReport = reports.length > 0 ? reports[0] : null;

  // Determine current active BottomNav tab
  const getActiveNavTab = (): NavTab => {
    if (currentScreen === 'home') return 'home';
    if (currentScreen === 'map') return 'map';
    if (currentScreen === 'report') return 'report';
    if (currentScreen === 'reports') return 'reports';
    if (currentScreen === 'help') return 'help';
    return 'home';
  };

  // Check if BottomNav should be shown
  const shouldShowBottomNav =
    currentScreen === 'home' ||
    currentScreen === 'map' ||
    currentScreen === 'reports' ||
    currentScreen === 'help';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F6F9', position: 'relative' }}>
      {/* Demo Mode Persistent Banner */}
      {isDemoMode && (
        <div
          style={{
            backgroundColor: '#FEF3C7',
            borderBottom: '1px solid #F59E0B',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 700,
            color: '#B45309',
            zIndex: 999,
          }}
        >
          <DemoBadge />
          <span>Demo data mode active — no actual emergency requests dispatched</span>
        </div>
      )}

      {/* Screen Router */}
      <main role="main">
        {currentScreen === 'home' && (
          <HomeScreen
            connectivity={connectivity}
            onRetryHealth={checkBackendHealth}
            onOpenReportFlow={() => navigateTo('report')}
            onNavigate={(route) => navigateTo(route as ScreenType)}
            alerts={alerts}
            openNeedsCount={openNeedsCount}
            openOffersCount={openOffersCount}
            blockedRoadsCount={blockedRoadsCount}
            latestReport={latestReport}
            onOpenReportDetail={(rep) => setSelectedReportForModal(rep)}
            lang={lang}
            onLanguageChange={handleLanguageChange}
            isTtsEnabled={isTtsEnabled}
            onToggleTts={handleToggleTts}
            onOpenSettings={() => navigateTo('settings')}
          />
        )}

        {currentScreen === 'report' && (
          <ReportFlow
            lang={lang}
            onNavigateHome={() => navigateTo('home')}
            onBack={() => navigateTo('home')}
            onComplete={() => {
              refreshReports();
            }}
            onNavigateToReport={() => {
              refreshReports();
              navigateTo('reports');
            }}
          />
        )}

        {currentScreen === 'reports' && (
          <ReportsScreen
            lang={lang}
            onNavigateHome={() => navigateTo('home')}
            onNavigateBack={navigateBack}
            onStartReport={() => navigateTo('report')}
          />
        )}

        {currentScreen === 'map' && (
          <EmergencyMapScreen
            reports={reports}
            isOnline={connectivity === 'ONLINE'}
            onNavigate={(screen) => navigateTo(screen)}
            onSelectReportForDetails={(rep) => setSelectedReportForModal(rep)}
            onOfferHelp={() => navigateTo('resources')}
          />
        )}

        {currentScreen === 'resources' && (
          <AddNeedOfferScreen
            onNavigateBack={() => navigateTo('home')}
            initialMode="NEED"
          />
        )}

        {currentScreen === 'roads' && (
          <RoadsTransportScreen
            onNavigateBack={() => navigateTo('home')}
            onRequestBoat={() => navigateTo('resources')}
          />
        )}

        {currentScreen === 'facilities' && (
          <FacilitiesList
            facilities={facilities}
            isLoading={facilitiesLoading}
            error={facilitiesError}
            onNavigateBack={() => navigateTo('home')}
            onSelectFacilityOnMap={() => {
              navigateTo('map');
            }}
          />
        )}

        {currentScreen === 'help' && (
          <HelpScreen
            lang={lang}
            onNavigateHome={() => navigateTo('home')}
            onNavigateBack={navigateBack}
            onOpenHealthCard={() => navigateTo('health-card')}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            lang={lang}
            onLanguageChange={handleLanguageChange}
            onNavigateHome={() => navigateTo('home')}
            onNavigateBack={navigateBack}
            onOpenHealthCard={() => navigateTo('health-card')}
            isDemoMode={isDemoMode}
          />
        )}

        {currentScreen === 'health-card' && (
          <HealthCardScreen
            lang={lang}
            onNavigateHome={() => navigateTo('home')}
            onNavigateBack={navigateBack}
          />
        )}

        {currentScreen === 'responder' && (
          <ResponderConsoleScreen
            reports={reports}
            user={user}
            onNavigateHome={() => navigateTo('home')}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {shouldShowBottomNav && (
        <BottomNav
          currentTab={getActiveNavTab()}
          onSelectTab={handleNavSelect}
          lang={lang}
        />
      )}

      {/* Responder Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            try {
              localStorage.setItem('aarogya_user', JSON.stringify(loggedInUser));
            } catch {}
          }}
        />
      )}

      {/* Report Detail Modal */}
      {selectedReportForModal && (
        <ReportDetailModal
          report={selectedReportForModal}
          user={user}
          onClose={() => setSelectedReportForModal(null)}
          onUpdated={(updated) => {
            setSelectedReportForModal(updated);
            refreshReports();
          }}
          onPromptLogin={() => setShowLoginModal(true)}
        />
      )}
    </div>
  );
};
