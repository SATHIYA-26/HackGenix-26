import { NextResponse } from "next/server";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function extractVideoId(videoInput) {
  if (!videoInput) return "";
  const clean = videoInput.trim();
  if (clean.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  const match = clean.match(/(?:v=|\/|embed\/|shorts\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : clean;
}

// Simple sentiment classifier based on sentiment keywords and heuristics for live stats
function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  const positiveWords = ["great", "good", "love", "awesome", "excellent", "best", "super", "fire", "amazing", "well played", "proud", "pure", "fun", "hilarious", "top", "nice", "enjoy", "legend", "win", "happy", "thank", "king", "queen", "champion"];
  const negativeWords = ["bad", "worst", "hate", "terrible", "poor", "slow", "horrible", "delay", "crash", "bug", "issue", "problem", "fail", "freeze", "disappoint", "waste", "anpadh", "stupid", "crap", "gay", "iq", "trash", "scam"];

  let posCount = 0;
  let negCount = 0;

  positiveWords.forEach((w) => {
    if (lower.includes(w)) posCount++;
  });
  negativeWords.forEach((w) => {
    if (lower.includes(w)) negCount++;
  });

  if (posCount > negCount) return { sentiment: "positive", score: 0.85 };
  if (negCount > posCount) return { sentiment: "negative", score: -0.75 };
  return { sentiment: "neutral", score: 0.1 };
}

import fs from "fs";
import path from "path";

function resolveApiKey(customApiKey) {
  if (customApiKey) return customApiKey;
  if (process.env.YOUTUBE_API_KEY) return process.env.YOUTUBE_API_KEY;

  // Try reading from .env or .env.local on filesystem
  const envPaths = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "..", ".env"),
  ];

  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      const match = content.match(/YOUTUBE_API_KEY=([^\r\n]+)/);
      if (match && match[1] && match[1].trim() && match[1].trim() !== "your_youtube_api_key_here") {
        return match[1].trim();
      }
    }
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { videoUrlOrId, apiKey: customApiKey, maxComments = 50 } = body;

    const apiKey = resolveApiKey(customApiKey);

    // 1. Forward directly to FastAPI Backend for real-time live ingestion and NLP pipeline
    const backendApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
    try {
      const fastApiResp = await fetch(`${backendApiBase}/connectors/youtube/live-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: videoUrlOrId,
          max_comments: maxComments || 50,
          run_nlp: true,
          api_key: apiKey || undefined,
        }),
      });

      if (fastApiResp.ok) {
        const fastApiData = await fastApiResp.json();
        return NextResponse.json({
          success: true,
          video: fastApiData.video,
          stats: fastApiData.stats,
          comments: fastApiData.comments,
          problemsDiscovered: fastApiData.problems_discovered,
          intelligenceCycle: fastApiData.intelligence_cycle,
          backendStatus: "fastapi_nlp_live",
        });
      }
    } catch (backendErr) {
      console.warn("FastAPI live-sync offline, executing built-in fallback:", backendErr.message);
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API Key not found. Please add YOUTUBE_API_KEY to your .env file or pass apiKey in request." },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(videoUrlOrId);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube Video URL or ID." }, { status: 400 });
    }

    // 2. Built-in Fallback: Fetch Video Metadata directly
    const videoResp = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
    );
    const videoData = await videoResp.json();

    if (!videoResp.ok) {
      return NextResponse.json(
        { error: videoData?.error?.message || "Failed to fetch video details from YouTube." },
        { status: videoResp.status }
      );
    }

    const videoItem = videoData.items?.[0];
    if (!videoItem) {
      return NextResponse.json({ error: "YouTube video not found." }, { status: 404 });
    }

    const videoMeta = {
      videoId,
      title: videoItem.snippet?.title || "YouTube Video",
      channelTitle: videoItem.snippet?.channelTitle || "YouTube Channel",
      channelId: videoItem.snippet?.channelId || "",
      publishedAt: videoItem.snippet?.publishedAt || "",
      thumbnails: videoItem.snippet?.thumbnails || {},
      viewCount: parseInt(videoItem.statistics?.viewCount || "0", 10),
      likeCount: parseInt(videoItem.statistics?.likeCount || "0", 10),
      commentCount: parseInt(videoItem.statistics?.commentCount || "0", 10),
    };

    // 2. Fetch Comments
    const commentsUrl = `${YOUTUBE_API_BASE}/commentThreads?part=snippet,replies&videoId=${videoId}&maxResults=${Math.min(maxComments, 100)}&textFormat=plainText&key=${apiKey}`;
    const commentResp = await fetch(commentsUrl);
    const commentData = await commentResp.json();

    if (!commentResp.ok) {
      if (commentData?.error?.errors?.some((e) => e.reason === "commentsDisabled")) {
        return NextResponse.json({
          success: true,
          video: videoMeta,
          stats: { totalComments: 0, positiveCount: 0, neutralCount: 0, negativeCount: 0, netSentiment: "0%", avgLikes: 0 },
          comments: [],
          message: "Comments are disabled on this video.",
        });
      }
      return NextResponse.json(
        { error: commentData?.error?.message || "Failed to fetch comments from YouTube." },
        { status: commentResp.status }
      );
    }

    const rawItems = commentData.items || [];
    const extractedComments = [];

    for (const item of rawItems) {
      const top = item.snippet?.topLevelComment?.snippet;
      const topId = item.snippet?.topLevelComment?.id;
      const text = top?.textOriginal || top?.textDisplay || "";

      if (text.trim()) {
        const analysis = analyzeSentiment(text);
        extractedComments.push({
          id: `yt_${topId}`,
          text: text.trim(),
          authorName: top?.authorDisplayName || "Anonymous",
          authorAvatar: top?.authorProfileImageUrl || "",
          likeCount: top?.likeCount || 0,
          createdAt: top?.publishedAt || "",
          source: `YouTube · ${videoMeta.title}`,
          sourceUrl: `https://www.youtube.com/watch?v=${videoId}&lc=${topId}`,
          sentiment: analysis.sentiment,
          score: analysis.score,
          isReply: false,
          replyCount: item.snippet?.totalReplyCount || 0,
        });
      }

      // Check replies
      const replies = item.replies?.comments || [];
      for (const rep of replies) {
        const repSnippet = rep.snippet;
        const repId = rep.id;
        const repText = repSnippet?.textOriginal || repSnippet?.textDisplay || "";
        if (repText.trim()) {
          const repAnalysis = analyzeSentiment(repText);
          extractedComments.push({
            id: `yt_${repId}`,
            parentId: `yt_${topId}`,
            text: repText.trim(),
            authorName: repSnippet?.authorDisplayName || "Anonymous",
            authorAvatar: repSnippet?.authorProfileImageUrl || "",
            likeCount: repSnippet?.likeCount || 0,
            createdAt: repSnippet?.publishedAt || "",
            source: `YouTube · ${videoMeta.title}`,
            sourceUrl: `https://www.youtube.com/watch?v=${videoId}&lc=${repId}`,
            sentiment: repAnalysis.sentiment,
            score: repAnalysis.score,
            isReply: true,
          });
        }
      }
    }

    // 3. Compute Real Stats & Aggregations
    const totalExtracted = extractedComments.length;
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let totalLikes = 0;

    extractedComments.forEach((c) => {
      totalLikes += c.likeCount || 0;
      if (c.sentiment === "positive") positiveCount++;
      else if (c.sentiment === "negative") negativeCount++;
      else neutralCount++;
    });

    const netScore = totalExtracted > 0 ? Math.round(((positiveCount - negativeCount) / totalExtracted) * 100) : 0;
    const netSentimentFormatted = `${netScore >= 0 ? "+" : ""}${netScore}%`;
    const positivePct = totalExtracted > 0 ? Math.round((positiveCount / totalExtracted) * 100) : 0;
    const neutralPct = totalExtracted > 0 ? Math.round((neutralCount / totalExtracted) * 100) : 0;
    const negativePct = totalExtracted > 0 ? Math.round((negativeCount / totalExtracted) * 100) : 0;

    // Top liked comments
    const topLiked = [...extractedComments].sort((a, b) => b.likeCount - a.likeCount).slice(0, 3);

    const stats = {
      totalCommentsExtracted: totalExtracted,
      videoHeaderCommentCount: videoMeta.commentCount,
      netSentiment: netSentimentFormatted,
      positiveCount,
      positivePct,
      neutralCount,
      neutralPct,
      negativeCount,
      negativePct,
      totalLikes,
      avgLikesPerComment: totalExtracted > 0 ? (totalLikes / totalExtracted).toFixed(1) : "0.0",
      topLikedComments: topLiked,
    };

    // 4. Send JSON Result to External NLP Backend (with Graceful Fallback)
    let backendResponse = null;
    let backendStatus = "local_engine";
    const backendUrl = process.env.BACKEND_API_URL || process.env.NLP_BACKEND_URL || "http://127.0.0.1:8000/api/nlp/process-youtube";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);

      const bResp = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video: videoMeta,
          stats,
          comments: extractedComments,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (bResp.ok) {
        backendResponse = await bResp.json();
        backendStatus = "forwarded_to_backend";
      } else {
        backendStatus = `backend_status_${bResp.status}`;
      }
    } catch (bErr) {
      // Backend offline or not ready; safely fall back to our built-in statistics engine
      backendStatus = "backend_offline_fallback_active";
    }

    return NextResponse.json({
      success: true,
      video: videoMeta,
      stats,
      comments: extractedComments,
      backendStatus,
      backendData: backendResponse,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
