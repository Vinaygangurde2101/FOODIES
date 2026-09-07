import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 4.5, count }) => {
  const fullStars = Math.floor(rating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-500">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? 'fill-amber-400 text-amber-400'
                : 'fill-amber-100 text-amber-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-charcoal ml-0.5">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-xs text-charcoal-muted font-normal">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;
