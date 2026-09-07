const express = require('express');
const router = express.Router();
const { 
  getSmartFinderResults, 
  getCrossSell, 
  getRelated, 
  getFrequentlyBought 
} = require('../controllers/recommendationController');

router.post('/smart-finder', getSmartFinderResults);
router.post('/cross-sell', getCrossSell);
router.get('/products/:id/recommendations', getRelated);
router.get('/products/:id/frequently-bought', getFrequentlyBought);

module.exports = router;
