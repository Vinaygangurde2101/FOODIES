import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, ShieldCheck, Truck, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white pt-16 pb-8 border-t border-charcoal-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-charcoal-muted/20">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Free Delivery over ₹999</h4>
              <p className="text-xs text-charcoal-light">Express delivery across India</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">100% Traditional Recipes</h4>
              <p className="text-xs text-charcoal-light">Handcrafted with pure ingredients</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Fresh Batch Guarantee</h4>
              <p className="text-xs text-charcoal-light">Small batches made weekly</p>
            </div>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-xl text-white">
                Naik Foods <span className="text-brand-500">SmartShop</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Discover authentic Maharashtrian and Indian food delicacies tailored to your taste, budget, and spice preference. Tradition meets modern convenience.
            </p>
          </div>

          {/* Quick Shop */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">Explore Shop</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-light">
              <li><Link to="/store?category=Snacks" className="hover:text-brand-400 transition-colors">Savory Snacks & Chivda</Link></li>
              <li><Link to="/store?category=Pickles" className="hover:text-brand-400 transition-colors">Traditional Pickles & Chutneys</Link></li>
              <li><Link to="/store?category=Sweets" className="hover:text-brand-400 transition-colors">Puran Poli & Sweets</Link></li>
              <li><Link to="/store?category=Masala" className="hover:text-brand-400 transition-colors">Kolhapuri & Malvani Masalas</Link></li>
              <li><Link to="/store?category=Healthy" className="hover:text-brand-400 transition-colors">Healthy Bajra & Jowar Choices</Link></li>
            </ul>
          </div>

          {/* Smart Features */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">Smart Features</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-light">
              <li><Link to="/smart-finder" className="text-brand-400 font-semibold hover:underline">Smart Food Finder Quiz</Link></li>
              <li><Link to="/cart" className="hover:text-brand-400 transition-colors">Free Delivery Progress Bar</Link></li>
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">Our Brand & Heritage</Link></li>
              <li><Link to="/store" className="hover:text-brand-400 transition-colors">Regional Specialties</Link></li>
            </ul>
          </div>

          {/* Customer Service & Legal */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-light">
              <li><span>Email: support@naikfoodssmartshop.com</span></li>
              <li><span>Location: Pune & Mumbai, Maharashtra</span></li>
              <li className="pt-2"><Link to="/about" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/about" className="hover:text-brand-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-charcoal-muted/20 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-light gap-4">
          <p>© {new Date().getFullYear()} Naik Foods SmartShop. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500 inline" /> for Indian Food Lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
