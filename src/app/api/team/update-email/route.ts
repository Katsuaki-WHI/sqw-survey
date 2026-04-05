import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { memberToken, email } = await request.json();

  if (!memberToken || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  // Find the member's session
  const { data: member } = await supabase
    .from("team_members")
    .select("session_id")
    .eq("member_token", memberToken)
    .single();

  if (!member?.session_id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Update survey_sessions.member_email
  const { error } = await supabase
    .from("survey_sessions")
    .update({ member_email: email.trim() })
    .eq("id", member.session_id);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
