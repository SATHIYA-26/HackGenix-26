'use client';

import React from 'react';
import { sentimentBreakdown } from '@/lib/data';
import { TrendingDown, Info, ShieldCheck } from 'lucide-react';

interface SentimentHealthCardProps {
  onOpenDetails?: () => void;
}

export default function SentimentHealthCard({ onOpenDetails }: SentimentHealthCardProps) {
  // Sparkline coordinates
  const sparklineData = sentimentBreakdown.sparklineData;
  const minVal = Math.min(...sparklineData) - 2;
  const maxVal = Math.max(...sparklineData) + 2;
  const width = 320;
  const height = 45;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal)) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="cm-card p-6 h-full flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              NPS Score
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Net customer sentiment & satisfaction index
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-full">
            Last 30 Days
          </span>
        </div>

        {/* Central Segmented Donut Gauge */}
        <div className="flex flex-col items-center justify-center my-3 relative">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* SVG Segmented Gauge Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="10"
              />

              {/* Positive Arc (Emerald Green: 58%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#10b981"
                strokeWidth="10"
                strokeDasharray="238.76"
                strokeDashoffset="100.28" // 58% of 238.76
                strokeLinecap="round"
                className="transition-all duration-1000"
              />

              {/* Neutral Arc (Slate Blue: 18%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="10"
                strokeDasharray="42.97 238.76"
                strokeDashoffset="-138.48"
                strokeLinecap="round"
              />

              {/* Negative Arc (Crimson Red: 24%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#e11d48"
                strokeWidth="10"
                strokeDasharray="57.30 238.76"
                strokeDashoffset="-181.45"
                strokeLinecap="round"
              />

              {/* Inner subtle dotted ring */}
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
            </svg>

            {/* Centered Score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                {sentimentBreakdown.score}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                NPS points
              </span>
            </div>
          </div>

          {/* Quick Segment Breakdown Badges */}
          <div className="flex items-center justify-center gap-4 text-xs font-semibold mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-700">58% Positive</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-500">18% Neutral</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-rose-600">24% Negative</span>
            </div>
          </div>
        </div>

        {/* Bottom Sparkline Wave */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-medium text-slate-400">30-Day Trend Trajectory</span>
            <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5">
              <TrendingDown size={12} />
              -4.2 pts post-rollout
            </span>
          </div>

          <div className="h-12 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
              {/* Soft Gradient Fill below line */}
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <polygon
                points={`0,${height} ${points} ${width},${height}`}
                fill="url(#sparklineGrad)"
              />

              {/* The Sparkline Stroke */}
              <polyline
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />

              {/* Dip point pulse indicator */}
              <circle cx={width * 0.78} cy={height * 0.88} r="3.5" fill="#e11d48" className="animate-ping opacity-75" />
              <circle cx={width * 0.78} cy={height * 0.88} r="3" fill="#e11d48" />
            </svg>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>51,590 total responses analyzed</span>
        <button
          onClick={onOpenDetails}
          className="text-blue-600 font-semibold hover:underline"
        >
          View methodology
        </button>
      </div>
    </div>
  );
}
