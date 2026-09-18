import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldAlert,
  Tag,
  Sliders,
  Check,
  Package,
  RotateCcw,
  Sparkle
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import type { AIContextResponse, AIProductRecommendation, Product } from '../types.ts';

export const AiAssistantModal: React.FC = () => {
  const {
    isAiModalOpen,
    closeAiAssistant,
    aiInitialPrompt,
    aiInitialBudget,
    addToCart,
    openCart,
    showToast
  } = useApp();

  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState<number>(3000);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AIContextResponse | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [reasoningStep, setReasoningStep] = useState(0);

  // Set prompt & budget whenever opened
  useEffect(() => {
    if (isAiModalOpen) {
      const initialQ = aiInitialPrompt || 'Joining hostel next week, need essentials & bedding under ₹3,000';
      const initialB = aiInitialBudget || 3000;
      setQuery(initialQ);
      setBudget(initialB);
      setErrorMessage(null);
      runAssistant(initialQ, initialB);
    }
  }, [isAiModalOpen, aiInitialPrompt, aiInitialBudget]);

  const runAssistant = async (searchQuery: string, searchBudget: number) => {
    setLoading(true);
    setErrorMessage(null);
    setReasoningStep(1);

    // Simulate animated reasoning steps
    const stepTimer1 = setTimeout(() => setReasoningStep(2), 600);
    const stepTimer2 = setTimeout(() => setReasoningStep(3), 1200);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, budget: searchBudget })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        let msg = 'Failed to analyze student situation';
        try {
          const errData = await res.json();
          if (errData?.details) msg = errData.details;
          else if (errData?.error) msg = errData.error;
        } catch (_) {}
        throw new Error(msg);
      }

      const data: AIContextResponse = await res.json();
      setResult(data);
      setErrorMessage(null);

      // By default, select all recommended items
      const initialSelected: Record<string, boolean> = {};
      data.recommendations.forEach(r => {
        initialSelected[r.product.id] = true;
      });
      setSelectedItems(initialSelected);
    } catch (e: any) {
      const errorText = e.message || 'Error running AI assistant';
      console.error('AI assistant frontend error:', e);
      setErrorMessage(errorText);
      showToast(errorText, 'error');
    } finally {
      setLoading(false);
      setReasoningStep(0);
    }
  };

  const handleToggleItem = (productId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleSwapAlternative = (originalProductId: string, alternativeProduct: Product) => {
    if (!result) return;
    const updatedRecommendations = result.recommendations.map(r => {
      if (r.product.id === originalProductId) {
        return {
          ...r,
          product: alternativeProduct,
          whyRecommended: `Student budget-friendly alternative chosen for ${alternativeProduct.name}`
        };
      }
      return r;
    });

    setResult({
      ...result,
      recommendations: updatedRecommendations
    });

    setSelectedItems(prev => {
      const next = { ...prev };
      delete next[originalProductId];
      next[alternativeProduct.id] = true;
      return next;
    });

    showToast(`Swapped for ${alternativeProduct.name}`, 'info');
  };

  // Compute live totals based on currently checked items
  const activeRecommendations = result?.recommendations.filter(r => selectedItems[r.product.id]) || [];
  const currentSubtotal = activeRecommendations.reduce((sum, r) => sum + r.product.price * r.quantity, 0);
  const currentOriginalTotal = activeRecommendations.reduce((sum, r) => sum + r.product.originalPrice * r.quantity, 0);
  const currentDiscount = currentOriginalTotal - currentSubtotal;
  const currentDeliveryFee = currentSubtotal >= 499 || currentSubtotal === 0 ? 0 : 49;
  const currentFinalTotal = currentSubtotal + currentDeliveryFee;
  const isCurrentlyWithinBudget = currentFinalTotal <= (budget || 3000);

  const handleAddAllToCart = async () => {
    if (activeRecommendations.length === 0) {
      showToast('Please select at least one item to add to your cart', 'info');
      return;
    }

    setLoading(true);
    let addedCount = 0;
    for (const rec of activeRecommendations) {
      try {
        await addToCart(rec.product.id, rec.quantity);
        addedCount++;
      } catch (e) {
        console.error('Failed to add item:', rec.product.name, e);
      }
    }

    setLoading(false);
    closeAiAssistant();
    openCart();
    showToast(`Successfully added ${addedCount} items from your AI Smart Kit!`, 'success');
  };

  if (!isAiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            id="ai-modal-close-btn"
            onClick={closeAiAssistant}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
              AI Student Shopping Assistant
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Gemini 3.8 Flash
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Understands your college situation, academic courses, hostel rules, and student budget to auto-generate a verified, practical cart bundle.
          </p>

          {/* Quick interactive tweak bar */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex-1 flex items-center bg-black/40 rounded-xl border border-white/10 px-3 py-1.5">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !loading) {
                    runAssistant(query, budget);
                  }
                }}
                placeholder="What do you need for college? (e.g. End-sem exams, CSE lab, Hostel)"
                className="w-full bg-transparent text-white text-xs sm:text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 shrink-0">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                <span>Budget: ₹{budget}</span>
              </div>

              <button
                onClick={() => runAssistant(query, budget)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 flex items-center space-x-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Re-Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Reasoning animation if loading */}
          {loading && (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Sparkles className="w-7 h-7 animate-pulse text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  CampusCart AI is thinking...
                </h3>
                <div className="mt-2 space-y-1 text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  <div className={`transition-all ${reasoningStep >= 1 ? 'text-blue-600 font-semibold' : ''}`}>
                    ✓ 1. Parsing student context &amp; academic needs
                  </div>
                  <div className={`transition-all ${reasoningStep >= 2 ? 'text-blue-600 font-semibold' : ''}`}>
                    ✓ 2. Querying verified campus catalog &amp; live stock
                  </div>
                  <div className={`transition-all ${reasoningStep >= 3 ? 'text-blue-600 font-semibold' : ''}`}>
                    ✓ 3. Optimizing bundle prices and budget constraints
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error / Empty state fallback */}
          {!loading && !result && (
            <div className="py-10 px-4 text-center max-w-lg mx-auto space-y-5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertCircle className="w-7 h-7 text-amber-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {errorMessage ? 'Analysis Needs Attention' : 'Ready to Analyze Your Needs'}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {errorMessage
                    ? `${errorMessage}. Click Retry to re-run the assistant or pick one of the verified student packs below.`
                    : 'Enter your course, semester, or hostel requirements to generate a complete student bundle.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => runAssistant(query || 'Joining hostel next week, need essentials & bedding under ₹3,000', budget || 3000)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Analysis</span>
                </button>

                <button
                  onClick={() => {
                    const hostelQuery = 'Joining hostel next week, need room essentials & bedding under ₹3,000';
                    setQuery(hostelQuery);
                    setBudget(3000);
                    runAssistant(hostelQuery, 3000);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-all border border-slate-200 flex items-center space-x-2"
                >
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  <span>Load Verified Hostel Kit</span>
                </button>
              </div>

              {/* Quick Prompt Starters */}
              <div className="pt-4 border-t border-slate-100 text-left">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Popular College Situations:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Hostel Room & Bedding', prompt: 'Joining hostel next week, need room essentials & bedding under ₹3,000', b: 3000 },
                    { label: 'CSE Lab & Electronics', prompt: 'CSE 2nd year student, need lab tools, breadboard & mouse under ₹2,500', b: 2500 },
                    { label: 'End-Sem Exam Revision', prompt: 'End semester exams approaching, need notebooks, highlighter & study gear under ₹1,000', b: 1000 },
                    { label: 'College Road Trip', prompt: 'Going on college weekend trip, need travel bottle, umbrella & bag under ₹1,500', b: 1500 }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(item.prompt);
                        setBudget(item.b);
                        runAssistant(item.prompt, item.b);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 flex items-center justify-between">
                        <span>{item.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Target Budget: ₹{item.b}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && result && (
            <>
              {/* Context Summary Banner */}
              <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-md">
                      {result.contextTitle}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Target Budget: ₹{result.detectedBudget}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {result.contextDescription}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isCurrentlyWithinBudget
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {isCurrentlyWithinBudget ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Within ₹{budget} Budget
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        ₹{currentFinalTotal - budget} Over Budget
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Budget Explanation & Actionable adjustments */}
              {result.suggestedAdjustments && result.suggestedAdjustments.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>AI Budget Optimizer Recommendation:</span>
                  </div>
                  <p className="text-amber-800">{result.budgetMessage}</p>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-900 pl-1 font-medium">
                    {result.suggestedAdjustments.map((adj, i) => (
                      <li key={i}>{adj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Items List with checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Curated Kit Products ({activeRecommendations.length} Selected)</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Uncheck items to customize bundle
                  </span>
                </div>

                <div className="space-y-3">
                  {result.recommendations.map((rec) => {
                    const isSelected = !!selectedItems[rec.product.id];
                    const itemTotal = rec.product.price * rec.quantity;

                    return (
                      <div
                        key={rec.product.id}
                        className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-white border-blue-300 shadow-xs'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleItem(rec.product.id)}
                            className={`mt-1 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white hover:border-blue-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </button>

                          {/* Image */}
                          <img
                            src={rec.product.imageUrl}
                            alt={rec.product.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-100 shrink-0"
                          />

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center space-x-1.5 flex-wrap gap-1 mb-0.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    {rec.product.brand}
                                  </span>
                                  {rec.isCore ? (
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">
                                      Core Essential
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                      Optional Add-on
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    • {rec.product.storeName}
                                  </span>
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                                  {rec.product.name}
                                </h4>
                              </div>

                              {/* Price */}
                              <div className="text-right shrink-0">
                                <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                                  ₹{itemTotal.toLocaleString('en-IN')}
                                </div>
                                {rec.product.originalPrice > rec.product.price && (
                                  <div className="text-[11px] text-slate-400 line-through font-mono">
                                    ₹{(rec.product.originalPrice * rec.quantity).toLocaleString('en-IN')}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Why Recommended by AI */}
                            <div className="mt-1 text-xs text-blue-700 bg-blue-50/70 px-2 py-1 rounded-md inline-block font-medium">
                              💡 {rec.whyRecommended}
                            </div>

                            {/* Live Stock & Alternatives */}
                            <div className="mt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[11px] font-semibold ${
                                  rec.product.stock <= 5 ? 'text-rose-600 font-bold' : 'text-emerald-700'
                                }`}>
                                  ● {rec.product.stock <= 5 ? `Only ${rec.product.stock} units left in store` : `In Stock (${rec.product.stock} units)`}
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-500 text-[11px]">
                                  Qty: {rec.quantity}
                                </span>
                              </div>

                              {/* Swappable Alternative Options */}
                              {rec.alternativeOptions && rec.alternativeOptions.length > 0 && (
                                <div className="flex items-center space-x-1 text-[11px]">
                                  <span className="text-slate-400">Budget alternative:</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSwapAlternative(rec.product.id, rec.alternativeOptions![0])}
                                    className="text-blue-600 hover:text-blue-800 font-semibold underline"
                                  >
                                    Switch to {rec.alternativeOptions[0].name.slice(0, 24)}... (₹{rec.alternativeOptions[0].price})
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer: Live Cart Calculation & Add to Cart CTA */}
        {result && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Financial Breakdown */}
              <div className="flex items-center space-x-6 text-xs text-slate-600 font-medium">
                <div>
                  <div className="text-[11px] text-slate-400">Original Total:</div>
                  <div className="line-through font-mono text-slate-500">
                    ₹{currentOriginalTotal.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-emerald-600 font-semibold">Student Discount:</div>
                  <div className="font-bold text-emerald-700 font-mono">
                    -₹{currentDiscount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">Campus Delivery:</div>
                  <div className="font-semibold text-slate-700">
                    {currentDeliveryFee === 0 ? 'FREE' : `₹${currentDeliveryFee}`}
                  </div>
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    Bundle Total:
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    ₹{currentFinalTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Add All to Cart Button */}
              <button
                id="ai-add-all-btn"
                onClick={handleAddAllToCart}
                disabled={loading || activeRecommendations.length === 0}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-yellow-300" />
                <span>
                  Add {activeRecommendations.length} Items to Campus Cart • ₹{currentFinalTotal.toLocaleString('en-IN')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
