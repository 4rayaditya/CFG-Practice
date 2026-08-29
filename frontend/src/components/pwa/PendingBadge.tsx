import React from 'react';
import { HardDrive, RefreshCw } from 'lucide-react';

export interface PendingBadgeProps {
  count: number;
  isSyncing?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PendingBadge: React.FC<PendingBadgeProps> = ({
  count,
  isSyncing = false,
  onClick,
  className = '',
}) => {
  if (count <= 0) return null;

  return (
    <button
      type="button"
      id="badge-pending-uploads"
      onClick={onClick}
      disabled={!onClick || isSyncing}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs border transition-all ${
        isSyncing
          ? 'bg-sky-50 text-sky-800 border-sky-300 animate-pulse'
          : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 cursor-pointer'
      } ${className}`}
      title={isSyncing ? 'Syncing offline recordings...' : `${count} offline voice recordings queued`}
    >
      {isSyncing ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
      ) : (
        <HardDrive className="w-3.5 h-3.5 text-amber-600" />
      )}
      <span>
        {isSyncing ? 'Syncing Queue...' : `${count} Pending ${count === 1 ? 'Upload' : 'Uploads'}`}
      </span>
    </button>
  );
};
