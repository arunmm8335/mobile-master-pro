import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../services/db';
import { Product, User } from '../types';
import { CURRENCY } from '../constants';
import { Heart, Loader2 } from 'lucide-react';
import { getWishlistedProducts, toggleWishlist } from '../services/wishlist';

interface WishlistViewProps {
  user: User;
  onOpenProduct: (productId: string) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ user, onOpenProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistTick, setWishlistTick] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await db.getProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const wishlisted = useMemo(() => {
    return getWishlistedProducts(user.id, products);
  }, [user.id, products, wishlistTick]);

  const formatPrice = (price: number) => price.toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-slate-900 dark:text-white" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Wishlist</h2>
        <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 mx-auto">
          Products you saved for later.
        </p>
      </div>

      {wishlisted.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-14 w-14 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
          <p className="text-slate-600 dark:text-slate-400">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlisted.map((p) => (
            <div
              key={p.id}
              className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => onOpenProduct(p.id)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(user.id, p.id);
                  setWishlistTick((x) => x + 1);
                }}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700"
                aria-label="Remove from wishlist"
              >
                <Heart className="h-5 w-5 text-red-600 fill-current" />
              </button>

              <div className="bg-slate-100 dark:bg-slate-700 h-56 p-6 flex items-center justify-center">
                <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{p.brand}</p>
                <div className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                  {CURRENCY}{formatPrice(p.price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
