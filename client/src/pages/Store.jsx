import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Search, RotateCcw, ChevronDown } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { productService } from '../services/productService';

const categoriesList = ['All', 'Snacks', 'Pickles', 'Sweets', 'Bakery', 'Masala', 'Healthy', 'Traditional Specials'];
const regionsList = ['All', 'Konkan', 'Vidarbha', 'Marathwada', 'Western Maharashtra', 'All Maharashtra'];
const spiceLevelsList = ['All', 'Mild', 'Medium', 'Spicy', 'None'];
const sortOptions = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Best Rated', value: 'rating' },
  { label: 'Popularity', value: 'popular' },
  { label: 'Price: Low → High', value: 'price_low_high' },
  { label: 'Price: High → Low', value: 'price_high_low' },
];

const Store = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || 'All';
  const regionParam = searchParams.get('region') || 'All';
  const spiceParam = searchParams.get('spiceLevel') || 'All';
  const sortParam = searchParams.get('sort') || 'newest';
  const queryParam = searchParams.get('q') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '1000';
  const pageParam = searchParams.get('page') || '1';

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        if (queryParam) {
          const searchRes = await productService.searchProducts(queryParam);
          if (searchRes.success) {
            setProducts(searchRes.data);
            setTotalProducts(searchRes.data.length);
            setTotalPages(1);
          }
        } else {
          const params = {
            page: pageParam,
            limit: 12,
            sort: sortParam
          };

          if (categoryParam !== 'All') params.category = categoryParam;
          if (regionParam !== 'All') params.region = regionParam;
          if (spiceParam !== 'All') params.spiceLevel = spiceParam;
          if (maxPriceParam !== '1000') params.maxPrice = maxPriceParam;

          const res = await productService.getProducts(params);
          if (res.success) {
            setProducts(res.data);
            setTotalProducts(res.total);
            setTotalPages(res.totalPages);
          }
        }
      } catch (err) {
        console.error('Failed to load store catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [categoryParam, regionParam, spiceParam, sortParam, queryParam, maxPriceParam, pageParam]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === 'All' || value === '' || value === null) {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    });
    updated.set('page', '1'); // Reset to page 1 on filter update
    setSearchParams(updated);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-warmbg-accent">
        <div>
          <h1 className="font-display font-black text-3xl text-charcoal">
            {queryParam ? `Search Results for "${queryParam}"` : 'Product Catalogue'}
          </h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Showing <strong className="text-charcoal font-bold">{totalProducts}</strong> authentic food delicacies
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-4 py-2.5 bg-white border border-warmbg-accent rounded-xl text-xs font-bold text-charcoal flex items-center gap-2 shadow-2xs"
          >
            <Filter className="w-4 h-4 text-brand-600" />
            Filters
          </button>

          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-warmbg-accent shadow-2xs">
            <span className="text-xs font-bold text-charcoal-muted">Sort:</span>
            <select
              value={sortParam}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-transparent text-xs font-bold text-charcoal focus:outline-none cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-warmbg-accent shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-warmbg-soft pb-4">
              <h2 className="font-display font-bold text-base text-charcoal flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                Filter Delicacies
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear All
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">Categories</h3>
              <div className="space-y-1">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateFilters({ category: cat })}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      categoryParam === cat
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                        : 'text-charcoal-muted hover:bg-warmbg-card hover:text-charcoal'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div className="space-y-2 border-t border-warmbg-soft pt-4">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">Region</h3>
              <div className="space-y-1">
                {regionsList.map(reg => (
                  <button
                    key={reg}
                    onClick={() => updateFilters({ region: reg })}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      regionParam === reg
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                        : 'text-charcoal-muted hover:bg-warmbg-card hover:text-charcoal'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* Spice Levels */}
            <div className="space-y-2 border-t border-warmbg-soft pt-4">
              <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">Spice Level</h3>
              <div className="space-y-1">
                {spiceLevelsList.map(spice => (
                  <button
                    key={spice}
                    onClick={() => updateFilters({ spiceLevel: spice })}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      spiceParam === spice
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                        : 'text-charcoal-muted hover:bg-warmbg-card hover:text-charcoal'
                    }`}
                  >
                    {spice}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2 border-t border-warmbg-soft pt-4">
              <div className="flex justify-between items-center text-xs font-bold text-charcoal">
                <span className="uppercase tracking-wider">Max Price</span>
                <span className="text-brand-600">₹{maxPriceParam}</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={maxPriceParam}
                onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

          </div>
        </aside>

        {/* PRODUCT CATALOG GRID */}
        <main className="lg:col-span-9 space-y-8">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products match your filters"
              message="Try broadening your category, region, or price filters to see more authentic foods."
              actionText="Reset Filters"
              actionLink="/store"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-warmbg-accent">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = (idx + 1).toString();
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilters({ page: pageNum })}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          pageParam === pageNum
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'bg-white text-charcoal hover:bg-warmbg-card border border-warmbg-accent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
};

export default Store;
