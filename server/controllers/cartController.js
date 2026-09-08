const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { trackEvent } = require('../services/analyticsService');
const path = require('path');
const fs = require('fs');

// In-memory carts fallback for serverless/offline DB state
const inMemoryCarts = new Map();

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

// Find product by id from DB or seed fallback
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

// Helper to calculate cart totals safely using server prices
const formatCartResponse = async (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      _id: cart ? cart._id : 'guest_cart',
      items: [],
      subtotal: 0,
      deliveryCharge: 0,
      freeDeliveryThreshold: 999,
      amountRemainingForFreeDelivery: 999,
      isFreeDeliveryUnlocked: false,
      totalAmount: 0
    };
  }

  let subtotal = 0;
  const populatedItems = [];

  for (const item of cart.items) {
    const product = await findProductById(item.productId);
    if (product) {
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      populatedItems.push({
        _id: item._id || item.productId,
        productId: product._id,
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
    _id: cart._id || 'guest_cart',
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

    let cart = null;
    try {
      if (userId) {
        cart = await Cart.findOne({ userId });
      } else {
        cart = await Cart.findOne({ sessionId });
      }
    } catch (err) {
      console.warn('Cart findOne failed, using in-memory cart fallback:', err.message);
    }

    if (!cart) {
      const key = userId ? userId.toString() : sessionId;
      const memItems = inMemoryCarts.get(key) || [];
      cart = { _id: key, items: memItems };
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

    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if ((product.stock || 50) < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available' });
    }

    let cart = null;
    let savedToDb = false;

    try {
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
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += quantity;
          cart.items[existingItemIndex].price = product.price;
        } else {
          cart.items.push({ productId, quantity, price: product.price });
        }
      }

      cart.updatedAt = Date.now();
      await cart.save();
      savedToDb = true;
    } catch (err) {
      console.warn('MongoDB save cart failed, falling back to in-memory cart:', err.message);
    }

    if (!savedToDb) {
      const key = userId ? userId.toString() : sessionId;
      let memItems = inMemoryCarts.get(key) || [];
      const existingIdx = memItems.findIndex(i => i.productId.toString() === productId.toString());
      if (existingIdx > -1) {
        memItems[existingIdx].quantity += quantity;
      } else {
        memItems.push({ _id: productId, productId, quantity, price: product.price });
      }
      inMemoryCarts.set(key, memItems);
      cart = { _id: key, items: memItems };
    }

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

    let cart = null;
    let savedToDb = false;

    try {
      cart = userId ? await Cart.findOne({ userId }) : await Cart.findOne({ sessionId });
      if (cart) {
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity = quantity;
          cart.updatedAt = Date.now();
          await cart.save();
          savedToDb = true;
        }
      }
    } catch (err) {
      console.warn('MongoDB updateCartItemQuantity failed, falling back to in-memory:', err.message);
    }

    const key = userId ? userId.toString() : sessionId;
    let memItems = inMemoryCarts.get(key) || [];
    const itemIndex = memItems.findIndex(item => item.productId.toString() === productId.toString());
    if (itemIndex > -1) {
      memItems[itemIndex].quantity = quantity;
      inMemoryCarts.set(key, memItems);
    }

    if (!savedToDb) {
      cart = { _id: key, items: memItems };
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

    let cart = null;
    let savedToDb = false;

    try {
      cart = userId ? await Cart.findOne({ userId }) : await Cart.findOne({ sessionId });
      if (cart) {
        cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());
        cart.updatedAt = Date.now();
        await cart.save();
        savedToDb = true;
      }
    } catch (err) {
      console.warn('MongoDB removeFromCart failed, falling back to in-memory:', err.message);
    }

    const key = userId ? userId.toString() : sessionId;
    let memItems = inMemoryCarts.get(key) || [];
    memItems = memItems.filter(item => item.productId.toString() !== productId.toString());
    inMemoryCarts.set(key, memItems);

    if (!savedToDb) {
      cart = { _id: key, items: memItems };
    }

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

    try {
      let cart = userId ? await Cart.findOne({ userId }) : await Cart.findOne({ sessionId });
      if (cart) {
        cart.items = [];
        cart.updatedAt = Date.now();
        await cart.save();
      }
    } catch (err) {
      console.warn('MongoDB clearCart failed, falling back to in-memory:', err.message);
    }

    const key = userId ? userId.toString() : sessionId;
    inMemoryCarts.set(key, []);
    const formattedCart = await formatCartResponse({ _id: key, items: [] });
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
