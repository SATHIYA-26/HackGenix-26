"use client";

import { useState } from "react";
import { ArrowLeft, AlertTriangle, ShieldCheck, CheckCircle2, MessageSquare, ExternalLink, Activity, ArrowRight, Sparkles, User, Layers, Share2, Plus } from "lucide-react";
import { PROBLEMS, RAW_FEEDBACK_ITEMS, RECOMMENDATIONS } from "../data/intelligenceMockData";

export default function ProblemDetailView({ problemId, onBack, onSelectFeedback, onOpenCreateAction, company }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview", "evidence", "analytics"

  const problemsList = company?.problems && company.problems.length > 0 ? company.problems : PROBLEMS;
  const problem = problemsList.find((p) => p.id === problemId) || PROBLEMS.find((p) => p.id === problemId) || problemsList[0] || PROBLEMS[0];
  const allFeedback = [...(company?.recentFeedback || []), ...RAW_FEEDBACK_ITEMS];
  const relatedFeedback = allFeedback.filter((f) => f.problemId === problem.id);
  const recommendation = RECOMMENDATIONS.find((r) => r.problemId === problem.id) || RECOMMENDATIONS[0];

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
              Detected: {problem.firstDetected}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">{problem.name}</h1>
          <p className="text-xs text-[#71717A] max-w-2xl leading-relaxed">
            {problem.shortExplanation}
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
          <p className="text-2xl font-bold text-[#E11D48] mt-1">↑ {problem.growthLabel}</p>
          <p className="text-[11px] text-[#71717A] mt-0.5">Growth vs prior 7 days</p>
        </div>

        <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Negative Ratio
          </span>
          <p className="text-2xl font-bold text-[#E11D48] mt-1">
            {Math.round(problem.negativeSentiment * 100)}%
          </p>
          <p className="text-[11px] text-[#71717A] mt-0.5">High dissatisfaction signal</p>
        </div>

        <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Priority Score
          </span>
          <p className="text-2xl font-bold text-[#18181B] mt-1 font-mono">
            {problem.priorityScore}
          </p>
          <p className="text-[11px] text-[#71717A] mt-0.5">High product urgency</p>
        </div>
      </div>

      {/* Section 21: Visual Traceability Chain (Signature Feature) */}
      <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#E5E1D8] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#4F46E5]" /> Trace This Signal (Evidence-to-Decision Chain)
          </span>
          <span className="text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
            100% Traceable
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-center">
          <div className="p-3 rounded-xl bg-white border border-[#E5E1D8] text-xs">
            <p className="text-[10px] text-[#71717A] uppercase font-bold">1. Signal</p>
            <p className="font-bold text-[#18181B] truncate mt-0.5">{problem.sources.join(", ")}</p>
          </div>
          <div className="hidden md:flex justify-center text-[#A1A1AA]">→</div>
          <div className="p-3 rounded-xl bg-white border border-[#E5E1D8] text-xs">
            <p className="text-[10px] text-[#71717A] uppercase font-bold">2. Cluster</p>
            <p className="font-bold text-[#18181B] truncate mt-0.5">{problem.name}</p>
          </div>
          <div className="hidden md:flex justify-center text-[#A1A1AA]">→</div>
          <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs">
            <p className="text-[10px] text-[#059669] uppercase font-bold">3. Product Decision</p>
            <p className="font-bold text-[#065F46] truncate mt-0.5">{recommendation.title}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Executive Summary & Explainability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Executive Summary & Evidence Quotes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary (Section 16) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-4">
            <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
              Executive Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-1">
                <span className="text-[11px] font-bold text-[#71717A] uppercase">What is happening?</span>
                <p className="text-xs text-[#18181B] leading-relaxed">
                  {problem.shortExplanation}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-1">
                <span className="text-[11px] font-bold text-[#71717A] uppercase">Why it matters?</span>
                <p className="text-xs text-[#E11D48] font-medium leading-relaxed">
                  {problem.whyItMatters}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-1">
                <span className="text-[11px] font-bold text-[#71717A] uppercase">Who is affected?</span>
                <p className="text-xs text-[#18181B] leading-relaxed">
                  {problem.affectedUsers} on {problem.platform} ({problem.version}).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-1">
                <span className="text-[11px] font-bold text-[#71717A] uppercase">What changed?</span>
                <p className="text-xs text-[#18181B] leading-relaxed">
                  Velocity accelerated by {problem.growthLabel} since {problem.firstDetected} following the latest release.
                </p>
              </div>
            </div>
          </div>

          {/* Section 17: Evidence (Representative Feedback Items) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2563EB]" /> Grounded Evidence
                </h2>
                <p className="text-xs text-[#71717A]">
                  {problem.feedbackCount} related customer voices supporting this problem classification
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {relatedFeedback.length > 0 ? (
                relatedFeedback.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectFeedback && onSelectFeedback(item)}
                    className="p-4 rounded-xl border border-[#E5E1D8] hover:border-[#18181B] bg-white cursor-pointer transition-all space-y-2 group"
                  >
                    <p className="text-xs font-serif italic text-[#18181B] leading-relaxed">
                      “{item.text}”
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-2 border-t border-[#ECE8E0]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#18181B]">{item.authorName}</span>
                        <span>•</span>
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{item.platform}</span>
                      </div>
                      <span className="text-[#4F46E5] font-semibold group-hover:underline flex items-center gap-1">
                        Inspect signal →
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#FAF8F5] text-xs text-[#71717A] text-center">
                  Representative feedback items are indexed in raw feedback store.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Explainability & Recommendation (Sections 19 & 20) */}
        <div className="space-y-6">
          {/* Section 19: Why Priority is High (Explainable AI) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E1D8] space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
                Why Priority is High
              </h2>
              <p className="text-xs text-[#71717A]">
                Algorithmic weight decomposition (0.0 to 1.0)
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Frequency Volume</span>
                  <span className="font-bold text-[#18181B] font-mono">{problem.frequencyScore || 0.85}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#18181B] rounded-full"
                    style={{ width: `${(problem.frequencyScore || 0.85) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Severity of Impact</span>
                  <span className="font-bold text-[#E11D48] font-mono">{problem.severityScore || 0.94}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E11D48] rounded-full"
                    style={{ width: `${(problem.severityScore || 0.94) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Growth Acceleration</span>
                  <span className="font-bold text-[#E11D48] font-mono">{problem.growthScore || 0.88}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E11D48] rounded-full"
                    style={{ width: `${(problem.growthScore || 0.88) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Affected User Base</span>
                  <span className="font-bold text-[#18181B] font-mono">{problem.userImpactScore || 0.92}</span>
                </div>
                <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#18181B] rounded-full"
                    style={{ width: `${(problem.userImpactScore || 0.92) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] text-[11px] text-[#71717A] leading-relaxed">
              <strong>Explainability Note:</strong> The score of{" "}
              <strong className="text-[#18181B]">{problem.priorityScore}</strong> is driven primarily by rapid weekly
              growth ({problem.growthLabel}), critical monetary severity, and repeated checkout friction on Android.
            </div>
          </div>

          {/* Section 20: AI Recommendation Panel */}
          <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">
                AI-Generated Recommendation
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#065F46]">{recommendation.title}</h3>
              <p className="text-xs text-[#047857] mt-1.5 leading-relaxed">
                {recommendation.rationale}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#A7F3D0]/60">
              <p className="text-[11px] font-bold text-[#065F46] uppercase">Suggested Roadmap Fixes:</p>
              <div className="text-xs text-[#065F46] space-y-1.5">
                {recommendation.actionItems?.map((act, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {act}
                  </p>
                ))}
              </div>
            </div>

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
