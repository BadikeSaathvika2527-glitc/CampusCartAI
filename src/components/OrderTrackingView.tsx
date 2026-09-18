import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  XCircle,
  Play,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Order, OrderStatus } from '../types.ts';

export const OrderTrackingView: React.FC = () => {
  const { currentUser, trackingOrderId, closeTracking, setActiveTab, showToast } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}`);
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);

        // If trackingOrderId is set, select that order
        if (trackingOrderId) {
          const match = data.find(o => o.id === trackingOrderId || o.orderNumber === trackingOrderId);
          if (match) setSelectedOrder(match);
        } else if (data.length > 0 && !selectedOrder) {
          setSelectedOrder(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser.id, trackingOrderId]);

  const handleSimulateNextStage = async (orderId: string) => {
    setSimulating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/simulate-next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cannot advance status');

      setSelectedOrder(data.order);
      setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
      showToast(`Order updated to: ${data.order.orderStatus.toUpperCase()}`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Error simulating next stage', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this campus order? Restocked inventory will be returned to store shelves.')) {
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Student cancelled from app' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order');

      setSelectedOrder(data.order);
      setOrders(prev => prev.map(o => o.id === data.order.id ? data.order : o));
      showToast('Order cancelled and inventory restored', 'info');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const stages: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: 'Order Placed', desc: 'Received & verified by CampusCart' },
    { key: 'confirmed', label: 'Store Confirmed', desc: 'Sellers accepted order' },
    { key: 'preparing', label: 'Gathering Items', desc: 'Hostel items being picked' },
    { key: 'packed', label: 'Package Sealed', desc: 'Passed to campus dispatch team' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Arriving at hostel gate' },
    { key: 'delivered', label: 'Delivered', desc: 'Handed over to student' }
  ];

  const getStageIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return stages.findIndex(s => s.key === status);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Campus Orders &amp; Live Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time delivery progress to your hostel room &amp; full order history.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          Loading campus orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">No orders yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Place an order from the shop or build a smart kit with AI to start live tracking!
            </p>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Order List Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Your Orders ({orders.length})
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {orders.map(order => {
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900 font-mono">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate">
                      {order.items.length} items • {order.items[0]?.productName}
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs font-medium">
                      <span className="text-slate-400 text-[10px]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono font-black text-slate-900">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Tracker Panel */}
          {selectedOrder && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs lg:col-span-2 space-y-6">
              {/* Top Order Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                      Order #{selectedOrder.orderNumber}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        selectedOrder.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedOrder.orderStatus === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedOrder.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()} • Estimated Arrival: <strong className="text-slate-800">{selectedOrder.estimatedDelivery}</strong>
                  </div>
                </div>

                {/* Simulation button */}
                <div className="flex items-center space-x-2">
                  {selectedOrder.orderStatus !== 'delivered' && selectedOrder.orderStatus !== 'cancelled' && (
                    <button
                      onClick={() => handleSimulateNextStage(selectedOrder.id)}
                      disabled={simulating}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
                      title="Advance order to next status to test real-time tracking"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{simulating ? 'Advancing...' : 'Simulate Next Stage'}</span>
                    </button>
                  )}

                  {['placed', 'confirmed'].includes(selectedOrder.orderStatus) && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl border border-rose-200 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Graphical Timeline */}
              {selectedOrder.orderStatus === 'cancelled' ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-rose-900">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Order Was Cancelled</span>
                  </div>
                  <p>Inventory has been automatically returned to campus store shelves.</p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    Delivery Progression
                  </div>

                  <div className="relative">
                    {/* Horizontal Line on tablet/desktop */}
                    <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0"></div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                      {stages.map((st, idx) => {
                        const currentStageIdx = getStageIndex(selectedOrder.orderStatus);
                        const isCompleted = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={st.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                isCompleted
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>

                            <div className="flex-1 sm:flex-initial">
                              <div className={`text-xs font-bold ${isCurrent ? 'text-blue-600 font-black' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                {st.label}
                              </div>
                              <div className="text-[10px] text-slate-500 hidden sm:block mt-0.5 leading-tight">
                                {st.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Log History */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Tracking Updates History
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 text-xs">
                  {selectedOrder.trackingHistory.map((hist, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2">
                        <Clock className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800 capitalize">
                            {hist.status.replace('_', ' ')}:
                          </span>{' '}
                          <span className="text-slate-600">{hist.message}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Destination & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hostel Drop Location</span>
                  </div>
                  <div className="text-slate-700 font-medium">
                    {selectedOrder.shippingAddress.fullName}
                  </div>
                  <div className="text-slate-600">
                    {selectedOrder.shippingAddress.addressLine1}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Phone: {selectedOrder.shippingAddress.phone}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Payment &amp; Billing</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Method:</span>
                    <span className="font-bold uppercase text-slate-800">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Discount:</span>
                    <span className="font-mono text-emerald-600 font-semibold">-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Total Paid:</span>
                    <span className="font-mono text-blue-600">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Ordered Items List */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Items In This Order ({selectedOrder.items.length})
                </div>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items.map(item => (
                    <div key={item.productId} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                        <div>
                          <div className="font-bold text-slate-900">{item.productName}</div>
                          <div className="text-[10px] text-slate-500">Store: {item.storeName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Qty: {item.quantity} × ₹{item.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
