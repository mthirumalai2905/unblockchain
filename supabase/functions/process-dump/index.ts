import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const AI_KEY = Deno.env.get("DUMPIFY_AI_v1") || Deno.env.get("DUMPIFY_AI");
    if (!AI_KEY) throw new Error("AI key not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { dump_id, session_id, user_id } = await req.json();

    const { data: dump, error: dumpErr } = await supabase
      .from("dumps")
      .select("*")
      .eq("id", dump_id)
      .single();

    if (dumpErr || !dump) throw new Error("Dump not found");

    const { data: existingDumps } = await supabase
      .from("dumps")
      .select("content, type")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true })
      .limit(20);

    const context = (existingDumps || []).map((d: any) => `[${d.type}] ${d.content}`).join("\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are DumpStash AI, an assistant that analyzes brain dumps. Given a new dump and session context, you must:
1. Classify the dump type as one of: idea, decision, question, blocker, action, note, todo, insight, feedback, reference, rant, goal
2. Extract any action items (tasks to do)
3. Extract any questions raised
4. Identify themes/topics

CLASSIFICATION GUIDE - pick the MOST specific type:
- "todo": Explicit tasks, to-do items, things the user needs to do. Contains phrases like "need to", "have to", "should do", "must", "remember to", "don't forget"
- "idea": Creative suggestions, new concepts, brainstorming, possibilities. Contains "what if", "we could", "imagine", "concept"
- "decision": Choices made, conclusions reached. Contains "decided", "going with", "we'll use", "final answer"
- "question": Direct questions or uncertainties. Contains "?", "wondering", "not sure", "how do we"
- "blocker": Problems stopping progress, dependencies, obstacles. Contains "stuck", "can't", "blocked by", "waiting on", "preventing"
- "action": Specific actionable steps with clear next moves. Contains "let's", "will do", "next step", "action item"
- "insight": Realizations, aha moments, learnings. Contains "realized", "learned", "turns out", "interesting that"
- "feedback": Opinions on existing work, reviews, critiques. Contains "I think the X is", "feels like", "the problem with", "love/hate"
- "reference": Links, resources, citations, external references. Contains URLs, "check out", "see also", "reference", "source"
- "rant": Frustrations, venting, emotional expressions. Contains strong emotional language, complaints, "so annoying", "frustrated"
- "goal": Objectives, milestones, targets. Contains "goal is", "aim to", "target", "by end of", "milestone"
- "note": General notes that don't fit other categories (use as last resort)

IMPORTANT: Include a "reasoning" field that shows your step-by-step thinking process.

Respond with a JSON object (no markdown):
{
  "reasoning": [
    "Step 1: Reading the dump content...",
    "Step 2: This appears to be about X because...",
    "Step 3: Classifying as 'todo' because it contains explicit task language...",
    "Step 4: Found actionable items: ...",
    "Step 5: Identified themes related to..."
  ],
  "type": "idea|decision|question|blocker|action|note|todo|insight|feedback|reference|rant|goal",
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

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    let result;
    try {
      const raw = aiData.choices[0].message.content.trim();
      const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      result = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", aiData.choices?.[0]?.message?.content);
      throw new Error("Failed to parse AI response");
    }

    const validTypes = ["idea", "decision", "question", "blocker", "action", "note", "todo", "insight", "feedback", "reference", "rant", "goal"];
    if (result.type && validTypes.includes(result.type)) {
      await supabase.from("dumps").update({ type: result.type }).eq("id", dump_id);
    }

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

    if (result.questions?.length > 0) {
      const questionsToInsert = result.questions.map((q: any) => ({
        session_id,
        user_id,
        text: q.text,
        source_dump_ids: [dump_id],
      }));
      await supabase.from("questions").insert(questionsToInsert);
    }

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
          await supabase.from("dump_themes").insert({ dump_id, theme_id: existing.id });
          if (theme.confidence > (existing.confidence || 0)) {
            await supabase.from("themes").update({ confidence: theme.confidence }).eq("id", existing.id);
          }
        } else {
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
