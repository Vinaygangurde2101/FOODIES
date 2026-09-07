import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';
import SpiceBadge from '../common/SpiceBadge';
import RatingStars from '../common/RatingStars';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const isAvailable = product.price > 0 && product.stock > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAvailable) {
      addToCart(product._id, 1, product.name);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-warmbg-accent/80 hover:border-brand-200 shadow-sm hover:shadow-warm transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.isBestSeller && (
          <span className="bg-brand-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            Bestseller
          </span>
        )}
        {product.region && (
          <span className="bg-warmbg-soft text-charcoal text-[10px] font-semibold px-2 py-0.5 rounded-full border border-warmbg-accent">
            {product.region}
          </span>
        )}
      </div>

      <div>
        {/* Product Image */}
        <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-warmbg-card">
          <img
            src={product.images && product.images.length > 0 ? product.images[0] : '/images/products/kolhapuri-masala.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/products/kolhapuri-masala.jpg';
            }}
          />
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">{product.category}</span>
            <SpiceBadge level={product.spiceLevel} />
          </div>

          <Link to={`/product/${product.slug}`}>
            <h3 className="font-display font-bold text-charcoal text-base line-clamp-1 group-hover:text-brand-600 transition-colors mb-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-charcoal-muted line-clamp-1 mb-2 font-normal">
            {product.shortDescription || product.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <RatingStars rating={product.rating} count={product.reviewCount} />
            <span className="text-xs text-charcoal-muted font-medium bg-warmbg-soft px-2 py-0.5 rounded">
              {product.weight}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between border-t border-warmbg-soft pt-3">
          <div>
            {!isAvailable ? (
              <span className="text-xs font-bold text-red-600">Currently unavailable</span>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-extrabold text-charcoal font-display">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-charcoal-muted line-through">₹{product.originalPrice}</span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isAvailable
                ? 'bg-brand-600 text-white hover:bg-brand-700 active:scale-95 shadow-md shadow-brand-500/20'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={isAvailable ? "Add to cart" : "Unavailable"}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
