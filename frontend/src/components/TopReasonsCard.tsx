'use client';

import React from 'react';
import { ProblemCluster } from '@/lib/types';
import { TrendingUp, ArrowRight, ExternalLink } from 'lucide-react';

interface TopReasonsCardProps {
  clusters: ProblemCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (cluster: ProblemCluster) => void;
  onOpenEvidence: (cluster: ProblemCluster) => void;
}

export default function TopReasonsCard({
  clusters,
  selectedClusterId,
  onSelectCluster,
  onOpenEvidence
}: TopReasonsCardProps) {
  // Sort by feedback count descending
  const sortedClusters = [...clusters].sort((a, b) => b.feedbackCount - a.feedbackCount).slice(0, 5);
  const maxCount = Math.max(...sortedClusters.map(c => c.feedbackCount), 2500);

  return (
    <div className="cm-card p-6 h-full flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Top Reasons for Negativity
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Ranked by semantic vector clusters & negative volume
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full">
            Last 30 Days
          </span>
        </div>

        {/* Horizontal Bar Chart Rows */}
        <div className="space-y-4">
          {sortedClusters.map((cluster, index) => {
            const isTopDriver = index === 0;
            const barWidthPercent = Math.min(Math.round((cluster.feedbackCount / maxCount) * 100), 100);
            const isSelected = selectedClusterId === cluster.id;

            return (
              <div
                key={cluster.id}
                onClick={() => onSelectCluster(cluster)}
                className={`group cursor-pointer rounded-xl p-2.5 -mx-2.5 transition-all duration-150 ${
                  isSelected ? 'bg-blue-50/70 ring-1 ring-blue-400/40' : 'hover:bg-slate-50'
                }`}
              >
                {/* Text and Count Header */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 max-w-[70%] truncate">
                    <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {cluster.title}
                    </span>
                    {isTopDriver && (
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md shrink-0">
                        Top Driver
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                      <TrendingUp size={11} />
                      +{cluster.growthRate}%
                    </span>
                    <span className="font-bold text-slate-700 text-xs w-11 text-right font-mono">
                      {cluster.feedbackCount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* The Bar */}
                <div className="flex items-center gap-3">
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTopDriver 
                          ? 'bg-[#dc2626] shadow-sm shadow-rose-500/20' 
                          : 'bg-[#0891b2] shadow-sm shadow-cyan-600/20'
                      }`}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </div>

                  {/* Evidence inspect link icon on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEvidence(cluster);
                    }}
                    title="Inspect traceable evidence quotes"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-all shrink-0"
                  >
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Footer / Tip */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any row to drill down into raw feedback evidence</span>
        <button 
          onClick={() => onOpenEvidence(sortedClusters[0])}
          className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
        >
          <span>View all traces</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
