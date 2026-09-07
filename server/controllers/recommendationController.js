const recommendationService = require('../services/recommendationService');
const { trackEvent } = require('../services/analyticsService');

// @desc    Process Smart Food Finder questionnaire answers
// @route   POST /api/recommendations/smart-finder
// @access  Public
const getSmartFinderResults = async (req, res, next) => {
  try {
    const { foodType, budget, spiceLevel, region } = req.body;

    const recommendations = await recommendationService.getSmartFinderRecommendations({
      foodType,
      budget,
      spiceLevel,
      region
    });

    trackEvent('smart_finder_completed', { foodType, budget, spiceLevel, region, count: recommendations.length });

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get smart cart cross-sell recommendations
// @route   POST /api/recommendations/cross-sell
// @access  Public
const getCrossSell = async (req, res, next) => {
  try {
    const { cartProductIds = [], subtotal = 0 } = req.body;

    const crossSells = await recommendationService.getCrossSellRecommendations(cartProductIds, subtotal);

    res.json({
      success: true,
      subtotal,
      freeDeliveryThreshold: 999,
      amountRemaining: Math.max(0, 999 - subtotal),
      data: crossSells
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related product recommendations for detail page
// @route   GET /api/products/:id/recommendations
// @access  Public
const getRelated = async (req, res, next) => {
  try {
    const related = await recommendationService.getRelatedProducts(req.params.id);
    res.json({ success: true, data: related });
  } catch (error) {
    next(error);
  }
};

// @desc    Get frequently bought together bundle recommendation
// @route   GET /api/products/:id/frequently-bought
// @access  Public
const getFrequentlyBought = async (req, res, next) => {
  try {
    const bundle = await recommendationService.getFrequentlyBoughtTogether(req.params.id);
    res.json({ success: true, data: bundle });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSmartFinderResults,
  getCrossSell,
  getRelated,
  getFrequentlyBought
};
