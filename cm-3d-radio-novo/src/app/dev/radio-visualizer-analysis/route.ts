import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { findLocalVisualizerAnalysis } from "@/features/radio/local-visualizer-analysis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  const trackId = request.nextUrl.searchParams.get("track");
  if (!trackId) {
    return NextResponse.json({ error: "Track ID is required." }, { status: 400 });
  }

  const path = findLocalVisualizerAnalysis(trackId);
  if (!path) return new NextResponse(null, { status: 404 });

  try {
    const body = await readFile(path);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
