const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth); // Extract user if token present

router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items/:productId', updateCartItemQuantity);
router.delete('/items/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
