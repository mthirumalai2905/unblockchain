import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI key not configured");

    const { content } = await req.json();
    if (!content || typeof content !== "string") throw new Error("content required");

    const systemPrompt = `You are a text formatter. Take the user's raw, messy text and reformat it for readability using lightweight markdown.

Rules:
- Preserve ALL original meaning, words, and information. Do NOT summarize, shorten, rewrite, translate, or add new content.
- Fix capitalization, punctuation, and obvious typos only when it improves readability.
- Break long run-on text into logical paragraphs (blank line between paragraphs).
- When the text contains a list of items or steps, format them as a markdown bullet list ("- item") or numbered list.
- Use **bold** sparingly for clear emphasis terms that already exist in the text.
- Preserve any URLs, code, image tags like [img:...], and markdown links exactly.
- Do NOT wrap output in code fences. Do NOT add a preamble like "Here is...". Return ONLY the formatted text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content },
        ],
        temperature: 0.2,
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

    const data = await response.json();
    const formatted = (data.choices?.[0]?.message?.content || "").trim();
    if (!formatted) throw new Error("Empty AI response");

    return new Response(JSON.stringify({ success: true, formatted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("format-dump error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
