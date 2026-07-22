/**
 * propertyFieldConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all property-type configuration.
 *
 * Every feature — Create Listing, Edit Listing, Property Details,
 * Property Cards, Search Filters, Validation, and AI Modules —
 * must derive its logic from this file.
 *
 * Never duplicate property-type logic across multiple files.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Canonical Property Types ─────────────────────────────────────────────────
export const SUPPORTED_PROPERTY_TYPES = [
  'House',
  'Villa',
  'Apartment',
  'Agricultural Land',
  'Residential Plot',
  'Commercial Plot',
  'Commercial Building',
];

/**
 * Legacy type aliases — used for backward compatibility with existing DB records.
 * Maps old type strings → canonical type string.
 */
export const PROPERTY_TYPE_ALIASES = {
  'Flat': 'Apartment',
  'Flat/Apartment': 'Apartment',
  'Commercial': 'Commercial Building',
};

/**
 * Resolve a raw property_type string (possibly legacy) to the canonical type.
 * Returns the canonical type, or the input unchanged if not a legacy alias.
 */
export function resolvePropertyType(rawType) {
  if (!rawType) return 'House';
  return PROPERTY_TYPE_ALIASES[rawType] || rawType;
}

// ─── Field Categories (used to drive form rendering) ─────────────────────────
/**
 * For each canonical property type, defines:
 *   - label         : Display name
 *   - color         : Accent color for badges/icons
 *   - emoji         : Icon emoji for quick visual identification
 *   - showsResidential : Whether to show generic bedrooms/bathrooms/floors
 *   - formSections  : Which form sub-components to render (ordered)
 *   - cardSpecs     : Which specs to display on PropertyCard
 *   - detailSpecs   : Which spec widgets to render on PropertyDetail
 *   - searchFilters : Which filter groups to show in Properties.jsx
 *   - aiFeatures    : AI features available for this type
 *   - description   : Short description for the form header
 */
export const PROPERTY_TYPE_CONFIG = {
  House: {
    label: 'House',
    color: '#6366f1',
    emoji: '🏠',
    description: 'Single-family, duplex, townhouse or farmhouse',
    showsResidential: true,
    formSections: ['basic', 'location', 'house', 'images', 'ai', 'seller'],
    cardSpecs: ['bedrooms', 'bathrooms', 'area', 'floors'],
    detailSpecs: ['bedrooms', 'bathrooms', 'area', 'floors', 'parking', 'furnishedStatus', 'houseAge'],
    searchFilters: ['price', 'area', 'bedrooms', 'bathrooms', 'parking', 'age'],
    aiFeatures: ['price_prediction', 'description_generator', 'investment_score'],
  },

  Villa: {
    label: 'Villa',
    color: '#8b5cf6',
    emoji: '🏡',
    description: 'Luxury private villa with exclusive amenities',
    showsResidential: true,
    formSections: ['basic', 'location', 'villa', 'images', 'ai', 'seller'],
    cardSpecs: ['bedrooms', 'bathrooms', 'area', 'villaAmenities'],
    detailSpecs: ['bedrooms', 'bathrooms', 'area', 'villaPlotArea', 'floors', 'parking', 'villaAmenities'],
    searchFilters: ['price', 'area', 'bedrooms', 'bathrooms', 'villaAmenities'],
    aiFeatures: ['price_prediction', 'description_generator', 'investment_score'],
  },

  Apartment: {
    label: 'Apartment',
    color: '#06b6d4',
    emoji: '🏢',
    description: 'Apartment or flat in a residential complex',
    showsResidential: true,
    aliases: ['Flat', 'Flat/Apartment'],
    formSections: ['basic', 'location', 'apartment', 'images', 'ai', 'seller'],
    cardSpecs: ['bedrooms', 'bathrooms', 'area', 'flatFloorNumber'],
    detailSpecs: ['bedrooms', 'bathrooms', 'area', 'flatFloorNumber', 'apartmentTotalFloors', 'parking', 'furnishedStatus'],
    searchFilters: ['price', 'area', 'bedrooms', 'bathrooms', 'flatFloorNumber'],
    aiFeatures: ['price_prediction', 'description_generator', 'investment_score'],
  },

  'Agricultural Land': {
    label: 'Agricultural Land',
    color: '#10b981',
    emoji: '🌾',
    description: 'Farmland, agricultural plot or cultivation land',
    showsResidential: false,
    formSections: ['basic', 'location', 'agricultural', 'images', 'seller'],
    cardSpecs: ['area', 'croppingIntensity', 'accessRoadType'],
    detailSpecs: ['area', 'croppingIntensity', 'waterPumpCount', 'solarGridIntegration', 'accessRoadType', 'plotFacing', 'cornerPlotStatus'],
    searchFilters: ['price', 'area', 'croppingIntensity', 'accessRoadType', 'solarGridIntegration'],
    aiFeatures: ['land_valuation', 'farming_suitability', 'investment_potential'],
  },

  'Residential Plot': {
    label: 'Residential Plot',
    color: '#f59e0b',
    emoji: '🏗️',
    description: 'Empty plot approved for residential construction',
    showsResidential: false,
    formSections: ['basic', 'location', 'residentialPlot', 'images', 'seller'],
    cardSpecs: ['area', 'accessRoadType', 'plotFacing'],
    detailSpecs: ['area', 'plotFacing', 'accessRoadType', 'cornerPlotStatus', 'landFactors'],
    searchFilters: ['price', 'area', 'accessRoadType', 'plotFacing'],
    aiFeatures: ['price_prediction', 'investment_potential'],
  },

  'Commercial Plot': {
    label: 'Commercial Plot',
    color: '#ef4444',
    emoji: '🏪',
    description: 'Plot zoned for commercial, retail or industrial use',
    showsResidential: false,
    formSections: ['basic', 'location', 'commercialPlot', 'images', 'seller'],
    cardSpecs: ['area', 'commercialPlotFeatures', 'accessRoadType'],
    detailSpecs: ['area', 'commercialPlotFeatures', 'plotFacing', 'accessRoadType', 'cornerPlotStatus'],
    searchFilters: ['price', 'area', 'commercialPlotFeatures'],
    aiFeatures: ['roi_prediction', 'business_potential'],
  },

  'Commercial Building': {
    label: 'Commercial Building',
    color: '#f97316',
    emoji: '🏬',
    description: 'Office, retail space, warehouse or commercial complex',
    showsResidential: false,
    aliases: ['Commercial'],
    formSections: ['basic', 'location', 'commercialBuilding', 'images', 'seller'],
    cardSpecs: ['area', 'floors', 'commercialPlotFeatures'],
    detailSpecs: ['area', 'floors', 'parking', 'commercialPlotFeatures'],
    searchFilters: ['price', 'area', 'floors', 'commercialPlotFeatures'],
    aiFeatures: ['roi_prediction', 'business_potential'],
  },
};

// ─── Helper: get config for a type (handles aliases) ─────────────────────────
export function getTypeConfig(rawType) {
  const canonical = resolvePropertyType(rawType);
  return PROPERTY_TYPE_CONFIG[canonical] || PROPERTY_TYPE_CONFIG['House'];
}

// ─── Helper: does this type use residential fields? ────────────────────────
export function isResidentialType(rawType) {
  return getTypeConfig(rawType).showsResidential;
}

// ─── Helper: does this type use plot/land fields? ─────────────────────────
export function isLandType(rawType) {
  const canonical = resolvePropertyType(rawType);
  return ['Agricultural Land', 'Residential Plot', 'Commercial Plot'].includes(canonical);
}

// ─── Helper: does this type use commercial features? ─────────────────────
export function isCommercialType(rawType) {
  const canonical = resolvePropertyType(rawType);
  return ['Commercial Plot', 'Commercial Building'].includes(canonical);
}

// ─── Helper: get label for display (resolves aliases) ─────────────────────
export function getTypeLabel(rawType) {
  return getTypeConfig(rawType).label;
}

// ─── Helper: get color for display ────────────────────────────────────────
export function getTypeColor(rawType) {
  return getTypeConfig(rawType).color;
}

// ─── Default Form State ────────────────────────────────────────────────────
/**
 * The canonical initial state for the property posting form.
 * All form components read from and write to this shape.
 */
export const DEFAULT_FORM_STATE = {
  // ── Core ────────────────────────────────────────────────────────────────
  title: '',
  propertyType: 'House',
  expectedPrice: '',
  minExpectedPrice: '',
  maxExpectedPrice: '',

  // ── Location ─────────────────────────────────────────────────────────────
  address: '',
  city: '',
  state: '',

  // ── Area ─────────────────────────────────────────────────────────────────
  areaSqft: '',
  areaUnit: 'sq ft',

  // ── Common Residential ───────────────────────────────────────────────────
  bedrooms: '2',
  bathrooms: '2',
  floors: '1',
  parking: '1',
  furnishedStatus: 'Semi-Furnished',

  // ── Narrative ────────────────────────────────────────────────────────────
  description: '',
  reasonForSelling: '',

  // ── Seller ────────────────────────────────────────────────────────────────
  sellerName: '',
  sellerPhone: '',
  sellerEmail: '',

  // ── House Specific ────────────────────────────────────────────────────────
  houseType: 'Single-Family Detached Houses',
  houseAge: '0',
  houseBedrooms: '3',
  houseBathrooms: '2',
  houseTotalRooms: '5',
  houseTotalFloors: '2',

  // ── Villa Specific ────────────────────────────────────────────────────────
  villaBedrooms: '4',
  villaBathrooms: '4',
  villaTotalFloors: '2',
  villaPlotArea: '3500',
  villaAmenities: [],

  // ── Apartment Specific ────────────────────────────────────────────────────
  apartmentTotalFloors: '12',
  apartmentUnitBedrooms: '2',
  apartmentUnitBathrooms: '2',
  flatFloorNumber: '3',

  // ── Plot / Land Shared ────────────────────────────────────────────────────
  accessRoadType: 'Highway Road',
  cornerPlotStatus: false,
  plotFacing: 'East',

  // ── Agricultural Specific ─────────────────────────────────────────────────
  croppingIntensity: 'Dual-crop',
  cropFallowDuration: '1',
  waterPumpCount: '1',
  solarGridIntegration: false,

  // ── Arrays / Multi-Select ────────────────────────────────────────────────
  selectedLandFactors: [],
  selectedSoilAndInfra: [],
  commercialPlotFeatures: [],

  // ── Images ────────────────────────────────────────────────────────────────
  imageUrls: [],
};

/**
 * Build the API payload from formState.
 * Images are sent as raw URL strings — backend wraps them into {image_url,...} objects.
 */
export function buildPropertyPayload(formState, editId = null) {
  const s = formState;
  const base = {
    title: s.title,
    property_type: s.propertyType,
    expected_price: parseFloat(s.expectedPrice || 0),
    min_expected_price: s.minExpectedPrice ? parseFloat(s.minExpectedPrice) : null,
    max_expected_price: s.maxExpectedPrice ? parseFloat(s.maxExpectedPrice) : null,
    area_sqft: parseFloat(s.areaSqft || 0),
    area_unit: s.areaUnit,
    bedrooms: parseInt(s.bedrooms || 0),
    bathrooms: parseInt(s.bathrooms || 0),
    floors: parseInt(s.floors || 1),
    parking: parseInt(s.parking || 0),
    address: s.address,
    city: s.city,
    state: s.state,
    description: s.description,
    reason_for_selling: s.reasonForSelling,
    furnished_status: s.furnishedStatus,
    contact_number: s.sellerPhone,
    contact_email: s.sellerEmail,

    // House
    house_type: s.houseType,
    house_bedrooms: parseInt(s.houseBedrooms || 0),
    house_bathrooms: parseInt(s.houseBathrooms || 0),
    house_age: parseFloat(s.houseAge || 0),
    house_total_rooms: parseInt(s.houseTotalRooms || 0),
    house_total_floors: parseInt(s.houseTotalFloors || 1),

    // Villa
    villa_bedrooms: parseInt(s.villaBedrooms || 0),
    villa_bathrooms: parseInt(s.villaBathrooms || 0),
    villa_total_floors: parseInt(s.villaTotalFloors || 1),
    villa_plot_area: parseFloat(s.villaPlotArea || 0),
    villa_amenities: s.villaAmenities,

    // Apartment
    apartment_total_floors: parseInt(s.apartmentTotalFloors || 1),
    apartment_unit_bedrooms: parseInt(s.apartmentUnitBedrooms || 0),
    apartment_unit_bathrooms: parseInt(s.apartmentUnitBathrooms || 0),
    flat_floor_number: parseInt(s.flatFloorNumber || 1),

    // Plot / Land
    access_road_type: s.accessRoadType,
    corner_plot_status: Boolean(s.cornerPlotStatus),
    plot_facing: s.plotFacing,

    // Agricultural
    cropping_intensity: s.croppingIntensity,
    crop_fallow_duration: parseFloat(s.cropFallowDuration || 0),
    water_pump_count: parseInt(s.waterPumpCount || 0),
    solar_grid_integration: Boolean(s.solarGridIntegration),

    // Multi-select arrays
    land_factors: s.selectedLandFactors,
    soil_and_infrastructure: s.selectedSoilAndInfra,
    commercial_plot_features: s.commercialPlotFeatures,

    // Images — raw strings only; backend wraps into objects
    images: s.imageUrls,

    status: 'approved',
    is_verified: true,
    seller_type: 'owner',
  };

  if (editId) base.id = editId;
  return base;
}

/**
 * Map a raw property object from the API back into formState shape.
 * Used when loading an existing property for editing.
 */
export function propertyToFormState(prop) {
  if (!prop) return { ...DEFAULT_FORM_STATE };

  const images = (prop.images || [])
    .map(img => (typeof img === 'string' ? img : img?.image_url || img?.url))
    .filter(Boolean);

  return {
    title: prop.title || '',
    propertyType: resolvePropertyType(prop.property_type) || 'House',
    expectedPrice: prop.expected_price ? String(prop.expected_price) : '',
    minExpectedPrice: prop.min_expected_price ? String(prop.min_expected_price) : '',
    maxExpectedPrice: prop.max_expected_price ? String(prop.max_expected_price) : '',

    address: prop.address || '',
    city: prop.city || '',
    state: prop.state || '',

    areaSqft: prop.area_sqft ? String(prop.area_sqft) : '',
    areaUnit: prop.area_unit || 'sq ft',

    bedrooms: prop.bedrooms != null ? String(prop.bedrooms) : '2',
    bathrooms: prop.bathrooms != null ? String(prop.bathrooms) : '2',
    floors: prop.floors != null ? String(prop.floors) : '1',
    parking: prop.parking != null ? String(prop.parking) : '1',
    furnishedStatus: prop.furnished_status || 'Semi-Furnished',

    description: prop.description || '',
    reasonForSelling: prop.reason_for_selling || '',

    sellerName: prop.seller?.full_name || prop.seller?.name || '',
    sellerPhone: prop.contact_number || prop.seller?.phone || prop.seller?.phone_number || '',
    sellerEmail: prop.contact_email || prop.seller?.email || '',

    // House
    houseType: prop.house_type || 'Single-Family Detached Houses',
    houseAge: prop.house_age != null ? String(prop.house_age) : '0',
    houseBedrooms: prop.house_bedrooms != null ? String(prop.house_bedrooms) : '3',
    houseBathrooms: prop.house_bathrooms != null ? String(prop.house_bathrooms) : '2',
    houseTotalRooms: prop.house_total_rooms != null ? String(prop.house_total_rooms) : '5',
    houseTotalFloors: prop.house_total_floors != null ? String(prop.house_total_floors) : '2',

    // Villa
    villaBedrooms: prop.villa_bedrooms != null ? String(prop.villa_bedrooms) : '4',
    villaBathrooms: prop.villa_bathrooms != null ? String(prop.villa_bathrooms) : '4',
    villaTotalFloors: prop.villa_total_floors != null ? String(prop.villa_total_floors) : '2',
    villaPlotArea: prop.villa_plot_area != null ? String(prop.villa_plot_area) : '3500',
    villaAmenities: prop.villa_amenities || [],

    // Apartment
    apartmentTotalFloors: prop.apartment_total_floors != null ? String(prop.apartment_total_floors) : '12',
    apartmentUnitBedrooms: prop.apartment_unit_bedrooms != null ? String(prop.apartment_unit_bedrooms) : '2',
    apartmentUnitBathrooms: prop.apartment_unit_bathrooms != null ? String(prop.apartment_unit_bathrooms) : '2',
    flatFloorNumber: prop.flat_floor_number != null ? String(prop.flat_floor_number) : '3',

    // Plot / Land
    accessRoadType: prop.access_road_type || 'Highway Road',
    cornerPlotStatus: Boolean(prop.corner_plot_status),
    plotFacing: prop.plot_facing || 'East',

    // Agricultural
    croppingIntensity: prop.cropping_intensity || 'Dual-crop',
    cropFallowDuration: prop.crop_fallow_duration != null ? String(prop.crop_fallow_duration) : '1',
    waterPumpCount: prop.water_pump_count != null ? String(prop.water_pump_count) : '1',
    solarGridIntegration: Boolean(prop.solar_grid_integration),

    // Arrays
    selectedLandFactors: prop.land_factors || [],
    selectedSoilAndInfra: prop.soil_and_infrastructure || [],
    commercialPlotFeatures: prop.commercial_plot_features || [],

    // Images
    imageUrls: images,
  };
}

// ─── AI Feature Labels ────────────────────────────────────────────────────────
export const AI_FEATURE_LABELS = {
  price_prediction: { label: 'AI Price Prediction', color: '#6366f1' },
  description_generator: { label: 'AI Description Generator', color: '#8b5cf6' },
  investment_score: { label: 'Investment Score', color: '#10b981' },
  land_valuation: { label: 'AI Land Valuation', color: '#10b981' },
  farming_suitability: { label: 'AI Farming Suitability', color: '#34d399' },
  investment_potential: { label: 'Investment Potential', color: '#6366f1' },
  roi_prediction: { label: 'AI ROI Prediction', color: '#f59e0b' },
  business_potential: { label: 'Business Potential Score', color: '#ef4444' },
};
