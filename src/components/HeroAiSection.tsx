import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  Bed,
  BookOpen,
  Code2,
  Cpu,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const HeroAiSection: React.FC = () => {
  const { openAiAssistant } = useApp();
  const [prompt, setPrompt] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<number | undefined>(3000);

  const budgetPills = [
    { label: 'Under ₹500', value: 500 },
    { label: 'Under ₹1,500', value: 1500 },
    { label: 'Under ₹3,000', value: 3000 },
    { label: 'Under ₹5,000', value: 5000 },
    { label: 'Any Budget', value: undefined }
  ];

  const quickScenarios = [
    {
      icon: Bed,
      label: 'Hostel Starter Kit',
      prompt: 'Joining hostel next week, need room essentials & bedding under ₹3,000',
      budget: 3000,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-800 border-amber-200'
    },
    {
      icon: BookOpen,
      label: 'Exam Essentials',
      prompt: 'End-term semester exams starting, need stationery & notebooks under ₹600',
      budget: 600,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-800 border-emerald-200'
    },
    {
      icon: Code2,
      label: 'Coding & CSE Lab',
      prompt: 'CSE lab programming setup: laptop stand, mouse, fast USB drive under ₹2,000',
      budget: 2000,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-800 border-blue-200'
    },
    {
      icon: Cpu,
      label: 'IoT & Arduino Project',
      prompt: 'Hardware engineering project: Arduino Uno, sensors, breadboard under ₹2,500',
      budget: 2500,
      color: 'from-purple-500/10 to-violet-500/10 text-purple-800 border-purple-200'
    },
    {
      icon: Compass,
      label: 'Campus 3-Day Trip',
      prompt: 'College club trip for 3 days: power bank, backpack, water bottle under ₹3,000',
      budget: 3000,
      color: 'from-sky-500/10 to-cyan-500/10 text-sky-800 border-sky-200'
    },
    {
      icon: FileSpreadsheet,
      label: 'Project Presentation',
      prompt: 'Seminar presentation viva: document folder, pen drive, pen under ₹800',
      budget: 800,
      color: 'from-rose-500/10 to-pink-500/10 text-rose-800 border-rose-200'
    }
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      openAiAssistant(prompt, selectedBudget);
    } else {
      openAiAssistant('Hostel essentials under ₹3,000', 3000);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 rounded-3xl mb-8 shadow-2xl border border-slate-800">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-5 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
          <span>Intelligent Student Context Engine</span>
          <span className="w-1 h-1 rounded-full bg-blue-400"></span>
          <span className="text-slate-300">Powered by Gemini AI</span>
        </div>

        {/* Tagline & Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display text-white mb-4 leading-tight">
          One Student. Every Need.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
            One Smart Campus Cart.
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Tell our AI your situation—whether you&apos;re entering a new hostel, cramming for semester exams, or prepping an engineering lab project. CampusCart AI auto-builds an optimized cart using verified products from campus stores.
        </p>

        {/* AI Input Box */}
        <form
          onSubmit={handleGenerate}
          className="bg-white/10 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/20 shadow-2xl max-w-3xl mx-auto mb-5 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/20"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center flex-1 px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800 text-left">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mr-3" />
              <input
                id="hero-ai-input"
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="E.g., Joining hostel next week, need bedding & room essentials under ₹3,000..."
                className="w-full bg-transparent text-white placeholder:text-slate-400 text-xs sm:text-sm outline-none font-medium"
              />
            </div>

            <button
              id="hero-ai-submit-btn"
              type="submit"
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 shrink-0 transition-all active:scale-95 group"
            >
              <span>Build My Smart Kit</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Budget Quick Select */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2.5 px-2 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>Target Budget:</span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5">
              {budgetPills.map(b => (
                <button
                  type="button"
                  key={b.label}
                  onClick={() => setSelectedBudget(b.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedBudget === b.value
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Quick Scenario Chips */}
        <div className="mt-6">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Popular Student Context Scenarios (Click to test Instant Cart Build):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-left">
            {quickScenarios.map((sc, i) => {
              const Icon = sc.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => openAiAssistant(sc.prompt, sc.budget)}
                  className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-blue-500/50 p-2.5 rounded-xl text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      ₹{sc.budget}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
                    {sc.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center flex-wrap gap-6 mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>30-Min Hostel Gate Delivery</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Campus Store Inventory</span>
          </div>
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-blue-400" />
            <span>Automated Student Budget Optimizer</span>
          </div>
        </div>
      </div>
    </section>
  );
};
