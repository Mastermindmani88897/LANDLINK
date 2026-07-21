const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/v1/auth/register
const register = async (req, res) => {
  const { email, password, full_name, phone_number, whatsapp_number, profile_image_url } = req.body;
  if (!email || !password || !full_name) throw createError('Email, password, and full name are required', 400);
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw createError('A user with this email already exists.', 400);
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email: email.toLowerCase(), password_hash, full_name, role: 'user', phone_number, whatsapp_number, profile_image_url });
  res.status(201).json(user.toJSON());
};

// POST /api/v1/auth/login & /login-json
const login = async (req, res) => {
  const { email, password, username } = req.body;
  const userEmail = email || username;
  if (!userEmail || !password) throw createError('Email and password are required', 400);
  const user = await User.findOne({ email: userEmail.toLowerCase() });
  if (!user) throw createError('Incorrect email or password', 400);
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw createError('Incorrect email or password', 400);
  const access_token = generateToken(user._id);
  res.json({ access_token, token_type: 'bearer' });
};

// POST /api/v1/auth/google-login
const googleLogin = async (req, res) => {
  const { email, name = 'Google User', profile_url } = req.body;
  if (!email) throw createError('Google authentication payload invalid.', 400);
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const password_hash = await bcrypt.hash(Math.random().toString(36), 10);
    user = await User.create({ email: email.toLowerCase(), password_hash, full_name: name, role: 'user', profile_image_url: profile_url });
  }
  const access_token = generateToken(user._id);
  res.json({ access_token, token_type: 'bearer' });
};

// GET /api/v1/auth/me
const getMe = async (req, res) => {
  const Property = require('../models/Property');
  const Favorite = require('../models/Favorite');
  
  const userJson = req.user.toJSON();
  const listedCount = await Property.countDocuments({
    $or: [{ seller_id: req.user._id }, { seller: req.user._id }]
  });
  const favCount = await Favorite.countDocuments({ user_id: req.user._id });
  
  userJson.listed_properties_count = listedCount;
  userJson.favorites_count = favCount;
  res.json(userJson);
};

// PUT /api/v1/auth/me
const updateMe = async (req, res) => {
  const { email, full_name, phone_number, whatsapp_number, city, state, profile_image_url, password } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw createError('User not found', 404);
  if (email && email !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw createError('Email already in use.', 400);
    user.email = email.toLowerCase();
  }
  if (full_name !== undefined) user.full_name = full_name;
  if (phone_number !== undefined) user.phone_number = phone_number;
  if (whatsapp_number !== undefined) user.whatsapp_number = whatsapp_number;
  if (city !== undefined) user.city = city;
  if (state !== undefined) user.state = state;
  if (profile_image_url !== undefined) user.profile_image_url = profile_image_url;
  if (password) user.password_hash = await bcrypt.hash(password, 10);
  await user.save();

  const Property = require('../models/Property');
  const Favorite = require('../models/Favorite');
  const userJson = user.toJSON();
  userJson.listed_properties_count = await Property.countDocuments({
    $or: [{ seller_id: user._id }, { seller: user._id }]
  });
  userJson.favorites_count = await Favorite.countDocuments({ user_id: user._id });
  res.json(userJson);
};

module.exports = { register, login, googleLogin, getMe, updateMe };
