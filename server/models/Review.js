const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true,
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: [true, 'Review comment is required'] 
  },
  verifiedPurchase: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Prevent duplicate review per user for the same product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
