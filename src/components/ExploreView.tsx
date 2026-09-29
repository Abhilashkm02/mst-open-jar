"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJars } from "@/context/JarsContext";
import { JarCard } from "./JarCard";
import { formatMST } from "@/lib/formatUtils";
import { JarStatus, Sector } from "@/types";
import { Filter, SlidersHorizontal, Inbox } from "lucide-react";

export const ExploreView: React.FC = () => {
  const {
    filteredJars,
    featuredJar,
    gridJars,
    statusFilter,
    setStatusFilter,
    sectorFilter,
    setSectorFilter,
    openInvestDrawer,
    stats,
  } = useJars();

  const statuses: { label: string; value: "ALL" | JarStatus }[] = [
    { label: "All Statuses", value: "ALL" },
    { label: "Funding Open", value: "OPEN" },
    { label: "Target Reached", value: "LOCKED" },
    { label: "Bid Successful", value: "ALLOTTED" },
    { label: "Bid Failed", value: "FAILED" },
  ];

  const sectors: { label: string; value: "ALL" | Sector }[] = [
    { label: "All Sectors", value: "ALL" },
    { label: "Tech", value: "Tech" },
    { label: "Manufacturing", value: "Manufacturing" },
    { label: "Health", value: "Health" },
    { label: "Agri", value: "Agri" },
    { label: "Retail", value: "Retail" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 space-y-10 select-none">
      
      {/* Editorial Header */}
      <div className="space-y-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-paper-dim block">
          01 / OPEN JARS
        </span>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-paper leading-[1.08] max-w-3xl">
          Own a piece of the next listing.
        </h1>

        <p className="text-sm md:text-base text-paper-muted font-sans max-w-2xl leading-relaxed">
          Democratizing high-ticket SME IPO lots on the MST blockchain. Pool micro-tokens with non-custodial smart contracts and zero-bias allotment.
        </p>

        {/* Mono Stats Strip */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-hairline max-w-4xl">
          <div>
            <span className="text-[10px] font-mono uppercase text-paper-dim block">TOTAL POOLED</span>
            <span className="font-mono text-base sm:text-lg font-bold text-paper tabular-nums">
              {formatMST(stats.totalPooledMst)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-paper-dim block">ACTIVE JARS</span>
            <span className="font-mono text-base sm:text-lg font-bold text-accentEmerald tabular-nums">
              {stats.activeJarsCount} Offerings
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-paper-dim block">INVESTORS</span>
            <span className="font-mono text-base sm:text-lg font-bold text-paper tabular-nums">
              {stats.totalInvestorsCount} Wallets
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-paper-dim block">AVG. FUNDING TIME</span>
            <span className="font-mono text-base sm:text-lg font-bold text-paper tabular-nums">
              {stats.avgFundingTime}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Row: Status & Sector Chips */}
      <div className="pt-2 pb-1 border-b border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-paper-dim mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>STATUS:</span>
          </span>
          {statuses.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1 rounded-btn text-xs font-mono transition-colors ${
                statusFilter === s.value
                  ? "bg-cobalt text-white font-medium"
                  : "bg-ink-surface text-paper-muted hover:text-paper border border-hairline"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-paper-dim mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>SECTOR:</span>
          </span>
          {sectors.map(sec => (
            <button
              key={sec.value}
              onClick={() => setSectorFilter(sec.value)}
              className={`px-2.5 py-1 rounded-btn text-xs font-mono transition-colors ${
                sectorFilter === sec.value
                  ? "bg-paper text-ink font-bold"
                  : "bg-ink-surface text-paper-muted hover:text-paper border border-hairline"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

      </div>

      {/* Empty Filter State */}
      {filteredJars.length === 0 ? (
        <div className="p-16 text-center bg-ink-surface border border-hairline rounded-card space-y-3">
          <Inbox className="w-8 h-8 text-paper-dim mx-auto stroke-[1.5]" />
          <h3 className="font-serif text-lg font-bold text-paper">No Offerings Match Criteria</h3>
          <p className="text-xs text-paper-muted max-w-sm mx-auto">
            Try adjusting your sector or status filter to display other active or settled SME IPO syndicates.
          </p>
          <button
            onClick={() => {
              setStatusFilter("ALL");
              setSectorFilter("ALL");
            }}
            className="text-xs font-mono text-cobalt hover:underline mt-2 inline-block"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        /* Asymmetric Editorial Grid */
        <div className="space-y-8">
          
          {/* Featured Jar (Hero Card) */}
          {featuredJar && (
            <div>
              <JarCard
                jar={featuredJar}
                isFeatured={true}
                index={0}
                onOpenDrawer={openInvestDrawer}
              />
            </div>
          )}

          {/* Secondary Jars in 12-Column Asymmetric Grid with varied spans */}
          {gridJars.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {gridJars.map((jar, idx) => {
                // Varied column spans: 6 columns for 2-item rows, or 4 columns for 3-item rows
                const colSpan = gridJars.length % 2 === 0 ? "md:col-span-6" : "md:col-span-6 lg:col-span-4";
                return (
                  <div key={jar.id} className={colSpan}>
                    <JarCard
                      jar={jar}
                      isFeatured={false}
                      index={idx + 1}
                      onOpenDrawer={openInvestDrawer}
                    />
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Discreet Risk Disclosure Footer Strip */}
      <footer className="pt-12 pb-6 border-t border-hairline text-center space-y-2">
        <p className="text-[11px] text-paper-dim font-sans max-w-2xl mx-auto leading-relaxed">
          OpenJar is a decentralized smart contract protocol on the MST Blockchain. Fractional lots represent syndication rights to exchange IPO bids. Capital is subject to market and allotment risks. All unallotted bids are automatically refunded via escrow bytecode.
        </p>
        <div className="text-[10px] font-mono text-paper-dim uppercase tracking-wider">
          OPENJAR PROTOCOL • MST NETWORK TESTNET (CHAIN ID 1088)
        </div>
      </footer>

    </div>
  );
};
