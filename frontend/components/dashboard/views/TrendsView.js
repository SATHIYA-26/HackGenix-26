"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Activity,
  RefreshCw,
  LineChart,
} from "lucide-react";
import { getTrendsData } from "@/lib/api/trends";

export default function TrendsView({ onSelectProblem, company }) {
  const [trendsData, setTrendsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrends = () => {
    setIsLoading(true);
    getTrendsData(company?.id)
      .then((res) => {
        setTrendsData(res);
      })
      .catch((err) => {
        console.warn("Trends fetch error:", err);
        setTrendsData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTrends();
  }, [company?.id]);

  const emergingSignals = trendsData?.emerging || [];
  const risingProblems = trendsData?.rising || [];
  const decliningProblems = trendsData?.declining || [];
  const allTrends = trendsData?.allTrends || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">Signal Trends & Velocity</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Detect customer problem velocity shifts and emerging inflection points for {company?.name || "your account"}.
          </p>
        </div>

        <button
          onClick={fetchTrends}
          disabled={isLoading}
          className="p-1.5 rounded-lg border border-[#E5E1D8] bg-white text-[#71717A] hover:text-[#18181B] transition-colors self-start"
          title="Refresh trends"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#71717A]" />
          <p className="text-xs text-[#71717A]">Calculating trend velocity from backend...</p>
        </div>
      ) : allTrends.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <LineChart className="w-8 h-8 mx-auto text-[#A1A1AA]" />
          <h3 className="text-sm font-bold text-[#18181B]">No Trend Data Available</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            Trend velocity is calculated when problem clusters and feedback items are detected. Ingest customer signals or sync YouTube comments.
          </p>
        </div>
      ) : (
        <>
          {/* Emerging Signals Banner */}
          {emergingSignals.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-pulse"></span>
                  <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider">
                    New Emerging Signals (Surging Problem Clusters)
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
                    onClick={() => onSelectProblem && onSelectProblem(signal.problemId || signal.id)}
                    className="p-4 rounded-xl bg-white border border-[#FDE68A] hover:border-[#B45309] cursor-pointer transition-all hover:shadow-xs space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#18181B] group-hover:text-[#B45309] transition-colors truncate">
                        {signal.name}
                      </span>
                      <span className="text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded font-mono">
                        {signal.growthLabel}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717A] line-clamp-2">
                      {signal.shortExplanation}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-2 border-t border-[#FEF3C7]">
                      <span>Window: {signal.timeWindow || "7d"}</span>
                      <span className="font-bold text-[#18181B] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Inspect signal →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  <p className="text-xs text-[#71717A]">Highest positive growth over recent window</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E1D8] overflow-hidden">
                {risingProblems.length === 0 ? (
                  <p className="p-6 text-xs text-[#71717A] text-center">No accelerating problems detected.</p>
                ) : (
                  <div className="divide-y divide-[#ECE8E0]">
                    {risingProblems.map((prob) => (
                      <div
                        key={prob.id}
                        onClick={() => onSelectProblem && onSelectProblem(prob.problemId || prob.id)}
                        className="p-4 hover:bg-[#FBF9F5] cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="text-xs font-bold text-[#18181B] group-hover:text-[#4F46E5] truncate">
                            {prob.name}
                          </p>
                          <p className="text-[11px] text-[#71717A] mt-0.5">
                            {prob.currentCount} current mentions (vs {prob.previousCount} prior)
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-[#E11D48]">{prob.growthLabel}</p>
                          <p className="text-[10px] text-[#71717A]">Window: {prob.timeWindow || "7d"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Declining / Stabilized Problems */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
                    Declining or Stabilized Signals
                  </h2>
                  <p className="text-xs text-[#71717A]">Negative velocity or steady volume</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E1D8] overflow-hidden">
                {decliningProblems.length === 0 ? (
                  <p className="p-6 text-xs text-[#71717A] text-center">No declining problems detected.</p>
                ) : (
                  <div className="divide-y divide-[#ECE8E0]">
                    {decliningProblems.map((prob) => (
                      <div
                        key={prob.id}
                        onClick={() => onSelectProblem && onSelectProblem(prob.problemId || prob.id)}
                        className="p-4 hover:bg-[#FBF9F5] cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="text-xs font-bold text-[#18181B] group-hover:text-[#059669] truncate">
                            {prob.name}
                          </p>
                          <p className="text-[11px] text-[#71717A] mt-0.5">
                            {prob.currentCount} current mentions
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-[#059669]">{prob.growthLabel}</p>
                          <p className="text-[10px] text-[#71717A]">Window: {prob.timeWindow || "7d"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
