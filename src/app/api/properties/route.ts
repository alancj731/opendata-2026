import { NextRequest, NextResponse } from "next/server";
import { getRandomProperties } from "@/lib/winnipeg-api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const neighbourhood = searchParams.get("neighbourhood");
  const count = parseInt(searchParams.get("count") || "10", 10);

  if (!neighbourhood) {
    return NextResponse.json(
      { error: "neighbourhood parameter is required" },
      { status: 400 }
    );
  }

  try {
    const properties = await getRandomProperties(neighbourhood, count);
    return NextResponse.json({ data: properties });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch properties";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
