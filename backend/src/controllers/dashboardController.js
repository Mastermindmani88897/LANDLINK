const Property = require('../models/Property');
const Favorite = require('../models/Favorite');
const Visit = require('../models/Visit');
const Offer = require('../models/Offer');

// GET /api/v1/dashboard/user (Unified Dashboard)
const getUserDashboard = async (req, res) => {
  const userId = req.user._id;

  // 1. Listings created by this user
  const myProperties = await Property.find({ seller_id: userId }).sort({ created_at: -1 });
  const myPropIds = myProperties.map((p) => p._id);

  // 2. Visits requested for my properties (I am seller)
  const receivedVisits = myPropIds.length
    ? await Visit.find({ property_id: { $in: myPropIds } })
        .populate('property_id')
        .populate('buyer_id', '-password_hash')
    : [];

  // 3. Offers received for my properties (I am seller)
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
    .populate('buyer_id', '-password_hash');

  const serializeDoc = (doc) => {
    const json = doc.toJSON ? doc.toJSON() : { ...doc };
    if (json.property_id && typeof json.property_id === 'object') json.property = json.property_id;
    if (json.buyer_id && typeof json.buyer_id === 'object') json.buyer = json.buyer_id;
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
    },
  });
};

module.exports = { getSellerDashboard: getUserDashboard, getBuyerDashboard: getUserDashboard, getUserDashboard };
