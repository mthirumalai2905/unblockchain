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
            content: `You are DumpStash AI Social Analyzer. You receive a list of short social-style dumps (like tweets) from multiple users across the entire platform.

STEP 1 - ASSESS: First, decide if you have ENOUGH context to create meaningful groups. Consider:
- Are there enough dumps to find patterns? (you decide the threshold based on topic complexity)
- Are the dumps diverse enough or too similar?
- Do you need more perspectives on certain topics?

If you DON'T have enough context, set "needs_more_context" to true and provide:
- A clear, friendly reason why more context is needed
- Specific guidance on what kind of dumps would help (e.g., "Add more dumps about user pain points" or "Need perspectives from different team members")
- You can still label individual dumps even if you can't group them yet

STEP 2 - LABEL: Assign a DYNAMIC LABEL to each dump. Create specific, contextual labels (e.g., "market-gap", "user-pain-point", "growth-hack", "tech-debt", "feature-request", "competitive-insight", "pricing-strategy", "ux-friction", "onboarding-idea", "monetization", "team-blocker", "pivot-signal").

STEP 3 - GROUP (only if enough context): Group similar dumps together. Each group needs:
- A clear title describing the shared theme
- A short description
- The indices (1-based) of dumps belonging to this group
- A dump can belong to multiple groups
- Create groups only when 2+ dumps share a meaningful connection

Respond via the tool call.`
          },
          {
            role: "user",
            content: `Analyze these ${socialDumps.length} social dumps:\n${dumpsText}`
          }
        ],
        temperature: 0.3,
        tools: [
          {
            type: "function",
            function: {
              name: "classify_social_dumps",
              description: "Classify social dumps with dynamic labels and optionally group them",
              parameters: {
                type: "object",
                properties: {
                  needs_more_context: {
                    type: "boolean",
                    description: "Whether more dumps/context are needed before meaningful grouping can be done"
                  },
                  context_message: {
                    type: "string",
                    description: "Friendly message explaining why more context is needed and what would help. Only set when needs_more_context is true."
                  },
                  context_suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific actionable suggestions for what to dump next. Only set when needs_more_context is true."
                  },
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
                required: ["needs_more_context", "labels", "groups"],
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

    // If AI says needs more context, return early with guidance
    if (result.needs_more_context) {
      return new Response(JSON.stringify({
        success: true,
        needs_more_context: true,
        context_message: result.context_message || "Need more dumps to find meaningful patterns.",
        context_suggestions: result.context_suggestions || [],
        labels_count: result.labels?.length || 0,
        groups_count: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete existing global idea groups created by this user to rebuild
    await supabase.from("idea_groups").delete().eq("user_id", user_id);

    // Create idea groups and add members
    const createdGroups = [];
    if (result.groups?.length > 0) {
      for (const group of result.groups) {
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
          // Link dumps to group
          const groupDumpIndices = group.dump_indices.filter((idx: number) => idx >= 1 && idx <= socialDumps.length);
          const dumpLinks = groupDumpIndices.map((idx: number) => ({
            group_id: newGroup.id,
            dump_id: socialDumps[idx - 1].id,
          }));

          if (dumpLinks.length > 0) {
            await supabase.from("idea_group_dumps").insert(dumpLinks);
          }

          // Collect unique user_ids from the dumps in this group (contributors)
          const contributorIds = new Set<string>();
          contributorIds.add(user_id); // always add the user who triggered processing
          for (const idx of groupDumpIndices) {
            contributorIds.add(socialDumps[idx - 1].user_id);
          }

          // Parse mentions from dump content (e.g., "@luffy", "i want luffy")
          // Look up display_names in profiles to find mentioned users
          const allContent = groupDumpIndices
            .map((idx: number) => socialDumps[idx - 1].content)
            .join(" ")
            .toLowerCase();

          const { data: allProfiles } = await supabase
            .from("profiles")
            .select("user_id, display_name");

          if (allProfiles) {
            for (const profile of allProfiles) {
              if (profile.display_name && allContent.includes(profile.display_name.toLowerCase())) {
                contributorIds.add(profile.user_id);
              }
            }
          }

          // Insert group members
          const memberRows = Array.from(contributorIds).map((uid) => ({
            group_id: newGroup.id,
            user_id: uid,
          }));
          if (memberRows.length > 0) {
            await supabase.from("group_members").insert(memberRows);
          }

          createdGroups.push({ ...newGroup, dump_count: dumpLinks.length, member_count: memberRows.length });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      needs_more_context: false,
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
