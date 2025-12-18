import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CURRENCY } from '../constants';
import { ArrowLeft, Loader2, CheckCircle2, Package, Truck, Check } from 'lucide-react';
import { db } from '../services/db';

interface CheckoutPageProps {
  onBack: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack }) => {
  const { items, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const currentUser = db.getCurrentUser();
      if (!currentUser) {
        alert('Please login to place order');
        return;
      }

      const subtotal = cartTotal;
      const tax = cartTotal * 0.18;
      const total = subtotal + tax;

      // Create order directly without payment
      const order = await db.createOrder({
        userId: currentUser.id,
        userName: currentUser.name,
        items: items.map((it) => ({
          productId: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
          selectedColor: it.options?.color,
          selectedRam: it.options?.ram,
          selectedStorage: it.options?.storage,
        })),
        total: total,
        status: 'pending',
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.pincode}`,
        phone: formData.phone,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        trackingStages: [
          { stage: 'Order Placed', completed: true, timestamp: new Date() },
          { stage: 'Confirmed', completed: false },
          { stage: 'Shipped', completed: false },
          { stage: 'Out for Delivery', completed: false },
          { stage: 'Delivered', completed: false }
        ]
      });

      // Success
      setOrderId(order.id);
      setOrderSuccess(true);
      clearCart();
      
      setTimeout(() => {
        onBack();
      }, 3000);
    } catch (error) {
      console.error('Order error:', error);
      alert('Order failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-green-100 dark:bg-green-900/30 animate-ping"></div>
            </div>
            <div className="relative">
              <CheckCircle2 className="h-32 w-32 text-green-500 mx-auto animate-bounce" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Order Placed Successfully!
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Order ID</span>
              <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{orderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Amount</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{CURRENCY}{formatPrice(cartTotal * 1.18)}</span>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center text-green-600 dark:text-green-400">
              <Check className="h-5 w-5 mr-2" />
              <span className="text-sm">Order Placed</span>
            </div>
            <div className="flex items-center justify-center text-slate-400">
              <Package className="h-5 w-5 mr-2" />
              <span className="text-sm">Awaiting Confirmation</span>
            </div>
            <div className="flex items-center justify-center text-slate-400">
              <Truck className="h-5 w-5 mr-2" />
              <span className="text-sm">Delivery Pending</span>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Your order has been placed successfully. Track your order from the Orders page.
          </p>
          <div className="text-sm text-slate-500 dark:text-slate-500">
            Redirecting to home...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-screen-2xl mx-auto px-0 sm:px-2 lg:px-4">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Cart
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sticky top-20">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.lineId} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                      {(item.options?.color || item.options?.ram || item.options?.storage) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {[item.options?.color && `Color: ${item.options.color}`, item.options?.ram && `RAM: ${item.options.ram}`, item.options?.storage && `Storage: ${item.options.storage}`]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {CURRENCY}{formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">{CURRENCY}{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Tax</span>
                  <span className="font-medium text-slate-900 dark:text-white">{CURRENCY}{formatPrice(cartTotal * 0.18)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-4 flex justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="font-bold text-lg text-slate-900 dark:text-white">
                    {CURRENCY}{formatPrice(cartTotal * 1.18)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Delivery Information</h2>

              <form onSubmit={handleCheckout} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Address *
                  </label>
                  <textarea
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Enter your complete address"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      City *
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      PIN Code *
                    </label>
                    <input
                      required
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="110001"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-8">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-lg rounded-xl transition-all flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <span>Place Order - {CURRENCY}{formatPrice(cartTotal * 1.18)}</span>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                    🔒 Cash on Delivery Available
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
