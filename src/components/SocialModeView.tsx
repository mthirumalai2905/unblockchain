import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, Loader2, ThumbsUp, MessageCircle, ChevronDown, ChevronRight, Hash, Users, Lightbulb, GitBranch, Plus, UserPlus, Search, X, Send, Bot, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import dumpstashBot from "@/assets/dumpstash-ai-bot.png";
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
  is_ai_created: boolean;
  created_at: string;
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

interface SubGroup {
  id: string;
  title: string;
  description: string | null;
  member_count: number;
}

const SocialModeView = () => {
  const { activeSessionId, setActiveSubGroupId, showChromeChat, toggleChromeChat } = useWorkspace();
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [socialDumps, setSocialDumps] = useState<SocialDump[]>([]);
  const [ideaGroups, setIdeaGroups] = useState<IdeaGroup[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [contextGuidance, setContextGuidance] = useState<ContextGuidance | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [subGroups, setSubGroups] = useState<Record<string, SubGroup[]>>({});
  const [groupsCollapsed, setGroupsCollapsed] = useState(false);
  const [themeGroupsCollapsed, setThemeGroupsCollapsed] = useState(false);
  const [subGroupInput, setSubGroupInput] = useState<Record<string, string>>({});
  const [creatingSubGroup, setCreatingSubGroup] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [showCreateSubGroup, setShowCreateSubGroup] = useState<string | null>(null);
  const [newSubGroupTitle, setNewSubGroupTitle] = useState("");
  const [newSubGroupDesc, setNewSubGroupDesc] = useState("");
  const [showAddMember, setShowAddMember] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberResults, setMemberResults] = useState<{ user_id: string; display_name: string; avatar_initials: string }[]>([]);
  
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);
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
        is_ai_created: g.is_ai_created || false,
        created_at: g.created_at,
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

  // Derive theme groups (AI-created) and manual groups from ideaGroups
  const themeGroups = ideaGroups.filter((g) => g.is_ai_created);
  const manualGroups = ideaGroups.filter((g) => !g.is_ai_created);


  const loadSubGroups = useCallback(async (groupId: string) => {
    const { data } = await supabase
      .from("sub_groups")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (data) {
      const sgWithCounts = await Promise.all(data.map(async (sg: any) => {
        const { count } = await supabase
          .from("sub_group_members")
          .select("*", { count: "exact", head: true })
          .eq("sub_group_id", sg.id);
        return { id: sg.id, title: sg.title, description: sg.description, member_count: count || 0 };
      }));
      setSubGroups((prev) => ({ ...prev, [groupId]: sgWithCounts }));
    }
  }, []);

  const handleCreateSubGroup = async (groupId: string, userRequest?: string) => {
    if (!user) return;
    setCreatingSubGroup(groupId);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-sub-groups`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ group_id: groupId, user_id: user.id, user_request: userRequest || null }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "Failed to create sub-groups");
      } else {
        toast.success(`Created ${data.created_count} sub-group${data.created_count !== 1 ? "s" : ""}`);
        await loadSubGroups(groupId);
      }
    } catch {
      toast.error("Failed to create sub-groups");
    }
    setCreatingSubGroup(null);
    setSubGroupInput((prev) => ({ ...prev, [groupId]: "" }));
  };

  // Manual group creation
  const handleManualCreateGroup = async () => {
    if (!user || !newGroupTitle.trim()) return;
    const { data, error } = await supabase
      .from("idea_groups")
      .insert({ title: newGroupTitle.trim(), description: newGroupDesc.trim() || null, user_id: user.id, session_id: activeSessionId! })
      .select()
      .single();
    if (error) { toast.error("Failed to create group"); return; }
    toast.success("Group created!");
    setNewGroupTitle("");
    setNewGroupDesc("");
    setShowCreateGroup(false);
    await loadGroups();
  };

  // Manual sub-group creation (direct DB insert, no AI)
  const handleManualCreateSubGroup = async (groupId: string) => {
    if (!user || !newSubGroupTitle.trim()) return;
    const { data: sg, error } = await supabase
      .from("sub_groups")
      .insert({ group_id: groupId, created_by: user.id, title: newSubGroupTitle.trim(), description: newSubGroupDesc.trim() || null })
      .select()
      .single();
    if (error) { toast.error("Failed to create sub-group"); return; }
    // Add creator as member
    await supabase.from("sub_group_members").upsert({ sub_group_id: sg.id, user_id: user.id }, { onConflict: "sub_group_id,user_id" });
    toast.success("Sub-group created!");
    setNewSubGroupTitle("");
    setNewSubGroupDesc("");
    setShowCreateSubGroup(null);
    await loadSubGroups(groupId);
  };

  // Search members to add
  const searchMembers = async (query: string) => {
    setMemberSearch(query);
    if (query.length < 2) { setMemberResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_initials")
      .ilike("display_name", `%${query}%`)
      .limit(5);
    setMemberResults((data || []) as any);
  };

  // Add member to group + sub-group
  const addMemberToGroup = async (groupId: string, memberId: string) => {
    await supabase.from("group_members").upsert({ group_id: groupId, user_id: memberId }, { onConflict: "group_id,user_id" });
    toast.success("Member added to group!");
    setMemberSearch("");
    setMemberResults([]);
  };

  useEffect(() => {
    loadSocialDumps();
    loadGroups();
  }, [loadSocialDumps, loadGroups]);

  // Load sub-groups when a group is expanded
  useEffect(() => {
    if (expandedGroup) {
      loadSubGroups(expandedGroup);
    }
  }, [expandedGroup, loadSubGroups]);

  const handleSubmit = async () => {
    if (!value.trim() || !user || !activeSessionId) return;
    const { error } = await supabase
      .from("dumps")
      .insert({ session_id: activeSessionId, user_id: user.id, content: value.trim(), type: "note" as const, mode: "social" });
    if (error) { toast.error("Failed to post"); return; }
    setValue("");
    loadSocialDumps();
  };

  // AI Assistant chat
  const sendAIMessage = async () => {
    if (!aiInput.trim() || !user || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ message: userMsg, user_id: user.id, session_id: activeSessionId }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "AI request failed");
        setAiMessages((prev) => [...prev, { role: "assistant", content: `❌ ${data.error || "Something went wrong"}` }]);
      } else {
        setAiMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        // Refresh data if actions were performed
        if (data.actions_performed > 0) {
          await loadGroups();
        }
      }
    } catch {
      setAiMessages((prev) => [...prev, { role: "assistant", content: "❌ Network error, please try again." }]);
    }
    setAiLoading(false);
  };

  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setGroupsCollapsed((p) => !p)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {groupsCollapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-[13px] font-semibold text-foreground">Idea Groups</h3>
            <span className="text-[11px] text-muted-foreground font-mono">{manualGroups.length} groups</span>
          </button>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          >
            <Plus className="w-3 h-3" />
            Create Group
          </button>
        </div>
        <AnimatePresence>
        {!groupsCollapsed && (
          <>
          {manualGroups.map((group) => {
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

                        {/* Sub-groups */}
                        <div className="pt-3 border-t border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <GitBranch className="w-3 h-3 text-primary" />
                              <span className="text-[11px] font-semibold text-foreground">Sub-groups</span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {(subGroups[group.id] || []).length}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setShowAddMember(group.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                              >
                                <UserPlus className="w-2.5 h-2.5" />
                                Add Member
                              </button>
                              <button
                                onClick={() => setShowCreateSubGroup(group.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                              >
                                <Plus className="w-2.5 h-2.5" />
                                New
                              </button>
                              <button
                                onClick={() => handleCreateSubGroup(group.id)}
                                disabled={creatingSubGroup === group.id}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                              >
                                {creatingSubGroup === group.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                AI suggest
                              </button>
                            </div>
                          </div>

                          {/* Existing sub-groups */}
                          {(subGroups[group.id] || []).map((sg) => (
                            <button
                              key={sg.id}
                              onClick={() => setActiveSubGroupId(sg.id)}
                              className="w-full flex items-center gap-2.5 p-2.5 rounded-md bg-accent/30 hover:bg-accent/60 transition-colors text-left"
                            >
                              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                                <GitBranch className="w-3 h-3 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-foreground truncate">{sg.title}</p>
                                {sg.description && <p className="text-[10px] text-muted-foreground truncate">{sg.description}</p>}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono shrink-0">{sg.member_count} members</span>
                              <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            </button>
                          ))}

                          {/* Create sub-group input */}
                          <div className="flex items-center gap-2">
                            <input
                              value={subGroupInput[group.id] || ""}
                              onChange={(e) => setSubGroupInput((prev) => ({ ...prev, [group.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && subGroupInput[group.id]?.trim()) {
                                  handleCreateSubGroup(group.id, subGroupInput[group.id].trim());
                                }
                              }}
                              placeholder="Type to create a sub-group (e.g., 'mobile UX team')..."
                              className="flex-1 text-[11px] px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-ring/50"
                            />
                            <button
                              onClick={() => {
                                if (subGroupInput[group.id]?.trim()) {
                                  handleCreateSubGroup(group.id, subGroupInput[group.id].trim());
                                }
                              }}
                              disabled={!subGroupInput[group.id]?.trim() || creatingSubGroup === group.id}
                              className="text-[10px] px-2 py-1.5 rounded-md bg-foreground text-background disabled:opacity-30 hover:opacity-80 transition-opacity"
                            >
                              Create
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {manualGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-lg">
              <Users className="w-6 h-6 text-muted-foreground/40 mb-2" />
              <p className="text-[12px] text-muted-foreground">No groups yet. Create one manually or use AI grouping!</p>
            </div>
          )}
          </>
        )}
        </AnimatePresence>
        </div>

      {/* Theme Groups */}
      <div className="space-y-3">
        <button
          onClick={() => setThemeGroupsCollapsed((p) => !p)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {themeGroupsCollapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-[13px] font-semibold text-foreground">Theme Groups</h3>
          <span className="text-[11px] text-muted-foreground font-mono">{themeGroups.length} themes</span>
        </button>
        <AnimatePresence>
          {!themeGroupsCollapsed && (
            <>
              {themeGroups.map((group) => {
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
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                      </div>
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
                            group.hasVoted ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
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

                            {/* Sub-groups */}
                            <div className="pt-3 border-t border-border/50 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <GitBranch className="w-3 h-3 text-primary" />
                                  <span className="text-[11px] font-semibold text-foreground">Sub-groups</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {(subGroups[group.id] || []).length}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setShowAddMember(group.id)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                  >
                                    <UserPlus className="w-2.5 h-2.5" />
                                    Add Member
                                  </button>
                                  <button
                                    onClick={() => setShowCreateSubGroup(group.id)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                    New
                                  </button>
                                  <button
                                    onClick={() => handleCreateSubGroup(group.id)}
                                    disabled={creatingSubGroup === group.id}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                  >
                                    {creatingSubGroup === group.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                                    AI suggest
                                  </button>
                                </div>
                              </div>

                              {(subGroups[group.id] || []).map((sg) => (
                                <button
                                  key={sg.id}
                                  onClick={() => setActiveSubGroupId(sg.id)}
                                  className="w-full flex items-center gap-2.5 p-2.5 rounded-md bg-accent/30 hover:bg-accent/60 transition-colors text-left"
                                >
                                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                                    <GitBranch className="w-3 h-3 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-medium text-foreground truncate">{sg.title}</p>
                                    {sg.description && <p className="text-[10px] text-muted-foreground truncate">{sg.description}</p>}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">{sg.member_count} members</span>
                                  <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                                </button>
                              ))}

                              <div className="flex items-center gap-2">
                                <input
                                  value={subGroupInput[group.id] || ""}
                                  onChange={(e) => setSubGroupInput((prev) => ({ ...prev, [group.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && subGroupInput[group.id]?.trim()) {
                                      handleCreateSubGroup(group.id, subGroupInput[group.id].trim());
                                    }
                                  }}
                                  placeholder="Type to create a sub-group..."
                                  className="flex-1 text-[11px] px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-ring/50"
                                />
                                <button
                                  onClick={() => {
                                    if (subGroupInput[group.id]?.trim()) {
                                      handleCreateSubGroup(group.id, subGroupInput[group.id].trim());
                                    }
                                  }}
                                  disabled={!subGroupInput[group.id]?.trim() || creatingSubGroup === group.id}
                                  className="text-[10px] px-2 py-1.5 rounded-md bg-foreground text-background disabled:opacity-30 hover:opacity-80 transition-opacity"
                                >
                                  Create
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              {themeGroups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-lg">
                  <Palette className="w-6 h-6 text-muted-foreground/40 mb-2" />
                  <p className="text-[12px] text-muted-foreground">No theme groups yet. Ask the DumpStash AI to create one!</p>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

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

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Create Group</DialogTitle>
            <DialogDescription className="text-[12px]">Create your own idea group manually.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <input
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              placeholder="Group title..."
              className="w-full text-[13px] px-3 py-2 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50"
            />
            <textarea
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full text-[13px] px-3 py-2 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateGroup(false)} className="px-3 py-1.5 rounded-md text-[12px] text-muted-foreground hover:bg-accent transition-colors">Cancel</button>
              <button
                onClick={handleManualCreateGroup}
                disabled={!newGroupTitle.trim()}
                className="px-4 py-1.5 rounded-md text-[12px] font-medium bg-foreground text-background hover:opacity-80 disabled:opacity-30 transition-opacity"
              >
                Create
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Sub-Group Dialog */}
      <Dialog open={!!showCreateSubGroup} onOpenChange={(open) => !open && setShowCreateSubGroup(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Create Sub-group</DialogTitle>
            <DialogDescription className="text-[12px]">Create a sub-group manually within this group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <input
              value={newSubGroupTitle}
              onChange={(e) => setNewSubGroupTitle(e.target.value)}
              placeholder="Sub-group title..."
              className="w-full text-[13px] px-3 py-2 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50"
            />
            <textarea
              value={newSubGroupDesc}
              onChange={(e) => setNewSubGroupDesc(e.target.value)}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full text-[13px] px-3 py-2 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateSubGroup(null)} className="px-3 py-1.5 rounded-md text-[12px] text-muted-foreground hover:bg-accent transition-colors">Cancel</button>
              <button
                onClick={() => showCreateSubGroup && handleManualCreateSubGroup(showCreateSubGroup)}
                disabled={!newSubGroupTitle.trim()}
                className="px-4 py-1.5 rounded-md text-[12px] font-medium bg-foreground text-background hover:opacity-80 disabled:opacity-30 transition-opacity"
              >
                Create
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member to Group Dialog */}
      <Dialog open={!!showAddMember} onOpenChange={(open) => !open && setShowAddMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] flex items-center gap-2"><UserPlus className="w-4 h-4" /> Add Member</DialogTitle>
            <DialogDescription className="text-[12px]">Search users to add to this group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={memberSearch}
                onChange={(e) => searchMembers(e.target.value)}
                placeholder="Search by name..."
                className="w-full text-[13px] pl-8 pr-3 py-2 rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50"
              />
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {memberResults.map((m) => (
                <button
                  key={m.user_id}
                  onClick={() => showAddMember && addMemberToGroup(showAddMember, m.user_id)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                    {m.avatar_initials || "??"}
                  </div>
                  <span className="text-[12px] font-medium text-foreground">{m.display_name || "User"}</span>
                </button>
              ))}
              {memberSearch.length >= 2 && memberResults.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-4">No users found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Floating AI Bot Button */}
      <motion.button
        onClick={() => setShowAIChat((p) => !p)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105",
          showAIChat ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
        )}
        whileTap={{ scale: 0.9 }}
      >
        {showAIChat ? <X className="w-5 h-5" /> : <img src={dumpstashBot} alt="DumpStash AI" className="w-10 h-10 rounded-full" />}
      </motion.button>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {showAIChat && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[500px] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3 border-b border-border bg-accent/30">
              <img src={dumpstashBot} alt="DumpStash AI" className="w-8 h-8 rounded-full" />
              <div>
                <h4 className="text-[13px] font-semibold text-foreground">DumpStash AI</h4>
                <p className="text-[10px] text-muted-foreground">Ask me to create groups, sub-groups & more</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[340px]">
              {aiMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <img src={dumpstashBot} alt="DumpStash AI" className="w-16 h-16 mb-3 opacity-60" />
                  <p className="text-[12px] text-muted-foreground">Hey! I'm DumpStash AI 🤖</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1 max-w-[260px]">
                    Try: "Create a group called Web3 Gaming with Minato and thiru, and add a sub-group called Token Design"
                  </p>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <img src={dumpstashBot} alt="AI" className="w-6 h-6 rounded-full shrink-0 mt-0.5" />
                  )}
                  <div className={cn(
                    "rounded-lg px-3 py-2 max-w-[280px] text-[12px] leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent/50 text-foreground border border-border"
                  )}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_p]:text-[12px] [&_strong]:text-foreground">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex gap-2">
                  <img src={dumpstashBot} alt="AI" className="w-6 h-6 rounded-full shrink-0" />
                  <div className="rounded-lg px-3 py-2 bg-accent/50 border border-border">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={aiChatEndRef} />
            </div>
            <div className="border-t border-border p-2 flex items-center gap-2">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAIMessage(); } }}
                placeholder="Ask DumpStash AI..."
                className="flex-1 text-[12px] px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50"
              />
              <button
                onClick={sendAIMessage}
                disabled={!aiInput.trim() || aiLoading}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-30 hover:opacity-80 transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialModeView;
