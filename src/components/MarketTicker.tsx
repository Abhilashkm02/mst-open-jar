'use client';

import React from 'react';
import { TrendingUp, Activity, ShieldCheck, Zap, Layers } from 'lucide-react';
import { IPO_CONTRACT_ADDRESS } from '@/contracts/ipoContractAbi';
import { truncateAddress } from '@/utils/formatters';

export const MarketTicker: React.FC = () => {
  const tickerItems = [
    { label: 'MST NATIVE', val: '4.82 USD', change: '+5.4%', up: true, icon: Zap },
    { label: 'SME IPO INDEX', val: '14,892.40', change: '+2.1%', up: true, icon: TrendingUp },
    { label: 'TOTAL POOLED', val: '1,840,000 MST', change: '24h High', up: true, icon: Layers },
    { label: 'ALLOTMENT SUCCESS', val: '94.6%', change: '+1.2%', up: true, icon: ShieldCheck },
    { label: 'AVG LISTING GAIN', val: '+36.8%', change: 'Hist.', up: true, icon: TrendingUp },
    { label: 'LIVE CONTRACT', val: truncateAddress(IPO_CONTRACT_ADDRESS, 6, 4), change: 'MST Chain', up: true, icon: Activity },
    { label: 'ACTIVE RETAILERS', val: '4,280 Bidders', change: '+18% MoM', up: true, icon: Activity },
    { label: 'AVG LOT FRACTIONAL', val: '1 MST', change: 'Min Entry', up: true, icon: Zap },
  ];

  return (
    <div className="w-full bg-[#06090F] border-b border-brand-border/60 overflow-hidden text-xs py-2 select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {tickerItems.concat(tickerItems).map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="inline-flex items-center space-x-2 mx-6 text-slate-300 font-mono tracking-tight"
            >
              <Icon className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="font-semibold text-slate-400">{item.label}</span>
              <span className="text-white font-bold">{item.val}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                  item.up
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {item.change}
              </span>
              <span className="text-slate-700 ml-4">/</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
