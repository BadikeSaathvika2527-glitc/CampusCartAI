import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { HeroAiSection } from './components/HeroAiSection.tsx';
import { CategoryNav } from './components/CategoryNav.tsx';
import { StudentKitsSection } from './components/StudentKitsSection.tsx';
import { ProductCatalog } from './components/ProductCatalog.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { AiAssistantModal } from './components/AiAssistantModal.tsx';
import { OrderTrackingView } from './components/OrderTrackingView.tsx';
import { SellerDashboard } from './components/SellerDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { StudentProfileView } from './components/StudentProfileView.tsx';
import { NotificationsDropdown } from './components/NotificationsDropdown.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { GraduationCap, ShieldCheck, Heart, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, unreadNotificationsCount } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* App Header */}
      <Header
        onOpenNotifications={() => setIsNotifOpen(true)}
        unreadCount={unreadNotificationsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'shop' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* AI Hero Banner */}
            <HeroAiSection />

            {/* Campus Categories */}
            <CategoryNav />

            {/* Pre-assembled Student Kits */}
            <StudentKitsSection />

            {/* Full Database Product Catalog */}
            <section className="pt-4">
              <ProductCatalog />
            </section>
          </div>
        )}

        {activeTab === 'kits' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <StudentKitsSection />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-in fade-in duration-150">
            <OrderTrackingView />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-in fade-in duration-150">
            <StudentProfileView />
          </div>
        )}

        {activeTab === 'seller' && (
          <div className="animate-in fade-in duration-150">
            <SellerDashboard />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-150">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Campus Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-base text-white font-display">
                  CampusCart AI
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                One Student. Every Need. One Smart Campus Cart. Powered by Gemini AI to deliver verified campus essentials in 30 minutes.
              </p>
            </div>

            {/* Popular Student Kits */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                Student Kits
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>Hostel Starter Kit</li>
                <li>Semester Exam Essentials</li>
                <li>CSE Lab &amp; Coding Launch</li>
                <li>Hardware &amp; IoT Project Pack</li>
                <li>Campus 3-Day Travel Kit</li>
              </ul>
            </div>

            {/* Campus Logistics */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                Campus Logistics
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>Hostel Room Gate Drops</li>
                <li>Campus Shopping Complex Hub</li>
                <li>Academic Department Delivery</li>
                <li>Verified Partner Stores</li>
                <li>Student Return &amp; Exchange</li>
              </ul>
            </div>

            {/* Student Support */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                Help &amp; Emergency
              </h4>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Campus Helpline: 1800-CAMPUS-CART</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>support@campuscart.ai</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Student Activity Center, Gate 2</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              © 2026 CampusCart AI — Intelligent Student E-Commerce Platform. Built for University Students.
            </div>
            <div className="flex items-center space-x-4">
              <span>Hostel Delivery SLA: 30 Mins</span>
              <span>•</span>
              <span>Student Discount Guarantee</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <AiAssistantModal />
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <NotificationsDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
