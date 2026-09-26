"use client";

import { useState, useEffect } from "react";
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
  Play,
  X,
  Flame,
  Clock,
  ThumbsUp,
  ThumbsDown,
  BarChart2,
  HelpCircle,
} from "lucide-react";
import SourceLogo from "../components/SourceLogo";

import { getExecutiveDashboardMetrics } from "@/lib/api/dashboard";
import { getProblems } from "@/lib/api/problems";
import { getFeedbackList } from "@/lib/api/feedback";

function YouTubeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function HomeView({
  onSelectProblem,
  onSelectFeedback,
  onNavigate,
  company,
  activeVideoFocus = null,
  onClearVideoFocus = () => {},
}) {
  const accountId = company?.id || "acc_manis";

  const [liveDashboard, setLiveDashboard] = useState(null);
  const [problems, setProblems] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      getExecutiveDashboardMetrics(accountId),
      getProblems({ accountId }),
      getFeedbackList({ accountId, limit: 5 }),
    ])
      .then(([dashData, probData, fbData]) => {
        if (!isMounted) return;
        setLiveDashboard(dashData);
        setProblems(probData?.data || []);
        setRecentFeedback(fbData?.data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [accountId, activeVideoFocus]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const isVideoFocus = !!activeVideoFocus?.video;
  const videoMeta = activeVideoFocus?.video;
  const videoStats = activeVideoFocus?.stats;

  const totalFb = (isVideoFocus && videoStats?.totalCommentsExtracted != null)
    ? videoStats.totalCommentsExtracted
    : (liveDashboard?.totalFeedback ?? 0);
  const analyzedFb = (isVideoFocus && videoStats?.totalCommentsExtracted != null)
    ? videoStats.totalCommentsExtracted
    : (liveDashboard?.analyzedFeedback ?? 0);
  const avgSentiment = (isVideoFocus && videoStats?.netSentiment != null)
    ? (parseFloat(videoStats.netSentiment) / 100)
    : (liveDashboard?.avgSentimentScore ?? 0.0);
  const activeProblemsCount = (isVideoFocus && activeVideoFocus?.problemsDiscovered != null)
    ? activeVideoFocus.problemsDiscovered
    : (liveDashboard?.activeProblemsCount ?? problems.length);
  const emergingCount = liveDashboard?.emergingSignalsCount ?? 0;

  const sentimentDist = liveDashboard?.sentimentDistribution || { positive: 0, neutral: 0, negative: 0 };
  const posCount = (isVideoFocus && videoStats?.positiveCount != null) ? videoStats.positiveCount : (sentimentDist.positive || 0);
  const neuCount = (isVideoFocus && videoStats?.neutralCount != null) ? videoStats.neutralCount : (sentimentDist.neutral || 0);
  const negCount = (isVideoFocus && videoStats?.negativeCount != null) ? videoStats.negativeCount : (sentimentDist.negative || 0);
  const sentimentTotal = posCount + neuCount + negCount || totalFb || 1;

  const posPct = (isVideoFocus && videoStats?.positivePct != null) ? videoStats.positivePct : Math.round((posCount / sentimentTotal) * 100);
  const neuPct = (isVideoFocus && videoStats?.neutralPct != null) ? videoStats.neutralPct : Math.round((neuCount / sentimentTotal) * 100);
  const negPct = (isVideoFocus && videoStats?.negativePct != null) ? videoStats.negativePct : Math.round((negCount / sentimentTotal) * 100);

  const netSentimentDisplay = (isVideoFocus && videoStats?.netSentiment != null)
    ? videoStats.netSentiment
    : `${avgSentiment >= 0 ? "+" : ""}${Math.round(avgSentiment * 100)}%`;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ─── UNIFIED HEADER: COMPANY PERSONA GREETING & CONTROLS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED]">
              Live Backend Signal
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">
            Welcome back, {company?.name || "Business Workspace"}
          </h1>
          <p className="text-xs text-[#71717A] mt-1">
            {company?.ownerName} ({company?.ownerRole}) · Voice of Customer Platform for {company?.typeLabel || company?.category}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleShare}
            className="h-9 px-3.5 rounded-lg border border-[#E5E1D8] bg-white text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA] transition-colors"
          >
            Share
          </button>

          <button
            onClick={() => onNavigate("problems")}
            className="h-9 px-3.5 rounded-lg border border-[#E5E1D8] bg-white text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA] transition-colors"
          >
            Explore {problems.length} Problems
          </button>

          <button
            onClick={() => onNavigate("recommendations")}
            className="h-9 px-4 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors shadow-xs"
          >
            Recommendations
          </button>
        </div>
      </div>

      {/* ─── EMPTY STATE BANNER (FOR CLEAN YOUTUBE OR EMPTY ACCOUNTS) ─── */}
      {totalFb === 0 && !isLoading && (
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#FAF5FF] via-white to-[#FAF8F5] border border-[#DDD6FE] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-bold">
              <span>Workspace Ready for Live Ingestion</span>
            </div>
            <h2 className="text-lg font-bold text-[#18181B] font-serif">
              No feedback records ingested for {company?.name} yet
            </h2>
            <p className="text-xs text-[#71717A] max-w-xl leading-relaxed">
              Connect external customer sources or enter a YouTube video URL in the Sources tab. Our FastAPI backend will automatically run RoBERTa sentiment analysis, DistilBERT intent classification, and discover actionable problem clusters.
            </p>
          </div>
          <button
            onClick={() => onNavigate("sources")}
            className="h-10 px-5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <span>Go to Sources & Ingest YouTube</span>
          </button>
        </div>
      )}

      {/* ─── ACTIVE VIDEO FOCUS BANNER (WHEN ATTACHED FROM SOURCES) ─── */}
      {isVideoFocus && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF5FF] via-[#F3E8FF] to-[#FAF8F5] border border-[#DDD6FE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-xs">
              <YouTubeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#7C3AED] text-white px-2 py-0.5 rounded-full">
                  Focused YouTube Video Stream
                </span>
                <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                  Live NLP Extracted
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#18181B] mt-1 font-serif line-clamp-1">
                {videoMeta?.title}
              </h3>
              <p className="text-xs text-[#71717A]">
                Channel: <strong>{videoMeta?.channelTitle}</strong> · Views: <strong>{videoMeta?.viewCount?.toLocaleString()}</strong> · Likes: <strong>{videoMeta?.likeCount?.toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={onClearVideoFocus}
              className="h-8 px-3 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Clear Focus
            </button>
          </div>
        </div>
      )}

      {showShareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl animate-in fade-in">
          <span>{company?.name} snapshot link copied to clipboard!</span>
        </div>
      )}

      {/* ─── EXECUTIVE METRICS BAR ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
              Total Ingested Voice
            </span>
          </div>
          <p className="text-2xl font-bold text-[#18181B] mt-2">{totalFb.toLocaleString()}</p>
          <div className="text-[11px] text-[#059669] mt-1 font-semibold">
            <span>{analyzedFb} analyzed via RoBERTa</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
              Net Sentiment Score
            </span>
          </div>
          <p className={`text-2xl font-bold mt-2 ${avgSentiment >= 0 ? "text-[#059669]" : "text-[#E11D48]"}`}>
            {netSentimentDisplay}
          </p>
          <p className="text-[11px] text-[#71717A] mt-1 font-semibold">
            Scale: -1.00 (Friction) to +1.00 (Delight)
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
              Discovered Problems
            </span>
          </div>
          <p className="text-2xl font-bold text-[#18181B] mt-2">{activeProblemsCount}</p>
          <p className="text-[11px] text-[#71717A] mt-1 font-semibold">
            HDBSCAN & BERTopic clustered
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wide">
              Emerging Signals
            </span>
          </div>
          <p className="text-2xl font-bold text-[#E11D48] mt-2">{emergingCount}</p>
          <p className="text-[11px] text-[#E11D48] mt-1 font-semibold">
            Accelerating volume spikes
          </p>
        </div>
      </div>

      {/* ─── 2-COLUMN LAYOUT: TOP PRIORITY PROBLEMS + SENTIMENT HEALTH ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Discovered Problems */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
                Priority Problem Clusters
              </h2>
              <p className="text-xs text-[#71717A]">
                Ranked by composite explainable priority formula from backend
              </p>
            </div>
            <button
              onClick={() => onNavigate("problems")}
              className="text-xs font-semibold text-[#7C3AED] hover:underline"
            >
              View all
            </button>
          </div>

          {problems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#E5E1D8] text-xs text-[#71717A]">
              No active problem clusters discovered yet for this account.
            </div>
          ) : (
            <div className="space-y-3">
              {problems.slice(0, 5).map((prob) => {
                const breakdown = prob.priorityBreakdown || {};
                return (
                  <div
                    key={prob.id}
                    onClick={() => onSelectProblem(prob.id)}
                    className="p-4 rounded-xl border border-[#E5E1D8] bg-white hover:border-[#18181B] cursor-pointer transition-all hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            prob.status === "critical"
                              ? "bg-[#E11D48]"
                              : prob.status === "emerging"
                              ? "bg-[#D97706]"
                              : "bg-[#059669]"
                          }`}
                        />
                        <h3 className="text-xs font-bold text-[#18181B] group-hover:text-[#7C3AED] transition-colors truncate">
                          {prob.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#71717A] line-clamp-1">{prob.summary}</p>
                      
                      {/* Priority Factor Pills */}
                      <div className="flex items-center gap-2 text-[10px] text-[#71717A] pt-1 flex-wrap">
                        <span className="bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#ECE8E0] font-mono">
                          Score: {prob.priorityScore?.toFixed(2)}
                        </span>
                        {breakdown.frequency !== undefined && (
                          <span className="text-[#71717A]">
                            Freq: {breakdown.frequency}
                          </span>
                        )}
                        {breakdown.severity !== undefined && (
                          <span className="text-[#E11D48]">
                            Sev: {breakdown.severity}
                          </span>
                        )}
                        {breakdown.growth !== undefined && (
                          <span className="text-[#D97706]">
                            Growth: {breakdown.growth}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#ECE8E0]">
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#18181B]">{prob.feedbackCount} feedback</p>
                        <p className={`text-[11px] font-semibold ${prob.growthRate >= 0 ? "text-[#E11D48]" : "text-[#059669]"}`}>
                          {prob.growthLabel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#E11D48]">
                          {Math.round(prob.negativeSentiment * 100)}% Neg
                        </p>
                        <span className="text-[10px] uppercase font-bold text-[#71717A]">{prob.status}</span>
                      </div>
                      <span className="text-xs font-bold text-[#18181B] group-hover:text-[#7C3AED] transition-colors">
                        Inspect
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right (1 col): Sentiment Health Distribution */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
              Sentiment Breakdown
            </h2>
            <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase">RoBERTa NLP</span>
          </div>

          <div className="p-5 rounded-xl border border-[#E5E1D8] bg-white space-y-5">
            <div>
              <span className="text-xs font-semibold text-[#71717A]">Net Customer Sentiment</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${avgSentiment >= 0 ? "text-[#059669]" : "text-[#E11D48]"}`}>
                  {netSentimentDisplay}
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-1">
                Calculated across {totalFb.toLocaleString()} customer feedback items
              </p>
            </div>

            {/* Sentiment Trajectory Bars */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18181B]">
                  Positive Sentiment
                </span>
                <span className="font-bold text-[#059669]">{posCount} ({posPct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                <div className="h-full bg-[#059669] rounded-full transition-all duration-500" style={{ width: `${posPct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18181B]">
                  Neutral Sentiment
                </span>
                <span className="font-bold text-[#64748B]">{neuCount} ({neuPct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                <div className="h-full bg-[#64748B] rounded-full transition-all duration-500" style={{ width: `${neuPct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18181B]">
                  Negative Friction
                </span>
                <span className="font-bold text-[#E11D48]">{negCount} ({negPct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#ECE8E0] overflow-hidden">
                <div className="h-full bg-[#E11D48] rounded-full transition-all duration-500" style={{ width: `${negPct}%` }} />
              </div>
            </div>

            {/* Intent Breakdown */}
            {liveDashboard?.intentDistribution && Object.keys(liveDashboard.intentDistribution).length > 0 && (
              <div className="pt-4 border-t border-[#ECE8E0] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                  DistilBERT Intent Classification
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(liveDashboard.intentDistribution).map(([intent, count]) => (
                    <span
                      key={intent}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-[#F4F1EA] text-[#18181B] font-medium border border-[#E5E1D8]"
                    >
                      {intent}: <strong>{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3-COLUMN BOTTOM GRID: EMERGING TRENDS, CONNECTED SOURCES & RECENT VOICE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Emerging Trends */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
              Emerging Trends
            </h2>
            <p className="text-xs text-[#71717A]">
              Velocity comparison across 7d windows
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white space-y-3">
            {(!liveDashboard?.emergingTrends || liveDashboard.emergingTrends.length === 0) ? (
              <p className="text-xs text-[#71717A] text-center py-4">
                No emerging spike trends detected currently.
              </p>
            ) : (
              liveDashboard.emergingTrends.map((trend) => (
                <div
                  key={trend.id}
                  onClick={() => onSelectProblem(trend.problemId)}
                  className="p-3 rounded-lg bg-[#FAF8F5] border border-[#ECE8E0] hover:border-[#7C3AED] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18181B] truncate">{trend.problemName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFF1F2] text-[#E11D48] font-bold">
                      {trend.growthPercent}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                    <span>Current: {trend.currentCount} items</span>
                    <span>Baseline: {trend.previousCount} items</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 2: Ingested Sources */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
              Connected Sources
            </h2>
            <p className="text-xs text-[#71717A]">
              Customer channels feeding the platform
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white space-y-3">
            {(!liveDashboard?.topSources || liveDashboard.topSources.length === 0) ? (
              <p className="text-xs text-[#71717A] text-center py-4">
                No active source connections found.
              </p>
            ) : (
              liveDashboard.topSources.map((src) => (
                <div
                  key={src.name}
                  className="p-3 rounded-lg border border-[#ECE8E0] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div>
                      <p className="text-xs font-bold text-[#18181B]">{src.name}</p>
                      <p className="text-[10px] text-[#71717A]">Source Channel</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#18181B]">{src.count.toLocaleString()}</span>
                    <p className="text-[10px] text-[#059669]">Ingested</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Col 3: Recent Customer Feedback */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#18181B] uppercase tracking-wider">
                Recent Customer Voice
              </h2>
              <p className="text-xs text-[#71717A]">
                Latest normalized customer records
              </p>
            </div>
            <button
              onClick={() => onNavigate("feedback")}
              className="text-xs font-semibold text-[#7C3AED] hover:underline"
            >
              Explore
            </button>
          </div>

          <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white space-y-3">
            {recentFeedback.length === 0 ? (
              <p className="text-xs text-[#71717A] text-center py-4">
                No customer voice records available yet.
              </p>
            ) : (
              recentFeedback.slice(0, 3).map((fb) => (
                <div
                  key={fb.id}
                  onClick={() => onSelectFeedback(fb)}
                  className="p-3 rounded-lg bg-[#FAF8F5] border border-[#ECE8E0] hover:border-[#7C3AED] cursor-pointer transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#18181B] truncate max-w-[140px]">{fb.authorName}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        fb.sentiment === "positive"
                          ? "bg-[#ECFDF5] text-[#059669]"
                          : fb.sentiment === "negative"
                          ? "bg-[#FFF1F2] text-[#E11D48]"
                          : "bg-[#F4F1EA] text-[#64748B]"
                      }`}
                    >
                      {fb.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
                    "{fb.text}"
                  </p>
                  <p className="text-[10px] text-[#A1A1AA] pt-1">
                    Source: {fb.source} · {fb.rating ? `Rating: ${fb.rating}/5` : "Unrated"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
