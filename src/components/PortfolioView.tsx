'use client';

import React, { useState } from 'react';
import { useIpo } from '@/context/IpoContext';
import { useWallet } from '@/context/WalletContext';
import { 
  Briefcase, 
  TrendingUp, 
  Coins, 
  RotateCcw, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lock,
  Wallet,
  Sparkles,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { truncateAddress } from '@/utils/formatters';

interface PortfolioViewProps {
  onExploreJars: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onExploreJars }) => {
  const { userPositions, claimRefund, claimReturns, jars } = useIpo();
  const { isConnected, connectWallet, address } = useWallet();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Totals
  const totalFractionsCount = userPositions.reduce((acc, p) => acc + p.fractionsOwned, 0);

  const handleClaimRefund = async (jarId: string) => {
    setProcessingId(jarId);
    try {
      await claimRefund(jarId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleClaimReturns = async (jarId: string) => {
    setProcessingId(jarId);
    try {
      await claimReturns(jarId);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="py-20 text-center rounded-3xl bg-[#090D18] border border-slate-800 p-8 max-w-xl mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center mx-auto mb-4 text-brand-cyan">
          <Wallet className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Connect Bridgekey Wallet</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Connect your Web3 or Bridgekey wallet to view your active open jar positions, verify SME allotment statuses, and claim proportional returns or instant refunds.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => connectWallet(false)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-cyan to-brand-emerald text-black shadow-glow-cyan hover:opacity-95 transition-all"
          >
            Connect Bridgekey Wallet
          </button>
          <button
            onClick={() => connectWallet(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Load Demo Portfolio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Portfolio Header & KPIs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-brand-cyan" />
            <span>My SME IPO Portfolio</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your open jar fractions, smart contract allotment outcomes, and settle returns.
          </p>
        </div>

        <button
          onClick={onExploreJars}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-black border border-brand-cyan/30 transition-all flex items-center space-x-1.5"
        >
          <span>Explore Open Jars</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Portfolio KPI Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Active Jar Positions</span>
          <p className="text-2xl font-black text-white font-mono mt-1">
            {userPositions.length}
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Total {totalFractionsCount} Fractions Owned
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Total Capital Committed</span>
          <p className="text-2xl font-black text-brand-cyan font-mono mt-1">
            {userPositions.reduce((acc, p) => acc + parseFloat(p.investedMst.replace(/[^\d.]/g, '') || '0'), 0).toLocaleString()} <span className="text-xs text-slate-400">MST</span>
          </p>
          <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            Non-custodial escrow
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Claimable Returns (Gains)</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {userPositions
              .filter((p) => p.isAllotted && !p.hasClaimed)
              .reduce((acc, p) => acc + parseFloat(p.claimableReturns.replace(/[^\d.]/g, '') || '0'), 0).toLocaleString()} <span className="text-xs text-slate-400">MST</span>
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            From allotted listing payouts
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-medium">Pending Allotments</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            {userPositions.filter((p) => p.status === 'TARGET_REACHED' || p.status === 'FUNDING_OPEN').length}
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Awaiting registrar draw
          </p>
        </div>
      </div>

      {/* Positions List */}
      {userPositions.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#090D18]/60 border border-slate-800 p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Coins className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No active jar positions yet</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            You haven't pooled into any SME IPO jars yet. Browse the open market jars to start acquiring high-growth SME fractions with minimal MST tokens.
          </p>
          <button
            onClick={onExploreJars}
            className="mt-5 px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-cyan text-black hover:bg-cyan-300 transition-colors shadow-glow-cyan"
          >
            Browse Open Jars
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Active Holdings & Allotment Outcomes
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {userPositions.map((pos) => {
              const jar = jars.find((j) => j.id === pos.jarId);
              const isProcessing = processingId === pos.jarId;

              return (
                <div
                  key={pos.jarId}
                  className="p-5 sm:p-6 rounded-2xl bg-[#0C111E] border border-slate-800 hover:border-slate-700/80 transition-all shadow-lg flex flex-col gap-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Info */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                      {jar?.logo || '📈'}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-white text-base sm:text-lg">
                          {pos.companyName}
                        </h4>
                        <span className="text-xs font-mono font-bold text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">
                          {pos.symbol}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                        <span>Fractions: <strong className="text-white">{pos.fractionsOwned}</strong></span>
                        <span>Lot Share: <strong className="text-brand-cyan">{pos.sharePercentage}</strong></span>
                        <span>Invested: <strong className="text-white">{pos.investedMst}</strong></span>
                        {pos.isLiveContract && (
                          <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                            Live Contract
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Status & Outcome details */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8 px-4 py-3 rounded-xl bg-[#090D18] border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Pool Status
                      </span>
                      <div className="mt-0.5">
                        {pos.status === 'FUNDING_OPEN' ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                            Pool Gathering
                          </span>
                        ) : pos.status === 'TARGET_REACHED' ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-400">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked • Allotment Pending
                          </span>
                        ) : pos.status === 'ALLOTTED' ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Allotted (+{jar?.listingGainPercent || 35}% Gain)
                          </span>
                        ) : pos.status === 'REFUND_PROCESSING' ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-400">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Not Allotted (100% Refundable)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Pending</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Allotment Date
                      </span>
                      <div className="text-xs font-mono font-bold text-white mt-0.5 flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-brand-cyan" />
                        {pos.allotmentDateFormatted}
                      </div>
                    </div>

                    {/* Allotment outcome breakdown */}
                    {pos.isAllotted && (
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Final Lot Outcome
                        </span>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                          Claimable: {pos.claimableReturns}
                        </div>
                      </div>
                    )}

                    {pos.isRefundable && (
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                          Refund Guarantee
                        </span>
                        <div className="text-xs font-mono font-bold text-rose-400 mt-0.5">
                          Refund: {pos.refundableAmount}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-3">
                    {pos.isRefundable ? (
                      <button
                        onClick={() => handleClaimRefund(pos.jarId)}
                        disabled={isProcessing || pos.hasClaimed}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/40 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                        <span>{pos.hasClaimed ? 'Refund Processed' : isProcessing ? 'Claiming...' : 'Claim Refund'}</span>
                      </button>
                    ) : pos.isAllotted ? (
                      <button
                        onClick={() => handleClaimReturns(pos.jarId)}
                        disabled={isProcessing || pos.hasClaimed}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-emerald transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                      >
                        <Coins className={`w-3.5 h-3.5 text-black ${isProcessing ? 'animate-spin' : ''}`} />
                        <span>{pos.hasClaimed ? 'Returns Withdrawn' : isProcessing ? 'Withdrawing...' : 'Withdraw Funds / Gains'}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                      >
                        <span>Awaiting Allotment</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Reason Callout Strip */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className={`p-3 rounded-xl text-xs flex items-start space-x-2.5 ${
                    pos.isAllotted 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : pos.isRefundable
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                  }`}>
                    {pos.isAllotted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : pos.isRefundable ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className={pos.isAllotted ? 'text-emerald-400' : pos.isRefundable ? 'text-rose-400' : 'text-amber-400'}>
                        {pos.isAllotted ? 'Reason for Succeeded Allotment:' : pos.isRefundable ? 'Reason for Failed Allotment:' : 'Allotment Draw Timeline:'}
                      </strong>{' '}
                      <span className="text-slate-300">{pos.allotmentReason}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};
