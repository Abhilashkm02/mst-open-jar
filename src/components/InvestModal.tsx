'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { IpoJar } from '@/types';
import { useIpo } from '@/context/IpoContext';
import { useWallet } from '@/context/WalletContext';
import { formatMst, formatIntegerWithCommas, truncateAddress } from '@/utils/formatters';
import { ethers } from 'ethers';
import { 
  X, 
  Coins, 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  PieChart,
  FileText,
  Building,
  Info,
  ExternalLink
} from 'lucide-react';

interface InvestModalProps {
  jar: IpoJar | null;
  onClose: () => void;
  onNavigateToPortfolio: () => void;
}

export const InvestModal: React.FC<InvestModalProps> = ({ jar, onClose, onNavigateToPortfolio }) => {
  const { investInJar, executeLotPurchase, claimRefund, claimReturns } = useIpo();
  const { isConnected, balance, rawBalance, connectWallet } = useWallet();

  const [fractionCount, setFractionCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'invest' | 'prospectus'>('invest');

  // Reset count whenever jar changes
  useEffect(() => {
    setFractionCount(1);
    setIsSubmitting(false);
  }, [jar]);

  if (!jar) return null;

  const pricePerFractionEther = parseFloat(ethers.formatEther(jar.fractionPrice));
  const remainingFractions = Math.max(0, jar.totalFractions - jar.fractionsSold);
  const isTargetReached = jar.fractionsSold >= jar.totalFractions || jar.isSoldOut;
  const isFundingOpen = jar.status === 'FUNDING_OPEN' && !isTargetReached;

  // Investment calculations
  const totalCostNumber = fractionCount * pricePerFractionEther;
  const totalCostFormatted = formatIntegerWithCommas(totalCostNumber);
  const userLotSharePercent = ((fractionCount / jar.totalFractions) * 100).toFixed(2);
  const proportionalShares = Math.floor((jar.lotSize * fractionCount) / jar.totalFractions);

  // User wallet balance check
  const userBalNumber = parseFloat(balance.replace(/,/g, '')) || 0;
  const hasInsufficientBalance = isConnected && userBalNumber < totalCostNumber;

  const handleInvest = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (fractionCount <= 0 || fractionCount > remainingFractions) return;

    setIsSubmitting(true);
    try {
      const success = await investInJar(jar.id, fractionCount);
      if (success) {
        onClose();
        onNavigateToPortfolio();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0C111E] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#090D18]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
              {jar.logo}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  {jar.companyName}
                </h3>
                <span className="text-[10px] font-mono font-bold bg-brand-cyan/10 text-brand-cyan px-2 py-0.5 rounded">
                  {jar.symbol}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {jar.sector} • Open SME Jar Pool
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Investment Console vs Issue Prospectus */}
        <div className="flex border-b border-slate-800/80 bg-[#0A0E1A] px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('invest')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'invest'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>The Open Jar (Pooling)</span>
          </button>
          <button
            onClick={() => setActiveTab('prospectus')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'prospectus'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>IPO Prospectus & Metrics</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'invest' ? (
            <>
              {/* Pool Status Banner */}
              {isTargetReached ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-400">
                      Target Reached (Pool Locked)
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      100% of the lot funding target has been pooled! New investments are disabled. The jar is currently awaiting allotment or listing execution on the exchange.
                    </p>
                  </div>
                </div>
              ) : jar.status === 'ALLOTTED' ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400">
                      SME Lot Allotted & Distributed!
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      This SME IPO was successfully allotted and listing gains have been distributed. Fraction holders can claim their proceeds in My Portfolio.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-start space-x-3">
                  <ShieldCheck className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-brand-cyan">
                      Open Jar Active • Non-Custodial Pooling
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Tokens are locked in the verified smart contract. If the SME IPO is not allotted, 100% of your MST tokens are instantly refundable with zero penalties.
                    </p>
                  </div>
                </div>
              )}

              {/* Jar Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#090D18] border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Target</span>
                  <p className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5">
                    {jar.totalLotTargetFormatted}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#090D18] border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Price / Fraction</span>
                  <p className="text-xs sm:text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {jar.fractionPriceFormatted}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#090D18] border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Fractions Left</span>
                  <p className="text-xs sm:text-sm font-bold text-brand-cyan font-mono mt-0.5">
                    {remainingFractions} / {jar.totalFractions}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#090D18] border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase">Lot Size</span>
                  <p className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5">
                    {jar.lotSize} shares
                  </p>
                </div>
              </div>

              {/* Investment Input Calculator */}
              {isFundingOpen && (
                <div className="p-5 rounded-2xl bg-[#090D18] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Specify Investment Amount (Fractions / MST)
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      Wallet: <span className="text-white font-bold">{balance} MST</span>
                    </span>
                  </div>

                  {/* Number of Fractions Stepper / Input */}
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max={remainingFractions}
                        value={fractionCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setFractionCount(Math.min(remainingFractions, Math.max(0, val)));
                        }}
                        className="w-full px-4 py-3 bg-[#060910] border border-slate-700 rounded-xl text-lg font-bold text-white font-mono focus:outline-none focus:border-brand-cyan transition-colors"
                        placeholder="Number of fractions"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                        Fraction(s)
                      </span>
                    </div>

                    {/* Quick presets */}
                    <div className="flex space-x-1.5">
                      {[1, 2, 5, 10].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFractionCount(Math.min(remainingFractions, preset))}
                          className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
                            fractionCount === preset
                              ? 'bg-brand-cyan text-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          +{preset}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFractionCount(remainingFractions)}
                        className="px-2.5 py-2 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {/* Range Slider for Interactive experience */}
                  <div>
                    <input
                      type="range"
                      min="1"
                      max={remainingFractions || 1}
                      value={fractionCount}
                      onChange={(e) => setFractionCount(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>1 Fraction (Min: {jar.fractionPriceFormatted})</span>
                      <span>{remainingFractions} Fractions Max</span>
                    </div>
                  </div>

                  {/* Real-Time Outcome Summary Table */}
                  <div className="p-4 rounded-xl bg-[#0D1424] border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Total Investment Required:</span>
                      <span className="font-mono font-extrabold text-white text-sm">
                        {totalCostFormatted} MST
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Proportional Lot Ownership:</span>
                      <span className="font-mono text-brand-cyan font-bold">
                        {userLotSharePercent}% ({proportionalShares} shares equivalent)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Scheduled Allotment Date:</span>
                      <span className="font-mono text-white font-bold">
                        {jar.allotmentDateFormatted}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Expected Historical Listing Gain:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        +{jar.listingGainPercent}% (~{formatIntegerWithCommas(totalCostNumber * (1 + (jar.listingGainPercent || 35) / 100))} MST)
                      </span>
                    </div>
                  </div>

                  {hasInsufficientBalance && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Insufficient MST balance in wallet ({balance} MST). Reduce fractions or add funds.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* On-Chain Contract Transparency Box */}
              <div className="p-3.5 rounded-xl bg-[#070A12] border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-500">Contract ABI Function:</span>
                  <span className="font-mono text-emerald-400">buyFraction() [payable]</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-500">Contract Address:</span>
                  <a
                    href={`https://scan.mstchain.io/address/${jar.contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-brand-cyan hover:underline flex items-center space-x-1"
                  >
                    <span>{truncateAddress(jar.contractAddress, 8, 6)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </>
          ) : (
            /* Prospectus Tab */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2">Company Overview</h4>
                <p className="text-slate-300 leading-relaxed">
                  {jar.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#090D18] border border-slate-800">
                  <span className="text-slate-500 font-medium">Issue Price Band</span>
                  <p className="text-white font-bold font-mono mt-1 text-sm">{jar.issuePriceBand}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090D18] border border-slate-800">
                  <span className="text-slate-500 font-medium">Retail Reservation</span>
                  <p className="text-white font-bold font-mono mt-1 text-sm">{jar.retailReservation}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090D18] border border-slate-800">
                  <span className="text-slate-500 font-medium">Lead Merchant Banker</span>
                  <p className="text-white font-bold mt-1 text-sm">{jar.leadManager}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#090D18] border border-slate-800">
                  <span className="text-slate-500 font-medium">Risk Assessment Rating</span>
                  <p className={`font-bold mt-1 text-sm ${
                    jar.riskRating === 'Low' ? 'text-emerald-400' : jar.riskRating === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {jar.riskRating} Risk
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Official Allotment Date</span>
                  <span className="font-mono text-brand-cyan font-bold">{jar.allotmentDateFormatted}</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                  <p><strong className="text-emerald-400">Reason for Succeeded Allotment:</strong> 100% Jar Lot Target Reached • Valid Registrar Draw • Instant on-chain tokenization with full listing gains.</p>
                  <p><strong className="text-rose-400">Reason for Failed Allotment:</strong> Unmet pool target or non-selected registrar lottery draw • 100% principal automatically refundable without fees.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#090D18] border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2">Why Fractionalize via MST Jar?</h4>
                <ul className="space-y-2 text-slate-300 list-disc list-inside">
                  <li>Eliminates the rigid ₹1.5L+ barrier, opening participation to retail micro-investors.</li>
                  <li>Automated, unbiased lottery pooling on the MST blockchain.</li>
                  <li>Smart-contract enforced refund guarantees if allotment is not secured.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-slate-800 bg-[#090D18] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          {isFundingOpen ? (
            <button
              onClick={handleInvest}
              disabled={isSubmitting || hasInsufficientBalance || fractionCount <= 0}
              className="flex-1 max-w-sm flex items-center justify-center space-x-2 py-3 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-cyan to-brand-emerald text-black shadow-glow-cyan hover:opacity-95 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Coins className="w-4 h-4 text-black" />
              <span>
                {isSubmitting
                  ? 'Submitting to Chain...'
                  : !isConnected
                  ? 'Connect Wallet to Invest'
                  : `Invest ${totalCostFormatted} MST (${fractionCount} Fractions)`}
              </span>
            </button>
          ) : isTargetReached ? (
            <button
              disabled
              className="flex-1 max-w-sm flex items-center justify-center space-x-2 py-3 px-6 rounded-xl text-sm font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>Locked - Awaiting Allotment</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onNavigateToPortfolio();
              }}
              className="flex-1 max-w-sm flex items-center justify-center space-x-2 py-3 px-6 rounded-xl text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
            >
              <span>View in My Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
