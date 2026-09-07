import React from 'react';
import { Truck, Sparkles, CheckCircle2 } from 'lucide-react';

const FreeDeliveryProgress = ({ subtotal = 0, threshold = 999 }) => {
  const amountRemaining = Math.max(0, threshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));
  const isUnlocked = subtotal >= threshold;

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${
      isUnlocked 
        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 shadow-xs' 
        : 'bg-amber-50/70 border-amber-200 text-charcoal shadow-xs'
    }`}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <Truck className="w-5 h-5 text-brand-600 flex-shrink-0 animate-pulse" />
          )}
          <span className="text-sm font-bold font-display">
            {isUnlocked ? (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                🎉 You've unlocked FREE DELIVERY!
              </span>
            ) : (
              <span>
                Add <strong className="text-brand-600 font-extrabold">₹{amountRemaining}</strong> more for <strong className="text-brand-600 font-extrabold">FREE DELIVERY 🚚</strong>
              </span>
            )}
          </span>
        </div>

        <span className="text-xs font-extrabold font-display px-2 py-0.5 rounded-full bg-white/80 border border-warmbg-accent">
          {progressPercent}%
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden p-0.5 border border-warmbg-accent">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isUnlocked ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-brand-600'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {!isUnlocked && (
        <p className="text-[11px] text-charcoal-muted mt-2 text-right font-medium">
          Standard delivery fee ₹70 applies below ₹{threshold}.
        </p>
      )}
    </div>
  );
};

export default FreeDeliveryProgress;
