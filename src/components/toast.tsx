'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'error', duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    error: 'border-destructive text-destructive',
    success: 'border-green-500 text-green-500',
    info: 'border-primary text-primary',
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 border-2 bg-background p-4 ${styles[type]}`}>
      <p className="font-mono text-sm">{message}</p>
    </div>
  );
}

interface ToastState {
  message: string;
  type: 'error' | 'success' | 'info';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showError = (message: string) => setToast({ message, type: 'error' });
  const showSuccess = (message: string) => setToast({ message, type: 'success' });
  const showInfo = (message: string) => setToast({ message, type: 'info' });
  const hideToast = () => setToast(null);

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showError, showSuccess, showInfo, ToastComponent };
}
