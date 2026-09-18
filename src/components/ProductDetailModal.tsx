import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Store,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Tag,
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types.ts';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    closeProductModal,
    addToCart,
    openCheckout,
    toggleWishlist,
    isInWishlist,
    currentUser,
    showToast
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [localProduct, setLocalProduct] = useState<Product | null>(selectedProduct);

  React.useEffect(() => {
    setLocalProduct(selectedProduct);
    setQuantity(1);
    setReviewComment('');
  }, [selectedProduct]);

  if (!localProduct) return null;

  const inWishlist = isInWishlist(localProduct.id);
  const isOutOfStock = localProduct.stock <= 0;

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please write a brief comment about this product', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${localProduct.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (!res.ok) throw new Error('Failed to submit review');
      const updatedProduct = await res.json();
      setLocalProduct(updatedProduct);
      setReviewComment('');
      showToast('Student review submitted successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBuyNow = async () => {
    await addToCart(localProduct.id, quantity);
    closeProductModal();
    openCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Image Box */}
            <div className="relative bg-slate-100 rounded-2xl overflow-hidden pt-[85%] sm:pt-[100%] border border-slate-200">
              <img
                src={localProduct.imageUrl}
                alt={localProduct.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {localProduct.discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-black px-2 py-0.5 rounded-md shadow-xs">
                  {localProduct.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Product Meta & Actions */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                  <span className="font-bold uppercase tracking-wider text-blue-600">
                    {localProduct.brand}
                  </span>
                  <span>•</span>
                  <span className="text-slate-600">{localProduct.categoryName}</span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                  {localProduct.name}
                </h2>

                {/* Rating & Store */}
                <div className="flex items-center space-x-3 mt-2 text-xs">
                  <div className="flex items-center bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    <span>{localProduct.rating}</span>
                    <span className="text-slate-400 ml-1">({localProduct.reviewCount} reviews)</span>
                  </div>

                  <div className="flex items-center space-x-1 text-slate-600">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sold by <strong className="text-slate-800">{localProduct.storeName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Price Block */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    ₹{localProduct.price.toLocaleString('en-IN')}
                  </div>
                  {localProduct.originalPrice > localProduct.price && (
                    <div className="text-xs text-slate-400 line-through font-mono">
                      MRP: ₹{localProduct.originalPrice.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      localProduct.stock > 10
                        ? 'bg-emerald-100 text-emerald-800'
                        : localProduct.stock > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {localProduct.stock > 10
                      ? 'In Stock'
                      : localProduct.stock > 0
                      ? `Only ${localProduct.stock} Left!`
                      : 'Out of Stock'}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Express 30-min campus delivery
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(localProduct.stock, quantity + 1))}
                      className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => addToCart(localProduct.id, quantity)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span>Buy Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(localProduct.id)}
                  className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-rose-600 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Delivery info */}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Delivered to student hostel rooms &amp; campus gates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Campus seller warranty &amp; 3-day easy replacement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Description vs Reviews */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center space-x-4 border-b border-slate-200 pb-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Product Details &amp; Specs
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Student Reviews ({localProduct.reviews?.length || 0})
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="pt-4 space-y-4 text-xs text-slate-600">
                <p className="leading-relaxed">{localProduct.description}</p>

                {/* Tags */}
                <div>
                  <div className="font-semibold text-slate-700 mb-1.5">Student Badges &amp; Tags:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {localProduct.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                    {localProduct.isHostelEssential && (
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        Hostel Essential
                      </span>
                    )}
                    {localProduct.isCseEssential && (
                      <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        CSE Lab Approved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 space-y-5">
                {/* Write review */}
                <form onSubmit={handleAddReview} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-800">
                    Write a Review (As {currentUser.name})
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-600">Rating:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Share how this product held up in hostel, lab, or exam study..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-white"
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? 'Posting...' : 'Submit Review'}
                  </button>
                </form>

                {/* Review list */}
                <div className="space-y-3">
                  {localProduct.reviews && localProduct.reviews.length > 0 ? (
                    localProduct.reviews.map(rev => (
                      <div key={rev.id} className="p-3 bg-white rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                            <span>{rev.userName}</span>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-semibold">
                              Verified Student
                            </span>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600">{rev.comment}</p>
                        <div className="text-[10px] text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic text-center py-4">
                      No student reviews yet. Be the first to review!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
