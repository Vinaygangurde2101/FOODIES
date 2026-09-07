import React from 'react';
import { ShoppingBag } from 'lucide-react';

const Toast = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce transition-all">
      <div className="bg-charcoal text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 text-sm font-medium">
        <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
