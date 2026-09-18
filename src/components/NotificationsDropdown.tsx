import React from 'react';
import {
  Bell,
  X,
  Sparkles,
  ShoppingBag,
  AlertTriangle,
  Clock,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const NotificationsDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { notifications, currentUser, trackOrder, refreshUserData } = useApp();

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      refreshUserData();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ai':
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'stock':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/20 backdrop-blur-xs flex justify-end p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 h-[500px] flex flex-col justify-between overflow-hidden mt-16 animate-in slide-in-from-top-2 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Campus Notifications
            </h4>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications right now.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.link && n.link.startsWith('/orders/')) {
                    const orderId = n.link.replace('/orders/', '');
                    trackOrder(orderId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                  n.isRead
                    ? 'bg-white border-slate-100'
                    : 'bg-blue-50/50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="truncate">{n.title}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {n.message}
                    </p>
                    <div className="text-[9px] text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
