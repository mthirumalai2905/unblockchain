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

    const { group_id, user_id, user_request } = await req.json();

    if (!group_id || !user_id) throw new Error("group_id and user_id are required");

    // Get the parent group and its dumps
    const { data: group } = await supabase
      .from("idea_groups")
      .select("*")
      .eq("id", group_id)
      .single();

    if (!group) throw new Error("Group not found");

    const { data: groupDumpLinks } = await supabase
      .from("idea_group_dumps")
      .select("dump_id")
      .eq("group_id", group_id);

    const dumpIds = (groupDumpLinks || []).map((l: any) => l.dump_id);
    let dumpsText = "";

    if (dumpIds.length > 0) {
      const { data: dumps } = await supabase
        .from("dumps")
        .select("content, user_id")
        .in("id", dumpIds);

      if (dumps) {
        // Get profiles for user context
        const userIds = [...new Set(dumps.map((d: any) => d.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.display_name || "User"]));

        dumpsText = dumps.map((d: any, i: number) =>
          `[${i + 1}] (${profileMap.get(d.user_id) || "User"}) ${d.content}`
        ).join("\n");
      }
    }

    // Get existing sub-groups to avoid duplicates
    const { data: existingSubGroups } = await supabase
      .from("sub_groups")
      .select("title")
      .eq("group_id", group_id);

    const existingTitles = (existingSubGroups || []).map((s: any) => s.title);

    const systemPrompt = user_request
      ? `You are DumpStash AI. A user wants to create a sub-group within the group "${group.title}".
         
User request: "${user_request}"

Based on this request and the group's dumps, create ONE focused sub-group. The sub-group should:
- Have a clear, specific title
- Have a description explaining its purpose
- Suggest which users (by name from the dumps) should be members

Existing sub-groups to avoid duplicating: ${existingTitles.join(", ") || "none"}

Respond via the tool call.`
      : `You are DumpStash AI. Analyze the dumps in the group "${group.title}" and suggest 1-3 meaningful sub-groups based on:
- Common interests between users
- Specific topic clusters within the broader group theme
- Complementary perspectives that would benefit from focused discussion

Existing sub-groups to avoid duplicating: ${existingTitles.join(", ") || "none"}

Only suggest sub-groups where 2+ users share related dumps. Respond via the tool call.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Group: ${group.title}\nDescription: ${group.description || "N/A"}\n\nDumps:\n${dumpsText || "No dumps yet"}` }
        ],
        temperature: 0.3,
        tools: [{
          type: "function",
          function: {
            name: "create_sub_groups",
            description: "Create sub-groups within a parent group",
            parameters: {
              type: "object",
              properties: {
                sub_groups: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      suggested_member_names: {
                        type: "array",
                        items: { type: "string" },
                        description: "Display names of users who should be in this sub-group"
                      }
                    },
                    required: ["title", "description", "suggested_member_names"],
                    additionalProperties: false
                  }
                }
              },
              required: ["sub_groups"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_sub_groups" } }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later." }), {
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
        result = JSON.parse(raw.replace(/^```json?\n?/, "").replace(/\n?```$/, ""));
      }
    } catch {
      console.error("Failed to parse AI response");
      throw new Error("Failed to parse AI response");
    }

    // Resolve user names to IDs for membership
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("user_id, display_name");
    const nameToId = new Map((allProfiles || []).map((p: any) => [(p.display_name || "").toLowerCase(), p.user_id]));

    const created = [];
    for (const sg of result.sub_groups || []) {
      // Skip if title already exists
      if (existingTitles.some((t: string) => t.toLowerCase() === sg.title.toLowerCase())) continue;

      const { data: newSg } = await supabase
        .from("sub_groups")
        .insert({
          group_id,
          title: sg.title,
          description: sg.description,
          created_by: user_id,
        })
        .select()
        .single();

      if (newSg) {
        // Add creator as member
        await supabase.from("sub_group_members").insert({ sub_group_id: newSg.id, user_id });

        // Add suggested members
        for (const name of sg.suggested_member_names || []) {
          const memberId = nameToId.get(name.toLowerCase());
          if (memberId && memberId !== user_id) {
            await supabase.from("sub_group_members")
              .upsert({ sub_group_id: newSg.id, user_id: memberId }, { onConflict: "sub_group_id,user_id" });
          }
        }

        created.push(newSg);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      created_count: created.length,
      sub_groups: created,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-sub-groups error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
