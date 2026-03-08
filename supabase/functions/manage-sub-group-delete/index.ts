import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DUMPSTASH_AI_ID = "00000000-0000-0000-0000-000000000001";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { action, sub_group_id, user_id } = await req.json();

    if (action === "vote_delete") {
      // Cast vote
      const { error: voteErr } = await supabaseAdmin
        .from("sub_group_delete_votes")
        .upsert({ sub_group_id, user_id, vote: true }, { onConflict: "sub_group_id,user_id" });

      if (voteErr) throw new Error(voteErr.message);

      // Get member count and vote count
      const { count: memberCount } = await supabaseAdmin
        .from("sub_group_members")
        .select("*", { count: "exact", head: true })
        .eq("sub_group_id", sub_group_id);

      const { count: voteCount } = await supabaseAdmin
        .from("sub_group_delete_votes")
        .select("*", { count: "exact", head: true })
        .eq("sub_group_id", sub_group_id)
        .eq("vote", true);

      const total = memberCount || 1;
      const votes = voteCount || 0;
      const percentage = Math.round((votes / total) * 100);

      // AI bot sends status message
      const statusMsg = percentage >= 50
        ? `🗳️ Delete vote reached ${percentage}% consensus (${votes}/${total}). Proceeding with deletion...`
        : `🗳️ Delete vote: ${votes}/${total} members voted (${percentage}%). Need 50%+ to delete.`;

      await supabaseAdmin.from("sub_group_messages").insert({
        sub_group_id,
        user_id: DUMPSTASH_AI_ID,
        content: statusMsg,
      });

      // If consensus reached, delete
      if (percentage >= 50) {
        // Send final message
        await supabaseAdmin.from("sub_group_messages").insert({
          sub_group_id,
          user_id: DUMPSTASH_AI_ID,
          content: "⚠️ Consensus reached. This sub-group will now be deleted. Goodbye! 👋",
        });

        // Small delay then delete
        await new Promise((r) => setTimeout(r, 1000));
        await supabaseAdmin.from("sub_groups").delete().eq("id", sub_group_id);

        return new Response(JSON.stringify({ deleted: true, percentage }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ deleted: false, percentage, votes, total }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cancel_vote") {
      await supabaseAdmin
        .from("sub_group_delete_votes")
        .delete()
        .eq("sub_group_id", sub_group_id)
        .eq("user_id", user_id);

      return new Response(JSON.stringify({ cancelled: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cleanup_inactive") {
      // Auto-delete sub-groups with no activity for 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: inactive } = await supabaseAdmin
        .from("sub_groups")
        .select("id, title")
        .lt("last_activity_at", thirtyDaysAgo);

      if (inactive && inactive.length > 0) {
        for (const sg of inactive) {
          await supabaseAdmin.from("sub_group_messages").insert({
            sub_group_id: sg.id,
            user_id: DUMPSTASH_AI_ID,
            content: `🕐 This sub-group "${sg.title}" has been inactive for 30+ days and will be automatically deleted.`,
          });
        }

        const ids = inactive.map((sg) => sg.id);
        await supabaseAdmin.from("sub_groups").delete().in("id", ids);

        return new Response(JSON.stringify({ cleaned: ids.length }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ cleaned: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
