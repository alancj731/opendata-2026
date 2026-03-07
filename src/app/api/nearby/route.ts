import { NextRequest, NextResponse } from "next/server";
import { getNearbyProperties } from "@/lib/winnipeg-api";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");
  const exclude = request.nextUrl.searchParams.get("exclude") || "";

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "lat and lon parameters are required" },
      { status: 400 }
    );
  }

  try {
    const properties = await getNearbyProperties(
      parseFloat(lat),
      parseFloat(lon),
      exclude,
      9
    );
    return NextResponse.json({ data: properties });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch nearby properties";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
