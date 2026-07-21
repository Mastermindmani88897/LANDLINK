import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/store';
import { translations } from '../utils/translations';
import {
  HOUSE_TYPES, VILLA_AMENITIES_OPTIONS, ACCESS_ROAD_TYPES,
  CROPPING_INTENSITY_OPTIONS, LAND_COST_FACTORS, SOIL_AND_INFRASTRUCTURE,
  COMMERCIAL_PLOT_OPTIONS, AREA_UNITS
} from '../utils/propertyConstants';
import { SlidersHorizontal, MapPin, Brain, ShoppingBag, Home, Compass, Sprout, Zap, Layers, Building2 } from 'lucide-react';

export default function Properties() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { properties, setProperties, filters, setFilters, resetFilters, language } = useAppStore();
  const t = translations[language] || translations.en;

  const [isLoading, setIsLoading] = useState(true);
  const [selectedPropId, setSelectedPropId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sync URL params → store filters on mount
  useEffect(() => {
    const city = searchParams.get('city') || '';
    const property_type = searchParams.get('property_type') || '';
    const house_type = searchParams.get('house_type') || '';
    const land_factors = searchParams.get('land_factors') || '';
    const soil_and_infrastructure = searchParams.get('soil_and_infrastructure') || '';
    const min_price = searchParams.get('min_price') || '';
    const max_price = searchParams.get('max_price') || '';
    const min_area = searchParams.get('min_area') || '';
    const max_area = searchParams.get('max_area') || '';
    const min_bedrooms = searchParams.get('min_bedrooms') || searchParams.get('bedrooms') || '';
    const max_bedrooms = searchParams.get('max_bedrooms') || '';
    const min_bathrooms = searchParams.get('min_bathrooms') || '';
    const max_bathrooms = searchParams.get('max_bathrooms') || '';
    const min_age = searchParams.get('min_age') || '';
    const max_age = searchParams.get('max_age') || '';
    const min_floors = searchParams.get('min_floors') || '';
    const max_floors = searchParams.get('max_floors') || '';
    const access_road_type = searchParams.get('access_road_type') || '';
    const corner_plot_status = searchParams.get('corner_plot_status') || '';
    const solar_grid_integration = searchParams.get('solar_grid_integration') || '';
    const cropping_intensity = searchParams.get('cropping_intensity') || '';
    const min_water_pump_count = searchParams.get('min_water_pump_count') || '';
    const max_water_pump_count = searchParams.get('max_water_pump_count') || '';
    const sort_by = searchParams.get('sort_by') || 'newest';

    setFilters({
      city, property_type, house_type, land_factors, soil_and_infrastructure,
      min_price, max_price, min_area, max_area,
      min_bedrooms, max_bedrooms, bedrooms: min_bedrooms,
      min_bathrooms, max_bathrooms,
      min_age, max_age, min_floors, max_floors,
      access_road_type, corner_plot_status, solar_grid_integration, cropping_intensity,
      min_water_pump_count, max_water_pump_count, sort_by
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch on filter change
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

  const handleFilterChange = (key, value) => setFilters({ [key]: value });
  const handleClear = () => { resetFilters(); navigate('/properties'); };

  const selectedLandFactors = Array.isArray(filters.land_factors)
    ? filters.land_factors
    : (filters.land_factors ? String(filters.land_factors).split(',').filter(Boolean) : []);

  const selectedSoilAndInfra = Array.isArray(filters.soil_and_infrastructure)
    ? filters.soil_and_infrastructure
    : (filters.soil_and_infrastructure ? String(filters.soil_and_infrastructure).split(',').filter(Boolean) : []);

  const selectedVillaAmenities = Array.isArray(filters.villa_amenities)
    ? filters.villa_amenities
    : (filters.villa_amenities ? String(filters.villa_amenities).split(',').filter(Boolean) : []);

  const selectedCommercialPlotFeatures = Array.isArray(filters.commercial_plot_features)
    ? filters.commercial_plot_features
    : (filters.commercial_plot_features ? String(filters.commercial_plot_features).split(',').filter(Boolean) : []);

  const toggleLandFactorFilter = (factor) => {
    const next = selectedLandFactors.includes(factor)
      ? selectedLandFactors.filter((f) => f !== factor)
      : [...selectedLandFactors, factor];
    setFilters({ land_factors: next });
  };

  const toggleSoilAndInfraFilter = (item) => {
    const next = selectedSoilAndInfra.includes(item)
      ? selectedSoilAndInfra.filter((i) => i !== item)
      : [...selectedSoilAndInfra, item];
    setFilters({ soil_and_infrastructure: next });
  };

  const toggleVillaAmenityFilter = (amenity) => {
    const next = selectedVillaAmenities.includes(amenity)
      ? selectedVillaAmenities.filter((a) => a !== amenity)
      : [...selectedVillaAmenities, amenity];
    setFilters({ villa_amenities: next });
  };

  const toggleCommercialPlotFilter = (feature) => {
    const next = selectedCommercialPlotFeatures.includes(feature)
      ? selectedCommercialPlotFeatures.filter((f) => f !== feature)
      : [...selectedCommercialPlotFeatures, feature];
    setFilters({ commercial_plot_features: next });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', width: '100%' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        {/* LEFT: List & Range Filters */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.05)', flex: '0 0 60%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShoppingBag size={12} /> {t.navBrowse}
                </span>
                <h2 style={{ fontSize: '1.625rem', fontWeight: 900, letterSpacing: '-0.025em', marginTop: '0.25rem' }}>{t.heroTitle}</h2>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Search and filter buying options by location, price range, area range, structural specs & options.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '0.375rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}
              >
                <SlidersHorizontal size={12} />
                <span>{showAdvancedFilters ? 'Simple Filters' : '⚡ All Specification Filters'}</span>
              </button>
            </div>

            {/* Core Range Filters Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>{t.searchCity}</label>
                <input type="text" placeholder="e.g. Mumbai, Bangalore" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} className="glass-input" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>{t.searchCategory}</label>
                <select value={filters.property_type} onChange={(e) => handleFilterChange('property_type', e.target.value)} className="glass-input" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#0d0925' }}>
                  <option value="">{t.allCategories}</option>
                  <option value="House">{t.house}</option>
                  <option value="Villa">{t.villa}</option>
                  <option value="Flat">{t.flat}</option>
                  <option value="Apartment">{t.apartment}</option>
                  <option value="Agricultural Land">{t.land}</option>
                  <option value="Commercial">{t.commercial}</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#818cf8', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Min Price (INR)</label>
                <input type="number" placeholder="Min Cost e.g. 5000000" value={filters.min_price} onChange={(e) => handleFilterChange('min_price', e.target.value)} className="glass-input" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#818cf8', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Max Price (INR)</label>
                <input type="number" placeholder="Max Cost e.g. 50000000" value={filters.max_price} onChange={(e) => handleFilterChange('max_price', e.target.value)} className="glass-input" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }} />
              </div>

              {/* Area Range */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Min Area (Sq. Ft.)</label>
                <input type="number" placeholder="Min SqFt e.g. 1000" value={filters.min_area} onChange={(e) => handleFilterChange('min_area', e.target.value)} className="glass-input" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Max Area (Sq. Ft.)</label>
                <input type="number" placeholder="Max SqFt e.g. 4000" value={filters.max_area} onChange={(e) => handleFilterChange('max_area', e.target.value)} className="glass-input" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }} />
              </div>

              {/* Bedroom Range */}
              {!(filters.property_type === 'Land' || filters.property_type === 'Agricultural Land') && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Min Bedrooms</label>
                    <input type="number" placeholder="Min Beds e.g. 2" value={filters.min_bedrooms} onChange={(e) => handleFilterChange('min_bedrooms', e.target.value)} className="glass-input" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Max Bedrooms</label>
                    <input type="number" placeholder="Max Beds e.g. 4" value={filters.max_bedrooms} onChange={(e) => handleFilterChange('max_bedrooms', e.target.value)} className="glass-input" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }} />
                  </div>
                </>
              )}
            </div>

            {/* EXPANDED SPECIFICATION RANGE FILTERS */}
            {(showAdvancedFilters || filters.property_type) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1rem', borderRadius: '0.875rem', backgroundColor: 'rgba(13,9,37,0.5)', border: '1px solid rgba(99,102,241,0.2)' }}>

                {/* House Specifications */}
                {(filters.property_type === 'House' || !filters.property_type) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Home size={12} /> House Structural Options & Specifications
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>House Sub-Type</label>
                        <select value={filters.house_type || ''} onChange={(e) => handleFilterChange('house_type', e.target.value)} className="glass-input" style={{ fontSize: '11px', padding: '0.375rem 0.5rem', backgroundColor: '#0d0925' }}>
                          <option value="">All House Types</option>
                          {HOUSE_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>Min House Age (Yrs)</label>
                        <input type="number" placeholder="Min Yrs" value={filters.min_age} onChange={(e) => handleFilterChange('min_age', e.target.value)} className="glass-input" style={{ fontSize: '11px', padding: '0.375rem 0.5rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>Max House Age (Yrs)</label>
                        <input type="number" placeholder="Max Yrs" value={filters.max_age} onChange={(e) => handleFilterChange('max_age', e.target.value)} className="glass-input" style={{ fontSize: '11px', padding: '0.375rem 0.5rem' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Villa Private Amenities */}
                {(filters.property_type === 'Villa' || !filters.property_type) && (
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: '#c084fc', fontWeight: 700, marginBottom: '0.375rem', textTransform: 'uppercase' }}>
                      Villa Private Amenities Options
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {VILLA_AMENITIES_OPTIONS.map((amenity) => {
                        const isSelected = selectedVillaAmenities.includes(amenity);
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleVillaAmenityFilter(amenity)}
                            style={{
                              padding: '0.375rem 0.625rem', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                              backgroundColor: isSelected ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.03)',
                              color: isSelected ? '#c084fc' : '#94a3b8',
                              border: isSelected ? '1px solid rgba(192,132,252,0.5)' : '1px solid rgba(255,255,255,0.08)',
                              display: 'flex', alignItems: 'center', gap: '0.25rem'
                            }}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{amenity}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Agricultural Cultivation Options */}
                {(filters.property_type === 'Land' || filters.property_type === 'Agricultural Land' || !filters.property_type) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sprout size={12} /> Agricultural Cultivation & Land Metrics Range
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>Cropping Intensity</label>
                        <select value={filters.cropping_intensity} onChange={(e) => handleFilterChange('cropping_intensity', e.target.value)} className="glass-input" style={{ fontSize: '11px', padding: '0.375rem 0.5rem', backgroundColor: '#0d0925' }}>
                          <option value="">All Intensities</option>
                          {CROPPING_INTENSITY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>Min Fallow (Yrs)</label>
                        <input type="number" placeholder="Min Yrs" value={filters.min_fallow_duration} onChange={(e) => handleFilterChange('min_fallow_duration', e.target.value)} className="glass-input" style={{ fontSize: '11px', padding: '0.375rem 0.5rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>Max Fallow (Yrs)</label>
                        <input type="number" placeholder="Max Yrs" value={filters.max_fallow_duration} onChange={(e) => handleFilterChange('max_fallow_duration', e.target.value)} className="glass-input" style={{ fontSize: '11px', padding: '0.375rem 0.5rem' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Road & Utility Specifications Range */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Compass size={12} /> Access Road & Infrastructure Specifications
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>Access Road</label>
                      <select value={filters.access_road_type} onChange={(e) => handleFilterChange('access_road_type', e.target.value)} className="glass-input" style={{ fontSize: '10px', padding: '0.375rem 0.5rem', backgroundColor: '#0d0925' }}>
                        <option value="">All Roads</option>
                        {ACCESS_ROAD_TYPES.map((road) => (
                          <option key={road} value={road}>{road}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>Corner Plot</label>
                      <select value={filters.corner_plot_status} onChange={(e) => handleFilterChange('corner_plot_status', e.target.value)} className="glass-input" style={{ fontSize: '10px', padding: '0.375rem 0.5rem', backgroundColor: '#0d0925' }}>
                        <option value="">Any</option>
                        <option value="true">Yes (Dual Road)</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    {filters.property_type !== 'Villa' && filters.property_type !== 'Flat' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>Min Pumps/Wells</label>
                        <input type="number" placeholder="Min Pumps" value={filters.min_water_pump_count} onChange={(e) => handleFilterChange('min_water_pump_count', e.target.value)} className="glass-input" style={{ fontSize: '10px', padding: '0.375rem 0.5rem' }} />
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', fontSize: '9px', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.2rem' }}>Solar Infrastructure</label>
                      <select value={filters.solar_grid_integration} onChange={(e) => handleFilterChange('solar_grid_integration', e.target.value)} className="glass-input" style={{ fontSize: '10px', padding: '0.375rem 0.5rem', backgroundColor: '#0d0925' }}>
                        <option value="">Any</option>
                        <option value="true">Solar Enabled</option>
                        <option value="false">No Solar</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Commercial Plot Options Filter */}
                {(filters.property_type === 'Commercial' || filters.property_type === 'Land' || filters.property_type === 'Agricultural Land' || !filters.property_type) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#facc15', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                      Commercial Plot Infrastructure Options (Buying Options)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {COMMERCIAL_PLOT_OPTIONS.map((feature) => {
                        const isSelected = selectedCommercialPlotFeatures.includes(feature);
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => toggleCommercialPlotFilter(feature)}
                            style={{
                              padding: '0.375rem 0.625rem', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                              backgroundColor: isSelected ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.03)',
                              color: isSelected ? '#facc15' : '#94a3b8',
                              border: isSelected ? '1px solid rgba(234,179,8,0.5)' : '1px solid rgba(255,255,255,0.08)',
                              display: 'flex', alignItems: 'center', gap: '0.25rem'
                            }}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{feature}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multi-Select Land Factors & Soil Infrastructure */}
                {(filters.property_type === 'Land' || filters.property_type === 'Agricultural Land' || !filters.property_type) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#38bdf8', fontWeight: 700, marginBottom: '0.375rem', textTransform: 'uppercase' }}>
                        Land Cost & Accessibility Factors (Select Multiple)
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {LAND_COST_FACTORS.map((factor) => {
                          const isSelected = selectedLandFactors.includes(factor);
                          return (
                            <button
                              key={factor}
                              type="button"
                              onClick={() => toggleLandFactorFilter(factor)}
                              style={{
                                padding: '0.375rem 0.625rem', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                backgroundColor: isSelected ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.03)',
                                color: isSelected ? '#38bdf8' : '#94a3b8',
                                border: isSelected ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', gap: '0.25rem'
                              }}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{factor}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10px', color: '#34d399', fontWeight: 700, marginBottom: '0.375rem', textTransform: 'uppercase' }}>
                        Soil Type & Infrastructure (Select Multiple)
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {SOIL_AND_INFRASTRUCTURE.map((item) => {
                          const isSelected = selectedSoilAndInfra.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleSoilAndInfraFilter(item)}
                              style={{
                                padding: '0.375rem 0.625rem', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                backgroundColor: isSelected ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.03)',
                                color: isSelected ? '#34d399' : '#94a3b8',
                                border: isSelected ? '1px solid rgba(52,211,153,0.5)' : '1px solid rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', gap: '0.25rem'
                              }}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <button onClick={handleClear} style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Reset All Filters</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{t.sortBy}:</span>
                <select value={filters.sort_by} onChange={(e) => handleFilterChange('sort_by', e.target.value)} className="glass-input" style={{ fontSize: '10px', padding: '0.25rem 0.5rem', background: 'transparent', color: '#a5b4fc', fontWeight: 700, border: '1px solid rgba(99,102,241,0.25)', width: 'auto' }}>
                  <option value="newest">{t.newest}</option>
                  <option value="price_low">{t.priceLow}</option>
                  <option value="price_high">{t.priceHigh}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listings */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
              {[1, 2, 3].map((n) => <div key={n} style={{ height: '8rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', animation: 'pulse 2s infinite' }} />)}
            </div>
          ) : properties.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
              <SlidersHorizontal size={36} style={{ color: '#475569', marginBottom: '1rem' }} />
              <h4 style={{ fontWeight: 800, fontSize: '0.875rem', color: '#cbd5e1' }}>No Properties Found Matching Preferences</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', maxWidth: '20rem' }}>Try adjusting maximum cost range or resetting filters.</p>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem' }}>
              {properties.map((prop) => (
                <div key={prop.id} onMouseEnter={() => setSelectedPropId(prop.id)} className="glass-panel" style={{ position: 'relative', display: 'flex', flexDirection: 'row', borderRadius: '1rem', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.25)', transition: 'all 0.2s', borderColor: selectedPropId === prop.id ? 'rgba(99,102,241,0.45)' : undefined }}>
                  <div style={{ width: '40%', aspectRatio: '16/9', position: 'relative', backgroundColor: '#0f172a', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={prop.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&fit=crop'} alt={prop.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', fontSize: '8px', fontWeight: 800, color: '#34d399' }}>
                      AI Score: {(prop.overall_condition_score || 9.2).toFixed(1)}/10
                    </div>
                  </div>
                  <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {prop.property_type}{prop.house_type ? ` • ${prop.house_type}` : ''}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc' }}>INR {((prop.expected_price || 0) / 100000).toFixed(0)} Lakh</span>
                      </div>
                      <h3 style={{ fontWeight: 800, fontSize: '0.9375rem', marginTop: '0.25rem', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prop.title}</h3>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '0.375rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{prop.description}</p>
                      
                      {/* Badges for Land Factors and Soil/Infra */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                        {prop.house_type && (
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#a5b4fc', backgroundColor: 'rgba(99,102,241,0.15)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', border: '1px solid rgba(99,102,241,0.3)' }}>
                            {prop.house_type}
                          </span>
                        )}
                        {(prop.land_factors || []).slice(0, 2).map((lf) => (
                          <span key={lf} style={{ fontSize: '9px', fontWeight: 700, color: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.15)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', border: '1px solid rgba(56,189,248,0.3)' }}>
                            {lf}
                          </span>
                        ))}
                        {(prop.soil_and_infrastructure || []).slice(0, 2).map((si) => (
                          <span key={si} style={{ fontSize: '9px', fontWeight: 700, color: '#34d399', backgroundColor: 'rgba(52,211,153,0.15)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', border: '1px solid rgba(52,211,153,0.3)' }}>
                            {si}
                          </span>
                        ))}
                        {(prop.commercial_plot_features || []).slice(0, 2).map((cp) => (
                          <span key={cp} style={{ fontSize: '9px', fontWeight: 700, color: '#facc15', backgroundColor: 'rgba(234,179,8,0.15)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', border: '1px solid rgba(234,179,8,0.3)' }}>
                            {cp}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.75rem', fontSize: '10px', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={10} style={{ color: '#818cf8' }} /> {prop.city}</span>
                      <span>{prop.bedrooms ? `${prop.bedrooms} Beds • ` : ''}{prop.area_sqft} {prop.area_unit || 'sq ft'}</span>
                      <Link to={`/properties/${prop.id}`} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textDecoration: 'none' }}>{t.inspect}</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Radar Map */}
        <div style={{ display: 'none', flex: '0 0 40%', position: 'relative', backgroundColor: 'rgba(0,0,0,0.5)', overflow: 'hidden', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} className="md:flex">
          <div style={{ position: 'relative', width: '20rem', height: '20rem', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.25)', backgroundColor: 'rgba(30,27,75,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '15rem', height: '15rem', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.15)' }} />
            <div style={{ position: 'absolute', width: '10rem', height: '10rem', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.15)' }} />
            <div style={{ position: 'absolute', width: '5rem', height: '5rem', borderRadius: '9999px', border: '1px solid rgba(99,102,241,0.15)' }} />
            <div style={{ position: 'absolute', width: '100%', height: '1px', backgroundColor: 'rgba(99,102,241,0.15)' }} />
            <div style={{ position: 'absolute', height: '100%', width: '1px', backgroundColor: 'rgba(99,102,241,0.15)' }} />
            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '9999px', borderTop: '1px solid rgba(99,102,241,0.5)', animation: 'spin 8s linear infinite' }} />
            {properties.map((prop) => {
              const isSelected = selectedPropId === prop.id;
              return (
                <div key={prop.id} style={{ position: 'absolute', transition: 'all 0.3s' }} onMouseEnter={() => setSelectedPropId(prop.id)}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: isSelected ? 'scale(1.25)' : 'scale(1)' }}>
                    <div style={{ height: '0.75rem', width: '0.75rem', borderRadius: '9999px', border: '1px solid white', cursor: 'pointer', backgroundColor: isSelected ? '#818cf8' : '#4f46e5' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 800, textTransform: 'uppercase' }}>
              <Brain size={12} style={{ display: 'inline', color: '#818cf8' }} /> LandLink AI Geo Radar Plotter
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
