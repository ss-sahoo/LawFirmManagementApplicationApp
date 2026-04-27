"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Scale,
  AlertCircle,
  Star,
  Phone,
  ChevronRight,
  Fingerprint,
  ShieldCheck,
  Globe,
} from 'lucide-react';

import { customFetch } from '@/lib/fetch';
import { API } from '@/lib/api';
import { PasswordInput } from '@/components/platform/ui';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'code'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  const isEmailInput = formData.email.includes('@');

  const getDashboardRoute = (role: string): string => {
    const normalizedRole = role?.toLowerCase();
    switch (normalizedRole) {
      case 'platform_owner': return '/platform-owner/dashboard';
      case 'partner_manager': return '/partner-manager/dashboard';
      case 'super_admin':
      case 'firm_owner': return '/super-admin/dashboard';
      case 'admin':
      case 'firm_admin': return '/firm-admin/dashboard';
      case 'advocate':
      case 'lawyer': return '/advocate/dashboard';
      case 'paralegal': return '/paralegal/dashboard';
      case 'client': return '/client/dashboard';
      default: return '/platform-owner/dashboard';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (loginMode === 'password') {
        const payload = {
          username: formData.email,
          password: formData.password
        };

        const response = await customFetch(API.AUTH.LOGIN_USERNAME_PASSWORD, {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          let errorMsg = data.detail || data.message;
          if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            errorMsg = data.non_field_errors.includes("User account is inactive")
              ? "Your account is inactive please contact your admin for details"
              : data.non_field_errors[0];
          }
          throw new Error(errorMsg || 'Login failed. Please check your credentials.');
        }

        if (data.token) localStorage.setItem("auth_token", data.token);
        if (data.user) localStorage.setItem("user_details", JSON.stringify(data.user));

        const targetRoute = getDashboardRoute(data.user?.user_type);
        router.push(targetRoute);

      } else if (loginMode === 'code') {
        if (!otpSent) {
          if (isEmailInput) {
            const response = await customFetch(API.AUTH.REQUEST_EMAIL_OTP, {
              method: 'POST',
              body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || data.message || 'Failed to send OTP to email.');
          } else {
            const response = await customFetch(API.AUTH.REQUEST_PHONE_OTP, {
              method: 'POST',
              body: JSON.stringify({ phone_number: formData.email })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || data.message || 'Failed to send OTP to phone.');
          }
          setOtpSent(true);
        } else {
          const payload = isEmailInput
            ? { email: formData.email, otp_code: otpValue }
            : { phone_number: formData.email, otp_code: otpValue };

          const response = await customFetch(API.AUTH.VERIFY_OTP, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          const data = await response.json();

          if (!response.ok) {
            let errorMsg = data.detail || data.message || data.error;
            if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
              errorMsg = data.non_field_errors.includes("User account is inactive")
                ? "Your account is inactive please contact your admin for details"
                : data.non_field_errors[0];
            }
            throw new Error(errorMsg || 'Invalid OTP. Please try again.');
          }

          const token = data.token || data.data?.access;
          const user = data.user || data.data?.user;

          if (token) localStorage.setItem("auth_token", token);
          if (user) localStorage.setItem("user_details", JSON.stringify(user));

          const targetRoute = getDashboardRoute(user?.user_type);
          router.push(targetRoute);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Process failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#fafafa]">
      {/* LEFT SIDE: Brand & Testimonial */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-16 text-white overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0f172a]" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 100, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-[100%] h-[100%] bg-blue-600/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -45, 0],
              x: [0, -50, 0],
              y: [0, -100, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -right-1/4 w-[100%] h-[100%] bg-indigo-600/20 rounded-full blur-[120px]" 
          />
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        {/* Logo Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl">
            <Scale className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <span className="font-bold text-2xl tracking-tight block">AntLegal</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400/80 font-bold">Premier Legal Suite</span>
          </div>
        </motion.div>

        {/* Testimonial Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 max-w-lg mb-10"
        >
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Scale className="w-24 h-24 rotate-12" />
            </div>
            
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>

            <blockquote className="text-xl font-light leading-relaxed mb-8 italic text-slate-100">
              "AntLegal has redefined our firm's operational efficiency. The seamless integration of case tracking and billing is truly industry-leading."
            </blockquote>

            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=Sarah+Chen&background=3b82f6&color=fff&bold=true`}
                  alt="User"
                  className="w-14 h-14 rounded-2xl border-2 border-white/20 object-cover shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0f172a] rounded-full" />
              </div>
              <div>
                <p className="font-bold text-lg">Sarah Chen, Esq.</p>
                <p className="text-sm text-slate-400 font-medium">
                  Managing Partner, Global Legal Group
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-12 text-slate-300">
            <div>
              <p className="text-3xl font-bold text-white mb-1">500+</p>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Law Firms</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-3xl font-bold text-white mb-1">10k+</p>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Active Cases</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-3xl font-bold text-white mb-1">99.9%</p>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-500">Security</p>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 flex items-center gap-6 text-sm font-medium text-slate-500">
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure access</span>
          <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Multi-region</span>
          <span className="ml-auto">© 2026 AntLegal</span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-[55%] bg-white flex flex-col justify-center items-center p-8 lg:p-24 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px] space-y-10"
        >
          {/* Mobile Brand */}
          <div className="lg:hidden flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Scale className="w-5 h-5" />
              </div>
              <span className="font-bold text-2xl text-slate-900 tracking-tight">AntLegal</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
              Welcome back
            </h2>
            <p className="text-slate-500 text-lg font-medium">Please enter your details to sign in.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl p-4 flex items-center gap-4 text-red-700"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-sm font-semibold">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 tracking-tight ml-1">
                {loginMode === 'password' ? 'Username / Email / Phone' : 'Email or Phone Number'}
              </label>
              <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {isEmailInput ? (
                    <Mail className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-600' : 'text-slate-400'}`} />
                  ) : (
                    <Phone className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-600' : 'text-slate-400'}`} />
                  )}
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.email}
                  disabled={otpSent && loginMode === 'code'}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-[1.25rem] text-slate-900 font-semibold placeholder-slate-400 transition-all focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 ${focusedField === 'email' ? 'border-blue-600' : 'border-slate-100'} ${otpSent && loginMode === 'code' ? 'opacity-50 grayscale bg-slate-200' : ''}`}
                  placeholder="name@lawfirm.com"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loginMode === 'password' ? (
                <motion.div
                  key="password-field"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between ml-1">
                    <label htmlFor="password" className="block text-sm font-bold text-slate-700 tracking-tight">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <PasswordInput
                      value={formData.password}
                      onChange={v => setFormData(p => ({ ...p, password: v }))}
                      required={loginMode === 'password'}
                      autoComplete="current-password"
                      className="!pl-12 !py-4 !h-[60px] !bg-slate-50 !border-2 !border-slate-100 !rounded-[1.25rem] focus:!border-blue-600 focus:!bg-white focus:!ring-4 focus:!ring-blue-600/5 transition-all !font-semibold"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </motion.div>
              ) : otpSent ? (
                <motion.div
                  key="otp-field"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between ml-1">
                    <label htmlFor="otp" className="block text-sm font-bold text-slate-700 tracking-tight">
                      Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpValue(''); setError(''); }}
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      Change {isEmailInput ? 'Email' : 'Phone'}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      value={otpValue}
                      onChange={(e) => { setOtpValue(e.target.value); setError(''); }}
                      className="block w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.25rem] text-center tracking-[1em] text-2xl font-black text-slate-900 placeholder-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all uppercase"
                      placeholder="••••••"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-center text-sm font-bold text-slate-400">
                    A 6-digit code has been sent to your {isEmailInput ? 'email' : 'phone'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-5 bg-blue-50/50 border border-blue-100 rounded-[1.25rem] flex items-start gap-4"
                >
                  <Fingerprint className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <p className="text-sm text-blue-900 font-medium leading-relaxed">
                    Enter your {isEmailInput ? 'email' : 'phone'} and we'll send a secure one-time password to your inbox or device.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01, boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] font-extrabold text-lg transition-all shadow-xl shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>
                    {loginMode === 'password' ? 'Sign in to dashboard' : 
                     otpSent ? 'Complete sign in' : 'Send verification code'}
                  </span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-black uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            type="button"
            className="w-full py-4 bg-slate-50 hover:bg-slate-100 border-2 border-transparent hover:border-slate-200 rounded-[1.25rem] text-sm font-extrabold text-slate-700 transition-all flex items-center justify-center gap-3"
            onClick={() => { setLoginMode(loginMode === 'password' ? 'code' : 'password'); setOtpSent(false); setOtpValue(''); setError(''); }}
          >
            {loginMode === 'password' ? (
              <>
                <Fingerprint className="w-5 h-5 text-slate-600" />
                Sign in with OTP
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-slate-600" />
                Sign in with Password
              </>
            )}
          </button>

          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-600 rounded-lg cursor-pointer accent-blue-600"
                />
                <label htmlFor="remember-me" className="text-sm text-slate-600 font-bold hover:text-slate-900 cursor-pointer transition-colors">
                  Keep me signed in
                </label>
              </div>
              <p className="text-sm font-bold text-slate-500">
                New user? {' '}
                <Link href="/register" className="text-blue-600 hover:underline">Create account</Link>
              </p>
            </div>

            <div className="bg-slate-50/50 rounded-2xl p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                This secure portal is protected by industry-standard encryption and security protocols. 
                By signing in, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Floating Credit */}
        <div className="absolute bottom-10 left-0 right-0 text-center flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Powered by</p>
          <a href="http://anthemgt.com/" target="_blank" rel="noreferrer" className="font-black text-slate-900 text-sm tracking-tighter hover:text-blue-600 transition-colors">ANTHEM</a>
        </div>
      </div>
    </div>
  );
}