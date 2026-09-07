import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 border border-warmbg-accent/60 shadow-sm animate-pulse flex flex-col justify-between">
    <div>
      <div className="w-full h-44 bg-gray-200 rounded-xl mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="flex justify-between items-center mb-3">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
