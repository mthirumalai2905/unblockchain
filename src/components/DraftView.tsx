import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Play, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const DRAFT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-draft`;

const DraftView = () => {
  const { activeSessionId, dumps } = useWorkspace();
  const [markdown, setMarkdown] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    if (!activeSessionId || dumps.length === 0) {
      toast.error("Add some dumps first before generating a draft");
      return;
    }
    setIsGenerating(true);
    setMarkdown("");

    try {
      const resp = await fetch(DRAFT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ session_id: activeSessionId }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`Failed: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setMarkdown(content);
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate draft");
    } finally {
      setIsGenerating(false);
    }
  }, [activeSessionId, dumps.length]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold text-foreground">Draft PRD</span>
        </div>
        <div className="flex items-center gap-2">
          {markdown && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-muted-foreground hover:text-foreground border border-border hover:border-ring/50 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
          <button
            onClick={generate}
            disabled={isGenerating || dumps.length === 0}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
              isGenerating
                ? "bg-accent text-muted-foreground cursor-not-allowed"
                : "bg-foreground text-background hover:opacity-90"
            )}
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : markdown ? (
              <RefreshCw className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isGenerating ? "Generating..." : markdown ? "Regenerate" : "Generate Draft"}
          </button>
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Raw Markdown */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Markdown</span>
          </div>
          <div className="flex-1 overflow-auto cf-scrollbar">
            {markdown ? (
              <pre className="p-4 text-[12px] font-mono text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
                {markdown}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-[13px] text-muted-foreground mb-1">No draft generated yet</p>
                <p className="text-[11px] text-muted-foreground/50">
                  Click "Generate Draft" to create a PRD from your session dumps
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Rendered Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Preview</span>
          </div>
          <div className="flex-1 overflow-auto cf-scrollbar">
            {markdown ? (
              <div className="p-6 draft-preview prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[11px] text-muted-foreground/40 font-mono">Preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-2 border-t border-border flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cf-decision animate-pulse" />
          <span className="text-[11px] font-mono text-muted-foreground">AI is writing your PRD...</span>
        </motion.div>
      )}
    </div>
  );
};

export default DraftView;
