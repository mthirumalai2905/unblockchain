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

    const { sub_group_id, user_id, type } = await req.json();

    if (!sub_group_id || !user_id || !type) throw new Error("sub_group_id, user_id, and type (draft|roadmap) are required");

    // Get sub-group info
    const { data: subGroup } = await supabase
      .from("sub_groups")
      .select("*, idea_groups:group_id(*)")
      .eq("id", sub_group_id)
      .single();

    if (!subGroup) throw new Error("Sub-group not found");

    // Get group dumps
    const { data: groupDumpLinks } = await supabase
      .from("idea_group_dumps")
      .select("dump_id")
      .eq("group_id", (subGroup as any).group_id);

    const dumpIds = (groupDumpLinks || []).map((l: any) => l.dump_id);
    let dumpsText = "";
    if (dumpIds.length > 0) {
      const { data: dumps } = await supabase.from("dumps").select("content").in("id", dumpIds);
      dumpsText = (dumps || []).map((d: any, i: number) => `${i + 1}. ${d.content}`).join("\n");
    }

    // Get chat messages for context
    const { data: messages } = await supabase
      .from("sub_group_messages")
      .select("content")
      .eq("sub_group_id", sub_group_id)
      .order("created_at", { ascending: true })
      .limit(50);

    const chatContext = (messages || []).map((m: any) => m.content).join("\n");
    const parentGroup = (subGroup as any).idea_groups;

    let systemPrompt: string;
    let toolDef: any;

    if (type === "draft") {
      systemPrompt = `You are DumpStash AI PRD Generator. Create a comprehensive Product Requirements Document for the sub-group "${subGroup.title}" within the parent group "${parentGroup?.title || 'Unknown'}".

Sub-group description: ${subGroup.description || "N/A"}

Use the dumps and chat messages as context to create a structured PRD with:
- Title, Overview, Problem Statement
- Goals & Success Metrics
- User Stories
- Requirements (must-have, nice-to-have)
- Technical Considerations
- Timeline Estimate

Format in clean markdown.`;

      toolDef = {
        type: "function",
        function: {
          name: "generate_prd",
          description: "Generate a PRD document",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              content: { type: "string", description: "Full PRD in markdown format" }
            },
            required: ["title", "content"],
            additionalProperties: false
          }
        }
      };
    } else {
      systemPrompt = `You are DumpStash AI Roadmap Generator. Create a project roadmap for the sub-group "${subGroup.title}" within "${parentGroup?.title || 'Unknown'}".

Sub-group description: ${subGroup.description || "N/A"}

Create 3-5 phases with clear milestones. Each phase should have:
- A title and description
- Key deliverables
- Estimated duration
- Dependencies on other phases`;

      toolDef = {
        type: "function",
        function: {
          name: "generate_roadmap",
          description: "Generate a project roadmap",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              phases: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    deliverables: { type: "array", items: { type: "string" } },
                    duration: { type: "string" },
                    dependencies: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "description", "deliverables", "duration"],
                  additionalProperties: false
                }
              }
            },
            required: ["title", "phases"],
            additionalProperties: false
          }
        }
      };
    }

    const toolName = type === "draft" ? "generate_prd" : "generate_roadmap";

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
          { role: "user", content: `Dumps:\n${dumpsText || "No dumps"}\n\nChat messages:\n${chatContext || "No chat yet"}` }
        ],
        temperature: 0.4,
        tools: [toolDef],
        tool_choice: { type: "function", function: { name: toolName } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const aiData = await response.json();
    let result;
    try {
      const toolCall = aiData.choices[0].message.tool_calls?.[0];
      result = toolCall ? JSON.parse(toolCall.function.arguments) : JSON.parse(aiData.choices[0].message.content.trim());
    } catch {
      throw new Error("Failed to parse AI response");
    }

    if (type === "draft") {
      const { data: draft } = await supabase
        .from("sub_group_drafts")
        .insert({
          sub_group_id,
          user_id,
          title: result.title || "Draft PRD",
          content: result.content || "",
        })
        .select()
        .single();

      return new Response(JSON.stringify({ success: true, draft }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      const { data: roadmap } = await supabase
        .from("sub_group_roadmaps")
        .insert({
          sub_group_id,
          user_id,
          title: result.title || "Roadmap",
          phases_json: result.phases || [],
        })
        .select()
        .single();

      return new Response(JSON.stringify({ success: true, roadmap }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("generate-sub-group-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
