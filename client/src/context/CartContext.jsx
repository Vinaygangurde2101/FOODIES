import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { recommendationService } from '../services/recommendationService';

const CartContext = createContext();

const getInitialCart = () => {
  try {
    const saved = localStorage.getItem('foodies_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.items)) return parsed;
    }
  } catch (err) {}
  return {
    items: [],
    subtotal: 0,
    deliveryCharge: 0,
    freeDeliveryThreshold: 999,
    amountRemainingForFreeDelivery: 999,
    isFreeDeliveryUnlocked: false,
    totalAmount: 0
  };
};

const recalculateLocalCart = (items) => {
  const FREE_DELIVERY_THRESHOLD = 999;
  let subtotal = 0;
  const updatedItems = items.map(item => {
    const price = item.price || item.product?.price || 0;
    const qty = item.quantity || 1;
    const itemSubtotal = price * qty;
    subtotal += itemSubtotal;
    return {
      ...item,
      price,
      quantity: qty,
      itemSubtotal
    };
  });

  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : 70;
  const amountRemainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const totalAmount = subtotal + deliveryCharge;

  const newCart = {
    items: updatedItems,
    subtotal,
    deliveryCharge,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    amountRemainingForFreeDelivery,
    isFreeDeliveryUnlocked: subtotal >= FREE_DELIVERY_THRESHOLD,
    totalAmount
  };

  try {
    localStorage.setItem('foodies_cart', JSON.stringify(newCart));
  } catch (err) {}

  return newCart;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(getInitialCart);
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
      if (res.success && res.data && res.data.items) {
        setCart(res.data);
        try { localStorage.setItem('foodies_cart', JSON.stringify(res.data)); } catch (e) {}
        fetchCrossSells(res.data);
      }
    } catch (err) {
      console.warn('Error fetching cart from backend, maintaining localStorage cart:', err);
      fetchCrossSells(cart);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrossSells = async (currentCart) => {
    try {
      const cartProductIds = (currentCart.items || []).map(i => i.product?._id || i.productId || i._id);
      const res = await recommendationService.getCrossSell(cartProductIds, currentCart.subtotal || 0);
      if (res.success && res.data) {
        setCrossSells(res.data);
      }
    } catch (err) {
      console.warn('Error fetching cross-sells:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = (productId, quantity = 1, productName = 'Item', productObj = null) => {
    let updatedCartObj = null;

    // 1. Instant Optimistic Local Update (0ms latency)
    setCart(prevCart => {
      const existingItems = [...(prevCart.items || [])];
      const idx = existingItems.findIndex(i => (i.product?._id || i.productId || i._id) === productId);
      if (idx > -1) {
        existingItems[idx] = {
          ...existingItems[idx],
          quantity: existingItems[idx].quantity + quantity
        };
      } else {
        const itemProduct = productObj || {
          _id: productId,
          name: productName,
          price: 150,
          images: ['/images/products/kolhapuri-masala.jpg']
        };
        existingItems.push({
          _id: productId,
          productId,
          product: itemProduct,
          price: itemProduct.price || 150,
          quantity
        });
      }
      updatedCartObj = recalculateLocalCart(existingItems);
      return updatedCartObj;
    });

    // 2. Instant User Feedback
    showToast(`Added "${productName}" to your cart! 🛒`);
    if (updatedCartObj) fetchCrossSells(updatedCartObj);

    // 3. Silent Non-blocking Background Sync
    cartService.addToCart(productId, quantity)
      .then(res => {
        if (res && res.success && res.data) {
          setCart(res.data);
          try { localStorage.setItem('foodies_cart', JSON.stringify(res.data)); } catch (e) {}
        }
      })
      .catch(err => {
        console.warn('Silent background cart sync:', err.message);
      });
  };

  const updateQuantity = (productId, quantity) => {
    let updatedCartObj = null;

    // 1. Instant Optimistic Local Update
    setCart(prevCart => {
      const existingItems = [...(prevCart.items || [])];
      const idx = existingItems.findIndex(i => (i.product?._id || i.productId || i._id) === productId);
      if (idx > -1) {
        existingItems[idx] = { ...existingItems[idx], quantity };
      }
      updatedCartObj = recalculateLocalCart(existingItems);
      return updatedCartObj;
    });

    if (updatedCartObj) fetchCrossSells(updatedCartObj);

    // 2. Silent Non-blocking Background Sync
    cartService.updateQuantity(productId, quantity)
      .then(res => {
        if (res && res.success && res.data) {
          setCart(res.data);
          try { localStorage.setItem('foodies_cart', JSON.stringify(res.data)); } catch (e) {}
        }
      })
      .catch(err => {
        console.warn('Silent background quantity update sync:', err.message);
      });
  };

  const removeFromCart = (productId) => {
    let updatedCartObj = null;

    // 1. Instant Optimistic Local Update
    setCart(prevCart => {
      const existingItems = (prevCart.items || []).filter(i => (i.product?._id || i.productId || i._id) !== productId);
      updatedCartObj = recalculateLocalCart(existingItems);
      return updatedCartObj;
    });

    showToast('Item removed from cart');
    if (updatedCartObj) fetchCrossSells(updatedCartObj);

    // 2. Silent Non-blocking Background Sync
    cartService.removeFromCart(productId)
      .then(res => {
        if (res && res.success && res.data) {
          setCart(res.data);
          try { localStorage.setItem('foodies_cart', JSON.stringify(res.data)); } catch (e) {}
        }
      })
      .catch(err => {
        console.warn('Silent background remove item sync:', err.message);
      });
  };

  const clearCart = async () => {
    const emptyCart = {
      items: [],
      subtotal: 0,
      deliveryCharge: 0,
      freeDeliveryThreshold: 999,
      amountRemainingForFreeDelivery: 999,
      isFreeDeliveryUnlocked: false,
      totalAmount: 0
    };
    setCart(emptyCart);
    setCrossSells([]);
    try { localStorage.removeItem('foodies_cart'); } catch (e) {}

    try {
      await cartService.clearCart();
    } catch (err) {
      console.warn('Backend clearCart failed');
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
