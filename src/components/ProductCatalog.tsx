import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  AlertCircle,
  X,
  Search,
  Store,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types.ts';

export const ProductCatalog: React.FC = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    openProductModal,
    toggleWishlist,
    isInWishlist
  } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('relevance');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('categoryId', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (maxPrice < 3000) params.append('maxPrice', maxPrice.toString());
        if (inStockOnly) params.append('inStockOnly', 'true');
        if (minRating > 0) params.append('minRating', minRating.toString());
        if (sortBy) params.append('sortBy', sortBy);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (e) {
        console.error('Failed to load products:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, maxPrice, inStockOnly, minRating, sortBy]);

  return (
    <div>
      {/* Top Controls: Result Count, Filter Trigger & Sort By */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-sm text-slate-900">
            {products.length} Products Found
          </span>
          {selectedCategory && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
              Filtered by Category
            </span>
          )}
          {searchQuery && (
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              &quot;{searchQuery}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="sm:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters</span>
          </button>

          {/* In Stock toggle */}
          <label className="hidden md:flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => setInStockOnly(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="relevance">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="w-64 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs shrink-0 hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filters</span>
            </h4>
            {(maxPrice < 3000 || inStockOnly || minRating > 0 || selectedCategory) && (
              <button
                onClick={() => {
                  setMaxPrice(3000);
                  setInStockOnly(false);
                  setMinRating(0);
                  setSelectedCategory(null);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Max Budget:</span>
              <span className="font-mono text-blue-600 font-bold">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>₹100</span>
              <span>₹1,500</span>
              <span>₹3,000+</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Minimum Rating
            </div>
            <div className="space-y-1.5">
              {[4, 4.5].map(rating => (
                <button
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    minRating === rating ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{rating}★ &amp; above</span>
                  </div>
                  {minRating === rating && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock toggle */}
          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse space-y-3"
                >
                  <div className="w-full h-40 bg-slate-100 rounded-xl"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No matching campus products found
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Try adjusting your budget slider, clear search filters, or ask CampusCart AI to help build your kit.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery('');
                  setMaxPrice(3000);
                  setInStockOnly(false);
                }}
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {products.map(product => {
                const inWishlist = isInWishlist(product.id);
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= 5;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Top Image area */}
                    <div className="relative pt-[85%] bg-slate-100 overflow-hidden cursor-pointer">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        onClick={() => openProductModal(product)}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-600 shadow-xs transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            inWishlist ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>

                      {/* Discount Badge */}
                      {product.discountPercent > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                          {product.discountPercent}% OFF
                        </span>
                      )}

                      {/* Stock Alert Pill */}
                      {isOutOfStock ? (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
                          Out of Stock
                        </div>
                      ) : isLowStock ? (
                        <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Only {product.stock} left!
                        </span>
                      ) : null}
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Brand & Store */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-bold uppercase tracking-wider truncate max-w-[120px]">
                            {product.brand}
                          </span>
                          <span className="text-slate-400 truncate max-w-[100px]">
                            {product.storeName}
                          </span>
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => openProductModal(product)}
                          className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer mb-1.5 transition-colors"
                        >
                          {product.name}
                        </h4>

                        {/* Rating */}
                        <div className="flex items-center space-x-1 mb-2">
                          <div className="flex items-center bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                            <span>{product.rating}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            ({product.reviewCount})
                          </span>
                        </div>
                      </div>

                      {/* Price & Add to Cart */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                            ₹{product.price.toLocaleString('en-IN')}
                          </div>
                          {product.originalPrice > product.price && (
                            <div className="text-[10px] text-slate-400 line-through font-mono">
                              ₹{product.originalPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => addToCart(product.id, 1)}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 p-2 sm:px-3 sm:py-2 rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center space-x-1.5 shrink-0"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
