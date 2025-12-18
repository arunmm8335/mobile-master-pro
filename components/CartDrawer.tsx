import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CURRENCY } from '../constants';
import { ViewState } from '../types';

interface CartDrawerProps {
  onNavigateCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigateCheckout }) => {
  const { items, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN');
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onNavigateCheckout();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="h-full w-full bg-white dark:bg-slate-900 shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
          
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Your Cart
              <span className="ml-2 text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {items.length} items
              </span>
            </h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-slate-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Your cart is empty</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Looks like you haven't added anything yet.</p>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.lineId} className="flex space-x-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain object-center"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-slate-900 dark:text-white">
                        <h3 className="line-clamp-1">{item.name}</h3>
                        <p className="ml-4">{CURRENCY}{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.brand}</p>
                      {(item.options?.color || item.options?.ram || item.options?.storage) && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {[item.options?.color && `Color: ${item.options.color}`, item.options?.ram && `RAM: ${item.options.ram}`, item.options?.storage && `Storage: ${item.options.storage}`]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                        <button 
                          onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.lineId)}
                        className="font-medium text-red-600 hover:text-red-500 flex items-center p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 p-6 space-y-4 bg-white dark:bg-slate-900">
              <div className="flex justify-between text-base font-medium text-slate-900 dark:text-white">
                <p>Subtotal</p>
                <p>{CURRENCY}{formatPrice(cartTotal)}</p>
              </div>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Shipping and taxes calculated at checkout.
              </p>
              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center rounded-xl border border-transparent bg-slate-900 dark:bg-white px-6 py-4 text-base font-bold text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
              >
                Proceed to Checkout <CreditCard className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
