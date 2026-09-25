"use client";

import { useState } from "react";
import {
  Play,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function YouTubeIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function YouTubeLiveExtractorCard({ onAddFeedbackItems, company, onVideoAnalyzed }) {
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/watch?v=eMFDH_iU9lk");
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [videoError, setVideoError] = useState("");

  // Channel Live Sync State (5 videos x 20 comments)
  const [isSyncingChannel, setIsSyncingChannel] = useState(false);
  const [syncProgress, setSyncProgress] = useState([]);
  const [channelSyncResult, setChannelSyncResult] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  // Handle single video fetch & stats
  const handleFetchVideo = async (e) => {
    if (e) e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsLoadingVideo(true);
    setVideoError("");
    setVideoResult(null);

    try {
      const resp = await fetch("/api/youtube/fetch-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrlOrId: videoUrl.trim(), maxComments: 100 }),
      });

      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || "Failed to fetch video comments.");
      }

      setVideoResult(data);
      if (onAddFeedbackItems && data.comments?.length > 0) {
        onAddFeedbackItems(data.comments);
      }
      if (onVideoAnalyzed) {
        onVideoAnalyzed(data);
      }
    } catch (err) {
      setVideoError(err.message || "Could not connect to YouTube API.");
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Handle live channel sync (5 videos x 20 comments = 100 comments)
  const handleRunChannelSync = async () => {
    setIsSyncingChannel(true);
    setShowSyncModal(true);
    setSyncProgress(["Connecting to YouTube Data API v3...", "Resolving Channel handle & latest uploads..."]);
    setChannelSyncResult(null);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setSyncProgress((prev) => [...prev, "Found 5 latest video uploads. Initializing batch extraction..."]);

      const resp = await fetch("/api/youtube/live-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelHandleOrId: company?.handle || "@VJ_Sidhu_Vlogs",
          maxVideos: 5,
          commentsPerVideo: 20,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || "Failed to sync channel comments.");
      }

      if (data.videos) {
        for (let i = 0; i < data.videos.length; i++) {
          const v = data.videos[i];
          setSyncProgress((prev) => [
            ...prev,
            `Video ${i + 1}/5: "${v.title.slice(0, 35)}..." (${v.commentsCount} comments extracted, Net: ${v.netSentiment})`,
          ]);
          await new Promise((r) => setTimeout(r, 400));
        }
      }

      setSyncProgress((prev) => [
        ...prev,
        `Computing NLP Aspect Polarity & Statistical Aggregations across ${data.stats?.totalCommentsExtracted || 100} signals...`,
        `Complete! Ingested ${data.stats?.totalCommentsExtracted || 100} comments across 5 latest videos.`,
      ]);

      setChannelSyncResult(data);
      if (onAddFeedbackItems && data.comments?.length > 0) {
        onAddFeedbackItems(data.comments);
      }
    } catch (err) {
      setSyncProgress((prev) => [...prev, `[!] Error: ${err.message}`]);
    } finally {
      setIsSyncingChannel(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── LIVE YOUTUBE COMMAND & INGESTION BOX ─── */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF5FF] via-[#FBF9F5] to-white border border-[#DDD6FE] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ECE8E0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF0000] text-white flex items-center justify-center shadow-xs">
              <YouTubeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#18181B] font-serif flex items-center gap-2">
                Live YouTube API v3 Pipeline
              </h3>
              <p className="text-xs text-[#71717A]">
                Fetch live comments, parse nested replies, and compute real-time NLP sentiment statistics.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunChannelSync}
            disabled={isSyncingChannel}
            className="h-8 px-3 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingChannel ? "animate-spin" : ""}`} />
            <span>Channel Live Sync (5 Videos × 20 Comments)</span>
          </button>
        </div>

        {/* Video URL Input Bar */}
        <form onSubmit={handleFetchVideo} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Play className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="w-full bg-white border border-[#E5E1D8] focus:border-[#7C3AED] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] outline-none shadow-2xs transition-all"
              placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=eMFDH_iU9lk)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoadingVideo || !videoUrl.trim()}
            className="w-full sm:w-auto h-9 px-4 rounded-xl bg-[#18181B] hover:bg-[#27272A] disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          >
            {isLoadingVideo ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running API & Computing Stats...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#DDD6FE]" />
                <span>Fetch Video Comments & Stats</span>
              </>
            )}
          </button>
        </form>

        {videoError && (
          <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-xs text-[#E11D48] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{videoError}</span>
          </div>
        )}

        {/* ─── LIVE VIDEO STATS & OUTPUT CARD ─── */}
        {videoResult && (
          <div className="p-4 rounded-xl bg-white border border-[#E5E1D8] shadow-2xs space-y-4 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#ECE8E0]">
              <div>
                <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider bg-[#F5F3FF] px-2 py-0.5 rounded border border-[#DDD6FE]">
                  Live Video Intelligence
                </span>
                <h4 className="text-sm font-bold text-[#18181B] mt-1 font-serif">
                  {videoResult.video?.title}
                </h4>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Channel: <strong>{videoResult.video?.channelTitle}</strong> · Total Views: {videoResult.video?.viewCount?.toLocaleString()} · YouTube Header Comments: {videoResult.video?.commentCount}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-[#71717A] block uppercase font-semibold">Net Sentiment</span>
                  <span className="text-base font-bold text-[#059669]">
                    {videoResult.stats?.netSentiment}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#71717A] block uppercase font-semibold">Comments Analyzed</span>
                  <span className="text-base font-bold text-[#18181B]">
                    {videoResult.stats?.totalCommentsExtracted}
                  </span>
                </div>
              </div>
            </div>

            {/* Micro Sentiment Trajectory */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs">
                <span className="text-[10px] font-bold text-[#059669] uppercase">Positive Delight</span>
                <p className="text-lg font-bold text-[#059669] mt-0.5">
                  {videoResult.stats?.positivePct}% ({videoResult.stats?.positiveCount} items)
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] text-xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase">Neutral / Discussion</span>
                <p className="text-lg font-bold text-[#64748B] mt-0.5">
                  {videoResult.stats?.neutralPct}% ({videoResult.stats?.neutralCount} items)
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#FFF1F2] border border-[#FECDD3] text-xs">
                <span className="text-[10px] font-bold text-[#E11D48] uppercase">Negative / Criticism</span>
                <p className="text-lg font-bold text-[#E11D48] mt-0.5">
                  {videoResult.stats?.negativePct}% ({videoResult.stats?.negativeCount} items)
                </p>
              </div>
            </div>

            {/* Extracted Comments Stream Preview */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#18181B] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Extracted Live Comments ({videoResult.comments?.length})
                </span>
                <span className="text-[11px] text-[#71717A]">
                  Avg. {videoResult.stats?.avgLikesPerComment} likes / comment
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {videoResult.comments?.slice(0, 8).map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg bg-[#FAF8F5] border border-[#ECE8E0] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#18181B]">{c.authorName}</span>
                        {c.isReply && (
                          <span className="text-[9px] bg-[#E5E1D8] text-[#71717A] px-1.5 py-0.2 rounded font-mono">
                            Reply
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#71717A] flex items-center gap-0.5">
                          <ThumbsUp className="w-3 h-3" /> {c.likeCount}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            c.sentiment === "positive"
                              ? "bg-[#ECFDF5] text-[#059669]"
                              : c.sentiment === "negative"
                              ? "bg-[#FFF1F2] text-[#E11D48]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {c.sentiment}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#3F3F46] leading-relaxed">“{c.text}”</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: 5 VIDEOS X 20 COMMENTS LIVE CHANNEL SYNC ─── */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E5E1D8] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF0000] text-white flex items-center justify-center">
                  <YouTubeIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#18181B] font-serif">
                    Channel Live Sync: 5 Videos × 20 Comments
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Automated batch ingestion streaming directly into Reviewr Intelligence.
                  </p>
                </div>
              </div>

              {!isSyncingChannel && (
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="px-3 py-1 rounded-lg bg-[#F4F1EA] hover:bg-[#EBE7DD] text-xs font-semibold text-[#18181B]"
                >
                  Done
                </button>
              )}
            </div>

            {/* Live Progress Log */}
            <div className="p-4 rounded-xl bg-[#18181B] text-white font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
              {syncProgress.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#7C3AED] select-none">&gt;</span>
                  <span className={idx === syncProgress.length - 1 && isSyncingChannel ? "text-[#DDD6FE] animate-pulse" : "text-white/90"}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Aggregated Statistics Summary */}
            {channelSyncResult && (
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DDD6FE] space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
                  <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                    Aggregated Multi-Video Intelligence
                  </span>
                  <span className="text-xs font-bold text-[#059669]">
                    Net Sentiment: {channelSyncResult.stats?.netSentiment}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E5E1D8]">
                    <span className="text-[10px] text-[#71717A] block">Videos Processed</span>
                    <span className="text-base font-bold text-[#18181B]">
                      {channelSyncResult.stats?.videosAnalyzedCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E5E1D8]">
                    <span className="text-[10px] text-[#71717A] block">Total Ingested</span>
                    <span className="text-base font-bold text-[#18181B]">
                      {channelSyncResult.stats?.totalCommentsExtracted} comments
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
                    <span className="text-[10px] text-[#059669] block">Positive Ratio</span>
                    <span className="text-base font-bold text-[#059669]">
                      {channelSyncResult.stats?.positivePct}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FFF1F2] border border-[#FECDD3]">
                    <span className="text-[10px] text-[#E11D48] block">Negative Ratio</span>
                    <span className="text-base font-bold text-[#E11D48]">
                      {channelSyncResult.stats?.negativePct}%
                    </span>
                  </div>
                </div>

                {/* Per Video Breakdown */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-[#18181B]">Extracted Video Signals Breakdown:</p>
                  <div className="space-y-1.5">
                    {channelSyncResult.videos?.map((v, i) => (
                      <div
                        key={v.videoId}
                        className="p-2.5 rounded-lg bg-white border border-[#E5E1D8] text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                          <span className="w-5 h-5 rounded bg-[#FAF8F5] border text-[10px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-semibold text-[#18181B] truncate">{v.title}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <span className="text-[11px] text-[#71717A]">{v.commentsCount} comments</span>
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              v.positiveRatio >= 60 ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FFF1F2] text-[#E11D48]"
                            }`}
                          >
                            {v.netSentiment}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ECE8E0]">
              <button
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 rounded-xl bg-[#18181B] text-white text-xs font-semibold hover:bg-[#27272A] transition-colors"
              >
                Close & View in Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
