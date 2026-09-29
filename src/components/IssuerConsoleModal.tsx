"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { useJars } from "@/context/JarsContext";
import { useToast } from "@/context/ToastContext";
import { contractService } from "@/contracts/contractService";
import { CONTRACT_ADDRESS } from "@/contracts/config";
import { formatMST, truncateAddress } from "@/lib/formatUtils";
import { ethers } from "ethers";
import {
  X,
  Sliders,
  CheckCircle2,
  Loader2,
  Lock,
  TrendingUp,
  RotateCcw,
  ShieldAlert,
  Radio,
} from "lucide-react";

interface IssuerConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IssuerConsoleModal: React.FC<IssuerConsoleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { wallet, refreshBalance } = useWallet();
  const { jars, refreshOnChainState, executeJarLotPurchase, distributeJarListingGains } = useJars();
  const { showToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [gainAmount, setGainAmount] = useState<number>(10); // 10 MST default listing profit

  // Target live jar
  const liveJar = jars.find(
    j => j.contractAddress.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
  );

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Execute Lot Purchase on exchange
  const handleExecuteLotPurchase = async () => {
    if (!liveJar) return;
    try {
      setIsProcessing(true);
      const result = await executeJarLotPurchase(liveJar.id);
      showToast({
        title: "Lot Purchase Executed",
        description: "Syndicate jar locked on-chain and registered for exchange allotment.",
        type: "success",
        txHash: result.txHash,
      });
      await refreshBalance();
    } catch (err: any) {
      showToast({
        title: "Execution Error",
        description: err?.message || "Failed to execute lot purchase",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Distribute Listing Gains
  const handleDistributeGains = async () => {
    if (!liveJar) return;
    try {
      setIsProcessing(true);
      const result = await distributeJarListingGains(liveJar.id, gainAmount);
      showToast({
        title: "Listing Gains Distributed",
        description: `${gainAmount} MST deposited. Investors can now claim returns under My Jars!`,
        type: "success",
        txHash: result.txHash,
      });
      await refreshBalance();
    } catch (err: any) {
      showToast({
        title: "Distribution Error",
        description: err?.message || "Failed to distribute listing gains",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/80"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-2xl w-full bg-ink-surface border border-hairline rounded-cardLg shadow-2xl p-6 md:p-8 space-y-6 select-none z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-hairline">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-btn bg-cobalt/10 border border-cobalt/30 flex items-center justify-center text-cobalt">
                <Sliders className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-paper">
                  Issuer & Clearing Console
                </h3>
                <span className="text-[11px] font-mono text-paper-dim">
                  CONTRACT: {truncateAddress(CONTRACT_ADDRESS)} • MST CHAIN (1088)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-btn text-paper-muted hover:text-paper hover:bg-ink-elevated transition-colors"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Active Contract State */}
          <div className="p-4 rounded-card bg-ink-elevated/40 border border-hairline space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-paper-dim">
              <span>LIVE POOL METRICS</span>
              <span className="flex items-center gap-1.5 text-accentEmerald">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Synchronized with MST Testnet</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-ink-surface border border-hairline">
                <span className="text-[10px] text-paper-dim block">OFFERING</span>
                <span className="font-bold text-paper truncate block">{liveJar?.name || "TechNova AI"}</span>
              </div>
              <div className="p-2.5 rounded bg-ink-surface border border-hairline">
                <span className="text-[10px] text-paper-dim block">FUNDED LEVEL</span>
                <span className="font-bold text-accentEmerald">{liveJar?.fundedPercent || 65}%</span>
              </div>
              <div className="p-2.5 rounded bg-ink-surface border border-hairline">
                <span className="text-[10px] text-paper-dim block">STATUS</span>
                <span className="font-bold text-paper">{liveJar?.statusLabel || "Funding Open"}</span>
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-paper-dim block">
              LIFECYCLE TRIGGERS
            </span>

            {/* Action 1: Execute Lot Purchase */}
            <div className="p-4 rounded-card bg-ink-surface border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-accentAmber" />
                  <h4 className="text-sm font-bold text-paper font-serif">
                    1. Execute Lot Purchase
                  </h4>
                </div>
                <p className="text-xs text-paper-muted max-w-md">
                  Locks the syndicate jar and calls <code className="text-cobalt">executeLotPurchase()</code> to submit the full lot application on exchange.
                </p>
              </div>

              <button
                onClick={handleExecuteLotPurchase}
                disabled={isProcessing}
                className="px-4 py-2 rounded-btn text-xs font-semibold text-white bg-cobalt hover:bg-cobalt-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Trigger Purchase</span>
              </button>
            </div>

            {/* Action 2: Distribute Listing Gains */}
            <div className="p-4 rounded-card bg-ink-surface border border-hairline space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accentEmerald" />
                <h4 className="text-sm font-bold text-paper font-serif">
                  2. Distribute Listing Gains
                </h4>
              </div>
              <p className="text-xs text-paper-muted leading-relaxed">
                Deposits listing day liquidation profits into the contract via <code className="text-accentEmerald">distributeListingGains()</code>, allowing fraction holders to claim returns.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    value={gainAmount}
                    onChange={e => setGainAmount(parseFloat(e.target.value) || 1)}
                    className="w-full h-10 bg-ink-elevated border border-hairline rounded-input px-3 font-mono text-sm text-paper tabular-nums outline-none focus:border-cobalt"
                    placeholder="Enter MST gains"
                  />
                  <span className="absolute right-3 top-2.5 font-mono text-xs text-paper-dim">
                    MST
                  </span>
                </div>

                <button
                  onClick={handleDistributeGains}
                  disabled={isProcessing || gainAmount <= 0}
                  className="px-4 py-2.5 rounded-btn text-xs font-semibold text-slate-950 bg-accentEmerald hover:bg-accentEmerald/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  <span>Deposit Profits</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px] font-mono text-paper-dim">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-accentAmber" />
              <span>Restricted to Pool Manager & Hackathon Judges</span>
            </div>
            <button
              onClick={onClose}
              className="text-paper-muted hover:text-paper"
            >
              Done
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
