"use client";

import React, { useEffect, useState } from "react";
import { JarStatus } from "@/types";

interface JarGaugeProps {
  percentage: number; // 0 to 100
  status: JarStatus;
  variant?: "vertical" | "compact";
  additionalPercentage?: number; // for preview in drawer
  className?: string;
  showTicks?: boolean;
}

export const JarGauge: React.FC<JarGaugeProps> = ({
  percentage,
  status,
  variant = "vertical",
  additionalPercentage = 0,
  className = "",
  showTicks = true,
}) => {
  // Animated mount fill
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(Math.min(100, Math.max(0, percentage)));
    }, 50);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Color mapping based strictly on design system
  const getStatusColor = () => {
    switch (status) {
      case "OPEN":
        return {
          fill: "#2FBF8F", // Emerald
          fillSubtle: "rgba(47, 191, 143, 0.25)",
          preview: "rgba(47, 191, 143, 0.50)",
          border: "rgba(47, 191, 143, 0.40)",
        };
      case "LOCKED":
        return {
          fill: "#E0A83A", // Amber
          fillSubtle: "rgba(224, 168, 58, 0.25)",
          preview: "rgba(224, 168, 58, 0.50)",
          border: "rgba(224, 168, 58, 0.40)",
        };
      case "ALLOTTED":
        return {
          fill: "#5B8DEF", // Steel Blue
          fillSubtle: "rgba(91, 141, 239, 0.25)",
          preview: "rgba(91, 141, 239, 0.50)",
          border: "rgba(91, 141, 239, 0.40)",
        };
      case "FAILED":
        return {
          fill: "#D95C5C", // Brick Red
          fillSubtle: "rgba(217, 92, 92, 0.25)",
          preview: "rgba(217, 92, 92, 0.50)",
          border: "rgba(217, 92, 92, 0.40)",
        };
      default:
        return {
          fill: "#3D5AFE",
          fillSubtle: "rgba(61, 90, 254, 0.25)",
          preview: "rgba(61, 90, 254, 0.50)",
          border: "rgba(61, 90, 254, 0.40)",
        };
    }
  };

  const colors = getStatusColor();
  const isStatic = status === "LOCKED"; // locked is static, no wave

  // Generate unique sanitized IDs for SVG clip paths (remove colons for valid SVG url references)
  const rawClipId = React.useId();
  const clipId = rawClipId.replace(/[^a-zA-Z0-9-_]/g, "");

  // If compact horizontal version
  if (variant === "compact") {
    const clampedAdditional = Math.min(100 - animatedPercent, Math.max(0, additionalPercentage));

    return (
      <div className={`relative flex items-center gap-3 w-full ${className}`}>
        <div className="relative flex-1 h-3.5 bg-ink-elevated rounded-[3px] border border-white/10 overflow-hidden">
          {/* Base liquid */}
          <div
            className="h-full transition-all duration-1000 ease-editorial"
            style={{
              width: `${animatedPercent}%`,
              backgroundColor: colors.fill,
            }}
          />
          {/* Additional preview layer */}
          {clampedAdditional > 0 && (
            <div
              className="absolute top-0 bottom-0 transition-all duration-300"
              style={{
                left: `${animatedPercent}%`,
                width: `${clampedAdditional}%`,
                backgroundColor: colors.preview,
              }}
            />
          )}
          {/* Subtle tick marks at 25, 50, 75% */}
          <div className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-ink-subtle pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-ink-subtle pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-[75%] w-[1px] bg-ink-subtle pointer-events-none" />
        </div>
        <span className="font-mono text-xs font-semibold tabular-nums text-paper">
          {percentage}%
        </span>
      </div>
    );
  }

  // Large vertical SVG jar gauge
  // SVG Coordinate Space: 0 0 160 220
  // Jar body: width 100 (x: 30 to 130), height 160 (y: 40 to 200)
  // Neck: width 60 (x: 50 to 110), height 25 (y: 15 to 40)
  // Lip: width 70 (x: 45 to 115), height 6 (y: 9 to 15)
  // Fillable base height is y: 55 to y: 195 (total 140px)
  const baseY = 195;
  const maxHeight = 140;
  const currentFillHeight = (animatedPercent / 100) * maxHeight;
  const currentY = baseY - currentFillHeight;

  const additionalFillHeight = (Math.min(100 - animatedPercent, additionalPercentage) / 100) * maxHeight;
  const additionalY = currentY - additionalFillHeight;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 170 230"
        className="w-full h-auto max-h-[300px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Jar Internal Geometry Clip Path */}
          <clipPath id={`jar-inner-clip-${clipId}`}>
            <path
              d="M 50 18
                 L 110 18
                 L 110 40
                 C 110 48, 128 56, 128 66
                 L 128 190
                 C 128 196, 122 200, 116 200
                 L 44 200
                 C 38 200, 32 196, 32 190
                 L 32 66
                 C 32 56, 50 48, 50 40
                 Z"
            />
          </clipPath>

          {/* Faint subtle grid texture inside jar */}
          <pattern id={`jar-grid-${clipId}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Jar Background Glass / Lifted Surface */}
        <path
          d="M 50 18 L 110 18 L 110 40 C 110 48, 128 56, 128 66 L 128 190 C 128 196, 122 200, 116 200 L 44 200 C 38 200, 32 196, 32 190 L 32 66 C 32 56, 50 48, 50 40 Z"
          fill="#14161A"
          stroke="none"
        />

        {/* Interior grid */}
        <rect
          x="30"
          y="15"
          width="100"
          height="190"
          fill={`url(#jar-grid-${clipId})`}
          clipPath={`url(#jar-inner-clip-${clipId})`}
        />

        {/* Liquid Container clipped to jar interior */}
        <g clipPath={`url(#jar-inner-clip-${clipId})`}>
          {/* Base Liquid Fill */}
          <g className="transition-all duration-1000 ease-editorial">
            {/* Liquid Body Rect */}
            <rect
              x="20"
              y={currentY}
              width="120"
              height={currentFillHeight + 10}
              fill={colors.fill}
              opacity="0.85"
            />

            {/* Subtle Surface Wave */}
            {!isStatic && animatedPercent > 0 && animatedPercent < 100 && (
              <path
                d={`M 10 ${currentY} 
                    Q 35 ${currentY - 3}, 60 ${currentY} 
                    T 110 ${currentY} 
                    T 160 ${currentY} 
                    L 160 ${currentY + 6} 
                    L 10 ${currentY + 6} Z`}
                fill={colors.fill}
                opacity="0.95"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  from="-50 0"
                  to="0 0"
                  dur="7s"
                  repeatCount="indefinite"
                />
              </path>
            )}
          </g>

          {/* Additional Preview Layer (e.g. while entering investment amount) */}
          {additionalFillHeight > 0 && (
            <g className="transition-all duration-300">
              <rect
                x="20"
                y={additionalY}
                width="120"
                height={additionalFillHeight}
                fill={colors.preview}
              />
              <line
                x1="32"
                y1={additionalY}
                x2="128"
                y2={additionalY}
                stroke="rgba(255,255,255,0.4)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            </g>
          )}
        </g>

        {/* Jar Outline (Hairline Stroke 1.25px) */}
        <path
          d="M 50 18
             L 110 18
             L 110 40
             C 110 48, 128 56, 128 66
             L 128 190
             C 128 196, 122 200, 116 200
             L 44 200
             C 38 200, 32 196, 32 190
             L 32 66
             C 32 56, 50 48, 50 40
             Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="1.5"
        />

        {/* Jar Lip Rim */}
        <rect
          x="46"
          y="12"
          width="68"
          height="6"
          rx="2"
          fill="#1A1D22"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1.2"
        />

        {/* Side Tick Marks & Mono Labels (at 25%, 50%, 75%, 100%) */}
        {showTicks && (
          <g className="font-mono text-[9px] fill-[#8B8D93] select-none" style={{ letterSpacing: "-0.02em" }}>
            {/* 100% Mark (y: 55) */}
            <line x1="128" y1="55" x2="135" y2="55" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />
            <text x="138" y="58" alignmentBaseline="middle">100%</text>

            {/* 75% Mark (y: 90) */}
            <line x1="128" y1="90" x2="133" y2="90" stroke="rgba(255, 255, 255, 0.20)" strokeWidth="1" />
            <text x="138" y="93" alignmentBaseline="middle">75%</text>

            {/* 50% Mark (y: 125) */}
            <line x1="128" y1="125" x2="135" y2="125" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1" />
            <text x="138" y="128" alignmentBaseline="middle">50%</text>

            {/* 25% Mark (y: 160) */}
            <line x1="128" y1="160" x2="133" y2="160" stroke="rgba(255, 255, 255, 0.20)" strokeWidth="1" />
            <text x="138" y="163" alignmentBaseline="middle">25%</text>

            {/* Left side minimal tick marks */}
            <line x1="25" y1="55" x2="32" y2="55" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            <line x1="27" y1="90" x2="32" y2="90" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            <line x1="25" y1="125" x2="32" y2="125" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            <line x1="27" y1="160" x2="32" y2="160" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
          </g>
        )}
      </svg>
    </div>
  );
};
