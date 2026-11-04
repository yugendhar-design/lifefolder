import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DeadlinesProvider } from './context/DeadlinesContext';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { OverviewPage } from './pages/OverviewPage';
import { AllDeadlinesPage } from './pages/AllDeadlinesPage';
import { AddEditDeadlinePage } from './pages/AddEditDeadlinePage';
import { DeadlineDetailsPage } from './pages/DeadlineDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { ViewScreen } from './types';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>('overview');
  const [activeDeadlineId, setActiveDeadlineId] = useState<string | undefined>(undefined);

  const handleNavigate = (screen: ViewScreen, id?: string) => {
    setCurrentScreen(screen);
    setActiveDeadlineId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-slate-600 tracking-wide">
          Opening secure vault...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Layout currentScreen={currentScreen} onNavigate={handleNavigate}>
      {currentScreen === 'overview' && (
        <OverviewPage onNavigate={handleNavigate} />
      )}
      {currentScreen === 'all-deadlines' && (
        <AllDeadlinesPage onNavigate={handleNavigate} />
      )}
      {currentScreen === 'add-deadline' && (
        <AddEditDeadlinePage onNavigate={handleNavigate} />
      )}
      {currentScreen === 'edit-deadline' && (
        <AddEditDeadlinePage onNavigate={handleNavigate} editId={activeDeadlineId} />
      )}
      {currentScreen === 'deadline-details' && activeDeadlineId && (
        <DeadlineDetailsPage deadlineId={activeDeadlineId} onNavigate={handleNavigate} />
      )}
      {currentScreen === 'settings' && (
        <SettingsPage onNavigate={handleNavigate} />
      )}
      {currentScreen === 'help' && (
        <HelpSupportPage onNavigate={handleNavigate} />
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DeadlinesProvider>
        <MainApp />
      </DeadlinesProvider>
    </AuthProvider>
  );
}
