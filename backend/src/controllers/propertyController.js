const Property = require('../models/Property');
const Favorite = require('../models/Favorite');
const Visit = require('../models/Visit');
const Offer = require('../models/Offer');
const Review = require('../models/Review');
const AiLog = require('../models/AiLog');
const User = require('../models/User');
const aiService = require('../services/aiService');

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Helper: populate seller details
const populateProperty = async (property) => {
  if (property.seller_id) await property.populate('seller_id', '-password_hash');
  if (property.seller) await property.populate('seller', '-password_hash');
  const json = property.toJSON();
  const rawSeller = (json.seller && typeof json.seller === 'object') ? json.seller : json.seller_id;
  if (rawSeller && typeof rawSeller === 'object') {
    const formattedSeller = {
      _id: rawSeller._id || rawSeller.id,
      id: rawSeller.id || rawSeller._id,
      name: rawSeller.full_name || rawSeller.name || 'Property Owner',
      full_name: rawSeller.full_name || rawSeller.name || 'Property Owner',
      email: rawSeller.email || json.contact_email || '',
      phone: rawSeller.phone_number || rawSeller.phone || json.contact_number || '',
      phone_number: rawSeller.phone_number || rawSeller.phone || json.contact_number || '',
      whatsapp_number: rawSeller.whatsapp_number || json.whatsapp_number || '',
      city: rawSeller.city || json.city || '',
      state: rawSeller.state || json.state || '',
      profileImage: rawSeller.profile_image_url || rawSeller.profileImage || null,
      profile_image_url: rawSeller.profile_image_url || rawSeller.profileImage || null,
    };
    json.seller = formattedSeller;
    json.seller_id = formattedSeller._id;
  }
  return json;
};

// GET /api/v1/properties/
const searchProperties = async (req, res) => {
  const {
    city, property_type, house_type, land_factors, soil_and_infrastructure, commercial_plot_features, area_unit,
    min_price, max_price, min_area, max_area,
    bedrooms, min_bedrooms, max_bedrooms,
    bathrooms, min_bathrooms, max_bathrooms,
    min_age, max_age,
    min_floors, max_floors,
    min_rooms, max_rooms,
    min_plot_area, max_plot_area,
    min_fallow_duration, max_fallow_duration,
    min_water_pump_count, max_water_pump_count,
    access_road_type, corner_plot_status, solar_grid_integration, cropping_intensity, villa_amenities,
    sort_by = 'newest', limit = 50, offset = 0
  } = req.query;

  const filter = {};
  if (city) {
    filter.city = new RegExp(city, 'i');
  }
  if (property_type) {
    if (property_type === 'Flat') {
      filter.property_type = { $in: ['Flat', 'Flat/Apartment'] };
    } else if (property_type === 'Apartment') {
      filter.property_type = { $in: ['Apartment', 'Flat/Apartment'] };
    } else {
      filter.property_type = property_type;
    }
  }
  if (house_type) filter.house_type = house_type;
  if (land_factors) filter.land_factors = { $in: Array.isArray(land_factors) ? land_factors : [land_factors] };
  if (soil_and_infrastructure) filter.soil_and_infrastructure = { $in: Array.isArray(soil_and_infrastructure) ? soil_and_infrastructure : [soil_and_infrastructure] };
  if (commercial_plot_features) filter.commercial_plot_features = { $in: Array.isArray(commercial_plot_features) ? commercial_plot_features : [commercial_plot_features] };

  // Price Range Filter
  if (min_price || max_price) {
    const minP = min_price ? parseFloat(min_price) : 0;
    const maxP = max_price ? parseFloat(max_price) : Number.MAX_SAFE_INTEGER;
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { expected_price: { $gte: minP, $lte: maxP } },
        { min_expected_price: { $lte: maxP }, max_expected_price: { $gte: minP } }
      ]
    });
  }

  // Area Range Filter
  if (min_area || max_area) {
    const minA = min_area ? parseFloat(min_area) : 0;
    const maxA = max_area ? parseFloat(max_area) : Number.MAX_SAFE_INTEGER;
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { area_sqft: { $gte: minA, $lte: maxA } },
        { min_area_sqft: { $lte: maxA }, max_area_sqft: { $gte: minA } }
      ]
    });
  }

  // Bedrooms Range Filter
  if (min_bedrooms || max_bedrooms || bedrooms) {
    const minB = min_bedrooms ? parseInt(min_bedrooms) : (bedrooms ? parseInt(bedrooms) : 0);
    const maxB = max_bedrooms ? parseInt(max_bedrooms) : Number.MAX_SAFE_INTEGER;
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { bedrooms: { $gte: minB, $lte: maxB } },
        { house_bedrooms: { $gte: minB, $lte: maxB } },
        { villa_bedrooms: { $gte: minB, $lte: maxB } },
        { apartment_unit_bedrooms: { $gte: minB, $lte: maxB } },
        { min_bedrooms: { $lte: maxB }, max_bedrooms: { $gte: minB } }
      ]
    });
  }

  // Bathrooms Range Filter
  if (min_bathrooms || max_bathrooms || bathrooms) {
    const minBath = min_bathrooms ? parseInt(min_bathrooms) : (bathrooms ? parseInt(bathrooms) : 0);
    const maxBath = max_bathrooms ? parseInt(max_bathrooms) : Number.MAX_SAFE_INTEGER;
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { bathrooms: { $gte: minBath, $lte: maxBath } },
        { house_bathrooms: { $gte: minBath, $lte: maxBath } },
        { villa_bathrooms: { $gte: minBath, $lte: maxBath } },
        { apartment_unit_bathrooms: { $gte: minBath, $lte: maxBath } },
        { min_bathrooms: { $lte: maxBath }, max_bathrooms: { $gte: minBath } }
      ]
    });
  }

  // Age Range Filter
  if (min_age || max_age) {
    const minAg = min_age ? parseFloat(min_age) : 0;
    const maxAg = max_age ? parseFloat(max_age) : Number.MAX_SAFE_INTEGER;
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { property_age: { $gte: minAg, $lte: maxAg } },
        { house_age: { $gte: minAg, $lte: maxAg } },
        { min_property_age: { $lte: maxAg }, max_property_age: { $gte: minAg } }
      ]
    });
  }

  // Floors Range Filter
  if (min_floors || max_floors) {
    const minFl = min_floors ? parseInt(min_floors) : 0;
    const maxFl = max_floors ? parseInt(max_floors) : Number.MAX_SAFE_INTEGER;
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { floors: { $gte: minFl, $lte: maxFl } },
        { house_total_floors: { $gte: minFl, $lte: maxFl } },
        { villa_total_floors: { $gte: minFl, $lte: maxFl } },
        { apartment_total_floors: { $gte: minFl, $lte: maxFl } },
        { min_floors: { $lte: maxFl }, max_floors: { $gte: minFl } }
      ]
    });
  }

  // Plot Area Range Filter
  if (min_plot_area || max_plot_area) {
    const minP = min_plot_area ? parseFloat(min_plot_area) : 0;
    const maxP = max_plot_area ? parseFloat(max_plot_area) : Number.MAX_SAFE_INTEGER;
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { villa_plot_area: { $gte: minP, $lte: maxP } },
        { area_sqft: { $gte: minP, $lte: maxP } },
        { min_villa_plot_area: { $lte: maxP }, max_villa_plot_area: { $gte: minP } }
      ]
    });
  }

  // Fallow Duration Range Filter
  if (min_fallow_duration || max_fallow_duration) {
    const minF = min_fallow_duration ? parseFloat(min_fallow_duration) : 0;
    const maxF = max_fallow_duration ? parseFloat(max_fallow_duration) : Number.MAX_SAFE_INTEGER;
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { crop_fallow_duration: { $gte: minF, $lte: maxF } },
        { min_crop_fallow_duration: { $lte: maxF }, max_crop_fallow_duration: { $gte: minF } }
      ]
    });
  }

  // Water Pumps Count Range Filter
  if (min_water_pump_count || max_water_pump_count) {
    const minW = min_water_pump_count ? parseInt(min_water_pump_count) : 0;
    const maxW = max_water_pump_count ? parseInt(max_water_pump_count) : Number.MAX_SAFE_INTEGER;
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { water_pump_count: { $gte: minW, $lte: maxW } },
        { min_water_pump_count: { $lte: maxW }, max_water_pump_count: { $gte: minW } }
      ]
    });
  }

  // Category attributes
  if (access_road_type) filter.access_road_type = access_road_type;
  if (corner_plot_status !== undefined && corner_plot_status !== '' && corner_plot_status !== 'all') {
    filter.corner_plot_status = corner_plot_status === 'true' || corner_plot_status === true;
  }
  if (solar_grid_integration !== undefined && solar_grid_integration !== '' && solar_grid_integration !== 'all') {
    filter.solar_grid_integration = solar_grid_integration === 'true' || solar_grid_integration === true;
  }
  if (cropping_intensity) filter.cropping_intensity = cropping_intensity;
  if (villa_amenities) {
    filter.villa_amenities = { $in: Array.isArray(villa_amenities) ? villa_amenities : [villa_amenities] };
  }

  const sortMap = { newest: { created_at: -1 }, oldest: { created_at: 1 }, price_low: { expected_price: 1 }, price_high: { expected_price: -1 } };
  const sortOrder = sortMap[sort_by] || { created_at: -1 };

  const properties = await Property.find(filter).sort(sortOrder).skip(parseInt(offset)).limit(parseInt(limit));
  const result = await Promise.all(properties.map((p) => populateProperty(p)));
  res.json(result);
};

// POST /api/v1/properties/
const createProperty = async (req, res) => {
  const {
    title, description, property_type, house_type, land_factors = [], soil_and_infrastructure = [], commercial_plot_features = [], area_unit = 'sq ft',
    expected_price, min_expected_price, max_expected_price, original_price, negotiable = true,
    area_sqft, min_area_sqft, max_area_sqft,
    bedrooms = 0, min_bedrooms, max_bedrooms,
    bathrooms = 0, min_bathrooms, max_bathrooms,
    floors = 1, min_floors, max_floors,
    parking = 0, year_built, ownership_type,
    property_age, min_property_age, max_property_age, furnished_status = 'Unfurnished',
    // Specific category fields
    house_bedrooms, house_bathrooms, house_age, house_total_rooms, min_house_total_rooms, max_house_total_rooms, house_total_floors,
    villa_bedrooms, villa_bathrooms, villa_total_floors, villa_plot_area, min_villa_plot_area, max_villa_plot_area, villa_amenities = [],
    apartment_total_floors, apartment_rooms_per_floor, apartment_unit_bedrooms, apartment_unit_bathrooms, apartment_units_per_floor, apartment_total_flats, flat_floor_number,
    access_road_type, corner_plot_status = false,
    cropping_intensity, crop_fallow_duration = 0, min_crop_fallow_duration, max_crop_fallow_duration,
    water_pump_count = 0, min_water_pump_count, max_water_pump_count, solar_grid_integration = false,
    address, city, state, country = 'India', lat, lng,
    water_supply, electricity, road_access, nearby_schools, nearby_hospitals,
    reason_for_selling, contact_number, whatsapp_number, contact_email,
    images = [], amenities = [], tags = []
  } = req.body;

  // Seller details fallback to logged-in user profile if not specified
  const finalContactNumber = contact_number || req.user.phone_number || '';
  const finalWhatsappNumber = whatsapp_number || req.user.whatsapp_number || finalContactNumber;
  const finalContactEmail = contact_email || req.user.email;

  // Also update user's contact numbers on profile if they were supplied here
  if (contact_number && !req.user.phone_number) {
    await User.findByIdAndUpdate(req.user._id, { phone_number: contact_number, whatsapp_number: finalWhatsappNumber });
  }

  // Derive price & area defaults
  const finalExpectedPrice = parseFloat(expected_price || min_expected_price || max_expected_price || 0);
  const finalMinPrice = min_expected_price ? parseFloat(min_expected_price) : finalExpectedPrice;
  const finalMaxPrice = max_expected_price ? parseFloat(max_expected_price) : finalExpectedPrice;

  const finalAreaSqft = parseFloat(area_sqft || min_area_sqft || max_area_sqft || 0);
  const finalMinArea = min_area_sqft ? parseFloat(min_area_sqft) : finalAreaSqft;
  const finalMaxArea = max_area_sqft ? parseFloat(max_area_sqft) : finalAreaSqft;

  // 1. AI Fraud Detection
  const fraudRes = await aiService.detectPropertyFraud(title, description || '', finalExpectedPrice, images);

  // 2. AI Neighborhood Analysis
  const neighRes = await aiService.analyzeNeighborhood(address, city);

  // 3. AI Image Analysis
  let conditionScore = 9.2;
  if (images.length > 0) {
    const survey = await aiService.analyzePropertyImages(images);
    conditionScore = survey.overall_score || 9.2;
  }

  // Log AI actions
  await AiLog.create({
    user_id: req.user._id,
    feature_name: 'Property Listing Creation & AI Inspection',
    prompt: `Title: ${title}, Price: ${finalExpectedPrice}`,
    response: `Fraud Score: ${fraudRes.fraud_score}, Neighborhood: ${neighRes.neighborhood_score}`,
  });

  const age = property_age || house_age || (year_built ? new Date().getFullYear() - year_built : null);
  const aiTags = aiService.generateSmartTags(title, description || '', amenities);
  const combinedTags = Array.from(new Set([...(tags || []), ...aiTags]));

  const imagesData = (images || []).map((img) => {
    const url = typeof img === 'string' ? img : (img.image_url || img);
    return {
      image_url: url,
      analyzed_cracks: false,
      analyzed_leakage: false,
      analyzed_paint: 'Good',
      analyzed_flooring: 'Good',
      analyzed_garden: 'N/A',
      analyzed_roof: 'Good',
      condition_score: conditionScore,
    };
  });

  const isVillaType = property_type === 'Villa' || property_type === 'Flat';

  const property = await Property.create({
    seller_id: req.user._id,
    seller: req.user._id,
    title, description, property_type, house_type, land_factors, soil_and_infrastructure, commercial_plot_features, area_unit,
    expected_price: finalExpectedPrice,
    min_expected_price: finalMinPrice,
    max_expected_price: finalMaxPrice,
    original_price: original_price || finalExpectedPrice,
    negotiable,
    area_sqft: finalAreaSqft,
    min_area_sqft: finalMinArea,
    max_area_sqft: finalMaxArea,
    bedrooms: parseInt(bedrooms || house_bedrooms || villa_bedrooms || apartment_unit_bedrooms || min_bedrooms || 0),
    min_bedrooms: min_bedrooms ? parseInt(min_bedrooms) : parseInt(bedrooms || house_bedrooms || 0),
    max_bedrooms: max_bedrooms ? parseInt(max_bedrooms) : parseInt(bedrooms || house_bedrooms || 0),
    bathrooms: parseInt(bathrooms || house_bathrooms || villa_bathrooms || apartment_unit_bathrooms || min_bathrooms || 0),
    min_bathrooms: min_bathrooms ? parseInt(min_bathrooms) : parseInt(bathrooms || house_bathrooms || 0),
    max_bathrooms: max_bathrooms ? parseInt(max_bathrooms) : parseInt(bathrooms || house_bathrooms || 0),
    floors: parseInt(floors || house_total_floors || villa_total_floors || apartment_total_floors || min_floors || 1),
    min_floors: min_floors ? parseInt(min_floors) : parseInt(floors || 1),
    max_floors: max_floors ? parseInt(max_floors) : parseInt(floors || 1),
    parking: parseInt(parking || 0),
    year_built, ownership_type,
    property_age: age ? parseFloat(age) : null,
    min_property_age: min_property_age ? parseFloat(min_property_age) : age,
    max_property_age: max_property_age ? parseFloat(max_property_age) : age,
    furnished_status,
    house_bedrooms: parseInt(house_bedrooms || bedrooms || 0),
    house_bathrooms: parseInt(house_bathrooms || bathrooms || 0),
    house_age: parseFloat(house_age || age || 0),
    house_total_rooms: parseInt(house_total_rooms || 0),
    min_house_total_rooms: min_house_total_rooms ? parseInt(min_house_total_rooms) : parseInt(house_total_rooms || 0),
    max_house_total_rooms: max_house_total_rooms ? parseInt(max_house_total_rooms) : parseInt(house_total_rooms || 0),
    house_total_floors: parseInt(house_total_floors || floors || 1),
    villa_bedrooms: parseInt(villa_bedrooms || bedrooms || 0),
    villa_bathrooms: parseInt(villa_bathrooms || bathrooms || 0),
    villa_total_floors: parseInt(villa_total_floors || floors || 1),
    villa_plot_area: parseFloat(villa_plot_area || area_sqft || 0),
    min_villa_plot_area: min_villa_plot_area ? parseFloat(min_villa_plot_area) : parseFloat(villa_plot_area || 0),
    max_villa_plot_area: max_villa_plot_area ? parseFloat(max_villa_plot_area) : parseFloat(villa_plot_area || 0),
    villa_amenities: villa_amenities || [],
    apartment_total_floors: parseInt(apartment_total_floors || floors || 1),
    apartment_rooms_per_floor: parseInt(apartment_rooms_per_floor || 0),
    apartment_unit_bedrooms: parseInt(apartment_unit_bedrooms || bedrooms || 0),
    apartment_unit_bathrooms: parseInt(apartment_unit_bathrooms || bathrooms || 0),
    apartment_units_per_floor: parseInt(apartment_units_per_floor || 1),
    apartment_total_flats: parseInt(apartment_total_flats || 0),
    flat_floor_number: parseInt(flat_floor_number || 1),
    access_road_type: access_road_type || null,
    corner_plot_status: !!corner_plot_status,
    cropping_intensity: cropping_intensity || null,
    crop_fallow_duration: parseFloat(crop_fallow_duration || min_crop_fallow_duration || 0),
    min_crop_fallow_duration: min_crop_fallow_duration ? parseFloat(min_crop_fallow_duration) : parseFloat(crop_fallow_duration || 0),
    max_crop_fallow_duration: max_crop_fallow_duration ? parseFloat(max_crop_fallow_duration) : parseFloat(crop_fallow_duration || 0),
    water_pump_count: isVillaType ? 0 : parseInt(water_pump_count || min_water_pump_count || 0),
    min_water_pump_count: isVillaType ? 0 : (min_water_pump_count ? parseInt(min_water_pump_count) : parseInt(water_pump_count || 0)),
    max_water_pump_count: isVillaType ? 0 : (max_water_pump_count ? parseInt(max_water_pump_count) : parseInt(water_pump_count || 0)),
    solar_grid_integration: !!solar_grid_integration,
    address, city, state, country,
    lat: lat || 19.076, lng: lng || 72.8777,
    water_supply, electricity, road_access, nearby_schools, nearby_hospitals,
    reason_for_selling,
    contact_number: finalContactNumber,
    whatsapp_number: finalWhatsappNumber,
    contact_email: finalContactEmail,
    fraud_score: fraudRes.fraud_score,
    is_flagged: fraudRes.is_suspicious,
    neighborhood_score: neighRes.neighborhood_score,
    safety_score: neighRes.safety_score,
    family_score: neighRes.family_score,
    investment_score: neighRes.investment_score,
    overall_condition_score: conditionScore,
    status: 'approved', // Auto-approved for immediate display
    images: imagesData,
    amenities,
    tags: combinedTags,
  });

  res.status(201).json(await populateProperty(property));
};

// GET /api/v1/properties/my-listings
const getMyListings = async (req, res) => {
  const properties = await Property.find({
    $or: [{ seller_id: req.user._id }, { seller: req.user._id }]
  }).sort({ created_at: -1 });
  const result = await Promise.all(properties.map((p) => populateProperty(p)));
  res.json(result);
};

// GET /api/v1/properties/favorites/all
const getFavorites = async (req, res) => {
  const favDocs = await Favorite.find({ user_id: req.user._id }).populate({
    path: 'property_id',
    populate: { path: 'seller_id', select: '-password_hash' }
  });
  const result = await Promise.all(
    favDocs.filter(f => f.property_id).map(f => populateProperty(f.property_id))
  );
  res.json(result);
};

// GET /api/v1/properties/:id
const getProperty = async (req, res) => {
  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!property) throw createError('Property not found', 404);
  res.json(await populateProperty(property));
};

// PUT /api/v1/properties/:id  (UPDATE LISTING BY OWNER)
const updateProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw createError('Property not found', 404);

  // Check ownership or admin role
  const ownerId = property.seller_id?.toString() || property.seller?.toString() || property.seller?._id?.toString();
  const isOwner = req.user && ownerId === req.user._id.toString();
  const isAdmin = req.user && req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw createError('You are not authorized to edit this listing', 403);
  }

  const {
    title, description, property_type, house_type, land_factors, soil_and_infrastructure, commercial_plot_features, area_unit, expected_price, original_price, negotiable,
    area_sqft, bedrooms, bathrooms, floors, parking, year_built,
    ownership_type, property_age, furnished_status,
    house_bedrooms, house_bathrooms, house_age, house_total_rooms, house_total_floors,
    villa_bedrooms, villa_bathrooms, villa_total_floors, villa_plot_area, villa_amenities,
    apartment_total_floors, apartment_rooms_per_floor, apartment_unit_bedrooms, apartment_unit_bathrooms, apartment_units_per_floor,
    access_road_type, corner_plot_status,
    cropping_intensity, crop_fallow_duration,
    water_pump_count, solar_grid_integration,
    address, city, state, country,
    water_supply, electricity, road_access, nearby_schools, nearby_hospitals,
    reason_for_selling, contact_number, whatsapp_number, contact_email,
    images, amenities, tags
  } = req.body;

  if (title !== undefined) property.title = title;
  if (description !== undefined) property.description = description;
  if (property_type !== undefined) property.property_type = property_type;
  if (house_type !== undefined) property.house_type = house_type;
  if (land_factors !== undefined) property.land_factors = land_factors;
  if (soil_and_infrastructure !== undefined) property.soil_and_infrastructure = soil_and_infrastructure;
  if (commercial_plot_features !== undefined) property.commercial_plot_features = commercial_plot_features;
  if (area_unit !== undefined) property.area_unit = area_unit;
  if (house_bedrooms !== undefined) property.house_bedrooms = parseInt(house_bedrooms);
  if (house_bathrooms !== undefined) property.house_bathrooms = parseInt(house_bathrooms);
  if (house_age !== undefined) property.house_age = parseFloat(house_age);
  if (house_total_rooms !== undefined) property.house_total_rooms = parseInt(house_total_rooms);
  if (house_total_floors !== undefined) property.house_total_floors = parseInt(house_total_floors);
  if (villa_bedrooms !== undefined) property.villa_bedrooms = parseInt(villa_bedrooms);
  if (villa_bathrooms !== undefined) property.villa_bathrooms = parseInt(villa_bathrooms);
  if (villa_total_floors !== undefined) property.villa_total_floors = parseInt(villa_total_floors);
  if (villa_plot_area !== undefined) property.villa_plot_area = parseFloat(villa_plot_area);
  if (villa_amenities !== undefined) property.villa_amenities = villa_amenities;
  if (apartment_total_floors !== undefined) property.apartment_total_floors = parseInt(apartment_total_floors);
  if (apartment_rooms_per_floor !== undefined) property.apartment_rooms_per_floor = parseInt(apartment_rooms_per_floor);
  if (apartment_unit_bedrooms !== undefined) property.apartment_unit_bedrooms = parseInt(apartment_unit_bedrooms);
  if (apartment_unit_bathrooms !== undefined) property.apartment_unit_bathrooms = parseInt(apartment_unit_bathrooms);
  if (apartment_units_per_floor !== undefined) property.apartment_units_per_floor = parseInt(apartment_units_per_floor);
  if (apartment_total_flats !== undefined) property.apartment_total_flats = parseInt(apartment_total_flats);
  if (flat_floor_number !== undefined) property.flat_floor_number = parseInt(flat_floor_number);
  if (access_road_type !== undefined) property.access_road_type = access_road_type;
  if (corner_plot_status !== undefined) property.corner_plot_status = !!corner_plot_status;
  if (cropping_intensity !== undefined) property.cropping_intensity = cropping_intensity;
  if (crop_fallow_duration !== undefined) property.crop_fallow_duration = parseFloat(crop_fallow_duration);
  if (property.property_type === 'Villa' || property.property_type === 'Flat') property.water_pump_count = 0;
  else if (water_pump_count !== undefined) property.water_pump_count = parseInt(water_pump_count);
  if (solar_grid_integration !== undefined) property.solar_grid_integration = !!solar_grid_integration;
  if (expected_price !== undefined) property.expected_price = parseFloat(expected_price);
  if (original_price !== undefined) property.original_price = parseFloat(original_price);
  if (negotiable !== undefined) property.negotiable = negotiable;
  if (area_sqft !== undefined) property.area_sqft = parseFloat(area_sqft);
  if (bedrooms !== undefined) property.bedrooms = parseInt(bedrooms);
  if (bathrooms !== undefined) property.bathrooms = parseInt(bathrooms);
  if (floors !== undefined) property.floors = parseInt(floors);
  if (parking !== undefined) property.parking = parseInt(parking);
  if (year_built !== undefined) property.year_built = year_built;
  if (ownership_type !== undefined) property.ownership_type = ownership_type;
  if (property_age !== undefined) property.property_age = property_age;
  if (furnished_status !== undefined) property.furnished_status = furnished_status;
  if (address !== undefined) property.address = address;
  if (city !== undefined) property.city = city;
  if (state !== undefined) property.state = state;
  if (country !== undefined) property.country = country;
  if (water_supply !== undefined) property.water_supply = water_supply;
  if (electricity !== undefined) property.electricity = electricity;
  if (road_access !== undefined) property.road_access = road_access;
  if (nearby_schools !== undefined) property.nearby_schools = nearby_schools;
  if (nearby_hospitals !== undefined) property.nearby_hospitals = nearby_hospitals;
  if (reason_for_selling !== undefined) property.reason_for_selling = reason_for_selling;
  if (contact_number !== undefined) property.contact_number = contact_number;
  if (whatsapp_number !== undefined) property.whatsapp_number = whatsapp_number;
  if (contact_email !== undefined) property.contact_email = contact_email;
  if (req.body.status !== undefined) property.status = req.body.status;
  if (amenities !== undefined) property.amenities = amenities;
  if (tags !== undefined) property.tags = tags;

  if (images !== undefined && Array.isArray(images)) {
    property.images = images.map((url) => ({
      image_url: url,
      analyzed_cracks: false,
      analyzed_leakage: false,
      analyzed_paint: 'Good',
      analyzed_flooring: 'Good',
      analyzed_garden: 'N/A',
      analyzed_roof: 'Good',
      condition_score: property.overall_condition_score || 9.2,
    }));
  }

  await property.save();
  res.json(await populateProperty(property));
};

// DELETE /api/v1/properties/:id  (DELETE LISTING BY OWNER)
const deleteProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw createError('Property not found', 404);

  // Check ownership or admin role
  const ownerId = property.seller_id?.toString() || property.seller?.toString() || property.seller?._id?.toString();
  const isOwner = req.user && ownerId === req.user._id.toString();
  const isAdmin = req.user && req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw createError('You are not authorized to delete this listing', 403);
  }

  await Favorite.deleteMany({ property_id: req.params.id });
  await Visit.deleteMany({ property_id: req.params.id });
  await Offer.deleteMany({ property_id: req.params.id });
  await Review.deleteMany({ property_id: req.params.id });
  await property.deleteOne();

  res.json({ message: 'Property listing deleted successfully' });
};

// POST /api/v1/properties/:id/favorite
const toggleFavorite = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw createError('Property not found', 404);
  const existing = await Favorite.findOne({ user_id: req.user._id, property_id: req.params.id });
  if (existing) {
    await existing.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: req.params.id } });
    return res.json({ status: 'removed', message: 'Removed from favorites' });
  }
  await Favorite.create({ user_id: req.user._id, property_id: req.params.id });
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: req.params.id } });
  res.json({ status: 'added', message: 'Added to favorites' });
};

// POST /api/v1/properties/:id/visit
const scheduleVisit = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw createError('Property not found', 404);
  const { visit_date, notes } = req.body;
  const visit = await Visit.create({ property_id: req.params.id, buyer_id: req.user._id, visit_date, notes, status: 'pending' });
  await visit.populate(['property_id', 'buyer_id']);
  res.status(201).json(visit.toJSON());
};

// PUT /api/v1/properties/visit/:visitId/reply  (SELLER RESPONDS TO VISIT)
const replyVisit = async (req, res) => {
  const { visitId } = req.params;
  const { status, seller_reply } = req.body;
  const visit = await Visit.findById(visitId).populate('property_id');
  if (!visit) throw createError('Visit request not found', 404);

  if (status) visit.status = status;
  if (seller_reply !== undefined) visit.seller_reply = seller_reply;
  await visit.save();

  await visit.populate('buyer_id', '-password_hash');
  res.json(visit.toJSON());
};

// POST /api/v1/properties/:id/offers
const submitOffer = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw createError('Property not found', 404);
  const { offer_amount, notes } = req.body;
  const offer = await Offer.create({ property_id: req.params.id, buyer_id: req.user._id, offer_amount, notes });
  res.status(201).json(offer.toJSON());
};

// POST /api/v1/properties/:id/reviews
const writeReview = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw createError('Property not found', 404);
  const hasVisited = await Visit.findOne({ property_id: req.params.id, buyer_id: req.user._id, status: 'completed' });
  const hasOffered = await Offer.findOne({ property_id: req.params.id, buyer_id: req.user._id });
  const verified_buyer = !!(hasVisited || hasOffered);
  const { reviewee_id, rating, review_text } = req.body;
  const review = await Review.create({ property_id: req.params.id, reviewer_id: req.user._id, reviewee_id: reviewee_id || property.seller_id, rating, review_text, verified_buyer });
  await review.populate('reviewer_id', '-password_hash');
  const json = review.toJSON();
  if (json.reviewer_id && typeof json.reviewer_id === 'object') { json.reviewer = json.reviewer_id; }
  res.status(201).json(json);
};

// GET /api/v1/properties/:id/reviews
const getReviews = async (req, res) => {
  const reviews = await Review.find({ property_id: req.params.id }).populate('reviewer_id', '-password_hash');
  res.json(reviews.map((r) => { const json = r.toJSON(); if (json.reviewer_id && typeof json.reviewer_id === 'object') json.reviewer = json.reviewer_id; return json; }));
};

// AI ENDPOINTS
const aiGenerateDescription = async (req, res) => {
  const desc = await aiService.generatePropertyDescription(req.body);
  res.json({ generated_description: desc });
};

const aiImageAnalysis = async (req, res) => {
  const report = await aiService.analyzePropertyImages(req.body.image_urls || []);
  res.json(report);
};

const aiPricePrediction = async (req, res) => {
  const result = await aiService.predictPropertyPrice(req.body);
  res.json(result);
};

const aiNegotiate = async (req, res) => {
  const { property_id, buyer_offer } = req.body;
  const prop = await Property.findById(property_id);
  if (!prop) throw createError('Property listing not found', 404);
  const result = await aiService.negotiatePrice(prop.expected_price, prop.original_price || prop.expected_price, buyer_offer);
  res.json(result);
};

const aiInvestmentAnalysis = async (req, res) => {
  const prop = await Property.findById(req.params.id);
  if (!prop) throw createError('Property listing not found', 404);
  const result = await aiService.analyzeInvestment(prop.expected_price, prop.property_type, prop.city);
  res.json(result);
};

const aiNeighborhoodAnalysis = async (req, res) => {
  const prop = await Property.findById(req.params.id);
  if (!prop) throw createError('Property listing not found', 404);
  const result = await aiService.analyzeNeighborhood(prop.address, prop.city);
  res.json(result);
};

const aiChatAssistant = async (req, res) => {
  const prop = await Property.findById(req.params.id);
  if (!prop) throw createError('Property listing not found', 404);
  const propDict = {
    title: prop.title,
    property_type: prop.property_type,
    house_type: prop.house_type,
    land_factors: prop.land_factors || [],
    soil_and_infrastructure: prop.soil_and_infrastructure || [],
    expected_price: prop.expected_price,
    original_price: prop.original_price,
    negotiable: prop.negotiable,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    parking: prop.parking,
    property_age: prop.property_age,
    year_built: prop.year_built,
    address: prop.address,
    city: prop.city,
    description: prop.description || '',
    amenities: prop.amenities
  };
  const answer = await aiService.askListingChat(propDict, req.body.question);
  res.json({ answer });
};

const aiInteriorSuggestions = async (req, res) => {
  const result = await aiService.suggestInteriorImprovements(req.body.image_urls || []);
  res.json(result);
};

module.exports = {
  searchProperties, createProperty, getProperty, updateProperty, deleteProperty,
  getMyListings, getFavorites, toggleFavorite, scheduleVisit, replyVisit, submitOffer, writeReview, getReviews,
  aiGenerateDescription, aiImageAnalysis, aiPricePrediction,
  aiNegotiate, aiInvestmentAnalysis, aiNeighborhoodAnalysis,
  aiChatAssistant, aiInteriorSuggestions,
};
