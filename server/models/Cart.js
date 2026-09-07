const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: [1, 'Quantity cannot be less than 1'],
    default: 1 
  },
  price: { 
    type: Number, 
    required: true 
  }
});

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    sparse: true 
  },
  sessionId: { 
    type: String, 
    index: true 
  },
  items: [cartItemSchema],
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Cart', cartSchema);
