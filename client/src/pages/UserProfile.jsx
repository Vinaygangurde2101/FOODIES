import React, { useState, useEffect } from 'react';
import { User, Heart, Clock, Package, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import ProductCard from '../components/product/ProductCard';

const UserProfile = () => {
  const { user, updatePreferences } = useAuth();

  const [foodType, setFoodType] = useState(user?.preferences?.foodType || 'Snacks');
  const [spiceLevel, setSpiceLevel] = useState(user?.preferences?.spiceLevel || 'Medium');
  const [region, setRegion] = useState(user?.preferences?.region || 'All Maharashtra');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const res = await orderService.getUserOrders();
        if (res.success) setOrders(res.data);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      }
    };

    if (user) fetchUserOrders();
  }, [user]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updatePreferences({ foodType, spiceLevel, region });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-charcoal mb-2">Sign in required</h2>
        <p className="text-xs text-charcoal-muted mb-4">Please log in to view your taste profile and order history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warmbg-accent shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center font-display font-black text-2xl">
          {user.name.charAt(0)}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h1 className="font-display font-black text-2xl text-charcoal">{user.name}</h1>
          <p className="text-xs text-charcoal-muted">{user.email} • Member since {new Date(user.createdAt || Date.now()).getFullYear()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Taste Preferences Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-warmbg-accent shadow-xs space-y-6">
          <h2 className="font-display font-bold text-lg text-charcoal border-b border-warmbg-soft pb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-600" />
            Your Saved Taste Preferences
          </h2>

          {savedMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">
              ✓ Preferences saved successfully!
            </div>
          )}

          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Primary Food Craving</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl p-3 text-xs text-charcoal"
              >
                <option value="Snacks">Savory Snacks & Chivda</option>
                <option value="Pickles">Pickles & Chutneys</option>
                <option value="Sweets">Puran Poli & Sweets</option>
                <option value="Masala">Curry Masalas</option>
                <option value="Healthy">Healthy Bajra & Jowar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Preferred Spice Tolerance</label>
              <select
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(e.target.value)}
                className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl p-3 text-xs text-charcoal"
              >
                <option value="Mild">Mild Spice</option>
                <option value="Medium">Medium Heat</option>
                <option value="Spicy">Spicy Punch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Regional Origin Preference</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-warmbg-card border border-warmbg-accent rounded-xl p-3 text-xs text-charcoal"
              >
                <option value="Konkan">Konkan Coastal</option>
                <option value="Vidarbha">Vidarbha Saoji</option>
                <option value="Marathwada">Marathwada</option>
                <option value="Western Maharashtra">Western Maharashtra / Pune</option>
                <option value="All Maharashtra">All Maharashtra</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Update Taste Profile'}
            </button>
          </form>
        </div>

        {/* Order History */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-warmbg-accent shadow-xs space-y-6">
          <h2 className="font-display font-bold text-lg text-charcoal border-b border-warmbg-soft pb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600" />
            Order History ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <p className="text-xs text-charcoal-muted italic py-6 text-center">You have no previous orders placed yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord._id} className="p-4 rounded-2xl bg-warmbg-card border border-warmbg-accent text-xs space-y-2">
                  <div className="flex justify-between font-bold text-charcoal border-b border-warmbg-soft pb-2">
                    <span>Order #{ord.orderId}</span>
                    <span className="text-brand-600 font-black">₹{ord.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-muted text-[11px]">
                    <span>Items: {ord.items?.length || 0}</span>
                    <span>Status: <strong className="text-emerald-700 font-semibold">{ord.orderStatus}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
