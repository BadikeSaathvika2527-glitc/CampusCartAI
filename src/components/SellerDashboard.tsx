import React, { useState, useEffect } from 'react';
import {
  Store as StoreIcon,
  Package,
  DollarSign,
  AlertTriangle,
  Clock,
  Plus,
  Edit2,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Product, Order, OrderStatus } from '../types.ts';

export const SellerDashboard: React.FC = () => {
  const { currentUser, categories, showToast, authFetch } = useApp();

  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'orders'>('orders');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    categoryId: 'cat-electronics',
    price: 499,
    originalPrice: 699,
    stock: 25,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    tags: 'campus,student,study'
  });

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      const [statsRes, prodRes, ordRes] = await Promise.all([
        authFetch(`/api/seller/stats?sellerId=${currentUser.id}`),
        authFetch(`/api/products?sellerId=${currentUser.id}`),
        authFetch(`/api/orders?sellerId=${currentUser.id}`)
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
    } catch (e) {
      console.error('Failed to load seller data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [currentUser.id]);

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const res = await authFetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        showToast('Inventory updated', 'success');
        fetchSellerData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update stock', 'error');
      }
    } catch (e) {
      showToast('Failed to update stock', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await authFetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Order status updated to ${nextStatus.toUpperCase()}`, 'success');
        fetchSellerData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update order status', 'error');
      }
    } catch (e) {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      showToast('Name and price are required', 'error');
      return;
    }

    try {
      const selectedCat = categories.find(c => c.id === newProduct.categoryId);
      const payload = {
        ...newProduct,
        sellerId: currentUser.id,
        storeName: stats?.store?.name || 'Campus Partner Store',
        categoryName: selectedCat?.name || 'College Stationery',
        discountPercent: Math.round(((newProduct.originalPrice - newProduct.price) / newProduct.originalPrice) * 100),
        tags: newProduct.tags.split(',').map(t => t.trim())
      };

      const res = await authFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create product');
      }

      showToast('Product added to campus catalog!', 'success');
      setIsAddProductOpen(false);
      setNewProduct({
        name: '',
        brand: '',
        categoryId: 'cat-electronics',
        price: 499,
        originalPrice: 699,
        stock: 25,
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        tags: 'campus,student,study'
      });
      fetchSellerData();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Seller Store Header */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <StoreIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                {stats?.store?.name || 'Campus Seller Hub'}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Seller
              </span>
            </div>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Managed by {currentUser.name} • {stats?.store?.buildingLocation || 'Campus Shopping Complex'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
          <button
            onClick={fetchSellerData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Today&apos;s Orders</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.todayOrdersCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pending: {stats?.pendingOrdersCount || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Today&apos;s Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{(stats?.todayRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            Total Rev: ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Catalog Items</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.productsCount || products.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active on campus shelves</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-black font-mono ${stats?.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {stats?.lowStockCount || 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">≤ 10 units remaining</div>
        </div>
      </div>

      {/* Tabs: Orders vs Inventory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-4 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`pb-2 transition-colors ${
              activeSubTab === 'orders'
                ? 'border-b-2 border-amber-500 text-amber-900 font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Store Student Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`pb-2 transition-colors ${
              activeSubTab === 'inventory'
                ? 'border-b-2 border-amber-500 text-amber-900 font-black'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Inventory &amp; Stock Management ({products.length})
          </button>
        </div>

        <div className="p-4">
          {activeSubTab === 'orders' ? (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No orders received yet for this store.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.map(order => {
                    const storeItems = order.items.filter(i => i.sellerId === currentUser.id);
                    const storeTotal = storeItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

                    return (
                      <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 font-mono">
                              #{order.orderNumber}
                            </span>
                            <span className="text-slate-500">• {order.customerName}</span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                order.orderStatus === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.orderStatus === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.orderStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-slate-500 mt-1">
                            Destination: {order.shippingAddress.addressLine1} ({order.shippingAddress.campusName})
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            Items: {storeItems.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                          </div>
                        </div>

                        {/* Order Action for seller */}
                        <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                          <span className="font-mono font-black text-slate-900 text-sm mr-2">
                            ₹{storeTotal.toLocaleString('en-IN')}
                          </span>

                          {order.orderStatus === 'placed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg"
                            >
                              Confirm
                            </button>
                          )}
                          {order.orderStatus === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg"
                            >
                              Mark Preparing
                            </button>
                          )}
                          {order.orderStatus === 'preparing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'packed')}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg"
                            >
                              Mark Packed
                            </button>
                          )}
                          {order.orderStatus === 'packed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg"
                            >
                              Dispatch
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5">Stock Level</th>
                      <th className="p-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(prod => (
                      <tr key={prod.id} className="hover:bg-slate-50">
                        <td className="p-2.5 flex items-center space-x-2">
                          <img src={prod.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          <span className="font-bold text-slate-900 max-w-xs truncate">{prod.name}</span>
                        </td>
                        <td className="p-2.5 text-slate-600">{prod.categoryName}</td>
                        <td className="p-2.5 font-mono font-bold">₹{prod.price}</td>
                        <td className="p-2.5">
                          <span
                            className={`font-bold font-mono px-2 py-0.5 rounded-md ${
                              prod.stock <= 5
                                ? 'bg-rose-100 text-rose-800'
                                : prod.stock <= 10
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="p-2.5 space-x-1">
                          <button
                            onClick={() => handleUpdateStock(prod.id, prod.stock + 10)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded text-[11px]"
                          >
                            +10 Stock
                          </button>
                          <button
                            onClick={() => {
                              const promptVal = prompt('Enter new stock quantity:', prod.stock.toString());
                              if (promptVal !== null) {
                                const parsed = parseInt(promptVal, 10);
                                if (!isNaN(parsed) && parsed >= 0) handleUpdateStock(prod.id, parsed);
                              }
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-[11px]"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsAddProductOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 font-display mb-4">
              Add New Product to Store Catalog
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Ergonomic Study Pillow"
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Brand</label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="e.g. CampusCraft"
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Category</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Student Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">MRP (₹)</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={e => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Image URL</label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe why students need this for campus life..."
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-sm"
                >
                  Publish to Campus Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
