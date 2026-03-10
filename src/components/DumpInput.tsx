import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Image, Link, Paperclip, Sparkles, ArrowUp, Loader2, X, ExternalLink, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
}

const DumpInput = () => {
  const { addDump, processAllDumps, isProcessing, dumps } = useWorkspace();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [attachedLink, setAttachedLink] = useState<LinkPreview | null>(null);

  const handleSubmit = () => {
    if (!value.trim() && !attachedLink) return;
    const content = attachedLink
      ? `${value.trim()}\n\n🔗 [${attachedLink.title || attachedLink.url}](${attachedLink.url})${attachedLink.description ? `\n> ${attachedLink.description}` : ""}`
      : value.trim();
    if (!content) return;
    addDump(content);
    setValue("");
    setAttachedLink(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const fetchLinkPreview = async () => {
    if (!linkUrl.trim()) return;
    let url = linkUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    setFetchingPreview(true);
    setLinkPreview(null);

    try {
      const { data, error } = await supabase.functions.invoke("fetch-link-preview", {
        body: { url },
      });

      if (error) throw error;
      setLinkPreview(data as LinkPreview);
    } catch {
      // Fallback: just use the URL
      setLinkPreview({ url, title: url });
    }
    setFetchingPreview(false);
  };

  const attachLink = () => {
    if (linkPreview) {
      setAttachedLink(linkPreview);
      setShowLinkDialog(false);
      setLinkUrl("");
      setLinkPreview(null);
      toast.success("Link attached!");
    }
  };

  const tools = [
    { icon: Mic, label: "Voice note", onClick: () => {} },
    { icon: Image, label: "Image", onClick: () => {} },
    { icon: Link, label: "Link", onClick: () => setShowLinkDialog(true) },
    { icon: Paperclip, label: "File", onClick: () => {} },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative rounded-xl border transition-all duration-200 bg-card",
          isFocused ? "border-ring/50 cf-shadow-md" : "border-border cf-shadow-sm hover:border-ring/30"
        )}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Dump your thoughts... no structure needed"
          rows={3}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-[14px] leading-relaxed"
        />

        {/* Attached link preview */}
        <AnimatePresence>
          {attachedLink && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-3 mb-2"
            >
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-accent/40">
                {attachedLink.image ? (
                  <img
                    src={attachedLink.image}
                    alt=""
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground truncate">
                    {attachedLink.title || attachedLink.url}
                  </p>
                  {attachedLink.description && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {attachedLink.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setAttachedLink(null)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between px-2.5 pb-2.5">
          <div className="flex items-center gap-0.5">
            {tools.map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                title={label}
                onClick={onClick}
                className="p-1.5 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent transition-colors"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={processAllDumps}
              disabled={isProcessing || dumps.length === 0}
              className={cn(
                "text-[11px] flex items-center gap-1 font-mono px-2 py-1 rounded-md transition-all",
                isProcessing
                  ? "text-cf-decision bg-cf-decision/10"
                  : dumps.length === 0
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-muted-foreground/50 hover:text-foreground hover:bg-accent cursor-pointer"
              )}
            >
              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {isProcessing ? "processing..." : "auto-process"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!value.trim() && !attachedLink}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                value.trim() || attachedLink
                  ? "bg-foreground text-background hover:opacity-80"
                  : "bg-accent text-muted-foreground/30 cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Link Embed Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <Link className="w-4 h-4 text-primary" />
              Attach a link
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Paste a URL to embed a link preview with your dump.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="flex gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); fetchLinkPreview(); } }}
                placeholder="https://example.com/article"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={fetchLinkPreview}
                disabled={!linkUrl.trim() || fetchingPreview}
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-medium transition-all",
                  !linkUrl.trim() || fetchingPreview
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {fetchingPreview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Preview"}
              </button>
            </div>

            {/* Link Preview */}
            <AnimatePresence>
              {linkPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="rounded-lg border border-border overflow-hidden bg-accent/30"
                >
                  {linkPreview.image && (
                    <img
                      src={linkPreview.image}
                      alt=""
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-3 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {linkPreview.favicon && (
                        <img src={linkPreview.favicon} alt="" className="w-4 h-4 rounded-sm" />
                      )}
                      {linkPreview.siteName && (
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {linkPreview.siteName}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-semibold text-foreground leading-snug">
                      {linkPreview.title || linkPreview.url}
                    </p>
                    {linkPreview.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {linkPreview.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 pt-0.5">
                      <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/50 truncate">
                        {linkPreview.url}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => { setShowLinkDialog(false); setLinkUrl(""); setLinkPreview(null); }}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={attachLink}
              disabled={!linkPreview}
              className={cn(
                "px-4 py-1.5 rounded-md text-[12px] font-medium transition-all",
                !linkPreview
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-foreground text-background hover:opacity-90"
              )}
            >
              Attach Link
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DumpInput;
