import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Modal } from './Modal';
import { ViewScreen } from '../types';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  currentScreen: ViewScreen;
  onNavigate: (screen: ViewScreen) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentScreen,
  onNavigate,
  children,
}) => {
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const screenTitles: Record<ViewScreen, string> = {
    overview: 'Overview',
    'all-deadlines': 'All Deadlines',
    'add-deadline': 'Add Deadline',
    'edit-deadline': 'Edit Deadline',
    'deadline-details': 'Deadline Details',
    settings: 'Account Settings',
    help: 'Help & Support',
  };

  const handleConfirmLogout = async () => {
    await signOut();
    setLogoutModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex">
      {/* 240px Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        onLogoutClick={() => setLogoutModalOpen(true)}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[240px] flex flex-col min-h-screen">
        <TopBar
          title={screenTitles[currentScreen] || 'LifeFolder'}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={onNavigate}
          onLogoutClick={() => setLogoutModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Log Out"
        confirmLabel="Log Out"
        confirmVariant="danger"
        onConfirm={handleConfirmLogout}
      >
        <p>
          Are you sure you want to end your current session? You will need to sign in again to access your secure document vault.
        </p>
      </Modal>
    </div>
  );
};
