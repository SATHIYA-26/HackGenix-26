"use client";

import { TrendingUp, TrendingDown, Sparkles, ArrowRight, AlertTriangle, Activity } from "lucide-react";
import { PROBLEMS } from "../data/intelligenceMockData";

export default function TrendsView({ onSelectProblem }) {
  const risingProblems = PROBLEMS.filter((p) => p.growthRate > 0.2).sort((a, b) => b.growthRate - a.growthRate);
  const decliningProblems = PROBLEMS.filter((p) => p.growthRate < 0).sort((a, b) => a.growthRate - b.growthRate);
  const emergingSignals = PROBLEMS.filter((p) => p.status === "emerging");

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#ECE8E0] pb-6">
        <h1 className="text-2xl font-bold text-[#18181B] font-serif">Signal Trends & Velocity</h1>
        <p className="text-xs text-[#71717A] mt-1">
          Detect customer problem velocity shifts before they escalate into revenue-critical churn.
        </p>
      </div>

      {/* Section 23: Emerging Signals Banner (Crucial Workflow) */}
      <div className="p-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-pulse"></span>
            <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider">
              NEW EMERGING SIGNALS (What wasn't important before, but is surging now)
            </span>
          </div>
          <span className="text-xs font-semibold text-[#92400E]">
            {emergingSignals.length} Active Inflection Points
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergingSignals.map((signal) => (
            <div
              key={signal.id}
              onClick={() => onSelectProblem(signal.id)}
              className="p-4 rounded-xl bg-white border border-[#FDE68A] hover:border-[#B45309] cursor-pointer transition-all hover:shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#18181B] group-hover:text-[#B45309] transition-colors truncate">
                  {signal.name}
                </span>
                <span className="text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded font-mono">
                  ↑ {signal.growthLabel}
                </span>
              </div>
              <p className="text-xs text-[#71717A] line-clamp-2">
                {signal.shortExplanation}
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-2 border-t border-[#FEF3C7]">
                <span>First detected: {signal.firstDetected}</span>
                <span className="font-bold text-[#18181B] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Inspect signal →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Rising vs Declining Problems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rising Problems */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
                Rising Problems (Accelerating Churn Risk)
              </h2>
              <p className="text-xs text-[#71717A]">Highest negative velocity over past 14 days</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E1D8] overflow-hidden">
            <div className="divide-y divide-[#ECE8E0]">
              {risingProblems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => onSelectProblem(prob.id)}
                  className="p-4 hover:bg-[#FBF9F5] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-bold text-[#18181B] group-hover:text-[#4F46E5] truncate">
                      {prob.name}
                    </p>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      {prob.product} · {prob.platform} · {prob.feedbackCount} feedback
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#E11D48]">↑ {prob.growthLabel}</p>
                    <p className="text-[10px] text-[#71717A]">Priority {prob.priorityScore}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Declining Problems */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
                Declining Problems (Positive Momentum)
              </h2>
              <p className="text-xs text-[#71717A]">Friction points abating following recent fixes</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E1D8] overflow-hidden">
            <div className="divide-y divide-[#ECE8E0]">
              {decliningProblems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => onSelectProblem(prob.id)}
                  className="p-4 hover:bg-[#FBF9F5] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-bold text-[#18181B] group-hover:text-[#059669] truncate">
                      {prob.name}
                    </p>
                    <p className="text-[11px] text-[#71717A] mt-0.5">
                      {prob.product} · {prob.feedbackCount} mentions remaining
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#059669]">↓ {prob.growthLabel}</p>
                    <p className="text-[10px] text-[#71717A]">Score {prob.priorityScore}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
