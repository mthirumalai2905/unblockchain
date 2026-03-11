import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Globe, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
}

interface LinkEmbedProps {
  url: string;
  className?: string;
}

const LinkEmbed = ({ url, className }: LinkEmbedProps) => {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);

  useEffect(() => {
    const cacheKey = `link-preview-${url}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setPreview(JSON.parse(cached));
      setLoading(false);
      return;
    }

    supabase.functions
      .invoke("fetch-link-preview", { body: { url } })
      .then(({ data, error }) => {
        if (!error && data) {
          setPreview(data as LinkPreview);
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        } else {
          setPreview({ url, title: new URL(url).hostname });
        }
        setLoading(false);
      })
      .catch(() => {
        setPreview({ url, title: new URL(url).hostname });
        setLoading(false);
      });
  }, [url]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRedirectDialog(true);
  };

  const handleRedirect = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    setShowRedirectDialog(false);
  };

  if (loading) {
    return (
      <div className={cn("mt-2 rounded-xl border border-border bg-accent/20 p-4 animate-pulse", className)}>
        <div className="h-3 w-2/3 bg-muted rounded mb-2" />
        <div className="h-2 w-1/2 bg-muted rounded" />
      </div>
    );
  }

  if (!preview) return null;

  const hostname = (() => {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
  })();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleClick}
        className={cn(
          "mt-2 group/link rounded-xl border border-border bg-card/80 hover:bg-accent/40 overflow-hidden cursor-pointer transition-all duration-200 hover:border-ring/40 hover:cf-shadow-md",
          className
        )}
      >
        {preview.image && (
          <div className="relative h-36 overflow-hidden">
            <img
              src={preview.image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover/link:scale-[1.02]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
        )}

        <div className="p-3.5 space-y-1.5">
          <div className="flex items-center gap-2">
            {preview.favicon ? (
              <img
                src={preview.favicon}
                alt=""
                className="w-4 h-4 rounded-sm shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
              {preview.siteName || hostname}
            </span>
            <ArrowUpRight className="w-3 h-3 text-muted-foreground/50 ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </div>

          <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2">
            {preview.title || url}
          </p>

          {preview.description && (
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
              {preview.description}
            </p>
          )}

          <div className="flex items-center gap-1 pt-0.5">
            <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/40 truncate font-mono">
              {hostname}
            </span>
          </div>
        </div>
      </motion.div>

      <Dialog open={showRedirectDialog} onOpenChange={setShowRedirectDialog}>
        <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <ExternalLink className="w-4 h-4 text-primary" />
              Open external link?
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              You're about to visit an external website. Do you want to continue?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 rounded-lg border border-border bg-accent/30 mt-1">
            <div className="flex items-center gap-2">
              {preview?.favicon && (
                <img src={preview.favicon} alt="" className="w-5 h-5 rounded-sm" />
              )}
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-foreground truncate">
                  {preview?.title || url}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-mono">{url}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowRedirectDialog(false); }}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRedirect(); }}
              className="px-4 py-1.5 rounded-md text-[12px] font-medium bg-foreground text-background hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3" />
              Open Link
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LinkEmbed;
