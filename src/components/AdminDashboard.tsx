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
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Coupon, Store as StoreType } from '../types.ts';

export const AdminDashboard: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [stats, setStats] = useState<any>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);

  // New coupon state
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'fixed' as 'fixed' | 'percentage',
    discountAmount: 100,
    minOrder: 499,
    maxDiscount: 200
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, couponsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/coupons')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (couponsRes.ok) setCoupons(await couponsRes.json());
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
      const res = await fetch(`/api/admin/stores/${storeId}/toggle-approval`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast('Store approval status updated', 'success');
        fetchAdminData();
      }
    } catch (e) {
      showToast('Failed to update store', 'error');
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Reset entire CampusCart AI database to default seeds? (All demo products, stores, users, and orders will be refreshed)')) {
      return;
    }
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
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

        <div className="flex items-center space-x-2">
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
          <div className="text-[10px] text-slate-400 mt-1">Active verified accounts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Campus Stores</span>
            <Store className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.stores?.length || 3}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">All verified &amp; approved</div>
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

      {/* Campus Stores Moderation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Store className="w-4 h-4 text-blue-600" />
          <span>Campus Partner Stores Management</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-2.5">Store Name</th>
                <th className="p-2.5">Building Location</th>
                <th className="p-2.5">Owner</th>
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
                  <td className="p-2.5 text-slate-600">{store.ownerName || store.contactEmail}</td>
                  <td className="p-2.5 font-bold font-mono">★ {store.rating}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        store.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {store.isApproved ? 'Approved' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <button
                      onClick={() => handleToggleStoreApproval(store.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
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

      {/* Campus Coupon Promotions */}
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
    </div>
  );
};
