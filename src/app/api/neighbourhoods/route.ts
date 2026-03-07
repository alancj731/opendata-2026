import { NextResponse } from "next/server";
import { getNeighbourhoods } from "@/lib/winnipeg-api";

export async function GET() {
  try {
    const neighbourhoods = await getNeighbourhoods();
    return NextResponse.json({ data: neighbourhoods });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch neighbourhoods";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
