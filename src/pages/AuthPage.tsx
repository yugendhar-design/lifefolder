import React, { useState } from 'react';
import { 
  FolderLock, 
  ShieldCheck, 
  FileCheck2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword, enterPreviewMode } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password) {
          setErrorMessage('Please fill in both email and password.');
          setIsLoading(false);
          return;
        }
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      } else if (mode === 'signup') {
        if (!fullName.trim() || !email.trim() || !password) {
          setErrorMessage('All fields are required.');
          setIsLoading(false);
          return;
        }
        if (password.length < 8) {
          setErrorMessage('Password must be at least 8 characters.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        const res = await signUp(fullName, email, password);
        if (res.success) {
          setSuccessMessage(res.message || 'Account created successfully!');
          if (res.message?.includes('Confirmation email')) {
            // Wait for user to check email
          }
        } else {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMessage('Please provide your email address.');
          setIsLoading(false);
          return;
        }
        const res = await resetPassword(email);
        if (res.success) {
          setSuccessMessage(res.message || 'Password reset instructions have been sent.');
        } else {
          setErrorMessage(res.error || 'Failed to request password reset.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0b1c30]">
      {/* Left Branded Panel (Exact Figma Design 7:970) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0b1c30] via-[#0f243e] to-[#111827] text-white p-16 flex-col justify-between relative overflow-hidden border-r border-slate-800/80">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-blue-400 shadow-sm">
            <FolderLock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-bold text-[17px] tracking-tight leading-none text-white">
              LifeFolder
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium mt-0.5">
              Personal Vault
            </p>
          </div>
        </div>

        {/* Central Hero Message (Exact Typography from Figma) */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          {/* Governance Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-400/25 bg-blue-950/40 text-blue-200 text-xs font-semibold tracking-wider uppercase mb-7 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Personal document governance</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12] mb-5">
            Important dates,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-200">
              kept in order.
            </span>
          </h2>

          <p className="text-base text-slate-300 leading-relaxed max-w-md font-normal mb-8">
            One private place to track document renewals and keep the right file close at hand.
          </p>

          {/* Three Feature Highlights (Exact Figma) */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
              <span>Private files</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
              <span>Clear deadline status</span>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-xs text-slate-200">
              <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
              <span>No automatic document scanning</span>
            </div>
          </div>
        </div>

        {/* Footer Tagline */}
        <div className="relative z-10 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
          LifeFolder · Calm, practical document management
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 bg-gradient-to-br from-white via-[#fcfdff] to-[#f4f7fc] flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[430px] mx-auto animate-in fade-in duration-200">
          
          {/* Mobile Header Branding */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 block leading-tight">LifeFolder</span>
              <span className="text-[10px] text-slate-500 tracking-wider uppercase font-medium">Personal Vault</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-7">
            <h2 className="text-2xl sm:text-[30px] font-bold text-[#0f172a] tracking-tight leading-tight mb-2">
              {mode === 'signin' && 'Welcome back'}
              {mode === 'signup' && 'Create account'}
              {mode === 'forgot' && 'Reset your password'}
            </h2>
            <p className="text-[13.5px] text-[#64748b] leading-normal">
              {mode === 'signin' && 'Sign in to open your document vault on this device.'}
              {mode === 'signup' && 'Set up your private vault for expiry and renewal dates.'}
              {mode === 'forgot' && 'Enter your email address to receive reset instructions.'}
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name (Sign Up only) */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#dce3ec] rounded-lg text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#334155]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#dce3ec] rounded-lg text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#334155]">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-semibold text-[#2563eb] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#dce3ec] rounded-lg text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator for Sign Up */}
                {mode === 'signup' && password.length > 0 && (
                  <div className="pt-1 flex items-center gap-1.5">
                    <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full transition-all ${
                          strength <= 1 ? 'w-1/4 bg-rose-500' :
                          strength === 2 ? 'w-2/4 bg-amber-500' :
                          strength === 3 ? 'w-3/4 bg-blue-500' : 'w-full bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {strength <= 1 && 'Weak'}
                      {strength === 2 && 'Fair'}
                      {strength === 3 && 'Good'}
                      {strength >= 4 && 'Strong'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Sign Up only) */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#334155]">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#dce3ec] rounded-lg text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            )}

            {/* Primary Action Button (Figma Exact Styling) */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full min-h-[44px] px-4 py-2.5 bg-[#0051d5] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-[13px] rounded-lg shadow-[0px_1px_2px_rgba(0,81,213,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign in'}
                    {mode === 'signup' && 'Create account'}
                    {mode === 'forgot' && 'Send reset link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Navigation Toggle */}
          <div className="mt-6 text-center text-xs text-[#64748b]">
            {mode === 'signin' && (
              <p>
                New to LifeFolder?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-[#2563eb] hover:underline"
                >
                  Create account
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-[#2563eb] hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-[#2563eb] hover:underline"
                >
                  Back to sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
