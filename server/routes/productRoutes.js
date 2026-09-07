const express = require('express');
const router = express.Router();
const { getProducts, searchProducts, getProductBySlug, getProductById } = require('../controllers/productController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/slug/:slug', optionalAuth, getProductBySlug);
router.get('/:id', getProductById);

module.exports = router;
