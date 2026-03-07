import { corsHeaders } from "../_shared/cors.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dump_content, existing_threads } = await req.json();

    const prompt = `You are DumpStash AI. A user dumped this thought:
"${dump_content}"

${existing_threads ? `Existing thread replies:\n${existing_threads}\n` : ""}

Generate a single helpful, concise follow-up reply that expands on the original thought. 
Be insightful, ask a clarifying question, suggest an action, or provide a different perspective.
Keep it under 3 sentences. Be conversational and useful.
Reply with ONLY the text content, no quotes or prefixes.`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
