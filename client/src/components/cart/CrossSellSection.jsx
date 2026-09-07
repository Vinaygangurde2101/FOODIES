import React from 'react';
import { Plus, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CrossSellSection = () => {
  const { crossSells, addToCart, cart } = useCart();

  if (!crossSells || crossSells.length === 0) return null;

  const isFreeDeliveryUnlocked = cart.isFreeDeliveryUnlocked;

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-display font-bold text-charcoal text-base">
            {isFreeDeliveryUnlocked ? "Pairs Great With Your Order" : "Complete Your Order & Save"}
          </h3>
          <p className="text-xs text-charcoal-muted">
            {isFreeDeliveryUnlocked 
              ? "Popular authentic additions to enhance your meal experience" 
              : "Affordable additions curated to help you reach FREE DELIVERY!"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {crossSells.map((product) => (
          <div 
            key={product._id} 
            className="flex items-center justify-between p-3 rounded-xl bg-warmbg-card border border-warmbg-accent hover:border-brand-300 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={product.images && product.images.length > 0 ? product.images[0] : '/images/products/kolhapuri-masala.jpg'}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-white"
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-xs text-charcoal truncate">{product.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-brand-600">₹{product.price}</span>
                  <span className="text-[10px] text-charcoal-muted">{product.weight}</span>
                </div>
                {product.gapFillerText && (
                  <span className="text-[10px] font-medium text-emerald-700 block truncate mt-0.5">
                    {product.gapFillerText}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => addToCart(product._id, 1, product.name)}
              className="ml-3 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center flex-shrink-0 transition-colors shadow-xs"
              title="Add to cart"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrossSellSection;
