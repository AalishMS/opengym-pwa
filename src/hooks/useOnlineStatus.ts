'use client';

import { useEffect, useState, useRef } from 'react';
import { getPendingWritesCount, processSync } from '@/lib/db';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const checkPendingCountRef = useRef<() => Promise<void>>(null);

  const triggerSync = async () => {
    if (navigator.onLine) {
      await processSync();
      if (checkPendingCountRef.current) {
        await checkPendingCountRef.current();
      }
    }
  };

  useEffect(() => {
    const checkPendingCount = async () => {
      try {
        const count = await getPendingWritesCount();
        setPendingCount(count);
      } catch {
        setPendingCount(0);
      }
    };

    checkPendingCountRef.current = checkPendingCount;

    const handleOnline = async () => {
      setIsOnline(true);
      await processSync();
      await checkPendingCount();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkPendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, pendingCount, triggerSync };
}
