'use client';

import React, { useState } from 'react';
import { useIpo } from '@/context/IpoContext';
import { useWallet } from '@/context/WalletContext';
import { IPO_CONTRACT_ADDRESS } from '@/contracts/ipoContractAbi';
import { truncateAddress } from '@/utils/formatters';
import { 
  Sliders, 
  Play, 
  Coins, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

export const ManagerConsoleModal: React.FC = () => {
  const { jars, executeLotPurchase, distributeGains, investInJar } = useIpo();
  const { isConnected, isDemoMode, address } = useWallet();

  const [selectedJarId, setSelectedJarId] = useState<string>('live-contract-jar');
  const [gainsAmount, setGainsAmount] = useState<number>(85000);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isDistributing, setIsDistributing] = useState<boolean>(false);
  const [isQuickFilling, setIsQuickFilling] = useState<boolean>(false);

  const currentJar = jars.find((j) => j.id === selectedJarId) || jars[0];

  const handleExecuteLot = async () => {
    setIsExecuting(true);
    try {
      await executeLotPurchase(selectedJarId);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDistributeGains = async () => {
    if (gainsAmount <= 0) return;
    setIsDistributing(true);
    try {
      await distributeGains(selectedJarId, gainsAmount);
    } finally {
      setIsDistributing(false);
    }
  };

  const handleQuickFill = async () => {
    if (!currentJar) return;
    const remaining = currentJar.totalFractions - currentJar.fractionsSold;
    if (remaining <= 0) return;
    setIsQuickFilling(true);
    try {
      await investInJar(currentJar.id, remaining);
    } finally {
      setIsQuickFilling(false);
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Target Jar Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Jar Selector & Status */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[#0B0F1C] border border-slate-800 space-y-4">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Select Active IPO Jar
          </label>

          <div className="space-y-2">
            {jars.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedJarId(j.id)}
                className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between text-xs ${
                  selectedJarId === j.id
                    ? 'border-brand-cyan bg-brand-cyan/10 text-white font-bold shadow-sm'
                    : 'border-slate-800 bg-[#070A11] text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base">{j.logo}</span>
                  <div>
                    <span className="font-semibold">{j.symbol}</span>
                    <p className="text-[10px] text-slate-500">{j.companyName}</p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-brand-cyan">
                  {j.fractionsSold}/{j.totalFractions}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">{currentJar.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Target:</span>
              <span className="text-white font-mono">{currentJar.totalLotTargetFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span>Lot Purchased:</span>
              <span className="text-white font-mono">{currentJar.lotPurchased ? 'YES' : 'NO'}</span>
            </div>
            <div className="flex justify-between">
              <span>Returns Distributed:</span>
              <span className="text-white font-mono">{currentJar.returnsDistributed ? 'YES' : 'NO'}</span>
            </div>
          </div>
        </div>

        {/* Right: Lifecycle Trigger Actions */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Step 1: Quick Fill Pool */}
          <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-brand-cyan/20 text-brand-cyan font-mono">
                  ACTION 1
                </span>
                <h4 className="text-sm font-bold text-white">Fill Open Jar Target (100%)</h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Fills the remaining {Math.max(0, currentJar.totalFractions - currentJar.fractionsSold)} fraction(s) to simulate hitting the full lot target.
              </p>
            </div>

            <button
              onClick={handleQuickFill}
              disabled={isQuickFilling || currentJar.fractionsSold >= currentJar.totalFractions}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-black border border-brand-cyan/40 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isQuickFilling ? 'Filling...' : currentJar.fractionsSold >= currentJar.totalFractions ? 'Pool Filled (100%)' : 'Quick Fill Remaining'}</span>
            </button>
          </div>

          {/* Step 2: Execute Lot Purchase */}
          <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 font-mono">
                  ACTION 2
                </span>
                <h4 className="text-sm font-bold text-white">
                  Execute Lot Purchase <code className="text-xs text-amber-400 font-mono">executeLotPurchase()</code>
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Simulates institutional execution on the stock exchange. Locks the jar and transitions pool state to "Allotted".
              </p>
            </div>

            <button
              onClick={handleExecuteLot}
              disabled={isExecuting || currentJar.lotPurchased}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isExecuting ? 'Executing...' : currentJar.lotPurchased ? 'Lot Executed' : 'Execute Lot Purchase'}</span>
            </button>
          </div>

          {/* Step 3: Distribute Listing Gains */}
          <div className="p-5 rounded-2xl bg-[#0B0F1C] border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  ACTION 3
                </span>
                <h4 className="text-sm font-bold text-white">
                  Distribute Listing Gains <code className="text-xs text-emerald-400 font-mono">distributeListingGains()</code>
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Injects listing profits into the smart contract so retail fraction holders can withdraw their gains from "My Portfolio".
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={gainsAmount}
                  onChange={(e) => setGainsAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Gains in MST"
                  className="w-full px-4 py-2.5 bg-[#070A11] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-brand-emerald"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                  MST
                </span>
              </div>

              <button
                onClick={handleDistributeGains}
                disabled={isDistributing || gainsAmount <= 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-emerald transition-all flex items-center justify-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Coins className="w-3.5 h-3.5 text-black" />
                <span>{isDistributing ? 'Depositing...' : 'Distribute Gains to Holders'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
