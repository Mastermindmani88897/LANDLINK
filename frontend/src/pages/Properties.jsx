import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import {
  PROPERTY_TYPES, HOUSE_TYPES, SOIL_AND_INFRASTRUCTURE, LAND_COST_FACTORS
} from '../utils/propertyConstants';
import {
  SlidersHorizontal, MapPin, Search, Grid, List, X, RefreshCw, Filter, Sparkles, AlertCircle
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard.jsx';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton.jsx';
import SEO from '../components/SEO.jsx';

export default function Properties() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { properties, filters, setFilters, resetFilters, language } = useAppStore();
  const t = translations[language] || translations.en;

  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync URL params to store filters on mount
  useEffect(() => {
    const city = searchParams.get('city') || '';
    const property_type = searchParams.get('property_type') || '';
    const min_price = searchParams.get('min_price') || '';
    const max_price = searchParams.get('max_price') || '';
    const bedrooms = searchParams.get('bedrooms') || searchParams.get('min_bedrooms') || '';
    const bathrooms = searchParams.get('bathrooms') || searchParams.get('min_bathrooms') || '';
    const sort_by = searchParams.get('sort_by') || 'newest';

    setFilters({
      city, property_type, min_price, max_price, bedrooms, bathrooms, sort_by
    });
  }, []);

  // Fetch properties on filter change
  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      try {
        await api.searchProperties(filters);
      } catch (err) {
        console.error('Error searching properties:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleClearAll = () => {
    resetFilters();
    navigate('/properties');
  };

  const activeFilterCount = Object.entries(filters).filter(([key, val]) => val && val !== 'newest' && !Array.isArray(val) ? true : Array.isArray(val) && val.length > 0).length;

  return (
    <div style={{ width: '100%', paddingBottom: '6rem' }}>
      <SEO title="Browse Properties - Search Marketplace" description="Search verified houses, villas, flats, apartments, and commercial real estate directly from owners." />

      {/* Top Banner & Search Quick Bar */}
      <div style={{ backgroundColor: 'var(--filter-banner-bg)', borderBottom: '1px solid var(--filter-banner-border)', paddingTop: '2.5rem', paddingBottom: '2rem' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8' }}>
                Zero Brokerage Marketplace
              </span>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                Browse & Filter Properties
              </h1>
            </div>

            {/* View Switcher & Filter Toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="glass-panel" style={{ display: 'flex', borderRadius: '0.75rem', padding: '0.25rem', border: '1px solid var(--card-border)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                    backgroundColor: viewMode === 'grid' ? '#6366f1' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 700
                  }}
                >
                  <Grid size={16} /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                    backgroundColor: viewMode === 'list' ? '#6366f1' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 700
                  }}
                >
                  <List size={16} /> List
                </button>
              </div>

              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="btn-secondary flex md:hidden"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </div>

          {/* Quick Search Inputs */}
          <div className="glass-panel" style={{ marginTop: '1.5rem', borderRadius: '1.25rem', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Location / City</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <MapPin size={15} style={{ color: '#818cf8', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Property Type</label>
              <select
                value={filters.property_type || ''}
                onChange={(e) => handleFilterChange('property_type', e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                <option value="" style={{ backgroundColor: 'var(--filter-option-bg)' }}>All Types</option>
                {PROPERTY_TYPES.map((pt) => <option key={pt} value={pt} style={{ backgroundColor: 'var(--filter-option-bg)' }}>{pt}</option>)}
              </select>
            </div>

            {/* Dynamic Type-Specific Filters */}
            {(() => {
              const selType = filters.property_type;
              if (['House', 'Villa', 'Apartment'].includes(selType)) {
                return (
                  <div>
                    <label style={{ fontSize: '10px', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Bedrooms</label>
                    <select
                      value={filters.bedrooms || ''}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <option value="" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Any Bedrooms</option>
                      <option value="1" style={{ backgroundColor: 'var(--filter-option-bg)' }}>1+ BHK</option>
                      <option value="2" style={{ backgroundColor: 'var(--filter-option-bg)' }}>2+ BHK</option>
                      <option value="3" style={{ backgroundColor: 'var(--filter-option-bg)' }}>3+ BHK</option>
                      <option value="4" style={{ backgroundColor: 'var(--filter-option-bg)' }}>4+ BHK</option>
                    </select>
                  </div>
                );
              }
              if (selType === 'Agricultural Land') {
                return (
                  <div>
                    <label style={{ fontSize: '10px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Cropping</label>
                    <select
                      value={filters.cropping_intensity || ''}
                      onChange={(e) => handleFilterChange('cropping_intensity', e.target.value)}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <option value="" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Any Cropping</option>
                      <option value="Single-crop" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Single-crop</option>
                      <option value="Dual-crop" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Dual-crop</option>
                      <option value="Multiple-crop" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Multiple-crop</option>
                    </select>
                  </div>
                );
              }
              if (['Residential Plot', 'Commercial Plot'].includes(selType)) {
                return (
                  <div>
                    <label style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Access Road</label>
                    <select
                      value={filters.access_road_type || ''}
                      onChange={(e) => handleFilterChange('access_road_type', e.target.value)}
                      style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <option value="" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Any Road Access</option>
                      <option value="Highway Road" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Highway Road</option>
                      <option value="Main Arterial Road" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Main Arterial Road</option>
                      <option value="Minor Local Road" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Minor Local Road</option>
                    </select>
                  </div>
                );
              }
              return null;
            })()}

            <div>
              <label style={{ fontSize: '10px', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Sort Listings By</label>
              <select
                value={filters.sort_by || 'newest'}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                <option value="newest" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Newest Listed</option>
                <option value="price_low" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Price: Low to High</option>
                <option value="price_high" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Price: High to Low</option>
                <option value="area_high" style={{ backgroundColor: 'var(--filter-option-bg)' }}>Largest Area</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout (Filter Sidebar + Listings Grid) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
        
        {/* Active Filter Tags Bar */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '-0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Active Filters:</span>
            {filters.city && (
              <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                City: {filters.city} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange('city', '')} />
              </span>
            )}
            {filters.property_type && (
              <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                Type: {filters.property_type} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleFilterChange('property_type', '')} />
              </span>
            )}
            <button onClick={handleClearAll} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <RefreshCw size={12} /> Clear All
            </button>
          </div>
        )}

        {/* Listings Display Grid */}
        <div>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr', gap: '1.75rem' }}>
              {[1, 2, 3, 4, 5, 6].map((n) => <PropertyCardSkeleton key={n} />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-panel" style={{ borderRadius: '1.5rem', padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <AlertCircle size={48} style={{ color: '#818cf8', margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Matching Properties Found</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                Try adjusting your location or filter search criteria to find available listings.
              </p>
              <button onClick={handleClearAll} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
                gap: '1.75rem',
              }}
            >
              {properties.map((prop) => (
                <PropertyCard key={prop._id || prop.id} property={prop} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
