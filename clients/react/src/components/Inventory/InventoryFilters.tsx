import { useState } from 'react';
import './inventoryFilters.scss';

interface FilterProps {
  search: string;
  setSearch: (value: string) => void;
  onRefresh?: () => void;
}

const InventoryFilters = ({ search, setSearch, onRefresh }: FilterProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="inventory-filters">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={`search-input ${isSearchFocused ? 'focused' : ''}`}
        />
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {onRefresh && (
        <button onClick={onRefresh} className="refresh-btn" title="Refresh inventory">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 0 1 14.85-4.36M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 4.64" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default InventoryFilters;
