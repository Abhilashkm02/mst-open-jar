"use client";

import React, { useState } from "react";
import { UserInvestment, IpoJar } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { formatMST, truncateAddress } from "@/lib/formatUtils";
import {
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface SettlementCardProps {
  investment: UserInvestment;
  jar?: IpoJar;
  onClaimRefund: (jarId: string) => Promise<unknown>;
  onWithdrawReturns: (jarId: string) => Promise<unknown>;
}

export const SettlementCard: React.FC<SettlementCardProps> = ({
  investment,
  jar,
  onClaimRefund,
  onWithdrawReturns,
}) => {
  const isFailed = investment.status === "FAILED";
  const isAllotted = investment.status === "ALLOTTED";
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRefund = async () => {
    try {
      setIsProcessing(true);
      await onClaimRefund(investment.jarId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsProcessing(true);
      await onWithdrawReturns(investment.jarId);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-ink-surface border border-hairline rounded-card p-6 md:p-8 space-y-6 select-none">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-hairline gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase text-paper-dim">{investment.jarId}</span>
          <h3 className="font-serif text-2xl font-bold text-paper">
            {jar?.name}
          </h3>
          <span className="text-xs font-mono text-paper-muted">
            ({jar?.sector})
          </span>
        </div>

        <StatusBadge status={investment.status} label={jar?.statusLabel} />
      </div>

      {/* State A: IPO Not Allotted (Refund Open) */}
      {isFailed && (
        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-accentBrick flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-paper">
                  Funds are returned in full by the smart contract.
                </p>
                <p className="text-xs text-paper-muted mt-1 leading-relaxed">
                  {jar?.failureReason ||
                    "Exchange allotment draw was not allocated due to oversubscription. Your allocated principal is available for withdrawal with zero fees."}
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-mono text-paper-dim flex items-center gap-2">
              <span>Original Allocation: {formatMST(investment.investedMst)}</span>
              <span>•</span>
              <span>Lot Share: {investment.poolSharePercent}%</span>
            </div>
          </div>

          <div className="md:col-span-4 bg-ink-elevated/40 border border-hairline rounded-card p-4 flex flex-col items-end justify-between space-y-3">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-paper-dim block">
                REFUNDABLE AMOUNT
              </span>
              <span className="font-mono text-xl font-bold text-accentBrick tabular-nums">
                {formatMST(investment.claimableMst)}
              </span>
            </div>

            {investment.isClaimed ? (
              <div className="flex items-center gap-1.5 text-xs font-mono text-accentEmerald">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Refunded to Wallet</span>
              </div>
            ) : (
              <button
                onClick={handleRefund}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-btn text-xs font-bold text-white bg-accentBrick hover:bg-accentBrick/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Refund...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Claim Refund</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* State B: IPO Allotted and Sold (+18.4% Return) */}
      {isAllotted && (
        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-accentEmerald flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-paper">
                  IPO Syndicate Bid Successful & Liquidated.
                </p>
                <p className="text-xs text-paper-muted mt-1 leading-relaxed">
                  The full SME lot was successfully allotted on exchange and liquidated on listing day with positive gains. Your proportional return includes your principal plus net profit.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-[10px] text-paper-dim uppercase block">ORIGINAL</span>
                <span className="text-paper tabular-nums">{formatMST(investment.investedMst)}</span>
              </div>
              <div>
                <span className="text-[10px] text-paper-dim uppercase block">LISTING GAIN</span>
                <span className="text-accentEmerald font-bold tabular-nums">
                  +{jar?.finalReturnPercent || 18.4}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-paper-dim uppercase block">NET PROFIT</span>
                <span className="text-accentEmerald font-bold tabular-nums">
                  +{formatMST(investment.realizedProfitMst)}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-ink-elevated/40 border border-hairline rounded-card p-4 flex flex-col items-end justify-between space-y-3">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-paper-dim block">
                TOTAL PROPORTIONAL PAYOUT
              </span>
              <span className="font-mono text-xl font-bold text-accentEmerald tabular-nums">
                {formatMST(investment.claimableMst)}
              </span>
            </div>

            {investment.isClaimed ? (
              <div className="flex items-center gap-1.5 text-xs font-mono text-accentEmerald">
                <CheckCircle2 className="w-4 h-4" />
                <span>Returns Deposited to Wallet</span>
              </div>
            ) : (
              <button
                onClick={handleWithdraw}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-btn text-xs font-bold text-slate-950 bg-accentEmerald hover:bg-accentEmerald/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Broadcasting Claim...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Withdraw Returns</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Verified by Smart Contract & Chainlink VRF Hairline Strip */}
      <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between text-[11px] font-mono text-paper-dim gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-accentEmerald" />
            <span>Smart Contract: {truncateAddress(investment.contractAddress)}</span>
          </div>

          {(jar?.vrfAllotment || investment.isVrfVerified) && (
            <div className="flex items-center gap-1.5 text-cobalt bg-cobalt/10 px-2 py-0.5 rounded border border-cobalt/20" title={`Chainlink VRF Random Seed: ${jar?.vrfAllotment?.randomSeed || investment.vrfSeed}`}>
              <Sparkles className="w-3 h-3" />
              <span>Chainlink VRF: {jar?.vrfAllotment?.drawSeedFormatted || investment.vrfSeed || "0x7a29...b194"}</span>
            </div>
          )}
        </div>

        {investment.settledDate && (
          <span>Settled on {investment.settledDate}</span>
        )}
      </div>
    </div>
  );
};
