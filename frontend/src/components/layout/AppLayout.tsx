import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OfflineBanner } from '../pwa/OfflineBanner';
import { InstallPwaPrompt } from '../pwa/InstallPwaPrompt';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const AppLayout: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, flushQueueDispatcher } = useNetworkStatus();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 selection:bg-sky-500/20 selection:text-sky-900 pt-8 sm:pt-6">
      {/* Global PWA Offline Notification */}
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onManualSync={flushQueueDispatcher}
      />

      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />

      {/* Global PWA Install Action Prompt */}
      <InstallPwaPrompt />
    </div>
  );
};
