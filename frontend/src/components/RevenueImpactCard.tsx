'use client';

import React, { useState } from 'react';
import { revenueImpactDistribution } from '@/lib/data';
import { ProblemCluster } from '@/lib/types';
import { DollarSign, Info } from 'lucide-react';

interface RevenueImpactCardProps {
  onSelectClusterByLabel?: (label: string) => void;
}

export default function RevenueImpactCard({ onSelectClusterByLabel }: RevenueImpactCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxMrr = 15.0; // scale up to 15k

  return (
    <div className="cm-card p-6 h-full flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            What issues are having the biggest impact on revenue?
          </h2>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start sm:self-auto">
            ARR at Risk: $450k
          </span>
        </div>

        <p className="text-xs text-slate-400 font-medium mb-3">
          Sentiment distribution, Last 12 months
        </p>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] ring-2 ring-rose-100" />
            <span>Negative Sentiment Drivers</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Baseline Volatility</span>
          </div>
        </div>

        {/* Vertical Bar Chart Container */}
        <div className="relative pt-6 pb-2">
          {/* Dotted horizontal guideline rules */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
            <div className="border-b border-dashed border-slate-200 w-full flex items-center justify-start">
              <span className="text-[10px] text-slate-400 -mt-4 pl-1 font-mono">15.0k</span>
            </div>
            <div className="border-b border-dashed border-slate-200 w-full flex items-center justify-start">
              <span className="text-[10px] text-slate-400 -mt-4 pl-1 font-mono">10.0k</span>
            </div>
            <div className="border-b border-dashed border-slate-200 w-full flex items-center justify-start">
              <span className="text-[10px] text-slate-400 -mt-4 pl-1 font-mono">5.0k</span>
            </div>
            <div className="border-b border-slate-200 w-full flex items-center justify-start">
              <span className="text-[10px] text-slate-400 -mt-4 pl-1 font-mono">0</span>
            </div>
          </div>

          {/* Bars Grid */}
          <div className="relative z-10 grid grid-cols-6 gap-2 sm:gap-4 h-48 items-end pl-8 pr-2">
            {revenueImpactDistribution.map((item, idx) => {
              const heightPercent = Math.min(Math.round((item.mrr / maxMrr) * 100), 100);
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center h-full justify-end cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSelectClusterByLabel && onSelectClusterByLabel(item.label)}
                >
                  {/* Floating tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-44 px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-medium shadow-xl pointer-events-none z-30 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                      <div className="font-bold text-rose-300">${item.mrr}k MRR at risk</div>
                      <div className="text-slate-300">{item.count} complaints linked</div>
                    </div>
                  )}

                  {/* Value tag inside or above bar */}
                  <div
                    className={`text-[11px] font-bold text-white transition-opacity duration-200 z-10 -mb-5 ${
                      heightPercent > 20 ? 'opacity-90' : 'text-slate-700 -mb-6'
                    }`}
                  >
                    {item.count}
                  </div>

                  {/* Vertical bar with rounded top */}
                  <div
                    className="w-full max-w-[48px] bg-[#dc2626] rounded-t-xl group-hover:bg-[#b91c1c] transition-all duration-300 shadow-sm"
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Bottom Category Label */}
                  <div className="w-full text-center mt-2.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight block">
                      {item.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info size={12} />
          <span>Calculated via churn probability & average transaction basket</span>
        </span>
        <span className="font-semibold text-slate-700">6 Clusters Monitored</span>
      </div>
    </div>
  );
}
