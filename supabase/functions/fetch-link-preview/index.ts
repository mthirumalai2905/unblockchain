import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) throw new Error("URL is required");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DumpStash/1.0; +https://dumpstash.app)",
        "Accept": "text/html",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      const parsedUrl = new URL(url);
      return new Response(
        JSON.stringify({
          url,
          title: parsedUrl.hostname.replace("www.", ""),
          siteName: parsedUrl.hostname.replace("www.", ""),
          favicon: `${parsedUrl.origin}/favicon.ico`,
          fallback: true,
          status: response.status,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await response.text();

    // Extract Open Graph and meta tags
    const getMetaContent = (property: string): string | undefined => {
      const patterns = [
        new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, "i"),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, "i"),
        new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, "i"),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, "i"),
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) return match[1];
      }
      return undefined;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);

    const parsedUrl = new URL(url);
    let favicon = faviconMatch?.[1];
    if (favicon && !favicon.startsWith("http")) {
      favicon = favicon.startsWith("/")
        ? `${parsedUrl.origin}${favicon}`
        : `${parsedUrl.origin}/${favicon}`;
    }
    if (!favicon) {
      favicon = `${parsedUrl.origin}/favicon.ico`;
    }

    let image = getMetaContent("og:image") || getMetaContent("twitter:image");
    if (image && !image.startsWith("http")) {
      image = image.startsWith("/")
        ? `${parsedUrl.origin}${image}`
        : `${parsedUrl.origin}/${image}`;
    }

    const result = {
      url,
      title: getMetaContent("og:title") || getMetaContent("twitter:title") || titleMatch?.[1]?.trim() || url,
      description: getMetaContent("og:description") || getMetaContent("twitter:description") || getMetaContent("description"),
      image,
      favicon,
      siteName: getMetaContent("og:site_name") || parsedUrl.hostname.replace("www.", ""),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-link-preview error:", e);
    let fallback: Record<string, unknown> = { fallback: true, error: e instanceof Error ? e.message : "Unknown error" };
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body?.url) {
        const p = new URL(body.url);
        fallback = {
          ...fallback,
          url: body.url,
          title: p.hostname.replace("www.", ""),
          siteName: p.hostname.replace("www.", ""),
          favicon: `${p.origin}/favicon.ico`,
        };
      }
    } catch (_) { /* ignore */ }
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
