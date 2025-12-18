import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product, Order } from '../types';
import { Plus, Trash2, Package, Loader2, Save, Pencil, ShoppingBag, Users, Truck, User, Sparkles } from 'lucide-react';
import { CURRENCY } from '../constants';
import { FileUpload } from './FileUpload';
import { TableRowSkeleton } from './SkeletonLoader';

type AdminTab = 'products' | 'orders' | 'sellers' | 'delivery';

interface AdminViewProps {
  initialTab?: AdminTab;
}

export const AdminView: React.FC<AdminViewProps> = ({ initialTab = 'orders' }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<{ fileUrl: string; originalName: string; mimeType: string }>>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    brand: '',
    price: 0,
    category: 'phone',
    specs: [],
    image: '',
    stock: 10
  });
  const [specsInput, setSpecsInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [ramInput, setRamInput] = useState('');
  const [storageInput, setStorageInput] = useState('');

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadSellers();
    loadDeliveryPersons();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadProducts = async () => {
    setLoading(true);
    const data = await db.getProducts();
    setProducts(data);
    setLoading(false);
  };

  const loadOrders = async () => {
    try {
      const data = await db.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadSellers = async () => {
    try {
      const data = await db.getSellers();
      setSellers(data);
    } catch (error) {
      console.error('Error loading sellers:', error);
    }
  };

  const loadDeliveryPersons = async () => {
    try {
      const data = await db.getDeliveryPersons();
      setDeliveryPersons(data);
    } catch (error) {
      console.error('Error loading delivery persons:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await db.deleteProduct(id);
      loadProducts();
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingProductId(null);
    setUploadedImages([]);
    setExistingImageUrls([]);
    setNewProduct({
      name: '',
      brand: '',
      price: 0,
      category: 'phone',
      specs: [],
      image: '',
      stock: 10,
    });
    setSpecsInput('');
    setColorsInput('');
    setRamInput('');
    setStorageInput('');
  };

  const startEdit = (product: Product) => {
    setIsAdding(true);
    setEditingProductId(product.id);
    setUploadedImages([]);
    setExistingImageUrls(
      (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean)
    );
    setNewProduct({
      ...product,
      stock: typeof product.stock === 'number' ? product.stock : 10,
    });
    setSpecsInput((product.specs || []).join(', '));
    setColorsInput((product.colors || []).join(', '));
    setRamInput((product.ramOptions || []).join(', '));
    setStorageInput((product.storageOptions || []).join(', '));
  };

  const removeExistingImage = (url: string) => {
    setExistingImageUrls((cur) => cur.filter((x) => x !== url));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const uploadUrls = uploadedImages.map((img) => img.fileUrl).filter(Boolean);
    const urlInput = newProduct.image ? [newProduct.image] : [];
    const combined = [...existingImageUrls, ...uploadUrls, ...urlInput].filter(Boolean);
    const imageUrls = combined.length > 0 ? combined : ['https://picsum.photos/id/1/400/400'];

    const firstImage = imageUrls[0];

    const payload = {
      name: newProduct.name!,
      brand: newProduct.brand || 'Generic',
      price: Number(newProduct.price),
      category: newProduct.category as any,
      specs: specsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      colors: colorsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      ramOptions: ramInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      storageOptions: storageInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      image: firstImage,
      images: imageUrls,
      stock: typeof newProduct.stock === 'number' ? Math.max(0, Math.floor(newProduct.stock)) : 10,
      featured: Boolean(newProduct.featured),
    };

    if (editingProductId) {
      await db.updateProduct(editingProductId, payload);
    } else {
      await db.addProduct(payload as any);
    }

    resetForm();
    loadProducts();
  };

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-8 w-8 text-slate-900 dark:text-white" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <OrdersManagement orders={orders} deliveryPersons={deliveryPersons} onUpdate={loadOrders} />
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <ProductsManagement 
          products={products}
          loading={loading}
          onUpdate={loadProducts}
        />
      )}

      {/* Sellers Tab */}
      {activeTab === 'sellers' && (
        <SellersManagement sellers={sellers} onUpdate={loadSellers} />
      )}

      {/* Delivery Tab */}
      {activeTab === 'delivery' && (
        <DeliveryManagement deliveryPersons={deliveryPersons} onUpdate={loadDeliveryPersons} />
      )}
    </div>
  );
};

// Orders Management Component
const OrdersManagement: React.FC<{ 
  orders: Order[]; 
  deliveryPersons: any[]; 
  onUpdate: () => void;
}> = ({ orders, deliveryPersons, onUpdate }) => {
  const [selectedDelivery, setSelectedDelivery] = useState<{ [orderId: string]: string }>({});
  const [assigning, setAssigning] = useState<string | null>(null);

  const handleAssignDelivery = async (orderId: string) => {
    const deliveryPersonId = selectedDelivery[orderId];
    if (!deliveryPersonId) return;

    const deliveryPerson = deliveryPersons.find(d => d.id === deliveryPersonId);
    if (!deliveryPerson) return;

    setAssigning(orderId);
    try {
      await db.assignDeliveryPerson(orderId, deliveryPersonId, deliveryPerson.name);
      onUpdate();
      setSelectedDelivery({ ...selectedDelivery, [orderId]: '' });
    } catch (error) {
      alert('Failed to assign delivery person');
    } finally {
      setAssigning(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'out_for_delivery': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl">
          <ShoppingBag className="h-14 w-14 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
          <p className="text-slate-600 dark:text-slate-400">No orders yet</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
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
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {CURRENCY}{order.total.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customer</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {order.userName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {order.phone || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {order.shippingAddress || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4 space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {CURRENCY}{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            {/* Assign Delivery */}
            {order.status === 'pending' && !order.deliveryPersonId && (
              <div className="flex gap-3">
                <select
                  value={selectedDelivery[order.id] || ''}
                  onChange={(e) => setSelectedDelivery({ ...selectedDelivery, [order.id]: e.target.value })}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select delivery person...</option>
                  {deliveryPersons.filter(d => d.status === 'active').map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignDelivery(order.id)}
                  disabled={!selectedDelivery[order.id] || assigning === order.id}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors"
                >
                  {assigning === order.id ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Assign'}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

// Products Management Component (existing code)
const ProductsManagement: React.FC<{
  products: Product[];
  loading: boolean;
  onUpdate: () => void;
}> = ({ products, loading, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<{ fileUrl: string; originalName: string; mimeType: string }>>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    brand: '',
    price: 0,
    category: 'phone',
    specs: [],
    image: '',
    stock: 10
  });
  const [specsInput, setSpecsInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [ramInput, setRamInput] = useState('');
  const [storageInput, setStorageInput] = useState('');

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await db.deleteProduct(id);
      onUpdate();
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingProductId(null);
    setUploadedImages([]);
    setExistingImageUrls([]);
    setNewProduct({
      name: '',
      brand: '',
      price: 0,
      category: 'phone',
      specs: [],
      image: '',
      stock: 10,
    });
    setSpecsInput('');
    setColorsInput('');
    setRamInput('');
    setStorageInput('');
  };

  const startEdit = (product: Product) => {
    setIsAdding(true);
    setEditingProductId(product.id);
    setUploadedImages([]);
    setExistingImageUrls(
      (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean)
    );
    setNewProduct({
      ...product,
      stock: typeof product.stock === 'number' ? product.stock : 10,
    });
    setSpecsInput((product.specs || []).join(', '));
    setColorsInput((product.colors || []).join(', '));
    setRamInput((product.ramOptions || []).join(', '));
    setStorageInput((product.storageOptions || []).join(', '));
  };

  const removeExistingImage = (url: string) => {
    setExistingImageUrls((cur) => cur.filter((x) => x !== url));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const uploadUrls = uploadedImages.map((img) => img.fileUrl).filter(Boolean);
    const urlInput = newProduct.image ? [newProduct.image] : [];
    const combined = [...existingImageUrls, ...uploadUrls, ...urlInput].filter(Boolean);
    const imageUrls = combined.length > 0 ? combined : ['https://picsum.photos/id/1/400/400'];

    const firstImage = imageUrls[0];

    const payload = {
      name: newProduct.name!,
      brand: newProduct.brand || 'Generic',
      price: Number(newProduct.price),
      category: newProduct.category as any,
      specs: specsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      colors: colorsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      ramOptions: ramInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      storageOptions: storageInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
      image: firstImage,
      images: imageUrls,
      stock: typeof newProduct.stock === 'number' ? Math.max(0, Math.floor(newProduct.stock)) : 10,
      featured: Boolean(newProduct.featured),
    };

    if (editingProductId) {
      await db.updateProduct(editingProductId, payload);
    } else {
      await db.addProduct(payload as any);
    }

    resetForm();
    onUpdate();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600 dark:text-slate-400">Manage product inventory</p>
        <button
          onClick={() => (isAdding ? resetForm() : setIsAdding(true))}
          className="flex items-center px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:opacity-90 transition-colors shadow-sm"
        >
          {isAdding ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Product</>}
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in-down">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            {editingProductId ? 'Edit Item' : 'Add New Item'}
          </h3>
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                placeholder="Product Name"
                className="p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
              <input
                placeholder="Brand"
                className="p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
                value={newProduct.brand}
                onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Price"
                className="p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
                value={newProduct.price || ''}
                onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                required
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                className="p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
                value={typeof newProduct.stock === 'number' ? newProduct.stock : ''}
                onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                min={0}
              />
              <select
                  className="p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}
              >
                  <option value="phone">Phone</option>
                  <option value="accessory">Accessory</option>
                  <option value="tablet">Tablet</option>
              </select>
            </div>

            {editingProductId && existingImageUrls.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Existing Media</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImageUrls.map((url) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt=""
                        className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Upload Images/Videos</h4>
              <FileUpload 
                onFilesUpload={setUploadedImages}
                maxFiles={5}
                acceptTypes="image/*,video/*"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Or Enter Image URL</label>
              <input
                placeholder="https://example.com/image.jpg"
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
                value={newProduct.image}
                onChange={e => setNewProduct({...newProduct, image: e.target.value})}
              />
            </div>

            <input
              placeholder="Specs (comma separated, e.g: 5G Ready, 108MP Camera, 120Hz Display)"
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
              value={specsInput}
              onChange={e => setSpecsInput(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <input
                placeholder="Colors (comma separated, e.g: Black, Blue, Red)"
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
                value={colorsInput}
                onChange={e => setColorsInput(e.target.value)}
              />
              <input
                placeholder="RAM Options (comma separated, e.g: 6GB, 8GB, 12GB)"
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
                value={ramInput}
                onChange={e => setRamInput(e.target.value)}
              />
              <input
                placeholder="Storage Options (comma separated, e.g: 128GB, 256GB)"
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 outline-none dark:text-white"
                value={storageInput}
                onChange={e => setStorageInput(e.target.value)}
              />
            </div>
            
            <button type="submit" className="w-full py-3.5 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors flex justify-center items-center shadow-md">
                <Save className="h-5 w-5 mr-2" /> {editingProductId ? 'Update Item' : 'Save to Database'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Product</th>
                <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                        <img src={product.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-5 text-sm text-slate-600 dark:text-slate-300 font-bold">
                    {CURRENCY}{product.price.toLocaleString('en-IN')}
                  </td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => startEdit(product)}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors mr-2"
                      title="Edit"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                  <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-500 dark:text-slate-400">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          No products found in database.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sellers Management Component
const SellersManagement: React.FC<{ sellers: any[]; onUpdate: () => void }> = ({ sellers, onUpdate }) => {
  const handleUpdateStatus = async (sellerId: string, status: string) => {
    try {
      await db.updateSellerStatus(sellerId, status);
      onUpdate();
    } catch (error) {
      alert('Failed to update seller status');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Seller</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Business</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Products</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Sales</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {sellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="p-5">
                  <p className="font-semibold text-slate-900 dark:text-white">{seller.ownerName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{seller.email}</p>
                </td>
                <td className="p-5 text-sm text-slate-600 dark:text-slate-300">{seller.businessName}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    seller.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    seller.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {seller.status}
                  </span>
                </td>
                <td className="p-5 text-sm text-slate-600 dark:text-slate-300">{seller.totalProducts || 0}</td>
                <td className="p-5 text-sm text-slate-600 dark:text-slate-300">{seller.totalSales || 0}</td>
                <td className="p-5">
                  {seller.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(seller.id, 'approved')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                    >
                      Approve
                    </button>
                  )}
                  {seller.status === 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(seller.id, 'suspended')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium"
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Delivery Management Component
const DeliveryManagement: React.FC<{ deliveryPersons: any[]; onUpdate: () => void }> = ({ deliveryPersons, onUpdate }) => {
  if (deliveryPersons.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl">
        <Truck className="h-14 w-14 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
        <p className="text-slate-600 dark:text-slate-400">No delivery persons registered yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Name</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Contact</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Vehicle</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Current Orders</th>
              <th className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {deliveryPersons.map((person) => (
              <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="p-5">
                  <p className="font-semibold text-slate-900 dark:text-white">{person.name}</p>
                </td>
                <td className="p-5">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{person.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{person.phone}</p>
                </td>
                <td className="p-5 text-sm text-slate-600 dark:text-slate-300">
                  {person.vehicleType} - {person.vehicleNumber}
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    person.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {person.status}
                  </span>
                </td>
                <td className="p-5 text-sm text-slate-600 dark:text-slate-300">{person.currentOrders || 0}</td>
                <td className="p-5 text-sm text-slate-600 dark:text-slate-300">{person.completedDeliveries || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};