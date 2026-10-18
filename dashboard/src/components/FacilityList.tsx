import React, { useState } from 'react';
import { Building2, Phone, MapPin, CheckCircle, Search } from 'lucide-react';
import { HealthcareFacility } from '../types';

interface FacilitiesListProps {
  facilities: HealthcareFacility[];
}

export const FacilitiesList: React.FC<FacilitiesListProps> = ({ facilities }) => {
  const [districtFilter, setDistrictFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = facilities.filter((fac) => {
    const matchesDistrict = !districtFilter || fac.district.toLowerCase() === districtFilter.toLowerCase();
    const matchesSearch =
      !search ||
      fac.name.toLowerCase().includes(search.toLowerCase()) ||
      fac.facility_type.toLowerCase().includes(search.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  return (
    <div>
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search facility name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 38 }}
          />
        </div>
        <div>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            aria-label="Filter by district"
          >
            <option value="">All Districts</option>
            <option value="Chamoli">Chamoli District</option>
            <option value="Rudraprayag">Rudraprayag District</option>
            <option value="Dehradun">Dehradun District</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
        {filtered.map((fac) => (
          <div key={fac.facility_id} className="glass-panel" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase' }}>
                  {fac.facility_type}
                </div>
                <h3 style={{ fontSize: 18, color: '#ffffff', marginTop: 2 }}>{fac.name}</h3>
              </div>
              <span className="badge badge-verified" style={{ fontSize: 11 }}>
                <CheckCircle size={12} />
                Operational
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#cbd5e1' }}>
              <MapPin size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{fac.address}, {fac.district}, {fac.state}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#60a5fa' }}>
              <Phone size={16} color="#3b82f6" />
              <a href={`tel:${fac.phone}`} style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>
                {fac.phone}
              </a>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '10px 12px', borderRadius: 8, fontSize: 12, color: '#bfdbfe' }}>
              <strong>Emergency Capacity: </strong> {fac.emergency_capacity}
            </div>

            <div style={{ fontSize: 11, color: '#64748b', marginTop: 'auto' }}>
              GPS: {fac.latitude.toFixed(4)}, {fac.longitude.toFixed(4)} • Verified live database record
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
