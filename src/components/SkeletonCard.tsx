import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 relative overflow-hidden animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-slate-800 rounded-xl"></div>
          <div>
            <div className="h-5 bg-slate-800 rounded w-36 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-20"></div>
          </div>
        </div>
        <div className="h-6 bg-slate-800 rounded-full w-24"></div>
      </div>

      <div className="h-3 bg-slate-800 rounded w-full mb-6"></div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/80 mb-5">
        <div>
          <div className="h-3 bg-slate-800 rounded w-16 mb-2"></div>
          <div className="h-5 bg-slate-800 rounded w-24"></div>
        </div>
        <div>
          <div className="h-3 bg-slate-800 rounded w-16 mb-2"></div>
          <div className="h-5 bg-slate-800 rounded w-24"></div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <div className="h-3 bg-slate-800 rounded w-20"></div>
          <div className="h-3 bg-slate-800 rounded w-12"></div>
        </div>
        <div className="h-2.5 bg-slate-800 rounded-full w-full"></div>
      </div>

      <div className="h-11 bg-slate-800 rounded-xl w-full"></div>
    </div>
  );
};
