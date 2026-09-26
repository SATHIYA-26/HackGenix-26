"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MessageSquare,
  ExternalLink,
  ThumbsUp,
  Star,
  RefreshCw,
  Sparkles,
  Inbox,
} from "lucide-react";
import { getFeedbackList } from "@/lib/api/feedback";

export default function FeedbackView({ onSelectFeedback, company }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [selectedIntent, setSelectedIntent] = useState("all");
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchFeedback = () => {
    setIsLoading(true);
    getFeedbackList({
      accountId: company?.id,
      page: 1,
      limit: 100,
      source: selectedSource,
      sentiment: selectedSentiment,
      intent: selectedIntent,
      search: searchQuery,
    })
      .then((res) => {
        setFeedbackItems(res?.data || []);
        setTotalRecords(res?.total || res?.data?.length || 0);
        setIsSemanticSearch(Boolean(res?.isSemanticSearch));
      })
      .catch((err) => {
        console.warn("Feedback fetch error:", err.message);
        setFeedbackItems([]);
        setTotalRecords(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFeedback();
  }, [company?.id, selectedSource, selectedSentiment, selectedIntent, searchQuery]);

  // Derived filter options from fetched items or defaults
  const availableSources = Array.from(new Set(feedbackItems.map((f) => f.source).filter(Boolean)));
  const availableIntents = Array.from(new Set(feedbackItems.map((f) => f.intent).filter(Boolean)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B] font-serif">Customer Feedback Explorer</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Raw customer signals with RoBERTa sentiment scores and DistilBERT intent classifications for {company?.name || "your account"}.
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          disabled={isLoading}
          className="p-1.5 rounded-lg border border-[#E5E1D8] bg-white text-[#71717A] hover:text-[#18181B] transition-colors self-start"
          title="Refresh signals"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E5E1D8]">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full bg-[#FBF9F5] border border-[#E5E1D8] focus:border-[#18181B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#18181B] outline-none"
            placeholder="Search feedback keywords or semantic queries..."
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
            {availableSources.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
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

          {availableIntents.length > 0 && (
            <select
              className="bg-[#FBF9F5] border border-[#E5E1D8] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B] outline-none"
              value={selectedIntent}
              onChange={(e) => setSelectedIntent(e.target.value)}
            >
              <option value="all">All Intents</option>
              {availableIntents.map((i) => (
                <option key={i} value={i}>
                  {i.charAt(0).toUpperCase() + i.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Stream Count Indicator */}
      <div className="flex items-center justify-between text-xs text-[#71717A]">
        <div className="flex items-center gap-2">
          <span>Showing {feedbackItems.length} verified customer feedback records</span>
          {isSemanticSearch && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#7C3AED] text-[10px] font-semibold border border-[#DDD6FE]">
              Semantic Embedding Search
            </span>
          )}
          {isLoading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#71717A]">
              <RefreshCw className="w-3 h-3 animate-spin" /> Fetching signals...
            </span>
          )}
        </div>
        <span>Click any row to view audit dossier</span>
      </div>

      {/* Feedback Stream List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#71717A]" />
          <p className="text-xs text-[#71717A]">Loading feedback items from backend...</p>
        </div>
      ) : feedbackItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5E1D8] space-y-3">
          <Inbox className="w-8 h-8 mx-auto text-[#A1A1AA]" />
          <h3 className="text-sm font-bold text-[#18181B]">No Customer Feedback Records</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            {searchQuery || selectedSource !== "all" || selectedSentiment !== "all"
              ? "No feedback items match your current filters."
              : "No feedback items are stored for this account yet. Connect a YouTube source or ingest feedback."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E1D8] divide-y divide-[#ECE8E0] overflow-hidden">
          {feedbackItems.map((item) => {
            const dateStr = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent";

            return (
              <div
                key={item.id}
                onClick={() => onSelectFeedback && onSelectFeedback(item)}
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
                    {item.intent && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#3F3F46] border border-[#ECE8E0] uppercase">
                        {item.intent}
                      </span>
                    )}
                    <span className="font-semibold text-[#18181B]">{item.authorName || "Customer"}</span>
                    <span className="text-[#71717A]">•</span>
                    <span className="text-[#71717A] capitalize">{item.source || "Direct"}</span>
                    <span className="text-[#71717A]">•</span>
                    <span className="text-[#71717A]">{dateStr}</span>
                  </div>

                  <p className="text-xs text-[#18181B] font-serif leading-relaxed line-clamp-2">
                    "{item.text}"
                  </p>

                  <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                    {item.problemName && (
                      <span className="bg-[#FAF8F5] border border-[#ECE8E0] text-[11px] px-2 py-0.5 rounded font-medium text-[#3F3F46]">
                        Cluster: {item.problemName}
                      </span>
                    )}
                    {item.similarityScore && (
                      <span className="text-[10px] text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded font-mono font-bold">
                        Match {(item.similarityScore * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  {item.rating != null && (
                    <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#D97706] text-[#D97706]" />
                      <span>{item.rating}.0</span>
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
      )}
    </div>
  );
}
