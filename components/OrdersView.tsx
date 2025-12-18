import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Order, User } from '../types';
import { CURRENCY } from '../constants';
import { Loader2, Package, Check, Clock, Truck, MapPin, KeyRound, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { OrderCardSkeleton } from './SkeletonLoader';

interface OrdersViewProps {
  user: User;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [otpInput, setOtpInput] = useState<{ [orderId: string]: string }>({});
  const [verifyingOtp, setVerifyingOtp] = useState<string | null>(null);

  const formatPrice = (price: number) => price.toLocaleString('en-IN');

  const fetchOrders = async () => {
    try {
      const data = await db.getOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    loadOrders();
  }, [user.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const toggleOrderExpand = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleVerifyOtp = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.deliveryOtp) return;

    const enteredOtp = otpInput[orderId] || '';
    if (enteredOtp !== order.deliveryOtp) {
      alert('Invalid OTP. Please try again.');
      return;
    }

    setVerifyingOtp(orderId);
    try {
      await db.confirmDelivery(orderId);
      // Refresh orders
      await fetchOrders();
      alert('Delivery confirmed successfully!');
      setOtpInput({ ...otpInput, [orderId]: '' });
    } catch (error) {
      alert('Failed to confirm delivery. Please try again.');
    } finally {
      setVerifyingOtp(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'out_for_delivery': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="mb-12 text-center">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-4 mx-auto animate-pulse" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">My Orders</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw className={`h-5 w-5 text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 mx-auto">
          Track and manage your orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-14 w-14 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
          <p className="text-slate-600 dark:text-slate-400">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const completedStages = order.trackingStages?.filter(s => s.completed).length || 0;
            const totalStages = order.trackingStages?.length || 0;
            const showOtpInput = order.status === 'out_for_delivery' && order.deliveryOtp;

            return (
              <div key={order.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01]">
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        {order.deliveryPersonName && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            <Truck className="h-3 w-3 inline mr-1" />
                            {order.deliveryPersonName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Order ID</p>
                      <p className="font-mono text-xs text-slate-700 dark:text-slate-300">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{CURRENCY}{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {order.trackingStages && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                        <span>Progress</span>
                        <span>{completedStages}/{totalStages} stages</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${(completedStages / totalStages) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* OTP Verification */}
                  {showOtpInput && (
                    <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-3">
                        <KeyRound className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-2">
                            Delivery OTP Required
                          </p>
                          <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                            Your delivery partner will provide an OTP. Enter it below to confirm delivery.
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="Enter 6-digit OTP"
                              value={otpInput[order.id] || ''}
                              onChange={(e) => setOtpInput({ ...otpInput, [order.id]: e.target.value.replace(/\D/g, '') })}
                              className="flex-1 px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                            />
                            <button
                              onClick={() => handleVerifyOtp(order.id)}
                              disabled={!otpInput[order.id] || otpInput[order.id].length !== 6 || verifyingOtp === order.id}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              {verifyingOtp === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expand Button */}
                  <button
                    onClick={() => toggleOrderExpand(order.id)}
                    className="w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium py-3 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 rounded-lg"
                  >
                    {isExpanded ? (
                      <>
                        <span>Hide Details</span>
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <span>View Details</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-700">
                    {/* Items */}
                    <div className="p-6 space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Order Items</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-700" />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                              {(item.selectedColor || item.selectedRam || item.selectedStorage) && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {[item.selectedColor, item.selectedRam, item.selectedStorage].filter(Boolean).join(' • ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {CURRENCY}{formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Timeline */}
                    {order.trackingStages && (
                      <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Tracking Timeline</h4>
                        <div className="space-y-4">
                          {order.trackingStages.map((stage, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  stage.completed 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                }`}>
                                  {stage.completed ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </div>
                                {idx < order.trackingStages.length - 1 && (
                                  <div className={`w-0.5 h-12 ${
                                    stage.completed ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                                  }`} />
                                )}
                              </div>
                              <div className="flex-1 pt-1">
                                <p className={`text-sm font-semibold ${
                                  stage.completed 
                                    ? 'text-slate-900 dark:text-white' 
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                  {stage.stage}
                                </p>
                                {stage.timestamp && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {new Date(stage.timestamp).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Delivery Address</h4>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{order.shippingAddress}</p>
                          {order.phone && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">📞 {order.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
