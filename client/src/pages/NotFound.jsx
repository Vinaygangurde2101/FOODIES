import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, Sparkles } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] bg-warmbg flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Visual Graphic Badge */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-100/80 text-brand-600 mb-6 shadow-inner relative">
          <span className="text-5xl font-extrabold font-display tracking-tight text-brand-700">404</span>
          <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-sm animate-bounce">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-charcoal mb-3">
          Oops! Recipe Route Not Found
        </h1>
        <p className="text-charcoal-muted text-base max-w-md mx-auto mb-8 leading-relaxed">
          The page you are looking for might have been moved, deleted, or doesn't exist. Let's get you back to delicious Maharashtrian delicacies!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            to="/store"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-warmbg-accent text-charcoal font-semibold hover:bg-warmbg-soft hover:border-brand-300 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-brand-600" />
            Explore Store Catalog
          </Link>

          <Link
            to="/smart-finder"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-semibold hover:bg-amber-100 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            Try Smart Finder
          </Link>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white rounded-2xl p-6 border border-warmbg-accent/80 shadow-sm max-w-lg mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-3">
            Popular Taste Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <Link
              to="/store?category=Masala"
              className="px-3 py-1.5 rounded-lg bg-warmbg-soft text-charcoal hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium"
            >
              Authentic Masalas
            </Link>
            <Link
              to="/store?category=Pickles"
              className="px-3 py-1.5 rounded-lg bg-warmbg-soft text-charcoal hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium"
            >
              Regional Pickles
            </Link>
            <Link
              to="/store?category=Sweets"
              className="px-3 py-1.5 rounded-lg bg-warmbg-soft text-charcoal hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium"
            >
              Traditional Sweets
            </Link>
            <Link
              to="/store?category=Snacks"
              className="px-3 py-1.5 rounded-lg bg-warmbg-soft text-charcoal hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium"
            >
              Crunchy Snacks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
