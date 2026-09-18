import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  GraduationCap,
  MapPin,
  Wallet,
  Heart,
  ShoppingBag,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types.ts';

export const StudentProfileView: React.FC = () => {
  const {
    currentUser,
    wishlist,
    toggleWishlist,
    addToCart,
    openProductModal,
    refreshUserData,
    showToast
  } = useApp();

  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Edit profile state
  const [course, setCourse] = useState(currentUser.profile?.course || 'Computer Science & Engineering');
  const [year, setYear] = useState(currentUser.profile?.year || 2);
  const [hostelRoom, setHostelRoom] = useState(currentUser.profile?.hostelRoom || 'Aryabhatta Hostel, Room 314');
  const [college, setCollege] = useState(currentUser.profile?.college || 'NIT Campus');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await fetch(`/api/recommendations?userId=${currentUser.id}`);
        if (res.ok) setRecommendations(await res.json());
      } catch (e) {
        console.error('Failed to load student recommendations:', e);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [currentUser.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          profile: {
            college,
            course,
            year: Number(year),
            semester: Number(year) * 2 - 1,
            hostelStatus: 'hostel',
            hostelRoom
          }
        })
      });
      if (res.ok) {
        showToast('Academic profile updated successfully!', 'success');
        refreshUserData();
      }
    } catch (e) {
      showToast('Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTopUpWallet = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          profile: currentUser.profile
        })
      });
      // Direct demo balance injection
      currentUser.demoWalletBalance = (currentUser.demoWalletBalance || 0) + 1000;
      refreshUserData();
      showToast('Added ₹1,000 demo stipend funds to your student wallet!', 'success');
    } catch (e) {
      showToast('Failed to add funds', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Card & Wallet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Info */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start gap-5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/20 shadow-md shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-display">
                {currentUser.name}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {currentUser.role}
              </span>
            </div>

            <div className="text-xs text-slate-500 mt-0.5">
              {currentUser.email} • {currentUser.phone}
            </div>

            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                {currentUser.profile?.course || 'General Student'} • Year {currentUser.profile?.year || 1}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                <Building className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                {currentUser.profile?.college || 'NIT Campus'}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
                {currentUser.profile?.hostelRoom || 'Hostel Room'}
              </span>
            </div>
          </div>
        </div>

        {/* Demo Wallet Card */}
        <div className="bg-gradient-to-tr from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-blue-300 mb-2">
              <span className="font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                <Wallet className="w-4 h-4 text-yellow-400" />
                <span>Student Demo Wallet</span>
              </span>
              <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                Instant Mock Pay
              </span>
            </div>
            <div className="text-3xl font-black font-mono mt-1">
              ₹{(currentUser.demoWalletBalance || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Available balance for 1-click test checkouts
            </div>
          </div>

          <button
            onClick={handleTopUpWallet}
            className="mt-4 bg-white hover:bg-blue-50 text-slate-900 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Top-up +₹1,000 Demo Funds</span>
          </button>
        </div>
      </div>

      {/* Profile Settings Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center space-x-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span>Academic &amp; Hostel Delivery Preferences</span>
        </h3>

        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700">University / College</label>
            <input
              type="text"
              value={college}
              onChange={e => setCollege(e.target.value)}
              className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Major / Academic Branch</label>
            <input
              type="text"
              value={course}
              onChange={e => setCourse(e.target.value)}
              className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Academic Year</label>
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none bg-white"
            >
              <option value={1}>1st Year (Fresher)</option>
              <option value={2}>2nd Year (Sophomore)</option>
              <option value={3}>3rd Year (Junior)</option>
              <option value={4}>4th Year (Senior / Final)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700">Hostel &amp; Room Details</label>
            <input
              type="text"
              value={hostelRoom}
              onChange={e => setHostelRoom(e.target.value)}
              className="w-full mt-1 p-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              {isSaving ? 'Saving...' : 'Update Academic Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Wishlist Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-extrabold text-slate-900 font-display">
              Saved Wishlist Items ({wishlist.length})
            </h3>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No items in your wishlist yet. Tap the heart icon on any product to save it here.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map(prod => (
              <div
                key={prod.id}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between group"
              >
                <div className="relative pt-[80%] bg-slate-100 rounded-xl overflow-hidden mb-2">
                  <img src={prod.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    onClick={() => toggleWishlist(prod.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-500 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                  {prod.name}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-mono font-bold text-slate-900">₹{prod.price}</span>
                  <button
                    onClick={() => addToCart(prod.id, 1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course-Specific Recommendations */}
      <div className="bg-gradient-to-r from-blue-50/50 via-sky-50/50 to-slate-50 p-6 rounded-3xl border border-blue-100 space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Recommended for your Major ({currentUser.profile?.course || 'Campus Student'})
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recommendations.slice(0, 4).map(prod => (
            <div
              key={prod.id}
              onClick={() => openProductModal(prod)}
              className="bg-white p-3 rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-xs cursor-pointer transition-all"
            >
              <img src={prod.imageUrl} alt="" className="w-full h-28 rounded-xl object-cover mb-2" />
              <div className="text-xs font-bold text-slate-900 line-clamp-1">{prod.name}</div>
              <div className="font-mono font-bold text-blue-600 text-xs mt-1">₹{prod.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
