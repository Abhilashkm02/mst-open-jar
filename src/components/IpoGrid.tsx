'use client';

import React, { useMemo } from 'react';
import { useIpo } from '@/context/IpoContext';
import { IpoCard } from './IpoCard';
import { SkeletonCard } from './SkeletonCard';
import { IpoJar } from '@/types';
import { Search, Filter, Sparkles, RefreshCw, BarChart3 } from 'lucide-react';

interface IpoGridProps {
  onSelectJar: (jar: IpoJar) => void;
}

export const IpoGrid: React.FC<IpoGridProps> = ({ onSelectJar }) => {
  const {
    jars,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterSector,
    setFilterSector,
    filterStatus,
    setFilterStatus,
    refreshPoolData,
  } = useIpo();

  // Distinct sectors
  const sectors = ['All', 'Defence & Avionics', 'CleanTech & ESG', 'EV Mobility', 'DeepTech', 'Biopharma', 'AgriTech'];

  // Status Filters
  const statuses = [
    { label: 'All Jars', value: 'All' },
    { label: 'Funding Open', value: 'FUNDING_OPEN' },
    { label: 'Locked / Target Reached', value: 'TARGET_REACHED' },
    { label: 'Allotted', value: 'ALLOTTED' },
    { label: 'Refunds', value: 'REFUND_PROCESSING' },
  ];

  // Filtered jars
  const filteredJars = useMemo(() => {
    return jars.filter((jar) => {
      // Sector filter
      if (filterSector !== 'All' && jar.sector !== filterSector) return false;

      // Status filter
      if (filterStatus !== 'All' && jar.status !== filterStatus) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = jar.companyName.toLowerCase().includes(q);
        const matchSymbol = jar.symbol.toLowerCase().includes(q);
        const matchSector = jar.sector.toLowerCase().includes(q);
        if (!matchName && !matchSymbol && !matchSector) return false;
      }

      return true;
    });
  }, [jars, filterSector, filterStatus, searchQuery]);

  return (
    <div className="w-full">
      {/* Controls Bar: Search, Status Tabs & Sector Filters */}
      <div className="flex flex-col gap-4 mb-6">
        
        {/* Top Control Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-[#090D17] border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilterStatus(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === s.value
                    ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Search Box & Refresh */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IPO, ticker or sector..."
                className="w-full pl-9 pr-4 py-2 bg-[#090D17] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan transition-colors"
              />
            </div>

            <button
              onClick={refreshPoolData}
              title="Refresh smart contract status"
              className="p-2 bg-[#090D17] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-brand-cyan rounded-xl transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-cyan' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center mr-1">
            <Filter className="w-3 h-3 mr-1" /> Sector:
          </span>
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setFilterSector(sec)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterSector === sec
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display */}
      {isLoading && jars.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredJars.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#090D17]/50 border border-slate-800 p-8">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No IPO Jars match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try resetting your search query or switching sector filters to discover open SME pools.
          </p>
          <button
            onClick={() => {
              setFilterSector('All');
              setFilterStatus('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJars.map((jar) => (
            <IpoCard key={jar.id} jar={jar} onSelect={onSelectJar} />
          ))}
        </div>
      )}
    </div>
  );
};
