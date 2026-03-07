import { NextRequest, NextResponse } from "next/server";
import { saveEvaluation, getEvaluationStats } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { roll_number, rating, comment } = await request.json();

    if (!roll_number || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "roll_number and rating (1-5) are required" },
        { status: 400 }
      );
    }

    await saveEvaluation(roll_number, rating, comment || "");
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save evaluation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const rollNumbers = request.nextUrl.searchParams.get("rolls");

    if (!rollNumbers) {
      return NextResponse.json(
        { error: "rolls parameter is required (comma-separated)" },
        { status: 400 }
      );
    }

    const rolls = rollNumbers.split(",").filter(Boolean);
    const stats = await getEvaluationStats(rolls);
    const data = Object.fromEntries(stats);

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch evaluations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
