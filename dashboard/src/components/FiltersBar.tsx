import React from 'react';
import { Search, RotateCw, Filter } from 'lucide-react';

interface FiltersBarProps {
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedUrgency: string;
  onUrgencyChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedUrgency,
  onUrgencyChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="glass-panel filters-bar">
      <div className="search-input-box">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search by ID, location, or symptom..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Filter size={16} color="#94a3b8" />
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by emergency category"
        >
          <option value="">All Categories</option>
          <option value="Pregnancy">Pregnancy</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Bleeding">Bleeding</option>
          <option value="Fever">Fever</option>
          <option value="Injury">Injury</option>
          <option value="Medicine needed">Medicine needed</option>
        </select>
      </div>

      <div>
        <select
          value={selectedUrgency}
          onChange={(e) => onUrgencyChange(e.target.value)}
          aria-label="Filter by urgency"
        >
          <option value="">All Urgencies</option>
          <option value="High">High Urgency</option>
          <option value="Medium">Medium Urgency</option>
          <option value="Low">Low Urgency</option>
        </select>
      </div>

      <div>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by verification status"
        >
          <option value="">All Statuses</option>
          <option value="UNVERIFIED">Unverified Only</option>
          <option value="VERIFIED">Verified Only</option>
          <option value="RESOLVED">Resolved Only</option>
          <option value="REJECTED">Rejected Only</option>
        </select>
      </div>

      <button
        onClick={onRefresh}
        className="btn-secondary"
        style={{ minHeight: 40, padding: '8px 14px' }}
        disabled={isLoading}
        title="Refresh data from server"
      >
        <RotateCw size={15} className={isLoading ? 'animate-spin' : ''} />
        <span>Refresh</span>
      </button>
    </div>
  );
};
