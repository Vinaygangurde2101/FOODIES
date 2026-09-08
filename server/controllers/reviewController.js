const Review = require('../models/Review');
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// In-memory reviews storage
const inMemoryReviews = new Map();

// Seed products cache fallback
let seedProductsCache = null;
const getSeedProducts = () => {
  if (!seedProductsCache) {
    try {
      const seedPath = path.join(__dirname, '../seed/seedData.json');
      if (fs.existsSync(seedPath)) {
        seedProductsCache = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      } else {
        seedProductsCache = [];
      }
    } catch (err) {
      seedProductsCache = [];
    }
  }
  return seedProductsCache;
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let reviews = [];
    try {
      reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    } catch (err) {
      console.warn('MongoDB Review.find failed, using in-memory fallback');
    }

    if (!reviews || reviews.length === 0) {
      reviews = inMemoryReviews.get(productId.toString()) || [];
    }

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a product
// @route   POST /api/reviews
// @access  Private (Authenticated User)
const addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    let product = null;
    try {
      product = await Product.findById(productId);
    } catch (err) {
      // fallback
    }

    if (!product) {
      const seeds = getSeedProducts();
      product = seeds.find(p => p._id.toString() === productId.toString());
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const newReview = {
      _id: 'rev_' + Math.random().toString(36).substring(2, 10),
      productId,
      userId: req.user ? req.user._id : 'guest',
      userName: req.user ? req.user.name : 'Verified Customer',
      rating: Number(rating) || 5,
      comment,
      verifiedPurchase: true,
      createdAt: new Date().toISOString()
    };

    try {
      await Review.create(newReview);
    } catch (err) {
      console.warn('MongoDB Review.create failed, saving in-memory');
    }

    const currentMem = inMemoryReviews.get(productId.toString()) || [];
    currentMem.unshift(newReview);
    inMemoryReviews.set(productId.toString(), currentMem);

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  addReview
};
