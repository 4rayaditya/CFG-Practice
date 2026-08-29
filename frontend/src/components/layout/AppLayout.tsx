import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OfflineBanner } from '../pwa/OfflineBanner';
import { InstallPwaPrompt } from '../pwa/InstallPwaPrompt';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { AlertTriangle, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, flushQueueDispatcher } = useNetworkStatus();
  const location = useLocation();
  const [unauthorizedNotice, setUnauthorizedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.unauthorizedError && location.state?.message) {
      setUnauthorizedNotice(location.state.message);
      const timer = setTimeout(() => {
        setUnauthorizedNotice(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 selection:bg-sky-500/20 selection:text-sky-900 pt-8 sm:pt-6">
      {/* Global PWA Offline Notification */}
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onManualSync={flushQueueDispatcher}
      />

      {/* Global Unauthorized Access Toast Notice */}
      {unauthorizedNotice && (
        <div className="bg-rose-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{unauthorizedNotice}</span>
            </div>
            <button
              onClick={() => setUnauthorizedNotice(null)}
              className="p-1 hover:bg-rose-700 rounded text-white/80 hover:text-white transition"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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

export default AppLayout;
