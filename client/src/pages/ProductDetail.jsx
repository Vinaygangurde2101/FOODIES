import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, CheckCircle2, ShieldCheck, Heart, Sparkles, Star, Package, Clock, Info } from 'lucide-react';
import SpiceBadge from '../components/common/SpiceBadge';
import RatingStars from '../components/common/RatingStars';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/LoadingSkeleton';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { recommendationService } from '../services/recommendationService';
import { reviewService } from '../services/reviewService';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductBySlug(slug);
        if (res.success && res.data) {
          const prodData = res.data;
          setProduct(prodData);

          // Fetch related recommendations & frequently bought together
          const resRel = await recommendationService.getRelatedProducts(prodData._id);
          if (resRel.success) setRelatedProducts(resRel.data);

          const resFreq = await recommendationService.getFrequentlyBoughtTogether(prodData._id);
          if (resFreq.success) setFrequentlyBought(resFreq.data);

          // Fetch reviews
          const resRev = await reviewService.getProductReviews(prodData._id);
          if (resRev.success) setReviews(resRev.data);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-24 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-charcoal mb-4">Product Not Found</h2>
        <Link to="/store" className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs">
          Return to Store
        </Link>
      </div>
    );
  }

  const isAvailable = product.price > 0 && product.stock > 0;

  const handleAddToCart = () => {
    if (isAvailable) {
      addToCart(product._id, quantity, product.name);
    }
  };

  const handleBuyNow = () => {
    if (isAvailable) {
      addToCart(product._id, quantity, product.name);
      navigate('/cart');
    }
  };

  const handleAddBundleToCart = async () => {
    if (frequentlyBought) {
      await addToCart(frequentlyBought.mainProduct._id, 1, frequentlyBought.mainProduct.name);
      for (const item of frequentlyBought.bundleItems) {
        await addToCart(item._id, 1, item.name);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setReviewSubmitting(true);
      setReviewError(null);
      const res = await reviewService.addReview({
        productId: product._id,
        rating: newRating,
        comment: newComment
      });

      if (res.success) {
        setReviews([res.data, ...reviews]);
        setNewComment('');
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* PRODUCT TOP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Gallery / Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-warmbg-card rounded-3xl overflow-hidden border border-warmbg-accent shadow-sm relative">
            <img
              src={product.images && product.images.length > 0 ? product.images[0] : '/images/products/kolhapuri-masala.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                Bestseller
              </span>
            )}
          </div>
        </div>

        {/* Right Details & Order Action Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">{product.category}</span>
              <span className="text-charcoal-muted">•</span>
              <span className="text-xs font-semibold text-charcoal-muted">{product.region} Region</span>
              <SpiceBadge level={product.spiceLevel} />
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-charcoal mb-3">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <RatingStars rating={product.rating} count={product.reviewCount} />
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                In Stock ({product.stock} units available)
              </span>
            </div>

            <p className="text-sm text-charcoal-muted leading-relaxed mb-6 font-normal">
              {product.description}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-warmbg-card rounded-2xl border border-warmbg-accent flex items-baseline justify-between">
            <div>
              <span className="text-xs text-charcoal-muted block mb-0.5 font-medium">Price per pack ({product.weight})</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-charcoal font-display">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-charcoal-muted line-through">₹{product.originalPrice}</span>
                )}
              </div>
            </div>

            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200">
              Tax included
            </span>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-warmbg-accent rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-charcoal-muted hover:text-charcoal transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-extrabold text-sm text-charcoal">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 text-charcoal-muted hover:text-charcoal transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all text-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!isAvailable}
                className="w-full py-4 bg-charcoal hover:bg-black text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all text-sm"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Key Product Metadata Pills */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-warmbg-soft text-xs text-charcoal">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Shelf Life: <strong>{product.shelfLife || '6 Months'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              <span>Net Weight: <strong>{product.weight}</strong></span>
            </div>
          </div>

        </div>
      </div>

      {/* FREQUENTLY BOUGHT TOGETHER BUNDLE */}
      {frequentlyBought && frequentlyBought.bundleItems?.length > 0 && (
        <section className="bg-gradient-to-r from-amber-50 to-warmbg p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="font-display font-bold text-xl text-charcoal">Frequently Bought Together</h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Main item */}
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-center w-36">
                <img src={product.images?.[0]} alt={product.name} className="w-16 h-16 mx-auto object-cover rounded mb-1" />
                <span className="text-[11px] font-bold text-charcoal block line-clamp-1">{product.name}</span>
                <span className="text-xs font-black text-brand-600">₹{product.price}</span>
              </div>

              {frequentlyBought.bundleItems.map((item) => (
                <React.Fragment key={item._id}>
                  <Plus className="w-4 h-4 text-amber-500 font-bold" />
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-center w-36">
                    <img src={item.images?.[0]} alt={item.name} className="w-16 h-16 mx-auto object-cover rounded mb-1" />
                    <span className="text-[11px] font-bold text-charcoal block line-clamp-1">{item.name}</span>
                    <span className="text-xs font-black text-brand-600">₹{item.price}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="text-center lg:text-right space-y-2">
              <span className="text-xs text-charcoal-muted block">Bundle Total Price:</span>
              <span className="text-2xl font-black text-charcoal font-display block">₹{frequentlyBought.totalBundlePrice}</span>
              <button
                onClick={handleAddBundleToCart}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Add All 3 Items to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* DETAILED INFORMATION & REVIEWS TABS */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-warmbg-accent shadow-xs space-y-8">
        
        {/* Tab Headers */}
        <div className="flex border-b border-warmbg-soft space-x-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'description' ? 'border-brand-600 text-brand-600' : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Ingredients & Nutrition
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'reviews' ? 'border-brand-600 text-brand-600' : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Ingredients & Nutrition */}
        {activeTab === 'description' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-charcoal space-y-4 md:space-y-0">
            <div>
              <h3 className="font-display font-bold text-sm text-charcoal uppercase tracking-wider mb-3">Ingredients List</h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients && product.ingredients.length > 0 ? (
                  product.ingredients.map((ing, idx) => (
                    <span key={idx} className="bg-warmbg-card border border-warmbg-accent px-3 py-1.5 rounded-lg font-medium text-charcoal">
                      {ing}
                    </span>
                  ))
                ) : (
                  <span className="text-charcoal-muted">Traditional spice & grain blend.</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-sm text-charcoal uppercase tracking-wider mb-3">Storage & Instructions</h3>
              <p className="text-charcoal-muted leading-relaxed">
                {product.storageInstructions || 'Store in a cool, dry place away from moisture and direct sunlight.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            
            {/* Add Review Form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="bg-warmbg-card p-6 rounded-2xl border border-warmbg-accent space-y-4">
                <h3 className="font-display font-bold text-sm text-charcoal">Write a Customer Review</h3>
                
                {reviewError && <p className="text-xs text-red-600 font-bold">{reviewError}</p>}

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-charcoal-muted">Rating:</span>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className="bg-white border border-warmbg-accent rounded-lg px-3 py-1 text-xs font-bold text-charcoal"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                    <option value={2}>2 Stars (Fair)</option>
                    <option value={1}>1 Star (Poor)</option>
                  </select>
                </div>

                <textarea
                  rows="3"
                  required
                  placeholder="Share your experience with this food product..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-white border border-warmbg-accent rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                Please <Link to="/login" className="font-bold underline text-brand-700">Sign In</Link> to submit a review for this product.
              </div>
            )}

            {/* Existing Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-charcoal-muted italic">No customer reviews yet. Be the first to write a review!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-white rounded-xl border border-warmbg-accent text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-charcoal">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <RatingStars rating={rev.rating} />
                    </div>
                    <p className="text-charcoal-muted leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </section>

      {/* YOU MAY ALSO LIKE (RELATED RECOMMENDATIONS) */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="font-display font-black text-2xl text-charcoal">You May Also Like</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetail;
