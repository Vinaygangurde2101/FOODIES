import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Sparkles, User, Menu, X, UtensilsCrossed, LogOut, ChevronDown, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/store?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Shop', path: '/store' },
    { name: 'Taste Guide', path: '/smart-finder', highlight: true },
    { name: 'Our Heritage', path: '/about' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-warmbg-accent shadow-xs">
      {/* Announcement Bar */}
      <div className="bg-brand-600 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Heart className="w-3.5 h-3.5 fill-white" />
        <span>Free Delivery on orders above ₹999 across India! Handcrafted Fresh Daily 🚚</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-black text-xl text-charcoal tracking-tight block">
                Naik Foods <span className="text-brand-600 font-normal">Authentic</span>
              </span>
              <span className="text-[10px] text-charcoal-muted font-medium tracking-wider uppercase block -mt-1">
                Handcrafted Regional Delicacies
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search chivda, pickles, puran poli, masalas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl py-2.5 pl-10 pr-4 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-charcoal-muted"
            />
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
          </form>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  location.pathname === link.path
                    ? 'text-brand-600'
                    : link.highlight
                    ? 'text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-xl border border-brand-200 hover:bg-brand-100'
                    : 'text-charcoal hover:text-brand-600'
                }`}
              >
                {link.highlight && <Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions: Account & Cart */}
          <div className="flex items-center gap-3">
            {/* Account */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl text-charcoal hover:bg-warmbg-soft text-sm font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline font-semibold text-xs">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-muted" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-warmbg-accent py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-warmbg-card flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-charcoal-muted" />
                      My Saved Preferences
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-charcoal hover:text-brand-600 transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-charcoal font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal hover:bg-warmbg-soft rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search snacks, pickles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl py-2 pl-9 pr-4 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-warmbg-accent px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl font-semibold text-sm ${
                link.highlight
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-charcoal hover:bg-warmbg-card'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm shadow-sm"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
