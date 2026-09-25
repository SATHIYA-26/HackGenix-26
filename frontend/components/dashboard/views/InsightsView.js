"use client";

import { Sparkles, ShieldCheck, ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import { RECOMMENDATIONS, PROBLEMS } from "../data/intelligenceMockData";

export default function InsightsView({ onSelectProblem, onSelectFeedback }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#ECE8E0] pb-6">
        <h1 className="text-2xl font-bold text-[#18181B] font-serif">AI Feedback Insights</h1>
        <p className="text-xs text-[#71717A] mt-1">
          Automated customer signal synthesis backed by exact sentence quotes and aspect polarity classification.
        </p>
      </div>

      {/* Feed of High-Value Insights */}
      <div className="space-y-4">
        {PROBLEMS.slice(0, 5).map((prob) => (
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
                    Confidence: <strong>High (94%)</strong>
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#18181B]">{prob.name}</h2>
                <p className="text-xs text-[#71717A]">{prob.affectedUsers} on {prob.platform} ({prob.version})</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded">
                  Priority {prob.priorityScore}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#3F3F46] leading-relaxed">
              {prob.shortExplanation}
            </p>

            {/* Evidence summary bar */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[#71717A]">
                Evidence basis: <strong>{prob.feedbackCount} customer reviews</strong> with{" "}
                <strong className="text-[#E11D48]">{Math.round(prob.negativeSentiment * 100)}% negative polarity</strong>
              </span>

              <button
                onClick={() => onSelectProblem(prob.id)}
                className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View Full Evidence Chain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
