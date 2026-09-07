import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-warmbg-accent shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="font-display font-black text-2xl text-charcoal">Welcome Back</h1>
          <p className="text-xs text-charcoal-muted">Sign in to your Naik Foods SmartShop account</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-xs font-bold text-charcoal mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl p-3 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-warmbg-soft text-xs text-charcoal-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register Now
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
