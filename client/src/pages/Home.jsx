import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Utensils, Award, Compass, HeartHandshake, CheckCircle2, Star, Mail, MapPin, Heart } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { productService } from '../services/productService';

const categories = [
  { name: 'Snacks', icon: '🥨', tag: 'Chivda & Bhajani Chakali', image: '/images/products/bhajani-chakali.jpg' },
  { name: 'Pickles', icon: '🫙', tag: 'Sun-Aged Mango & Garlic', image: '/images/products/mango-pickle.jpg' },
  { name: 'Sweets', icon: '🍯', tag: 'Puran Poli & Besan Ladoo', image: '/images/products/poran-poli.jpg' },
  { name: 'Bakery', icon: '🍞', tag: 'Puneri Bakarwadi & Rolls', image: '/images/categories/bakery.jpg' },
  { name: 'Masala', icon: '🌶️', tag: 'Kolhapuri & Malvani Blends', image: '/images/products/kolhapuri-masala.jpg' },
  { name: 'Healthy', icon: '🌾', tag: 'Bajra Crispies & Jowar Pops', image: '/images/products/spicy-puneri-chivda.jpg' },
  { name: 'Traditional Specials', icon: '📦', tag: 'Festive Gift Trunks', image: '/images/hero.jpg' },
];

const occasions = [
  { name: 'Festival Celebrations', tag: 'Diwali & Ganesh Chaturthi Sweets', category: 'Sweets' },
  { name: 'Traditional Gifting', tag: 'Grand Assortment Gift Boxes', category: 'Traditional Specials' },
  { name: 'Evening Tea Time', tag: 'Crispy Savory Chivda & Sev', category: 'Snacks' },
  { name: 'Everyday Family Meals', tag: 'Aromatic Curry Masalas & Amti Spices', category: 'Masala' },
  { name: 'Maharashtrian Heritage', tag: 'Classic Regional Comfort Recipes', category: 'Traditional Specials' },
  { name: 'Healthy Snack Choices', tag: 'Roasted Millets & Pure A2 Ghee', category: 'Healthy' },
];

const regions = [
  { name: 'Konkan', description: 'Fresh Alphonso Mangoes, Coconut Ladoos & Solkadhi Extracts', category: 'Pickles' },
  { name: 'Vidarbha', description: 'Fiery Saoji Spice Mixes, Ambadi Pickles & Citrus Jam', category: 'Masala' },
  { name: 'Marathwada', description: 'Coarse Garlic Chutneys & Roasted Sorghum Pops', category: 'Pickles' },
  { name: 'Western Maharashtra', description: 'Kolhapuri Kanda Lasun, Puneri Bakarwadi & Bhajani Chakali', category: 'Snacks' },
];

const reviews = [
  {
    name: "Dr. Aniket Deshmukh",
    city: "Pune",
    rating: 5,
    review: "The Kolhapuri Kanda Lasun Masala tastes just like my grandmother prepared in Kolhapur! Fresh, fiery, and deeply authentic.",
    verified: true
  },
  {
    name: "Sneha Kulkarni",
    city: "Mumbai",
    rating: 5,
    review: "Loved the Taste Guide! It helped me choose mild snacks for my kids. The Puran Poli was soft and generously smeared with pure ghee.",
    verified: true
  },
  {
    name: "Vikram Rane",
    city: "Thane",
    rating: 5,
    review: "Solapuri Shenga Chutney and Puneri Bakarwadi arrived within 2 days in fresh sealed packaging. Truly excellent quality.",
    verified: true
  }
];

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoading(true);
        const resBest = await productService.getProducts({ isBestSeller: 'true', limit: 4 });
        if (resBest.success) setBestSellers(resBest.data);

        const resPop = await productService.getProducts({ isPopular: 'true', limit: 4 });
        if (resPop.success) setRecommended(resPop.data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setNewsletterSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-warmbg to-warmbg pt-8 pb-16 lg:py-20 border-b border-warmbg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200 shadow-2xs">
                <Heart className="w-4 h-4 text-brand-600 fill-brand-600" />
                <span>Handcrafted Regional Specialties</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-charcoal tracking-tight leading-[1.15]">
                Authentic Taste, <br className="hidden sm:inline" />
                <span className="text-brand-600 relative">
                  Delivered Fresh.
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-300 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 15 Q 50 0 100 15" stroke="currentColor" strokeWidth="6" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Traditional Maharashtrian & Indian snacks, pickles, masalas, and sweets prepared with age-old family recipes, cold-pressed oils, and pure ingredients.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/smart-finder"
                  className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2.5 transition-all text-base hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5" />
                  Find My Taste Match
                </Link>

                <Link
                  to="/store"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-warmbg-soft text-charcoal font-bold rounded-2xl border border-warmbg-accent shadow-xs flex items-center justify-center gap-2 transition-all text-base"
                >
                  Explore Our Pantry
                  <ArrowRight className="w-5 h-5 text-charcoal-muted" />
                </Link>
              </div>

              {/* Trust Micro-Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-warmbg-accent text-xs font-semibold text-charcoal-muted">
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Traditional Recipes</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No Artificial Flavors</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fresh Weekly Batches</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="/images/hero.jpg"
                    alt="Authentic Maharashtrian Food Assortment"
                    className="w-full h-full object-cover"
                  />
                </div>


              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest block mb-1">Our Kitchen Specialties</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-charcoal">Featured Food Categories</h2>
          </div>
          <Link to="/store" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View All Delicacies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/store?category=${encodeURIComponent(cat.name)}`)}
              className="group p-4 bg-white rounded-2xl border border-warmbg-accent hover:border-brand-300 shadow-xs hover:shadow-warm transition-all text-center flex flex-col items-center justify-between h-full"
            >
              <div className="w-14 h-14 rounded-2xl bg-warmbg-card group-hover:bg-brand-50 flex items-center justify-center text-2xl mb-3 transition-colors">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-charcoal group-hover:text-brand-600 transition-colors mb-0.5">{cat.name}</h3>
                <span className="text-[11px] text-charcoal-muted line-clamp-1">{cat.tag}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* TASTE GUIDE CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-amber-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Not Sure What to Try First?
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              Tell us your cravings and we'll suggest delicacies you'll love.
            </h2>
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
              Answer 4 quick questions about your taste preferences, spice level tolerance, and budget. We'll curate a personalized selection just for you.
            </p>
            <div className="pt-2">
              <Link
                to="/smart-finder"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-amber-50 text-brand-700 font-extrabold rounded-2xl shadow-lg transition-all text-sm hover:scale-105"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                Help Me Pick
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BEST SELLERS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest block mb-1">Customer Favorites</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-charcoal">Top Bestsellers</h2>
          </div>
          <Link to="/store?sort=popular" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Explore All Bestsellers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* RECOMMENDED FOR YOU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-warmbg-card rounded-3xl p-6 sm:p-8 border border-warmbg-accent">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-charcoal">Handpicked For You</h2>
                <p className="text-xs text-charcoal-muted">Authentic regional specialties recommended by food lovers</p>
              </div>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommended.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SHOP BY OCCASION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest block mb-1">Tailored Collections</span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-charcoal">Shop by Occasion</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {occasions.map((occ) => (
            <button
              key={occ.name}
              onClick={() => navigate(`/store?category=${encodeURIComponent(occ.category)}`)}
              className="p-6 bg-white rounded-2xl border border-warmbg-accent hover:border-brand-300 shadow-xs hover:shadow-warm transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-lg text-charcoal group-hover:text-brand-600 transition-colors">{occ.name}</span>
                <ArrowRight className="w-5 h-5 text-charcoal-muted group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-charcoal-muted">{occ.tag}</p>
            </button>
          ))}
        </div>
      </section>

      {/* EXPLORE MAHARASHTRA REGIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-charcoal text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="mb-8 max-w-xl">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest block mb-1">Regional Heritage</span>
            <h2 className="font-display font-black text-3xl text-white mb-2">Flavors of Maharashtra</h2>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Explore authentic culinary traditions prepared fresh from distinct regional hubs across Maharashtra.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((reg) => (
              <button
                key={reg.name}
                onClick={() => navigate(`/store?region=${encodeURIComponent(reg.name)}`)}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-500/50 transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  <h3 className="font-display font-bold text-base text-white group-hover:text-brand-400 transition-colors">{reg.name}</h3>
                </div>
                <p className="text-xs text-charcoal-light leading-relaxed">{reg.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-brand-50/50 rounded-3xl p-8 sm:p-12 border border-brand-100">
          <div className="space-y-4">
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest block">Our Heritage</span>
            <h2 className="font-display font-black text-3xl text-charcoal leading-tight">
              Tradition meets modern convenience.
            </h2>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              For generations, Naik Foods has preserved authentic regional recipes using cold-pressed oils, hand-picked spices, and slow-cooking methods passed down through families.
            </p>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Our store bridges cultural authenticity with easy online ordering—ensuring every customer finds authentic regional food matched to their taste preferences.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Discover Our Story <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
            <img
              src="/images/products/kolhapuri-masala.jpg"
              alt="Traditional Spices Preparation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest block mb-1">Customer Reviews</span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-charcoal">Loved by Food Enthusiasts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div key={idx} className="p-6 bg-white rounded-2xl border border-warmbg-accent shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-charcoal leading-relaxed italic mb-4">"{rev.review}"</p>
              </div>
              <div className="flex items-center justify-between border-t border-warmbg-soft pt-3">
                <div>
                  <span className="font-bold text-xs text-charcoal block">{rev.name}</span>
                  <span className="text-[10px] text-charcoal-muted">{rev.city}</span>
                </div>
                {rev.verified && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                    Verified Purchase
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 border border-warmbg-accent shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-charcoal">Get Exclusive Taste Offers</h3>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto">
            Subscribe to receive new festival batch alerts, regional food stories, and exclusive discount codes.
          </p>

          {newsletterSubscribed ? (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">
              🎉 Thank you for subscribing! Check your inbox soon for your welcome gift.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-warmbg-accent bg-warmbg-card text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
