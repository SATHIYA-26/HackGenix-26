"use client";

import { X, ExternalLink, ThumbsUp, Tag, ShieldCheck, Sparkles, CornerDownRight, ArrowRight, Star } from "lucide-react";

export default function FeedbackDetailDrawer({ isOpen, feedback, onClose, onSelectProblem }) {
  if (!isOpen || !feedback) return null;

  const formattedDate = feedback.createdAt
    ? new Date(feedback.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recent";

  const similarItems = feedback.similarItems || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#E5E1D8] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#ECE8E0] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
                Customer Signal Dossier
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  feedback.sentiment === "positive"
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : feedback.sentiment === "negative"
                    ? "bg-[#FFF1F2] text-[#E11D48]"
                    : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                {feedback.sentiment}
              </span>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">ID: {feedback.id}</p>
          </div>
          <button onClick={onClose} className="text-[#71717A] hover:text-[#18181B] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Bio & Source Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-[#ECE8E0]">
            <div className="flex items-center gap-3">
              <img
                src={feedback.authorAvatar}
                alt={feedback.authorName}
                className="w-10 h-10 rounded-full object-cover border border-[#E5E1D8]"
              />
              <div>
                <p className="text-sm font-bold text-[#18181B]">{feedback.authorName}</p>
                <p className="text-xs text-[#71717A]">
                  {feedback.source} · {formattedDate}
                </p>
              </div>
            </div>
            {feedback.rating && (
              <span className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] text-[#D97706] text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                <span>{feedback.rating}.0</span>
              </span>
            )}
          </div>

          {/* Original Voice Text */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Original Customer Voice
            </p>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E1D8] text-sm text-[#18181B] font-serif italic leading-relaxed">
              “{feedback.text}”
            </div>
            {feedback.sourceUrl && (
              <a
                href={feedback.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:underline"
              >
                <span>Open original review in {feedback.source}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* AI Aspect NLP Analysis */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /> NLP Aspect Decomposition
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-[#E5E1D8] bg-white">
                <span className="text-[11px] text-[#71717A] font-medium">Sentiment Score</span>
                <p className="text-sm font-bold text-[#18181B] mt-0.5">
                  {Math.round(feedback.sentimentScore * 100)}% Confidence
                </p>
              </div>
              <div className="p-3 rounded-xl border border-[#E5E1D8] bg-white">
                <span className="text-[11px] text-[#71717A] font-medium">Customer Intent</span>
                <p className="text-sm font-bold text-[#18181B] mt-0.5">{feedback.intent}</p>
              </div>
            </div>
          </div>

          {/* Traceable Problem Association */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Associated Problem Cluster
            </p>
            <div
              onClick={() => {
                onClose();
                if (onSelectProblem) onSelectProblem(feedback.problemId);
              }}
              className="p-3.5 rounded-xl border border-[#E5E1D8] hover:border-[#18181B] bg-white cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-[#18181B] group-hover:text-[#4F46E5]">
                  {feedback.problemName}
                </p>
                <p className="text-[11px] text-[#71717A] mt-0.5">
                  {feedback.product} · {feedback.platform} · {feedback.version || "Current"}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Semantically Similar Feedback */}
          {similarItems.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-[#ECE8E0]">
              <p className="text-xs font-bold text-[#71717A] uppercase tracking-wider">
                Semantically Similar Customer Feedback
              </p>
              <div className="space-y-2">
                {similarItems.map((sim) => (
                  <div key={sim.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                      <span className="font-semibold text-[#18181B]">{sim.authorName}</span>
                      <span>{sim.source}</span>
                    </div>
                    <p className="text-xs text-[#3F3F46] line-clamp-2">
                      “{sim.text}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#ECE8E0] bg-[#FAF8F5] flex items-center justify-between">
          <span className="text-[11px] text-[#71717A]">Evidence-linked decision record</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onSelectProblem) onSelectProblem(feedback.problemId);
            }}
            className="px-4 py-2 rounded-lg bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] flex items-center gap-1.5"
          >
            <span>View Full Problem Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
