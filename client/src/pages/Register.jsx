import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [foodType, setFoodType] = useState('Snacks');
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await register({
        name,
        email,
        password,
        preferences: { foodType, spiceLevel }
      });
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 border border-warmbg-accent shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="font-display font-black text-2xl text-charcoal">Create Your Account</h1>
          <p className="text-xs text-charcoal-muted">Join Naik Foods SmartShop & personalize your taste profile</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="Aniket Deshmukh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">Password (Min 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Craving Preference</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl p-2.5 text-xs text-charcoal"
              >
                <option value="Snacks">Snacks & Chivda</option>
                <option value="Pickles">Pickles & Chutneys</option>
                <option value="Sweets">Puran Poli & Sweets</option>
                <option value="Masala">Curry Masalas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Spice Level</label>
              <select
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(e.target.value)}
                className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl p-2.5 text-xs text-charcoal"
              >
                <option value="Mild">Mild Spice</option>
                <option value="Medium">Medium Heat</option>
                <option value="Spicy">Spicy Punch</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Register & Start Shopping'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-warmbg-soft text-xs text-charcoal-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
