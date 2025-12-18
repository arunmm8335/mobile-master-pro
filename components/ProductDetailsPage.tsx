import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Loader2, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react';
import { CURRENCY } from '../constants';
import { db } from '../services/db';
import { Product, SelectedOptions } from '../types';
import { ImageCarousel } from './ImageCarousel';
import { useCart } from '../context/CartContext';

interface ProductDetailsPageProps {
  productId: string;
  onBack: () => void;
  onGoCheckout: () => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ productId, onBack, onGoCheckout }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const p = await db.getProduct(productId);
        if (!cancelled) setProduct(p);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const formatPrice = (price: number) => price.toLocaleString('en-IN');

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

  const isOutOfStock = useMemo(() => {
    if (!product) return false;
    return typeof product.stock === 'number' ? product.stock <= 0 : false;
  }, [product]);

  const colors = product?.colors ?? [];
  const ramOptions = product?.ramOptions ?? [];
  const storageOptions = product?.storageOptions ?? [];

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');

  useEffect(() => {
    if (!product) return;
    setSelectedColor(colors[0] ?? '');
    setSelectedRam(ramOptions[0] ?? '');
    setSelectedStorage(storageOptions[0] ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, product?.id]);

  // Get current variant based on selected options
  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    
    return product.variants.find(variant => {
      const colorMatch = !variant.color || !selectedColor || variant.color === selectedColor;
      const ramMatch = !variant.ram || !selectedRam || variant.ram === selectedRam;
      const storageMatch = !variant.storage || !selectedStorage || variant.storage === selectedStorage;
      return colorMatch && ramMatch && storageMatch;
    });
  }, [product, selectedColor, selectedRam, selectedStorage]);

  // Get images for current variant or fallback to default images
  const displayImages = useMemo(() => {
    if (currentVariant && currentVariant.images && currentVariant.images.length > 0) {
      return currentVariant.images;
    }
    return product ? normalizeGalleryUrls(product) : [];
  }, [currentVariant, product]);

  // Get price for current variant or default price
  const displayPrice = useMemo(() => {
    if (currentVariant?.price) return currentVariant.price;
    return product?.price || 0;
  }, [currentVariant, product]);

  const selectionValid = useMemo(() => {
    if (!product) return false;
    if (colors.length > 0 && !selectedColor) return false;
    if (ramOptions.length > 0 && !selectedRam) return false;
    if (storageOptions.length > 0 && !selectedStorage) return false;
    return true;
  }, [product, colors.length, ramOptions.length, storageOptions.length, selectedColor, selectedRam, selectedStorage]);

  const selectedOptions: SelectedOptions | undefined = useMemo(() => {
    if (!product) return undefined;
    const options: SelectedOptions = {};
    if (colors.length > 0) options.color = selectedColor;
    if (ramOptions.length > 0) options.ram = selectedRam;
    if (storageOptions.length > 0) options.storage = selectedStorage;
    return options;
  }, [product, colors.length, ramOptions.length, storageOptions.length, selectedColor, selectedRam, selectedStorage]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedOptions);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedOptions);
    onGoCheckout();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-slate-900 dark:text-white" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-10 text-center text-slate-600 dark:text-slate-300">
          Product not found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {isOutOfStock && (
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            OUT OF STOCK
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
          <ImageCarousel images={displayImages} title={product.name} className="h-[360px] sm:h-[460px]" showThumbnails={true} />
          {currentVariant && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {selectedColor && `${selectedColor}`}
                {selectedRam && ` • ${selectedRam}`}
                {selectedStorage && ` • ${selectedStorage}`}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">{product.brand}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">
              <span className="text-green-700 dark:text-green-400 font-bold text-sm flex items-center">
                {product.rating > 0 ? product.rating.toFixed(1) : '4.9'} <Star className="h-3 w-3 ml-1 fill-current" />
              </span>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{product.totalReviews || 128} Reviews</span>
            {typeof product.stock === 'number' && (
              <span className="text-sm text-slate-500 dark:text-slate-400">• Stock: {Math.max(0, product.stock)}</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span key={displayPrice} className="text-3xl font-bold text-slate-900 dark:text-white">{CURRENCY}{formatPrice(displayPrice)}</span>
            {product.originalPrice && displayPrice < product.originalPrice && (
              <span className="text-lg text-slate-400 line-through">{CURRENCY}{formatPrice(product.originalPrice)}</span>
            )}
            {product.originalPrice && displayPrice < product.originalPrice && (
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}% OFF
              </span>
            )}
            {currentVariant?.price && currentVariant.price !== product.price && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                Variant price
              </span>
            )}
          </div>

          {(colors.length > 0 || ramOptions.length > 0 || storageOptions.length > 0) && (
            <div className="space-y-5 mb-6">
              {colors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Color</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Selected: {selectedColor || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                          selectedColor === c
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {ramOptions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">RAM</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Selected: {selectedRam || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ramOptions.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRam(r)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                          selectedRam === r
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {storageOptions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Storage</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Selected: {selectedStorage || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {storageOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedStorage(s)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                          selectedStorage === s
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">1 Year Warranty</p>
              <p className="text-xs text-slate-500">Official Brand Warranty</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Free Delivery</p>
              <p className="text-xs text-slate-500">Express Shipping</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock || !selectionValid}
              className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              Buy Now
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || !selectionValid}
              className="px-6 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-6 w-6 text-slate-900 dark:text-white" />
            </button>
          </div>

          {!selectionValid && (colors.length > 0 || ramOptions.length > 0 || storageOptions.length > 0) && (
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Please select all options to continue.
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">Key Features</h3>
            <ul className="space-y-2">
              {(product.specs || []).map((spec, idx) => (
                <li key={idx} className="flex items-start text-slate-600 dark:text-slate-300">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
