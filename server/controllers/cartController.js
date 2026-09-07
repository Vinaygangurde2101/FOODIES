const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { trackEvent } = require('../services/analyticsService');

// Helper to calculate cart totals safely using server prices
const formatCartResponse = async (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      _id: cart ? cart._id : null,
      items: [],
      subtotal: 0,
      deliveryCharge: 0,
      freeDeliveryThreshold: 999,
      amountRemainingForFreeDelivery: 999,
      totalAmount: 0
    };
  }

  let subtotal = 0;
  const populatedItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.productId).lean();
    if (product) {
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      populatedItems.push({
        _id: item._id,
        product,
        quantity: item.quantity,
        price: product.price, // Server price
        itemSubtotal
      });
    }
  }

  const FREE_DELIVERY_THRESHOLD = 999;
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : 70;
  const amountRemainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const totalAmount = subtotal + deliveryCharge;

  return {
    _id: cart._id,
    items: populatedItems,
    subtotal,
    deliveryCharge,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountRemainingForFreeDelivery,
    isFreeDeliveryUnlocked: subtotal >= FREE_DELIVERY_THRESHOLD,
    totalAmount
  };
};

// @desc    Get user/guest cart
// @route   GET /api/cart
// @access  Public (supports userId via auth or sessionId query header)
const getCart = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'guest_session';
    const userId = req.user ? req.user._id : null;

    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    const formattedCart = await formatCartResponse(cart);
    res.json({ success: true, data: formattedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Public
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const sessionId = req.headers['x-session-id'] || 'guest_session';
    const userId = req.user ? req.user._id : null;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available' });
    }

    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      cart = new Cart({
        userId: userId || undefined,
        sessionId: userId ? undefined : sessionId,
        items: [{ productId, quantity, price: product.price }]
      });
    } else {
      const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].price = product.price; // Update price snapshot
      } else {
        cart.items.push({ productId, quantity, price: product.price });
      }
    }

    cart.updatedAt = Date.now();
    await cart.save();

    trackEvent('add_to_cart', { productId, quantity, price: product.price });

    const formattedCart = await formatCartResponse(cart);
    res.json({ success: true, data: formattedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PATCH /api/cart/items/:productId
// @access  Public
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const sessionId = req.headers['x-session-id'] || 'guest_session';
    const userId = req.user ? req.user._id : null;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    let cart = userId ? await Cart.findOne({ userId }) : await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.updatedAt = Date.now();
      await cart.save();
    }

    const formattedCart = await formatCartResponse(cart);
    res.json({ success: true, data: formattedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Public
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const sessionId = req.headers['x-session-id'] || 'guest_session';
    const userId = req.user ? req.user._id : null;

    let cart = userId ? await Cart.findOne({ userId }) : await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();

    trackEvent('remove_from_cart', { productId });

    const formattedCart = await formatCartResponse(cart);
    res.json({ success: true, data: formattedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Public
const clearCart = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'guest_session';
    const userId = req.user ? req.user._id : null;

    let cart = userId ? await Cart.findOne({ userId }) : await Cart.findOne({ sessionId });
    if (cart) {
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
    }

    const formattedCart = await formatCartResponse(cart);
    res.json({ success: true, data: formattedCart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
};
