import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[999] flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white shadow-lg animate-in slide-in-from-bottom-5">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      Offline Mode — Cached data is being used.
    </div>
  );
};
