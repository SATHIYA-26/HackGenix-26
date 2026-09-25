"use client";

import { useState } from "react";
import { Plus, Share2, Filter, Layers, BarChart3, TrendingUp, AlertTriangle, MessageSquare, CheckCircle2 } from "lucide-react";
import { PROBLEMS, RAW_FEEDBACK_ITEMS, CONNECTED_SOURCES } from "../data/intelligenceMockData";

export default function CustomDashboardsView({ onSelectProblem, onSelectFeedback }) {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [showShareToast, setShowShareToast] = useState(false);

  const topProblems = [...PROBLEMS].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 4);

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
              Executive View
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">Executive Customer Intelligence</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Unified multi-channel feedback digest, sentiment health, and core operational priority areas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Time range */}
          <div className="flex items-center rounded-lg border border-[#E5E1D8] bg-white p-0.5 text-xs">
            {["7d", "30d", "90d"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  selectedRange === r ? "bg-[#18181B] text-white" : "text-[#71717A] hover:text-[#18181B]"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleShare}
            className="h-8 px-3 rounded-lg border border-[#E5E1D8] bg-white text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA] flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {showShareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>Dashboard share link copied to clipboard!</span>
        </div>
      )}

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Total Feedback
          </span>
          <p className="text-2xl font-bold text-[#18181B] mt-1">12,482</p>
          <p className="text-[11px] text-[#059669] mt-0.5 font-semibold">▲ +14.2% volume growth</p>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Negative Sentiment
          </span>
          <p className="text-2xl font-bold text-[#059669] mt-1">9.7%</p>
          <p className="text-[11px] text-[#059669] mt-0.5 font-semibold">▼ -4.2% negative decrease</p>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Active Problems
          </span>
          <p className="text-2xl font-bold text-[#18181B] mt-1">15</p>
          <p className="text-[11px] text-[#71717A] mt-0.5">3 high-severity clusters</p>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Emerging Signals
          </span>
          <p className="text-2xl font-bold text-[#D97706] mt-1">4</p>
          <p className="text-[11px] text-[#D97706] mt-0.5 font-semibold">Fastest: Checkout crashes (+362%)</p>
        </div>
      </div>

      {/* Section: Priority Problems & Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highest Priority Problems (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#E11D48]" /> Highest-Priority Customer Problems
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E1D8] divide-y divide-[#ECE8E0] overflow-hidden">
            {topProblems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => onSelectProblem(prob.id)}
                className="p-4 hover:bg-[#FBF9F5] cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="min-w-0 pr-4">
                  <p className="text-xs font-bold text-[#18181B] group-hover:text-[#4F46E5] truncate">
                    {prob.name}
                  </p>
                  <p className="text-[11px] text-[#71717A] line-clamp-1 mt-0.5">
                    {prob.shortExplanation}
                  </p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#18181B] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#ECE8E0]">
                    Score {prob.priorityScore}
                  </span>
                  <span className="text-xs text-[#71717A] group-hover:text-[#18181B]">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Volume Breakdown (1 col) */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
            Volume by Feedback Source
          </h2>

          <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white space-y-3.5">
            {CONNECTED_SOURCES.filter((s) => s.status === "connected").map((src) => (
              <div key={src.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#18181B]">{src.name}</span>
                  <span className="text-[#71717A] font-mono">{src.totalFeedback.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-[#FAF8F5] rounded-full overflow-hidden border border-[#ECE8E0]">
                  <div
                    className="h-full bg-[#18181B] rounded-full"
                    style={{ width: `${Math.min(100, (src.totalFeedback / 20000) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
