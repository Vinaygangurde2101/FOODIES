const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

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

// Helper to fetch all available products from DB or seed fallback
const getAvailableProducts = async (filter = {}) => {
  try {
    const products = await Product.find(filter).lean();
    if (products && products.length > 0) return products;
  } catch (err) {
    console.warn('MongoDB query failed in recommendationService, using seed fallback:', err.message);
  }

  let items = getSeedProducts();
  if (filter.stock && filter.stock.$gt !== undefined) {
    items = items.filter(p => (p.stock || 50) > filter.stock.$gt);
  }
  if (filter._id && filter._id.$nin) {
    const ids = filter._id.$nin.map(id => id.toString());
    items = items.filter(p => !ids.includes(p._id.toString()));
  }
  return items;
};

// Craving to product category mapping
const CRAVING_CATEGORY_MAP = {
  'Spicy': ['Pickles', 'Masala', 'Snacks'],
  'Sweet': ['Sweets', 'Bakery', 'Traditional Specials'],
  'Snacks': ['Snacks', 'Bakery', 'Healthy'],
  'Healthy': ['Healthy', 'Snacks'],
  'Traditional': ['Traditional Specials', 'Sweets', 'Pickles'],
  'Gift': ['Traditional Specials', 'Sweets']
};

// Calculate product recommendation scores based on user taste preferences
const getSmartFinderRecommendations = async (answers, limit = 8) => {
  const { foodType, budget, spiceLevel, region } = answers;
  
  const allProducts = await getAvailableProducts({ stock: { $gt: 0 } });
  const targetCategories = CRAVING_CATEGORY_MAP[foodType] || ['Snacks', 'Sweets', 'Pickles'];

  const scoredProducts = allProducts.map(product => {
    let score = 0;
    const reasons = [];

    // Category weight
    if (targetCategories.includes(product.category)) {
      score += 30;
      reasons.push(`Matches your ${foodType || 'selected'} craving`);
    }

    // Spice level weight
    if (spiceLevel && spiceLevel !== "Doesn't matter") {
      if (product.spiceLevel === spiceLevel) {
        score += 10;
        reasons.push(`Matches your ${spiceLevel} spice level preference`);
      }
    } else {
      score += 5;
    }

    // Budget range check
    const price = product.price;
    if (budget === 'under200' && price <= 200) {
      score += 20;
      reasons.push('Fits comfortably within your under ₹200 budget');
    } else if (budget === '200-500' && price > 200 && price <= 500) {
      score += 20;
      reasons.push('Within your ₹200–₹500 budget');
    } else if (budget === '500plus' && price > 500) {
      score += 20;
      reasons.push('Fits your premium budget preference');
    }

    // Region weight
    if (region && region !== 'Any') {
      if (region === 'Maharashtrian' && ['Konkan', 'Vidarbha', 'Marathwada', 'Western Maharashtra', 'All Maharashtra'].includes(product.region)) {
        score += 10;
        reasons.push('Authentic Maharashtrian flavor');
      } else if (product.region === region) {
        score += 10;
        reasons.push(`Specialty from ${product.region}`);
      }
    }

    // Rating & Bestseller boost
    if (product.rating >= 4.7) {
      score += 5;
      reasons.push('Highly rated by food lovers (4.7+ ★)');
    }
    if (product.isBestSeller || product.isPopular) {
      score += 5;
      reasons.push('Customer Bestseller');
    }

    return {
      ...product,
      matchScore: Math.min(100, Math.round((score / 80) * 100)),
      recommendationReasons: reasons
    };
  });

  scoredProducts.sort((a, b) => b.matchScore - a.matchScore);
  return scoredProducts.slice(0, limit);
};

// Select affordable products to help customer cross the ₹999 free shipping threshold
const getCrossSellRecommendations = async (cartProductIds = [], cartSubtotal = 0, limit = 4) => {
  const FREE_DELIVERY_THRESHOLD = 999;
  const amountRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - cartSubtotal);

  const query = { 
    _id: { $nin: cartProductIds },
    stock: { $gt: 0 }
  };

  const availableProducts = await getAvailableProducts(query);

  const scoredCrossSells = availableProducts.map(product => {
    let fitScore = 0;
    const price = product.price;

    if (price >= 100 && price <= 350) {
      fitScore += 30;
    }

    if (amountRemaining > 0) {
      const diff = Math.abs(amountRemaining - price);
      if (diff <= 100) {
        fitScore += 40;
      } else if (price <= amountRemaining) {
        fitScore += 25;
      }
    }

    if (product.isBestSeller) fitScore += 15;
    if (product.rating >= 4.7) fitScore += 15;

    return {
      ...product,
      fitScore,
      gapFillerText: amountRemaining > 0 && price >= amountRemaining
        ? `Add for ₹${price} to unlock FREE Delivery!`
        : `Great ₹${price} addition to your order`
    };
  });

  scoredCrossSells.sort((a, b) => b.fitScore - a.fitScore);
  return scoredCrossSells.slice(0, limit);
};

// Find related products matching category or region
const getRelatedProducts = async (productId, limit = 4) => {
  let currentProduct = null;
  try {
    currentProduct = await Product.findById(productId).lean();
  } catch (err) {
    console.warn('MongoDB findById failed in getRelatedProducts, using seed fallback');
  }

  if (!currentProduct) {
    const seeds = getSeedProducts();
    currentProduct = seeds.find(p => p._id.toString() === productId.toString() || p.slug === productId);
  }

  if (!currentProduct) return [];

  const allProducts = await getAvailableProducts();
  return allProducts
    .filter(p => p._id.toString() !== currentProduct._id.toString() && (p.category === currentProduct.category || p.region === currentProduct.region || p.spiceLevel === currentProduct.spiceLevel))
    .slice(0, limit);
};

// Frequently bought together bundle calculation
const getFrequentlyBoughtTogether = async (productId) => {
  let mainProduct = null;
  try {
    mainProduct = await Product.findById(productId).lean();
  } catch (err) {
    console.warn('MongoDB findById failed in getFrequentlyBoughtTogether, using seed fallback');
  }

  if (!mainProduct) {
    const seeds = getSeedProducts();
    mainProduct = seeds.find(p => p._id.toString() === productId.toString() || p.slug === productId);
  }

  if (!mainProduct) return null;

  let categoryFilter = [];
  if (mainProduct.category === 'Snacks') categoryFilter = ['Pickles', 'Sweets', 'Healthy'];
  else if (mainProduct.category === 'Pickles') categoryFilter = ['Masala', 'Snacks', 'Traditional Specials'];
  else categoryFilter = ['Snacks', 'Pickles', 'Healthy'];

  const allProducts = await getAvailableProducts();
  const bundleItems = allProducts
    .filter(p => p._id.toString() !== mainProduct._id.toString() && categoryFilter.includes(p.category) && p.price >= 100 && p.price <= 350)
    .slice(0, 2);

  const totalBundlePrice = mainProduct.price + bundleItems.reduce((acc, item) => acc + item.price, 0);

  return {
    mainProduct,
    bundleItems,
    totalBundlePrice
  };
};

module.exports = {
  getSmartFinderRecommendations,
  getCrossSellRecommendations,
  getRelatedProducts,
  getFrequentlyBoughtTogether
};
