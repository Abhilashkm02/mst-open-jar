"use client";

import React from "react";
import { useJars } from "@/context/JarsContext";
import { formatMST } from "@/lib/formatUtils";
import { PortfolioRow } from "./PortfolioRow";
import { SettlementCard } from "./SettlementCard";
import { TrendingUp, Inbox } from "lucide-react";

export const MyJarsView: React.FC = () => {
  const { jars, userInvestments, claimRefund, withdrawReturns, openInvestDrawer } = useJars();

  const [activeTab, setActiveTab] = React.useState<"ACTIVE" | "SETTLED">("ACTIVE");

  // Match investments with jar data
  const populatedInvestments = userInvestments.map(inv => {
    const jar = jars.find(j => j.id === inv.jarId);
    return { ...inv, jar };
  });

  const activeRows = populatedInvestments.filter(
    i => i.status === "OPEN" || i.status === "LOCKED"
  );

  const settledRows = populatedInvestments.filter(
    i => i.status === "FAILED" || i.status === "ALLOTTED"
  );

  // Compute Summary Metrics
  const totalInvested = userInvestments.reduce((sum, i) => sum + i.investedMst, 0);
  const realizedProfit = userInvestments.reduce((sum, i) => sum + (i.realizedProfitMst || 0), 0);

  const refundableTotal = userInvestments
    .filter(i => i.status === "FAILED" && !i.isClaimed)
    .reduce((sum, i) => sum + i.claimableMst, 0);

  const activeValue = activeRows.reduce((sum, i) => sum + i.investedMst, 0);
  const settledUnclaimedValue = userInvestments
    .filter(i => !i.isClaimed && (i.status === "ALLOTTED" || i.status === "FAILED"))
    .reduce((sum, i) => sum + i.claimableMst, 0);
  const currentValue = activeValue + settledUnclaimedValue;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 space-y-10 select-none">
      
      {/* Page Header */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-paper-dim block mb-1">
          02 / PORTFOLIO & SETTLEMENT
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-paper">
          Ledger Positions
        </h1>
        <p className="text-xs text-paper-muted mt-2 font-sans max-w-xl">
          Track fractional allocations, allotment draws, smart contract refund escrows, and listing day liquidation proceeds.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ink-surface border border-hairline rounded-card p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-paper-dim block">
            TOTAL COMMITTED
          </span>
          <div className="font-mono text-2xl font-bold text-paper mt-2 tabular-nums">
            {formatMST(totalInvested)}
          </div>
          <span className="text-[11px] text-paper-muted block mt-1">
            Across {userInvestments.length} allocations
          </span>
        </div>

        <div className="bg-ink-surface border border-hairline rounded-card p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-paper-dim block">
            CURRENT LEDGER VALUE
          </span>
          <div className="font-mono text-2xl font-bold text-paper mt-2 tabular-nums">
            {formatMST(currentValue)}
          </div>
          <span className="text-[11px] text-paper-muted block mt-1">
            Active pool equity + claims
          </span>
        </div>

        <div className="bg-ink-surface border border-hairline rounded-card p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-paper-dim block">
            REALIZED NET P/L
          </span>
          <div className="font-mono text-2xl font-bold text-accentEmerald mt-2 tabular-nums flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
            <span>+{formatMST(realizedProfit)}</span>
          </div>
          <span className="text-[11px] text-paper-muted block mt-1">
            +18.4% on settled positions
          </span>
        </div>

        <div className="bg-ink-surface border border-hairline rounded-card p-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-paper-dim block">
            REFUNDABLE ESCROW
          </span>
          <div className={`font-mono text-2xl font-bold mt-2 tabular-nums ${refundableTotal > 0 ? "text-accentBrick" : "text-paper-muted"}`}>
            {formatMST(refundableTotal)}
          </div>
          <span className="text-[11px] text-paper-muted block mt-1">
            100% principal guaranteed
          </span>
        </div>
      </div>

      {/* Tabs: Active / Settled */}
      <div className="border-b border-hairline flex items-center gap-6">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider transition-colors relative ${
            activeTab === "ACTIVE" ? "text-paper font-bold" : "text-paper-muted hover:text-paper"
          }`}
        >
          <span>Active Jars ({activeRows.length})</span>
          {activeTab === "ACTIVE" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cobalt" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("SETTLED")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider transition-colors relative ${
            activeTab === "SETTLED" ? "text-paper font-bold" : "text-paper-muted hover:text-paper"
          }`}
        >
          <span>Settled Jars ({settledRows.length})</span>
          {activeTab === "SETTLED" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cobalt" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "ACTIVE" ? (
        <div className="space-y-4">
          {activeRows.length === 0 ? (
            <div className="p-12 text-center bg-ink-surface border border-hairline rounded-card space-y-3">
              <Inbox className="w-8 h-8 text-paper-dim mx-auto stroke-[1.5]" />
              <h3 className="font-serif text-lg font-bold text-paper">No Active Positions</h3>
              <p className="text-xs text-paper-muted max-w-sm mx-auto">
                You do not have any open allocations. Browse active SME IPO jars to pool micro-tickets starting from 10 MST.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRows.map(row => (
                <PortfolioRow
                  key={row.jarId}
                  investment={row}
                  jar={row.jar}
                  onOpenDrawer={openInvestDrawer}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {settledRows.map(row => (
            <SettlementCard
              key={row.jarId}
              investment={row}
              jar={row.jar}
              onClaimRefund={claimRefund}
              onWithdrawReturns={withdrawReturns}
            />
          ))}
        </div>
      )}

    </div>
  );
};
