'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { truncateAddress } from '@/utils/formatters';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  LogOut, 
  Sparkles, 
  Shield, 
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'market' | 'portfolio' | 'allotment' | 'manager';
  setActiveTab: (tab: 'market' | 'portfolio' | 'allotment' | 'manager') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    address, 
    balance, 
    isConnected, 
    isConnecting, 
    isDemoMode, 
    walletName, 
    connectWallet, 
    disconnectWallet, 
    toggleDemoMode,
    refreshBalance 
  } = useWallet();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border/80 bg-[#080B12]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab('market')}
              className="flex items-center space-x-3 group focus:outline-none"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-emerald p-[1.5px] shadow-glow-cyan transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#090D17] rounded-[10px] flex items-center justify-center">
                  <span className="text-xl font-black bg-gradient-to-r from-brand-cyan to-brand-emerald bg-clip-text text-transparent">
                    ⟐
                  </span>
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                    MST<span className="text-brand-cyan">.JAR</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-brand-cyanDim text-brand-cyan border border-brand-cyan/20">
                    SME IPO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                  Decentralized Retail Pooling Protocol
                </p>
              </div>
            </button>

            {/* Navigation Tabs (Stock Broker Layout) */}
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-slate-800">
              <button
                onClick={() => setActiveTab('market')}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'market'
                    ? 'text-white bg-slate-800/80 shadow-inner border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                IPO Jars (Market)
              </button>
              
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all relative ${
                  activeTab === 'portfolio'
                    ? 'text-white bg-slate-800/80 shadow-inner border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                My Portfolio
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400">
                  Holdings
                </span>
              </button>

              <button
                onClick={() => setActiveTab('allotment')}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'allotment'
                    ? 'text-white bg-slate-800/80 shadow-inner border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                Allotment Desk
              </button>

              <button
                onClick={() => setActiveTab('manager')}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeTab === 'manager'
                    ? 'text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30'
                    : 'text-slate-400 hover:text-brand-cyan hover:bg-slate-800/30'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Issuer Console</span>
              </button>
            </nav>
          </div>

          {/* Right Action Bar: MST Network Pill + Wallet Connect */}
          <div className="flex items-center space-x-3">
            
            {/* Network Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">MST Chain (1088)</span>
            </div>

            {/* Wallet State */}
            {mounted && isConnected ? (
              <div className="relative">
                <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 shadow-lg hover:border-brand-cyan/50 transition-colors">
                  
                  {/* Balance Display */}
                  <div className="flex items-center space-x-2 px-3 py-1 bg-[#0B101C] rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">MST</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {balance}
                    </span>
                    <button
                      onClick={handleManualRefresh}
                      title="Refresh Balance"
                      className="text-slate-500 hover:text-brand-cyan p-0.5 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-brand-cyan' : ''}`} />
                    </button>
                  </div>

                  {/* Account Address Pill */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-emerald"></div>
                    <span>{truncateAddress(address, 5, 4)}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0F1422] border border-slate-700 shadow-2xl p-2 z-50">
                    <div className="p-3 border-b border-slate-800">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Connected Account
                      </p>
                      <p className="text-xs font-mono text-white mt-1 break-all select-all">
                        {address}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-cyanDim text-brand-cyan font-medium">
                          {walletName}
                        </span>
                        {isDemoMode && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
                            Demo Simulator
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        <span>{copied ? 'Copied to Clipboard!' : 'Copy Wallet Address'}</span>
                      </button>

                      <a
                        href={`https://scan.mstchain.io/address/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        <span>View on MST Explorer</span>
                      </a>

                      <button
                        onClick={toggleDemoMode}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{isDemoMode ? 'Switch to Injected Web3' : 'Switch to Demo Mode'}</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          disconnectWallet();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Disconnect Wallet</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => connectWallet(false)}
                  disabled={isConnecting}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-cyan to-brand-emerald text-black shadow-glow-cyan hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4 text-black" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Bridgekey Wallet'}</span>
                </button>

                <button
                  onClick={() => connectWallet(true)}
                  title="Instant Demo Wallet with 125,000 MST"
                  className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-brand-cyan hover:border-brand-cyan/40 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo Mode</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('market')}
            className={`font-semibold py-1 px-2 rounded ${
              activeTab === 'market' ? 'text-brand-cyan font-bold' : 'text-slate-400'
            }`}
          >
            IPO Jars
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`font-semibold py-1 px-2 rounded ${
              activeTab === 'portfolio' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('allotment')}
            className={`font-semibold py-1 px-2 rounded ${
              activeTab === 'allotment' ? 'text-brand-cyan font-bold' : 'text-slate-400'
            }`}
          >
            Allotment
          </button>
          <button
            onClick={() => setActiveTab('manager')}
            className={`font-semibold py-1 px-2 rounded ${
              activeTab === 'manager' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            Console
          </button>
        </div>

      </div>
    </header>
  );
};
