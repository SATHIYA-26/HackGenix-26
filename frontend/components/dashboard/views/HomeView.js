"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  Activity,
  Share2,
  Globe,
  Layers,
} from "lucide-react";
import {
  USER_PROFILE,
  AI_BRIEF,
  PROBLEMS,
  RAW_FEEDBACK_ITEMS,
  CONNECTED_SOURCES,
  getCompanyIntelligence,
} from "../data/intelligenceMockData";
import DateRangeFilter, { formatDateShort } from "../components/DateRangeFilter";

export default function HomeView({ onSelectProblem, onSelectFeedback, onNavigate, company }) {
  const [selectedRange, setSelectedRange] = useState({
    preset: "1m",
    label: "1 Month",
    startDate: null,
    endDate: null,
    days: 30,
  });
  const [showShareToast, setShowShareToast] = useState(false);

  const comp = company || getCompanyIntelligence("acc_manis");
  const compProblems = comp.problems && comp.problems.length > 0 ? comp.problems : PROBLEMS;
  const recentFeedback = comp.recentFeedback && comp.recentFeedback.length > 0 ? comp.recentFeedback : RAW_FEEDBACK_ITEMS.slice(0, 3);
  const sourcesList = comp.sources && comp.sources.length > 0 ? comp.sources : CONNECTED_SOURCES;
  const aiBrief = comp.aiBrief || AI_BRIEF;

  // ─── DYNAMIC DATA SCALING BASED ON SELECTED DATE RANGE ───
  const days = selectedRange.days || 30;
  const scale = days / 30;

  // Base raw volume (default ~14,280 for 30 days)
  const baseVolume = parseInt((comp.metrics?.totalFeedback || "14,280").replace(/,/g, ""), 10) || 14280;
  const dynamicTotalFeedback = Math.max(140, Math.round(baseVolume * scale));
  const dynamicTotalFeedbackFormatted = dynamicTotalFeedback.toLocaleString();

  // Dynamic Deltas & Sentiments
  let dynamicDelta = "+12.4% review surge";
  let dynamicRating = comp.metrics?.ratingAvg?.replace(" ★", " / 5.0") || "4.4 / 5.0";
  let dynamicNetSentiment = "+78.4%";
  let positivePct = 76.2;
  let neutralPct = 14.1;
  let negativePct = 9.7;
  let activeProblemsCount = compProblems.length;
  let emergingCount = 3;

  if (days <= 1) {
    dynamicDelta = "+4.8% daily intake";
    dynamicRating = "4.6 / 5.0";
    dynamicNetSentiment = "+83.2%";
    positivePct = 81.0;
    neutralPct = 12.5;
    negativePct = 6.5;
    activeProblemsCount = Math.min(3, compProblems.length);
    emergingCount = 1;
  } else if (days <= 7) {
    dynamicDelta = "+18.2% weekly surge";
    dynamicRating = "4.5 / 5.0";
    dynamicNetSentiment = "+81.4%";
    positivePct = 78.8;
    neutralPct = 13.1;
    negativePct = 8.1;
    activeProblemsCount = Math.min(5, compProblems.length);
    emergingCount = 2;
  } else if (days <= 35) {
    dynamicDelta = "+12.4% review surge";
    dynamicRating = "4.4 / 5.0";
    dynamicNetSentiment = "+78.4%";
    positivePct = 76.2;
    neutralPct = 14.1;
    negativePct = 9.7;
    activeProblemsCount = Math.min(8, compProblems.length);
    emergingCount = 3;
  } else if (days <= 95) {
    dynamicDelta = "+8.1% quarterly growth";
    dynamicRating = "4.3 / 5.0";
    dynamicNetSentiment = "+74.2%";
    positivePct = 72.4;
    neutralPct = 15.8;
    negativePct = 11.8;
    activeProblemsCount = Math.min(12, compProblems.length);
    emergingCount = 5;
  } else {
    dynamicDelta = "+15.6% aggregate expansion";
    dynamicRating = "4.3 / 5.0";
    dynamicNetSentiment = "+75.0%";
    positivePct = 73.5;
    neutralPct = 15.2;
    negativePct = 11.3;
    activeProblemsCount = compProblems.length;
    emergingCount = Math.min(6, compProblems.length);
  }

  const rangeLabelText = selectedRange.preset === "custom" && selectedRange.startDate && selectedRange.endDate
    ? `${formatDateShort(new Date(selectedRange.startDate))} – ${formatDateShort(new Date(selectedRange.endDate))}`
    : selectedRange.label || "1 Month";

  const emergingProblems = compProblems
    .filter((p) => p.status === "emerging" || p.status === "critical")
    .slice(0, Math.max(2, Math.min(4, activeProblemsCount)))
    .map((p) => ({
      ...p,
      feedbackCount: Math.max(1, Math.round(p.feedbackCount * Math.min(2.5, Math.max(0.12, scale)))),
    }));

  const priorityProblems = [...compProblems]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3)
    .map((p) => ({
      ...p,
      feedbackCount: Math.max(1, Math.round(p.feedbackCount * Math.min(2.5, Math.max(0.12, scale)))),
    }));

  const displaySources = sourcesList.map((src) => {
    const count = src.totalFeedback ?? src.itemsCount ?? 0;
    const scaledCount = Math.max(1, Math.round(count * scale));
    return {
      ...src,
      scaledCount,
    };
  });

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ─── UNIFIED HEADER: COMPANY PERSONA GREETING & CONTROLS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">
            Welcome back, {comp.name}
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            {comp.ownerName} ({comp.ownerRole}) · Executive Voice of Customer Intelligence for {comp.typeLabel}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Calendar & Timeframe Filter */}
          <DateRangeFilter
            selectedRange={selectedRange}
            onRangeChange={(range) => setSelectedRange(range)}
          />

          <button
            onClick={handleShare}
            className="h-9 px-3.5 rounded-lg border border-[#E5E1D8] bg-white text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA] transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={() => onNavigate("problems")}
            className="h-9 px-3.5 rounded-lg border border-[#E5E1D8] bg-white text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA] transition-colors"
          >
            Explore {compProblems.length} Problems
          </button>

          <button
            onClick={() => onNavigate("recommendations")}
            className="h-9 px-4 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showShareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>{comp.name} Dashboard snapshot link copied to clipboard!</span>
        </div>
      )}

      {/* ─── EXECUTIVE METRICS BAR (DYNAMICALLY COMPUTED) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-colors">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Total Customer Voice
          </span>
          <p className="text-2xl font-bold text-[#18181B] mt-1">{dynamicTotalFeedbackFormatted}</p>
          <p className="text-[11px] text-[#059669] mt-0.5 font-semibold">▲ {dynamicDelta}</p>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-colors">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Net Sentiment
          </span>
          <p className="text-2xl font-bold text-[#059669] mt-1">{dynamicNetSentiment}</p>
          <p className="text-[11px] text-[#059669] mt-0.5 font-semibold">Average: {dynamicRating}</p>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-colors">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Active Problem Clusters
          </span>
          <p className="text-2xl font-bold text-[#18181B] mt-1">{activeProblemsCount}</p>
          <p className="text-[11px] text-[#E11D48] mt-0.5 font-semibold">Filtered for {rangeLabelText}</p>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-colors">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
            Emerging Signals
          </span>
          <p className="text-2xl font-bold text-[#D97706] mt-1">{emergingCount}</p>
          <p className="text-[11px] text-[#D97706] mt-0.5 font-semibold">Velocity surges</p>
        </div>
      </div>

      {/* ─── AI BRIEF: COMPANY-SPECIFIC SHIFTS DETECTED IN SELECTED TIMEFRAME ─── */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FAF5FF]/80 via-[#FBF9F5] to-white border border-[#DDD6FE] shadow-2xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-[#7C3AED] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
            {aiBrief.headline}
          </span>
        </div>

        <h2 className="text-base font-bold text-[#18181B] mb-4 font-serif">
          3 important customer feedback shifts detected in {rangeLabelText} across {dynamicTotalFeedbackFormatted} total signals:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiBrief.shifts.map((shift) => (
            <div
              key={shift.id}
              onClick={() => onSelectProblem(shift.problemId)}
              className="p-4 rounded-xl bg-white border border-[#E5E1D8] hover:border-[#7C3AED] cursor-pointer transition-all hover:shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#71717A] mb-2">
                  <span className="font-bold text-[#18181B]">{shift.number}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F3FF] font-sans font-semibold text-[#7C3AED] border border-[#DDD6FE]">
                    {shift.category}
                  </span>
                </div>
                <p className="text-xs text-[#18181B] font-medium leading-relaxed group-hover:text-[#7C3AED] transition-colors">
                  {shift.text}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#ECE8E0] flex items-center justify-between text-[11px] text-[#71717A]">
                <span className="font-mono text-[#E11D48] font-bold">{shift.sentiment}</span>
                <span className="text-[#7C3AED] font-semibold flex items-center gap-1 group-hover:underline">
                  Inspect evidence →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 2-COLUMN LAYOUT: EMERGING PROBLEMS + CUSTOMER HEALTH TRAJECTORY ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Emerging Problems */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" /> Emerging & Critical Problems
              </h2>
              <p className="text-xs text-[#71717A]">
                Problems with accelerating volume or high negative sentiment in {rangeLabelText}
              </p>
            </div>
            <button
              onClick={() => onNavigate("problems")}
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              View all 15 &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {emergingProblems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => onSelectProblem(prob.id)}
                className="p-4 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] cursor-pointer transition-all hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        prob.status === "critical"
                          ? "bg-[#E11D48]"
                          : prob.status === "emerging"
                          ? "bg-[#D97706]"
                          : "bg-[#059669]"
                      }`}
                    />
                    <h3 className="text-xs font-bold text-[#18181B] group-hover:text-[#4F46E5] transition-colors truncate">
                      {prob.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#71717A] line-clamp-1">{prob.summary}</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#71717A] pt-1">
                    <span className="bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#ECE8E0] font-mono">
                      {prob.platform}
                    </span>
                    <span>•</span>
                    <span>{prob.product}</span>
                    <span>•</span>
                    <span className="font-mono">{prob.version}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#ECE8E0]">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#18181B]">{prob.feedbackCount} mentions</p>
                    <p className="text-[11px] font-semibold text-[#E11D48]">↑ {prob.growthLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#E11D48]">
                      {Math.round(prob.negativeSentiment * 100)}% Neg
                    </p>
                    <p className="text-[11px] text-[#71717A]">Score {prob.priorityScore}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FAF8F5] group-hover:bg-[#18181B] group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (1 col): Customer Health & Sentiment Trajectory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#059669]" /> Customer Health
            </h2>
            <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase">{rangeLabelText} Trend</span>
          </div>

          <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white space-y-5">
            <div>
              <span className="text-xs font-semibold text-[#71717A]">Net Customer Sentiment</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-[#059669]">{dynamicNetSentiment}</span>
                <span className="text-xs font-semibold text-[#059669]">▲ +4.2%</span>
              </div>
              <p className="text-xs text-[#71717A] mt-1">
                Calculated across {dynamicTotalFeedbackFormatted} verified reviews in {rangeLabelText}
              </p>
            </div>

            {/* Micro Sentiment Trajectory Bars */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18181B]">Positive Delight</span>
                <span className="font-bold text-[#059669]">{positivePct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                <div className="h-full bg-[#059669] rounded-full transition-all duration-500" style={{ width: `${positivePct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18181B]">Neutral / Informational</span>
                <span className="font-bold text-[#64748B]">{neutralPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                <div className="h-full bg-[#64748B] rounded-full transition-all duration-500" style={{ width: `${neutralPct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18181B]">Negative / Friction</span>
                <span className="font-bold text-[#E11D48]">{negativePct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                <div className="h-full bg-[#E11D48] rounded-full transition-all duration-500" style={{ width: `${negativePct}%` }} />
              </div>
            </div>

            <div className="pt-3 border-t border-[#ECE8E0] text-xs text-[#71717A] space-y-1">
              <p className="font-semibold text-[#18181B]">Top Health Alert:</p>
              <p className="leading-relaxed">
                Negative ratio jumped to 21% among users who attempted checkout on v4.2.1.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3-COLUMN BOTTOM GRID: PRIORITY AREAS, CONNECTED SOURCES & RECENT VOICE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Priority Areas with Explainability */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
              Priority Areas (Ranked by Evidence)
            </h2>
            <p className="text-xs text-[#71717A]">
              Explainable weighting driving team attention
            </p>
          </div>

          <div className="space-y-3">
            {priorityProblems.map((prob, idx) => (
              <div
                key={prob.id}
                onClick={() => onSelectProblem(prob.id)}
                className="p-4 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] cursor-pointer transition-all flex items-start gap-3.5 group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#ECE8E0] text-xs font-bold text-[#18181B] flex items-center justify-center shrink-0">
                  0{idx + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#18181B] group-hover:text-[#4F46E5] truncate">
                      {prob.name}
                    </p>
                    <span className="text-xs font-bold text-[#18181B] bg-[#F4F1EA] px-2 py-0.5 rounded">
                      {prob.priorityScore}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#E11D48] line-clamp-1">
                    {prob.whyItMatters}
                  </p>
                  <p className="text-[11px] text-[#71717A]">
                    {prob.feedbackCount} items · {prob.growthLabel} velocity
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Volume Distribution by Connected Sources */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#0284C7]" /> Sources Distribution
              </h2>
              <p className="text-xs text-[#71717A]">
                Live continuous pipelines for {rangeLabelText}
              </p>
            </div>
            <button
              onClick={() => onNavigate("sources")}
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              Manage &rarr;
            </button>
          </div>

          <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white space-y-3.5">
            {displaySources.map((src) => {
              const count = src.scaledCount || 0;
              return (
                <div key={src.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: src.accent || "#0284C7" }}
                      />
                      <span className="font-semibold text-[#18181B]">{src.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#71717A]">
                      {count.toLocaleString()} items
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: src.accent || "#0284C7",
                        width: `${Math.min(100, Math.max(5, (count / (dynamicTotalFeedback || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 3: Recent Customer Voice (Traceable Quotes) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2563EB]" /> Customer Voice
              </h2>
              <p className="text-xs text-[#71717A]">
                Original customer text
              </p>
            </div>
            <button
              onClick={() => onNavigate("feedback")}
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              Feed &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentFeedback.map((fb) => (
              <div
                key={fb.id}
                onClick={() => onSelectFeedback(fb)}
                className="p-3.5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] cursor-pointer transition-all space-y-2 group"
              >
                <p className="text-xs font-serif italic text-[#18181B] leading-relaxed line-clamp-2">
                  “{fb.text}”
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-1 border-t border-[#ECE8E0]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#18181B]">{fb.authorName}</span>
                    <span>•</span>
                    <span>{fb.source}</span>
                  </div>
                  <span className="text-[#4F46E5] font-semibold group-hover:underline flex items-center gap-1">
                    Trace →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
