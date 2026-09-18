import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  ShieldCheck,
  Store,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import type { RegisterPayload } from '../types.ts';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    login,
    adminLogin,
    demoLogin,
    registerStudent,
    showToast
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(authModalMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form (ONLY Student fields, NO role selector!)
  const [registerData, setRegisterData] = useState<RegisterPayload>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: 'Campus Institute of Technology',
    course: 'Computer Science & Engineering',
    year: 2,
    phone: ''
  });

  // Sync mode when modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'admin') {
        const res = await adminLogin(loginEmail, loginPassword);
        if (!res.success) {
          setErrorMessage(res.error || 'Admin authentication failed');
        } else {
          closeAuthModal();
        }
      } else {
        const res = await login(loginEmail, loginPassword);
        if (!res.success) {
          setErrorMessage(res.error || 'Login failed. Please verify credentials.');
        } else {
          closeAuthModal();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerStudent(registerData);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed');
      } else {
        closeAuthModal();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating student account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (email: string, role: 'student' | 'seller' | 'admin', personaId: string) => {
    setLoginEmail(email);
    demoLogin(personaId).then(() => {
      closeAuthModal();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div
          className={`p-6 text-white transition-colors ${
            mode === 'admin'
              ? 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-950'
              : 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                {mode === 'admin' ? (
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                ) : mode === 'register' ? (
                  <GraduationCap className="w-5 h-5 text-indigo-300" />
                ) : (
                  <Lock className="w-5 h-5 text-blue-300" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black font-display text-white">
                  {mode === 'admin'
                    ? 'Administrator Access'
                    : mode === 'register'
                    ? 'Student Registration'
                    : 'CampusCart Authentication'}
                </h3>
                <p className="text-xs text-slate-300/90 mt-0.5">
                  {mode === 'admin'
                    ? 'Authorized university staff & administrative portal'
                    : mode === 'register'
                    ? 'Create your verified student shopping account'
                    : 'Sign in to access your orders, kits, and role dashboard'}
                </p>
              </div>
            </div>

            <button
              onClick={closeAuthModal}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-black/30 p-1 rounded-xl mt-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Student Register
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('admin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                mode === 'admin'
                  ? 'bg-rose-500 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin Portal
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Quick Demo Login Presets */}
          {(mode === 'login' || mode === 'admin') && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Quick Test Persona Sign-In</span>
                <span className="text-emerald-600 font-medium">1-Click Instant</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('aarav.cse@campus.edu', 'student', 'student-1')}
                  className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2 rounded-xl text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      Student
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 truncate">Aarav Sharma</div>
                  <div className="text-[10px] text-slate-500">Student Home</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('seller.tech@campuscart.ai', 'seller', 'seller-1')}
                  className="bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 p-2 rounded-xl text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      Seller
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 truncate">Vikram Joshi</div>
                  <div className="text-[10px] text-slate-500">Seller Dashboard</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('campus.admin@campuscart.ai', 'admin', 'admin-1')}
                  className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 p-2 rounded-xl text-left transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 truncate">Super Admin</div>
                  <div className="text-[10px] text-slate-500">Admin Center</div>
                </button>
              </div>
            </div>
          )}

          {/* LOGIN & ADMIN LOGIN FORM */}
          {(mode === 'login' || mode === 'admin') && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {mode === 'admin' ? 'University Admin Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder={mode === 'admin' ? 'campus.admin@campuscart.ai' : 'student@campus.edu or seller@...'}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  For seeded demo accounts: <code>Student@123</code>, <code>Seller@123</code>, or <code>Admin@CampusCart2026</code>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center space-x-2 transition-all shadow-md ${
                  mode === 'admin'
                    ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-400'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400'
                }`}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'admin' ? 'Verify & Enter Admin Center' : 'Sign In to CampusCart'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* PUBLIC STUDENT REGISTRATION FORM */}
          {/* CRITICAL: ONLY student fields! Absolutely NO role selector! */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Student Exclusive:</strong> All public registrations automatically receive a verified Student account with access to student kits, catalog, and AI shopping assistant.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={registerData.name}
                    onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="e.g. Diya Sengupta"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  University / College Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="diya.cse@campus.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={registerData.password}
                    onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={registerData.confirmPassword}
                    onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    College / Campus Name
                  </label>
                  <input
                    type="text"
                    value={registerData.college}
                    onChange={e => setRegisterData({ ...registerData, college: e.target.value })}
                    placeholder="Institute name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Degree / Course
                  </label>
                  <input
                    type="text"
                    value={registerData.course}
                    onChange={e => setRegisterData({ ...registerData, course: e.target.value })}
                    placeholder="e.g. Computer Science (B.Tech)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={registerData.year}
                    onChange={e => setRegisterData({ ...registerData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800 bg-white"
                  >
                    <option value={1}>1st Year (Fresher)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={e => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 flex items-center justify-center space-x-2 transition-all shadow-md"
              >
                {isLoading ? (
                  <span>Creating Student Account...</span>
                ) : (
                  <>
                    <span>Complete Student Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
