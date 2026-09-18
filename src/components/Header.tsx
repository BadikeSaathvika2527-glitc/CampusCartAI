import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Bell,
  Search,
  MapPin,
  GraduationCap,
  Store,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Clock,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const Header: React.FC<{
  onOpenNotifications: () => void;
  unreadCount: number;
}> = ({ onOpenNotifications, unreadCount }) => {
  const {
    currentUser,
    allUsers,
    switchUser,
    activeTab,
    setActiveTab,
    cartSummary,
    openCart,
    wishlist,
    openAiAssistant,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isCampusSelectorOpen, setIsCampusSelectorOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(
    currentUser.profile?.college || 'NIT Campus • Aryabhatta Hostel'
  );

  const campuses = [
    'NIT Campus • Aryabhatta Hostel (Boys)',
    'NIT Campus • Gargi Hostel (Girls)',
    'DTU Main Campus • Kalpana Chawla Hostel',
    'BITS Pilani Campus • Krishna Bhawan',
    'IIT Campus • Brahmaputra Hostel',
    'Day Scholar • Outer Ring Road Gate 2'
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'shop') {
      setActiveTab('shop');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top Banner: Campus Live Delivery announcement */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              CAMPUS EXPRESS DISPATCH
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-300">
              Hostel room gate drop in under 30 mins | Free on orders &gt; ₹499
            </span>
          </div>

          {/* Quick Demo Switcher Prompt */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 hidden md:inline">Logged in as:</span>
            <div className="relative">
              <button
                id="role-switch-btn"
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors border border-slate-700"
              >
                {currentUser.role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-blue-400" />}
                {currentUser.role === 'seller' && <Store className="w-3.5 h-3.5 text-amber-400" />}
                {currentUser.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />}
                <span className="max-w-[120px] truncate">{currentUser.name}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1 rounded bg-slate-700 text-slate-300">
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Switcher Dropdown */}
              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-900 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    Switch Test Persona
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                    {allUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-slate-50 transition-colors ${
                          u.id === currentUser.id ? 'bg-blue-50/60 font-semibold' : ''
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-900 truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-500 capitalize flex items-center space-x-1">
                            <span>{u.role}</span>
                            {u.profile?.course && <span>• {u.profile.course}</span>}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            u.role === 'student'
                              ? 'bg-blue-100 text-blue-700'
                              : u.role === 'seller'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo and Campus Pin */}
          <div className="flex items-center space-x-3 sm:space-x-6 shrink-0">
            <button
              onClick={() => {
                setActiveTab('shop');
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="flex items-center space-x-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-display">
                    CampusCart
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.5 rounded-md">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  Smart Student Commerce
                </span>
              </div>
            </button>

            {/* Campus Location Picker */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setIsCampusSelectorOpen(!isCampusSelectorOpen)}
                className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="max-w-[170px] truncate font-medium">{selectedCampus}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCampusSelectorOpen && (
                <div className="absolute left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="font-semibold text-slate-700 px-2 py-1 mb-1 border-b border-slate-100">
                    Select Your Campus & Hostel
                  </div>
                  {campuses.map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCampus(c);
                        setIsCampusSelectorOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                        selectedCampus === c ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar with Instant Querying */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl relative hidden md:block"
          >
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'shop') setActiveTab('shop');
                }}
                placeholder="Search notebooks, Arduino, study lamps, locks, hostels..."
                className="w-full pl-10 pr-24 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-16 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Hub */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Ask AI Shopping Assistant Button */}
            <button
              id="header-ask-ai-btn"
              onClick={() => openAiAssistant()}
              className="relative group flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow text-yellow-300" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
              <span className="hidden lg:inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                Smart Kit
              </span>
            </button>

            {/* Navigation Tabs for role or student view */}
            <div className="hidden xl:flex items-center space-x-1 text-xs font-medium text-slate-600 border-l border-r border-slate-200 px-3">
              <button
                onClick={() => {
                  setActiveTab('shop');
                  setSelectedCategory(null);
                }}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'shop' ? 'bg-slate-100 text-blue-600 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                Catalog
              </button>
              <button
                onClick={() => setActiveTab('kits')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'kits' ? 'bg-slate-100 text-blue-600 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                Kits & Bundles
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'orders' ? 'bg-slate-100 text-blue-600 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                Orders
              </button>

              {currentUser.role === 'seller' && (
                <button
                  onClick={() => setActiveTab('seller')}
                  className={`px-2.5 py-1.5 rounded-lg text-amber-700 transition-colors ${
                    activeTab === 'seller' ? 'bg-amber-100 font-bold' : 'hover:bg-amber-50'
                  }`}
                >
                  Seller Hub
                </button>
              )}

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-2.5 py-1.5 rounded-lg text-rose-700 transition-colors ${
                    activeTab === 'admin' ? 'bg-rose-100 font-bold' : 'hover:bg-rose-50'
                  }`}
                >
                  Admin Center
                </button>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              id="header-wishlist-btn"
              onClick={() => setActiveTab('profile')}
              title="Wishlist"
              className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Notifications Button */}
            <button
              id="header-notif-btn"
              onClick={onOpenNotifications}
              title="Campus Notifications"
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={openCart}
              className="relative flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline font-mono font-bold">
                ₹{cartSummary.finalTotal.toLocaleString('en-IN')}
              </span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                {cartSummary.itemCount}
              </span>
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={() => setActiveTab('profile')}
              title="Student Profile & Wallet"
              className="flex items-center space-x-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
              />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'shop') setActiveTab('shop');
              }}
              placeholder="Search hostel items, notes, lab gear..."
              className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>
    </header>
  );
};
