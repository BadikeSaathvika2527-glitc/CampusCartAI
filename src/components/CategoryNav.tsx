import React from 'react';
import {
  Bed,
  BookOpen,
  Laptop,
  Cpu,
  Compass,
  HeartPulse,
  Grid,
  Sparkles,
  Shirt,
  Utensils
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const CategoryNav: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, activeTab, setActiveTab } = useApp();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bed':
        return Bed;
      case 'BookOpen':
        return BookOpen;
      case 'Laptop':
        return Laptop;
      case 'Cpu':
        return Cpu;
      case 'Compass':
        return Compass;
      case 'HeartPulse':
        return HeartPulse;
      case 'Shirt':
        return Shirt;
      case 'Utensils':
        return Utensils;
      default:
        return Grid;
    }
  };

  const handleSelect = (catId: string | null) => {
    setSelectedCategory(catId);
    if (activeTab !== 'shop') {
      setActiveTab('shop');
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Grid className="w-4 h-4 text-blue-600" />
          <span>Shop by Campus Category</span>
        </h3>
        {selectedCategory && (
          <button
            onClick={() => handleSelect(null)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            Clear Category Filter
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* All Products button */}
        <button
          onClick={() => handleSelect(null)}
          className={`shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
            selectedCategory === null
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>All Campus Gear</span>
        </button>

        {/* Categories */}
        {categories.map(cat => {
          const Icon = getCategoryIcon(cat.iconName || (cat as any).icon);
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
