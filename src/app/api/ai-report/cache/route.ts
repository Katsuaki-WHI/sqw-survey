import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// GET: Check for cached report
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");
  const memberToken = searchParams.get("memberToken");
  const reportType = searchParams.get("reportType") || "team";
  const language = searchParams.get("language") || "ja";

  const supabase = await createSupabaseServer();

  if (reportType === "team" && teamId) {
    const { data } = await supabase
      .from("ai_report_cache")
      .select("content, created_at")
      .eq("team_id", teamId)
      .eq("report_type", "team")
      .eq("language", language)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) return NextResponse.json({ cached: true, content: data.content, createdAt: data.created_at });
  }

  if (reportType === "personal" && memberToken) {
    const { data } = await supabase
      .from("ai_report_cache")
      .select("content, created_at")
      .eq("member_token", memberToken)
      .eq("report_type", "personal")
      .eq("language", language)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) return NextResponse.json({ cached: true, content: data.content, createdAt: data.created_at });
  }

  return NextResponse.json({ cached: false });
}

// POST: Save report to cache
export async function POST(request: NextRequest) {
  const { teamId, memberToken, reportType, language, content } = await request.json();

  const supabase = await createSupabaseServer();

  const { error } = await supabase.from("ai_report_cache").insert({
    team_id: teamId || null,
    member_token: memberToken || null,
    report_type: reportType,
    language,
    content,
  });

  if (error) {
    console.error("[ai-report-cache] Save error:", error.message);
    return NextResponse.json({ error: "Failed to cache" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
