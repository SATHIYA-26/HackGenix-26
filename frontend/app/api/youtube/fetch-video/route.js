import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { videoUrlOrId, maxComments = 50, apiKey } = body;

    if (!videoUrlOrId || !videoUrlOrId.trim()) {
      return NextResponse.json(
        { error: "A valid YouTube Video URL or Video ID is required." },
        { status: 400 }
      );
    }

    // Call FastAPI Backend Live YouTube Ingestion & NLP Pipeline
    const backendApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
    const fastApiResp = await fetch(`${backendApiBase}/connectors/youtube/live-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: videoUrlOrId.trim(),
        max_comments: maxComments,
        run_nlp: true,
        api_key: apiKey || undefined,
      }),
    });

    const fastApiData = await fastApiResp.json();

    if (!fastApiResp.ok) {
      return NextResponse.json(
        { error: fastApiData.detail || fastApiData.message || "FastAPI backend failed to process YouTube live extraction." },
        { status: fastApiResp.status }
      );
    }

    return NextResponse.json({
      success: true,
      video: fastApiData.video,
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
