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
  const user = await User.create({ email: email.toLowerCase(), password_hash, full_name, role: 'user', phone_number, whatsapp_number, profile_image_url, auth_provider: 'local' });
  res.status(201).json(user.toJSON());
};

// POST /api/v1/auth/login & /login-json
const login = async (req, res) => {
  const { email, password, username } = req.body;
  const userEmail = email || username;
  if (!userEmail || !password) throw createError('Email and password are required', 400);
  const user = await User.findOne({ email: userEmail.toLowerCase() });
  if (!user) throw createError('Incorrect email or password', 400);
  if (!user.password_hash) throw createError('This account uses Google sign-in. Please use "Continue with Google".', 400);
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw createError('Incorrect email or password', 400);
  const access_token = generateToken(user._id);
  res.json({ access_token, token_type: 'bearer' });
};

// POST /api/v1/auth/google-login
// Verifies Google's access token via Google's tokeninfo endpoint and logs in or creates the user.
const googleLogin = async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) throw createError('Google access token is required.', 400);

  // Step 1: Verify the access_token is valid with Google's tokeninfo endpoint
  let tokenInfo;
  try {
    const tokenInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(access_token)}`
    );
    if (!tokenInfoRes.ok) throw new Error('Token info request failed');
    tokenInfo = await tokenInfoRes.json();
  } catch (err) {
    throw createError('Google token verification failed. Please try again.', 401);
  }

  // Make sure the token is not expired and was issued for our app
  if (tokenInfo.error || !tokenInfo.sub) {
    throw createError('Invalid or expired Google token.', 401);
  }

  // Verify the audience matches our client (security check)
  const validAudiences = [process.env.GOOGLE_CLIENT_ID].filter(Boolean);
  if (validAudiences.length > 0 && !validAudiences.includes(tokenInfo.aud)) {
    throw createError('Google token audience mismatch.', 401);
  }

  // Step 2: Fetch the full user profile from Google's userinfo endpoint
  let googleUser;
  try {
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userInfoRes.ok) throw new Error('User info request failed');
    googleUser = await userInfoRes.json();
  } catch (err) {
    throw createError('Failed to fetch Google user profile. Please try again.', 401);
  }

  if (!googleUser.email_verified) {
    throw createError('Google account email is not verified.', 401);
  }

  const googleId = googleUser.sub;                        // Google's unique user ID
  const email    = googleUser.email.toLowerCase();
  const name     = googleUser.name || googleUser.given_name || 'Google User';
  const picture  = googleUser.picture || null;

  // 1. Try to find by google_id (fastest path for returning Google users)
  let user = await User.findOne({ google_id: googleId });

  if (!user) {
    // 2. Check if an email/password account already exists with this email (account linking)
    user = await User.findOne({ email });

    if (user) {
      // Link Google to the existing email/password account
      user.google_id = googleId;
      user.auth_provider = 'both';
      if (!user.profile_image_url && picture) user.profile_image_url = picture;
      await user.save();
    } else {
      // 3. Brand-new user via Google — create account without a password
      user = await User.create({
        email,
        password_hash: null,
        full_name: name,
        role: 'user',
        google_id: googleId,
        profile_image_url: picture,
        auth_provider: 'google',
      });
    }
  }

  const access_token_jwt = generateToken(user._id);
  res.json({ access_token: access_token_jwt, token_type: 'bearer' });
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

// POST /api/v1/auth/admin/login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw createError('Email and password are required', 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw createError('Invalid admin credentials', 400);

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw createError('Invalid admin credentials', 400);

  if (user.role !== 'admin') {
    throw createError('Access denied. You do not have admin privileges.', 403);
  }

  const access_token = generateToken(user._id);
  res.json({
    access_token,
    token_type: 'bearer',
    user: user.toJSON(),
  });
};

module.exports = { register, login, googleLogin, getMe, updateMe, adminLogin };
