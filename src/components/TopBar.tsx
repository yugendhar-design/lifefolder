import React, { useState } from 'react';
import { Calendar, Bell, Menu, User, LogOut, Settings, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useDeadlines } from '../context/DeadlinesContext';
import { ViewScreen } from '../types';
import { getDeadlineStatus } from '../lib/status';

interface TopBarProps {
  title: string;
  onOpenMobileMenu: () => void;
  onNavigate: (screen: ViewScreen, id?: string) => void;
  onLogoutClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  onOpenMobileMenu,
  onNavigate,
  onLogoutClick,
}) => {
  const { user } = useAuth();
  const { deadlines, counts } = useDeadlines();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const todayFormatted = format(new Date(), 'MMM d, yyyy');

  // Urgent items needing attention (Overdue or Due Today)
  const urgentDeadlines = deadlines.filter(d => {
    const status = getDeadlineStatus(d.deadline_date);
    return status === 'Overdue' || status === 'Due today';
  });

  const hasUnreadNotifications = urgentDeadlines.length > 0;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-md border-b border-[#e2e8f0] px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg sm:text-[18px] font-bold text-[#0f172a] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right Utilities */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Date Reference Pill (Exact Figma) */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff6ff] border border-[rgba(191,219,254,0.7)] text-[#1d4ed8] text-xs font-medium shadow-2xs">
          <Calendar className="w-3.5 h-3.5" />
          <span>Today: <strong className="font-semibold">{todayFormatted}</strong></span>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileDropdownOpen(false);
            }}
            className={`relative p-2 rounded-xl transition-all ${
              notificationsOpen 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="w-4 h-4" />
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f43f5e] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Popover */}
          {notificationsOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setNotificationsOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      Notifications
                    </span>
                    {hasUnreadNotifications && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        {urgentDeadlines.length} urgent
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 max-h-72 overflow-y-auto">
                  {urgentDeadlines.length === 0 ? (
                    /* "You are all caught up!" State */
                    <div className="py-6 px-4 text-center flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 border border-emerald-100 shadow-2xs">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mb-0.5">
                        You're all caught up!
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-[220px]">
                        No urgent document deadlines require your immediate attention right now.
                      </p>
                    </div>
                  ) : (
                    /* List of Urgent Deadlines */
                    <div className="flex flex-col gap-2">
                      {urgentDeadlines.map((item) => {
                        const isOverdue = getDeadlineStatus(item.deadline_date) === 'Overdue';
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setNotificationsOpen(false);
                              onNavigate('deadline-details', item.id);
                            }}
                            className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all cursor-pointer flex items-start gap-2.5"
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                              isOverdue ? 'bg-[#f43f5e]' : 'bg-[#f59e0b]'
                            }`}>
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs text-slate-900 truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {isOverdue ? 'This document is past due' : 'Expires by 23:59 tonight'}
                              </p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      onNavigate('all-deadlines');
                    }}
                    className="text-[11px] font-semibold text-[#2563eb] hover:underline"
                  >
                    View all document deadlines →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Pill with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-100/80 border border-slate-200/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[12.5px] font-semibold text-[#0f172a] leading-none">
                {user?.fullName || 'Alex Morgan'}
              </span>
              <span className="text-[10px] text-[#94a3b8] leading-tight font-medium mt-0.5">
                Vault Owner
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setProfileDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user?.fullName || 'Alex Morgan'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user?.email || 'alex@lifefolder.vault'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogoutClick();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
