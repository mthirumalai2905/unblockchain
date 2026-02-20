import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN");
    const GROQ_API_KEY = Deno.env.get("DUMPIFY_AI");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!BEARER_TOKEN) throw new Error("TWITTER_BEARER_TOKEN not configured");
    if (!GROQ_API_KEY) throw new Error("DUMPIFY_AI not configured");

    // Validate Supabase auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const {
      usernames = [],
      hashtags = [],
      timelineRange = "2months",
      tweetLimit = 20,
      sessionId,
    } = body;

    // Build date filter
    const now = new Date();
    let startDate: Date;
    if (timelineRange === "2months") {
      startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    } else if (timelineRange === "2years") {
      startDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
    } else {
      // 20 years — use max allowed by Twitter API (7 days for free tier, but we'll try)
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    const startTime = startDate.toISOString().replace(/\.\d{3}Z$/, "Z");

    // Build search query
    const parts: string[] = [];
    if (usernames.length > 0) {
      const fromParts = usernames.map((u: string) => `from:${u.replace("@", "")}`).join(" OR ");
      parts.push(usernames.length > 1 ? `(${fromParts})` : fromParts);
    }
    if (hashtags.length > 0) {
      const tagParts = hashtags.map((h: string) => `#${h.replace("#", "")}`).join(" OR ");
      parts.push(hashtags.length > 1 ? `(${tagParts})` : tagParts);
    }
    parts.push("-is:retweet lang:en");
    const query = parts.join(" ");

    // Fetch tweets from Twitter API v2
    const maxResults = Math.min(Math.max(tweetLimit, 10), 100);
    const twitterUrl = new URL("https://api.x.com/2/tweets/search/recent");
    twitterUrl.searchParams.set("query", query);
    twitterUrl.searchParams.set("max_results", String(maxResults));
    twitterUrl.searchParams.set("tweet.fields", "created_at,author_id,public_metrics,text");
    twitterUrl.searchParams.set("expansions", "author_id");
    twitterUrl.searchParams.set("user.fields", "name,username,profile_image_url");

    console.log("Fetching tweets with query:", query);

    const twitterResp = await fetch(twitterUrl.toString(), {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
    });

    if (!twitterResp.ok) {
      const errText = await twitterResp.text();
      console.error("Twitter API error:", twitterResp.status, errText);
      throw new Error(`Twitter API error ${twitterResp.status}: ${errText}`);
    }

    const twitterData = await twitterResp.json();
    const tweets = twitterData.data || [];
    const users = twitterData.includes?.users || [];
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const enrichedTweets = tweets.map((t: any) => ({
      id: t.id,
      text: t.text,
      created_at: t.created_at,
      author: userMap.get(t.author_id) || { username: "unknown", name: "Unknown" },
      metrics: t.public_metrics || {},
    }));

    if (enrichedTweets.length === 0) {
      return new Response(
        JSON.stringify({ success: true, tweets: [], aiOutput: null, message: "No tweets found for given criteria" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // AI analysis via Groq
    const tweetText = enrichedTweets
      .map((t: any, i: number) => `[${i + 1}] @${t.author.username}: ${t.text} (likes:${t.metrics.like_count || 0}, retweets:${t.metrics.retweet_count || 0})`)
      .join("\n\n");

    const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an elite product intelligence analyst. Analyze tweets and extract deep structured insights for product/startup strategy.

You MUST respond with a single valid JSON object (no markdown, no code blocks):
{
  "summary": "2-3 sentence executive summary of the tweet landscape",
  "themes": [{"title": "...", "description": "...", "tags": ["tag1","tag2"], "confidence": 85, "tweetCount": 3}],
  "actions": [{"text": "...", "priority": "high|medium|low", "rationale": "..."}],
  "questions": [{"text": "...", "importance": "Why this matters..."}],
  "opportunities": [{"title": "...", "description": "...", "potential": "high|medium|low"}],
  "sentimentBreakdown": {"positive": 40, "neutral": 35, "negative": 25},
  "topInsights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
  "roadmapSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`,
          },
          {
            role: "user",
            content: `Analyze these ${enrichedTweets.length} tweets:\n\n${tweetText}\n\nExtract product intelligence, market signals, user behavior patterns, and strategic opportunities.`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!groqResp.ok) {
      const errText = await groqResp.text();
      throw new Error(`Groq API error ${groqResp.status}: ${errText}`);
    }

    const groqData = await groqResp.json();
    let aiOutput: any = null;
    try {
      const raw = groqData.choices[0].message.content.trim();
      const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      aiOutput = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      aiOutput = { summary: "AI analysis complete", themes: [], actions: [], questions: [], opportunities: [], topInsights: [] };
    }

    // Store analysis in DB
    const { data: analysisRecord } = await supabase
      .from("twitter_analyses")
      .insert({
        user_id: user.id,
        session_id: sessionId || null,
        config_json: { usernames, hashtags, timelineRange, tweetLimit },
        tweets_json: enrichedTweets,
        ai_output_json: aiOutput,
      })
      .select()
      .single();

    // If sessionId provided, also insert themes/actions/questions into main tables
    if (sessionId && aiOutput) {
      if (aiOutput.actions?.length > 0) {
        await supabase.from("actions").insert(
          aiOutput.actions.map((a: any) => ({
            session_id: sessionId,
            user_id: user.id,
            text: `[Twitter Intelligence] ${a.text}`,
            priority: a.priority || "medium",
            source_dump_ids: [],
          }))
        );
      }

      if (aiOutput.questions?.length > 0) {
        await supabase.from("questions").insert(
          aiOutput.questions.map((q: any) => ({
            session_id: sessionId,
            user_id: user.id,
            text: `[Twitter] ${q.text}`,
            source_dump_ids: [],
          }))
        );
      }

      if (aiOutput.themes?.length > 0) {
        for (const theme of aiOutput.themes) {
          await supabase.from("themes").insert({
            session_id: sessionId,
            user_id: user.id,
            title: `[Twitter] ${theme.title}`,
            tags: theme.tags || [],
            confidence: theme.confidence || 50,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, tweets: enrichedTweets, aiOutput, analysisId: analysisRecord?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("twitter-analyze error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
