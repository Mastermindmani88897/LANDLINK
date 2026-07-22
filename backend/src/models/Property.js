const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── Embedded Sub-Documents ──────────────────────────────────────────────────
const propertyImageSchema = new Schema(
  {
    image_url: { type: String, required: true },
    analyzed_cracks: { type: Boolean, default: false },
    analyzed_leakage: { type: Boolean, default: false },
    analyzed_paint: { type: String, default: 'Good' },
    analyzed_flooring: { type: String, default: 'Good' },
    analyzed_garden: { type: String, default: 'N/A' },
    analyzed_roof: { type: String, default: 'Good' },
    condition_score: { type: Number, default: 10.0 },
  },
  { timestamps: { createdAt: 'created_at' } }
);

// ─── Main Property Document ──────────────────────────────────────────────────
const propertySchema = new Schema(
  {
    seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User' },

    // Core Info
    title: { type: String, required: true },
    description: { type: String, default: null },
    property_type: { type: String, required: true },
    house_type: { type: String, default: null },
    land_factors: [{ type: String }],
    soil_and_infrastructure: [{ type: String }],
    commercial_plot_features: [{ type: String }],
    area_unit: { type: String, default: 'sq ft' },

    // Financials
    expected_price: { type: Number, required: true },
    min_expected_price: { type: Number, default: null },
    max_expected_price: { type: Number, default: null },
    original_price: { type: Number, default: null },
    negotiable: { type: Boolean, default: true },

    // Features
    area_sqft: { type: Number, required: true },
    min_area_sqft: { type: Number, default: null },
    max_area_sqft: { type: Number, default: null },
    bedrooms: { type: Number, default: 0 },
    min_bedrooms: { type: Number, default: null },
    max_bedrooms: { type: Number, default: null },
    bathrooms: { type: Number, default: 0 },
    min_bathrooms: { type: Number, default: null },
    max_bathrooms: { type: Number, default: null },
    floors: { type: Number, default: 1 },
    min_floors: { type: Number, default: null },
    max_floors: { type: Number, default: null },
    parking: { type: Number, default: 0 },
    year_built: { type: Number, default: null },
    ownership_type: { type: String, default: null },
    property_age: { type: Number, default: null },
    min_property_age: { type: Number, default: null },
    max_property_age: { type: Number, default: null },
    furnished_status: { type: String, default: 'Unfurnished' },

    // House Specific Fields
    house_bedrooms: { type: Number, default: 0 },
    house_bathrooms: { type: Number, default: 0 },
    house_age: { type: Number, default: 0 },
    house_total_rooms: { type: Number, default: 0 },
    min_house_total_rooms: { type: Number, default: null },
    max_house_total_rooms: { type: Number, default: null },
    house_total_floors: { type: Number, default: 1 },

    // Villa Specific Fields
    villa_bedrooms: { type: Number, default: 0 },
    villa_bathrooms: { type: Number, default: 0 },
    villa_total_floors: { type: Number, default: 1 },
    villa_plot_area: { type: Number, default: 0 },
    min_villa_plot_area: { type: Number, default: null },
    max_villa_plot_area: { type: Number, default: null },
    villa_amenities: [{ type: String }],

    // Flat and Apartment Specific Fields
    apartment_total_floors: { type: Number, default: 1 },
    apartment_rooms_per_floor: { type: Number, default: 0 },
    apartment_unit_bedrooms: { type: Number, default: 0 },
    apartment_unit_bathrooms: { type: Number, default: 0 },
    apartment_units_per_floor: { type: Number, default: 1 },
    apartment_total_flats: { type: Number, default: 0 },
    flat_floor_number: { type: Number, default: 1 },

    // Road and Access Fields
    access_road_type: { type: String, default: null },
    corner_plot_status: { type: Boolean, default: false },
    plot_facing: { type: String, default: null },

    // Agricultural Cultivation Fields
    cropping_intensity: { type: String, default: null },
    crop_fallow_duration: { type: Number, default: 0 },
    min_crop_fallow_duration: { type: Number, default: null },
    max_crop_fallow_duration: { type: Number, default: null },

    // Infrastructure and Utility Fields
    water_pump_count: { type: Number, default: 0 },
    min_water_pump_count: { type: Number, default: null },
    max_water_pump_count: { type: Number, default: null },
    solar_grid_integration: { type: Boolean, default: false },

    // Location
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    lat: { type: Number, default: 19.076 },
    lng: { type: Number, default: 72.8777 },

    // Infrastructure
    water_supply: { type: String, default: null },
    electricity: { type: String, default: null },
    road_access: { type: String, default: null },
    nearby_schools: { type: String, default: null },
    nearby_hospitals: { type: String, default: null },

    // Seller contact
    reason_for_selling: { type: String, default: null },
    contact_number: { type: String, default: null },
    whatsapp_number: { type: String, default: null },
    contact_email: { type: String, default: null },

    // Status & Moderation
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'sold'], default: 'pending' },
    is_flagged: { type: Boolean, default: false },
    views: { type: Number, default: 0 },

    // AI Scores
    neighborhood_score: { type: Number, default: 0.0 },
    safety_score: { type: Number, default: 0.0 },
    family_score: { type: Number, default: 0.0 },
    investment_score: { type: Number, default: 0.0 },
    overall_condition_score: { type: Number, default: 0.0 },
    fraud_score: { type: Number, default: 0.0 },

    // Embedded arrays
    images: [propertyImageSchema],
    amenities: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Indexes for search
propertySchema.index({ city: 'text', title: 'text' });
propertySchema.index({ status: 1 });
propertySchema.index({ seller_id: 1 });

propertySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.seller_id = ret.seller_id?._id ? ret.seller_id._id.toString() : ret.seller_id?.toString();
    delete ret._id;
    delete ret.__v;
    // Normalize embedded image ids
    if (ret.images) {
      ret.images = ret.images.map((img) => {
        img.id = img._id?.toString();
        delete img._id;
        return img;
      });
    }
    return ret;
  },
});

module.exports = mongoose.model('Property', propertySchema);
