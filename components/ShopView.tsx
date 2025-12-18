import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../services/db';
import { Product } from '../types';
import { CURRENCY } from '../constants';
import { Star, ShoppingCart, Loader2, Heart, Sparkles } from 'lucide-react';
import { ImageCarousel } from './ImageCarousel';
import { getWishlistIds, toggleWishlist } from '../services/wishlist';
import { ProductCardSkeleton } from './SkeletonLoader';

interface ShopViewProps {
  onOpenProduct: (productId: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ onOpenProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'>('featured');
  const [wishlistTick, setWishlistTick] = useState(0);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 200000 });
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await db.getProducts();
      // Only show approved products
      const approvedProducts = data.filter((p: Product) => p.status === 'approved');
      setProducts(approvedProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const currentUser = db.getCurrentUser();
  const wishlistIds = useMemo(() => {
    return currentUser ? new Set(getWishlistIds(currentUser.id)) : new Set<string>();
  }, [currentUser?.id, wishlistTick]);

  // Get unique brands for filter
  const brands = useMemo(() => {
    const brandSet = new Set(products.map(p => p.brand));
    return Array.from(brandSet).sort();
  }, [products]);

  const matchesQuery = (p: Product, q: string) => {
    const query = q.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      p.name,
      p.brand,
      p.category,
      p.description,
      p.sellerName,
      ...(p.specs || []),
      ...(p.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  };

  const toDateMs = (value: any): number => {
    if (!value) return 0;
    const d = value instanceof Date ? value : new Date(value);
    const ms = d.getTime();
    return Number.isFinite(ms) ? ms : 0;
  };

  const filteredProducts = products
    .filter(p => (activeCategory === 'all' ? true : p.category === activeCategory))
    .filter(p => (selectedBrand === 'all' ? true : p.brand === selectedBrand))
    .filter(p => p.price >= priceRange.min && p.price <= priceRange.max)
    .filter(p => (p.rating || 0) >= minRating)
    .filter(p => matchesQuery(p, searchQuery));

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortMode) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return toDateMs(b.createdAt) - toDateMs(a.createdAt);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popular':
        return (b.totalSales || 0) - (a.totalSales || 0);
      case 'featured':
      default:
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    }
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN');
  };

  const normalizeGalleryUrls = (p: Product): string[] => {
    const raw = (p as any).images;
    const fromImages = Array.isArray(raw)
      ? raw
          .map((x: any) => (typeof x === 'string' ? x : x?.fileUrl))
          .filter((x: any) => typeof x === 'string' && x.length > 0)
      : [];
    const primary = typeof p.image === 'string' && p.image.length > 0 ? [p.image] : [];
    const merged = [...fromImages];
    for (const url of primary) {
      if (!merged.includes(url)) merged.unshift(url);
    }
    return merged.length > 0 ? merged : primary;
  };

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="mb-12 text-center">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-4 mx-auto animate-pulse" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-4">
              <Sparkles className="h-4 w-4" />
              Premium Collection
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              <span className="font-bold text-blue-400">{sortedProducts.length}</span> products available
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
      {/* Category Filters */}
      <div className="flex justify-center mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-3 px-2">
          {['all', 'phone', 'accessory', 'tablet', 'charger', 'case', 'earphones', 'smartwatch'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:scale-105'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-xl mb-6 text-slate-900 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h3>
            
            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Price Range</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">Min: ₹{priceRange.min.toLocaleString()}</label>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="1000"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">Max: ₹{priceRange.max.toLocaleString()}</label>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Brand</h4>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Minimum Rating</h4>
              <div className="space-y-2">
                {[4, 3, 2, 1, 0].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                      minRating === rating
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                    {rating > 0 && <span className="ml-2">& Up</span>}
                    {rating === 0 && <span className="ml-2">All Ratings</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setPriceRange({ min: 0, max: 200000 });
                setSelectedBrand('all');
                setMinRating(0);
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white py-3 rounded-xl hover:from-slate-800 hover:to-slate-950 transition-all font-semibold shadow-sm hover:shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-8">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, or specs"
              className="w-full sm:max-w-md px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as any)}
              className="w-full sm:w-64 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            >
              <option value="featured">Featured first</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">{sortedProducts.map((product) => (
          <div 
            key={product.id} 
            onClick={() => onOpenProduct(product.id)}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 flex flex-col cursor-pointer"
          >
            {currentUser && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(currentUser.id, product.id);
                  setWishlistTick((x) => x + 1);
                }}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700"
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`h-5 w-5 ${wishlistIds.has(product.id) ? 'text-red-600 fill-current' : 'text-slate-600 dark:text-slate-300'}`}
                />
              </button>
            )}
            {typeof product.stock === 'number' && product.stock <= 0 && (
              <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                OUT OF STOCK
              </span>
            )}
            <div className="aspect-w-1 aspect-h-1 bg-slate-100 dark:bg-slate-700 group-hover:opacity-95 transition-opacity h-64 overflow-hidden relative p-6">
              <ImageCarousel
                images={normalizeGalleryUrls(product)}
                title={product.name}
                className="h-full"
                showThumbnails={false}
              />
               {product.featured && (
                <span className="absolute top-3 left-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  HOT
                </span>
              )}
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {product.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{product.brand}</p>
                        {product.sellerName && (
                          <p className="text-xs text-slate-400 dark:text-slate-500">by {product.sellerName}</p>
                        )}
                    </div>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-slate-900 dark:text-white text-xs font-bold">
                        <Star className="h-3 w-3 mr-1 fill-current" /> {(product.rating || 0).toFixed(1)}
                        {product.totalReviews > 0 && (
                          <span className="ml-1 text-slate-500 dark:text-slate-400">({product.totalReviews})</span>
                        )}
                    </div>
                </div>
                
                <ul className="mt-4 space-y-1">
                  {product.specs.slice(0, 2).map((spec, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                      <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full mr-2"></span>
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                   {product.originalPrice && (
                       <span className="text-sm text-slate-400 dark:text-slate-500 line-through mr-2">{CURRENCY}{formatPrice(product.originalPrice)}</span>
                   )}
                   <span className="text-2xl font-bold text-slate-900 dark:text-white">{CURRENCY}{formatPrice(product.price)}</span>
                </div>
                <button
                  disabled={typeof product.stock === 'number' && product.stock <= 0}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProduct(product.id);
                  }}
                  className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:disabled:hover:bg-white transition-colors shadow-md hover:shadow-lg hover:scale-105 dark:hover:shadow-none"
                >
                    <ShoppingCart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}</div>
        </div>
      </div>
      </div>
    </div>
  );
};