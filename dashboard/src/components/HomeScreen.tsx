import React from 'react';
import {
  ClipboardList,
  MapPin,
  HeartHandshake,
  Navigation,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { AppHeader } from './common/AppHeader';
import { ConnectivityBanner, ConnectivityState } from './common/ConnectivityBanner';
import { EmergencyCallCard } from './common/EmergencyCallCard';
import { PrimaryActionCard } from './common/PrimaryActionCard';
import { SecondaryActionCard } from './common/SecondaryActionCard';
import { HomeWidgets } from './common/HomeWidgets';
import { EmergencyReport } from '../types';
import { Language, translations } from '../i18n/translations';

interface HomeScreenProps {
  connectivity: ConnectivityState;
  onRetryHealth: () => void;
  onOpenReportFlow: () => void;
  onNavigate: (route: string) => void;
  alerts: any[];
  openNeedsCount: number;
  openOffersCount: number;
  blockedRoadsCount: number;
  latestReport: EmergencyReport | null;
  onOpenReportDetail: (report: EmergencyReport) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  connectivity,
  onRetryHealth,
  onOpenReportFlow,
  onNavigate,
  alerts,
  openNeedsCount,
  openOffersCount,
  blockedRoadsCount,
  latestReport,
  onOpenReportDetail,
  lang,
  onLanguageChange,
  isTtsEnabled,
  onToggleTts,
  onOpenSettings,
}) => {
  const t = translations[lang];

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 85 }}>
      {/* 1. App Header (P0) */}
      <AppHeader
        lang={lang}
        onLanguageChange={onLanguageChange}
        isTtsEnabled={isTtsEnabled}
        onToggleTts={onToggleTts}
        onOpenSettings={onOpenSettings}
      />

      {/* 2. Connectivity Banner (P0) */}
      <ConnectivityBanner
        status={connectivity}
        onRetry={onRetryHealth}
        lang={lang}
      />

      {/* 3. Emergency Call Card (P0) */}
      <EmergencyCallCard lang={lang} />

      {/* 4. Primary Action: Report Emergency (P0) */}
      <PrimaryActionCard
        onClick={onOpenReportFlow}
        lang={lang}
      />

      {/* 5. Home Widgets (P1) */}
      <HomeWidgets
        alerts={alerts}
        openNeedsCount={openNeedsCount}
        openOffersCount={openOffersCount}
        blockedRoadsCount={blockedRoadsCount}
        latestReport={latestReport}
        onOpenMapLayer={(layer) => onNavigate('map')}
        onOpenReportDetail={onOpenReportDetail}
        onStartReport={onOpenReportFlow}
        onOpenHelp={() => onNavigate('help')}
        lang={lang}
      />

      {/* 6. Six Action Cards (P0) */}
      <div
        style={{
          margin: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Card 1: My Reports */}
        <SecondaryActionCard
          icon={ClipboardList}
          title={t.myReports}
          description={t.myReportsDesc}
          onClick={() => onNavigate('reports')}
        />

        {/* Card 2: Emergency Map */}
        <SecondaryActionCard
          icon={MapPin}
          title={t.emergencyMap}
          description={t.emergencyMapDesc}
          onClick={() => onNavigate('map')}
        />

        {/* Card 3: Needs and Resources */}
        <SecondaryActionCard
          icon={HeartHandshake}
          title={t.needsAndResources}
          description={t.needsAndResourcesDesc}
          onClick={() => onNavigate('resources')}
        />

        {/* Card 4: Roads and Transport */}
        <SecondaryActionCard
          icon={Navigation}
          title={t.roadsAndTransport}
          description={t.roadsAndTransportDesc}
          onClick={() => onNavigate('roads')}
        />

        {/* Card 5: Healthcare Facilities */}
        <SecondaryActionCard
          icon={Building2}
          title={t.healthcareFacilities}
          description={t.healthcareFacilitiesDesc}
          onClick={() => onNavigate('facilities')}
        />

        {/* Card 6: Help and Information */}
        <SecondaryActionCard
          icon={HelpCircle}
          title={t.helpAndInfo}
          description={t.helpAndInfoDesc}
          onClick={() => onNavigate('help')}
        />
      </div>
    </div>
  );
};
