const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { trackEvent } = require('../services/analyticsService');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'naik_foods_smartshop_jwt_secret_key_2026_super_secure', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, preferences } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address' });
    }

    const user = await User.create({
      name,
      email,
      password,
      preferences: preferences || {}
    });

    trackEvent('user_registered', { userId: user._id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    trackEvent('user_logged_in', { userId: user._id });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        recentlyViewed: user.recentlyViewed,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('recentlyViewed');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    trackEvent('user_preferences_updated', { userId: user._id, preferences: user.preferences });

    res.json({ success: true, data: user.preferences });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updatePreferences
};
