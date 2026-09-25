import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { channelHandleOrId = "@VJ_Sidhu_Vlogs", maxVideos = 5, commentsPerVideo = 20, apiKey } = body;

    // Call FastAPI Backend Live YouTube Channel Ingestion & NLP Pipeline
    const backendApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
    const fastApiResp = await fetch(`${backendApiBase}/connectors/youtube/live-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: channelHandleOrId.trim(),
        max_videos: maxVideos,
        max_comments: commentsPerVideo,
        run_nlp: true,
        api_key: apiKey || undefined,
      }),
    });

    const fastApiData = await fastApiResp.json();

    if (!fastApiResp.ok) {
      return NextResponse.json(
        { error: fastApiData.detail || fastApiData.message || "FastAPI backend failed to process YouTube channel live sync." },
        { status: fastApiResp.status }
      );
    }

    return NextResponse.json({
      success: true,
      stats: fastApiData.stats,
      comments: fastApiData.comments,
      problemsDiscovered: fastApiData.problems_discovered,
      intelligenceCycle: fastApiData.intelligence_cycle,
      backendStatus: "fastapi_nlp_live",
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Backend connection error: ${error.message}` },
      { status: 502 }
    );
  }
}
