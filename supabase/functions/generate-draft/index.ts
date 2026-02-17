import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GROK_API_KEY = Deno.env.get("DUMPIFY_AI");
    if (!GROK_API_KEY) throw new Error("DUMPIFY_AI key not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { session_id } = await req.json();

    // Fetch all session data
    const [dumpsRes, themesRes, actionsRes, questionsRes, sessionRes] = await Promise.all([
      supabase.from("dumps").select("*").eq("session_id", session_id).order("created_at", { ascending: true }),
      supabase.from("themes").select("*").eq("session_id", session_id),
      supabase.from("actions").select("*").eq("session_id", session_id),
      supabase.from("questions").select("*").eq("session_id", session_id),
      supabase.from("sessions").select("name").eq("id", session_id).single(),
    ]);

    const sessionName = sessionRes.data?.name || "Untitled";
    const dumps = dumpsRes.data || [];
    const themes = themesRes.data || [];
    const actions = actionsRes.data || [];
    const questions = questionsRes.data || [];

    const sessionSummary = `
Session: "${sessionName}"
${dumps.length} dumps, ${themes.length} themes, ${actions.length} actions, ${questions.length} questions

DUMPS:
${dumps.map((d: any) => `- [${d.type}] ${d.content}`).join("\n")}

THEMES:
${themes.map((t: any) => `- ${t.title} (confidence: ${t.confidence}%, tags: ${(t.tags || []).join(", ")})`).join("\n")}

ACTIONS:
${actions.map((a: any) => `- [${a.priority}${a.done ? ", DONE" : ""}] ${a.text}`).join("\n")}

QUESTIONS:
${questions.map((q: any) => `- ${q.text} (${q.answered ? "answered" : "open"}, ${q.votes} votes)`).join("\n")}
`;

    // Stream from Groq
    const grokResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a senior product manager AI. Given a brainstorming session's data, generate a comprehensive Product Requirements Document (PRD) in Markdown format.

Structure it as:
# [Project Name] - Product Requirements Document

## Executive Summary
Brief overview of what emerged from the brainstorming session.

## Problem Statement
What problems or opportunities were identified.

## Goals & Objectives
Key goals extracted from the ideas and decisions.

## Key Themes
Summarize the main themes with supporting evidence from dumps.

## Functional Requirements
### Must Have (P0)
### Should Have (P1)
### Nice to Have (P2)

## Open Questions & Risks
List unresolved questions and potential blockers.

## Action Items & Next Steps
Organized list of tasks with owners and priorities.

## Success Metrics
Suggested KPIs based on the session content.

## Timeline Estimate
Rough phases based on the scope.

Make it professional, actionable, and well-structured. Use the actual content from the session.`
          },
          {
            role: "user",
            content: `Generate a PRD from this brainstorming session:\n\n${sessionSummary}`
          }
        ],
        stream: true,
        temperature: 0.5,
      }),
    });

    if (!grokResponse.ok) {
      const errText = await grokResponse.text();
      console.error("Grok API error:", grokResponse.status, errText);
      throw new Error(`Grok API error: ${grokResponse.status}`);
    }

    // Pass through the stream
    return new Response(grokResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-draft error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
