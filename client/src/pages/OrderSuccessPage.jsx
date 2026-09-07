import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { orderService } from '../services/orderService';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(orderId);
        if (res.success) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error('Failed to load order receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-charcoal-muted font-bold">Generating your official order receipt...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      
      {/* SUCCESS CONFIRMATION HEADER */}
      <div className="bg-white rounded-3xl p-8 border border-warmbg-accent shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block">Order Placed Successfully</span>
          <h1 className="font-display font-black text-3xl text-charcoal">Thank You For Your Order!</h1>
          <p className="text-xs text-charcoal-muted">
            Order Reference ID: <strong className="text-charcoal font-bold">{orderId}</strong>
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-900 rounded-full text-xs font-bold border border-amber-200">
          <Sparkles className="w-4 h-4 text-brand-600" />
          Fresh batch food preparation initiated!
        </div>
      </div>

      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-warmbg-accent shadow-xs space-y-6">
          <h2 className="font-display font-bold text-lg text-charcoal border-b border-warmbg-soft pb-3">
            Order Summary Receipt
          </h2>

          {/* Items Purchased */}
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-warmbg-soft">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-brand-600" />
                  <div>
                    <span className="font-bold text-charcoal block">{item.name}</span>
                    <span className="text-charcoal-muted text-[10px]">Quantity: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-bold text-charcoal">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-2 text-xs text-charcoal pt-2">
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Subtotal</span>
              <span className="font-bold">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Delivery</span>
              <span className="font-bold">{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
            </div>
            <div className="border-t border-warmbg-soft pt-3 flex justify-between items-baseline">
              <span className="font-display font-extrabold text-base text-charcoal">Total Amount Paid / Payable</span>
              <span className="font-display font-black text-xl text-brand-600">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="p-4 bg-warmbg-card rounded-2xl border border-warmbg-accent text-xs space-y-1">
              <span className="font-bold text-charcoal flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-brand-600" /> Shipping Destination:
              </span>
              <p className="text-charcoal font-semibold">{order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
              <p className="text-charcoal-muted">{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/store"
              className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      )}

    </div>
  );
};

export default OrderSuccessPage;
