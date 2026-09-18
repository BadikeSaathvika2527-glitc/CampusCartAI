import React, { useState } from 'react';
import {
  X,
  MapPin,
  Truck,
  CreditCard,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building,
  QrCode,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Address, Order, PaymentMethod } from '../types.ts';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    closeCheckout,
    currentUser,
    cart,
    cartSummary,
    deliveryOption,
    setDeliveryOption,
    appliedCoupon,
    trackOrder,
    refreshUserData,
    showToast
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Address & Delivery, 2: Payment, 3: Success
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-1');
  const [customHostelRoom, setCustomHostelRoom] = useState(
    currentUser.profile?.hostelRoom || 'Aryabhatta Hostel, Room 314'
  );
  const [phone, setPhone] = useState(currentUser.phone || '+91 91234 56780');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('demo_wallet');
  const [upiId, setUpiId] = useState('student@okcampus');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isCheckoutOpen) return null;

  const currentAddress: Address = {
    id: selectedAddressId,
    label: 'Hostel Room',
    fullName: currentUser.name,
    phone,
    campusName: currentUser.profile?.college || 'NIT Campus',
    addressLine1: customHostelRoom,
    city: 'Bengaluru',
    pincode: '560064',
    isDefault: true
  };

  const hasSufficientWalletBalance = (currentUser.demoWalletBalance || 0) >= cartSummary.finalTotal;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Build order payload matching backend expectations
      const orderPayload = {
        userId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        customerPhone: phone,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl,
          sellerId: item.product.sellerId,
          storeName: item.product.storeName
        })),
        shippingAddress: currentAddress,
        deliveryOption,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'placed',
        subtotal: cartSummary.subtotal,
        discount: cartSummary.discount,
        deliveryFee: cartSummary.deliveryFee,
        total: cartSummary.finalTotal,
        couponCode: appliedCoupon || undefined,
        estimatedDelivery: deliveryOption === 'express' ? 'Today within 30 mins' : 'Tomorrow by 11:00 AM'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place campus order');
      }

      setPlacedOrder(data.order);
      setStep(3);
      await refreshUserData();
      showToast('Order confirmed successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error completing checkout', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Express Campus Checkout
            </span>
            <h3 className="text-lg font-black text-slate-900 font-display">
              {step === 1 && 'Delivery Address & Speed'}
              {step === 2 && 'Payment Method'}
              {step === 3 && 'Order Placed!'}
            </h3>
          </div>

          {step !== 3 && (
            <button
              onClick={closeCheckout}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Address & Options */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Hostel Room Address Form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Hostel / Campus Delivery Location</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-500 font-medium">Campus / University</label>
                    <input
                      type="text"
                      readOnly
                      value={currentUser.profile?.college || 'NIT Campus'}
                      className="w-full mt-1 p-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-medium">Hostel Name &amp; Room Number</label>
                    <input
                      type="text"
                      value={customHostelRoom}
                      onChange={e => setCustomHostelRoom(e.target.value)}
                      placeholder="e.g. Aryabhatta Hostel, 3rd Floor, Room 314"
                      className="w-full mt-1 p-2 bg-white rounded-xl border border-slate-300 text-slate-800 font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-medium">Recipient Phone (For Gate Calling)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full mt-1 p-2 bg-white rounded-xl border border-slate-300 text-slate-800 font-medium outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Speed Selector */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Choose Delivery Speed:</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div
                    onClick={() => setDeliveryOption('standard')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      deliveryOption === 'standard'
                        ? 'border-blue-600 bg-blue-50/60 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">Standard Delivery</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        {cartSummary.subtotal >= 499 ? 'FREE' : '₹49'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Standard delivery by tomorrow morning
                    </div>
                  </div>

                  <div
                    onClick={() => setDeliveryOption('express')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      deliveryOption === 'express'
                        ? 'border-amber-500 bg-amber-50/60 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Express 30-Min</span>
                      </span>
                      <span className="font-mono text-amber-800 font-bold">
                        {cartSummary.subtotal >= 499 ? '₹30' : '₹79'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Direct hostel room gate drop in 30 mins
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="border-t border-slate-100 pt-3">
                <div className="text-xs font-semibold text-slate-500 mb-2">
                  Review Cart Items ({cart.length}):
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {cart.map(i => (
                    <div key={i.productId} className="py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <img src={i.product.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="truncate text-slate-800 font-medium max-w-xs">
                          {i.quantity}x {i.product.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        ₹{(i.product.price * i.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-800">
                Choose Payment Method:
              </div>

              <div className="space-y-2.5">
                {/* Demo Wallet */}
                <div
                  onClick={() => setPaymentMethod('demo_wallet')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    paymentMethod === 'demo_wallet'
                      ? 'border-blue-600 bg-blue-50/60 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Demo Student Wallet
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-700">
                        Balance: ₹{(currentUser.demoWalletBalance || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Instant 1-click test checkout with mock campus stipend funds
                    </div>
                    {!hasSufficientWalletBalance && (
                      <div className="text-[10px] text-rose-600 font-semibold mt-1">
                        Insufficient balance for this order (Needs ₹{cartSummary.finalTotal})
                      </div>
                    )}
                  </div>
                </div>

                {/* UPI */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    paymentMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50/60 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900">
                      Instant UPI (GPay, PhonePe, Paytm, BHIM)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Verified simulation: Auto-approves mock UPI transfer
                    </div>
                    {paymentMethod === 'upi' && (
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="mt-2 w-full p-2 bg-white rounded-xl border border-slate-300 text-xs font-mono outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Card */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/60 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900">
                      Student Debit / Credit Card
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Visa, RuPay, MasterCard accepted
                    </div>
                  </div>
                </div>

                {/* COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50/60 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900">
                      Cash / QR on Hostel Gate Delivery
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Pay the campus courier when handed over at hostel entry
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Cart Items ({cartSummary.itemCount})</span>
                  <span className="font-mono">₹{cartSummary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {cartSummary.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({appliedCoupon})</span>
                    <span className="font-mono">-₹{cartSummary.couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery ({deliveryOption})</span>
                  <span className="font-mono">{cartSummary.deliveryFee === 0 ? 'FREE' : `₹${cartSummary.deliveryFee}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                  <span>Final Payable Amount</span>
                  <span className="font-mono text-blue-600 text-base">
                    ₹{cartSummary.finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Order Placed Success */}
          {step === 3 && placedOrder && (
            <div className="py-8 px-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Order Confirmed
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-display mt-2">
                  Thank You, {currentUser.name}!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your campus order <strong className="text-slate-800">#{placedOrder.orderNumber}</strong> is now being prepared by our verified campus sellers.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left max-w-md mx-auto space-y-2 font-medium">
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Location:</span>
                  <span className="font-bold text-slate-800">{placedOrder.shippingAddress.addressLine1}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Arrival:</span>
                  <span className="font-bold text-emerald-700">{placedOrder.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-bold text-slate-900">₹{placedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => {
                    closeCheckout();
                    trackOrder(placedOrder.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center space-x-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Live Track Order</span>
                </button>

                <button
                  onClick={closeCheckout}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {step !== 3 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2"
              >
                Back to Address
              </button>
            ) : (
              <div className="text-xs text-slate-500 font-medium">
                Step 1 of 2
              </div>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center space-x-1.5 transition-all shadow-md"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || (paymentMethod === 'demo_wallet' && !hasSufficientWalletBalance)}
                onClick={handlePlaceOrder}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Confirming Order...'
                    : `Pay ₹${cartSummary.finalTotal.toLocaleString('en-IN')} & Confirm`}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
