import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  MapPin,
  Check,
  AlertCircle,
  Plus,
  Minus,
  PlusCircle,
  Clock,
  Sparkles,
  Activity,
  Pill,
  Baby,
  PlusSquare,
  Droplets,
  Utensils,
  Bed,
  Wind,
  Truck,
  Tent,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { tokens } from '../tokens';
import { api } from '../api/client';
import { EmergencyReport } from '../types';
import { storage } from '../utils/storage';
import { VerificationBadge, ReportStatusBadge } from './common/Badges';
import { Language, translations } from '../i18n/translations';

interface NeedOfferScreenProps {
  initialMode?: 'NEED' | 'OFFER';
  onNavigateBack: () => void;
  onOpenLiveCamera?: () => void;
  lang?: Language;
}

const RESOURCE_ITEMS = [
  { id: 'Insulin', label: 'Insulin', icon: Activity, color: '#0284c7' },
  { id: 'Medicines', label: 'Medicines', icon: Pill, color: '#8b5cf6' },
  { id: 'Pregnancy care', label: 'Pregnancy care', icon: Baby, color: '#ec4899' },
  { id: 'First aid supplies', label: 'First aid supplies', icon: PlusSquare, color: '#16a34a' },
  { id: 'Clean water', label: 'Clean water', icon: Droplets, color: '#0284c7' },
  { id: 'Food', label: 'Food', icon: Utensils, color: '#ea580c' },
  { id: 'Blankets', label: 'Blankets', icon: Bed, color: '#6366f1' },
  { id: 'Oxygen', label: 'Oxygen', icon: Wind, color: '#06b6d4' },
  { id: 'Transport', label: 'Transport', icon: Truck, color: '#4b5563' },
  { id: 'Shelter', label: 'Shelter', icon: Tent, color: '#d97706' },
];

export const NeedOfferScreen: React.FC<NeedOfferScreenProps> = ({
  initialMode = 'NEED',
  onNavigateBack,
  lang = 'en',
}) => {
  const t = translations[lang];

  // Tabs: 'needs' | 'offers' | 'my_posts' | 'create_new'
  const [activeTab, setActiveTab] = useState<'needs' | 'offers' | 'my_posts' | 'create_new'>(
    'needs'
  );

  // Form State for creating need/offer
  const [postKind, setPostKind] = useState<'NEED' | 'OFFER'>(initialMode);
  const [selectedItem, setSelectedItem] = useState<string>('Insulin');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('vials');
  const [urgency, setUrgency] = useState<string>('Urgent');
  const [peopleAffected, setPeopleAffected] = useState<number>(1);
  const [availableUntil, setAvailableUntil] = useState<string>('24 hours');
  const [locationName, setLocationName] = useState<string>('Ward 4 Relief Station');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Data lists
  const [resources, setResources] = useState<EmergencyReport[]>([]);
  const [filterItem, setFilterItem] = useState<string>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  const fetchResources = async () => {
    try {
      const res = await api.getResources();
      setResources(res || []);
    } catch {
      // Fallback to local storage reports
      setResources(storage.getReports());
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const postId = `res-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();

    const newPost: EmergencyReport = {
      report_id: postId,
      report_type: postKind,
      emergency_type: selectedItem,
      urgency: urgency as any,
      created_at: nowIso,
      location_name: locationName.trim() || 'Chamoli Ward 4',
      people_affected: peopleAffected,
      description: `${quantity} ${unit}. ${description.trim()}`.trim(),
      sync_status: 'LOCAL_PENDING',
      verification_status: 'UNVERIFIED',
    };

    // Save locally
    storage.saveReportLocally(newPost);

    try {
      await api.postResource({
        report_id: postId,
        report_type: postKind,
        emergency_type: selectedItem,
        urgency: urgency,
        location_name: locationName.trim(),
        people_affected: peopleAffected,
        description: `${quantity} ${unit}. ${description.trim()}`.trim(),
        created_at: nowIso,
      });
      storage.markReportServerReceived(postId);
    } catch {
      // Saved locally
    } finally {
      setIsSubmitting(false);
      fetchResources();
      setActiveTab(postKind === 'NEED' ? 'needs' : 'offers');
    }
  };

  const getItemIcon = (itemName: string) => {
    const found = RESOURCE_ITEMS.find((it) => it.id.toLowerCase() === itemName.toLowerCase());
    if (found) {
      const Icon = found.icon;
      return <Icon size={20} color={found.color} />;
    }
    return <Activity size={20} color={tokens.colors.primaryBlue} />;
  };

  // Filtered lists
  const currentList = resources.filter((r) => {
    if (activeTab === 'needs' && r.report_type !== 'NEED') return false;
    if (activeTab === 'offers' && r.report_type !== 'OFFER') return false;
    if (filterItem !== 'ALL' && !r.emergency_type.toLowerCase().includes(filterItem.toLowerCase())) return false;
    if (verifiedOnly && r.verification_status !== 'VERIFIED') return false;
    return true;
  });

  return (
    <div style={{ padding: '16px', maxWidth: 520, margin: '0 auto', paddingBottom: 85 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onNavigateBack}
            aria-label="Back to home"
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
              {t.needsAndResources}
            </h1>
            <div style={{ fontSize: 12, color: tokens.colors.mutedText }}>
              Community Medical & Relief Logistics
            </div>
          </div>
        </div>

        {activeTab !== 'create_new' && (
          <button
            onClick={() => setActiveTab('create_new')}
            style={{
              backgroundColor: tokens.colors.primaryBlue,
              color: tokens.colors.white,
              border: 'none',
              borderRadius: tokens.radius.chip,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={16} />
            Post
          </button>
        )}
      </div>

      {/* Tabs */}
      {activeTab !== 'create_new' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {(['needs', 'offers', 'my_posts'] as const).map((tabKey) => {
              const label =
                tabKey === 'needs' ? '● Needs' : tabKey === 'offers' ? '■ Offers' : 'My Posts';
              const isSelected = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  style={{
                    flex: 1,
                    minHeight: 40,
                    borderRadius: tokens.radius.chip,
                    backgroundColor: isSelected ? tokens.colors.navyText : tokens.colors.cardGrey,
                    color: isSelected ? tokens.colors.white : tokens.colors.navyText,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
            <button
              onClick={() => setFilterItem('ALL')}
              style={{
                padding: '5px 12px',
                borderRadius: tokens.radius.full,
                border: filterItem === 'ALL' ? `1.5px solid ${tokens.colors.primaryBlue}` : `1px solid ${tokens.colors.border}`,
                backgroundColor: filterItem === 'ALL' ? tokens.colors.paleBlue : tokens.colors.white,
                color: filterItem === 'ALL' ? tokens.colors.primaryBlue : tokens.colors.navyText,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              All Items
            </button>
            {RESOURCE_ITEMS.slice(0, 5).map((it) => (
              <button
                key={it.id}
                onClick={() => setFilterItem(it.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: tokens.radius.full,
                  border: filterItem === it.id ? `1.5px solid ${tokens.colors.primaryBlue}` : `1px solid ${tokens.colors.border}`,
                  backgroundColor: filterItem === it.id ? tokens.colors.paleBlue : tokens.colors.white,
                  color: filterItem === it.id ? tokens.colors.primaryBlue : tokens.colors.navyText,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {it.label}
              </button>
            ))}
          </div>

          {/* List of Resource Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', backgroundColor: tokens.colors.white, borderRadius: tokens.radius.card }}>
                <Clock size={32} color={tokens.colors.mutedText} style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
                  No posts found in this view
                </div>
                <div style={{ fontSize: 13, color: tokens.colors.mutedText }}>
                  Tap the "Post" button above to register a need or offer assistance.
                </div>
              </div>
            ) : (
              currentList.map((item) => (
                <div
                  key={item.report_id}
                  style={{
                    padding: '16px',
                    backgroundColor: tokens.colors.white,
                    borderRadius: tokens.radius.card,
                    border: `1px solid ${tokens.colors.border}`,
                    boxShadow: tokens.shadow.card,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          backgroundColor: tokens.colors.paleBlue,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getItemIcon(item.emergency_type)}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: tokens.colors.navyText }}>
                          {item.emergency_type}
                        </div>
                        <div style={{ fontSize: 12, color: tokens.colors.mutedText }}>
                          {item.location_name || 'Chamoli Relief Sector'} · {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: tokens.radius.full,
                        fontSize: 11,
                        fontWeight: 800,
                        backgroundColor: item.report_type === 'NEED' ? '#FEF2F2' : '#F0FDF4',
                        color: item.report_type === 'NEED' ? tokens.colors.emergencyRed : tokens.colors.successGreen,
                      }}
                    >
                      {item.report_type === 'NEED' ? '● NEED' : '■ OFFER'}
                    </span>
                  </div>

                  {item.description && (
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: '18px', marginBottom: 10 }}>
                      {item.description}
                    </div>
                  )}

                  {/* Corroborated matching note from backend if available */}
                  {item.nearby_match && (
                    <div
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#1E40AF',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 8,
                      }}
                    >
                      <Sparkles size={14} />
                      Possible match: {item.nearby_match}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${tokens.colors.border}`, paddingTop: 8 }}>
                    <VerificationBadge status={item.verification_status} />
                    <span style={{ fontSize: 12, color: tokens.colors.mutedText, fontWeight: 500 }}>
                      Urgency: <strong>{item.urgency}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ================= CREATE NEW POST FORM ================= */}
      {activeTab === 'create_new' && (
        <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Segmented Control: I need help vs I can give help */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setPostKind('NEED')}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: tokens.radius.chip,
                backgroundColor: postKind === 'NEED' ? tokens.colors.emergencyRed : tokens.colors.cardGrey,
                color: postKind === 'NEED' ? tokens.colors.white : tokens.colors.navyText,
                border: 'none',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ● I Need Help
            </button>
            <button
              type="button"
              onClick={() => setPostKind('OFFER')}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: tokens.radius.chip,
                backgroundColor: postKind === 'OFFER' ? tokens.colors.successGreen : tokens.colors.cardGrey,
                color: postKind === 'OFFER' ? tokens.colors.white : tokens.colors.navyText,
                border: 'none',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ■ I Can Give Help
            </button>
          </div>

          {/* Item Category Vector Grid */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 8 }}>
              Select Item / Supply
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {RESOURCE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedItem === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItem(item.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: tokens.radius.chip,
                      border: isSelected ? `2px solid ${tokens.colors.primaryBlue}` : `1px solid ${tokens.colors.border}`,
                      backgroundColor: isSelected ? tokens.colors.paleBlue : tokens.colors.white,
                      color: isSelected ? tokens.colors.primaryBlue : tokens.colors.navyText,
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Icon size={18} color={item.color} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
                Quantity
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{
                  width: '100%',
                  minHeight: 44,
                  borderRadius: tokens.radius.chip,
                  border: `1px solid ${tokens.colors.border}`,
                  padding: '0 12px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="vials, boxes, liters, kits"
                style={{
                  width: '100%',
                  minHeight: 44,
                  borderRadius: tokens.radius.chip,
                  border: `1px solid ${tokens.colors.border}`,
                  padding: '0 12px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
              Location / Relief Camp
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Town Relief Camp B, Near Ghat"
              style={{
                width: '100%',
                minHeight: 44,
                borderRadius: tokens.radius.chip,
                border: `1px solid ${tokens.colors.border}`,
                padding: '0 12px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Details */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: tokens.colors.navyText, marginBottom: 4 }}>
              Additional Details (Storage, Expiry, Urgency)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Kept in icebox cooler, available for immediate pickup"
              style={{
                width: '100%',
                borderRadius: tokens.radius.chip,
                border: `1px solid ${tokens.colors.border}`,
                padding: '10px 12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setActiveTab('needs')}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: tokens.radius.chip,
                backgroundColor: tokens.colors.cardGrey,
                color: tokens.colors.navyText,
                border: `1px solid ${tokens.colors.border}`,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                minHeight: 48,
                borderRadius: tokens.radius.button,
                backgroundColor: postKind === 'NEED' ? tokens.colors.emergencyRed : tokens.colors.successGreen,
                color: tokens.colors.white,
                border: 'none',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: tokens.shadow.active,
              }}
            >
              {isSubmitting ? 'Submitting...' : postKind === 'NEED' ? 'Send Need' : 'Send Offer'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export const AddNeedOfferScreen = NeedOfferScreen;
