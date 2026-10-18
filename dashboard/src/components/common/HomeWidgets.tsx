import React from 'react';
import {
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HeartPulse,
  Droplets,
  Activity,
  Baby,
  Thermometer,
  Pill,
  HelpCircle,
  Truck,
  Package,
  Check,
} from 'lucide-react';
import { BandageIcon } from './BandageIcon';
import { WidgetCard } from './WidgetCard';
import { EmergencyReport } from '../../types';
import { tokens } from '../../tokens';
import { Language, translations } from '../../i18n/translations';

interface HomeWidgetsProps {
  alerts: Array<{
    id: string;
    severity: string;
    title: string;
    area: string;
    affected_area_km2: number;
    is_estimate: boolean;
    issued_at: string;
    source: string;
  }>;
  openNeedsCount: number;
  openOffersCount: number;
  blockedRoadsCount: number;
  latestReport: EmergencyReport | null;
  onOpenMapLayer: (layer: 'needs' | 'offers' | 'roads') => void;
  onOpenReportDetail: (report: EmergencyReport) => void;
  onStartReport: () => void;
  onOpenHelp: () => void;
  lang: Language;
}

export const HomeWidgets: React.FC<HomeWidgetsProps> = ({
  alerts,
  openNeedsCount,
  openOffersCount,
  blockedRoadsCount,
  latestReport,
  onOpenMapLayer,
  onOpenReportDetail,
  onStartReport,
  onOpenHelp,
  lang,
}) => {
  const t = translations[lang];

  // Helper to render category icon
  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('bleed')) return <Droplets size={18} color="#dc2626" />;
    if (c.includes('diabet') || c.includes('insulin')) return <Activity size={18} color="#0284c7" />;
    if (c.includes('pregnan')) return <Baby size={18} color="#ec4899" />;
    if (c.includes('fever')) return <Thermometer size={18} color="#ea580c" />;
    if (c.includes('injur')) return <BandageIcon size={18} color="#b45309" />;
    if (c.includes('medicin')) return <Pill size={18} color="#8b5cf6" />;
    return <HelpCircle size={18} color="#4b5563" />;
  };

  return (
    <div style={{ margin: '0 16px' }}>
      {/* 1. Area Alert Widget */}
      {alerts && alerts.length > 0 ? (
        <WidgetCard
          title={t.areaAlerts}
          updatedMinutesAgo={3}
        >
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: tokens.radius.chip,
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span
                  style={{
                    backgroundColor: tokens.colors.emergencyRed,
                    color: tokens.colors.white,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                    letterSpacing: '0.4px',
                  }}
                >
                  {alert.severity} SEVERITY
                </span>
                <span style={{ fontSize: 11, color: tokens.colors.mutedText, fontWeight: 500 }}>
                  {alert.source}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
                {alert.title}
              </div>
              <div style={{ fontSize: 13, color: '#4B5563', marginBottom: 6 }}>
                Area: <strong>{alert.area}</strong> (~{alert.affected_area_km2} km² · <em>Estimate</em>)
              </div>
            </div>
          ))}
        </WidgetCard>
      ) : (
        <WidgetCard title={t.areaAlerts}>
          <div style={{ textAlign: 'center', padding: '10px 0', color: tokens.colors.mutedText, fontSize: 13 }}>
            {t.noActiveAlerts}
          </div>
        </WidgetCard>
      )}

      {/* 2. Nearby Now Widget (3 stat tiles) */}
      <WidgetCard
        title={t.nearbyNow}
        actionText="View Map"
        onAction={() => onOpenMapLayer('needs')}
        updatedMinutesAgo={2}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {/* Tile 1: Open Needs */}
          <button
            onClick={() => onOpenMapLayer('needs')}
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: tokens.radius.chip,
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: tokens.colors.emergencyRed }}>
              {openNeedsCount}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#991B1B', textAlign: 'center', marginTop: 2 }}>
              {t.openNeeds}
            </div>
          </button>

          {/* Tile 2: Open Offers */}
          <button
            onClick={() => onOpenMapLayer('offers')}
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: tokens.radius.chip,
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: tokens.colors.successGreen }}>
              {openOffersCount}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', textAlign: 'center', marginTop: 2 }}>
              {t.openOffers}
            </div>
          </button>

          {/* Tile 3: Risky/Blocked Roads */}
          <button
            onClick={() => onOpenMapLayer('roads')}
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: tokens.radius.chip,
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: tokens.colors.warningAmber }}>
              {blockedRoadsCount}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', textAlign: 'center', marginTop: 2 }}>
              {t.roadsBlockedOrRisky}
            </div>
          </button>
        </div>
      </WidgetCard>

      {/* 3. Your Latest Report Widget */}
      <WidgetCard title={t.yourLatestReport}>
        {latestReport ? (
          <div
            onClick={() => onOpenReportDetail(latestReport)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: tokens.colors.cardGrey,
              borderRadius: tokens.radius.chip,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: tokens.colors.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getCategoryIcon(latestReport.emergency_type)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: tokens.colors.navyText }}>
                  {latestReport.emergency_type}
                </div>
                <div style={{ fontSize: 12, color: tokens.colors.mutedText, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <span>Status: <strong>{latestReport.sync_status === 'RECEIVED_BY_SERVER' ? 'Received' : 'Pending upload'}</strong></span>
                  {latestReport.verification_status === 'VERIFIED' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: tokens.colors.successGreen, fontWeight: 700 }}>
                      · <Check size={12} strokeWidth={3} /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight size={18} color={tokens.colors.mutedText} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: tokens.colors.mutedText }}>{t.noReportsSentYet}</span>
            <button
              onClick={onStartReport}
              style={{
                backgroundColor: tokens.colors.primaryBlue,
                color: tokens.colors.white,
                border: 'none',
                borderRadius: tokens.radius.chip,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Report
            </button>
          </div>
        )}
      </WidgetCard>

      {/* 4. First Aid Tip Widget */}
      <WidgetCard
        title={t.firstAidTip}
        actionText="View Guide"
        onAction={onOpenHelp}
      >
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: tokens.radius.chip,
            padding: '12px',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
            Severe Bleeding Emergency (WHO Protocol)
          </div>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: '18px', marginBottom: 6 }}>
            Apply direct firm pressure with a clean cloth. Elevate wound above heart level. Do NOT remove soaked cloth; add more layers over it. Call 112 immediately.
          </div>
          <div style={{ fontSize: 11, color: tokens.colors.primaryBlue, fontWeight: 600 }}>
            Source: World Health Organization & Indian Red Cross Society (Reviewed: Oct 2026)
          </div>
        </div>
      </WidgetCard>
    </div>
  );
};
