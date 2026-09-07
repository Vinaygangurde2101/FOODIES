const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Require authentication middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'naik_foods_smartshop_jwt_secret_key_2026_super_secure');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }
};

// Optional auth middleware (attaches req.user if token present, but doesn't fail for guests)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'naik_foods_smartshop_jwt_secret_key_2026_super_secure');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Ignore token failure for optional auth
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
