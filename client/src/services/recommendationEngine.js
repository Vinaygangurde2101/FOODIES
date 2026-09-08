import PRODUCTS_DATA from '../data/productsData';

const CRAVING_MAP = {
  'Spicy': {
    categories: ['Pickles', 'Masala', 'Snacks'],
    keywords: ['spicy', 'kolhapuri', 'curry', 'chilli', 'pickle', 'lonche', 'masala', 'kairi', 'thecha']
  },
  'Sweet': {
    categories: ['Sweets', 'Bakery', 'Traditional Specials'],
    keywords: ['sweet', 'ladoo', 'puran', 'modak', 'ghee', 'jaggery', 'chikki', 'pedha', 'ukadiche']
  },
  'Snacks': {
    categories: ['Snacks', 'Bakery', 'Healthy'],
    keywords: ['chivda', 'bakarwadi', 'chakali', 'puri', 'snack', 'poha', 'crunchy', 'namkeen', 'bhujia']
  },
  'Healthy': {
    categories: ['Healthy', 'Snacks'],
    keywords: ['healthy', 'millet', 'jowar', 'bajra', 'seeds', 'a2 ghee', 'gluten-free', 'baked', 'digestive']
  },
  'Traditional': {
    categories: ['Traditional Specials', 'Masala', 'Sweets', 'Pickles'],
    keywords: ['traditional', 'authentic', 'heritage', 'recipe', 'konkan', 'vidarbha', 'puneri', 'kolhapur']
  },
  'Gift': {
    categories: ['Traditional Specials', 'Sweets', 'Bakery'],
    keywords: ['gift', 'box', 'special', 'trunk', 'assorted', 'premium', 'festive', 'combo']
  }
};

export const computeTasteRecommendations = (answers, limit = 12) => {
  const { foodType, budget, spiceLevel, region } = answers || {};
  const allProducts = PRODUCTS_DATA || [];

  if (allProducts.length === 0) return [];

  const cravingInfo = CRAVING_MAP[foodType] || {
    categories: ['Snacks', 'Sweets', 'Pickles', 'Masala', 'Healthy'],
    keywords: ['tasty', 'flavor', 'authentic']
  };

  const scored = allProducts.map(product => {
    let score = 0;
    const reasons = [];

    // 1. Craving Category & Keyword Match (Max 45 pts)
    const matchesCategory = cravingInfo.categories.includes(product.category);
    const prodText = `${product.name} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
    const keywordMatches = cravingInfo.keywords.filter(kw => prodText.includes(kw));

    if (matchesCategory) {
      score += 30;
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
        reasons.push(`Matches your ${spiceLevel} spice level preference`);
      } else if (
        (spiceLevel === 'Medium' && (product.spiceLevel === 'Mild' || product.spiceLevel === 'Spicy')) ||
        (spiceLevel === 'Spicy' && product.spiceLevel === 'Medium') ||
        (spiceLevel === 'Mild' && product.spiceLevel === 'Medium')
      ) {
        score += 10;
        reasons.push(`Balanced heat alternative (${product.spiceLevel})`);
      }
    } else {
      score += 15;
      reasons.push('Versatile spice level for all palates');
    }

    // 3. Budget Check (Max 20 pts)
    const price = product.price;
    if (budget === 'under200') {
      if (price <= 200) {
        score += 20;
        reasons.push(`Fits comfortably under ₹200 (₹${price})`);
      } else if (price <= 250) {
        score += 10;
        reasons.push(`Close to your budget (₹${price})`);
      } else {
        score += 5;
      }
    } else if (budget === '200-500') {
      if (price >= 180 && price <= 500) {
        score += 20;
        reasons.push(`Fits your ₹200–₹500 budget (₹${price})`);
      } else if (price < 180) {
        score += 15;
        reasons.push(`Under your max budget (₹${price})`);
      } else {
        score += 8;
      }
    } else if (budget === '500plus') {
      if (price >= 300) {
        score += 20;
        reasons.push(`Premium quality pick (₹${price})`);
      } else {
        score += 12;
        reasons.push(`Great value pick (₹${price})`);
      }
    } else {
      score += 15;
    }

    // 4. Region Match (Max 15 pts)
    if (region && region !== 'Any') {
      const maharashtrianRegions = ['Konkan', 'Vidarbha', 'Marathwada', 'Western Maharashtra', 'All Maharashtra', 'Pune', 'Kolhapur'];
      if (region === 'Maharashtrian' && maharashtrianRegions.includes(product.region)) {
        score += 15;
        reasons.push(`Authentic ${product.region} recipe`);
      } else if (product.region === region) {
        score += 15;
        reasons.push(`Regional specialty from ${product.region}`);
      } else {
        score += 5;
      }
    } else {
      score += 10;
    }

    // 5. Rating & Bestseller Boost (Max 15 pts)
    if (product.rating >= 4.7) {
      score += 8;
      reasons.push(`Highly rated by food lovers (${product.rating}★)`);
    }
    if (product.isBestSeller || product.isPopular) {
      score += 7;
      reasons.push('Customer Bestseller');
    }

    // Calculate match score (Guaranteed 76% to 98%)
    const matchPercentage = Math.min(98, Math.max(76, Math.round(60 + (score / 115) * 38)));

    return {
      ...product,
      _id: product._id || product.slug,
      matchScore: matchPercentage,
      rawScore: score,
      recommendationReasons: reasons.length > 0 ? reasons : ['Top taste match for your food profile']
    };
  });

  // Sort by rawScore descending
  scored.sort((a, b) => b.rawScore - a.rawScore);

  return scored.slice(0, limit);
};
