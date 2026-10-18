import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Search, 
  ArrowLeft, 
  Hospital,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { HealthcareFacility } from '../types';
import { tokens } from '../tokens';

interface FacilitiesListProps {
  facilities: HealthcareFacility[];
  isLoading?: boolean;
  error?: string | null;
  onNavigateBack: () => void;
  onSelectFacilityOnMap?: (fac: HealthcareFacility) => void;
}

export const FacilitiesList: React.FC<FacilitiesListProps> = ({ 
  facilities,
  isLoading = false,
  error = null,
  onNavigateBack,
  onSelectFacilityOnMap
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const typeOptions = ['All', 'District Hospital', 'CHC', 'PHC', 'Other'];

  const filtered = facilities.filter((fac) => {
    const matchesSearch =
      !search ||
      fac.name.toLowerCase().includes(search.toLowerCase()) ||
      fac.facility_type.toLowerCase().includes(search.toLowerCase()) ||
      fac.address.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict =
      !districtFilter || fac.district.toLowerCase() === districtFilter.toLowerCase();

    let matchesType = true;
    if (typeFilter !== 'All') {
      const ft = fac.facility_type.toLowerCase();
      if (typeFilter === 'District Hospital') {
        matchesType = ft.includes('district') || ft.includes('hospital');
      } else if (typeFilter === 'CHC') {
        matchesType = ft.includes('chc') || ft.includes('community');
      } else if (typeFilter === 'PHC') {
        matchesType = ft.includes('phc') || ft.includes('primary');
      } else {
        matchesType = !ft.includes('district') && !ft.includes('chc') && !ft.includes('phc');
      }
    }

    return matchesSearch && matchesDistrict && matchesType;
  });

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 80px', backgroundColor: tokens.colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={onNavigateBack}
          aria-label="Back to home"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: tokens.colors.white,
            border: `1px solid ${tokens.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: tokens.shadow.card,
            color: tokens.colors.navyText
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: tokens.colors.navyText, margin: 0 }}>
            Healthcare Facilities
          </h1>
          <p style={{ fontSize: 13, color: tokens.colors.mutedText, margin: '2px 0 0' }}>
            Verified hospital & health center directory
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: tokens.colors.mutedText }} />
        <input
          type="text"
          placeholder="Search by facility name, type, or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            height: 46,
            borderRadius: tokens.radius.card,
            border: `1px solid ${tokens.colors.border}`,
            backgroundColor: tokens.colors.white,
            paddingLeft: 42,
            paddingRight: 14,
            fontSize: 14,
            color: tokens.colors.navyText,
            boxSizing: 'border-box',
            outline: 'none',
            boxShadow: tokens.shadow.card
          }}
        />
      </div>

      {/* Type Filter Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16, scrollbarWidth: 'none' }}>
        {typeOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setTypeFilter(opt)}
            style={{
              padding: '6px 14px',
              borderRadius: tokens.radius.chip,
              fontSize: 13,
              fontWeight: 700,
              border: typeFilter === opt ? `2px solid ${tokens.colors.primaryBlue}` : `1px solid ${tokens.colors.border}`,
              backgroundColor: typeFilter === opt ? tokens.colors.paleBlue : tokens.colors.white,
              color: typeFilter === opt ? tokens.colors.primaryBlue : tokens.colors.navyText,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: tokens.shadow.card
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: tokens.colors.mutedText }}>
          <div style={{ width: 28, height: 28, border: `3px solid ${tokens.colors.primaryBlue}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          Loading verified facilities...
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div style={{ backgroundColor: tokens.colors.palePink, border: `1px solid #fda4af`, borderRadius: tokens.radius.card, padding: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <AlertCircle size={22} color={tokens.colors.emergencyRed} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.colors.emergencyRed }}>Failed to load facilities</div>
            <div style={{ fontSize: 12, color: tokens.colors.navyText }}>{error}</div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', backgroundColor: tokens.colors.white, borderRadius: tokens.radius.card, border: `1px solid ${tokens.colors.border}`, boxShadow: tokens.shadow.card }}>
          <Hospital size={44} color={tokens.colors.mutedText} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: tokens.colors.navyText, margin: '0 0 6px' }}>
            No healthcare facilities found
          </h3>
          <p style={{ fontSize: 13, color: tokens.colors.mutedText, margin: 0 }}>
            Try adjusting your search terms or type filters.
          </p>
        </div>
      )}

      {/* List of Facilities */}
      {!isLoading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((fac) => (
            <div
              key={fac.facility_id}
              style={{
                backgroundColor: tokens.colors.white,
                borderRadius: tokens.radius.card,
                padding: 16,
                border: `1px solid ${tokens.colors.border}`,
                boxShadow: tokens.shadow.card,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: tokens.colors.primaryBlue, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {fac.facility_type}
                  </span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: tokens.colors.navyText, margin: '2px 0 0' }}>
                    {fac.name}
                  </h2>
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: tokens.colors.successGreen,
                  padding: '3px 8px',
                  borderRadius: 12
                }}>
                  <CheckCircle size={12} strokeWidth={2.5} /> Operational
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: tokens.colors.mutedText }}>
                <MapPin size={16} color={tokens.colors.mutedText} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{fac.address}, {fac.district}, {fac.state}</span>
              </div>

              {fac.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a
                    href={`tel:${fac.phone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: tokens.colors.primaryBlue,
                      textDecoration: 'none',
                      backgroundColor: tokens.colors.paleBlue,
                      padding: '6px 12px',
                      borderRadius: tokens.radius.chip,
                      minHeight: 36
                    }}
                  >
                    <Phone size={14} /> Call {fac.phone}
                  </a>
                </div>
              )}

              {fac.emergency_capacity && (
                <div style={{ backgroundColor: tokens.colors.cardGrey, padding: '8px 12px', borderRadius: 8, fontSize: 12, color: tokens.colors.navyText }}>
                  <strong>Emergency Capacity: </strong> {fac.emergency_capacity}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: `1px solid ${tokens.colors.border}`, fontSize: 11, color: tokens.colors.mutedText }}>
                <span>GPS: {fac.latitude.toFixed(4)}, {fac.longitude.toFixed(4)}</span>
                {onSelectFacilityOnMap && (
                  <button
                    onClick={() => onSelectFacilityOnMap(fac)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'none',
                      border: 'none',
                      color: tokens.colors.primaryBlue,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    View on map <ExternalLink size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
