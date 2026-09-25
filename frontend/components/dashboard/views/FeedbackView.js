"use client";

import { useState } from "react";
import { Search, Filter, MessageSquare, ExternalLink, ThumbsUp } from "lucide-react";
import { getFullFeedbackDatabase } from "../data/intelligenceMockData";

export default function FeedbackView({ onSelectFeedback }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const allFeedback = getFullFeedbackDatabase();

  const filteredItems = allFeedback.filter((item) => {
    if (selectedSource !== "all" && item.source !== selectedSource) return false;
    if (selectedSentiment !== "all" && item.sentiment !== selectedSentiment) return false;
    if (selectedPlatform !== "all" && item.platform !== selectedPlatform) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = (item.text || "").toLowerCase().includes(q);
      const matchAuthor = (item.authorName || "").toLowerCase().includes(q);
      const matchProblem = (item.problemName || "").toLowerCase().includes(q);
      if (!matchText && !matchAuthor && !matchProblem) return false;
    }
    return true;
  });

  const sources = Array.from(new Set(allFeedback.map((f) => f.source)));
  const platforms = Array.from(new Set(allFeedback.map((f) => f.platform)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-[#ECE8E0] pb-6">
        <h1 className="text-2xl font-bold text-[#18181B] font-serif">Customer Feedback Explorer</h1>
        <p className="text-xs text-[#71717A] mt-1">
          Raw customer voices normalized from all connected review channels with real-time sentiment tokens.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5E1D8]">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full bg-[#FBF9F5] border border-[#E5E1D8] focus:border-[#18181B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#18181B] outline-none"
            placeholder="Search keywords, author names, or problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="bg-[#FBF9F5] border border-[#E5E1D8] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] outline-none"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            <option value="all">All Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="bg-[#FBF9F5] border border-[#E5E1D8] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] outline-none"
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          <select
            className="bg-[#FBF9F5] border border-[#E5E1D8] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] outline-none"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            <option value="all">All Platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stream Count Indicator */}
      <div className="flex items-center justify-between text-xs text-[#71717A]">
        <span>Showing {filteredItems.length} verified customer feedback records</span>
        <span>Click any row to open full signal dossier</span>
      </div>

      {/* Feedback Stream List */}
      <div className="bg-white rounded-xl border border-[#E5E1D8] divide-y divide-[#ECE8E0] overflow-hidden">
        {filteredItems.slice(0, 40).map((item) => {
          const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={item.id}
              onClick={() => onSelectFeedback(item)}
              className="p-4 hover:bg-[#FBF9F5] cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 group"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      item.sentiment === "positive"
                        ? "bg-[#ECFDF5] text-[#059669]"
                        : item.sentiment === "negative"
                        ? "bg-[#FFF1F2] text-[#E11D48]"
                        : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    {item.sentiment}
                  </span>
                  <span className="font-semibold text-[#18181B]">{item.authorName}</span>
                  <span className="text-[#71717A]">•</span>
                  <span className="text-[#71717A]">{item.source}</span>
                  <span className="text-[#71717A]">•</span>
                  <span className="text-[#71717A]">{dateStr}</span>
                </div>
                <p className="text-xs text-[#18181B] font-serif leading-relaxed line-clamp-2">
                  “{item.text}”
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="bg-[#FAF8F5] border border-[#ECE8E0] text-[11px] px-2 py-0.5 rounded font-medium text-[#3F3F46]">
                    Problem: {item.problemName}
                  </span>
                  <span className="text-[11px] text-[#71717A]">{item.platform}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-right">
                {item.rating && (
                  <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded">
                    {item.rating} ★
                  </span>
                )}
                <span className="text-xs font-bold text-[#4F46E5] group-hover:underline flex items-center gap-1">
                  Inspect →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
