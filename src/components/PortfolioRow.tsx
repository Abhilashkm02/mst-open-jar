"use client";

import React from "react";
import { UserInvestment, IpoJar } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { formatMST } from "@/lib/formatUtils";
import { ArrowUpRight } from "lucide-react";

interface PortfolioRowProps {
  investment: UserInvestment;
  jar?: IpoJar;
  onOpenDrawer: (jar: IpoJar) => void;
}

export const PortfolioRow: React.FC<PortfolioRowProps> = ({
  investment,
  jar,
  onOpenDrawer,
}) => {
  return (
    <div className="bg-ink-surface border border-hairline rounded-card p-5 hover:border-hairline-bright transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase text-paper-dim">{investment.jarId}</span>
          <StatusBadge status={investment.status} label={jar?.statusLabel} />
        </div>
        <h3 className="font-serif text-xl font-bold text-paper">
          {jar?.name || "IPO Jar"}
        </h3>
        <div className="text-xs font-mono text-paper-muted">
          SECTOR: {jar?.sector} • ALLOTMENT DATE: {jar?.allotmentDate}
        </div>
      </div>

      <div className="flex items-center gap-8 text-xs font-mono">
        <div>
          <span className="text-[10px] uppercase text-paper-dim block">INVESTED</span>
          <span className="font-bold text-paper tabular-nums text-sm">
            {formatMST(investment.investedMst)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase text-paper-dim block">LOT OWNERSHIP</span>
          <span className="font-bold text-cobalt tabular-nums text-sm">
            {investment.poolSharePercent}%
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase text-paper-dim block">JAR STATUS</span>
          <span className="text-paper-muted">
            {investment.status === "LOCKED" ? "Awaiting Draw" : "Pooling Open"}
          </span>
        </div>

        {jar && (
          <button
            onClick={() => onOpenDrawer(jar)}
            className="p-2 rounded-btn bg-ink-elevated hover:bg-ink-elevated/80 text-paper border border-hairline"
            title="View Prospectus"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[1.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
