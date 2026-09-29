'use client';

import React, { useState } from 'react';
import { useIpo } from '@/context/IpoContext';
import { useWallet } from '@/context/WalletContext';
import { truncateAddress } from '@/utils/formatters';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Coins, 
  RotateCcw, 
  Wallet, 
  Search,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  Calendar,
  Info
} from 'lucide-react';

export const AllotmentDesk: React.FC = () => {
  const { userPositions, claimRefund, claimReturns, jars } = useIpo();
  const { isConnected, address, connectWallet } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  // Filter positions
  const filteredPositions = userPositions.filter((pos) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      pos.companyName.toLowerCase().includes(term) ||
      pos.symbol.toLowerCase().includes(term) ||
      pos.contractAddress.toLowerCase().includes(term)
    );
  });

  const allottedCount = userPositions.filter((p) => p.isAllotted).length;
  const notAllottedCount = userPositions.filter((p) => p.isRefundable).length;
  const pendingCount = userPositions.filter((p) => !p.isAllotted && !p.isRefundable).length;

  if (!isConnected) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-6 text-center rounded-3xl bg-[#090D18] border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center mx-auto mb-4 text-brand-cyan">
          <FileCheck2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          My Allotment Status
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Connect your Bridgekey wallet to verify your SME IPO lot allotment records, official draw dates, and allocation outcome reasons.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => connectWallet(false)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-cyan to-brand-emerald text-black shadow-glow-cyan hover:opacity-95 transition-all"
          >
            Connect Bridgekey Wallet
          </button>
          <button
            onClick={() => connectWallet(true)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Check Demo Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              My Allotment Status
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 font-semibold">
              Live On-Chain
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official allotment draw dates and allocation verdict records for account{' '}
            <span className="font-mono text-slate-200 font-bold">{truncateAddress(address, 6, 4)}</span>
          </p>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by IPO or symbol..."
            className="w-full pl-9 pr-3 py-2 bg-[#090D18] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
          />
        </div>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Applications</span>
          <p className="text-xl font-bold text-white font-mono mt-1">{userPositions.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800">
          <span className="text-[11px] text-emerald-400 uppercase font-semibold">Lots Allotted</span>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{allottedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800">
          <span className="text-[11px] text-rose-400 uppercase font-semibold">Not Allotted (Refund)</span>
          <p className="text-xl font-bold text-rose-400 font-mono mt-1">{notAllottedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800">
          <span className="text-[11px] text-amber-400 uppercase font-semibold">Allotment In Progress</span>
          <p className="text-xl font-bold text-amber-400 font-mono mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Allotment Status Records List */}
      {filteredPositions.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#090D18]/60 border border-slate-800 p-8">
          <FileCheck2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Allotment Records Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No applications match your search query.'
              : 'You have not submitted bids to any SME IPO jars yet. Apply through Open Jars to track status.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPositions.map((pos) => {
            const jar = jars.find((j) => j.id === pos.jarId);
            const isProcessing = processingId === pos.jarId;

            return (
              <div
                key={pos.jarId}
                className="p-5 sm:p-6 rounded-2xl bg-[#0C111E] border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-4 shadow-sm"
              >
                {/* Top Section: Company Info, Allotment Date & Status Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: IPO Details */}
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                      {jar?.logo || '📊'}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-base sm:text-lg">
                          {pos.companyName}
                        </h4>
                        <span className="text-[11px] font-mono font-bold text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded">
                          {pos.symbol}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                        <span>Bidded: <strong className="text-white">{pos.fractionsOwned} Fraction(s)</strong></span>
                        <span>Committed: <strong className="text-white">{pos.investedMst}</strong></span>
                        <span>Lot Share: <strong className="text-brand-cyan">{pos.sharePercentage}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right: Allotment Date & Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Allotment Date Pill */}
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
                      <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                      <span className="text-slate-400">Allotment Date:</span>
                      <strong className="text-white font-bold">{pos.allotmentDateFormatted}</strong>
                    </div>

                    {/* Status Badge */}
                    {pos.status === 'ALLOTTED' ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">
                          Allotted (100% Filled)
                        </span>
                      </div>
                    ) : pos.status === 'REFUND_PROCESSING' ? (
                      <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-bold text-rose-400">
                          Not Allotted
                        </span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400">
                          Allotment In Progress
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    {pos.isAllotted ? (
                      <button
                        onClick={() => handleClaimReturns(pos.jarId)}
                        disabled={isProcessing || pos.hasClaimed}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-emerald transition-all flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Coins className={`w-3.5 h-3.5 text-black ${isProcessing ? 'animate-spin' : ''}`} />
                        <span>{pos.hasClaimed ? 'Proceeds Claimed' : isProcessing ? 'Withdrawing...' : 'Withdraw Gains'}</span>
                      </button>
                    ) : pos.isRefundable ? (
                      <button
                        onClick={() => handleClaimRefund(pos.jarId)}
                        disabled={isProcessing || pos.hasClaimed}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                        <span>{pos.hasClaimed ? 'Refund Credited' : isProcessing ? 'Claiming...' : 'Claim 100% Refund'}</span>
                      </button>
                    ) : null}

                    <a
                      href={`https://scan.mstchain.io/address/${pos.contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      title="View Contract on MST Explorer"
                      className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-brand-cyan transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Bottom Section: Reason Callout Box for Succeeded vs Failed Allotment */}
                <div className="pt-2 border-t border-slate-800/80">
                  {pos.status === 'ALLOTTED' ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-emerald-400 flex items-center space-x-2">
                          <span>Reason for Succeeded Allotment</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            Draw Successful • Allotment Verified
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          {pos.allotmentReason}
                        </p>
                        <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                          Claimable Outcome: {pos.claimableReturns}
                        </div>
                      </div>
                    </div>
                  ) : pos.status === 'REFUND_PROCESSING' ? (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-rose-400 flex items-center space-x-2">
                          <span>Reason for Failed Allotment</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                            Zero Penalty • 100% Refundable
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          {pos.allotmentReason}
                        </p>
                        <div className="text-[11px] font-mono text-rose-400 font-semibold mt-1">
                          Refund Available: {pos.refundableAmount} (Exact invested principal)
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start space-x-2.5">
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-amber-400 flex items-center space-x-2">
                          <span>Allotment Status & Draw Timeline</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                            Awaiting Draw
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          {pos.allotmentReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
