import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, Loader2, ThumbsUp, MessageCircle, ChevronDown, ChevronRight, Hash, Users, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SocialDump {
  id: string;
  content: string;
  ai_label: string | null;
  created_at: string;
  author: string;
  avatar: string;
}

interface IdeaGroup {
  id: string;
  title: string;
  description: string | null;
  dump_ids: string[];
  votes: number;
  hasVoted: boolean;
  comments: GroupComment[];
}

interface GroupComment {
  id: string;
  content: string;
  user_id: string;
  author: string;
  avatar: string;
  created_at: string;
}

interface ContextGuidance {
  message: string;
  suggestions: string[];
}

const SocialModeView = () => {
  const { activeSessionId } = useWorkspace();
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [socialDumps, setSocialDumps] = useState<SocialDump[]>([]);
  const [ideaGroups, setIdeaGroups] = useState<IdeaGroup[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [contextGuidance, setContextGuidance] = useState<ContextGuidance | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);

  // Load ALL social dumps globally (not session-scoped)
  const loadSocialDumps = useCallback(async () => {
    if (!user) return;
    const { data: dumps } = await supabase
      .from("dumps")
      .select("*")
      .eq("mode", "social")
      .order("created_at", { ascending: false });

    if (dumps) {
      const userIds = [...new Set(dumps.map((d: any) => d.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, avatar_initials").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      setSocialDumps(dumps.map((d: any) => {
        const profile = profileMap.get(d.user_id) as any;
        return {
          id: d.id,
          content: d.content,
          ai_label: d.ai_label,
          created_at: d.created_at,
          author: profile?.display_name || "User",
          avatar: profile?.avatar_initials || "??",
        };
      }));
    }
  }, [user]);

  // Load ALL idea groups globally
  const loadGroups = useCallback(async () => {
    if (!user) return;
    const { data: groups } = await supabase
      .from("idea_groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (!groups || groups.length === 0) { setIdeaGroups([]); return; }

    const groupIds = groups.map((g: any) => g.id);
    const [linksRes, votesRes, commentsRes] = await Promise.all([
      supabase.from("idea_group_dumps").select("*").in("group_id", groupIds),
      supabase.from("group_votes").select("*").in("group_id", groupIds),
      supabase.from("group_comments").select("*").in("group_id", groupIds).order("created_at", { ascending: true }),
    ]);

    // Get commenter profiles
    const commentUserIds = [...new Set((commentsRes.data || []).map((c: any) => c.user_id))];
    const { data: commentProfiles } = commentUserIds.length > 0
      ? await supabase.from("profiles").select("user_id, display_name, avatar_initials").in("user_id", commentUserIds)
      : { data: [] };
    const commentProfileMap = new Map((commentProfiles || []).map((p: any) => [p.user_id, p]));

    setIdeaGroups(groups.map((g: any) => {
      const links = (linksRes.data || []).filter((l: any) => l.group_id === g.id);
      const votes = (votesRes.data || []).filter((v: any) => v.group_id === g.id);
      const comments = (commentsRes.data || []).filter((c: any) => c.group_id === g.id);
      return {
        id: g.id,
        title: g.title,
        description: g.description,
        dump_ids: links.map((l: any) => l.dump_id),
        votes: votes.length,
        hasVoted: votes.some((v: any) => v.user_id === user.id),
        comments: comments.map((c: any) => {
          const profile = commentProfileMap.get(c.user_id) as any;
          return {
            id: c.id,
            content: c.content,
            user_id: c.user_id,
            author: profile?.display_name || "User",
            avatar: profile?.avatar_initials || "??",
            created_at: c.created_at,
          };
        }),
      };
    }));
  }, [user]);

  useEffect(() => {
    loadSocialDumps();
    loadGroups();
  }, [loadSocialDumps, loadGroups]);

  const handleSubmit = async () => {
    if (!value.trim() || !user || !activeSessionId) return;
    const { error } = await supabase
      .from("dumps")
      .insert({ session_id: activeSessionId, user_id: user.id, content: value.trim(), type: "note" as const, mode: "social" });
    if (error) { toast.error("Failed to post"); return; }
    setValue("");
    loadSocialDumps();
  };

  const handleProcess = async () => {
    if (!user || socialDumps.length === 0) return;
    setIsProcessing(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-social-dump`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "Processing failed");
      } else if (data.needs_more_context) {
        // AI decided it needs more context - show guidance dialog
        setContextGuidance({
          message: data.context_message || "Need more dumps to find meaningful patterns.",
          suggestions: data.context_suggestions || [],
        });
        setShowGuidance(true);
        if (data.labels_count > 0) {
          toast.info(`Labeled ${data.labels_count} dumps, but need more context to group them`);
          await loadSocialDumps();
        }
      } else {
        toast.success(`Created ${data.groups_count} groups from ${data.labels_count} labeled dumps`);
        await Promise.all([loadSocialDumps(), loadGroups()]);
      }
    } catch {
      toast.error("Processing failed");
    }
    setIsProcessing(false);
  };

  const handleVote = async (groupId: string, hasVoted: boolean) => {
    if (!user) return;
    if (hasVoted) {
      await supabase.from("group_votes").delete().eq("group_id", groupId).eq("user_id", user.id);
    } else {
      await supabase.from("group_votes").insert({ group_id: groupId, user_id: user.id });
    }
    loadGroups();
  };

  const handleComment = async (groupId: string) => {
    const text = commentText[groupId]?.trim();
    if (!text || !user) return;
    await supabase.from("group_comments").insert({ group_id: groupId, user_id: user.id, content: text });
    setCommentText((prev) => ({ ...prev, [groupId]: "" }));
    loadGroups();
  };

  const getDumpsForGroup = (dumpIds: string[]) => socialDumps.filter((d) => dumpIds.includes(d.id));

  return (
    <div className="space-y-6">
      {/* Context Guidance Dialog */}
      <Dialog open={showGuidance} onOpenChange={setShowGuidance}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <Lightbulb className="w-4 h-4 text-primary" />
              Need More Context
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed pt-2">
              {contextGuidance?.message}
            </DialogDescription>
          </DialogHeader>
          {contextGuidance?.suggestions && contextGuidance.suggestions.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                What to do next
              </p>
              <div className="space-y-1.5">
                {contextGuidance.suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-accent/50 border border-border"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                    </div>
                    <p className="text-[12px] text-foreground/80 leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowGuidance(false)}
              className="px-4 py-2 rounded-md bg-foreground text-background text-[12px] font-medium hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Social dump input */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl border border-border bg-card cf-shadow-sm"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          placeholder="What's on your mind? Drop ideas like tweets..."
          rows={2}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-[14px] leading-relaxed"
        />
        <div className="flex items-center justify-between px-2.5 pb-2.5">
          <span className="text-[11px] text-muted-foreground/40 font-mono px-2">
            {socialDumps.length} posts globally
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleProcess}
              disabled={isProcessing || socialDumps.length === 0}
              className={cn(
                "text-[11px] flex items-center gap-1 font-mono px-2 py-1 rounded-md transition-all",
                isProcessing
                  ? "text-primary bg-primary/10"
                  : socialDumps.length === 0
                  ? "text-muted-foreground/30 cursor-not-allowed"
                  : "text-muted-foreground/50 hover:text-foreground hover:bg-accent cursor-pointer"
              )}
            >
              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {isProcessing ? "grouping..." : "AI group"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                value.trim()
                  ? "bg-foreground text-background hover:opacity-80"
                  : "bg-accent text-muted-foreground/30 cursor-not-allowed"
              )}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Idea Groups */}
      {ideaGroups.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-[13px] font-semibold text-foreground">Idea Groups</h3>
            <span className="text-[11px] text-muted-foreground font-mono">{ideaGroups.length} groups</span>
          </div>
          {ideaGroups.map((group) => {
            const isExpanded = expandedGroup === group.id;
            const groupDumps = getDumpsForGroup(group.dump_ids);
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  className="w-full flex items-center gap-3 p-3 sm:p-4 text-left hover:bg-accent/30 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-medium text-foreground truncate">{group.title}</h4>
                    {group.description && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{group.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-muted-foreground font-mono">{groupDumps.length} ideas</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleVote(group.id, group.hasVoted); }}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all",
                        group.hasVoted
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {group.votes}
                    </button>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      {group.comments.length}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border p-3 sm:p-4 space-y-3">
                        {/* Grouped dumps */}
                        <div className="space-y-2">
                          {groupDumps.map((dump) => (
                            <div key={dump.id} className="flex items-start gap-2 p-2.5 rounded-md bg-accent/30">
                              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[9px] font-semibold text-muted-foreground shrink-0">
                                {dump.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[12px] font-medium text-foreground">{dump.author}</span>
                                  {dump.ai_label && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded text-[9px] font-mono bg-primary/10 text-primary">
                                      <Hash className="w-2 h-2" />
                                      {dump.ai_label}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[12px] text-foreground/80 leading-relaxed mt-0.5">{dump.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Comments */}
                        {group.comments.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-border/50">
                            {group.comments.map((comment) => (
                              <div key={comment.id} className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[8px] font-semibold text-muted-foreground shrink-0">
                                  {comment.avatar}
                                </div>
                                <div>
                                  <span className="text-[11px] font-medium text-foreground">{comment.author}</span>
                                  <p className="text-[11px] text-foreground/70">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            value={commentText[group.id] || ""}
                            onChange={(e) => setCommentText((prev) => ({ ...prev, [group.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleComment(group.id); }}
                            placeholder="Add a comment..."
                            className="flex-1 text-[12px] px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50"
                          />
                          <button
                            onClick={() => handleComment(group.id)}
                            disabled={!commentText[group.id]?.trim()}
                            className="text-[11px] px-2 py-1.5 rounded-md bg-foreground text-background disabled:opacity-30 hover:opacity-80 transition-opacity"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Social dumps feed */}
      <div className="space-y-1.5">
        {socialDumps.map((dump, i) => (
          <motion.div
            key={dump.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            className="group relative p-3 sm:p-4 rounded-lg bg-card border border-border hover:border-ring/30 transition-all duration-150"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                {dump.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[13px] font-medium text-foreground">{dump.author}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(dump.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(dump.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {dump.ai_label && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded text-[10px] font-mono bg-primary/10 text-primary">
                      <Hash className="w-2.5 h-2.5" />
                      {dump.ai_label}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-foreground/80 leading-[1.6]">{dump.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {socialDumps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[13px] text-muted-foreground">No social posts yet. Start dumping ideas!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialModeView;
