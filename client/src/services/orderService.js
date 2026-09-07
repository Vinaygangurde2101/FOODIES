import api from './api';

export const orderService = {
  createOrder: (orderData) => {
    return api.post('/orders', orderData);
  },
  getOrderById: (orderId) => {
    return api.get(`/orders/${orderId}`);
  },
  getUserOrders: () => {
    return api.get('/orders/user/my-orders');
  }
};
