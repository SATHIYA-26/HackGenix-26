"use client";

import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2, MessageSquare, RefreshCw, FileText } from "lucide-react";
import { getProblems } from "@/lib/api/problems";
import { getAIBrief } from "@/lib/api/insights";

export default function InsightsView({ onSelectProblem, onSelectFeedback, company }) {
  const [problemsList, setProblemsList] = useState([]);
  const [aiBrief, setAiBrief] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = () => {
    setIsLoading(true);
    Promise.all([
      getProblems({ accountId: company?.id, sort: "priority" }),
      getAIBrief(company?.id),
    ])
      .then(([probsRes, briefRes]) => {
        setProblemsList(probsRes?.data || []);
        setAiBrief(briefRes);
      })
      .catch((err) => {
        console.warn("Insights fetch error:", err);
        setProblemsList([]);
        setAiBrief(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchInsights();
  }, [company?.id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">AI Feedback Insights</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Automated customer signal synthesis and problem discovery for {company?.name || "your account"}.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={isLoading}
          className="p-1.5 rounded-lg border border-[#E5E1D8] bg-white text-[#71717A] hover:text-[#18181B] transition-colors self-start"
          title="Refresh insights"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#71717A]" />
          <p className="text-xs text-[#71717A]">Synthesizing AI insights from backend...</p>
        </div>
      ) : problemsList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <FileText className="w-8 h-8 mx-auto text-[#A1A1AA]" />
          <h3 className="text-sm font-bold text-[#18181B]">No AI Insights Available</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            Insights are synthesized from customer feedback signals and discovered problem clusters. Ingest feedback or connect a YouTube source.
          </p>
        </div>
      ) : (
        <>
          {/* Executive AI Brief Header */}
          {aiBrief && aiBrief.shifts?.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                  {aiBrief.headline}
                </span>
              </div>
              <p className="text-xs text-[#5B21B6] leading-relaxed">
                {aiBrief.subheadline}
              </p>
            </div>
          )}

          {/* Feed of High-Value Insights */}
          <div className="space-y-4">
            {problemsList.map((prob) => (
              <div
                key={prob.id}
                className="p-6 rounded-2xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-all space-y-4 shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#7C3AED] uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Autonomous Signal
                      </span>
                      <span className="text-xs text-[#71717A]">
                        Category: <strong>{prob.category || "General"}</strong>
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#18181B]">{prob.name}</h2>
                    <p className="text-xs text-[#71717A]">
                      {prob.product} · Status: <span className="uppercase font-semibold">{prob.status}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded">
                      Priority {typeof prob.priorityScore === "number" ? prob.priorityScore.toFixed(2) : prob.priorityScore}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#3F3F46] leading-relaxed">
                  {prob.shortExplanation || prob.summary}
                </p>

                {/* Evidence summary bar */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-[#71717A]">
                    Evidence basis: <strong>{prob.feedbackCount} customer mentions</strong> with{" "}
                    <strong className="text-[#E11D48]">
                      {Math.round(prob.negativeSentiment * 100)}% negative polarity
                    </strong>
                    {prob.growthLabel && ` · Growth: ${prob.growthLabel}`}
                  </span>

                  <button
                    onClick={() => onSelectProblem && onSelectProblem(prob.id)}
                    className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>View Evidence Chain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
