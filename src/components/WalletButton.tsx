"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { formatMST } from "@/lib/formatUtils";
import { Loader2, Copy, LogOut, Check, Sparkles, Radio } from "lucide-react";

export const WalletButton: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet, toggleDemoMode } = useWallet();
  const { showToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    showToast({
      title: "Address Copied",
      description: wallet.address,
      type: "info",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Disconnected or unmounted initial state
  if (!mounted || (!wallet.isConnected && !wallet.isConnecting)) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => connectWallet(false)}
          className="px-3.5 py-1.5 rounded-btn text-xs font-medium text-paper bg-transparent border border-hairline hover:border-cobalt hover:text-white transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-cobalt focus-visible:outline-none"
        >
          Connect Bridgekey Wallet
        </button>
      </div>
    );
  }

  // Connecting state
  if (wallet.isConnecting) {
    return (
      <button
        disabled
        className="px-3.5 py-1.5 rounded-btn text-xs font-medium text-paper-muted bg-ink-surface border border-hairline flex items-center gap-2 cursor-wait"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-cobalt" />
        <span>Connecting...</span>
      </button>
    );
  }

  // Formatted balance: support decimal values for live testnet tokens
  const formattedBalance = wallet.isRealWeb3
    ? `${wallet.balance.toFixed(2)} MST`
    : formatMST(wallet.balance);

  // Connected state: compact chip
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(prev => !prev)}
        className="flex items-center rounded-btn bg-ink-surface border border-hairline hover:border-hairline-bright transition-colors text-xs select-none focus-visible:ring-1 focus-visible:ring-cobalt focus-visible:outline-none overflow-hidden"
      >
        {/* Identicon & Address */}
        <div className="flex items-center gap-2 px-3 py-1.5">
          {/* Geometric Identicon */}
          <div className="w-4 h-4 rounded-[2px] bg-[#1A1D22] border border-white/20 grid grid-cols-2 p-[2px] gap-[1px]">
            <div className={`${wallet.isRealWeb3 ? "bg-accentEmerald" : "bg-cobalt"} rounded-[1px]`} />
            <div className="bg-emerald-500 rounded-[1px]" />
            <div className="bg-paper-muted rounded-[1px]" />
            <div className={`${wallet.isRealWeb3 ? "bg-accentEmerald/60" : "bg-cobalt/60"} rounded-[1px]`} />
          </div>
          <span className="font-mono text-paper font-medium tracking-tight">
            {wallet.truncatedAddress}
          </span>
        </div>

        {/* Hairline Divider */}
        <div className="w-[1px] h-4 bg-hairline" />

        {/* Balance Display */}
        <div className="px-3 py-1.5 font-mono text-paper-muted tabular-nums">
          {formattedBalance}
        </div>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-card bg-ink-elevated border border-hairline shadow-2xl py-1 z-50 text-xs">
          
          {/* Mode Pill */}
          <div className="px-3 py-2 border-b border-hairline flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-paper-dim">WALLET MODE</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-tag border ${
              wallet.isRealWeb3
                ? "bg-accentEmerald/10 text-accentEmerald border-accentEmerald/30"
                : "bg-cobalt/10 text-cobalt border-cobalt/30"
            }`}>
              {wallet.isRealWeb3 ? "Bridgekey Live" : "Demo Mode"}
            </span>
          </div>

          {/* Network details */}
          <div className="px-3 py-2 border-b border-hairline">
            <div className="text-[10px] uppercase font-mono text-paper-dim">NETWORK</div>
            <div className="font-mono text-paper text-xs flex items-center gap-1.5 mt-0.5">
              <Radio className="w-3 h-3 text-accentEmerald" />
              <span>{wallet.network} ({wallet.chainId})</span>
            </div>
          </div>

          {/* Copy Address */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between px-3 py-2 text-left text-paper hover:bg-ink-surface transition-colors"
          >
            <span className="flex items-center gap-2">
              {copied ? <Check className="w-3.5 h-3.5 text-accentEmerald" /> : <Copy className="w-3.5 h-3.5 text-paper-muted" />}
              <span>{copied ? "Copied" : "Copy Address"}</span>
            </span>
            <span className="font-mono text-[10px] text-paper-dim">{wallet.truncatedAddress}</span>
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => {
              setDropdownOpen(false);
              toggleDemoMode();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-paper hover:bg-ink-surface transition-colors border-t border-hairline"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{wallet.isRealWeb3 ? "Switch to Demo Mode" : "Switch to Injected Web3"}</span>
          </button>

          {/* Disconnect */}
          <button
            onClick={() => {
              setDropdownOpen(false);
              disconnectWallet();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-accentBrick hover:bg-ink-surface transition-colors border-t border-hairline"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>

        </div>
      )}
    </div>
  );
};
