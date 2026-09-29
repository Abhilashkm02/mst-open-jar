"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";
import { useJars } from "@/context/JarsContext";
import { useToast } from "@/context/ToastContext";
import { CONTRACT_ADDRESS, CHAINLINK_VRF_CONFIG } from "@/contracts/config";
import { formatMST, truncateAddress } from "@/lib/formatUtils";
import {
  X,
  Sliders,
  CheckCircle2,
  Loader2,
  Lock,
  TrendingUp,
  ShieldAlert,
  Radio,
  Sparkles,
  Dices,
  ChevronDown,
  Building,
  Megaphone,
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
  const {
    jars,
    executeJarLotPurchase,
    distributeJarListingGains,
    triggerVRFAllotment,
    announceIpo,
  } = useJars();
  const { showToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [gainAmount, setGainAmount] = useState<number>(10); // 10 MST default listing profit

  // Target selected jar (defaults to live testnet jar or first jar)
  const defaultJarId =
    jars.find(j => j.contractAddress.toLowerCase() === CONTRACT_ADDRESS.toLowerCase())?.id ||
    jars[0]?.id ||
    "JAR-014";

  const [selectedJarId, setSelectedJarId] = useState<string>(defaultJarId);

  // Synchronize if selected jar not in list
  const selectedJar = jars.find(j => j.id === selectedJarId) || jars[0];

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen || !selectedJar) return null;

  // 0. Announce IPO Syndicate to market
  const handleAnnounceIpo = async () => {
    try {
      setIsProcessing(true);
      const result = await announceIpo(selectedJar.id);
      await refreshBalance();
    } catch (err: any) {
      showToast({
        title: "Announcement Error",
        description: err?.message || "Failed to announce IPO syndicate",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Execute Lot Purchase on exchange
  const handleExecuteLotPurchase = async () => {
    try {
      setIsProcessing(true);
      const result = await executeJarLotPurchase(selectedJar.id);
      showToast({
        title: "Lot Purchase Executed",
        description: `Syndicate ${selectedJar.name} locked on-chain and registered for exchange allotment.`,
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

  // 2. Trigger Chainlink VRF Decentralized Allotment Draw
  const handleTriggerVRFAllotment = async () => {
    try {
      setIsProcessing(true);
      const result = await triggerVRFAllotment(selectedJar.id);
      showToast({
        title: result.isAllotted ? "Chainlink VRF: Allotted!" : "Chainlink VRF: Draw Missed",
        description: result.isAllotted
          ? `Verified by Chainlink VRF (${result.drawSeedFormatted}). Syndicate successfully allotted on-chain!`
          : `Verified by Chainlink VRF (${result.drawSeedFormatted}). Oversubscription draw missed: 100% principal refund escrow unlocked.`,
        type: result.isAllotted ? "success" : "info",
        txHash: result.txHash,
      });
      await refreshBalance();
    } catch (err: any) {
      showToast({
        title: "Chainlink VRF Error",
        description: err?.message || "Failed to trigger VRF allotment draw",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Distribute Listing Gains
  const handleDistributeGains = async () => {
    try {
      setIsProcessing(true);
      const result = await distributeJarListingGains(selectedJar.id, gainAmount);
      showToast({
        title: "Listing Gains Distributed",
        description: `${gainAmount} MST deposited. Investors in ${selectedJar.name} can now claim returns under My Jars!`,
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
          className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-ink-surface border border-hairline rounded-cardLg shadow-2xl p-6 md:p-8 space-y-6 select-none z-10"
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
                  MULTI-IPO LIFECYCLE MANAGEMENT • CHAINLINK VRF v2 ENABLED
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

          {/* Section: Select IPO to Announce & Manage */}
          <div className="p-4 rounded-card bg-ink-elevated/40 border border-cobalt/30 bg-cobalt/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-cobalt" />
                <span className="text-xs font-mono uppercase tracking-wider text-paper font-semibold">
                  SELECT IPO TO ANNOUNCE / MANAGE
                </span>
              </div>
              <span className="text-[10px] font-mono text-paper-dim">
                {jars.length} Offerings Registered
              </span>
            </div>

            {/* Dropdown Selector */}
            <div className="relative">
              <select
                value={selectedJarId}
                onChange={e => setSelectedJarId(e.target.value)}
                className="w-full bg-ink-surface border border-hairline focus:border-cobalt text-paper font-mono text-xs rounded-input p-3 pr-10 outline-none transition-colors appearance-none cursor-pointer"
              >
                {jars.map(jar => (
                  <option key={jar.id} value={jar.id} className="bg-ink-surface text-paper py-1">
                    {jar.id} • {jar.name} ({jar.symbol}) — [{jar.statusLabel}] — {jar.currentMst}/{jar.targetMst} MST ({jar.fundedPercent}%)
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-3.5 pointer-events-none text-paper-muted">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Selection Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              {jars.map(jar => (
                <button
                  key={jar.id}
                  type="button"
                  onClick={() => setSelectedJarId(jar.id)}
                  className={`px-2.5 py-1 rounded-btn text-[11px] font-mono whitespace-nowrap transition-colors border ${
                    selectedJarId === jar.id
                      ? "bg-cobalt text-white border-cobalt font-medium shadow-sm"
                      : "bg-ink-surface hover:bg-ink-elevated text-paper-muted hover:text-paper border-hairline"
                  }`}
                >
                  <span>{jar.symbol}</span>
                  <span className="opacity-60 ml-1">({jar.fundedPercent}%)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active IPO Specifications */}
          <div className="p-4 rounded-card bg-ink-elevated/40 border border-hairline space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-paper-dim">
              <span>ACTIVE IPO SPECIFICATIONS</span>
              <span className="flex items-center gap-1.5 text-accentEmerald">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>{selectedJar.id} • {selectedJar.symbol} ({selectedJar.sector})</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-ink-surface border border-hairline">
                <span className="text-[10px] text-paper-dim block">OFFERING</span>
                <span className="font-bold text-paper truncate block">{selectedJar.name}</span>
                <span className="text-[10px] text-paper-muted">{selectedJar.symbol}</span>
              </div>
              <div className="p-2.5 rounded bg-ink-surface border border-hairline">
                <span className="text-[10px] text-paper-dim block">TARGET SIZE</span>
                <span className="font-bold text-paper block">{formatMST(selectedJar.targetMst)}</span>
                <span className="text-[10px] text-paper-muted">{formatMST(selectedJar.currentMst)} pooled</span>
              </div>
              <div className="p-2.5 rounded bg-ink-surface border border-hairline">
                <span className="text-[10px] text-paper-dim block">FUNDED LEVEL</span>
                <span className="font-bold text-accentEmerald block">{selectedJar.fundedPercent}%</span>
                <span className="text-[10px] text-paper-muted">{selectedJar.investorsCount} investors</span>
              </div>
              <div className="p-2.5 rounded bg-ink-surface border border-hairline">
                <span className="text-[10px] text-paper-dim block">CURRENT PHASE</span>
                <span className="font-bold text-paper block truncate">{selectedJar.statusLabel}</span>
                <span className="text-[10px] text-paper-muted">{selectedJar.closesIn}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-paper-dim border-t border-hairline/50">
              <span>ESCROW / SMART CONTRACT:</span>
              <span className="text-paper">{truncateAddress(selectedJar.contractAddress)}</span>
            </div>
          </div>

          {/* Action Grid: Lifecycle Triggers */}
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-paper-dim block">
              LIFECYCLE TRIGGERS FOR {selectedJar.name.toUpperCase()}
            </span>

            {/* Action 0: Announce IPO Syndicate to Market */}
            <div className="p-4 rounded-card bg-ink-surface border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-cobalt" />
                  <h4 className="text-sm font-bold text-paper font-serif">
                    0. Announce IPO to Market
                  </h4>
                </div>
                <p className="text-xs text-paper-muted max-w-md">
                  Officially opens or re-announces the IPO offering for public fractional bidding on the prospectus ledger.
                </p>
              </div>

              {selectedJar.status === "OPEN" ? (
                <div className="flex items-center gap-1.5 text-xs font-mono text-accentEmerald px-3 py-1.5 rounded bg-accentEmerald/10 border border-accentEmerald/20 flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Offering Live & Open</span>
                </div>
              ) : (
                <button
                  onClick={handleAnnounceIpo}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-btn text-xs font-semibold text-white bg-cobalt hover:bg-cobalt-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5" />}
                  <span>Announce Offering</span>
                </button>
              )}
            </div>

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

              {selectedJar.status === "LOCKED" ? (
                <div className="flex items-center gap-1.5 text-xs font-mono text-accentAmber px-3 py-1.5 rounded bg-accentAmber/10 border border-accentAmber/20 flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lot Locked & Executed</span>
                </div>
              ) : (
                <button
                  onClick={handleExecuteLotPurchase}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-btn text-xs font-semibold text-white bg-cobalt hover:bg-cobalt-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Trigger Purchase</span>
                </button>
              )}
            </div>

            {/* Action 2: Chainlink VRF Decentralized Allotment Draw */}
            <div className="p-4 rounded-card bg-ink-surface border border-cobalt/30 bg-cobalt/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-cobalt/20 flex items-center justify-center text-cobalt">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-paper font-serif">
                    2. Decentralized Allotment Draw (Chainlink VRF)
                  </h4>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-tag bg-cobalt/15 text-cobalt border border-cobalt/30">
                  Provably Unbiased
                </span>
              </div>

              <p className="text-xs text-paper-muted leading-relaxed">
                Requests verifiable cryptographic randomness via <code className="text-cobalt">requestAllotmentDraw()</code> from the Chainlink VRF Coordinator. Guarantees tamper-proof allotment selection for oversubscribed SME IPO syndicates.
              </p>

              {/* VRF Verification Strip if fulfilled */}
              {selectedJar?.vrfAllotment && (
                <div className="p-3 rounded bg-ink-elevated/60 border border-hairline space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-paper-dim">VRF REQUEST:</span>
                    <span className="text-paper font-bold">{selectedJar.vrfAllotment.requestId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-paper-dim">RANDOM SEED (256-BIT):</span>
                    <span className="text-cobalt font-bold truncate max-w-[200px]" title={selectedJar.vrfAllotment.randomSeed}>
                      {selectedJar.vrfAllotment.drawSeedFormatted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-hairline/50">
                    <span className="text-paper-dim">ALLOTMENT OUTCOME:</span>
                    <span className={`font-bold ${selectedJar.vrfAllotment.isAllotted ? "text-accentEmerald" : "text-accentBrick"}`}>
                      {selectedJar.vrfAllotment.isAllotted ? "✓ Allotted via Chainlink VRF" : "✗ Draw Missed (Refund Escrow Open)"}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] font-mono text-paper-dim">
                  COORDINATOR: {truncateAddress(CHAINLINK_VRF_CONFIG.coordinatorAddress)}
                </span>
                <button
                  onClick={handleTriggerVRFAllotment}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-btn text-xs font-semibold text-white bg-cobalt hover:bg-cobalt-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Dices className="w-3.5 h-3.5" />}
                  <span>{selectedJar?.vrfAllotment ? "Re-run VRF Draw" : "Execute VRF Draw"}</span>
                </button>
              </div>
            </div>

            {/* Action 3: Distribute Listing Gains */}
            <div className="p-4 rounded-card bg-ink-surface border border-hairline space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accentEmerald" />
                <h4 className="text-sm font-bold text-paper font-serif">
                  3. Distribute Listing Gains
                </h4>
              </div>
              <p className="text-xs text-paper-muted leading-relaxed">
                Deposits listing day liquidation profits into the contract via <code className="text-accentEmerald">distributeListingGains()</code>, allowing fraction holders of allotted syndicates to withdraw their returns.
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

          {/* Footer Note */}
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
