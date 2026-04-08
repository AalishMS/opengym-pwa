'use client';

import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineIndicator() {
  const { isOnline, pendingCount } = useOnlineStatus();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-none border border-border bg-card px-3 py-2 text-sm font-mono">
      <WifiOff className="size-4 text-destructive" />
      <span className="text-destructive">
        {!isOnline ? 'OFFLINE' : `SYNCING ${pendingCount}...`}
      </span>
    </div>
  );
}
