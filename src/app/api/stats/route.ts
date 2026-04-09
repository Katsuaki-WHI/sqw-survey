import { NextResponse } from "next/server";
import { getSurveyStats } from "@/lib/actions/stats";

export async function GET() {
  const stats = await getSurveyStats();
  return NextResponse.json(stats);
}
