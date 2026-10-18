import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  PhoneCall,
  HeartPulse,
  ExternalLink,
  ShieldCheck,
  Ambulance,
  Droplets,
  Activity,
  Baby,
  Thermometer,
  CreditCard,
} from 'lucide-react';
import { BandageIcon } from './common/BandageIcon';
import { tokens } from '../tokens';
import { config } from '../config';
import { Language, translations } from '../i18n/translations';

interface HelpScreenProps {
  onNavigateHome?: () => void;
  onNavigateBack?: () => void;
  onOpenHealthCard?: () => void;
  lang: Language;
}

interface FirstAidTopic {
  id: string;
  title: string;
  icon: any;
  color: string;
  source: string;
  sourceUrl: string;
  lastReviewed: string;
  whenToCall112: string;
  steps: string[];
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ 
  onNavigateHome, 
  onNavigateBack, 
  onOpenHealthCard, 
  lang 
}) => {
  const t = translations[lang];
  const [expandedId, setExpandedId] = useState<string | null>('bleeding');

  const topics: FirstAidTopic[] = [
    {
      id: 'bleeding',
      title: lang === 'hi' ? 'गंभीर रक्तस्राव (Severe Bleeding)' : 'Severe Bleeding',
      icon: Droplets,
      color: '#dc2626',
      source: 'World Health Organization (WHO) & International Federation of Red Cross (IFRC)',
      sourceUrl: 'https://www.who.int/emergencies',
      lastReviewed: 'October 2026',
      whenToCall112: 'Blood spurting, bleeding does not stop after 5 minutes of direct pressure, or person feels faint/pale.',
      steps: [
        'Apply firm, continuous direct pressure on the wound using a clean cloth or sterile dressing.',
        'Keep the injured limb elevated above heart level if no fracture is suspected.',
        'Do NOT remove any dressing that has soaked through with blood; apply another clean layer directly over it.',
        'Help the casualty lie down flat to prevent fainting and shock; keep them warm.',
        'If an object is embedded in the wound, do not remove it; press firmly around its sides.',
      ],
    },
    {
      id: 'fever',
      title: lang === 'hi' ? 'तेज़ बुखार और संक्रामक रोग (High Fever)' : 'High Fever & Inundation Infection',
      icon: Thermometer,
      color: '#ea580c',
      source: 'Ministry of Health and Family Welfare (MoHFW) India & WHO Triage',
      sourceUrl: 'https://www.mohfw.gov.in',
      lastReviewed: 'October 2026',
      whenToCall112: 'Temperature over 104°F (40°C), stiff neck, confusion, seizure, or accompanied by breathing difficulty.',
      steps: [
        'Sponge forehead, neck, and armpits with clean lukewarm water (never ice water).',
        'Offer clean boiled water or Oral Rehydration Salts (ORS) frequently in small sips to avoid dehydration.',
        'Do not over-bundle with heavy blankets; use light cotton clothing.',
        'Avoid self-administering unverified prescription antibiotics without medical consultation.',
      ],
    },
    {
      id: 'diabetes',
      title: lang === 'hi' ? 'मधुमेह आपातकाल (Diabetes & Insulin Shortage)' : 'Diabetes & Low Blood Sugar Emergency',
      icon: Activity,
      color: '#0284c7',
      source: 'National Health Mission (NHM) & International Diabetes Federation (IDF)',
      sourceUrl: 'https://nhm.gov.in',
      lastReviewed: 'October 2026',
      whenToCall112: 'Person is unconscious, unable to swallow, having seizures, or unresponsive.',
      steps: [
        'If conscious and shaky/sweating (hypoglycemia): give 15 grams of fast-acting sugar (e.g. 3 teaspoons sugar in water, sweet fruit juice).',
        'Wait 15 minutes. If symptoms persist, repeat sugar dose once.',
        'Do NOT attempt to inject insulin if blood sugar cannot be tested and person is confused or unconscious.',
        'Report immediate insulin need via AAROGYA LINK to locate nearby relief camps with operational cold-chain storage.',
      ],
    },
    {
      id: 'pregnancy',
      title: lang === 'hi' ? 'गर्भावस्था और प्रसव आपातकाल (Pregnancy & Labor)' : 'Pregnancy & Labor Emergency',
      icon: Baby,
      color: '#ec4899',
      source: 'MoHFW Maternal Health Division & Janani Shishu Suraksha Karyakram (JSSK)',
      sourceUrl: 'https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=822&lid=219',
      lastReviewed: 'October 2026',
      whenToCall112: 'Severe vaginal bleeding, convulsions, blurred vision, water broken with green/brown fluid, or contractions under 3 minutes apart.',
      steps: [
        'Have the expectant mother lie on her left side to maximize blood and oxygen flow to the baby.',
        'Keep clean towels, boiled lukewarm water, and sterile cloths ready in a warm, clean area.',
        'Support gentle slow breathing; reassure the mother and keep unauthorized onlookers away.',
        'Coordinate emergency transport via 108 / 112 or request community boat/4x4 transport via AAROGYA LINK.',
      ],
    },
    {
      id: 'injury',
      title: lang === 'hi' ? 'चोट, मोच और फ्रैक्चर (Injuries & Fractures)' : 'Fractures & Disaster Trauma Injuries',
      icon: BandageIcon,
      color: '#b45309',
      source: 'Indian Red Cross Society First Aid Manual & NDMA Protocols',
      sourceUrl: 'https://www.indianredcross.org',
      lastReviewed: 'October 2026',
      whenToCall112: 'Bone piercing the skin (compound fracture), severe head or spinal trauma, numbness in limbs.',
      steps: [
        'Immobilize the injured part in the position found; do NOT attempt to straighten or realign broken bones.',
        'Support with a padded splint (rolled newspaper, umbrella, or stick) wrapped securely above and below the joint.',
        'Apply an ice pack or cold compress wrapped in cloth to reduce swelling (max 15 mins at a time).',
        'Keep casualty calm and still until medical evacuation arrives.',
      ],
    },
  ];

  return (
    <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 85 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={onNavigateBack || onNavigateHome}
          aria-label="Back"
          style={{
            width: 40,
            height: 40,
            borderRadius: tokens.radius.chip,
            border: `1px solid ${tokens.colors.border}`,
            backgroundColor: tokens.colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} color={tokens.colors.navyText} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: tokens.colors.navyText, margin: 0 }}>
            {t.helpAndInfo}
          </h1>
          <div style={{ fontSize: 12, color: tokens.colors.mutedText }}>
            Standard First Aid & Emergency Helplines
          </div>
        </div>
      </div>

      {/* General Disclaimer */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: tokens.radius.card,
          marginBottom: 16,
          fontSize: 13,
          color: '#1E40AF',
          lineHeight: '18px',
        }}
      >
        <strong>Notice:</strong> General guidance, not a substitute for formal medical care. If life is in danger, call 112 or 108 immediately.
      </div>

      {/* Emergency Contacts Card */}
      <div
        style={{
          backgroundColor: tokens.colors.palePink,
          borderRadius: tokens.radius.card,
          padding: '16px',
          marginBottom: 16,
          boxShadow: tokens.shadow.card,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, color: tokens.colors.emergencyRed, marginBottom: 10 }}>
          National & Regional Helplines
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <a href={`tel:${config.emergencyNumbers.nationalEmergency}`} style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%',
                padding: '12px 8px',
                backgroundColor: tokens.colors.emergencyRed,
                color: tokens.colors.white,
                borderRadius: tokens.radius.chip,
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <PhoneCall size={16} />
              <span>Call 112</span>
            </button>
          </a>

          <a href={`tel:${config.emergencyNumbers.ambulance}`} style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%',
                padding: '12px 8px',
                backgroundColor: tokens.colors.white,
                color: tokens.colors.emergencyRed,
                border: `1.5px solid ${tokens.colors.emergencyRed}`,
                borderRadius: tokens.radius.chip,
                fontWeight: 700,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Ambulance size={16} />
              <span>Ambulance 108</span>
            </button>
          </a>
        </div>
      </div>

      {/* First Aid Expandable Topics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {topics.map((topic) => {
          const isExpanded = expandedId === topic.id;
          const Icon = topic.icon;

          return (
            <div
              key={topic.id}
              style={{
                backgroundColor: tokens.colors.white,
                borderRadius: tokens.radius.card,
                border: `1px solid ${tokens.colors.border}`,
                boxShadow: tokens.shadow.card,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                aria-expanded={isExpanded}
                style={{
                  width: '100%',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: tokens.colors.paleBlue,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: topic.color,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: tokens.colors.navyText }}>
                    {topic.title}
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={20} color={tokens.colors.mutedText} /> : <ChevronDown size={20} color={tokens.colors.mutedText} />}
              </button>

              {isExpanded && (
                <div style={{ padding: '0 16px 16px 16px', borderTop: `1px solid ${tokens.colors.border}`, paddingTop: 14 }}>
                  {/* When to call 112 */}
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: tokens.colors.palePink,
                      borderRadius: tokens.radius.chip,
                      marginBottom: 12,
                      fontSize: 13,
                      color: tokens.colors.emergencyRed,
                      lineHeight: '18px',
                    }}
                  >
                    <strong>When to Call 112:</strong> {topic.whenToCall112}
                  </div>

                  {/* Steps */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 8 }}>
                    First Aid Action Steps:
                  </div>
                  <ol style={{ paddingLeft: 20, margin: '0 0 14px 0', fontSize: 13, color: '#334155', lineHeight: '20px' }}>
                    {topic.steps.map((st, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>
                        {st}
                      </li>
                    ))}
                  </ol>

                  {/* Source & review date */}
                  <div style={{ fontSize: 11, color: tokens.colors.mutedText, borderTop: `1px solid ${tokens.colors.border}`, paddingTop: 8 }}>
                    Source: {topic.source} (Reviewed: {topic.lastReviewed})
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
