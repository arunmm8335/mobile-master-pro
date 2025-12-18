import React, { useState, useEffect } from 'react';
import { Product, Seller, User } from '../types';
import { db } from '../services/db';
import { Package, TrendingUp, DollarSign, Star, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface SellerDashboardProps {
  user: User;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ user }) => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'profile'>('overview');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadSellerData();
  }, [user]);

  const loadSellerData = async () => {
    try {
      setLoading(true);
      const sellerData = await db.getSellerByUserId(user.id);
      setSeller(sellerData);
      
      const productsData = await db.getProducts();
      const sellerProducts = productsData.filter((p: Product) => p.sellerId === sellerData.id);
      setProducts(sellerProducts);
      
      const ordersData = await db.getOrders('');
      const sellerOrders = ordersData.filter((o: any) => 
        o.items.some((item: any) => item.sellerId === sellerData.id)
      );
      setOrders(sellerOrders);
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData: any) => {
    try {
      await db.addProduct({
        ...productData,
        sellerId: seller?.id,
        sellerName: seller?.storeName,
        rating: 0,
        totalReviews: 0,
        totalSales: 0,
        status: 'pending'
      });
      await loadSellerData();
      setShowProductModal(false);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await db.deleteProduct(productId);
      await loadSellerData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  if (!seller) {
    return <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Seller Dashboard</h2>
      <p>No seller profile found. Please contact support.</p>
    </div>;
  }

  const totalRevenue = orders.reduce((sum, order) => {
    const sellerItems = order.items.filter((item: any) => item.sellerId === seller.id);
    return sum + sellerItems.reduce((itemSum: number, item: any) => itemSum + (item.price * item.quantity), 0);
  }, 0);

  const pendingOrders = orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{seller.storeName}</h1>
            <p className="text-slate-600 dark:text-slate-400">Seller Dashboard</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
              seller.status === 'approved' ? 'bg-green-100 text-green-800' :
              seller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {seller.status === 'approved' ? '✓ Approved' :
               seller.status === 'pending' ? '⏳ Pending Approval' :
               '⚠ Suspended'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Products</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{products.length}</p>
              </div>
              <Package className="text-blue-600" size={32} />
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Sales</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{seller.totalSales}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="text-purple-600" size={32} />
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Rating</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{seller.rating.toFixed(1)}</p>
              </div>
              <Star className="text-yellow-600" size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
          <nav className="flex space-x-4">
            {['overview', 'products', 'orders', 'profile'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Recent Activity</h3>
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded">
                <p className="text-slate-900 dark:text-white font-medium">Pending Orders: {pendingOrders}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Orders awaiting processing</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded">
                <p className="text-slate-900 dark:text-white font-medium">
                  Pending Products: {products.filter(p => p.status === 'pending').length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Products awaiting admin approval</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Products</h3>
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} /> Add Product
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="border dark:border-slate-700 rounded-lg p-4">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded mb-3" />
                  <h4 className="font-bold text-slate-900 dark:text-white">{product.name}</h4>
                  <p className="text-slate-600 dark:text-slate-400">₹{product.price.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Stock: {product.stock || 0}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                    product.status === 'approved' ? 'bg-green-100 text-green-800' :
                    product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.status}
                  </span>
                  <div className="flex gap-2 mt-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Orders</h3>
            <div className="space-y-3">
              {orders.map(order => {
                const sellerItems = order.items.filter((item: any) => item.sellerId === seller.id);
                if (sellerItems.length === 0) return null;
                
                return (
                  <div key={order.id} className="border dark:border-slate-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sellerItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300">{item.name} x {item.quantity}</span>
                          <span className="text-slate-900 dark:text-white font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Store Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Store Name</label>
                <input
                  type="text"
                  value={seller.storeName}
                  className="w-full p-2 border dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Email</label>
                <input
                  type="email"
                  value={seller.businessEmail}
                  className="w-full p-2 border dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Phone</label>
                <input
                  type="tel"
                  value={seller.businessPhone}
                  className="w-full p-2 border dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Commission Rate</label>
                <input
                  type="text"
                  value={`${seller.commission}%`}
                  className="w-full p-2 border dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  readOnly
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
