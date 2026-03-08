import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI key not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id } = await req.json();

    // Get ALL social-mode dumps globally (not session-scoped)
    const { data: socialDumps, error: dumpsErr } = await supabase
      .from("dumps")
      .select("*")
      .eq("mode", "social")
      .order("created_at", { ascending: true });

    if (dumpsErr || !socialDumps || socialDumps.length === 0) {
      throw new Error("No social dumps found");
    }

    const dumpsText = socialDumps.map((d: any, i: number) => `[${i + 1}] ${d.content}`).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are DumpStash AI Social Analyzer. You receive a list of short social-style dumps (like tweets) from multiple users across the entire platform. Your job:

1. Assign a DYNAMIC LABEL to each dump. Do NOT use predefined categories. Create specific, contextual labels that describe what the dump is about (e.g., "market-gap", "user-pain-point", "growth-hack", "tech-debt", "feature-request", "competitive-insight", "pricing-strategy", "ux-friction", "onboarding-idea", "monetization", "team-blocker", "pivot-signal").

2. Group similar dumps together into idea groups. Each group should have:
   - A clear title describing the shared theme
   - A short description of what the group represents
   - The indices (1-based) of dumps that belong to this group

A dump can belong to multiple groups. Create groups only when 2+ dumps share a meaningful connection.

Respond with JSON (no markdown):
{
  "labels": [
    { "index": 1, "label": "market-gap" },
    { "index": 2, "label": "ux-friction" }
  ],
  "groups": [
    {
      "title": "User Onboarding Issues",
      "description": "Multiple dumps highlighting friction in the onboarding flow",
      "dump_indices": [1, 3, 5]
    }
  ]
}`
          },
          {
            role: "user",
            content: `Analyze these social dumps:\n${dumpsText}`
          }
        ],
        temperature: 0.3,
        tools: [
          {
            type: "function",
            function: {
              name: "classify_social_dumps",
              description: "Classify social dumps with dynamic labels and group similar ones",
              parameters: {
                type: "object",
                properties: {
                  labels: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number" },
                        label: { type: "string" }
                      },
                      required: ["index", "label"],
                      additionalProperties: false
                    }
                  },
                  groups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        dump_indices: { type: "array", items: { type: "number" } }
                      },
                      required: ["title", "description", "dump_indices"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["labels", "groups"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "classify_social_dumps" } }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    let result;
    try {
      const toolCall = aiData.choices[0].message.tool_calls?.[0];
      if (toolCall) {
        result = JSON.parse(toolCall.function.arguments);
      } else {
        const raw = aiData.choices[0].message.content.trim();
        const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
        result = JSON.parse(cleaned);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", aiData.choices?.[0]?.message);
      throw new Error("Failed to parse AI response");
    }

    // Apply dynamic labels to dumps
    if (result.labels?.length > 0) {
      for (const label of result.labels) {
        const dumpIndex = label.index - 1;
        if (dumpIndex >= 0 && dumpIndex < socialDumps.length) {
          await supabase
            .from("dumps")
            .update({ ai_label: label.label })
            .eq("id", socialDumps[dumpIndex].id);
        }
      }
    }

    // Delete existing global idea groups created by this user to rebuild
    await supabase.from("idea_groups").delete().eq("user_id", user_id);

    // Create idea groups (global, not session-scoped)
    const createdGroups = [];
    if (result.groups?.length > 0) {
      for (const group of result.groups) {
        // Use the first dump's session_id as a reference (required by schema)
        const firstDumpIdx = group.dump_indices?.[0];
        const refSessionId = firstDumpIdx && firstDumpIdx >= 1 && firstDumpIdx <= socialDumps.length
          ? socialDumps[firstDumpIdx - 1].session_id
          : socialDumps[0].session_id;

        const { data: newGroup } = await supabase
          .from("idea_groups")
          .insert({
            session_id: refSessionId,
            user_id,
            title: group.title,
            description: group.description,
          })
          .select()
          .single();

        if (newGroup) {
          const dumpLinks = group.dump_indices
            .filter((idx: number) => idx >= 1 && idx <= socialDumps.length)
            .map((idx: number) => ({
              group_id: newGroup.id,
              dump_id: socialDumps[idx - 1].id,
            }));

          if (dumpLinks.length > 0) {
            await supabase.from("idea_group_dumps").insert(dumpLinks);
          }
          createdGroups.push({ ...newGroup, dump_count: dumpLinks.length });
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      labels_count: result.labels?.length || 0,
      groups_count: createdGroups.length,
      result 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-social-dump error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
