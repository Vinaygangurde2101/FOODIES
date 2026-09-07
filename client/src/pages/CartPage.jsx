import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import FreeDeliveryProgress from '../components/cart/FreeDeliveryProgress';
import CrossSellSection from '../components/cart/CrossSellSection';
import EmptyState from '../components/common/EmptyState';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-warmbg-accent">
        <div>
          <h1 className="font-display font-black text-3xl text-charcoal">Your Smart Shopping Cart</h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Review your authentic food selection and track your free delivery progress.
          </p>
        </div>

        {!isEmpty && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" /> Clear All Items
          </button>
        )}
      </div>

      {isEmpty ? (
        <EmptyState
          title="Your Smart Cart is Empty"
          message="Explore our collection of authentic snacks, pickles, masalas, and sweets."
          actionText="Start Food Discovery"
          actionLink="/store"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CART ITEMS LIST & CROSS-SELL */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Free Delivery Progress Bar */}
            <FreeDeliveryProgress subtotal={cart.subtotal} threshold={cart.freeDeliveryThreshold} />

            {/* Cart Items List */}
            <div className="bg-white rounded-2xl border border-warmbg-accent shadow-xs divide-y divide-warmbg-soft overflow-hidden">
              {items.map((item) => {
                const product = item.product || {};
                const productId = product._id || item.productId;

                return (
                  <div key={item._id || productId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Item Thumbnail & Title */}
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                      <img
                        src={item.product?.images && item.product?.images.length > 0 ? item.product.images[0] : '/images/products/kolhapuri-masala.jpg'}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-warmbg-accent flex-shrink-0 bg-warmbg-card"
                      />
                      <div className="min-w-0 flex-1">
                        <Link to={`/product/${product.slug}`} className="font-display font-bold text-sm text-charcoal hover:text-brand-600 transition-colors block truncate">
                          {product.name}
                        </Link>
                        <span className="text-xs text-charcoal-muted block mt-0.5">{product.weight} • ₹{item.price} each</span>
                      </div>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-warmbg-soft">
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-warmbg-accent rounded-xl bg-warmbg-card">
                        <button
                          onClick={() => updateQuantity(productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-charcoal-muted hover:text-charcoal disabled:opacity-40 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-extrabold text-xs text-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(productId, item.quantity + 1)}
                          className="p-2 text-charcoal-muted hover:text-charcoal transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right min-w-[70px]">
                        <span className="font-display font-black text-base text-charcoal block">₹{item.itemSubtotal || item.price * item.quantity}</span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(productId)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>

            {/* Smart Cart Cross-Selling Section */}
            <CrossSellSection />

          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-white p-6 rounded-2xl border border-warmbg-accent shadow-xs space-y-6">
              <h2 className="font-display font-bold text-lg text-charcoal border-b border-warmbg-soft pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs text-charcoal">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Items Subtotal</span>
                  <span className="font-bold">₹{cart.subtotal}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-charcoal-muted">Estimated Delivery</span>
                  {cart.deliveryCharge === 0 ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      FREE
                    </span>
                  ) : (
                    <span className="font-bold">₹{cart.deliveryCharge}</span>
                  )}
                </div>

                <div className="border-t border-warmbg-soft pt-3 flex justify-between items-baseline">
                  <span className="font-display font-extrabold text-base text-charcoal">Total Amount</span>
                  <span className="font-display font-black text-2xl text-brand-600">₹{cart.totalAmount}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all text-sm"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-charcoal-muted flex items-center justify-center gap-1.5 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Safe & Secure Checkout Guarantee</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default CartPage;
