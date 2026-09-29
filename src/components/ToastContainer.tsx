'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2, X, ExternalLink } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-800';
        let bgClass = 'bg-[#0E131F]/95';
        let IconComponent = Info;
        let iconColor = 'text-brand-cyan';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/30';
          bgClass = 'bg-[#0B1713]/95';
          IconComponent = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/30';
          bgClass = 'bg-[#1D0C12]/95';
          IconComponent = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/30';
          bgClass = 'bg-[#1A140B]/95';
          IconComponent = AlertTriangle;
          iconColor = 'text-amber-400';
        } else if (toast.type === 'pending') {
          borderClass = 'border-cyan-500/30';
          bgClass = 'bg-[#0A1624]/95';
          IconComponent = Loader2;
          iconColor = 'text-cyan-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 ${bgClass} ${borderClass}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <IconComponent
                className={`w-5 h-5 ${iconColor} ${toast.type === 'pending' ? 'animate-spin' : ''}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed break-words">{toast.description}</p>
              )}
              {toast.txHash && (
                <a
                  href={`https://scan.mstchain.io/tx/${toast.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-brand-cyan hover:underline mt-2 font-mono"
                >
                  <span>View on Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
