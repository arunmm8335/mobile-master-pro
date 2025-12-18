import React from 'react';
import { X, ShoppingCart, Star, Check, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types';
import { CURRENCY } from '../constants';
import { useCart } from '../context/CartContext';
import { ImageCarousel } from './ImageCarousel';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart, setIsCartOpen } = useCart();

  if (!isOpen || !product) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN');
  };

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product);
    setIsCartOpen(true);
    onClose();
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

  const galleryUrls = normalizeGalleryUrls(product);
  const isOutOfStock = typeof product.stock === 'number' ? product.stock <= 0 : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 bg-white/80 dark:bg-slate-800/80 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-800 p-8 flex items-center justify-center relative">
           <div className="w-full">
            <ImageCarousel 
              images={galleryUrls}
              title={product.name}
              className="h-64 md:h-96"
              showThumbnails={true}
            />
           </div>
           {product.featured && (
            <span className="absolute top-6 left-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              BESTSELLER
            </span>
          )}
          {isOutOfStock && (
            <span className="absolute top-6 right-6 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <div className="mb-6">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">{product.brand}</p>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{product.name}</h2>
            
            <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">
                    <span className="text-green-700 dark:text-green-400 font-bold text-sm flex items-center">
                        4.9 <Star className="h-3 w-3 ml-1 fill-current" />
                    </span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">128 Reviews</span>
            </div>

            <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {CURRENCY}{formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                    <span className="text-lg text-slate-400 line-through">
                        {CURRENCY}{formatPrice(product.originalPrice)}
                    </span>
                )}
                {product.originalPrice && (
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                )}
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">Key Features</h3>
                <ul className="space-y-2">
                    {product.specs.map((spec, idx) => (
                        <li key={idx} className="flex items-start text-slate-600 dark:text-slate-300">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>{spec}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="flex space-x-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button 
                onClick={handleBuyNow}
              disabled={isOutOfStock}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
            >
                Buy Now
            </button>
            <button 
                onClick={handleAddToCart}
              disabled={isOutOfStock}
                className="px-6 py-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <ShoppingCart className="h-6 w-6 text-slate-900 dark:text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
