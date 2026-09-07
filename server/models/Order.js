const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'Online Demo Payment'], 
    default: 'COD' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed'], 
    default: 'Completed' 
  },
  orderStatus: { 
    type: String, 
    enum: ['Processing', 'Shipped', 'Delivered'], 
    default: 'Processing' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Order', orderSchema);
