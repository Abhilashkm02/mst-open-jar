"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IpoJar } from "@/types";
import { JarGauge } from "./JarGauge";
import { StatusBadge } from "./StatusBadge";
import { AmountInput } from "./AmountInput";
import { useWallet } from "@/context/WalletContext";
import { useJars } from "@/context/JarsContext";
import { useToast } from "@/context/ToastContext";
import { formatMST, formatIndianNumber, truncateAddress } from "@/lib/formatUtils";
import { X, Lock, Check, Loader2, Copy, ShieldCheck, ArrowRight } from "lucide-react";

interface InvestDrawerProps {
  jar: IpoJar | null;
  onClose: () => void;
}

type TxStep = "IDLE" | "SIGNING" | "BROADCASTING" | "CONFIRMING" | "SUCCESS";

export const InvestDrawer: React.FC<InvestDrawerProps> = ({ jar, onClose }) => {
  const { wallet, connectWallet } = useWallet();
  const { investInJar } = useJars();
  const { showToast } = useToast();

  const [amount, setAmount] = useState<number | "">("");
  const [txStep, setTxStep] = useState<TxStep>("IDLE");
  const [txHash, setTxHash] = useState<string>("");
  const [copiedHash, setCopiedHash] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const lastJarIdRef = useRef<string | null>(null);

  // Reset state ONLY when switching to a different jar ID
  useEffect(() => {
    if (jar) {
      if (jar.id !== lastJarIdRef.current) {
        lastJarIdRef.current = jar.id;
        setAmount(jar.minInvestmentMst);
        setTxStep("IDLE");
        setTxHash("");
      }
    } else {
      lastJarIdRef.current = null;
      setTxStep("IDLE");
      setTxHash("");
    }
  }, [jar]);

  // Esc key listener for accessible dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!jar) return null;

  const remainingCapacity = Math.max(0, jar.targetMst - jar.currentMst);
  const isLocked = jar.status === "LOCKED" || remainingCapacity <= 0;
  const numAmount = typeof amount === "number" ? amount : 0;

  // Validation
  let validationError = "";
  if (!wallet.isConnected) {
    // No error, will show connect CTA
  } else if (numAmount <= 0) {
    validationError = "Enter an investment amount";
  } else if (numAmount < jar.minInvestmentMst) {
    validationError = `Minimum investment is ${formatMST(jar.minInvestmentMst)}`;
  } else if (numAmount > wallet.balance) {
    validationError = `Insufficient balance (${formatMST(wallet.balance)} available)`;
  } else if (numAmount > remainingCapacity) {
    validationError = `Amount exceeds remaining capacity (${formatMST(remainingCapacity)})`;
  }

  const isFormValid = !isLocked && wallet.isConnected && validationError === "" && numAmount > 0;

  // Additional preview calculation
  const additionalPercent = jar.targetMst > 0 && numAmount > 0
    ? Number(((numAmount / jar.targetMst) * 100).toFixed(1))
    : 0;

  const calculatedShare = jar.targetMst > 0 && numAmount > 0
    ? ((numAmount / jar.targetMst) * 100).toFixed(2)
    : "0.00";

  const newPoolPercent = Math.min(100, jar.fundedPercent + additionalPercent);

  // Handle Investment Flow immediately without artificial delay
  const handleInvest = async () => {
    if (!wallet.isConnected) {
      connectWallet();
      return;
    }
    if (!isFormValid) return;

    try {
      setTxStep("SIGNING");
      // Trigger execution immediately so wallet prompt opens without delay
      const investPromise = investInJar(jar.id, numAmount);

      await new Promise(r => setTimeout(r, 350));
      setTxStep("BROADCASTING");

      const result = await investPromise;

      setTxStep("CONFIRMING");
      await new Promise(r => setTimeout(r, 350));

      setTxHash(result.txHash);
      setTxStep("SUCCESS");

      showToast({
        title: "Investment Confirmed",
        description: `Successfully allocated ${formatMST(numAmount)} to ${jar.name}.`,
        type: "success",
        txHash: result.txHash,
      });
    } catch (err: unknown) {
      setTxStep("IDLE");
      const message = err instanceof Error ? err.message : "Transaction failed";
      showToast({
        title: "Transaction Error",
        description: message,
        type: "error",
      });
    }
  };

  const handleCopyHash = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop (Hairline Dark Ink) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/80"
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 md:pl-10">
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-screen max-w-4xl bg-ink-surface border-l border-hairline shadow-2xl flex flex-col justify-between overflow-y-auto select-none"
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-hairline flex items-center justify-between sticky top-0 bg-ink-surface/95 z-20">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-paper-dim uppercase tracking-wider">
                  PROSPECTUS / {jar.id}
                </span>
                <StatusBadge status={jar.status} label={jar.statusLabel} />
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-btn text-paper-muted hover:text-paper hover:bg-ink-elevated transition-colors"
                aria-label="Close prospectus drawer"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Two-Column Drawer Body */}
            <div className="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (Span 6): Company Prospectus & Large Jar Gauge */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-paper">
                    {jar.name}
                  </h2>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-paper-muted mt-1">
                    SECTOR: {jar.sector} • SYMBOL: {jar.symbol}
                  </div>

                  <p className="text-xs text-paper-muted leading-relaxed mt-4 font-sans">
                    {jar.description}
                  </p>

                  {/* Large Vertical Jar Gauge with Preview Layer */}
                  <div className="my-6 p-4 rounded-card bg-ink-elevated/40 border border-hairline flex flex-col items-center">
                    <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-hairline/60">
                      <span className="text-[10px] font-mono uppercase text-paper-dim">POOL HORIZON</span>
                      <span className="text-xs font-mono font-bold text-accentEmerald tabular-nums">
                        {formatMST(jar.currentMst)} / {formatMST(jar.targetMst)}
                      </span>
                    </div>

                    <div className="w-full max-w-[200px]">
                      <JarGauge
                        percentage={jar.fundedPercent}
                        additionalPercentage={additionalPercent}
                        status={jar.status}
                        variant="vertical"
                      />
                    </div>

                    {additionalPercent > 0 && !isLocked && (
                      <div className="mt-3 text-[11px] font-mono text-paper-dim">
                        Current: <span className="text-paper">{jar.fundedPercent}%</span> + Your share:{" "}
                        <span className="text-accentEmerald">+{additionalPercent}%</span> ={" "}
                        <span className="text-white font-bold">{newPoolPercent}%</span>
                      </div>
                    )}
                  </div>

                  {/* Key Terms Prospectus Ledger */}
                  <div className="space-y-1.5 text-xs border-t border-hairline pt-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-paper-dim mb-2">
                      LEGAL & ISSUE TERMS
                    </div>

                    <div className="ledger-dotted-leader py-0.5">
                      <span className="text-paper-muted">Issue Price Band</span>
                      <span className="leader-fill" />
                      <span className="font-mono text-paper font-medium tabular-nums">{jar.issuePriceBand}</span>
                    </div>

                    <div className="ledger-dotted-leader py-0.5">
                      <span className="text-paper-muted">Exchange Lot Size</span>
                      <span className="leader-fill" />
                      <span className="font-mono text-paper font-medium tabular-nums">{formatIndianNumber(jar.lotSize)} Shares</span>
                    </div>

                    <div className="ledger-dotted-leader py-0.5">
                      <span className="text-paper-muted">Retail Reservation</span>
                      <span className="leader-fill" />
                      <span className="font-mono text-paper font-medium">{jar.retailReservation}</span>
                    </div>

                    <div className="ledger-dotted-leader py-0.5">
                      <span className="text-paper-muted">Lead Manager</span>
                      <span className="leader-fill" />
                      <span className="font-mono text-paper font-medium">{jar.leadManager}</span>
                    </div>

                    <div className="ledger-dotted-leader py-0.5">
                      <span className="text-paper-muted">Contract Escrow</span>
                      <span className="leader-fill" />
                      <span className="font-mono text-paper font-medium">{truncateAddress(jar.contractAddress)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-paper-dim flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-accentEmerald" />
                  <span>Verified by MST Blockchain Smart Contract</span>
                </div>
              </div>

              {/* Right Column (Span 6): Investment Action Panel */}
              <div className="lg:col-span-6 flex flex-col justify-between bg-ink-elevated/40 border border-hairline rounded-card p-6">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-paper-dim pb-3 border-b border-hairline flex items-center justify-between">
                    <span>ALLOCATION PANEL</span>
                    <span className="text-paper-muted">BALANCE: {formatMST(wallet.balance)}</span>
                  </div>

                  {/* Success State takes precedence even if jar became 100% locked */}
                  {txStep === "SUCCESS" ? (
                    /* Transaction Success Block */
                    <div className="my-6 p-6 rounded-card bg-ink-surface border border-accentEmerald/30 space-y-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-accentEmerald/10 border border-accentEmerald/30 flex items-center justify-center text-accentEmerald mx-auto">
                        <Check className="w-6 h-6 stroke-[2]" />
                      </div>

                      <h4 className="font-serif text-xl font-bold text-paper">
                        Allocation Confirmed
                      </h4>

                      <p className="text-xs text-paper-muted leading-relaxed">
                        Your micro-investment of <strong className="text-paper">{formatMST(numAmount)}</strong> is held in non-custodial smart contract escrow.
                      </p>

                      {/* Transaction Receipt Box */}
                      <div className="p-3 bg-ink-elevated rounded-card border border-hairline text-left space-y-1.5">
                        <div className="text-[10px] font-mono uppercase text-paper-dim">TRANSACTION RECEIPT</div>
                        <div className="flex items-center justify-between text-xs font-mono text-paper">
                          <span className="truncate max-w-[200px]">{txHash}</span>
                          <button
                            onClick={handleCopyHash}
                            className="p-1 text-paper-muted hover:text-paper"
                            title="Copy Transaction Hash"
                          >
                            {copiedHash ? <Check className="w-3.5 h-3.5 text-accentEmerald" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTxStep("IDLE");
                          setAmount(jar.minInvestmentMst);
                        }}
                        className="text-xs font-mono text-cobalt hover:underline block mx-auto"
                      >
                        Make another allocation
                      </button>
                    </div>
                  ) : isLocked ? (
                    <div className="my-8 p-6 rounded-card bg-ink-surface border border-accentAmber/30 flex flex-col items-center text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-accentAmber/10 border border-accentAmber/30 flex items-center justify-center text-accentAmber">
                        <Lock className="w-5 h-5 stroke-[1.5]" />
                      </div>
                      <h4 className="font-serif text-lg font-bold text-paper">
                        Pool Locked
                      </h4>
                      <p className="text-xs text-paper-muted max-w-sm leading-relaxed">
                        This SME IPO jar has reached 100% target capacity. The lot bid is locked on-chain awaiting official exchange allotment results on{" "}
                        <strong className="text-paper">{jar.allotmentDate}</strong>.
                      </p>
                    </div>
                  ) : (
                    /* Active Investment Form */
                    <div className="mt-5 space-y-5">
                      <div>
                        <label className="block text-xs font-mono uppercase text-paper-muted mb-2">
                          Enter Investment Amount (MST)
                        </label>
                        <AmountInput
                          value={amount}
                          onChange={setAmount}
                          minAmount={jar.minInvestmentMst}
                          maxAmount={jar.targetMst}
                          remainingCapacity={remainingCapacity}
                          userBalance={wallet.balance}
                          disabled={txStep !== "IDLE"}
                        />

                        {/* Inline Validation Error */}
                        {wallet.isConnected && validationError !== "" && (
                          <p className="text-xs font-mono text-accentBrick mt-2">
                            {validationError}
                          </p>
                        )}
                      </div>

                      {/* Live Calculation Card */}
                      <div className="p-4 rounded-card bg-ink-surface border border-hairline space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-paper-muted">Your IPO Lot Share:</span>
                          <span className="font-mono font-bold text-cobalt tabular-nums">
                            {calculatedShare}% of Full Lot
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-paper-muted">Remaining Jar Capacity:</span>
                          <span className="font-mono text-paper tabular-nums">
                            {formatMST(remainingCapacity)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-hairline/60">
                          <span className="text-paper-muted">Allotment Draw Date:</span>
                          <span className="font-mono text-accentEmerald">{jar.allotmentDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom CTA Block */}
                <div className="mt-8 pt-4 border-t border-hairline space-y-3">
                  {txStep === "SUCCESS" ? (
                    <button
                      onClick={onClose}
                      className="w-full py-3 px-4 rounded-btn text-xs font-semibold text-paper bg-ink-surface border border-hairline hover:bg-ink-elevated transition-colors"
                    >
                      Close Prospectus
                    </button>
                  ) : !wallet.isConnected ? (
                    <button
                      onClick={() => connectWallet(false)}
                      className="w-full py-3 px-4 rounded-btn text-xs font-bold uppercase tracking-wider text-white bg-cobalt hover:bg-cobalt-hover transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Connect Wallet to Invest</span>
                      <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  ) : isLocked ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-btn text-xs font-medium text-paper-dim bg-ink-surface border border-hairline cursor-not-allowed"
                    >
                      Bidding Closed for this Lot
                    </button>
                  ) : (
                    <button
                      onClick={handleInvest}
                      disabled={!isFormValid || txStep !== "IDLE"}
                      className="w-full py-3 px-4 rounded-btn text-xs font-bold uppercase tracking-wider text-white bg-cobalt hover:bg-cobalt-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {txStep === "IDLE" && (
                        <span>Sign & Invest with Bridgekey</span>
                      )}
                      {txStep === "SIGNING" && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Awaiting signature...</span>
                        </>
                      )}
                      {txStep === "BROADCASTING" && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-accentAmber" />
                          <span>Broadcasting to MST...</span>
                        </>
                      )}
                      {txStep === "CONFIRMING" && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-accentEmerald" />
                          <span>Confirming block...</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Discreet Risk Disclosure */}
                  <p className="text-[10px] text-paper-dim leading-relaxed text-center font-sans">
                    Risk Disclosure: IPO investments are subject to market risks. If the syndicate bid is not allotted, 100% of principal is refunded without fee deductions.
                  </p>
                </div>

              </div>

            </div>

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
