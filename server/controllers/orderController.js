const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { trackEvent } = require('../services/analyticsService');
const path = require('path');
const fs = require('fs');

// In-memory order storage fallback
const inMemoryOrders = new Map();

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

const findProductById = async (productId) => {
  try {
    const p = await Product.findById(productId).lean();
    if (p) return p;
  } catch (err) {
    // fallback below
  }
  const seeds = getSeedProducts();
  return seeds.find(p => p._id.toString() === productId.toString());
};

// Generate unique order ID
const generateOrderId = () => {
  const randomStr = Math.floor(100000 + Math.random() * 900000);
  return `NF-${randomStr}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Optional Auth)
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'COD' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Safely re-verify pricing on backend
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await findProductById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.name || item.productId} no longer exists` });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price, // Trust server price only
        quantity: item.quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : ''
      });
    }

    const FREE_DELIVERY_THRESHOLD = 999;
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 70;
    const totalAmount = subtotal + deliveryCharge;

    const orderId = generateOrderId();
    const userId = req.user ? req.user._id : undefined;

    const orderPayload = {
      orderId,
      userId,
      items: verifiedItems,
      shippingAddress,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: paymentMethod === 'Online Payment' ? 'Online Demo Payment' : paymentMethod,
      paymentStatus: paymentMethod === 'Online Payment' ? 'Completed' : 'Pending',
      orderStatus: 'Processing',
      createdAt: new Date().toISOString()
    };

    let order = null;
    try {
      order = await Order.create(orderPayload);
    } catch (err) {
      console.warn('MongoDB Order.create failed, falling back to in-memory order:', err.message);
      order = orderPayload;
    }

    inMemoryOrders.set(orderId, order);

    // Clear cart after successful checkout
    try {
      const sessionId = req.headers['x-session-id'] || 'guest_session';
      if (userId) {
        await Cart.findOneAndUpdate({ userId }, { items: [] });
      } else {
        await Cart.findOneAndUpdate({ sessionId }, { items: [] });
      }
    } catch (err) {
      // Ignored for offline DB
    }

    trackEvent('order_completed', {
      orderId,
      subtotal,
      deliveryCharge,
      totalAmount,
      itemCount: verifiedItems.length
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by orderId
// @route   GET /api/orders/:orderId
// @access  Public
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    let order = null;
    try {
      order = await Order.findOne({ orderId });
    } catch (err) {
      console.warn('MongoDB Order.findOne failed, checking in-memory fallback');
    }

    if (!order) {
      order = inMemoryOrders.get(orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's order history
// @route   GET /api/orders
// @access  Private (Authenticated User)
const getUserOrders = async (req, res, next) => {
  try {
    let orders = [];
    try {
      orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    } catch (err) {
      console.warn('MongoDB getUserOrders failed');
    }
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders
};
