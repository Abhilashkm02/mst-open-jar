'use client';

import React from 'react';
import { IpoJar, JarStatus } from '@/types';
import { formatTimeRemaining } from '@/utils/formatters';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  TrendingUp, 
  Coins, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Calendar
} from 'lucide-react';

interface IpoCardProps {
  jar: IpoJar;
  onSelect: (jar: IpoJar) => void;
}

export const IpoCard: React.FC<IpoCardProps> = ({ jar, onSelect }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const progressPercent = Math.min(100, Math.round((jar.fractionsSold / jar.totalFractions) * 100));
  const timeInfo = formatTimeRemaining(jar.deadlineTimestamp);

  // Dynamic Badge Renderer
  const renderBadge = (status: JarStatus) => {
    switch (status) {
      case 'FUNDING_OPEN':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-glow-emerald">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Funding Open</span>
          </span>
        );
      case 'TARGET_REACHED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Target Reached (Locked)</span>
          </span>
        );
      case 'ALLOTMENT_PENDING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>Allotment Pending</span>
          </span>
        );
      case 'ALLOTTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Allotted {jar.listingGainPercent ? `(+${jar.listingGainPercent}%)` : ''}</span>
          </span>
        );
      case 'REFUND_PROCESSING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Refund Processing</span>
          </span>
        );
      case 'UPCOMING':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Upcoming Pool</span>
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(jar)}
      className="group relative bg-[#0D121F] hover:bg-[#121828] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Live On-Chain Contract Top Ribbon */}
      {jar.isLiveContract && (
        <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-cyan to-brand-emerald text-black text-[10px] font-black tracking-wider uppercase flex items-center space-x-1 shadow-glow-cyan z-10">
          <Sparkles className="w-3 h-3 fill-black" />
          <span>Deployed Smart Contract</span>
        </div>
      )}

      <div>
        {/* Header: Company info & Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
              {jar.logo}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-brand-cyan transition-colors leading-tight">
                  {jar.companyName}
                </h3>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded font-semibold">
                  {jar.symbol}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {jar.sector}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            {renderBadge(jar.status)}
          </div>
        </div>

        {/* Company Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-5 leading-relaxed">
          {jar.description}
        </p>

        {/* Financial KPI Blocks (Stock Broker layout) */}
        <div className="grid grid-cols-2 gap-3 py-3.5 px-4 rounded-xl bg-[#090D17]/80 border border-slate-800/80 mb-5">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Lot Target
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white font-mono mt-0.5">
              {jar.totalLotTargetFormatted}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Lot: {jar.lotSize} shares
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Minimum Entry
            </div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono mt-0.5">
              {jar.minimumEntryFormatted}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Band: {jar.issuePriceBand}
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Jar Pool Progress: <span className="text-white font-bold font-mono">{progressPercent}%</span>
            </span>
            <span className="font-mono text-slate-300 font-semibold">
              {jar.fractionsSold} / {jar.totalFractions} Fractions
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-[1px]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progressPercent >= 100
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-glow-amber'
                  : 'bg-gradient-to-r from-brand-cyan to-brand-emerald shadow-glow-cyan'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1" suppressHydrationWarning>
            <span className="flex items-center" suppressHydrationWarning>
              <Clock className="w-3 h-3 mr-1 text-slate-400" />
              <span suppressHydrationWarning>
                {mounted ? timeInfo.text : 'Closing soon'}
              </span>
            </span>
            <span className="flex items-center text-slate-300 font-mono">
              <Calendar className="w-3 h-3 mr-1 text-brand-cyan" />
              <span>Allotment: <strong className="text-white font-semibold">{jar.allotmentDateFormatted}</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-2 border-t border-slate-800/80">
        {jar.status === 'FUNDING_OPEN' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(jar);
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-black border border-brand-cyan/40 hover:border-transparent transition-all shadow-sm group-hover:shadow-glow-cyan"
          >
            <span>Invest in Open Jar</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : jar.status === 'TARGET_REACHED' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(jar);
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Target Reached (Locked)</span>
          </button>
        ) : jar.status === 'ALLOTTED' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(jar);
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>View Allotment & Returns</span>
          </button>
        ) : jar.status === 'REFUND_PROCESSING' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(jar);
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Claim Refund Available</span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(jar);
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition-all"
          >
            <span>View Details</span>
          </button>
        )}
      </div>
    </div>
  );
};
