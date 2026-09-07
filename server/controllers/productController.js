const Product = require('../models/Product');
const User = require('../models/User');
const { trackEvent } = require('../services/analyticsService');

// @desc    Get all products with filtering, sorting, & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { 
      category, 
      region, 
      spiceLevel, 
      minPrice, 
      maxPrice, 
      dietary, 
      isPopular, 
      isBestSeller, 
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (region) query.region = region;
    if (spiceLevel) query.spiceLevel = spiceLevel;
    if (isPopular === 'true') query.isPopular = true;
    if (isBestSeller === 'true') query.isBestSeller = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (dietary) {
      const dietaryArray = dietary.split(',');
      query.dietaryTags = { $in: dietaryArray };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'rating') sortOptions = { rating: -1, reviewCount: -1 };
    else if (sort === 'price_low_high') sortOptions = { price: 1 };
    else if (sort === 'price_high_low') sortOptions = { price: -1 };
    else if (sort === 'popular') sortOptions = { rating: -1, isBestSeller: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    trackEvent('filter_used', { category, region, spiceLevel, minPrice, maxPrice, sort });

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Common typos map for "Did you mean?" suggestions
const TYPO_MAP = {
  'chakli': 'Chakali',
  'chavli': 'Chakali',
  'lonche': 'Pickle',
  'lonchey': 'Pickle',
  'poha': 'Puneri Chivda',
  'powe': 'Poha',
  'puran': 'Puran Poli',
  'modak': 'Ukadiche Modak',
  'ghee': 'A2 Gir Cow Ghee',
  'laddoo': 'Ladoo',
  'laddu': 'Ladoo'
};

// @desc    Search products by query string
// @route   GET /api/products/search?q=
// @access  Public
const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.json({ success: true, data: [], suggestion: null });
    }

    const searchTerm = q.trim();
    const regex = new RegExp(searchTerm, 'i');

    // Multi-field search
    const products = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { region: regex },
        { tags: regex },
        { ingredients: regex },
        { description: regex }
      ]
    }).limit(20).lean();

    let suggestion = null;

    // Typo fallback suggestion
    if (products.length === 0) {
      const lowerQ = searchTerm.toLowerCase();
      if (TYPO_MAP[lowerQ]) {
        suggestion = TYPO_MAP[lowerQ];
      }
    }

    // Popular products fallback if no exact matches found
    let fallbackProducts = [];
    if (products.length === 0) {
      fallbackProducts = await Product.find({ isPopular: true }).limit(4).lean();
    }

    trackEvent('search_executed', { query: searchTerm, resultsCount: products.length });

    res.json({
      success: true,
      query: searchTerm,
      count: products.length,
      suggestion,
      fallbackProducts,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If user is logged in, push to recentlyViewed array
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { recentlyViewed: product._id }
      });
    }

    trackEvent('product_view', { productId: product._id, slug: product.slug, name: product.name });

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  searchProducts,
  getProductBySlug,
  getProductById
};
