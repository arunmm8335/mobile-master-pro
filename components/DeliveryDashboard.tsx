import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { MapPin, Package, CheckCircle, Clock, Navigation, TrendingUp } from 'lucide-react';
import { StatCardSkeleton, DeliveryCardSkeleton } from './SkeletonLoader';

interface DeliveryDashboardProps {
  user: User;
}

export const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ user }) => {
  const [deliveryPerson, setDeliveryPerson] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('DeliveryDashboard mounted with user:', user);
    loadDeliveryData();
  }, [user]);

  const loadDeliveryData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching delivery person for user ID:', user.id);
      
      const deliveryData = await db.getDeliveryPersonByUserId(user.id);
      console.log('Delivery data received:', deliveryData);
      
      if (!deliveryData) {
        console.error('No delivery person found for user:', user.id);
        setError('No delivery profile found. Please contact support.');
        setDeliveryPerson(null);
        setLoading(false);
        return;
      }
      
      setDeliveryPerson(deliveryData);
      setIsAvailable(deliveryData.isAvailable || false);
      
      console.log('Fetching orders for delivery person:', deliveryData.id);
      const ordersData = await db.getDeliveryOrders(deliveryData.id);
      console.log('Orders received:', ordersData);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading delivery data:', error);
      setError(`Failed to load delivery data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeliveryPerson(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      await db.updateDeliveryAvailability(deliveryPerson.id, newStatus);
      setIsAvailable(newStatus);
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, message: string) => {
    try {
      await db.updateOrderStatus(orderId, status, message, undefined);
      await loadDeliveryData();
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-4" />
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-2" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => <DeliveryCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !deliveryPerson) {
    return <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Delivery Dashboard</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error || 'No delivery profile found. Please contact support.'}
          </p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">
            User ID: {user.id}
          </p>
        </div>
      </div>
    </div>;
  }

  const pendingDeliveries = orders.filter(o => o.status === 'out_for_delivery').length;
  const completedToday = orders.filter(o => 
    o.status === 'delivered' && 
    new Date(o.actualDelivery).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Delivery Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">{user.name}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
              deliveryPerson.status === 'approved' ? 'bg-green-100 text-green-800' :
              deliveryPerson.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {deliveryPerson.status === 'approved' ? '✓ Approved' :
               deliveryPerson.status === 'pending' ? '⏳ Pending Approval' :
               '⚠ Suspended'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleAvailability}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isAvailable
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isAvailable ? '✓ Available' : '✗ Unavailable'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Pending Deliveries</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-white mt-1">{pendingDeliveries}</p>
              </div>
              <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-xl shadow-md">
                <Package className="text-white" size={28} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-5 rounded-2xl border border-green-200 dark:border-green-800 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">Completed Today</p>
                <p className="text-3xl font-bold text-green-900 dark:text-white mt-1">{completedToday}</p>
              </div>
              <div className="bg-green-600 dark:bg-green-500 p-3 rounded-xl shadow-md">
                <CheckCircle className="text-white" size={28} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-5 rounded-2xl border border-purple-200 dark:border-purple-800 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Total Deliveries</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-white mt-1">{deliveryPerson.totalDeliveries}</p>
              </div>
              <div className="bg-purple-600 dark:bg-purple-500 p-3 rounded-xl shadow-md">
                <TrendingUp className="text-white" size={28} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-800 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Rating</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-white mt-1">{deliveryPerson.rating.toFixed(1)} ⭐</p>
              </div>
              <div className="bg-amber-600 dark:bg-amber-500 p-3 rounded-xl shadow-md">
                <Clock className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Orders */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Assigned Orders</h3>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No orders assigned yet
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="border dark:border-slate-700 rounded-2xl p-5 bg-white dark:bg-slate-800 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-slate-600 dark:text-slate-400 mt-1" size={18} />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {order.shipping?.name || order.userName || 'Customer'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {order.shipping?.address || order.shippingAddress || 'Address not available'}
                        </p>
                        {order.shipping?.city && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {order.shipping.city}, {order.shipping.state} - {order.shipping.pincode}
                          </p>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          📞 {order.shipping?.phone || order.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Items:</p>
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">{item.name} x {item.quantity}</span>
                        <span className="text-slate-900 dark:text-white font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t dark:border-slate-600 pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-900 dark:text-white">Total</span>
                        <span className="text-slate-900 dark:text-white">₹{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons based on order status */}
                  {order.status === 'confirmed' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'shipped', 'Package picked up and on the way to delivery hub')}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      >
                        📦 Mark as Picked Up / Shipped
                      </button>
                    </div>
                  )}

                  {order.status === 'shipped' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery', 'Package is out for delivery')}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      >
                        🚚 Start Delivery (Out for Delivery)
                      </button>
                    </div>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'delivered', 'Package delivered successfully')}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      >
                        ✓ Mark as Delivered
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter reason for failed delivery:');
                          if (reason) {
                            handleUpdateOrderStatus(order.id, 'shipped', `Delivery attempt failed: ${reason}`);
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      >
                        ✗ Delivery Failed
                      </button>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 text-center">
                      <p className="text-green-800 dark:text-green-200 font-medium">✓ Order Delivered</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
