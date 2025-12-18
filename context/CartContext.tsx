import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, SelectedOptions } from '../types';

export interface CartItem {
  lineId: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  stock?: number;
  options?: SelectedOptions;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, options?: SelectedOptions) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const makeLineId = (productId: string, options?: SelectedOptions) => {
    const color = options?.color ? `c:${options.color}` : '';
    const ram = options?.ram ? `r:${options.ram}` : '';
    const storage = options?.storage ? `s:${options.storage}` : '';
    const suffix = [color, ram, storage].filter(Boolean).join('|');
    return suffix ? `${productId}__${suffix}` : productId;
  };

  const addToCart = (product: Product, options?: SelectedOptions) => {
    const stock = typeof (product as any).stock === 'number' ? (product as any).stock : undefined;
    if (typeof stock === 'number' && stock <= 0) {
      alert('This item is out of stock.');
      return;
    }

    const lineId = makeLineId(product.id, options);
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.lineId === lineId);
      if (existingItem) {
        const nextQty = existingItem.quantity + 1;
        if (typeof stock === 'number' && nextQty > stock) {
          alert('Not enough stock available.');
          return currentItems;
        }
        return currentItems.map(item =>
          item.lineId === lineId
            ? { ...item, quantity: nextQty }
            : item
        );
      }

      const image = typeof product.image === 'string' ? product.image : '';
      return [
        ...currentItems,
        {
          lineId,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image,
          stock: typeof stock === 'number' ? stock : undefined,
          options,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (lineId: string) => {
    setItems(currentItems => currentItems.filter(item => item.lineId !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(lineId);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.lineId === lineId
          ? (() => {
              const stock = typeof item.stock === 'number' ? item.stock : undefined;
              if (typeof stock === 'number' && quantity > stock) {
                alert('Not enough stock available.');
                return item;
              }
              return { ...item, quantity };
            })()
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
