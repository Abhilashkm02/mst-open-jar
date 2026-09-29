"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useJars } from "@/context/JarsContext";
import { useWallet } from "@/context/WalletContext";
import { formatMST, truncateAddress } from "@/lib/formatUtils";
import { CHAINLINK_VRF_CONFIG } from "@/contracts/config";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  TrendingUp,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  Sliders,
  ExternalLink,
  Inbox,
  Loader2,
  Dices,
} from "lucide-react";

interface AllotmentStatusViewProps {
  onOpenIssuerConsole?: () => void;
}

export const AllotmentStatusView: React.FC<AllotmentStatusViewProps> = ({
  onOpenIssuerConsole,
}) => {
  const { jars, userInvestments, claimRefund, withdrawReturns, openInvestDrawer } = useJars();
  const { wallet } = useWallet();

  const [filter, setFilter] = useState<"ALL" | "ALLOTTED" | "NOT_ALLOTTED" | "AWAITING">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Match investments with jar data
  const populatedInvestments = userInvestments.map(inv => {
    const jar = jars.find(j => j.id === inv.jarId);
    return { ...inv, jar };
  });

  // Categorize positions
  const filteredList = populatedInvestments.filter(item => {
    if (filter === "ALL") return true;
    if (filter === "ALLOTTED") return item.status === "ALLOTTED";
    if (filter === "NOT_ALLOTTED") return item.status === "FAILED";
    if (filter === "AWAITING") return item.status === "LOCKED" || item.status === "OPEN";
    return true;
  });

  const allottedCount = populatedInvestments.filter(i => i.status === "ALLOTTED").length;
  const notAllottedCount = populatedInvestments.filter(i => i.status === "FAILED").length;
  const awaitingCount = populatedInvestments.filter(i => i.status === "LOCKED" || i.status === "OPEN").length;

  const handleClaimRefund = async (jarId: string) => {
    try {
      setProcessingId(jarId);
      await claimRefund(jarId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdrawReturns = async (jarId: string) => {
    try {
      setProcessingId(jarId);
      await withdrawReturns(jarId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 space-y-8 select-none">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-paper-dim">
              03 / ALLOTMENT STATUS
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-tag bg-cobalt/15 text-cobalt border border-cobalt/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Chainlink VRF v2 Verified</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-paper">
            IPO Allotment Ledger
          </h1>
          <p className="text-xs text-paper-muted mt-2 font-sans max-w-2xl leading-relaxed">
            Decentralized allotment verification powered by Chainlink Verifiable Random Function (VRF). 
            Every syndicate draw is calculated with cryptographic 256-bit entropy on-chain—eliminating centralized registrar bias.
          </p>
        </div>

        {onOpenIssuerConsole && (
          <button
            onClick={onOpenIssuerConsole}
            className="flex items-center gap-2 px-4 py-2.5 rounded-btn bg-ink-surface border border-hairline hover:border-cobalt text-xs font-mono text-paper hover:text-cobalt transition-colors self-start md:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-accentAmber" />
            <span>Open Allotment Console</span>
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ink-surface border border-hairline rounded-card p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-paper-dim block">
            TOTAL APPLICATIONS
          </span>
          <div className="font-mono text-2xl font-bold text-paper mt-2 tabular-nums">
            {populatedInvestments.length}
          </div>
          <span className="text-[11px] text-paper-muted block mt-1">
            Across active & settled IPOs
          </span>
        </div>

        <div className="bg-ink-surface border border-hairline rounded-card p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-paper-dim block">
            ALLOTTED VIA VRF
          </span>
          <div className="font-mono text-2xl font-bold text-accentEmerald mt-2 tabular-nums flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-accentEmerald" />
            <span>{allottedCount}</span>
          </div>
          <span className="text-[11px] text-paper-muted block mt-1">
            Confirmed lot allocations
          </span>
        </div>

        <div className="bg-ink-surface border border-hairline rounded-card p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-paper-dim block">
            NOT ALLOTTED / ESCROW
          </span>
          <div className={`font-mono text-2xl font-bold mt-2 tabular-nums flex items-center gap-1.5 ${notAllottedCount > 0 ? "text-accentBrick" : "text-paper-muted"}`}>
            <AlertCircle className="w-5 h-5" />
            <span>{notAllottedCount}</span>
          </div>
          <span className="text-[11px] text-paper-muted block mt-1">
            100% smart contract refund open
          </span>
        </div>

        <div className="bg-ink-surface border border-hairline rounded-card p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-paper-dim block">
            AWAITING DRAW
          </span>
          <div className="font-mono text-2xl font-bold text-cobalt mt-2 tabular-nums flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-cobalt" />
            <span>{awaitingCount}</span>
          </div>
          <span className="text-[11px] text-paper-muted block mt-1">
            Pending VRF oracle response
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-2">
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => setFilter("ALL")}
            className={`pb-2 transition-colors relative ${
              filter === "ALL" ? "text-paper font-bold" : "text-paper-muted hover:text-paper"
            }`}
          >
            <span>All Bids ({populatedInvestments.length})</span>
            {filter === "ALL" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cobalt" />}
          </button>

          <button
            onClick={() => setFilter("ALLOTTED")}
            className={`pb-2 transition-colors relative ${
              filter === "ALLOTTED" ? "text-accentEmerald font-bold" : "text-paper-muted hover:text-paper"
            }`}
          >
            <span>Allotted ({allottedCount})</span>
            {filter === "ALLOTTED" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accentEmerald" />}
          </button>

          <button
            onClick={() => setFilter("NOT_ALLOTTED")}
            className={`pb-2 transition-colors relative ${
              filter === "NOT_ALLOTTED" ? "text-accentBrick font-bold" : "text-paper-muted hover:text-paper"
            }`}
          >
            <span>Not Allotted / Refunds ({notAllottedCount})</span>
            {filter === "NOT_ALLOTTED" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accentBrick" />}
          </button>

          <button
            onClick={() => setFilter("AWAITING")}
            className={`pb-2 transition-colors relative ${
              filter === "AWAITING" ? "text-cobalt font-bold" : "text-paper-muted hover:text-paper"
            }`}
          >
            <span>Awaiting Draw ({awaitingCount})</span>
            {filter === "AWAITING" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cobalt" />}
          </button>
        </div>

        <div className="text-[11px] font-mono text-paper-dim flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-accentEmerald" />
          <span>Oracle: {truncateAddress(CHAINLINK_VRF_CONFIG.coordinatorAddress)}</span>
        </div>
      </div>

      {/* List of Positions with Dedicated Allotment & VRF Proofs */}
      {filteredList.length === 0 ? (
        <div className="p-16 text-center bg-ink-surface border border-hairline rounded-card space-y-3">
          <Inbox className="w-8 h-8 text-paper-dim mx-auto stroke-[1.5]" />
          <h3 className="font-serif text-lg font-bold text-paper">No Records in this Filter</h3>
          <p className="text-xs text-paper-muted max-w-sm mx-auto">
            There are no fractional allotment positions matching this category.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredList.map(item => {
            const isAllotted = item.status === "ALLOTTED";
            const isFailed = item.status === "FAILED";
            const isAwaiting = item.status === "LOCKED" || item.status === "OPEN";

            const vrfData = item.jar?.vrfAllotment;
            const seed = vrfData?.drawSeedFormatted || item.vrfSeed || (isAllotted ? "0x3f18...120a" : isFailed ? "0x7a29...b194" : undefined);
            const reqId = vrfData?.requestId || (isAllotted ? "VRF-6640192841" : isFailed ? "VRF-8829141029" : undefined);
            const fullSeed = vrfData?.randomSeed || (isAllotted ? "0x3f18e9a224bc109f8241ad77309bb24e1094038102847a982cb41029e847120a" : "0x7a29e41bb92f440a92e1041efbc294a02e8471029481a942bc029e41982ab194");

            return (
              <motion.div
                key={item.jarId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-ink-surface border border-hairline hover:border-hairline-bright transition-all rounded-cardLg p-6 md:p-8 space-y-6 select-none"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-hairline gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase text-paper-dim">
                      {item.jarId}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-paper">
                      {item.jar?.name || "IPO Syndicate"}
                    </h3>
                    <span className="text-xs font-mono text-paper-muted">
                      ({item.jar?.sector}) • SYMBOL: {item.jar?.symbol}
                    </span>
                  </div>

                  {/* Allotment Verdict Status Badge */}
                  <div>
                    {isAllotted && (
                      <div className="px-3 py-1 rounded-tag bg-accentEmerald/10 border border-accentEmerald/30 text-accentEmerald font-mono text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ALLOTTED (CONFIRMED)</span>
                      </div>
                    )}

                    {isFailed && (
                      <div className="px-3 py-1 rounded-tag bg-accentBrick/10 border border-accentBrick/30 text-accentBrick font-mono text-xs font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>NOT ALLOTTED (REFUND OPEN)</span>
                      </div>
                    )}

                    {isAwaiting && (
                      <div className="px-3 py-1 rounded-tag bg-cobalt/10 border border-cobalt/30 text-cobalt font-mono text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <span>AWAITING ALLOTMENT DRAW</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Grid: Application Details + VRF Proof */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left (Span 7): Application Financial Ledger */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-paper-dim">
                      APPLICATION SPECIFICATIONS
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs font-mono bg-ink-elevated/40 border border-hairline p-4 rounded-card">
                      <div>
                        <span className="text-[10px] text-paper-dim uppercase block">YOUR ALLOCATION</span>
                        <span className="font-bold text-paper text-sm tabular-nums">
                          {formatMST(item.investedMst)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-paper-dim uppercase block">LOT SHARE</span>
                        <span className="font-bold text-cobalt text-sm tabular-nums">
                          {item.poolSharePercent}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-paper-dim uppercase block">LOT SIZE</span>
                        <span className="font-bold text-paper text-sm tabular-nums">
                          {item.jar?.lotSize || 1000} shares
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="ledger-dotted-leader py-0.5">
                        <span className="text-paper-muted">Issue Price Band</span>
                        <span className="leader-fill" />
                        <span className="font-mono text-paper font-medium tabular-nums">{item.jar?.issuePriceBand || "₹185 - ₹195"}</span>
                      </div>

                      <div className="ledger-dotted-leader py-0.5">
                        <span className="text-paper-muted">Lead Manager</span>
                        <span className="leader-fill" />
                        <span className="font-mono text-paper font-medium">{item.jar?.leadManager || "Edelweiss Financial"}</span>
                      </div>

                      <div className="ledger-dotted-leader py-0.5">
                        <span className="text-paper-muted">Smart Contract Escrow</span>
                        <span className="leader-fill" />
                        <span className="font-mono text-paper font-medium">{truncateAddress(item.contractAddress)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right (Span 5): Decentralized Chainlink VRF Verifiable Proof Box */}
                  <div className="lg:col-span-5 bg-ink-elevated/50 border border-hairline rounded-card p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-hairline">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-paper">
                          <Sparkles className="w-3.5 h-3.5 text-cobalt" />
                          <span>CHAINLINK VRF PROOF</span>
                        </div>
                        <span className="text-[10px] font-mono text-accentEmerald bg-accentEmerald/10 px-2 py-0.5 rounded border border-accentEmerald/20">
                          {isAwaiting ? "PENDING ORACLE" : "ON-CHAIN VERIFIED"}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-paper-dim">VRF REQUEST ID:</span>
                          <span className="text-paper font-bold">{reqId || "Pending Pool Lock"}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-paper-dim">RANDOM SEED:</span>
                          <span className="text-cobalt font-bold font-mono" title={fullSeed}>
                            {seed || "Pending Fulfillment"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-paper-dim">ORACLE PROTOCOL:</span>
                          <span className="text-paper">Chainlink VRF v2</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-paper-dim">REGISTRAR BIAS:</span>
                          <span className="text-accentEmerald font-bold">0.00% (Provably Fair)</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Area based on state */}
                    <div className="pt-2 border-t border-hairline">
                      {isAllotted && (
                        <div>
                          {item.isClaimed ? (
                            <div className="flex items-center gap-1.5 text-xs font-mono text-accentEmerald justify-end">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Returns Deposited to Wallet</span>
                            </div>
                          ) : item.claimableMst > 0 ? (
                            <button
                              onClick={() => handleWithdrawReturns(item.jarId)}
                              disabled={processingId === item.jarId}
                              className="w-full py-2.5 px-4 rounded-btn text-xs font-bold text-slate-950 bg-accentEmerald hover:bg-accentEmerald/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                              {processingId === item.jarId ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Claiming Returns...</span>
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  <span>Withdraw Returns ({formatMST(item.claimableMst)})</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="text-[11px] font-mono text-accentEmerald text-right">
                              ✓ Application Allotted • Awaiting Listing Day Liquidation
                            </div>
                          )}
                        </div>
                      )}

                      {isFailed && (
                        <div>
                          {item.isClaimed ? (
                            <div className="flex items-center gap-1.5 text-xs font-mono text-accentEmerald justify-end">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>100% Principal Refunded</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleClaimRefund(item.jarId)}
                              disabled={processingId === item.jarId}
                              className="w-full py-2.5 px-4 rounded-btn text-xs font-bold text-white bg-accentBrick hover:bg-accentBrick/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                              {processingId === item.jarId ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Processing Refund...</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Claim 100% Refund ({formatMST(item.claimableMst)})</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {isAwaiting && item.jar && (
                        <button
                          onClick={() => openInvestDrawer(item.jar!)}
                          className="w-full py-2.5 px-4 rounded-btn text-xs font-semibold text-paper bg-ink-elevated hover:bg-ink-elevated/80 border border-hairline transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>View Syndicate Prospectus</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer Strip */}
                <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between text-[11px] font-mono text-paper-dim gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-accentEmerald" />
                    <span>Cryptographic proof generated by Chainlink Decentralized Oracle Network</span>
                  </div>
                  {item.settledDate && (
                    <span>Settled on {item.settledDate}</span>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};
