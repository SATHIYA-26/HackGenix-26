"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2, MessageSquare, ExternalLink, Activity } from "lucide-react";
import { USER_PROFILE, AI_BRIEF, PROBLEMS, RAW_FEEDBACK_ITEMS } from "../data/intelligenceMockData";

export default function HomeView({ onSelectProblem, onSelectFeedback, onNavigate }) {
  const [timeframe, setTimeframe] = useState("30d");

  const emergingProblems = PROBLEMS.filter((p) => p.status === "emerging" || p.status === "critical").slice(0, 4);
  const priorityProblems = [...PROBLEMS].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3);
  const recentFeedback = RAW_FEEDBACK_ITEMS.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-xs font-semibold text-[#059669] uppercase tracking-wider">
              Continuous Intelligence Engine Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">
            Good morning, {USER_PROFILE.name}
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            Here's what changed in customer feedback signals across all sources this week.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("problems")}
            className="h-9 px-3.5 rounded-lg border border-[#E5E1D8] text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA] transition-colors"
          >
            Explore All 15 Problems
          </button>
          <button
            onClick={() => onNavigate("recommendations")}
            className="h-9 px-4 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors flex items-center gap-1.5"
          >
            <span>Review 4 AI Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Brief (Section 7) */}
      <div className="p-6 rounded-2xl bg-[#FBF9F5] border border-[#E5E1D8] shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-[#7C3AED] text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
            {AI_BRIEF.headline}
          </span>
        </div>

        <h2 className="text-base font-bold text-[#18181B] mb-4 font-serif">
          {AI_BRIEF.subheadline}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AI_BRIEF.shifts.map((shift) => (
            <div
              key={shift.id}
              onClick={() => onSelectProblem(shift.problemId)}
              className="p-4 rounded-xl bg-white border border-[#E5E1D8] hover:border-[#18181B] cursor-pointer transition-all hover:shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#71717A] mb-2">
                  <span className="font-bold text-[#18181B]">{shift.number}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F4F1EA] font-sans font-semibold text-[#3F3F46]">
                    {shift.category}
                  </span>
                </div>
                <p className="text-xs text-[#18181B] font-medium leading-relaxed group-hover:text-[#4F46E5] transition-colors">
                  {shift.text}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#ECE8E0] flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#71717A]">{shift.impact}</span>
                <span className="font-bold text-[#18181B] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  View evidence →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Emerging Problems & Customer Health (Sections 8 & 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Emerging Problems */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
                Emerging & Accelerating Problems
              </h2>
              <p className="text-xs text-[#71717A]">
                Issues with accelerating growth requiring product team awareness
              </p>
            </div>
            <button
              onClick={() => onNavigate("problems")}
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              See all problems &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {emergingProblems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => onSelectProblem(prob.id)}
                className="p-4 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] hover:shadow-sm cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 max-w-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        prob.status === "critical"
                          ? "bg-[#FFF1F2] text-[#E11D48]"
                          : prob.status === "emerging"
                          ? "bg-[#FEF3C7] text-[#D97706]"
                          : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {prob.status}
                    </span>
                    <span className="text-xs font-bold text-[#18181B] group-hover:text-[#4F46E5] transition-colors">
                      {prob.name}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] line-clamp-1">
                    {prob.shortExplanation}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-[#71717A]">
                    <span>{prob.product}</span>
                    <span>•</span>
                    <span>{prob.platform}</span>
                    <span>•</span>
                    <span>{prob.version}</span>
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

        {/* Right (1 col): Customer Health & Sentiment Trajectory (Section 9) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#059669]" /> Customer Health
            </h2>
            <div className="flex items-center rounded-lg border border-[#E5E1D8] bg-white p-0.5 text-[11px]">
              {["7d", "30d", "90d"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                    timeframe === t ? "bg-[#18181B] text-white" : "text-[#71717A] hover:text-[#18181B]"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white space-y-5">
            <div>
              <span className="text-xs font-semibold text-[#71717A]">Net Customer Sentiment</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-[#059669]">+78.4%</span>
                <span className="text-xs font-semibold text-[#059669]">▲ +4.2%</span>
              </div>
              <p className="text-xs text-[#71717A] mt-1">
                Calculated across 12,480 verified reviews in last {timeframe}
              </p>
            </div>

            {/* Micro Sentiment Trajectory Bars */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18181B]">Positive Delight</span>
                <span className="font-bold text-[#059669]">76.2%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                <div className="h-full bg-[#059669] rounded-full" style={{ width: "76.2%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18181B]">Neutral / Informational</span>
                <span className="font-bold text-[#64748B]">14.1%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                <div className="h-full bg-[#64748B] rounded-full" style={{ width: "14.1%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18181B]">Negative / Friction</span>
                <span className="font-bold text-[#E11D48]">9.7%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                <div className="h-full bg-[#E11D48] rounded-full" style={{ width: "9.7%" }} />
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

      {/* Grid: Priority Areas & Recent Customer Voice (Sections 10 & 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Areas with Explainability (Section 10) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
                Priority Areas (Ranked by Evidence Score)
              </h2>
              <p className="text-xs text-[#71717A]">
                The system explains why each problem has become critical
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {priorityProblems.map((prob, idx) => (
              <div
                key={prob.id}
                onClick={() => onSelectProblem(prob.id)}
                className="p-4 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] cursor-pointer transition-all flex items-start gap-4 group"
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
                      Score {prob.priorityScore}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#E11D48]">
                    {prob.whyItMatters}
                  </p>
                  <p className="text-[11px] text-[#71717A]">
                    Driven by: High volume ({prob.feedbackCount}) · {prob.growthLabel} velocity · {Math.round(prob.negativeSentiment * 100)}% negative sentiment
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customer Voice (Section 11) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2563EB]" /> Recent Customer Voice
              </h2>
              <p className="text-xs text-[#71717A]">
                Original customer text remains fully traceable at all times
              </p>
            </div>
            <button
              onClick={() => onNavigate("feedback")}
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              Explore feed &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentFeedback.map((fb) => (
              <div
                key={fb.id}
                onClick={() => onSelectFeedback(fb)}
                className="p-4 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] cursor-pointer transition-all space-y-2 group"
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
                    Inspect evidence →
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
