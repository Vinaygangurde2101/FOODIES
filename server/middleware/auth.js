const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Require authentication middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'naik_foods_smartshop_jwt_secret_key_2026_super_secure');

      let user = null;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        console.warn('MongoDB findById failed in auth middleware, using decoded token user fallback');
      }

      if (!user) {
        user = { _id: decoded.id, name: 'SmartShop Foodie', role: 'customer' };
      }

      req.user = user;
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
      
      let user = null;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Fallback
      }

      if (!user) {
        user = { _id: decoded.id, name: 'SmartShop Foodie', role: 'customer' };
      }
      req.user = user;
    } catch (err) {
      // Ignore token failure for optional auth
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
