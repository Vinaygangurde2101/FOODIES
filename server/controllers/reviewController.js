const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
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

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ productId, userId: req.user._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this product.' });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
      verifiedPurchase: true
    });

    // Recalculate product aggregate rating
    const allReviews = await Review.find({ productId });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    product.rating = Number(avgRating.toFixed(1));
    product.reviewCount = allReviews.length;
    await product.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  addReview
};
