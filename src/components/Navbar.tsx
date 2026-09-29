"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WalletButton } from "./WalletButton";
import { Compass, Briefcase, Wallet, Sliders } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

interface NavbarProps {
  activeTab: "explore" | "my-jars";
  setActiveTab: (tab: "explore" | "my-jars") => void;
  onOpenIssuerConsole?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenIssuerConsole,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { wallet, connectWallet } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop & Tablet Top Sticky Navigation */}
      <header
        className={`sticky top-0 z-40 w-full h-16 transition-colors duration-200 bg-ink ${
          isScrolled ? "border-b border-hairline" : "border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          {/* Left: OpenJar Wordmark & Custom Geometric Jar Mark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("explore")}
              className="flex items-center gap-2.5 group focus-visible:outline-none"
            >
              {/* Custom geometric SVG jar mark */}
              <div className="w-7 h-7 rounded-[4px] bg-ink-surface border border-hairline flex items-center justify-center transition-colors group-hover:border-cobalt/60">
                <svg
                  width="16"
                  height="18"
                  viewBox="0 0 16 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-paper transition-colors group-hover:text-cobalt"
                >
                  <rect x="4" y="1" width="8" height="2" rx="0.5" fill="currentColor" opacity="0.8" />
                  <rect x="5" y="3" width="6" height="2" fill="currentColor" opacity="0.6" />
                  <path
                    d="M 5 5 L 11 5 C 12 5, 14 6.5, 14 8 L 14 15 C 14 16, 13 17, 12 17 L 4 17 C 3 17, 2 16, 2 15 L 2 8 C 2 6.5, 4 5, 5 5 Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="none"
                  />
                  <path d="M 3.5 12 Q 8 13.5, 12.5 12 L 12.5 16 L 3.5 16 Z" fill="#2FBF8F" opacity="0.75" />
                </svg>
              </div>

              {/* Wordmark in Editorial Serif */}
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-xl font-bold tracking-tight text-paper">
                  OpenJar
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-paper-dim hidden sm:inline">
                  / MST
                </span>
              </div>
            </button>
          </div>

          {/* Center (Desktop): Sliding underline tabs */}
          <nav className="hidden md:flex items-center gap-8 relative h-full">
            <button
              onClick={() => setActiveTab("explore")}
              className={`relative h-full flex items-center text-xs font-medium uppercase tracking-wider transition-colors focus-visible:outline-none ${
                activeTab === "explore" ? "text-paper" : "text-paper-muted hover:text-paper"
              }`}
            >
              Explore
              {activeTab === "explore" && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-cobalt"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("my-jars")}
              className={`relative h-full flex items-center text-xs font-medium uppercase tracking-wider transition-colors focus-visible:outline-none ${
                activeTab === "my-jars" ? "text-paper" : "text-paper-muted hover:text-paper"
              }`}
            >
              My Jars
              {activeTab === "my-jars" && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-cobalt"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Issuer Console Trigger */}
            {onOpenIssuerConsole && (
              <button
                onClick={onOpenIssuerConsole}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-ink-surface border border-hairline hover:border-hairline-bright text-xs font-mono text-paper-muted hover:text-paper transition-colors"
                title="Open Issuer & Clearing Console"
              >
                <Sliders className="w-3.5 h-3.5 text-accentAmber" />
                <span>Issuer Console</span>
              </button>
            )}

            {/* Wallet Button */}
            <WalletButton />
          </div>

        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink-surface border-t border-hairline py-2 px-6 flex items-center justify-around select-none">
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium tracking-wide transition-colors ${
            activeTab === "explore" ? "text-cobalt" : "text-paper-muted"
          }`}
        >
          <Compass className="w-4 h-4 stroke-[1.5]" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => setActiveTab("my-jars")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium tracking-wide transition-colors ${
            activeTab === "my-jars" ? "text-cobalt" : "text-paper-muted"
          }`}
        >
          <Briefcase className="w-4 h-4 stroke-[1.5]" />
          <span>My Jars</span>
        </button>

        {onOpenIssuerConsole && (
          <button
            onClick={onOpenIssuerConsole}
            className="flex flex-col items-center gap-1 text-[10px] font-medium tracking-wide text-accentAmber"
          >
            <Sliders className="w-4 h-4 stroke-[1.5]" />
            <span>Console</span>
          </button>
        )}

        <button
          onClick={() => {
            if (!wallet.isConnected) connectWallet(false);
          }}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium tracking-wide transition-colors ${
            wallet.isConnected ? "text-accentEmerald" : "text-paper-muted"
          }`}
        >
          <Wallet className="w-4 h-4 stroke-[1.5]" />
          <span>{wallet.isConnected ? wallet.truncatedAddress : "Wallet"}</span>
        </button>
      </div>
    </>
  );
};
