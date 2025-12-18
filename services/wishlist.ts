import { Product } from '../types';

const KEY_PREFIX = 'mmp_wishlist_';

const getKey = (userId: string) => `${KEY_PREFIX}${userId}`;

export const getWishlistIds = (userId: string): string[] => {
  try {
    const raw = localStorage.getItem(getKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

export const setWishlistIds = (userId: string, ids: string[]) => {
  localStorage.setItem(getKey(userId), JSON.stringify(ids));
};

export const toggleWishlist = (userId: string, productId: string): string[] => {
  const ids = new Set(getWishlistIds(userId));
  if (ids.has(productId)) ids.delete(productId);
  else ids.add(productId);
  const next = Array.from(ids);
  setWishlistIds(userId, next);
  return next;
};

export const isWishlisted = (userId: string, productId: string): boolean => {
  return getWishlistIds(userId).includes(productId);
};

export const getWishlistedProducts = (userId: string, products: Product[]): Product[] => {
  const ids = new Set(getWishlistIds(userId));
  return products.filter((p) => ids.has(p.id));
};
