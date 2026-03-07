import { NextRequest, NextResponse } from "next/server";
import { searchByAddress } from "@/lib/winnipeg-api";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "query must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    const properties = await searchByAddress(query, 20);
    return NextResponse.json({ data: properties });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
