import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI key not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message, user_id, session_id } = await req.json();
    if (!message || !user_id) throw new Error("message and user_id required");

    // Get all profiles for member resolution
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_initials");
    const profileList = (allProfiles || []).map((p: any) => `${p.display_name} (${p.avatar_initials})`).join(", ");
    const nameToId = new Map((allProfiles || []).map((p: any) => [(p.display_name || "").toLowerCase(), p.user_id]));

    // Get existing groups for context
    const { data: existingGroups } = await supabase
      .from("idea_groups")
      .select("id, title, description")
      .order("created_at", { ascending: false })
      .limit(20);

    const groupsContext = (existingGroups || []).map((g: any) => `- "${g.title}" (id: ${g.id})`).join("\n");

    const systemPrompt = `You are DumpStash AI 🤖, a helpful assistant for managing idea groups and sub-groups.

Available users: ${profileList}
Existing groups:
${groupsContext || "No groups yet"}

You can perform these actions via tool calls:
1. create_group - Create a new idea group
2. create_sub_group - Create a sub-group within an existing group
3. add_members - Add members to a group or sub-group

When a user asks you to set something up, figure out the right sequence of actions. For example:
- "Create a group called X with members A, B and a sub-group Y" → create_group, then create_sub_group, then add_members
- "Add user X to the gaming group" → find the group, add_members

Always be friendly, concise, and confirm what you did. If you can't find a user or group, say so.
If the user just wants to chat or ask questions, respond normally without tool calls.`;

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
          { role: "user", content: message },
        ],
        temperature: 0.3,
        tools: [
          {
            type: "function",
            function: {
              name: "create_group",
              description: "Create a new idea group",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Group title" },
                  description: { type: "string", description: "Group description" },
                  member_names: { type: "array", items: { type: "string" }, description: "Display names of users to add as members" },
                },
                required: ["title"],
                additionalProperties: false,
              },
            },
          },
          {
            type: "function",
            function: {
              name: "create_sub_group",
              description: "Create a sub-group within an existing group",
              parameters: {
                type: "object",
                properties: {
                  group_title: { type: "string", description: "Title of the parent group (to find it)" },
                  group_id: { type: "string", description: "ID of the parent group if known" },
                  title: { type: "string", description: "Sub-group title" },
                  description: { type: "string", description: "Sub-group description" },
                  member_names: { type: "array", items: { type: "string" }, description: "Display names of users to add" },
                },
                required: ["title"],
                additionalProperties: false,
              },
            },
          },
          {
            type: "function",
            function: {
              name: "add_members",
              description: "Add members to a group or sub-group",
              parameters: {
                type: "object",
                properties: {
                  group_title: { type: "string", description: "Group title to add members to" },
                  sub_group_title: { type: "string", description: "Sub-group title if adding to sub-group" },
                  member_names: { type: "array", items: { type: "string" }, description: "Display names of users to add" },
                },
                required: ["member_names"],
                additionalProperties: false,
              },
            },
          },
        ],
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
    const aiMessage = aiData.choices[0].message;
    const toolCalls = aiMessage.tool_calls || [];

    const actions: string[] = [];
    let createdGroupId: string | null = null;

    for (const toolCall of toolCalls) {
      const args = JSON.parse(toolCall.function.arguments);

      if (toolCall.function.name === "create_group") {
        const { data: newGroup, error } = await supabase
          .from("idea_groups")
          .insert({
            title: args.title,
            description: args.description || null,
            user_id,
            session_id: session_id || null,
          })
          .select()
          .single();

        if (error) {
          actions.push(`❌ Failed to create group "${args.title}": ${error.message}`);
        } else {
          createdGroupId = newGroup.id;
          actions.push(`✅ Created group **"${args.title}"**`);

          // Add members
          const members = args.member_names || [];
          for (const name of members) {
            const memberId = nameToId.get(name.toLowerCase());
            if (memberId) {
              await supabase.from("group_members")
                .upsert({ group_id: newGroup.id, user_id: memberId }, { onConflict: "group_id,user_id" });
              actions.push(`  👤 Added **${name}** to group`);
            } else {
              actions.push(`  ⚠️ User "${name}" not found`);
            }
          }
        }
      }

      if (toolCall.function.name === "create_sub_group") {
        // Find parent group
        let parentGroupId = args.group_id || createdGroupId;
        if (!parentGroupId && args.group_title) {
          const { data: found } = await supabase
            .from("idea_groups")
            .select("id")
            .ilike("title", `%${args.group_title}%`)
            .limit(1)
            .single();
          parentGroupId = found?.id;
        }

        if (!parentGroupId) {
          actions.push(`❌ Could not find parent group for sub-group "${args.title}"`);
          continue;
        }

        const { data: newSg, error } = await supabase
          .from("sub_groups")
          .insert({
            group_id: parentGroupId,
            title: args.title,
            description: args.description || null,
            created_by: user_id,
          })
          .select()
          .single();

        if (error) {
          actions.push(`❌ Failed to create sub-group "${args.title}": ${error.message}`);
        } else {
          actions.push(`✅ Created sub-group **"${args.title}"**`);

          // Add creator as member
          await supabase.from("sub_group_members")
            .upsert({ sub_group_id: newSg.id, user_id }, { onConflict: "sub_group_id,user_id" });

          // Add other members
          const members = args.member_names || [];
          for (const name of members) {
            const memberId = nameToId.get(name.toLowerCase());
            if (memberId) {
              // Also add to parent group
              await supabase.from("group_members")
                .upsert({ group_id: parentGroupId, user_id: memberId }, { onConflict: "group_id,user_id" });
              await supabase.from("sub_group_members")
                .upsert({ sub_group_id: newSg.id, user_id: memberId }, { onConflict: "sub_group_id,user_id" });
              actions.push(`  👤 Added **${name}** to sub-group`);
            } else {
              actions.push(`  ⚠️ User "${name}" not found`);
            }
          }
        }
      }

      if (toolCall.function.name === "add_members") {
        let targetGroupId: string | null = null;
        let targetSubGroupId: string | null = null;

        if (args.sub_group_title) {
          const { data: sg } = await supabase
            .from("sub_groups")
            .select("id, group_id")
            .ilike("title", `%${args.sub_group_title}%`)
            .limit(1)
            .single();
          if (sg) {
            targetSubGroupId = sg.id;
            targetGroupId = sg.group_id;
          }
        } else if (args.group_title) {
          const { data: g } = await supabase
            .from("idea_groups")
            .select("id")
            .ilike("title", `%${args.group_title}%`)
            .limit(1)
            .single();
          if (g) targetGroupId = g.id;
        }

        if (!targetGroupId && !targetSubGroupId) {
          actions.push(`❌ Could not find the group/sub-group to add members to`);
          continue;
        }

        for (const name of args.member_names || []) {
          const memberId = nameToId.get(name.toLowerCase());
          if (!memberId) {
            actions.push(`⚠️ User "${name}" not found`);
            continue;
          }
          if (targetGroupId) {
            await supabase.from("group_members")
              .upsert({ group_id: targetGroupId, user_id: memberId }, { onConflict: "group_id,user_id" });
          }
          if (targetSubGroupId) {
            await supabase.from("sub_group_members")
              .upsert({ sub_group_id: targetSubGroupId, user_id: memberId }, { onConflict: "sub_group_id,user_id" });
          }
          actions.push(`✅ Added **${name}** to ${targetSubGroupId ? "sub-group" : "group"}`);
        }
      }
    }

    // Build response
    let responseText = aiMessage.content || "";
    if (actions.length > 0) {
      responseText = actions.join("\n") + (responseText ? "\n\n" + responseText : "");
    }
    if (!responseText) {
      responseText = "I processed your request but didn't have anything specific to do. Can you be more specific?";
    }

    return new Response(JSON.stringify({
      success: true,
      response: responseText,
      actions_performed: actions.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
