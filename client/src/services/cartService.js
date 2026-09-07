import api from './api';

export const cartService = {
  getCart: () => {
    return api.get('/cart');
  },
  addToCart: (productId, quantity = 1) => {
    return api.post('/cart/items', { productId, quantity });
  },
  updateQuantity: (productId, quantity) => {
    return api.patch(`/cart/items/${productId}`, { quantity });
  },
  removeFromCart: (productId) => {
    return api.delete(`/cart/items/${productId}`);
  },
  clearCart: () => {
    return api.delete('/cart');
  }
};
