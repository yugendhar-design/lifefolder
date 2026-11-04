import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ViewScreen } from '../types';

interface SettingsPageProps {
  onNavigate: (screen: ViewScreen) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, updateProfile, updatePassword } = useAuth();

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || 'Alex Morgan');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }
    setProfileSaving(true);
    const res = await updateProfile(fullName.trim());
    setProfileSaving(false);
    if (res.success) {
      setProfileSuccess('Profile details updated successfully.');
    } else {
      setProfileError(res.error || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    const res = await updatePassword(newPassword);
    setPasswordSaving(false);
    if (res.success) {
      setPasswordSuccess('Password has been updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-150">
      {/* Breadcrumb & Header Row (Figma 7:262) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs mb-1">
          <span 
            onClick={() => onNavigate('overview')}
            className="font-medium text-[#94a3b8] hover:text-[#2563eb] cursor-pointer"
          >
            LifeFolder
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
          <span className="font-semibold text-[#2563eb]">Account Settings</span>
        </div>
        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
          Account Settings
        </h2>
        <p className="text-[13.5px] text-[#64748b]">
          Manage your profile details and account security.
        </p>
      </div>

      {/* Two Column Settings Grid (Figma 7:275) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Form 1: Profile Details (Figma 7:276) */}
        <div className="bg-white border border-[rgba(226,232,240,0.9)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-3 pb-4 border-b border-[#e2e8f0] mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0051d5] flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0f172a]">
                Profile details
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Your identity inside LifeFolder.
              </p>
            </div>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#334155]">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#dce3ec] rounded-lg text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0051d5]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#334155]">
                Email address
              </label>
              <input
                type="email"
                value={user?.email || 'alex@lifefolder.vault'}
                disabled
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#dce3ec] rounded-lg text-xs text-[#64748b] cursor-not-allowed"
              />
              <span className="text-[10.5px] text-[#8994a4]">
                Contact support if you need to change your sign-in email.
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2.5 bg-[#0051d5] hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Form 2: Change Password (Figma 7:298) */}
        <div className="bg-white border border-[rgba(226,232,240,0.9)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-3 pb-4 border-b border-[#e2e8f0] mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0f172a]">
                Change password
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Choose a strong, unique password.
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#334155]">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dce3ec] rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0051d5]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-[#334155]">
                Confirm new password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your new password"
                className="w-full px-3.5 py-2.5 bg-white border border-[#dce3ec] rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0051d5]"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-5 py-2.5 bg-[#0051d5] hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {passwordSaving ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
