import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MessageCircle, Clock, FileText, Send,
  Loader2, Sparkles, Users, ChevronRight, Map as MapIcon,
  Trash2, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const DUMPSTASH_AI_ID = "00000000-0000-0000-0000-000000000001";

type SubTab = "chat" | "timeline" | "draft" | "roadmap";

interface Message {
  id: string;
  content: string;
  user_id: string;
  author: string;
  avatar: string;
  created_at: string;
}

interface Draft {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface RoadmapPhase {
  title: string;
  description: string;
  deliverables: string[];
  duration: string;
  dependencies?: string[];
}

interface Roadmap {
  id: string;
  title: string;
  phases_json: RoadmapPhase[];
  created_at: string;
}

interface SubGroupInfo {
  id: string;
  title: string;
  description: string | null;
  group_id: string;
  parent_title: string;
  member_count: number;
}

const SubGroupView = () => {
  const { activeSubGroupId, setActiveSubGroupId } = useWorkspace();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SubTab>("chat");
  const [subGroup, setSubGroup] = useState<SubGroupInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [deleteVotes, setDeleteVotes] = useState<{ votes: number; total: number; hasVoted: boolean }>({ votes: 0, total: 0, hasVoted: false });
  const [votingInProgress, setVotingInProgress] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadSubGroup = useCallback(async () => {
    if (!activeSubGroupId) return;
    const { data: sg } = await supabase
      .from("sub_groups")
      .select("*")
      .eq("id", activeSubGroupId)
      .single();

    if (sg) {
      const { data: parentGroup } = await supabase
        .from("idea_groups")
        .select("title")
        .eq("id", sg.group_id)
        .single();

      const { count } = await supabase
        .from("sub_group_members")
        .select("*", { count: "exact", head: true })
        .eq("sub_group_id", activeSubGroupId);

      setSubGroup({
        id: sg.id,
        title: sg.title,
        description: sg.description,
        group_id: sg.group_id,
        parent_title: parentGroup?.title || "Unknown",
        member_count: count || 0,
      });
    }
  }, [activeSubGroupId]);

  const loadMessages = useCallback(async () => {
    if (!activeSubGroupId) return;
    const { data } = await supabase
      .from("sub_group_messages")
      .select("*")
      .eq("sub_group_id", activeSubGroupId)
      .order("created_at", { ascending: true });

    if (data) {
      const userIds = [...new Set(data.map((m: any) => m.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, avatar_initials").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      setMessages(data.map((m: any) => {
        const profile = profileMap.get(m.user_id) as any;
        return {
          id: m.id,
          content: m.content,
          user_id: m.user_id,
          author: profile?.display_name || "User",
          avatar: profile?.avatar_initials || "??",
          created_at: m.created_at,
        };
      }));
    }
  }, [activeSubGroupId]);

  const loadDrafts = useCallback(async () => {
    if (!activeSubGroupId) return;
    const { data } = await supabase
      .from("sub_group_drafts")
      .select("*")
      .eq("sub_group_id", activeSubGroupId)
      .order("created_at", { ascending: false });
    setDrafts((data || []) as Draft[]);
  }, [activeSubGroupId]);

  const loadRoadmaps = useCallback(async () => {
    if (!activeSubGroupId) return;
    const { data } = await supabase
      .from("sub_group_roadmaps")
      .select("*")
      .eq("sub_group_id", activeSubGroupId)
      .order("created_at", { ascending: false });
    setRoadmaps((data || []) as unknown as Roadmap[]);
  }, [activeSubGroupId]);

  const loadDeleteVotes = useCallback(async () => {
    if (!activeSubGroupId || !user) return;
    const [votesRes, membersRes] = await Promise.all([
      supabase.from("sub_group_delete_votes").select("*").eq("sub_group_id", activeSubGroupId),
      supabase.from("sub_group_members").select("*", { count: "exact", head: true }).eq("sub_group_id", activeSubGroupId),
    ]);
    const votes = (votesRes.data || []).filter((v: any) => v.vote === true);
    setDeleteVotes({
      votes: votes.length,
      total: membersRes.count || 0,
      hasVoted: votes.some((v: any) => v.user_id === user.id),
    });
  }, [activeSubGroupId, user]);

  useEffect(() => {
    loadSubGroup();
    loadMessages();
    loadDrafts();
    loadRoadmaps();
    loadDeleteVotes();
  }, [loadSubGroup, loadMessages, loadDrafts, loadRoadmaps, loadDeleteVotes]);

  // Realtime chat subscription
  useEffect(() => {
    if (!activeSubGroupId) return;
    const channel = supabase
      .channel(`sub-group-messages-${activeSubGroupId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "sub_group_messages",
        filter: `sub_group_id=eq.${activeSubGroupId}`,
      }, async (payload) => {
        const msg = payload.new as any;
        if (msg.user_id === user?.id) return; // already added optimistically
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_initials")
          .eq("user_id", msg.user_id)
          .maybeSingle();
        setMessages((prev) => [...prev, {
          id: msg.id,
          content: msg.content,
          user_id: msg.user_id,
          author: profile?.display_name || "User",
          avatar: profile?.avatar_initials || "??",
          created_at: msg.created_at,
        }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeSubGroupId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!msgInput.trim() || !user || !activeSubGroupId) return;
    const content = msgInput.trim();
    setMsgInput("");

    // Optimistic add
    const optimistic: Message = {
      id: crypto.randomUUID(),
      content,
      user_id: user.id,
      author: "You",
      avatar: "YO",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    const { error } = await supabase
      .from("sub_group_messages")
      .insert({ sub_group_id: activeSubGroupId, user_id: user.id, content });

    if (error) {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  const generateContent = async (type: "draft" | "roadmap") => {
    if (!user || !activeSubGroupId) return;
    setGenerating(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sub-group-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ sub_group_id: activeSubGroupId, user_id: user.id, type }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || "Generation failed");
      } else {
        toast.success(`${type === "draft" ? "PRD" : "Roadmap"} generated!`);
        if (type === "draft") await loadDrafts();
        else await loadRoadmaps();
      }
    } catch {
      toast.error("Generation failed");
    }
    setGenerating(false);
  };

  if (!subGroup) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabs: { id: SubTab; label: string; icon: typeof MessageCircle }[] = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "draft", label: "Draft PRD", icon: FileText },
    { id: "roadmap", label: "Roadmap", icon: MapIcon },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setActiveSubGroupId(null)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-foreground truncate">{subGroup.title}</h2>
            <p className="text-[11px] text-muted-foreground font-mono">
              {subGroup.parent_title} · {subGroup.member_count} members
            </p>
          </div>
        </div>
        {subGroup.description && (
          <p className="text-[12px] text-muted-foreground/70 mb-2">{subGroup.description}</p>
        )}
        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all",
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 overflow-auto cf-scrollbar p-4 space-y-2">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-[13px] text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isOwn = msg.user_id === user?.id;
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[9px] font-semibold text-muted-foreground shrink-0">
                        {msg.avatar}
                      </div>
                      <div className={cn(
                        "max-w-[75%] rounded-lg px-3 py-2",
                        isOwn ? "bg-foreground text-background" : "bg-accent"
                      )}>
                        {!isOwn && <p className="text-[10px] font-medium mb-0.5 opacity-70">{msg.author}</p>}
                        <p className="text-[12px] leading-relaxed">{msg.content}</p>
                        <p className={cn("text-[9px] mt-1 opacity-50", isOwn ? "text-right" : "")}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="shrink-0 border-t border-border p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message..."
                    className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!msgInput.trim()}
                    className="w-9 h-9 rounded-lg bg-foreground text-background flex items-center justify-center disabled:opacity-30 hover:opacity-80 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateContent("draft")}
                    disabled={generating}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-all"
                  >
                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Generate PRD
                  </button>
                  <button
                    onClick={() => generateContent("roadmap")}
                    disabled={generating}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-all"
                  >
                    {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapIcon className="w-3 h-3" />}
                    Generate Roadmap
                  </button>
                  <span className="text-[9px] text-muted-foreground/50 font-mono ml-auto">{messages.length} messages</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-auto cf-scrollbar p-4"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-4 px-0.5">
                Timeline
              </div>
              {messages.length === 0 ? (
                <p className="text-[12px] text-muted-foreground text-center py-8">No activity yet</p>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-1">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="relative flex items-start gap-3 p-3 rounded-lg hover:bg-card transition-colors group"
                      >
                        <div className="absolute left-[-19px] top-[18px] w-2.5 h-2.5 rounded-full border-2 border-background bg-primary" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-mono text-muted-foreground/50">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-[12px] font-medium text-muted-foreground">{msg.author}</span>
                          </div>
                          <p className="text-[13px] text-foreground/70 leading-relaxed truncate">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "draft" && (
            <motion.div
              key="draft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-auto cf-scrollbar p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-foreground">Draft PRDs</h3>
                <button
                  onClick={() => generateContent("draft")}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate PRD
                </button>
              </div>
              {drafts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">No PRDs yet. Generate one from your group's context.</p>
                </div>
              ) : (
                drafts.map((draft) => (
                  <div key={draft.id} className="rounded-lg border border-border bg-card p-4">
                    <h4 className="text-[14px] font-semibold text-foreground mb-3">{draft.title}</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-[12px]">
                      <ReactMarkdown>{draft.content}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "roadmap" && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-auto cf-scrollbar p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-foreground">Roadmaps</h3>
                <button
                  onClick={() => generateContent("roadmap")}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generate Roadmap
                </button>
              </div>
              {roadmaps.length === 0 ? (
                <div className="text-center py-12">
                  <MapIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground">No roadmaps yet. Generate one from your group's context.</p>
                </div>
              ) : (
                roadmaps.map((rm) => (
                  <div key={rm.id} className="space-y-3">
                    <h4 className="text-[14px] font-semibold text-foreground">{rm.title}</h4>
                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                      {(rm.phases_json || []).map((phase, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                          <div className="rounded-lg bg-card border border-border p-3">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-[12px] font-semibold text-foreground">{phase.title}</h5>
                              <span className="text-[10px] font-mono text-muted-foreground">{phase.duration}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-2">{phase.description}</p>
                            <div className="space-y-1">
                              {phase.deliverables?.map((d, j) => (
                                <div key={j} className="flex items-center gap-1.5">
                                  <ChevronRight className="w-2.5 h-2.5 text-primary shrink-0" />
                                  <span className="text-[11px] text-foreground/70">{d}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubGroupView;
