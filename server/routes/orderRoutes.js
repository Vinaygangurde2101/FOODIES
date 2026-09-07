const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getUserOrders } = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validator');

router.post('/', optionalAuth, orderValidation, createOrder);
router.get('/user/my-orders', protect, getUserOrders);
router.get('/:orderId', getOrderById);

module.exports = router;
