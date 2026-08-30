import React from 'react';
import { WifiOff, RefreshCw, HardDrive, CheckCircle } from 'lucide-react';

export interface OfflineBannerProps {
  isOnline: boolean;
  pendingCount?: number;
  isSyncing?: boolean;
  onManualSync?: () => void;
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  pendingCount = 0,
  isSyncing = false,
  onManualSync,
  className = '',
}) => {
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <aside 
      aria-label="Network Status Alert"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
      !isOnline 
        ? 'bg-amber-700 text-white shadow-sm'
        : 'bg-teal-700 text-white shadow-sm'
    } ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
        
        {/* Status indicator and text */}
        <div className="flex items-center gap-2.5">
          {!isOnline ? (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <WifiOff className="w-3.5 h-3.5 text-white" />
            </div>
          ) : isSyncing ? (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
          )}

          <div>
            {!isOnline ? (
              <span className="font-medium">
                You are currently offline. Your question will be saved safely on your device and auto-uploaded when you reconnect.
              </span>
            ) : isSyncing ? (
              <span className="font-medium">
                Connection restored! Syncing {pendingCount} offline question(s)...
              </span>
            ) : (
              <span className="font-medium">
                Back online. All offline questions have been synchronized.
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Pending Pill */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border border-white/20">
              <HardDrive className="w-3 h-3" />
              <span>{pendingCount} saved locally</span>
            </div>
          )}

          {isOnline && pendingCount > 0 && onManualSync && (
            <button
              type="button"
              id="btn-manual-sync-offline"
              onClick={onManualSync}
              disabled={isSyncing}
              className="bg-white text-slate-900 hover:bg-slate-100 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
