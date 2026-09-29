import React from "react";
import { JarStatus } from "@/types";

interface StatusBadgeProps {
  status: JarStatus;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = "" }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case "OPEN":
        return {
          dotColor: "bg-[#2FBF8F]",
          textColor: "text-[#EDEAE3]",
          defaultLabel: "Funding Open",
        };
      case "LOCKED":
        return {
          dotColor: "bg-[#E0A83A]",
          textColor: "text-[#EDEAE3]",
          defaultLabel: "Target Reached",
        };
      case "ALLOTTED":
        return {
          dotColor: "bg-[#5B8DEF]",
          textColor: "text-[#EDEAE3]",
          defaultLabel: "Bid Successful",
        };
      case "FAILED":
        return {
          dotColor: "bg-[#D95C5C]",
          textColor: "text-[#EDEAE3]",
          defaultLabel: "Bid Failed",
        };
      default:
        return {
          dotColor: "bg-paper-muted",
          textColor: "text-paper-muted",
          defaultLabel: status,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tag bg-ink-surface border border-hairline ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <span className={`text-[11px] font-mono tracking-tight ${config.textColor}`}>
        {label || config.defaultLabel}
      </span>
    </div>
  );
};
