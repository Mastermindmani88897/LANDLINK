const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * Protect route: verify JWT and attach req.user
 */
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(createError('Please sign in to perform this action', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password_hash');
    if (!user) {
      return next(createError('User not found', 404));
    }
    req.user = user;
    next();
  } catch (err) {
    return next(createError('Session expired, please sign in again', 401));
  }
};

module.exports = { protect };
