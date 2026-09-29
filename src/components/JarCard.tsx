"use client";

import React from "react";
import { motion } from "framer-motion";
import { IpoJar } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { JarGauge } from "./JarGauge";
import { formatMST } from "@/lib/formatUtils";
import { ArrowUpRight, Lock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface JarCardProps {
  jar: IpoJar;
  isFeatured?: boolean;
  index?: number;
  onOpenDrawer: (jar: IpoJar) => void;
}

export const JarCard: React.FC<JarCardProps> = ({
  jar,
  isFeatured = false,
  index = 0,
  onOpenDrawer,
}) => {
  const isFundingOpen = jar.status === "OPEN";
  const isLocked = jar.status === "LOCKED";
  const isAllotted = jar.status === "ALLOTTED";
  const isFailed = jar.status === "FAILED";

  // Featured Hero Card (Large Asymmetric Layout)
  if (isFeatured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-ink-surface border border-hairline rounded-cardLg p-6 md:p-8 hover:border-hairline-bright hover:-translate-y-[2px] transition-all duration-200 ease-editorial select-none"
      >
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
          
          {/* Left Column: Details & Ledger */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Top metadata strip */}
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-paper-dim">
                    {jar.id}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cobalt bg-cobalt/10 border border-cobalt/20 px-2 py-0.5 rounded-tag">
                    FEATURED PROSPECTUS
                  </span>
                  <span className="text-[10px] font-mono text-cobalt bg-cobalt/10 border border-cobalt/20 px-2 py-0.5 rounded-tag flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cobalt" />
                    <span>CHAINLINK VRF ALLOTMENT</span>
                  </span>
                </div>
                <StatusBadge status={jar.status} label={jar.statusLabel} />
              </div>

              {/* Company Header */}
              <div className="mt-5">
                <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-paper">
                  {jar.name}
                </h3>
                <span className="text-[11px] font-mono uppercase tracking-widest text-paper-muted block mt-1">
                  SECTOR: {jar.sector} • SYMBOL: {jar.symbol}
                </span>
                <p className="text-sm text-paper-muted mt-3 leading-relaxed max-w-2xl font-sans">
                  {jar.description}
                </p>
              </div>

              {/* Financial Ledger Rows with Dotted Leaders */}
              <div className="mt-6 pt-4 border-t border-hairline/60 space-y-2 max-w-xl">
                <div className="ledger-dotted-leader text-xs py-0.5">
                  <span className="text-paper-muted">Target Lot Price</span>
                  <span className="leader-fill" />
                  <span className="font-mono text-paper font-medium tabular-nums">{formatMST(jar.targetMst)}</span>
                </div>

                <div className="ledger-dotted-leader text-xs py-0.5">
                  <span className="text-paper-muted">Min. Investment</span>
                  <span className="leader-fill" />
                  <span className="font-mono text-paper font-medium tabular-nums">{formatMST(jar.minInvestmentMst)}</span>
                </div>

                <div className="ledger-dotted-leader text-xs py-0.5">
                  <span className="text-paper-muted">Active Participants</span>
                  <span className="leader-fill" />
                  <span className="font-mono text-paper font-medium tabular-nums">{jar.investorsCount} Wallets</span>
                </div>

                <div className="ledger-dotted-leader text-xs py-0.5">
                  <span className="text-paper-muted">Book Closes In</span>
                  <span className="leader-fill" />
                  <span className="font-mono text-accentEmerald font-medium tabular-nums">{jar.closesIn}</span>
                </div>
              </div>
            </div>

            {/* Bottom CTA Row */}
            <div className="mt-8 pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-mono text-paper-dim">
                <span>LEAD: {jar.leadManager}</span>
                <span>•</span>
                <span>BAND: {jar.issuePriceBand}</span>
              </div>

              <button
                onClick={() => onOpenDrawer(jar)}
                className="px-5 py-2.5 rounded-btn text-xs font-semibold tracking-wide text-white bg-cobalt hover:bg-cobalt-hover transition-colors flex items-center gap-2 focus-visible:ring-1 focus-visible:ring-cobalt focus-visible:outline-none"
              >
                <span>Invest Now</span>
                <ArrowUpRight className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Vertical Jar Gauge */}
          <div className="w-full lg:w-64 bg-ink-elevated/60 border border-hairline rounded-card p-5 flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between pb-3 border-b border-hairline/60">
              <span className="text-[10px] font-mono uppercase tracking-widest text-paper-dim">
                POOL LEVEL
              </span>
              <span className="font-mono text-xs font-bold text-accentEmerald tabular-nums">
                {formatMST(jar.currentMst)}
              </span>
            </div>

            <div className="my-2 w-full max-w-[170px]">
              <JarGauge percentage={jar.fundedPercent} status={jar.status} variant="vertical" />
            </div>

            <div className="w-full pt-3 border-t border-hairline/60 text-center">
              <div className="font-mono text-2xl font-bold text-paper tabular-nums tracking-tight">
                {jar.fundedPercent}%
              </div>
              <span className="text-[10px] font-mono uppercase text-paper-dim block mt-0.5">
                Funded of {formatMST(jar.targetMst)}
              </span>
            </div>
          </div>

        </div>
      </motion.div>
    );
  }

  // Standard Asymmetric Grid Card
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="bg-ink-surface border border-hairline rounded-card p-5 hover:border-hairline-bright hover:-translate-y-[2px] transition-all duration-200 ease-editorial flex flex-col justify-between select-none"
    >
      <div>
        {/* Top Row: Lot ID left, Status Badge right */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-paper-dim uppercase tracking-wider">
              {jar.id}
            </span>
            {jar.vrfAllotment && (
              <span className="text-[9px] font-mono text-cobalt bg-cobalt/10 border border-cobalt/20 px-1.5 py-0.5 rounded flex items-center gap-1" title="Chainlink VRF Allotment Verified">
                <Sparkles className="w-2.5 h-2.5" />
                <span>VRF</span>
              </span>
            )}
          </div>
          <StatusBadge status={jar.status} label={jar.statusLabel} />
        </div>

        {/* Company Name & Sector */}
        <div className="mt-4">
          <h4 className="font-serif text-xl font-bold text-paper tracking-tight truncate">
            {jar.name}
          </h4>
          <span className="text-[10px] font-mono uppercase tracking-widest text-paper-muted block mt-0.5">
            {jar.sector} • {jar.symbol}
          </span>
        </div>

        {/* Jar Gauge & Funding percentage */}
        <div className="my-5 p-3 rounded-card bg-ink-elevated/40 border border-hairline/60">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-paper-dim">POOL CAPACITY</span>
            <span className="font-mono text-sm font-bold text-paper tabular-nums">
              {jar.fundedPercent}%
            </span>
          </div>
          <JarGauge percentage={jar.fundedPercent} status={jar.status} variant="compact" />
        </div>

        {/* Data Rows with Dotted Leaders */}
        <div className="space-y-1.5 pt-1 text-xs">
          <div className="ledger-dotted-leader py-0.5">
            <span className="text-paper-muted">Target Lot Price</span>
            <span className="leader-fill" />
            <span className="font-mono text-paper font-medium tabular-nums">{formatMST(jar.targetMst)}</span>
          </div>

          <div className="ledger-dotted-leader py-0.5">
            <span className="text-paper-muted">Min. Investment</span>
            <span className="leader-fill" />
            <span className="font-mono text-paper font-medium tabular-nums">{formatMST(jar.minInvestmentMst)}</span>
          </div>

          <div className="ledger-dotted-leader py-0.5">
            <span className="text-paper-muted">Investors</span>
            <span className="leader-fill" />
            <span className="font-mono text-paper font-medium tabular-nums">{jar.investorsCount}</span>
          </div>

          <div className="ledger-dotted-leader py-0.5">
            <span className="text-paper-muted">Closes In</span>
            <span className="leader-fill" />
            <span className={`font-mono font-medium tabular-nums ${isFundingOpen ? "text-accentEmerald" : "text-paper-dim"}`}>
              {jar.closesIn}
            </span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-6 pt-3 border-t border-hairline">
        {isFundingOpen && (
          <button
            onClick={() => onOpenDrawer(jar)}
            className="w-full py-2 px-3 rounded-btn text-xs font-semibold text-white bg-cobalt hover:bg-cobalt-hover transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-1 focus-visible:ring-cobalt focus-visible:outline-none"
          >
            <span>Invest Now</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        )}

        {isLocked && (
          <button
            onClick={() => onOpenDrawer(jar)}
            className="w-full py-2 px-3 rounded-btn text-xs font-medium text-accentAmber bg-accentAmber/10 border border-accentAmber/20 hover:bg-accentAmber/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Target Reached / Locked</span>
          </button>
        )}

        {isAllotted && (
          <button
            onClick={() => onOpenDrawer(jar)}
            className="w-full py-2 px-3 rounded-btn text-xs font-medium text-accentSteel bg-accentSteel/10 border border-accentSteel/20 hover:bg-accentSteel/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Allotted & Sold ({jar.finalReturnPercent ? `+${jar.finalReturnPercent}%` : "Settled"})</span>
          </button>
        )}

        {isFailed && (
          <button
            onClick={() => onOpenDrawer(jar)}
            className="w-full py-2 px-3 rounded-btn text-xs font-medium text-accentBrick bg-accentBrick/10 border border-accentBrick/20 hover:bg-accentBrick/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Bid Failed / Refunds Open</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
