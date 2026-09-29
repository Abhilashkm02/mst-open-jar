"use client";

import React from "react";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, ExternalLink } from "lucide-react";
import { truncateAddress } from "@/lib/formatUtils";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none"
    >
      <AnimatePresence>
        {toasts.map(toast => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto bg-ink-elevated border border-hairline-bright rounded-card p-4 shadow-2xl space-y-1.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-accentEmerald flex-shrink-0" />}
                  {isError && <AlertCircle className="w-4 h-4 text-accentBrick flex-shrink-0" />}
                  {!isSuccess && !isError && <Info className="w-4 h-4 text-cobalt flex-shrink-0" />}
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-paper">
                    {toast.title}
                  </h4>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-paper-muted hover:text-paper p-0.5"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-paper-muted leading-relaxed pl-6 font-sans">
                {toast.description}
              </p>

              {toast.txHash && (
                <div className="pl-6 pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cobalt bg-cobalt/10 px-2 py-0.5 rounded-tag border border-cobalt/20">
                    <span>TX: {truncateAddress(toast.txHash)}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
