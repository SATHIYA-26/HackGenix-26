"use client";

import { Lightbulb, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Plus, Check } from "lucide-react";
import { RECOMMENDATIONS, PROBLEMS } from "../data/intelligenceMockData";

export default function RecommendationsView({ onSelectProblem, onOpenCreateAction, company }) {
  const problemsList = company?.problems && company.problems.length > 0 ? company.problems : PROBLEMS;

  const recommendationsList = company?.problems && company.problems.length > 0
    ? company.problems.map((prob, idx) => ({
        id: `rec-${prob.id}`,
        problemId: prob.id,
        problemName: prob.name,
        title: `Resolution Plan: ${prob.name}`,
        evidenceSummary: `${prob.feedbackCount} customer voices · ${(prob.negativeSentiment * 100).toFixed(0)}% negative · ${prob.growthLabel} velocity`,
        priorityScore: prob.priorityScore,
        affectedArea: `${prob.category} · ${prob.platform} (${prob.version})`,
        rationale: prob.shortExplanation,
        actionItems: [
          `1. Address root issue: ${prob.whyItMatters}`,
          `2. Continuous VoC sentiment monitoring on ${prob.sources?.join(", ") || "review channels"}.`,
        ],
        status: prob.status === "critical" ? "Needs Review" : "In Evaluation",
        owner: company.ownerName || "Operations Lead",
      }))
    : RECOMMENDATIONS;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#ECE8E0] pb-6">
        <h1 className="text-2xl font-bold text-[#18181B] font-serif">Product Decision Workspace</h1>
        <p className="text-xs text-[#71717A] mt-1">
          Evidence-grounded action recommendations synthesized from recurring customer friction signals.
        </p>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {recommendationsList.map((rec) => {
          const associatedProb = problemsList.find((p) => p.id === rec.problemId);

          return (
            <div
              key={rec.id}
              className="p-6 rounded-2xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-all space-y-4 shadow-xs"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Recommendation
                    </span>
                    <span className="text-xs text-[#71717A]">
                      Cluster: <strong>{rec.problemName}</strong>
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#18181B]">{rec.title}</h2>
                  <p className="text-xs text-[#71717A]">{rec.affectedArea}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase block">
                      Priority Score
                    </span>
                    <span className="font-mono text-base font-bold text-[#18181B]">
                      {rec.priorityScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rationale and Evidence Statement */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] text-xs space-y-1.5">
                <p className="font-bold text-[#18181B]">Why this recommendation?</p>
                <p className="text-[#3F3F46] leading-relaxed">{rec.rationale}</p>
                <p className="text-[11px] text-[#71717A] font-semibold pt-1">
                  Evidence basis: {rec.evidenceSummary}
                </p>
              </div>

              {/* Action Items List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
                  Suggested Action Items:
                </p>
                <div className="space-y-1 text-xs text-[#3F3F46]">
                  {rec.actionItems?.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-3 border-t border-[#ECE8E0] flex items-center justify-between">
                <span className="text-xs text-[#71717A]">
                  Owner: <strong>{rec.owner}</strong>
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onSelectProblem(rec.problemId)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E5E1D8] text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA] transition-colors"
                  >
                    Review Evidence ({associatedProb?.feedbackCount || 127})
                  </button>
                  <button
                    onClick={() => onOpenCreateAction && onOpenCreateAction(associatedProb)}
                    className="px-4 py-1.5 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Create Product Action</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
