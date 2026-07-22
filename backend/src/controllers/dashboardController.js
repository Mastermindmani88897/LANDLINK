const Property = require('../models/Property');
const Favorite = require('../models/Favorite');
const Visit = require('../models/Visit');
const Offer = require('../models/Offer');

// GET /api/v1/dashboard/user (Unified Dashboard for Sellers & Buyers)
const getUserDashboard = async (req, res) => {
  const userId = req.user._id;

  // 1. Listings created by this user
  const myProperties = await Property.find({
    $or: [{ seller_id: userId }, { seller: userId }]
  }).sort({ created_at: -1 });
  const myPropIds = myProperties.map((p) => p._id);

  // Auto-backfill owner_id on existing Visit documents if missing
  try {
    const unassignedVisits = await Visit.find({ owner_id: { $exists: false } }).populate('property_id');
    for (const v of unassignedVisits) {
      if (v.property_id) {
        const ownerId = v.property_id.seller_id || v.property_id.seller;
        if (ownerId) {
          v.owner_id = ownerId;
          await v.save();
        }
      }
    }
  } catch (err) {
    console.error('Visit owner_id backfill error:', err);
  }

  // 2. Visits requested for my properties (I am property owner)
  const receivedVisits = await Visit.find({
    $or: [
      { owner_id: userId },
      { property_id: { $in: myPropIds } }
    ]
  })
    .populate('property_id')
    .populate('buyer_id', '-password_hash')
    .populate('owner_id', '-password_hash')
    .sort({ created_at: -1 });

  // 3. Offers received for my properties (I am property owner)
  const receivedOffers = myPropIds.length
    ? await Offer.find({ property_id: { $in: myPropIds } })
        .populate('property_id')
        .populate('buyer_id', '-password_hash')
    : [];

  // 4. Saved favorites (I am buyer)
  const favDocs = await Favorite.find({ user_id: userId }).populate({
    path: 'property_id',
    populate: { path: 'seller_id', select: '-password_hash' },
  });
  const myFavorites = favDocs
    .filter((f) => f.property_id)
    .map((f) => {
      const json = f.property_id.toJSON();
      if (json.seller_id && typeof json.seller_id === 'object') {
        json.seller = json.seller_id;
        json.seller_id = json.seller._id || json.seller.id;
      }
      return json;
    });

  // 5. My submitted offers & visits (I am buyer)
  const myOffers = await Offer.find({ buyer_id: userId })
    .populate('property_id')
    .populate('buyer_id', '-password_hash');

  const myVisits = await Visit.find({ buyer_id: userId })
    .populate('property_id')
    .populate('buyer_id', '-password_hash')
    .populate('owner_id', '-password_hash')
    .sort({ created_at: -1 });

  const serializeDoc = (doc) => {
    const json = doc.toJSON ? doc.toJSON() : { ...doc };

    if (json.property_id && typeof json.property_id === 'object') {
      json.property = json.property_id;
      json.property_title = json.property_id.title;
      json.property_city = json.property_id.city;
      json.property_address = json.property_id.address;
    }

    if (json.buyer_id && typeof json.buyer_id === 'object') {
      json.buyer = json.buyer_id;
      json.buyer_name = json.buyer_id.full_name || json.buyer_id.name || 'Interested Buyer';
      json.buyer_phone = json.buyer_id.phone_number || json.buyer_id.phone;
      json.buyer_email = json.buyer_id.email;
    }

    if (json.owner_id && typeof json.owner_id === 'object') {
      json.owner = json.owner_id;
      json.owner_name = json.owner_id.full_name || json.owner_id.name || 'Property Owner';
      json.owner_phone = json.owner_id.phone_number || json.owner_id.phone;
      json.owner_email = json.owner_id.email;
    }

    return json;
  };

  res.json({
    my_properties: myProperties.map((p) => p.toJSON()),
    received_visits: receivedVisits.map(serializeDoc),
    received_offers: receivedOffers.map(serializeDoc),
    favorites: myFavorites,
    my_offers: myOffers.map(serializeDoc),
    my_visits: myVisits.map(serializeDoc),
    stats: {
      total_my_listings: myProperties.length,
      favorites_count: myFavorites.length,
      offers_received_count: receivedOffers.length,
      visits_scheduled_count: receivedVisits.length,
      my_visits_count: myVisits.length,
    },
  });
};

module.exports = { getSellerDashboard: getUserDashboard, getBuyerDashboard: getUserDashboard, getUserDashboard };
