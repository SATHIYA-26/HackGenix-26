import { NextResponse } from "next/server";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function extractChannelHandle(channelInput) {
  if (!channelInput) return "@VJ_Sidhu_Vlogs";
  let clean = channelInput.trim();
  if (clean.startsWith("@")) return clean;
  if (clean.includes("youtube.com/")) {
    const parts = clean.split("/");
    const last = parts[parts.length - 1];
    return last.startsWith("@") ? last : `@${last}`;
  }
  return clean.startsWith("@") ? clean : `@${clean}`;
}

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
    const { channelHandleOrId = "@VJ_Sidhu_Vlogs", apiKey: customApiKey, maxVideos = 5, commentsPerVideo = 20 } = body;

    const apiKey = resolveApiKey(customApiKey);

    // 1. Forward directly to FastAPI Backend for real-time live ingestion and NLP pipeline
    const backendApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
    try {
      const fastApiResp = await fetch(`${backendApiBase}/connectors/youtube/live-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: channelHandleOrId,
          max_videos: maxVideos || 5,
          max_comments: commentsPerVideo || 20,
          run_nlp: true,
          api_key: apiKey || undefined,
        }),
      });

      if (fastApiResp.ok) {
        const fastApiData = await fastApiResp.json();
        return NextResponse.json({
          success: true,
          stats: fastApiData.stats,
          comments: fastApiData.comments,
          problemsDiscovered: fastApiData.problems_discovered,
          intelligenceCycle: fastApiData.intelligence_cycle,
          backendStatus: "fastapi_nlp_live",
        });
      }
    } catch (backendErr) {
      console.warn("FastAPI live-sync channel offline, executing built-in fallback:", backendErr.message);
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API Key not found. Please set YOUTUBE_API_KEY in your .env or pass in request." },
        { status: 400 }
      );
    }

    const channelHandle = extractChannelHandle(channelHandleOrId);

    // 2. Built-in Fallback: Resolve Channel
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(channelHandle)}&type=channel&maxResults=1&key=${apiKey}`;
    const searchResp = await fetch(searchUrl);
    const searchData = await searchResp.json();

    if (!searchResp.ok) {
      return NextResponse.json(
        { error: searchData?.error?.message || "Failed to search for YouTube channel." },
        { status: searchResp.status }
      );
    }

    const channelItem = searchData.items?.[0];
    if (!channelItem) {
      return NextResponse.json({ error: `No YouTube channel found for '${channelHandle}'.` }, { status: 404 });
    }

    const channelId = channelItem.snippet?.channelId;
    const channelTitle = channelItem.snippet?.title;
    const channelAvatar = channelItem.snippet?.thumbnails?.default?.url || "";

    // 2. Fetch Latest 5 Videos from Channel
    const videosSearchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxVideos}&key=${apiKey}`;
    const videosResp = await fetch(videosSearchUrl);
    const videosData = await videosResp.json();

    if (!videosResp.ok) {
      return NextResponse.json(
        { error: videosData?.error?.message || "Failed to fetch channel videos." },
        { status: videosResp.status }
      );
    }

    const videoItems = (videosData.items || []).filter((v) => v.id?.videoId);
    const syncedVideos = [];
    const allComments = [];

    // 3. For each of the 5 videos, fetch 20 comments
    for (const v of videoItems) {
      const vidId = v.id.videoId;
      const vidTitle = v.snippet?.title || "Video";
      const publishedAt = v.snippet?.publishedAt || "";
      const thumb = v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || "";

      let videoComments = [];

      try {
        const commentsUrl = `${YOUTUBE_API_BASE}/commentThreads?part=snippet&videoId=${vidId}&maxResults=${commentsPerVideo}&textFormat=plainText&key=${apiKey}`;
        const cResp = await fetch(commentsUrl);
        const cData = await cResp.json();

        if (cResp.ok && cData.items) {
          for (const item of cData.items) {
            const top = item.snippet?.topLevelComment?.snippet;
            const topId = item.snippet?.topLevelComment?.id;
            const text = top?.textOriginal || top?.textDisplay || "";

            if (text.trim()) {
              const analysis = analyzeSentiment(text);
              const commentObj = {
                id: `yt_${topId}`,
                text: text.trim(),
                authorName: top?.authorDisplayName || "Anonymous",
                authorAvatar: top?.authorProfileImageUrl || "",
                likeCount: top?.likeCount || 0,
                createdAt: top?.publishedAt || "",
                videoId: vidId,
                videoTitle: vidTitle,
                source: `YouTube · ${vidTitle.slice(0, 30)}...`,
                sourceUrl: `https://www.youtube.com/watch?v=${vidId}&lc=${topId}`,
                sentiment: analysis.sentiment,
                score: analysis.score,
              };
              videoComments.push(commentObj);
              allComments.push(commentObj);
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching comments for video ${vidId}:`, err);
      }

      // Calculate sentiment stats for this specific video
      let vPos = 0;
      let vNeg = 0;
      videoComments.forEach((c) => {
        if (c.sentiment === "positive") vPos++;
        else if (c.sentiment === "negative") vNeg++;
      });
      const vTotal = videoComments.length || 1;
      const vNetScore = Math.round(((vPos - vNeg) / vTotal) * 100);

      syncedVideos.push({
        videoId: vidId,
        title: vidTitle,
        publishedAt,
        thumbnail: thumb,
        commentsCount: videoComments.length,
        netSentiment: `${vNetScore >= 0 ? "+" : ""}${vNetScore}%`,
        positiveRatio: Math.round((vPos / vTotal) * 100),
        negativeRatio: Math.round((vNeg / vTotal) * 100),
      });
    }

    // 4. Compute Aggregate Statistics across all 5 videos
    const totalComments = allComments.length;
    let aggregatePositive = 0;
    let aggregateNeutral = 0;
    let aggregateNegative = 0;
    let aggregateLikes = 0;

    allComments.forEach((c) => {
      aggregateLikes += c.likeCount || 0;
      if (c.sentiment === "positive") aggregatePositive++;
      else if (c.sentiment === "negative") aggregateNegative++;
      else aggregateNeutral++;
    });

    const netScore = totalComments > 0 ? Math.round(((aggregatePositive - aggregateNegative) / totalComments) * 100) : 0;
    const netSentimentFormatted = `${netScore >= 0 ? "+" : ""}${netScore}%`;

    const overallStats = {
      channelTitle,
      channelId,
      channelAvatar,
      videosAnalyzedCount: syncedVideos.length,
      totalCommentsExtracted: totalComments,
      netSentiment: netSentimentFormatted,
      positiveCount: aggregatePositive,
      positivePct: totalComments > 0 ? Math.round((aggregatePositive / totalComments) * 100) : 0,
      neutralCount: aggregateNeutral,
      neutralPct: totalComments > 0 ? Math.round((aggregateNeutral / totalComments) * 100) : 0,
      negativeCount: aggregateNegative,
      negativePct: totalComments > 0 ? Math.round((aggregateNegative / totalComments) * 100) : 0,
      totalLikes: aggregateLikes,
      avgLikesPerComment: totalComments > 0 ? (aggregateLikes / totalComments).toFixed(1) : "0.0",
      topLikedComments: [...allComments].sort((a, b) => b.likeCount - a.likeCount).slice(0, 4),
    };

    return NextResponse.json({
      success: true,
      channel: {
        id: channelId,
        title: channelTitle,
        handle: channelHandle,
        avatar: channelAvatar,
      },
      stats: overallStats,
      videos: syncedVideos,
      comments: allComments,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
