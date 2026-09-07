const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { trackEvent } = require('../services/analyticsService');

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
      const product = await Product.findById(item.productId);
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

    const order = await Order.create({
      orderId,
      userId,
      items: verifiedItems,
      shippingAddress,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: paymentMethod === 'Online Payment' ? 'Online Demo Payment' : paymentMethod,
      paymentStatus: paymentMethod === 'Online Payment' ? 'Completed' : 'Pending',
      orderStatus: 'Processing'
    });

    // Clear cart after successful checkout
    const sessionId = req.headers['x-session-id'] || 'guest_session';
    if (userId) {
      await Cart.findOneAndUpdate({ userId }, { items: [] });
    } else {
      await Cart.findOneAndUpdate({ sessionId }, { items: [] });
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
    const order = await Order.findOne({ orderId: req.params.orderId });
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
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
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
