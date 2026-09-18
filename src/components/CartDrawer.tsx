import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Tag,
  ArrowRight,
  Zap,
  Truck,
  Check,
  Percent,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    cart,
    cartSummary,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    deliveryOption,
    setDeliveryOption,
    openCheckout,
    openAiAssistant
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const quickCoupons = [
    { code: 'STUDENT50', desc: 'Flat ₹50 OFF (Min ₹299)' },
    { code: 'WELCOME100', desc: 'Flat ₹100 OFF (Min ₹699)' },
    { code: 'HOSTEL200', desc: 'Flat ₹200 OFF (Min ₹1499)' },
    { code: 'CAMPUS10', desc: '10% OFF up to ₹150' }
  ];

  const handleApplyCoupon = async (codeToApply: string) => {
    setCouponLoading(true);
    await applyCoupon(codeToApply);
    setCouponLoading(false);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base text-slate-900 font-display">
              My Campus Cart
            </h3>
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {cartSummary.itemCount} items
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-500 mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Your cart is empty
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Ask CampusCart AI to auto-generate a smart kit or browse verified products from campus stores.
                </p>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  openAiAssistant();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md inline-flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Build Kit with AI</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => {
                const isMaxStock = item.product.stock <= item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {item.product.brand}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                            {item.product.name}
                          </h4>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Store & Stock info */}
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {item.product.storeName}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div className="font-extrabold text-sm text-slate-900 font-mono">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </div>

                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isMaxStock}
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {isMaxStock && (
                        <div className="text-[10px] text-amber-600 font-semibold mt-1">
                          Max store inventory reached ({item.product.stock} available)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery Option Selector */}
          {cart.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Select Campus Delivery Speed:</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeliveryOption('standard')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    deliveryOption === 'standard'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Standard Campus</span>
                    <span>{cartSummary.subtotal >= 499 ? 'FREE' : '₹49'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Today evening / Next morning
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryOption('express')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    deliveryOption === 'express'
                      ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span>Express Hostel</span>
                    </span>
                    <span>{cartSummary.subtotal >= 499 ? '₹30' : '₹79'}</span>
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5">
                    Hostel gate drop in 30 mins
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Coupon Section */}
          {cart.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Student Coupon Code:</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon}</strong> Applied!</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-rose-600 hover:text-rose-800 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code (e.g. STUDENT50)"
                      className="flex-1 px-3 py-1.5 text-xs uppercase bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono font-bold"
                    />
                    <button
                      type="button"
                      disabled={!couponInput.trim() || couponLoading}
                      onClick={() => handleApplyCoupon(couponInput.trim())}
                      className="bg-slate-900 text-white font-bold text-xs px-4 py-1.5 rounded-xl disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Available Quick Codes */}
                  <div className="flex flex-wrap gap-1.5">
                    {quickCoupons.map(qc => (
                      <button
                        key={qc.code}
                        type="button"
                        onClick={() => handleApplyCoupon(qc.code)}
                        className="text-[10px] font-bold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors"
                      >
                        {qc.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: Totals & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono">₹{cartSummary.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {cartSummary.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Student Savings</span>
                  <span className="font-mono">-₹{cartSummary.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {cartSummary.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({cartSummary.appliedCouponCode || appliedCoupon})</span>
                  <span className="font-mono">-₹{cartSummary.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Campus Delivery</span>
                <span className="font-mono">
                  {cartSummary.deliveryFee === 0 ? 'FREE' : `₹${cartSummary.deliveryFee}`}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-900 text-base">
                <span>To Pay</span>
                <span className="font-mono text-xl text-blue-600">
                  ₹{cartSummary.finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={openCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
