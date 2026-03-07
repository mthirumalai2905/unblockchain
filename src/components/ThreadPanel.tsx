import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Thread {
  id: string;
  content: string;
  is_ai_generated: boolean;
  created_at: string;
  author?: string;
  avatar?: string;
}

interface ThreadPanelProps {
  dumpId: string;
  dumpContent: string;
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onThreadCountChange?: (count: number) => void;
}

const ThreadPanel = ({ dumpId, dumpContent, sessionId, isOpen, onClose, onThreadCountChange }: ThreadPanelProps) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newThread, setNewThread] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !dumpId) return;
    loadThreads();
  }, [isOpen, dumpId]);

  const loadThreads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dump_threads")
      .select("*")
      .eq("parent_dump_id", dumpId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const userIds = [...new Set(data.map((t: any) => t.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_initials")
        .in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

      setThreads(data.map((t: any) => {
        const profile = profileMap.get(t.user_id) as any;
        return {
          id: t.id,
          content: t.content,
          is_ai_generated: t.is_ai_generated,
          created_at: t.created_at,
          author: t.is_ai_generated ? "DumpStash AI" : (profile?.display_name || "You"),
          avatar: t.is_ai_generated ? "AI" : (profile?.avatar_initials || "??"),
        };
      }));
      onThreadCountChange?.(data.length);
    }
    setLoading(false);
  };

  const addThread = async () => {
    if (!newThread.trim() || !user) return;
    const { data, error } = await supabase
      .from("dump_threads")
      .insert({ parent_dump_id: dumpId, session_id: sessionId, user_id: user.id, content: newThread.trim(), is_ai_generated: false })
      .select()
      .single();
    if (error) { toast.error("Failed to add reply"); return; }
    const { data: profile } = await supabase.from("profiles").select("display_name, avatar_initials").eq("user_id", user.id).maybeSingle();
    setThreads(prev => [...prev, {
      id: data.id, content: data.content, is_ai_generated: false, created_at: data.created_at,
      author: profile?.display_name || "You", avatar: profile?.avatar_initials || "YO",
    }]);
    onThreadCountChange?.(threads.length + 1);
    setNewThread("");
  };

  const addAIThread = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const existingContext = threads.map(t => `${t.author}: ${t.content}`).join("\n");
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-thread`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ dump_content: dumpContent, existing_threads: existingContext, user_id: user.id }),
      });
      const result = await resp.json();
      if (result.content) {
        const { data, error } = await supabase
          .from("dump_threads")
          .insert({ parent_dump_id: dumpId, session_id: sessionId, user_id: user.id, content: result.content, is_ai_generated: true })
          .select()
          .single();
        if (!error && data) {
          setThreads(prev => [...prev, {
            id: data.id, content: data.content, is_ai_generated: true, created_at: data.created_at,
            author: "DumpStash AI", avatar: "AI",
          }]);
          onThreadCountChange?.(threads.length + 1);
        }
      } else {
        toast.error("AI couldn't generate a response");
      }
    } catch {
      toast.error("AI thread generation failed");
    }
    setAiLoading(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-10 w-full max-w-lg max-h-[80vh] flex flex-col rounded-xl border border-border bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-[13px] font-semibold text-foreground">Thread</span>
            <span className="text-[11px] font-mono text-muted-foreground">{threads.length} replies</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Original dump */}
        <div className="px-4 py-3 border-b border-border bg-accent/30">
          <p className="text-[13px] text-foreground/80 leading-relaxed">{dumpContent}</p>
        </div>

        {/* Threads */}
        <div className="flex-1 overflow-auto cf-scrollbar px-4 py-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : threads.length === 0 ? (
            <p className="text-[12px] text-muted-foreground text-center py-8">No replies yet. Start a conversation!</p>
          ) : (
            threads.map((thread) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("p-3 rounded-lg border", thread.is_ai_generated ? "border-cf-idea/30 bg-cf-idea/5" : "border-border bg-card")}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0",
                    thread.is_ai_generated ? "bg-cf-idea/20 text-cf-idea" : "bg-accent text-muted-foreground"
                  )}>{thread.avatar}</div>
                  <span className="text-[11px] font-medium text-foreground">{thread.author}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(thread.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[12px] text-foreground/70 leading-relaxed pl-7">{thread.content}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3 flex items-center gap-2">
          <input
            value={newThread}
            onChange={(e) => setNewThread(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addThread(); } }}
            placeholder="Reply to this dump..."
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <button
            onClick={addAIThread}
            disabled={aiLoading}
            className="p-1.5 rounded-md text-cf-idea hover:bg-cf-idea/10 transition-colors disabled:opacity-50"
            title="Generate AI reply"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </button>
          <button
            onClick={addThread}
            disabled={!newThread.trim()}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
              newThread.trim() ? "bg-foreground text-background hover:opacity-80" : "bg-accent text-muted-foreground/30"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThreadPanel;
