import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const brandStyles = {
  bg: "#ffffff",
  card: "#fafafa",
  text: "#141414",
  muted: "#737373",
  accent: "#141414",
  accentFg: "#fafafa",
  border: "#e5e5e5",
  radius: "8px",
};

function buildEmail(type: string, data: Record<string, string>) {
  const { confirmationUrl, email } = data;

  const wrapper = (title: string, body: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${brandStyles.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${brandStyles.bg};padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:${brandStyles.card};border:1px solid ${brandStyles.border};border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="padding:32px 32px 24px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:8px;">
            <div style="width:32px;height:32px;background:${brandStyles.accent};border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
              <span style="color:${brandStyles.accentFg};font-size:16px;">⚡</span>
            </div>
            <span style="font-size:18px;font-weight:700;color:${brandStyles.text};letter-spacing:-0.02em;">DumpStash</span>
            <span style="font-size:9px;font-family:monospace;padding:2px 6px;border:1px solid ${brandStyles.border};border-radius:99px;color:${brandStyles.muted};">AI</span>
          </div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:0 32px 32px;">
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${brandStyles.text};">${title}</h1>
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid ${brandStyles.border};text-align:center;">
          <p style="margin:0;font-size:11px;color:${brandStyles.muted};">
            DumpStash AI · Turn chaos into clarity
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  switch (type) {
    case "recovery":
      return {
        subject: "Reset your DumpStash password",
        html: wrapper(
          "Reset your password",
          `<p style="margin:0 0 24px;font-size:14px;color:${brandStyles.muted};line-height:1.6;">
            Hey! We received a request to reset the password for <strong style="color:${brandStyles.text};">${email}</strong>. Click below to set a new one.
          </p>
          <a href="${confirmationUrl}" style="display:inline-block;padding:10px 24px;background:${brandStyles.accent};color:${brandStyles.accentFg};text-decoration:none;border-radius:${brandStyles.radius};font-size:13px;font-weight:600;">
            Reset Password
          </a>
          <p style="margin:20px 0 0;font-size:12px;color:${brandStyles.muted};line-height:1.5;">
            If you didn't request this, you can safely ignore this email. The link expires in 24 hours.
          </p>`
        ),
      };

    case "signup":
      return {
        subject: "Welcome to DumpStash — Confirm your email",
        html: wrapper(
          "Confirm your email",
          `<p style="margin:0 0 24px;font-size:14px;color:${brandStyles.muted};line-height:1.6;">
            Welcome aboard! Confirm your email <strong style="color:${brandStyles.text};">${email}</strong> to start turning your brain dumps into structured insights.
          </p>
          <a href="${confirmationUrl}" style="display:inline-block;padding:10px 24px;background:${brandStyles.accent};color:${brandStyles.accentFg};text-decoration:none;border-radius:${brandStyles.radius};font-size:13px;font-weight:600;">
            Confirm Email
          </a>
          <p style="margin:20px 0 0;font-size:12px;color:${brandStyles.muted};line-height:1.5;">
            If you didn't sign up for DumpStash, you can ignore this email.
          </p>`
        ),
      };

    case "share_invite": {
      const ownerName = data.ownerName || "Someone";
      const sessionName = data.sessionName || "a dump session";
      const permission = data.permission || "read";
      return {
        subject: `${ownerName} shared "${sessionName}" with you on DumpStash`,
        html: wrapper(
          "You've been invited",
          `<p style="margin:0 0 24px;font-size:14px;color:${brandStyles.muted};line-height:1.6;">
            <strong style="color:${brandStyles.text};">${ownerName}</strong> invited you to <strong style="color:${brandStyles.text};">${permission === "write" ? "collaborate on" : "view"}</strong> their session <strong style="color:${brandStyles.text};">"${sessionName}"</strong> on DumpStash.
          </p>
          <a href="${confirmationUrl}" style="display:inline-block;padding:10px 24px;background:${brandStyles.accent};color:${brandStyles.accentFg};text-decoration:none;border-radius:${brandStyles.radius};font-size:13px;font-weight:600;">
            Open DumpStash
          </a>
          <p style="margin:20px 0 0;font-size:12px;color:${brandStyles.muted};line-height:1.5;">
            Sign in with <strong style="color:${brandStyles.text};">${email}</strong> to access the shared session. If you don't have an account yet, sign up with this email.
          </p>`
        ),
      };
    }

    case "magic_link":
      return {
        subject: "Your DumpStash sign-in link",
        html: wrapper(
          "Sign in to DumpStash",
          `<p style="margin:0 0 24px;font-size:14px;color:${brandStyles.muted};line-height:1.6;">
            Click below to sign in to your DumpStash workspace.
          </p>
          <a href="${confirmationUrl}" style="display:inline-block;padding:10px 24px;background:${brandStyles.accent};color:${brandStyles.accentFg};text-decoration:none;border-radius:${brandStyles.radius};font-size:13px;font-weight:600;">
            Sign In
          </a>`
        ),
      };

    default:
      return {
        subject: "DumpStash notification",
        html: wrapper(
          "Hello from DumpStash",
          `<p style="margin:0;font-size:14px;color:${brandStyles.muted};line-height:1.6;">
            ${confirmationUrl ? `<a href="${confirmationUrl}" style="display:inline-block;padding:10px 24px;background:${brandStyles.accent};color:${brandStyles.accentFg};text-decoration:none;border-radius:${brandStyles.radius};font-size:13px;font-weight:600;">Click here</a>` : "You have a notification from DumpStash."}
          </p>`
        ),
      };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, confirmationUrl } = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    if (!email || !type) {
      throw new Error("Missing required fields: email, type");
    }

    const { subject, html } = buildEmail(type, { email, confirmationUrl: confirmationUrl || "" });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DumpStash <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      throw new Error(resendData.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
