import api from './api';

export const productService = {
  getProducts: (params = {}) => {
    return api.get('/products', { params });
  },
  searchProducts: (q) => {
    return api.get('/products/search', { params: { q } });
  },
  getProductBySlug: (slug) => {
    return api.get(`/products/slug/${slug}`);
  },
  getProductById: (id) => {
    return api.get(`/products/${id}`);
  }
};
