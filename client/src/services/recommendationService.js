import api from './api';

export const recommendationService = {
  submitSmartFinder: (answers) => {
    return api.post('/recommendations/smart-finder', answers);
  },
  getCrossSell: (cartProductIds, subtotal) => {
    return api.post('/recommendations/cross-sell', { cartProductIds, subtotal });
  },
  getRelatedProducts: (productId) => {
    return api.get(`/recommendations/products/${productId}/recommendations`);
  },
  getFrequentlyBoughtTogether: (productId) => {
    return api.get(`/recommendations/products/${productId}/frequently-bought`);
  }
};
