// Constants for Property Types, Specific Category Fields, Access Roads & Utilities

export const PROPERTY_TYPES = [
  'House',
  'Apartment',
  'Flat',
  'Villa',
  'Residential Plot',
  'Commercial Plot',
  'Commercial Building',
  'Commercial',
  'Agricultural Land',
];

export const FURNISHED_STATUS_OPTIONS = [
  'Unfurnished',
  'Semi-Furnished',
  'Fully Furnished',
];

export const PLOT_FACING_OPTIONS = [
  'East',
  'West',
  'North',
  'South',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
];

export const COMMERCIAL_PLOT_OPTIONS = [
  'Grid Electricity Connectivity',
  'Public Water Supply Access',
  'Borewell and Groundwater Feasibility',
  'Sewage and Drainage Discharge',
  'Telecommunication and Fiber Coverage',
];

export const AREA_UNITS = [
  { label: 'Square Feet (sq ft)', value: 'sq ft', factorSqft: 1 },
  { label: 'Square Meter (sq m)', value: 'sq m', factorSqft: 10.7639 },
  { label: 'Square Yard (sq yd)', value: 'sq yd', factorSqft: 9 },
  { label: 'Square Kilometer (sq km)', value: 'sq km', factorSqft: 10763910.4 },
  { label: 'Hectare (ha)', value: 'ha', factorSqft: 107639.1 },
  { label: 'Acre (ac)', value: 'ac', factorSqft: 43560 },
  { label: 'Cents', value: 'cents', factorSqft: 435.6 },
];

export const HOUSE_TYPES = [
  'Single-Family Detached Houses',
  'Semi-Detached and Duplex Houses',
  'Townhouses',
  'Apartments and Condominiums',
  'Farmhouses',
];

export const VILLA_AMENITIES_OPTIONS = [
  'Private Pool',
  'Private Garden',
  'Private Boundary Wall',
];

export const ACCESS_ROAD_TYPES = [
  'Highway Road',
  'Main Arterial Road',
  'Cul-de-sac/Dead-end',
  'Minor Local Road',
];

export const CROPPING_INTENSITY_OPTIONS = [
  'Single-crop',
  'Dual-crop',
  'Multiple-crop',
];

export const LAND_COST_FACTORS = [
  'Highway Proximity and Commercial Visibility',
  'Main Arterial Road Accessibility',
  'Corner Plot Advantages',
  'Dead-End and Cul-de-sac Traffic Controls',
];

export const SOIL_AND_INFRASTRUCTURE = [
  'Single-Crop Agricultural Limitations',
  'Dual and Multiple-Crop Fertilities',
  'Crop Fallow Durations and Soil Health',
  'Water Pump and Borewell Irrigation Capacities',
  'Solar Power Grid Infrastructure',
];
