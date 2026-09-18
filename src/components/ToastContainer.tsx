import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold text-white transition-all animate-in slide-in-from-bottom-2 duration-150 ${
            t.type === 'success'
              ? 'bg-slate-900 border border-slate-800'
              : t.type === 'error'
              ? 'bg-rose-900 border border-rose-800'
              : 'bg-blue-900 border border-blue-800'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
