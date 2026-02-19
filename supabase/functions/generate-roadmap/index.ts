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
${themes.map((t: any) => `- ${t.title} (tags: ${(t.tags || []).join(", ")})`).join("\n")}

ACTIONS:
${actions.map((a: any) => `- [${a.priority}] ${a.text}`).join("\n")}

QUESTIONS:
${questions.map((q: any) => `- ${q.text}`).join("\n")}
`;

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
            content: `You are a product roadmap generator. Given brainstorming session data, create a comprehensive interactive roadmap as a JSON object.

Each phase has steps, and each step can have substeps. This creates a tree-like roadmap similar to roadmap.sh.

IMPORTANT: Generate AS MANY phases as needed to fully cover the project scope. Do NOT limit to 3-5 phases. A complex project might need 6-12+ phases. Be thorough and comprehensive. Each phase should have 3-8 steps as appropriate.

Return ONLY valid JSON (no markdown):
{
  "title": "Product Roadmap",
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase 1: Foundation",
      "description": "Set up core infrastructure",
      "status": "current",
      "steps": [
        {
          "id": "step-1-1",
          "title": "Step title",
          "description": "Brief description",
          "type": "task",
          "status": "done|current|upcoming",
          "substeps": [
            {
              "id": "sub-1-1-1",
              "title": "Substep title",
              "status": "done|current|upcoming"
            }
          ]
        }
      ]
    }
  ]
}

Types: "task", "milestone", "decision", "research"
Create as many phases as the project naturally requires. Make it practical and actionable based on the actual session content. Cover everything from inception to launch and post-launch.`
          },
          {
            role: "user",
            content: `Generate a product roadmap from this session:\n\n${sessionSummary}`
          }
        ],
        temperature: 0.4,
      }),
    });

    if (!grokResponse.ok) {
      const errText = await grokResponse.text();
      throw new Error(`Groq API error: ${grokResponse.status} - ${errText}`);
    }

    const grokData = await grokResponse.json();
    const raw = grokData.choices[0].message.content.trim();
    const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    const roadmap = JSON.parse(cleaned);

    return new Response(JSON.stringify(roadmap), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
