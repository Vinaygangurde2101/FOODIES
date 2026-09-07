import api from './api';

export const reviewService = {
  getProductReviews: (productId) => {
    return api.get(`/reviews/${productId}`);
  },
  addReview: (reviewData) => {
    return api.post('/reviews', reviewData);
  }
};
