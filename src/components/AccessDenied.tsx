import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn, Lock, CheckCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import type { UserRole } from '../types.ts';

interface AccessDeniedProps {
  requiredRole: UserRole | UserRole[];
  attemptedSection: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole,
  attemptedSection
}) => {
  const { currentUser, setActiveTab, openAuthModal, activeRole } = useApp();

  const requiredRolesList = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const requiredRoleLabel = requiredRolesList.map(r => r.toUpperCase()).join(' or ');
  const currentRoleLabel = (activeRole || 'student').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden">
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HTTP 403 Forbidden
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-1">
                Access Denied: Restricted Section
              </h2>
              <p className="text-xs sm:text-sm text-rose-200/80 mt-1">
                Role-based access control (RBAC) is strictly enforced on this application.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Access Evaluation Breakdown
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Current Account Role</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-slate-100 text-slate-800 border border-slate-300">
                    {currentRoleLabel}
                  </span>
                  <span className="text-xs text-slate-600 font-medium truncate">
                    ({currentUser?.name || 'Anonymous'})
                  </span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-rose-200">
                <div className="text-[11px] text-rose-600 font-medium">Required Authorization</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                    {requiredRoleLabel}
                  </span>
                  <span className="text-xs text-rose-700 font-medium">
                    {attemptedSection}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              Your current account does not have permission to view or manage the <strong>{attemptedSection}</strong>.
              All backend endpoints (<code>/api/admin/*</code> and <code>/api/seller/*</code>) authenticate requests using secure server-side verification and reject unauthorized roles.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700">Security Rule Safeguards:</div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Students cannot access Admin Center or Seller Stores.</li>
              <li>Sellers cannot access the Super Admin governance portal.</li>
              <li>Frontend role tampering requests are strictly rejected by the API.</li>
              <li>Role authorization is verified cryptographically via server session tokens.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('shop')}
              className="w-full sm:w-auto flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Student Home</span>
            </button>

            <button
              onClick={() => openAuthModal(requiredRolesList.includes('admin') ? 'admin' : 'login')}
              className="w-full sm:w-auto flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Switch to Authorized Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
