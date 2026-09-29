'use client';

import React from 'react';
import { Layers, TrendingUp, Users, ShieldCheck, ArrowUpRight, Award } from 'lucide-react';
import { IPO_CONTRACT_ADDRESS } from '@/contracts/ipoContractAbi';
import { truncateAddress } from '@/utils/formatters';

export const StatsOverview: React.FC = () => {
  return (
    <div className="w-full mb-8">
      {/* Hero Welcome / Problem-Solution Callout */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0C1220] via-[#0E1626] to-[#0D1C24] border border-slate-800 p-6 md:p-8 overflow-hidden mb-8 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-4">
              <Award className="w-3.5 h-3.5" />
              <span>SME IPO Fractionalization • MST Chain Protocol</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Democratizing High-Ticket <span className="text-gradient-cyan">SME IPO Lots</span> for Every Retailer.
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Traditional Indian & Global SME IPOs require rigid minimum lots of ₹1.5L – ₹2.5L+, shutting out 90% of retail investors. 
              With <span className="text-white font-semibold">MST Open Jars</span>, pool micro-tokens to collectively bid institutional lots with automated, non-custodial smart contract allotment & refunds.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={`https://scan.mstchain.io/address/${IPO_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white hover:border-brand-cyan/50 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Contract: {truncateAddress(IPO_CONTRACT_ADDRESS, 8, 6)}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audited On-Chain Lot Custody</span>
              </span>
            </div>
          </div>

          {/* Quick Platform Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-auto min-w-[280px] sm:min-w-[340px]">
            <div className="bg-[#0A0E18]/80 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Total Pooled</span>
                <Layers className="w-4 h-4 text-brand-cyan" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                11,26,000 <span className="text-xs text-brand-cyan font-normal">MST</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center font-medium">
                <TrendingUp className="w-3 h-3 mr-1" />
                +24.8% this week
              </div>
            </div>

            <div className="bg-[#0A0E18]/80 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Avg Listing Gain</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                +36.8%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Across 14 SME Lots
              </div>
            </div>

            <div className="bg-[#0A0E18]/80 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Active Bidders</span>
                <Users className="w-4 h-4 text-brand-cyan" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                4,280
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Verified Retail Wallets
              </div>
            </div>

            <div className="bg-[#0A0E18]/80 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Min Entry</span>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-1 rounded">1 Fraction</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                1 <span className="text-xs font-normal">MST</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Zero Allotment Bias
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
