import React from 'react';
import { Sparkles, UtensilsCrossed, ShieldCheck, Heart, MapPin, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Brand Story & Heritage</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-charcoal">
          Tradition Meets Modern Convenience
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
          Naik Foods SmartShop was created to bridge the rich culinary traditions of Maharashtra and India with intelligent, personalized e-commerce discovery.
        </p>
      </div>

      {/* Story Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-8 sm:p-12 border border-warmbg-accent shadow-xs">
        <div className="space-y-4">
          <h2 className="font-display font-bold text-2xl text-charcoal">Our Heritage & Mission</h2>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            For decades, authentic regional food preparations—from Konkani raw mango pickles to Kolhapuri Kanda Lasun Masala and Nagpur Saoji curry blends—were only accessible to local households.
          </p>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            Traditional food e-commerce stores often overwhelm customers with long, unguided product lists. Naik Foods SmartShop changes this by introducing the **Smart Food Finder** and **Rule-Based Recommendation Engine**, helping every food lover find their exact taste match effortlessly.
          </p>
        </div>

        <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-md">
          <img
            src="/images/hero.jpg"
            alt="Traditional Food Heritage"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-warmbg-accent shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
            🌶️
          </div>
          <h3 className="font-display font-bold text-base text-charcoal">Authentic Small Batches</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Handcrafted in small weekly batches using stone-ground spices, cold-pressed oils, and traditional roasting techniques.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-warmbg-accent shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
            🎯
          </div>
          <h3 className="font-display font-bold text-base text-charcoal">Smart Discovery Engine</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            No more guess work. Our questionnaire calculates compatibility scores based on your heat tolerance, craving, and budget.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-warmbg-accent shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
            🚚
          </div>
          <h3 className="font-display font-bold text-base text-charcoal">Transparent Free Shipping</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Dynamic free delivery threshold tracking above ₹999 with instant affordable gap-filling cross-sell recommendations.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-charcoal text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white">Ready to Experience Smart Food Shopping?</h2>
        <div className="pt-2 flex justify-center gap-4">
          <Link to="/smart-finder" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md">
            Take Smart Finder Quiz
          </Link>
          <Link to="/store" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20">
            Browse All Products
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
