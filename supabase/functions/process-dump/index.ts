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

    const authHeader = req.headers.get("Authorization")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { dump_id, session_id, user_id } = await req.json();

    // Get the dump content
    const { data: dump, error: dumpErr } = await supabase
      .from("dumps")
      .select("*")
      .eq("id", dump_id)
      .single();

    if (dumpErr || !dump) throw new Error("Dump not found");

    // Get existing dumps for context
    const { data: existingDumps } = await supabase
      .from("dumps")
      .select("content, type")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true })
      .limit(20);

    const context = (existingDumps || []).map((d: any) => `[${d.type}] ${d.content}`).join("\n");

    // Call Grok API to classify and extract
    const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini-fast",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that analyzes brain dumps. Given a new dump and session context, you must:
1. Classify the dump type as one of: idea, decision, question, blocker, action, note
2. Extract any action items (tasks to do)
3. Extract any questions raised
4. Identify themes/topics

Respond with a JSON object (no markdown):
{
  "type": "idea|decision|question|blocker|action|note",
  "actions": [{"text": "...", "priority": "high|medium|low"}],
  "questions": [{"text": "..."}],
  "themes": [{"title": "...", "tags": ["tag1"], "confidence": 80}]
}`
          },
          {
            role: "user",
            content: `Session context:\n${context}\n\nNew dump to analyze:\n${dump.content}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!grokResponse.ok) {
      const errText = await grokResponse.text();
      console.error("Grok API error:", grokResponse.status, errText);
      throw new Error(`Grok API error: ${grokResponse.status}`);
    }

    const grokData = await grokResponse.json();
    let result;
    try {
      const raw = grokData.choices[0].message.content.trim();
      // Strip potential markdown code fences
      const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      result = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Grok response:", grokData.choices?.[0]?.message?.content);
      throw new Error("Failed to parse AI response");
    }

    // Update dump type
    if (result.type && ["idea", "decision", "question", "blocker", "action", "note"].includes(result.type)) {
      await supabase.from("dumps").update({ type: result.type }).eq("id", dump_id);
    }

    // Insert action items
    if (result.actions?.length > 0) {
      const actionsToInsert = result.actions.map((a: any) => ({
        session_id,
        user_id,
        text: a.text,
        priority: a.priority || "medium",
        source_dump_ids: [dump_id],
      }));
      await supabase.from("actions").insert(actionsToInsert);
    }

    // Insert questions
    if (result.questions?.length > 0) {
      const questionsToInsert = result.questions.map((q: any) => ({
        session_id,
        user_id,
        text: q.text,
        source_dump_ids: [dump_id],
      }));
      await supabase.from("questions").insert(questionsToInsert);
    }

    // Insert themes (merge with existing)
    if (result.themes?.length > 0) {
      const { data: existingThemes } = await supabase
        .from("themes")
        .select("*")
        .eq("session_id", session_id);

      for (const theme of result.themes) {
        const existing = (existingThemes || []).find(
          (t: any) => t.title.toLowerCase() === theme.title.toLowerCase()
        );

        if (existing) {
          // Link dump to existing theme
          await supabase.from("dump_themes").insert({ dump_id, theme_id: existing.id });
          // Update confidence
          if (theme.confidence > (existing.confidence || 0)) {
            await supabase.from("themes").update({ confidence: theme.confidence }).eq("id", existing.id);
          }
        } else {
          // Create new theme
          const { data: newTheme } = await supabase
            .from("themes")
            .insert({
              session_id,
              user_id,
              title: theme.title,
              tags: theme.tags || [],
              confidence: theme.confidence || 50,
            })
            .select()
            .single();
          if (newTheme) {
            await supabase.from("dump_themes").insert({ dump_id, theme_id: newTheme.id });
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-dump error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
