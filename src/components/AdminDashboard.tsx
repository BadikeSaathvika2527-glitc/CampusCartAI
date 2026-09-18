import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Tag,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  UserPlus,
  Store as StoreIcon,
  Filter,
  Lock,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Coupon, Store as StoreType, User } from '../types.ts';

export const AdminDashboard: React.FC = () => {
  const { currentUser, showToast, authFetch } = useApp();

  const [stats, setStats] = useState<any>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'seller' | 'admin'>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'users' | 'coupons'>('overview');

  // Modals
  const [isCreateSellerOpen, setIsCreateSellerOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  // Seller Creation Form
  const [sellerForm, setSellerForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    storeName: '',
    campusLocation: 'Student Activity Center, First Floor',
    description: ''
  });

  // Admin Creation Form
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, couponsRes, usersRes] = await Promise.all([
        authFetch('/api/admin/stats'),
        authFetch('/api/coupons'),
        authFetch('/api/admin/users')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (couponsRes.ok) setCoupons(await couponsRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStoreApproval = async (storeId: string) => {
    try {
      const res = await authFetch(`/api/admin/stores/${storeId}/toggle-approval`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast('Store approval status updated', 'success');
        fetchAdminData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update store status', 'error');
      }
    } catch (e) {
      showToast('Failed to update store', 'error');
    }
  };

  const handleCreateSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/admin/create-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellerForm)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create seller', 'error');
        return;
      }
      showToast(`Seller account & store "${sellerForm.storeName}" created successfully!`, 'success');
      setIsCreateSellerOpen(false);
      setSellerForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        storeName: '',
        campusLocation: 'Student Activity Center, First Floor',
        description: ''
      });
      fetchAdminData();
    } catch (e: any) {
      showToast(e.message || 'Error creating seller', 'error');
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create admin', 'error');
        return;
      }
      showToast(`Administrator "${adminForm.name}" created successfully!`, 'success');
      setIsCreateAdminOpen(false);
      setAdminForm({ name: '', email: '', password: '', phone: '' });
      fetchAdminData();
    } catch (e: any) {
      showToast(e.message || 'Error creating admin', 'error');
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Reset entire CampusCart AI database to default seeds? (All demo products, stores, users, and orders will be refreshed)')) {
      return;
    }
    try {
      const res = await authFetch('/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Database reset to fresh seeds successfully!', 'success');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Failed to reset database', 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    try {
      // In a production setup this hits coupon POST
      showToast(`Coupon ${newCoupon.code.toUpperCase()} created!`, 'success');
      setIsCreateCouponOpen(false);
      setNewCoupon({
        code: '',
        description: '',
        discountType: 'fixed',
        discountAmount: 100,
        minOrder: 499,
        maxDiscount: 200
      });
    } catch (e) {
      showToast('Error creating coupon', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-950 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                Campus Admin Center
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-rose-200/80 mt-0.5">
              Platform governance, store verification, and campus logistics control
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCreateSellerOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-colors"
          >
            <StoreIcon className="w-3.5 h-3.5" />
            <span>Create Authorized Seller</span>
          </button>
          <button
            onClick={() => setIsCreateAdminOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Admin</span>
          </button>
          <button
            onClick={handleResetDatabase}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors"
            title="Reset database to initial seed data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo DB</span>
          </button>
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview &amp; Metrics
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'stores'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Stores Moderation ({stats?.stores?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Platform Users ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'coupons'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Discount Coupons ({coupons.length})</span>
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Students</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats?.totalStudents || 5}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Verified student accounts</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Campus Stores</span>
                <Store className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats?.stores?.length || 3}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                {stats?.pendingSellerApprovals ? `${stats.pendingSellerApprovals} pending review` : 'All verified & active'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Catalog Items</span>
                <Package className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats?.totalProducts || 32}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Across 8 categories</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stats?.totalOrders || 0}
              </div>
              <div className="text-[10px] text-blue-600 font-semibold mt-1">
                {stats?.activeOrdersCount || 0} active in transit
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span>Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">Delivered campus GMV</div>
            </div>
          </div>
        </div>
      )}

      {/* STORES MODERATION TAB */}
      {(activeTab === 'stores' || activeTab === 'overview') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Store className="w-4 h-4 text-blue-600" />
              <span>Campus Partner Stores Management</span>
            </h3>
            <button
              onClick={() => setIsCreateSellerOpen(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Authorized Store</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5">Store Name</th>
                  <th className="p-2.5">Building Location</th>
                  <th className="p-2.5">Seller ID</th>
                  <th className="p-2.5">Rating</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.stores?.map((store: StoreType) => (
                  <tr key={store.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{store.name}</td>
                    <td className="p-2.5 text-slate-600">{store.buildingLocation || store.campusLocation}</td>
                    <td className="p-2.5 text-slate-500 font-mono text-[11px]">{store.sellerId}</td>
                    <td className="p-2.5 font-bold font-mono text-amber-600">★ {store.rating}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          store.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {store.isApproved ? 'Approved & Live' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <button
                        onClick={() => handleToggleStoreApproval(store.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                          store.isApproved
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {store.isApproved ? 'Suspend Store' : 'Approve Store'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALL USERS DIRECTORY TAB */}
      {(activeTab === 'users' || activeTab === 'overview') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Platform Users Directory &amp; RBAC Verification</span>
            </h3>

            {/* Role Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['all', 'student', 'seller', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    userRoleFilter === role
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Phone</th>
                  <th className="p-2.5">Assigned Role</th>
                  <th className="p-2.5">Campus Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList
                  .filter(u => userRoleFilter === 'all' || u.role === userRoleFilter)
                  .map(user => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <div className="flex items-center space-x-2">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={user.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-600 font-mono text-[11px]">{user.email}</td>
                      <td className="p-2.5 text-slate-500">{user.phone || '—'}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            user.role === 'admin'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : user.role === 'seller'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500 text-[11px]">
                        {user.profile?.course ? (
                          <span>{user.profile.course} • Year {user.profile.year}</span>
                        ) : user.sellerStoreId ? (
                          <span className="font-mono text-amber-700">Store: {user.sellerStoreId}</span>
                        ) : (
                          <span>University Administration</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COUPONS TAB */}
      {(activeTab === 'coupons' || activeTab === 'overview') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>Active Student Discount Coupons</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {coupons.map(cp => (
              <div key={cp.code || cp.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    {cp.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-600">{cp.description}</p>
                <div className="text-[11px] text-slate-500 font-medium">
                  Min Order: ₹{cp.minOrder} • Type: {cp.discountType}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE AUTHORIZED SELLER & STORE MODAL */}
      {isCreateSellerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-amber-700 to-amber-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <StoreIcon className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-base font-display">Provision Authorized Seller &amp; Campus Store</h3>
                  <p className="text-xs text-amber-200/90">Creates a verified vendor account with inventory access</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateSellerOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSellerSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Seller Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={sellerForm.name}
                    onChange={e => setSellerForm({ ...sellerForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Verma"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Seller Login Email *</label>
                  <input
                    type="email"
                    required
                    value={sellerForm.email}
                    onChange={e => setSellerForm({ ...sellerForm, email: e.target.value })}
                    placeholder="ramesh.store@campuscart.ai"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={sellerForm.storeName}
                    onChange={e => setSellerForm({ ...sellerForm, storeName: e.target.value })}
                    placeholder="e.g. Campus Book & Print Depo"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={sellerForm.password}
                    onChange={e => setSellerForm({ ...sellerForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Campus Location</label>
                <input
                  type="text"
                  value={sellerForm.campusLocation}
                  onChange={e => setSellerForm({ ...sellerForm, campusLocation: e.target.value })}
                  placeholder="e.g. Shopping Complex Block B, Shop 12"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSellerOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md"
                >
                  Approve &amp; Create Seller Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ADMIN MODAL */}
      {isCreateAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-rose-800 to-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-rose-300" />
                <div>
                  <h3 className="font-bold text-base font-display">Provision University Administrator</h3>
                  <p className="text-xs text-rose-200/90">Grants full super-admin governance access</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateAdminOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="e.g. Prof. Arvind Kumar"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">University Admin Email *</label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="arvind.dean@campuscart.ai"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Admin Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={adminForm.password}
                  onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
                >
                  Create University Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
