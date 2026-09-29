import React from "react";

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-ink-surface border border-hairline rounded-card p-6 space-y-5 animate-pulse select-none">
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div className="w-16 h-3 bg-ink-elevated rounded" />
        <div className="w-20 h-4 bg-ink-elevated rounded" />
      </div>

      <div className="space-y-2">
        <div className="w-3/4 h-6 bg-ink-elevated rounded" />
        <div className="w-1/3 h-3 bg-ink-elevated rounded" />
      </div>

      <div className="h-20 bg-ink-elevated/40 rounded-card border border-hairline/40" />

      <div className="space-y-2 pt-2">
        <div className="w-full h-3 bg-ink-elevated rounded" />
        <div className="w-full h-3 bg-ink-elevated rounded" />
        <div className="w-2/3 h-3 bg-ink-elevated rounded" />
      </div>

      <div className="pt-4 border-t border-hairline">
        <div className="w-full h-9 bg-ink-elevated rounded-btn" />
      </div>
    </div>
  );
};
