const User = require('../models/User');
const Property = require('../models/Property');
const Visit = require('../models/Visit');
const Offer = require('../models/Offer');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// GET /api/v1/admin/stats
const getAdminStats = async (req, res) => {
  const [totalUsers, totalProperties, pendingProps, approvedProps, flaggedProps, totalVisits, totalOffers] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Property.countDocuments({ status: 'pending' }),
    Property.countDocuments({ status: 'approved' }),
    Property.countDocuments({ is_flagged: true }),
    Visit.countDocuments(),
    Offer.countDocuments(),
  ]);

  res.json({
    total_users: totalUsers,
    total_properties: totalProperties,
    pending_properties: pendingProps,
    approved_properties: approvedProps,
    flagged_properties: flaggedProps,
    total_visits: totalVisits,
    total_offers: totalOffers,
  });
};

// GET /api/v1/admin/properties
const getAdminProperties = async (req, res) => {
  const properties = await Property.find({})
    .sort({ created_at: -1 })
    .populate('seller_id', '-password_hash')
    .populate('seller', '-password_hash');

  const result = properties.map((p) => {
    const json = p.toJSON();
    const rawSeller = (json.seller && typeof json.seller === 'object') ? json.seller : json.seller_id;
    if (rawSeller && typeof rawSeller === 'object') {
      json.seller = {
        _id: rawSeller._id || rawSeller.id,
        id: rawSeller.id || rawSeller._id,
        name: rawSeller.full_name || rawSeller.name || 'Property Owner',
        email: rawSeller.email || json.contact_email || '',
        phone: rawSeller.phone_number || rawSeller.phone || json.contact_number || '',
      };
    }
    return json;
  });

  res.json(result);
};

// PUT /api/v1/admin/properties/:id/status
const updatePropertyStatus = async (req, res) => {
  const { status, is_flagged } = req.body;
  const property = await Property.findById(req.params.id);
  if (!property) throw createError('Property not found', 404);

  if (status) property.status = status;
  if (is_flagged !== undefined) property.is_flagged = Boolean(is_flagged);

  await property.save();
  await property.populate('seller_id', '-password_hash');

  res.json(property.toJSON());
};

// DELETE /api/v1/admin/properties/:id
const deleteAdminProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw createError('Property not found', 404);

  await Favorite.deleteMany({ property_id: req.params.id });
  await Visit.deleteMany({ property_id: req.params.id });
  await Offer.deleteMany({ property_id: req.params.id });
  await Review.deleteMany({ property_id: req.params.id });
  await property.deleteOne();

  res.json({ message: 'Property deleted successfully by admin' });
};

// GET /api/v1/admin/users
const getAdminUsers = async (req, res) => {
  const users = await User.find({}).sort({ created_at: -1 }).select('-password_hash');
  res.json(users.map((u) => u.toJSON()));
};

module.exports = {
  getAdminStats,
  getAdminProperties,
  updatePropertyStatus,
  deleteAdminProperty,
  getAdminUsers,
};
