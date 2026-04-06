import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AI_REPORT_SYSTEM_PROMPT } from "@/lib/ai/whi-philosophy";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "personal";
  const language = searchParams.get("language") || "ja";

  const supabase = await createSupabaseServer();

  // Get active prompt
  const { data: active } = await supabase
    .from("ai_prompts")
    .select("*")
    .eq("type", type)
    .eq("language", language)
    .eq("is_active", true)
    .single();

  // If no active prompt, return default
  if (!active) {
    return NextResponse.json({
      active: { content: AI_REPORT_SYSTEM_PROMPT, version: 0 },
      history: [],
    });
  }

  // Get history (last 5)
  const { data: history } = await supabase
    .from("ai_prompts")
    .select("*")
    .eq("type", type)
    .eq("language", language)
    .order("version", { ascending: false })
    .limit(5);

  return NextResponse.json({ active, history: history || [] });
}

export async function POST(request: NextRequest) {
  const { type, language, content } = await request.json();

  if (!type || !language || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  // Deactivate current active
  await supabase
    .from("ai_prompts")
    .update({ is_active: false })
    .eq("type", type)
    .eq("language", language)
    .eq("is_active", true);

  // Get max version
  const { data: maxRow } = await supabase
    .from("ai_prompts")
    .select("version")
    .eq("type", type)
    .eq("language", language)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const newVersion = (maxRow?.version ?? 0) + 1;

  // Insert new version
  const { error } = await supabase.from("ai_prompts").insert({
    type,
    language,
    content,
    version: newVersion,
    is_active: true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, version: newVersion });
}
