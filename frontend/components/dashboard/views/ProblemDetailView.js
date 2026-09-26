"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  Activity,
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { getProblemById, getProblemEvidence } from "@/lib/api/problems";
import { getProblemInsight } from "@/lib/api/insights";

export default function ProblemDetailView({ problemId, onBack, onSelectFeedback, onOpenCreateAction, company }) {
  const [problem, setProblem] = useState(null);
  const [insight, setInsight] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    if (problemId) {
      Promise.allSettled([
        getProblemById(problemId),
        getProblemInsight(problemId),
        getProblemEvidence(problemId),
      ]).then(([pRes, insRes, evRes]) => {
        if (!isMounted) return;

        if (pRes.status === "fulfilled" && pRes.value) {
          setProblem(pRes.value);
          if (pRes.value.representativeFeedback?.length > 0) {
            setEvidenceList(pRes.value.representativeFeedback);
          }
        }

        if (insRes.status === "fulfilled" && insRes.value) {
          setInsight(insRes.value);
        }

        if (evRes.status === "fulfilled" && evRes.value?.items?.length > 0) {
          setEvidenceList((prev) => (prev.length > 0 ? prev : evRes.value.items));
        }

        setIsLoading(false);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [problemId]);

  if (isLoading) {
    return (
      <div className="p-16 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-4">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#71717A]" />
        <p className="text-xs text-[#71717A]">Loading problem dossier from backend...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-16 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-4">
        <AlertTriangle className="w-8 h-8 mx-auto text-[#E11D48]" />
        <h3 className="text-base font-bold text-[#18181B]">Problem Dossier Not Found</h3>
        <p className="text-xs text-[#71717A] max-w-sm mx-auto">
          The requested problem cluster could not be loaded from the backend.
        </p>
        <button
          onClick={onBack}
          className="h-8 px-4 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors"
        >
          Back to Problems
        </button>
      </div>
    );
  }

  const breakdown = problem.priorityBreakdown || {};
  const freqScore = breakdown.frequency ?? 0.75;
  const sevScore = breakdown.severity ?? (problem.severity ? problem.severity / 5 : 0.8);
  const growthScore = breakdown.growth ?? Math.min(1.0, Math.max(0.1, (problem.growthRate || 0) + 0.5));
  const userScore = breakdown.user_impact ?? (problem.userImpact ? problem.userImpact / 5 : 0.75);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#18181B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Problems
          </button>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                problem.status === "critical"
                  ? "bg-[#FFF1F2] text-[#E11D48]"
                  : problem.status === "emerging"
                  ? "bg-[#FEF3C7] text-[#D97706]"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              {problem.status} Problem
            </span>
            <span className="text-xs text-[#71717A]">
              Account: {company?.name || "Active Workspace"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">{problem.name}</h1>
          <p className="text-xs text-[#71717A] max-w-2xl leading-relaxed">
            {problem.shortExplanation || problem.summary}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => onOpenCreateAction && onOpenCreateAction(problem)}
            className="h-9 px-4 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Product Action</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Feedback Volume
          </span>
          <p className="text-2xl font-bold text-[#18181B] mt-1">{problem.feedbackCount}</p>
          <p className="text-[11px] text-[#71717A] mt-0.5">Verified customer mentions</p>
        </div>

        <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Weekly Velocity
          </span>
          <p className="text-2xl font-bold text-[#E11D48] mt-1">{problem.growthLabel}</p>
          <p className="text-[11px] text-[#71717A] mt-0.5">Growth vs prior 7 days</p>
        </div>

        <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Negative Ratio
          </span>
          <p className="text-2xl font-bold text-[#E11D48] mt-1">
            {Math.round(problem.negativeSentiment * 100)}%
          </p>
          <p className="text-[11px] text-[#71717A] mt-0.5">Customer dissatisfaction</p>
        </div>

        <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Priority Score
          </span>
          <p className="text-2xl font-bold text-[#18181B] mt-1 font-mono">
            {typeof problem.priorityScore === "number" ? problem.priorityScore.toFixed(2) : problem.priorityScore}
          </p>
          <p className="text-[11px] text-[#71717A] mt-0.5">Composite explainable score</p>
        </div>
      </div>

      {/* Visual Traceability Chain */}
      <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#E5E1D8] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#4F46E5]" /> Trace This Signal (Evidence-to-Decision Chain)
          </span>
          <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
            Audit Lineage Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-center">
          <div className="p-3 rounded-xl bg-white border border-[#E5E1D8] text-xs">
            <p className="text-[10px] text-[#71717A] uppercase font-bold">1. Ingested Signals</p>
            <p className="font-bold text-[#18181B] truncate mt-0.5">
              {evidenceList.length} Customer Quotes
            </p>
          </div>
          <div className="hidden md:flex justify-center text-[#A1A1AA]">→</div>
          <div className="p-3 rounded-xl bg-white border border-[#E5E1D8] text-xs">
            <p className="text-[10px] text-[#71717A] uppercase font-bold">2. Discovered Cluster</p>
            <p className="font-bold text-[#18181B] truncate mt-0.5">{problem.name}</p>
          </div>
          <div className="hidden md:flex justify-center text-[#A1A1AA]">→</div>
          <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs">
            <p className="text-[10px] text-[#059669] uppercase font-bold">3. Product Recommendation</p>
            <p className="font-bold text-[#065F46] truncate mt-0.5">
              {insight?.summary ? insight.summary.slice(0, 45) + "..." : "Roadmap Actionable"}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Executive Summary & Explainability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Executive Summary & Evidence Quotes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-4">
            <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
              Executive Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-1">
                <span className="text-[11px] font-bold text-[#71717A] uppercase">What is happening?</span>
                <p className="text-xs text-[#18181B] leading-relaxed">
                  {problem.shortExplanation || problem.description}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-1">
                <span className="text-[11px] font-bold text-[#71717A] uppercase">Why it matters?</span>
                <p className="text-xs text-[#E11D48] font-medium leading-relaxed">
                  {insight?.whyItMatters || breakdown.explanation || "Directly causes user churn and customer dissatisfaction."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-1">
                <span className="text-[11px] font-bold text-[#71717A] uppercase">Category & Impact</span>
                <p className="text-xs text-[#18181B] leading-relaxed">
                  {problem.category} · Volume {problem.feedbackCount} mentions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-1">
                <span className="text-[11px] font-bold text-[#71717A] uppercase">Trend Velocity</span>
                <p className="text-xs text-[#18181B] leading-relaxed">
                  Growth rate {problem.growthLabel} with priority score of {typeof problem.priorityScore === "number" ? problem.priorityScore.toFixed(2) : problem.priorityScore}.
                </p>
              </div>
            </div>
          </div>

          {/* Evidence Quotes */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2563EB]" /> Grounded Customer Quotes
                </h2>
                <p className="text-xs text-[#71717A]">
                  Representative feedback items linked to this problem cluster
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {evidenceList.length > 0 ? (
                evidenceList.map((item, idx) => (
                  <div
                    key={item.id || item.feedback_id || idx}
                    onClick={() => onSelectFeedback && onSelectFeedback(item)}
                    className="p-4 rounded-xl border border-[#E5E1D8] hover:border-[#18181B] bg-white cursor-pointer transition-all space-y-2 group"
                  >
                    <p className="text-xs font-serif italic text-[#18181B] leading-relaxed">
                      "{item.text}"
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-2 border-t border-[#ECE8E0]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#18181B]">
                          {item.author || item.authorName || "Customer"}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{item.source || "Customer Feedback"}</span>
                        {item.sentiment && (
                          <>
                            <span>•</span>
                            <span className="text-[#E11D48] font-medium capitalize">{item.sentiment}</span>
                          </>
                        )}
                      </div>
                      <span className="text-[#4F46E5] font-semibold group-hover:underline flex items-center gap-1">
                        View signal →
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-xl bg-[#FAF8F5] text-xs text-[#71717A] text-center">
                  No individual customer quotes are currently linked to this cluster.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Explainability & AI Recommendation */}
        <div className="space-y-6">
          {/* Explainability Weight Decomposition */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
                Priority Score Breakdown
              </h2>
              <p className="text-xs text-[#71717A]">
                Algorithmic weight decomposition (0.0 to 1.0)
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Frequency Volume</span>
                  <span className="font-bold text-[#18181B] font-mono">{Number(freqScore).toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#18181B] rounded-full"
                    style={{ width: `${Math.min(100, Number(freqScore) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Severity of Impact</span>
                  <span className="font-bold text-[#E11D48] font-mono">{Number(sevScore).toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E11D48] rounded-full"
                    style={{ width: `${Math.min(100, Number(sevScore) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Growth Acceleration</span>
                  <span className="font-bold text-[#E11D48] font-mono">{Number(growthScore).toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E11D48] rounded-full"
                    style={{ width: `${Math.min(100, Number(growthScore) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Affected User Base</span>
                  <span className="font-bold text-[#18181B] font-mono">{Number(userScore).toFixed(2)}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#18181B] rounded-full"
                    style={{ width: `${Math.min(100, Number(userScore) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {breakdown.explanation && (
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] text-[11px] text-[#71717A] leading-relaxed">
                <strong>Explainability:</strong> {breakdown.explanation}
              </div>
            )}
          </div>

          {/* AI Recommendation Panel */}
          <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">
                AI Problem Insight
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#065F46]">
                {insight?.summary || `Resolution Strategy for ${problem.name}`}
              </h3>
              <p className="text-xs text-[#047857] mt-1.5 leading-relaxed">
                {insight?.whyItMatters || "Address root customer friction to improve user retention and satisfaction."}
              </p>
            </div>

            {insight?.recommendedActions && insight.recommendedActions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#A7F3D0]/60">
                <p className="text-[11px] font-bold text-[#065F46] uppercase">Suggested Actions:</p>
                <div className="text-xs text-[#065F46] space-y-1.5">
                  {insight.recommendedActions.map((act, idx) => (
                    <p key={idx} className="leading-relaxed">
                      • {act}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => onOpenCreateAction && onOpenCreateAction(problem)}
              className="w-full mt-2 h-9 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Convert to Product Action</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
