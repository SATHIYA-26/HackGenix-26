"use client";

import { useState, useEffect } from "react";
import { Search, X, AlertTriangle, MessageSquare, Lightbulb, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { PROBLEMS, RAW_FEEDBACK_ITEMS, RECOMMENDATIONS, CONNECTED_SOURCES } from "../data/intelligenceMockData";

export default function CommandPaletteModal({ isOpen, onClose, onSelectProblem, onSelectFeedback, onOpenAskAI }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpenAskAI ? onOpenAskAI() : null;
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onOpenAskAI]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredProblems = cleanQuery
    ? PROBLEMS.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          p.category.toLowerCase().includes(cleanQuery) ||
          p.shortExplanation.toLowerCase().includes(cleanQuery)
      ).slice(0, 3)
    : PROBLEMS.slice(0, 3);

  const filteredFeedback = cleanQuery
    ? RAW_FEEDBACK_ITEMS.filter(
        (f) =>
          f.text.toLowerCase().includes(cleanQuery) ||
          f.authorName.toLowerCase().includes(cleanQuery) ||
          f.product.toLowerCase().includes(cleanQuery)
      ).slice(0, 3)
    : RAW_FEEDBACK_ITEMS.slice(0, 2);

  const filteredRecs = cleanQuery
    ? RECOMMENDATIONS.filter(
        (r) =>
          r.title.toLowerCase().includes(cleanQuery) ||
          r.problemName.toLowerCase().includes(cleanQuery)
      ).slice(0, 2)
    : RECOMMENDATIONS.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E1D8] overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#ECE8E0] gap-3">
          <Search className="w-5 h-5 text-[#71717A] shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-[#18181B] placeholder-[#A1A1AA] outline-none"
            placeholder="Type a keyword or ask a question (e.g. 'UPI payment', 'crashes on Android 14')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <span className="text-[11px] font-medium text-[#71717A] bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#ECE8E0]">
            ESC to close
          </span>
          <button onClick={onClose} className="text-[#71717A] hover:text-[#18181B]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-[460px] overflow-y-auto p-3 space-y-4">
          {/* Quick AI Trigger */}
          <div
            onClick={() => {
              onClose();
              if (onOpenAskAI) onOpenAskAI(query);
            }}
            className="p-3 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] hover:border-[#7C3AED] cursor-pointer flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#7C3AED]">Ask AI Feedback Assistant</p>
                <p className="text-xs text-[#4F46E5] truncate">
                  {query ? `Ask AI: "${query}" with evidence backing` : "Ask questions from reviews"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#7C3AED] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Section: Problems */}
          <div>
            <p className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider px-2 mb-1.5">
              Customer Problems ({filteredProblems.length})
            </p>
            <div className="space-y-1">
              {filteredProblems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => {
                    onClose();
                    onSelectProblem(prob.id);
                  }}
                  className="p-2.5 rounded-lg hover:bg-[#F4F1EA] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#18181B] truncate group-hover:text-[#4F46E5]">
                        {prob.name}
                      </p>
                      <p className="text-[11px] text-[#71717A] truncate">
                        {prob.feedbackCount} mentions · {prob.growthLabel} · Priority {prob.priorityScore} · {prob.product}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#71717A] shrink-0 font-medium ml-2">View →</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Raw Feedback */}
          <div>
            <p className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider px-2 mb-1.5">
              Customer Evidence & Quotes ({filteredFeedback.length})
            </p>
            <div className="space-y-1">
              {filteredFeedback.map((fb) => (
                <div
                  key={fb.id}
                  onClick={() => {
                    onClose();
                    if (onSelectFeedback) onSelectFeedback(fb);
                  }}
                  className="p-2.5 rounded-lg hover:bg-[#F4F1EA] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#18181B] font-medium truncate">
                        “{fb.text.substring(0, 75)}…”
                      </p>
                      <p className="text-[11px] text-[#71717A] truncate">
                        {fb.authorName} · {fb.source} · {fb.intent}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#71717A] shrink-0 font-medium ml-2">Inspect →</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Recommendations */}
          <div>
            <p className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider px-2 mb-1.5">
              Actionable Recommendations ({filteredRecs.length})
            </p>
            <div className="space-y-1">
              {filteredRecs.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => {
                    onClose();
                    onSelectProblem(rec.problemId);
                  }}
                  className="p-2.5 rounded-lg hover:bg-[#F4F1EA] cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#18181B] truncate group-hover:text-[#059669]">
                        {rec.title}
                      </p>
                      <p className="text-[11px] text-[#71717A] truncate">
                        {rec.evidenceSummary} · Priority {rec.priorityScore}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#71717A] shrink-0 font-medium ml-2">Action →</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-[#ECE8E0] flex items-center justify-between text-[11px] text-[#71717A]">
          <div className="flex items-center gap-3">
            <span><strong>↑↓</strong> navigate</span>
            <span><strong>↵</strong> select</span>
            <span><strong>ESC</strong> dismiss</span>
          </div>
          <span>Reviewr NLP Engine v2.4</span>
        </div>
      </div>
    </div>
  );
}
