import React from 'react';
import PropertyCard from '../PropertyCard.jsx';
import { getTypeConfig } from '../../utils/propertyFieldConfig';
import { Eye, CheckCircle } from 'lucide-react';

export default function PropertyPreview({ formState }) {
  const typeConfig = getTypeConfig(formState.propertyType);

  // Convert formState to property structure expected by PropertyCard
  const propertyPreviewData = {
    id: formState.id || 'preview-id',
    _id: formState.id || 'preview-id',
    title: formState.title || `${formState.propertyType} in ${formState.city || 'Prime Area'}`,
    property_type: formState.propertyType,
    house_type: formState.houseType,
    expected_price: parseFloat(formState.expectedPrice || 100000),
    price: parseFloat(formState.expectedPrice || 100000),
    min_expected_price: formState.minExpectedPrice ? parseFloat(formState.minExpectedPrice) : null,
    max_expected_price: formState.maxExpectedPrice ? parseFloat(formState.maxExpectedPrice) : null,
    area_sqft: parseFloat(formState.areaSqft || 1000),
    area_unit: formState.areaUnit,
    bedrooms: parseInt(formState.bedrooms || 0),
    bathrooms: parseInt(formState.bathrooms || 0),
    floors: parseInt(formState.floors || 1),
    parking: parseInt(formState.parking || 0),
    address: formState.address,
    city: formState.city || 'Mumbai',
    state: formState.state,
    description: formState.description,
    reason_for_selling: formState.reasonForSelling,
    contact_number: formState.sellerPhone,
    contact_email: formState.sellerEmail,
    furnished_status: formState.furnishedStatus,

    // Specific fields
    house_bedrooms: parseInt(formState.houseBedrooms || 0),
    house_bathrooms: parseInt(formState.houseBathrooms || 0),
    house_age: parseFloat(formState.houseAge || 0),

    villa_bedrooms: parseInt(formState.villaBedrooms || 0),
    villa_bathrooms: parseInt(formState.villaBathrooms || 0),
    villa_total_floors: parseInt(formState.villaTotalFloors || 1),
    villa_plot_area: parseFloat(formState.villaPlotArea || 0),
    villa_amenities: formState.villaAmenities,

    apartment_total_floors: parseInt(formState.apartmentTotalFloors || 1),
    apartment_unit_bedrooms: parseInt(formState.apartmentUnitBedrooms || 0),
    apartment_unit_bathrooms: parseInt(formState.apartmentUnitBathrooms || 0),
    flat_floor_number: parseInt(formState.flatFloorNumber || 1),

    access_road_type: formState.accessRoadType,
    corner_plot_status: Boolean(formState.cornerPlotStatus),
    plot_facing: formState.plotFacing,

    cropping_intensity: formState.croppingIntensity,
    crop_fallow_duration: parseFloat(formState.cropFallowDuration || 0),
    water_pump_count: parseInt(formState.waterPumpCount || 0),
    solar_grid_integration: Boolean(formState.solarGridIntegration),

    land_factors: formState.selectedLandFactors,
    soil_and_infrastructure: formState.selectedSoilAndInfra,
    commercial_plot_features: formState.commercialPlotFeatures,

    images: (formState.imageUrls || []).map((url) => ({ image_url: url })),

    status: 'approved',
    is_verified: true,
    seller_type: 'owner',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={20} style={{ color: '#818cf8' }} /> Live Marketplace Preview
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          This is exactly how buyers will see your listing card on LandLink AI.
        </p>
      </div>

      <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
        <PropertyCard property={propertyPreviewData} />
      </div>

      {/* Category Specific Summary Preview */}
      <div style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: typeConfig.color, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          {typeConfig.emoji} {formState.propertyType} Summary Specifications
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.625rem', fontSize: '0.8125rem' }}>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Category:</strong> {formState.propertyType}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Price:</strong> ₹ {Number(formState.expectedPrice || 0).toLocaleString('en-IN')}</div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Location:</strong> {formState.city || 'Not specified'}, {formState.state || 'India'}</div>

          {typeConfig.showsResidential && (
            <>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Bedrooms:</strong> {formState.bedrooms} BHK</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Bathrooms:</strong> {formState.bathrooms} Baths</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Furnished:</strong> {formState.furnishedStatus}</div>
            </>
          )}

          {formState.propertyType === 'Apartment' && (
            <>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Floor:</strong> Floor {formState.flatFloorNumber} of {formState.apartmentTotalFloors}</div>
            </>
          )}

          {formState.propertyType === 'Villa' && (
            <>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Plot Area:</strong> {formState.villaPlotArea} sq ft</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Amenities:</strong> {formState.villaAmenities?.length || 0} selected</div>
            </>
          )}

          {formState.propertyType === 'Agricultural Land' && (
            <>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Cropping:</strong> {formState.croppingIntensity}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Pumps:</strong> {formState.waterPumpCount} Borewells</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Solar Grid:</strong> {formState.solarGridIntegration ? 'Yes' : 'No'}</div>
            </>
          )}

          {['Residential Plot', 'Commercial Plot'].includes(formState.propertyType) && (
            <>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Facing:</strong> {formState.plotFacing}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Corner Plot:</strong> {formState.cornerPlotStatus ? 'Yes' : 'No'}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Road:</strong> {formState.accessRoadType}</div>
            </>
          )}

          {formState.propertyType === 'Commercial Building' && (
            <>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Floors:</strong> {formState.floors} Levels</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Parking:</strong> {formState.parking} Slots</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
