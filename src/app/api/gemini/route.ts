import { NextRequest, NextResponse } from "next/server";
import { analyzeProperties } from "@/lib/gemini";
import { Property } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { properties }: { properties: Property[] } = await request.json();

    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return NextResponse.json(
        { error: "properties array is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeProperties(properties);
    return NextResponse.json({ data: analysis });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze properties";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
