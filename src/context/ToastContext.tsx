'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage } from '@/types';

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Omit<ToastMessage, 'id' | 'timestamp'>>) => void;
  showSuccess: (title: string, description?: string, txHash?: string) => string;
  showError: (title: string, description?: string) => string;
  showPending: (title: string, description?: string, txHash?: string) => string;
  showInfo: (title: string, description?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: Date.now(),
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss non-pending toasts after 5 seconds
    if (toast.type !== 'pending') {
      setTimeout(() => {
        removeToast(id);
      }, 5500);
    }

    return id;
  }, [removeToast]);

  const updateToast = useCallback((id: string, updates: Partial<Omit<ToastMessage, 'id' | 'timestamp'>>) => {
    setToasts((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          // If updated from pending to success/error, auto-dismiss after 5s
          if (updates.type && updates.type !== 'pending') {
            setTimeout(() => {
              removeToast(id);
            }, 5500);
          }
          return updated;
        }
        return t;
      })
    );
  }, [removeToast]);

  const showSuccess = useCallback((title: string, description?: string, txHash?: string) => {
    return addToast({ type: 'success', title, description, txHash });
  }, [addToast]);

  const showError = useCallback((title: string, description?: string) => {
    return addToast({ type: 'error', title, description });
  }, [addToast]);

  const showPending = useCallback((title: string, description?: string, txHash?: string) => {
    return addToast({ type: 'pending', title, description, txHash });
  }, [addToast]);

  const showInfo = useCallback((title: string, description?: string) => {
    return addToast({ type: 'info', title, description });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        updateToast,
        showSuccess,
        showError,
        showPending,
        showInfo,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
