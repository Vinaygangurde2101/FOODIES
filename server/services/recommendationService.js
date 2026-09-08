const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Seed products cache fallback with guaranteed _id properties
let seedProductsCache = null;
const getSeedProducts = () => {
  if (!seedProductsCache) {
    try {
      const seedPath = path.join(__dirname, '../seed/seedData.json');
      if (fs.existsSync(seedPath)) {
        const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
        seedProductsCache = raw.map((p, idx) => ({
          ...p,
          _id: p._id || p.slug || `seed-prod-${idx}`
        }));
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
    if (products && products.length > 0) {
      return products.map(p => ({ ...p, _id: p._id.toString() }));
    }
  } catch (err) {
    console.warn('MongoDB query failed in recommendationService, using seed fallback:', err.message);
  }

  let items = getSeedProducts();
  if (filter.stock && filter.stock.$gt !== undefined) {
    items = items.filter(p => (p.stock || 50) > filter.stock.$gt);
  }
  if (filter._id && filter._id.$nin) {
    const ids = filter._id.$nin.map(id => id.toString());
    items = items.filter(p => !ids.includes((p._id || '').toString()));
  }
  return items;
};

// Craving to category & tag keywords mapping
const CRAVING_MAP = {
  'Spicy': {
    categories: ['Pickles', 'Masala', 'Snacks'],
    keywords: ['spicy', 'kolhapuri', 'curry', 'chilli', 'pickle', 'lonche', 'masala']
  },
  'Sweet': {
    categories: ['Sweets', 'Bakery', 'Traditional Specials'],
    keywords: ['sweet', 'ladoo', 'puran', 'modak', 'ghee', 'jaggery', 'chikki']
  },
  'Snacks': {
    categories: ['Snacks', 'Bakery', 'Healthy'],
    keywords: ['chivda', 'bakarwadi', 'chakali', 'puri', 'snack', 'poha', 'crunchy']
  },
  'Healthy': {
    categories: ['Healthy', 'Snacks'],
    keywords: ['healthy', 'millet', 'jowar', 'bajra', 'seeds', 'a2 ghee', 'gluten-free', 'baked']
  },
  'Traditional': {
    categories: ['Traditional Specials', 'Masala', 'Sweets', 'Pickles'],
    keywords: ['traditional', 'authentic', 'heritage', 'recipe', 'konkan', 'vidarbha']
  },
  'Gift': {
    categories: ['Traditional Specials', 'Sweets', 'Bakery'],
    keywords: ['gift', 'box', 'special', 'trunk', 'assorted', 'premium']
  }
};

// Advanced Taste Matching Engine
const getSmartFinderRecommendations = async (answers, limit = 12) => {
  const { foodType, budget, spiceLevel, region } = answers;
  
  const allProducts = await getAvailableProducts({ stock: { $gt: 0 } });
  if (!allProducts || allProducts.length === 0) return [];

  const cravingInfo = CRAVING_MAP[foodType] || {
    categories: ['Snacks', 'Sweets', 'Pickles', 'Masala'],
    keywords: ['tasty', 'flavor', 'snack']
  };

  const scoredProducts = allProducts.map(product => {
    let score = 0;
    const reasons = [];

    // 1. Craving Category & Keyword Match (Max 40 pts)
    const matchesCategory = cravingInfo.categories.includes(product.category);
    const prodText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
    const keywordMatches = cravingInfo.keywords.filter(kw => prodText.includes(kw));

    if (matchesCategory) {
      score += 25;
      reasons.push(`Matches your ${foodType || 'selected'} craving`);
    }
    if (keywordMatches.length > 0) {
      score += Math.min(15, keywordMatches.length * 5);
      if (!matchesCategory) {
        reasons.push(`Features ${keywordMatches[0]} flavor profile`);
      }
    }

    // 2. Spice Level Weighting (Max 20 pts)
    if (spiceLevel && spiceLevel !== "Doesn't matter" && spiceLevel !== "Any") {
      if (product.spiceLevel === spiceLevel) {
        score += 20;
        reasons.push(`Perfect ${spiceLevel} heat level match`);
      } else if (
        (spiceLevel === 'Medium' && (product.spiceLevel === 'Mild' || product.spiceLevel === 'Spicy')) ||
        (spiceLevel === 'Spicy' && product.spiceLevel === 'Medium') ||
        (spiceLevel === 'Mild' && product.spiceLevel === 'Medium')
      ) {
        score += 10;
        reasons.push(`Balanced spice alternative (${product.spiceLevel})`);
      }
    } else {
      score += 15;
      reasons.push('Versatile spice profile for all palates');
    }

    // 3. Budget Range Check (Max 20 pts)
    const price = product.price;
    if (budget === 'under200') {
      if (price <= 200) {
        score += 20;
        reasons.push(`Budget friendly (₹${price})`);
      } else if (price <= 250) {
        score += 10;
        reasons.push(`Close to budget (₹${price})`);
      }
    } else if (budget === '200-500') {
      if (price >= 180 && price <= 500) {
        score += 20;
        reasons.push(`Fits your ₹200–₹500 budget (₹${price})`);
      } else if (price < 180) {
        score += 12;
        reasons.push(`Under your budget limit (₹${price})`);
      }
    } else if (budget === '500plus') {
      if (price >= 300) {
        score += 20;
        reasons.push(`Premium quality product (₹${price})`);
      } else {
        score += 10;
        reasons.push(`Value pick (₹${price})`);
      }
    } else {
      score += 15;
    }

    // 4. Regional Authenticity Match (Max 15 pts)
    if (region && region !== 'Any') {
      const maharashtrianRegions = ['Konkan', 'Vidarbha', 'Marathwada', 'Western Maharashtra', 'All Maharashtra', 'Pune', 'Kolhapur'];
      if (region === 'Maharashtrian' && maharashtrianRegions.includes(product.region)) {
        score += 15;
        reasons.push(`Authentic ${product.region} recipe`);
      } else if (product.region === region) {
        score += 15;
        reasons.push(`Regional specialty from ${product.region}`);
      }
    } else {
      score += 10;
    }

    // 5. Popularity & Customer Quality Boost (Max 15 pts)
    if (product.rating >= 4.7) {
      score += 8;
      reasons.push(`Top customer rating (${product.rating}★)`);
    }
    if (product.isBestSeller || product.isPopular) {
      score += 7;
      reasons.push('Customer Bestseller');
    }

    // Normalized Match Percentage (guaranteed 72% to 99% for top items)
    const matchPercentage = Math.min(99, Math.max(72, Math.round(55 + (score / 110) * 44)));

    return {
      ...product,
      matchScore: matchPercentage,
      rawScore: score,
      recommendationReasons: reasons.length > 0 ? reasons : ['Matches your food discovery preferences']
    };
  });

  // Sort by calculated match score
  scoredProducts.sort((a, b) => b.rawScore - a.rawScore);

  // Return top results
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
