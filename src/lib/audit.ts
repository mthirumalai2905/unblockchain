import { supabase } from "@/integrations/supabase/client";

/**
 * Audit logging — fire-and-forget. Never blocks UI, never throws.
 * Captures device/browser/OS via user-agent only (no IP geo).
 */

export type AuditCategory =
  | "auth"
  | "navigation"
  | "session"
  | "dump"
  | "ai"
  | "share"
  | "profile"
  | "general"
  | "error";

export interface AuditEvent {
  event_name: string;
  category?: AuditCategory;
  metadata?: Record<string, unknown>;
}

interface ParsedUA {
  device_type: string;
  browser: string;
  os: string;
}

function parseUserAgent(ua: string): ParsedUA {
  const u = ua.toLowerCase();

  // Device
  let device_type = "desktop";
  if (/ipad|tablet|playbook|silk/.test(u) || (/android/.test(u) && !/mobile/.test(u))) {
    device_type = "tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/.test(u)) {
    device_type = "mobile";
  }

  // OS
  let os = "Unknown";
  if (/windows nt 10/.test(u)) os = "Windows 10/11";
  else if (/windows/.test(u)) os = "Windows";
  else if (/mac os x|macintosh/.test(u)) os = "macOS";
  else if (/iphone|ipad|ipod/.test(u)) os = "iOS";
  else if (/android/.test(u)) os = "Android";
  else if (/linux/.test(u)) os = "Linux";

  // Browser (order matters: edge before chrome, opera before chrome, etc.)
  let browser = "Unknown";
  if (/edg\//.test(u)) browser = "Edge";
  else if (/opr\/|opera/.test(u)) browser = "Opera";
  else if (/firefox/.test(u)) browser = "Firefox";
  else if (/chrome\//.test(u) && !/chromium/.test(u)) browser = "Chrome";
  else if (/safari/.test(u) && !/chrome/.test(u)) browser = "Safari";

  return { device_type, browser, os };
}

function getClientContext() {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent;
  const parsed = parseUserAgent(ua);
  return {
    user_agent: ua,
    device_type: parsed.device_type,
    browser: parsed.browser,
    os: parsed.os,
    screen_size: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || "unknown",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    route: window.location.pathname,
  };
}

export async function logEvent(event: AuditEvent): Promise<void> {
  try {
    const ctx = getClientContext();
    if (!ctx) return;

    const { data: { user } } = await supabase.auth.getUser();

    // Anonymous events not allowed by RLS for unauthenticated insert unless user_id is null.
    // We only log events when there's a user OR for the explicit anon-allowed events.
    const payload = {
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      event_name: event.event_name,
      category: event.category ?? "general",
      metadata: event.metadata ?? {},
      ...ctx,
    };

    // Fire-and-forget; never throw to caller
    void supabase
      .from("audit_logs")
      .insert([payload])
      .then(({ error }) => {
        if (error) console.warn("[audit] insert failed:", error.message);
      });
  } catch (err) {
    console.warn("[audit] unexpected error:", err);
  }
}
