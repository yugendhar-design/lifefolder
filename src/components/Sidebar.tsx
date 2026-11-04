import React from 'react';
import { 
  LayoutGrid, 
  PlusCircle, 
  FileText, 
  Settings, 
  HelpCircle, 
  LogOut, 
  FolderLock,
  AlertCircle,
  Database
} from 'lucide-react';
import { ViewScreen } from '../types';
import { useDeadlines } from '../context/DeadlinesContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentScreen: ViewScreen;
  onNavigate: (screen: ViewScreen) => void;
  onLogoutClick: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onLogoutClick,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { counts } = useDeadlines();
  const { isLiveSupabase } = useAuth();

  const attentionCount = counts.overdue + counts.dueToday;

  const handleNav = (screen: ViewScreen) => {
    onNavigate(screen);
    if (onCloseMobile) onCloseMobile();
  };

  const navItemClass = (isActive: boolean) => `
    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all cursor-pointer select-none
    ${isActive 
      ? 'bg-[#2563eb] text-white shadow-[0px_1px_2px_rgba(37,99,235,0.25)]' 
      : 'text-[#475569] hover:bg-slate-100 hover:text-slate-900'}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-[240px] bg-white border-r border-[#e2e8f0] flex flex-col justify-between p-5 transition-transform duration-200
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Section */}
        <div className="flex flex-col gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 pb-2">
            <div className="w-9 h-9 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] shadow-sm flex items-center justify-center text-[#2563eb]">
              <FolderLock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[16px] text-[#0f172a] tracking-tight leading-tight">
                LifeFolder
              </span>
              <span className="text-[10px] text-[#94a3b8] tracking-wider uppercase font-medium">
                Personal Vault
              </span>
            </div>
          </div>

          {/* MAIN navigation */}
          <div className="flex flex-col gap-1">
            <span className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.55px] uppercase text-[#94a3b8]">
              Main
            </span>

            <button
              type="button"
              onClick={() => handleNav('overview')}
              className={navItemClass(currentScreen === 'overview')}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>Overview</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('add-deadline')}
              className={navItemClass(currentScreen === 'add-deadline')}
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Add Deadline</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('all-deadlines')}
              className={navItemClass(currentScreen === 'all-deadlines')}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0" />
                <span>All Deadlines</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                currentScreen === 'all-deadlines' ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#475569]'
              }`}>
                {counts.total}
              </span>
            </button>
          </div>

          {/* Attention Banner (Figma Exact Styling) */}
          {attentionCount > 0 && (
            <div className="p-3.5 rounded-2xl border border-[rgba(255,228,230,0.9)] bg-gradient-to-br from-[#fff1f2] to-[#fff7ed] shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-[#f43f5e] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#0f172a]">
                  Attention Needed
                </span>
              </div>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                {counts.overdue > 0 && `${counts.overdue} document past due. `}
                {counts.dueToday > 0 && `${counts.dueToday} expires today.`}
                {' '}Timely renewal recommended.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-1 pt-4 border-t border-[rgba(226,232,240,0.8)]">
          <span className="px-3 pb-1 text-[11px] font-semibold tracking-[0.55px] uppercase text-[#94a3b8]">
            Other
          </span>

          <button
            type="button"
            onClick={() => handleNav('settings')}
            className={navItemClass(currentScreen === 'settings')}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleNav('help')}
            className={navItemClass(currentScreen === 'help')}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Help & Support</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onLogoutClick}
            className="mt-2 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f1f5f9] hover:bg-slate-200/80 text-[#475569] hover:text-slate-900 text-[12.5px] font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
