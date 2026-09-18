import React, { useState } from 'react';
import {
  Package,
  Sparkles,
  ArrowRight,
  Check,
  Bed,
  BookOpen,
  Code2,
  Cpu,
  Compass,
  FileSpreadsheet,
  ShoppingBag,
  Info,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StudentKit } from '../types.ts';

export const StudentKitsSection: React.FC = () => {
  const { studentKits, addKitToCart, openAiAssistant } = useApp();
  const [inspectKit, setInspectKit] = useState<StudentKit | null>(null);

  const getKitIcon = (slug: string) => {
    switch (slug) {
      case 'hostel-starter-kit':
        return Bed;
      case 'exam-essentials-kit':
        return BookOpen;
      case 'coding-cse-launch-kit':
        return Code2;
      case 'iot-hardware-project-kit':
        return Cpu;
      case 'college-presentation-kit':
        return FileSpreadsheet;
      case 'college-trip-pack':
        return Compass;
      default:
        return Package;
    }
  };

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Curated Campus Bundles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Ready-to-Go Student Kits
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Pre-assembled packs engineered by senior students. Packed together, discounted for campus budgets, and delivered directly to your hostel.
          </p>
        </div>

        <button
          onClick={() => openAiAssistant()}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Generate Custom Kit with AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {studentKits.map(kit => {
          const Icon = getKitIcon(kit.slug);
          const origPrice = kit.originalPrice || kit.estimatedPrice || (kit.discountedPrice + 500);
          const savings = origPrice - kit.discountedPrice;
          const discountPercent = Math.round((savings / origPrice) * 100);
          const defaultBanner = kit.bannerImage || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&auto=format&fit=crop&q=80';
          const situationLabel = (kit.targetSituation || kit.context || 'Student Essential').replace(/_/g, ' ');

          return (
            <div
              key={kit.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-blue-300"
            >
              {/* Top Banner with Image & Badges */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={defaultBanner}
                  alt={kit.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                  <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center space-x-1">
                    <Icon className="w-3 h-3" />
                    <span>{situationLabel}</span>
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    SAVE {discountPercent}%
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base font-extrabold font-display leading-tight drop-shadow-xs">
                    {kit.title}
                  </h3>
                  <div className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">
                    {kit.description}
                  </div>
                </div>
              </div>

              {/* Kit Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">
                      {kit.itemIds.length} Curated Items Included:
                    </span>
                    <button
                      onClick={() => setInspectKit(kit)}
                      className="text-blue-600 hover:text-blue-800 font-semibold underline text-[11px]"
                    >
                      View Items
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {(kit.highlights || ['Verified campus quality', 'Hostel room delivery ready', 'Discounted bundle price']).map((h: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-lg font-black text-slate-900 font-mono">
                      ₹{kit.discountedPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
                      <span className="line-through">₹{origPrice.toLocaleString('en-IN')}</span>
                      <span className="text-emerald-600 font-bold font-sans">
                        Save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => addKitToCart(kit.id)}
                    className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 active:scale-95 shrink-0"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                    <span>Add Kit to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Kit Modal */}
      {inspectKit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setInspectKit(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                Bundle Items Breakdown
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-1 font-display">
              {inspectKit.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {inspectKit.description}
            </p>

            <div className="space-y-2 mb-6">
              {inspectKit.itemIds.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">
                      Product ID: {item.productId}
                    </span>
                  </div>
                  <span className="text-slate-500 font-medium font-mono">
                    Qty: {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <div className="text-xs text-slate-400">Total Bundle Price</div>
                <div className="text-xl font-black text-slate-900 font-mono">
                  ₹{inspectKit.discountedPrice}
                </div>
              </div>

              <button
                onClick={() => {
                  addKitToCart(inspectKit.id);
                  setInspectKit(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-colors flex items-center space-x-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Complete Bundle to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
