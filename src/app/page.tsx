'use client';

import React, { useState } from 'react';
import { MarketTicker } from '@/components/MarketTicker';
import { Navbar } from '@/components/Navbar';
import { StatsOverview } from '@/components/StatsOverview';
import { IpoGrid } from '@/components/IpoGrid';
import { InvestModal } from '@/components/InvestModal';
import { PortfolioView } from '@/components/PortfolioView';
import { AllotmentDesk } from '@/components/AllotmentDesk';
import { ManagerConsoleModal } from '@/components/ManagerConsoleModal';
import { useIpo } from '@/context/IpoContext';
import { IpoJar } from '@/types';
import { IPO_CONTRACT_ADDRESS } from '@/contracts/ipoContractAbi';
import { truncateAddress } from '@/utils/formatters';
import { ExternalLink, ShieldCheck, Heart, Terminal } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'allotment' | 'manager'>('market');
  const { selectedJar, setSelectedJar } = useIpo();

  return (
    <div className="min-h-screen flex flex-col bg-[#070A11] bg-radial-glow">
      {/* 1. Real-time Market Ticker Tape */}
      <MarketTicker />

      {/* 2. Stock Broker Persistent Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'market' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Stats & Hero KPI Overview */}
            <StatsOverview />

            {/* Discovery Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Open SME IPO Jars
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Decentralized retail pooling contracts on MST blockchain. Select an active pool to join.
                </p>
              </div>
            </div>

            {/* Dynamic Card Grid */}
            <IpoGrid onSelectJar={(jar) => setSelectedJar(jar)} />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="animate-in fade-in duration-300">
            <PortfolioView onExploreJars={() => setActiveTab('market')} />
          </div>
        )}

        {activeTab === 'allotment' && (
          <div className="animate-in fade-in duration-300">
            <AllotmentDesk />
          </div>
        )}

        {activeTab === 'manager' && (
          <div className="animate-in fade-in duration-300">
            <ManagerConsoleModal />
          </div>
        )}
      </main>

      {/* 4. The Open Jar Investment Drawer/Modal */}
      <InvestModal
        jar={selectedJar}
        onClose={() => setSelectedJar(null)}
        onNavigateToPortfolio={() => {
          setSelectedJar(null);
          setActiveTab('portfolio');
        }}
      />

      {/* 5. Institutional FinTech Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#06080E] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold text-slate-300 font-mono text-sm">
              MST<span className="text-brand-cyan">.JAR</span>
            </span>
            <span className="text-slate-700">|</span>
            <span>Decentralized SME IPO Fractionalization Protocol</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <a
              href={`https://scan.mstchain.io/address/${IPO_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-brand-cyan transition-colors flex items-center space-x-1"
            >
              <Terminal className="w-3 h-3 text-brand-cyan" />
              <span>Smart Contract: {truncateAddress(IPO_CONTRACT_ADDRESS, 6, 4)}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Bridgekey Verified</span>
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-600">
          <p>
            Disclaimer: Fractionalized SME IPO tokens represent collective smart-contract escrows on the MST blockchain. Not financial advice.
          </p>
          <p className="flex items-center">
            Built for Buildathon 2026 • MST Chain & Bridgekey
          </p>
        </div>
      </footer>
    </div>
  );
}
