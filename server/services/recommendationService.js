const Product = require('../models/Product');

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
  
  const allProducts = await Product.find({ stock: { $gt: 0 } }).lean();
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

  const availableProducts = await Product.find(query).lean();

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
  const currentProduct = await Product.findById(productId);
  if (!currentProduct) return [];

  return await Product.find({
    _id: { $ne: productId },
    $or: [
      { category: currentProduct.category },
      { region: currentProduct.region },
      { spiceLevel: currentProduct.spiceLevel }
    ]
  }).limit(limit).lean();
};

// Frequently bought together bundle calculation
const getFrequentlyBoughtTogether = async (productId) => {
  const mainProduct = await Product.findById(productId).lean();
  if (!mainProduct) return null;

  let categoryFilter = [];
  if (mainProduct.category === 'Snacks') categoryFilter = ['Pickles', 'Sweets', 'Healthy'];
  else if (mainProduct.category === 'Pickles') categoryFilter = ['Masala', 'Snacks', 'Traditional Specials'];
  else categoryFilter = ['Snacks', 'Pickles', 'Healthy'];

  const bundleItems = await Product.find({
    _id: { $ne: productId },
    category: { $in: categoryFilter },
    price: { $gte: 100, $lte: 350 }
  }).limit(2).lean();

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
