import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb, CheckCircle2, HelpCircle, AlertTriangle,
  ListTodo, MessageSquare, MoreHorizontal,
  ArrowUpRight, Target, MessageCircle, BookOpen, Flame, Flag, Sparkles, Trash2, Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace, Dump, DumpType } from "@/store/WorkspaceStore";
import { supabase } from "@/integrations/supabase/client";
import ThreadPanel from "@/components/ThreadPanel";
import LinkEmbed from "@/components/LinkEmbed";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const typeConfig: Record<DumpType, { icon: typeof Lightbulb; label: string; dotColor: string; bgClass: string; textClass: string }> = {
  idea: { icon: Lightbulb, label: "Idea", dotColor: "bg-cf-idea", bgClass: "bg-cf-idea/10", textClass: "text-cf-idea" },
  decision: { icon: CheckCircle2, label: "Decision", dotColor: "bg-cf-decision", bgClass: "bg-cf-decision/10", textClass: "text-cf-decision" },
  question: { icon: HelpCircle, label: "Question", dotColor: "bg-cf-question", bgClass: "bg-cf-question/10", textClass: "text-cf-question" },
  blocker: { icon: AlertTriangle, label: "Blocker", dotColor: "bg-cf-blocker", bgClass: "bg-cf-blocker/10", textClass: "text-cf-blocker" },
  action: { icon: ListTodo, label: "Action", dotColor: "bg-cf-action", bgClass: "bg-cf-action/10", textClass: "text-cf-action" },
  note: { icon: MessageSquare, label: "Note", dotColor: "bg-cf-note", bgClass: "bg-cf-note/10", textClass: "text-cf-note" },
  todo: { icon: Target, label: "To-Do", dotColor: "bg-cf-todo", bgClass: "bg-cf-todo/10", textClass: "text-cf-todo" },
  insight: { icon: Lightbulb, label: "Insight", dotColor: "bg-cf-insight", bgClass: "bg-cf-insight/10", textClass: "text-cf-insight" },
  feedback: { icon: MessageCircle, label: "Feedback", dotColor: "bg-cf-feedback", bgClass: "bg-cf-feedback/10", textClass: "text-cf-feedback" },
  reference: { icon: BookOpen, label: "Reference", dotColor: "bg-cf-reference", bgClass: "bg-cf-reference/10", textClass: "text-cf-reference" },
  rant: { icon: Flame, label: "Rant", dotColor: "bg-cf-rant", bgClass: "bg-cf-rant/10", textClass: "text-cf-rant" },
  goal: { icon: Flag, label: "Goal", dotColor: "bg-cf-goal", bgClass: "bg-cf-goal/10", textClass: "text-cf-goal" },
};

// Extract embedded images (base64 data urls or markdown images)
const extractImages = (text: string): string[] => {
  const imgs: string[] = [];
  // Our custom [img:data:...] format
  const customImgRegex = /\[img:(data:[^\]]+)\]/g;
  let m;
  while ((m = customImgRegex.exec(text)) !== null) imgs.push(m[1]);
  // Markdown image format
  const mdImgRegex = /!\[image\]\((https?:\/\/[^\s)]+)\)/g;
  while ((m = mdImgRegex.exec(text)) !== null) imgs.push(m[1]);
  return imgs;
};

// Remove image tags from content for text display
const removeImageTags = (text: string): string => {
  return text
    .replace(/\n*\[img:data:[^\]]+\]/g, "")
    .replace(/\n*!\[image\]\(https?:\/\/[^\s)]+\)/g, "")
    .trim();
};

// Extract URLs from text (markdown links and plain URLs)
const extractUrls = (text: string): string[] => {
  // Match markdown links like [title](url) → extract url
  const markdownLinkRegex = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
  const plainUrlRegex = /(?<!\()(?<!\[)(https?:\/\/[^\s)<>\]]+)/g;

  const urls: string[] = [];
  let match;

  while ((match = markdownLinkRegex.exec(text)) !== null) {
    urls.push(match[2]);
  }

  // Also check for plain URLs not inside markdown
  const textWithoutMdLinks = text.replace(markdownLinkRegex, "");
  while ((match = plainUrlRegex.exec(textWithoutMdLinks)) !== null) {
    urls.push(match[0]);
  }

  return [...new Set(urls)];
};

// Remove link section from content for display
const getCleanContent = (text: string): string => {
  // Remove the 🔗 link line and blockquote
  return text
    .replace(/\n\n🔗 \[.*?\]\(.*?\)(\n>.*)?/g, "")
    .trim();
};

const hasEmbeddedLink = (text: string): boolean => {
  return text.includes("🔗 [") || /https?:\/\/[^\s]+/.test(text);
};

interface DumpCardProps {
  dump: Dump;
  index: number;
}

const DumpCard = ({ dump, index }: DumpCardProps) => {
  const { getThemesForDump, selectTheme, setActiveSection, selectDump, selectedDumpId } = useWorkspace();
  const config = typeConfig[dump.type] || typeConfig.note;
  const themes = getThemesForDump(dump.id);
  const [threadOpen, setThreadOpen] = useState(false);
  const [threadCount, setThreadCount] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const embeddedImages = extractImages(dump.content);
  const contentWithoutImages = removeImageTags(dump.content);
  const urls = extractUrls(contentWithoutImages);
  const isLinkDump = urls.length > 0;
  const cleanContent = isLinkDump ? getCleanContent(contentWithoutImages) : contentWithoutImages;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  // Convert lightweight markdown to HTML, preserving formatting (bold, italic, links, code, lists, line breaks)
  const markdownToHtml = (md: string): string => {
    const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const lines = md.split("\n");
    const out: string[] = [];
    let inList: "ul" | "ol" | null = null;
    const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };
    const inline = (s: string) =>
      escape(s)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
        .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/(?<!["=>])(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
    for (const raw of lines) {
      const line = raw.trimEnd();
      let m;
      if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
        closeList();
        out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
      } else if ((m = line.match(/^[-*]\s+(.*)$/))) {
        if (inList !== "ul") { closeList(); out.push("<ul>"); inList = "ul"; }
        out.push(`<li>${inline(m[1])}</li>`);
      } else if ((m = line.match(/^\d+\.\s+(.*)$/))) {
        if (inList !== "ol") { closeList(); out.push("<ol>"); inList = "ol"; }
        out.push(`<li>${inline(m[1])}</li>`);
      } else if (line.startsWith("> ")) {
        closeList();
        out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
      } else if (line === "") {
        closeList();
        out.push("<br/>");
      } else {
        closeList();
        out.push(`<p>${inline(line)}</p>`);
      }
    }
    closeList();
    return out.join("");
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const plain = cleanContent || dump.content;
    const html = markdownToHtml(plain);
    try {
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([plain], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plain);
      }
      setCopied(true);
      toast.success("Copied with formatting");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      try { await navigator.clipboard.writeText(plain); toast.success("Copied"); } catch { toast.error("Copy failed"); }
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("dumps").delete().eq("id", dump.id);
      if (error) throw error;
      toast.success("Dump deleted");
      // Trigger a page refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent("dump-deleted", { detail: { dumpId: dump.id } }));
    } catch (err: any) {
      toast.error("Failed to delete: " + (err.message || "Unknown error"));
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    supabase
      .from("dump_threads")
      .select("id", { count: "exact", head: true })
      .eq("parent_dump_id", dump.id)
      .then(({ count }) => {
        if (count !== null) setThreadCount(count);
      });
  }, [dump.id]);

  const handleThemeClick = (themeId: string) => {
    selectTheme(themeId);
    setActiveSection("themes");
  };

  const handleCardClick = () => {
    selectDump(selectedDumpId === dump.id ? null : dump.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.2 }}
        onClick={handleCardClick}
        className="group relative p-3 sm:p-4 rounded-lg bg-card border border-border hover:border-ring/30 transition-all duration-150 cursor-pointer hover:cf-shadow-md"
      >
        <div className={cn("absolute left-0 top-3 bottom-3 w-[2px] rounded-full", config.dotColor)} />

        <div className="flex items-start gap-2 sm:gap-3 pl-2">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0 mt-0.5 hidden sm:flex">
            {dump.avatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className="text-[13px] font-medium text-foreground">{dump.author}</span>
              <span className="text-[11px] text-muted-foreground font-mono">{new Date(dump.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(dump.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className={cn("inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-[10px] font-medium", config.bgClass, config.textClass)}>
                {config.label}
              </span>
            </div>

            {/* Show clean text content if there is any */}
            {cleanContent && (
              <p className="text-[13px] text-foreground/80 leading-[1.6]">{cleanContent}</p>
            )}

            {/* Embedded images */}
            {embeddedImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {embeddedImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="attachment"
                    className="max-h-48 max-w-full rounded-lg object-cover border border-border"
                  />
                ))}
              </div>
            )}

            {/* Rich link embeds */}
            {isLinkDump && urls.map((url) => (
              <LinkEmbed key={url} url={url} />
            ))}

            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              {themes.length > 0 && themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={(e) => { e.stopPropagation(); handleThemeClick(theme.id); }}
                  className="inline-flex items-center gap-1 px-2 py-[2px] rounded-md text-[10px] font-medium bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
                >
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  {theme.title}
                </button>
              ))}

              <button
                onClick={(e) => { e.stopPropagation(); setThreadOpen(true); }}
                className="inline-flex items-center gap-1 px-2 py-[2px] rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
              >
                <MessageCircle className="w-2.5 h-2.5" />
                {threadCount > 0 ? `${threadCount} replies` : "Reply"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setThreadOpen(true); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent text-cf-idea"
              title="AI Thread"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              title="Delete dump"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent text-muted-foreground">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      <ThreadPanel
        dumpId={dump.id}
        dumpContent={dump.content}
        sessionId={dump.session_id}
        isOpen={threadOpen}
        onClose={() => setThreadOpen(false)}
        onThreadCountChange={setThreadCount}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this dump?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this dump. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DumpCard;
