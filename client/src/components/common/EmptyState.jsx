import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  title = "No products found", 
  message = "We couldn't find anything matching your selected criteria.", 
  actionText = "Explore All Products",
  actionLink = "/store"
}) => {
  return (
    <div className="text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 bg-amber-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
        <PackageSearch className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-charcoal mb-2">{title}</h3>
      <p className="text-charcoal-muted text-sm mb-6 leading-relaxed">{message}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
