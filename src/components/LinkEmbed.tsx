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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <div className={cn("mt-2 rounded-lg border border-border bg-accent/20 p-3 animate-pulse", className)}>
        <div className="h-3 w-2/3 bg-muted rounded mb-2" />
        <div className="h-2 w-1/2 bg-muted rounded" />
      </div>
    );
  }

  if (!preview) return null;

  const hostname = (() => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  })();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleClick}
        className={cn(
          "mt-2 group/link rounded-lg border border-border bg-card hover:bg-accent/40 overflow-hidden cursor-pointer transition-colors duration-200 hover:border-ring/40",
          className
        )}
      >
        <div className="flex items-stretch min-w-0">
          {preview.image && (
            <div className="relative w-20 sm:w-24 shrink-0 self-stretch overflow-hidden bg-accent/30">
              <img
                src={preview.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/link:scale-[1.03]"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement!.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 p-2.5 sm:p-3 space-y-1">
            <div className="flex items-center gap-2 min-w-0">
              {preview.favicon ? (
                <img
                  src={preview.favicon}
                  alt=""
                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                {preview.siteName || hostname}
              </span>
              <ArrowUpRight className="w-3 h-3 text-muted-foreground/50 ml-auto shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </div>

            <p className="text-[12px] sm:text-[13px] font-semibold text-foreground leading-snug line-clamp-2">
              {preview.title || url}
            </p>

            {preview.description && (
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1 sm:line-clamp-2">
                {preview.description}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <Dialog open={showRedirectDialog} onOpenChange={setShowRedirectDialog}>
        <DialogContent
          className="max-w-[min(100%,24rem)] gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="pr-6 text-left">
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <ExternalLink className="w-4 h-4 shrink-0 text-foreground" />
              Open external link?
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              You&apos;re about to visit an external website. Do you want to continue?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-accent/40 p-3 min-w-0">
            <div className="flex items-start gap-2.5 min-w-0">
              {preview.favicon ? (
                <img src={preview.favicon} alt="" className="w-5 h-5 rounded-sm shrink-0 mt-0.5" />
              ) : (
                <Globe className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-foreground truncate">
                  {preview.title || hostname}
                </p>
                <p className="text-[10px] text-muted-foreground break-all font-mono leading-relaxed mt-0.5">
                  {url}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                setShowRedirectDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90"
              onClick={(e) => {
                e.stopPropagation();
                handleRedirect();
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LinkEmbed;
