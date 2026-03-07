import { NextResponse } from "next/server";
import { getMarketRegions } from "@/lib/winnipeg-api";

export async function GET() {
  try {
    const regions = await getMarketRegions();
    return NextResponse.json({ data: regions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch market regions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
