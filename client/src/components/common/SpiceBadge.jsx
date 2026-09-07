import React from 'react';
import { Flame } from 'lucide-react';

const SpiceBadge = ({ level = 'None' }) => {
  if (!level || level === 'None') return null;

  const styles = {
    Mild: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Spicy: 'bg-red-50 text-red-700 border-red-200'
  };

  const currentStyle = styles[level] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      <Flame className="w-3 h-3" />
      {level} Spice
    </span>
  );
};

export default SpiceBadge;
