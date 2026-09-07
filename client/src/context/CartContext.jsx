import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { recommendationService } from '../services/recommendationService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    deliveryCharge: 0,
    freeDeliveryThreshold: 999,
    amountRemainingForFreeDelivery: 999,
    isFreeDeliveryUnlocked: false,
    totalAmount: 0
  });
  const [crossSells, setCrossSells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      if (res.success && res.data) {
        setCart(res.data);
        fetchCrossSells(res.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrossSells = async (currentCart) => {
    try {
      const cartProductIds = (currentCart.items || []).map(i => i.product?._id || i.productId);
      const res = await recommendationService.getCrossSell(cartProductIds, currentCart.subtotal || 0);
      if (res.success) {
        setCrossSells(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching cross-sells:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1, productName = 'Item') => {
    try {
      const res = await cartService.addToCart(productId, quantity);
      if (res.success && res.data) {
        setCart(res.data);
        fetchCrossSells(res.data);
        showToast(`Added "${productName}" to your cart! 🛒`);
      }
      return res;
    } catch (err) {
      showToast(err.message || 'Failed to add item to cart');
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await cartService.updateQuantity(productId, quantity);
      if (res.success && res.data) {
        setCart(res.data);
        fetchCrossSells(res.data);
      }
      return res;
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await cartService.removeFromCart(productId);
      if (res.success && res.data) {
        setCart(res.data);
        fetchCrossSells(res.data);
        showToast('Item removed from cart');
      }
      return res;
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartService.clearCart();
      if (res.success && res.data) {
        setCart(res.data);
        setCrossSells([]);
      }
      return res;
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const cartCount = (cart.items || []).reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        crossSells,
        loading,
        toastMessage,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
