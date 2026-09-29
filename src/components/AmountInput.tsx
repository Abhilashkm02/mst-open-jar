"use client";

import React from "react";
import { formatIndianNumber } from "@/lib/formatUtils";

interface AmountInputProps {
  value: number | "";
  onChange: (val: number | "") => void;
  minAmount: number;
  maxAmount: number;
  remainingCapacity: number;
  userBalance: number;
  disabled?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  minAmount,
  maxAmount,
  remainingCapacity,
  userBalance,
  disabled = false,
}) => {
  const maxPossible = Math.min(userBalance, remainingCapacity);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "") {
      onChange("");
      return;
    }
    const num = parseInt(raw, 10);
    onChange(isNaN(num) ? "" : num);
  };

  const handlePreset = (presetValue: number) => {
    const clamped = Math.min(presetValue, remainingCapacity);
    onChange(clamped);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Input Field with MST Suffix */}
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="numeric"
          value={value === "" ? "" : formatIndianNumber(value)}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="0"
          className="w-full h-12 bg-ink-elevated border border-hairline focus:border-cobalt rounded-input pl-4 pr-16 font-mono text-lg font-bold text-paper placeholder-paper-dim tabular-nums outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="absolute right-4 font-mono text-xs font-semibold uppercase tracking-wider text-paper-muted pointer-events-none">
          MST
        </span>
      </div>

      {/* Quick-select chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handlePreset(minAmount)}
          className="px-2.5 py-1 rounded-tag bg-ink-surface border border-hairline hover:border-hairline-bright text-[11px] font-mono text-paper-muted hover:text-paper transition-colors disabled:opacity-40"
        >
          Min ({formatIndianNumber(minAmount)})
        </button>

        <button
          type="button"
          disabled={disabled || 15 > maxPossible}
          onClick={() => handlePreset(15)}
          className="px-2.5 py-1 rounded-tag bg-ink-surface border border-hairline hover:border-hairline-bright text-[11px] font-mono text-paper-muted hover:text-paper transition-colors disabled:opacity-40"
        >
          15
        </button>

        <button
          type="button"
          disabled={disabled || 25 > maxPossible}
          onClick={() => handlePreset(25)}
          className="px-2.5 py-1 rounded-tag bg-ink-surface border border-hairline hover:border-hairline-bright text-[11px] font-mono text-paper-muted hover:text-paper transition-colors disabled:opacity-40"
        >
          25
        </button>

        <button
          type="button"
          disabled={disabled || maxPossible <= 0}
          onClick={() => handlePreset(maxPossible)}
          className="px-2.5 py-1 rounded-tag bg-ink-surface border border-hairline hover:border-hairline-bright text-[11px] font-mono text-cobalt hover:text-white transition-colors disabled:opacity-40 ml-auto"
        >
          Max Capacity
        </button>
      </div>
    </div>
  );
};
