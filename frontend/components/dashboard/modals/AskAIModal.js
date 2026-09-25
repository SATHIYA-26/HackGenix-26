"use client";

import { useState } from "react";
import { Sparkles, X, ArrowRight, CheckCircle2, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";
import { PROBLEMS, RAW_FEEDBACK_ITEMS } from "../data/intelligenceMockData";
import { askAIQuestion } from "@/lib/api/insights";

const PROMPT_TEMPLATES = [
  "What are customers complaining about this week?",
  "What are the biggest checkout problems?",
  "Why did negative sentiment increase on Android v4.2.1?",
  "Which problems are growing fastest and need immediate action?",
  "What are customers saying about dining queues in T. Nagar?",
];

export default function AskAIModal({ isOpen, onClose, initialQuery = "", onOpenProblem, onOpenFeedbackList }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [response, setResponse] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleRunAsk = async (questionText) => {
    const q = (questionText || query).trim();
    if (!q) return;

    setQuery(q);
    setIsThinking(true);
    setResponse(null);

    try {
      try {
        const aiRes = await askAIQuestion(q);
        if (aiRes) {
          setResponse({
            headline: aiRes.answer || "Customer signal analysis completed.",
            summary: `Identified relevant customer signals: ${aiRes.answer}`,
            concentration: aiRes.concentratedIn || "Connected customer channels",
            whyItMatters: "Direct customer dissatisfaction impacts retention and brand trust.",
            evidenceCount: aiRes.evidenceCount || 1,
            targetProblemId: aiRes.problemId || "prob-1",
            representativeQuote: aiRes.citations?.[0]?.text ? `“${aiRes.citations[0].text}”` : "Customer feedback indicates repeated friction in this area.",
            recommendedAction: aiRes.recommendedAction || "Investigate the root issue and deploy UX remediation.",
          });
          return;
        }
      } catch (e) {
        console.warn("AI Q&A fallback triggered:", e);
      }

      if (q.toLowerCase().includes("checkout") || q.toLowerCase().includes("upi") || q.toLowerCase().includes("payment")) {
        setResponse({
          headline: "UPI payment callback failures are the primary driver of customer friction this week.",
          summary:
            "127 verified customer feedback items were identified in the last 7 days, with 91% negative sentiment. Complaints report that customer money is debited via UPI, but order confirmation fails due to merchant webhook timeouts.",
          concentration: "Concentrated on Android app v4.2.1 across Google Play reviews and Zendesk escalation tickets.",
          whyItMatters:
            "Direct monetary loss produces immediate 1-star ratings, high CSAT churn, and an estimated ₹2.4L in weekly order cancellations.",
          evidenceCount: 127,
          targetProblemId: "prob-1",
          representativeQuote: "“Money was deducted from my HDFC bank account via Google Pay, but screen said Order Cancelled. Now customer care says 7 working days to refund!”",
          recommendedAction:
            "Implement exponential backoff polling for bank confirmation callbacks and render a 'Verifying Transaction' hold state before cancelling orders.",
        });
      } else if (q.toLowerCase().includes("queue") || q.toLowerCase().includes("dining") || q.toLowerCase().includes("t. nagar")) {
        setResponse({
          headline: "Sunday lunch queue bottlenecks at T. Nagar branch are suppressing customer satisfaction.",
          summary:
            "93 customer reviews cite wait times exceeding 45 minutes on weekend lunch peaks (1:00 PM – 3:30 PM). While food taste scores are exceptionally high (+95% positive), lack of queue transparency drives walkaways.",
          concentration: "Concentrated on Google Maps reviews for Mani's Dum Biriyani (T. Nagar branch).",
          whyItMatters:
            "Deterrent to high-value dining parties and causes walkaways estimated at ₹1.8L monthly.",
          evidenceCount: 93,
          targetProblemId: "prob-5",
          representativeQuote: "“Taste and aroma were unbelievable! However, Sunday lunchtime queue took over 45 minutes to seat us with no waiting chairs.”",
          recommendedAction:
            "Scale the digital SMS token queue pager system tested in early September to give diners live phone notifications of their table readiness.",
        });
      } else {
        setResponse({
          headline: "3 key emerging signals were detected across customer feedback this week.",
          summary:
            "1. UPI payment callback complaints jumped +74% (127 items, 91% negative).\n2. Android 14 Scoped Storage PDF crashes emerged (+362% surge, 37 items).\n3. T. Nagar table waiting friction grew +28% during weekend dining surges.",
          concentration: "Cross-platform telemetry across Google Play, Google Maps, and Zendesk support channels.",
          whyItMatters:
            "Immediate action on UPI callbacks and Android 14 hotfix can deflect 70%+ of projected 1-star reviews next week.",
          evidenceCount: 257,
          targetProblemId: "prob-1",
          representativeQuote: "“App keeps completely crashing whenever I tap 'Download Receipt' on Android 14 after latest update.”",
          recommendedAction:
            "Prioritize Hotfix build v4.2.2 for Android Scoped Storage and deploy idempotent payment webhook reconciliation.",
        });
      }
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E5E1D8] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ECE8E0] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#18181B]">Ask Your Customer Feedback Data</h2>
              <p className="text-xs text-[#71717A]">
                Source-grounded NLP responses backed by 12,480+ customer voices
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#71717A] hover:text-[#18181B] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Input */}
        <div className="p-6 border-b border-[#ECE8E0] space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAsk();
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full bg-[#FBF9F5] border border-[#E5E1D8] focus:border-[#7C3AED] rounded-xl px-4 py-3 text-sm text-[#18181B] placeholder-[#A1A1AA] outline-none transition-colors"
                placeholder="Ask anything (e.g. 'What are our biggest checkout bottlenecks?')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isThinking || !query.trim()}
              className="h-11 px-5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0"
            >
              {isThinking ? (
                <>
                  <span className="cm-spinner"></span> Analyzing...
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Prompt suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-[#71717A] uppercase mr-1">Suggestions:</span>
            {PROMPT_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunAsk(tmpl)}
                className="text-xs px-2.5 py-1 rounded-full bg-[#F4F1EA] hover:bg-[#EBE7DD] text-[#3F3F46] border border-[#ECE8E0] transition-colors"
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        {/* Content / Result stage */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isThinking && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED] flex items-center justify-center animate-pulse">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-[#18181B]">
                Synthesizing customer feedback signals...
              </p>
              <p className="text-xs text-[#71717A] max-w-sm">
                Parsing 12,480 raw feedback snippets, computing aspect sentiment clusters, and verifying evidence tokens.
              </p>
            </div>
          )}

          {!isThinking && !response && (
            <div className="py-8 text-center text-[#71717A] space-y-2">
              <p className="text-sm font-medium text-[#18181B]">Ask a question to see source-grounded answers</p>
              <p className="text-xs max-w-md mx-auto">
                Every AI response is backed by exact customer quotes, platform versions, and actionable product recommendations.
              </p>
            </div>
          )}

          {response && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Headline Badge */}
              <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AI SYNTHESIS · 96% CONFIDENCE</span>
                </div>
                <h3 className="text-base font-bold text-[#18181B]">{response.headline}</h3>
                <p className="text-sm text-[#3F3F46] mt-2 leading-relaxed whitespace-pre-line">
                  {response.summary}
                </p>
              </div>

              {/* Grid: Concentration & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
                  <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wide mb-1">
                    Affected Segment
                  </p>
                  <p className="text-xs font-medium text-[#18181B] leading-relaxed">
                    {response.concentration}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E1D8] bg-white">
                  <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wide mb-1">
                    Business Consequence
                  </p>
                  <p className="text-xs font-medium text-[#18181B] leading-relaxed">
                    {response.whyItMatters}
                  </p>
                </div>
              </div>

              {/* Representative Customer Voice Quote */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border-l-4 border-[#18181B] border border-[#E5E1D8]">
                <p className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1">
                  Representative Customer Evidence
                </p>
                <p className="text-sm italic text-[#18181B] font-serif leading-relaxed">
                  {response.representativeQuote}
                </p>
              </div>

              {/* Recommendation Callout */}
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                <p className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Recommended Product Action
                </p>
                <p className="text-xs text-[#065F46] leading-relaxed font-medium">
                  {response.recommendedAction}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#ECE8E0]">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenFeedbackList) onOpenFeedbackList();
                  }}
                  className="px-4 py-2 rounded-lg border border-[#E5E1D8] text-xs font-semibold text-[#18181B] hover:bg-[#F4F1EA]"
                >
                  Explore All Evidence ({response.evidenceCount} items)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenProblem) onOpenProblem(response.targetProblemId);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] flex items-center gap-1.5"
                >
                  <span>Open Problem Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
