import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { ThinkingStep } from "@/components/ThinkingPanel";

// ─── Types ──────────────────────────────────────────────

export type DumpType = "idea" | "decision" | "question" | "blocker" | "action" | "note";

export interface Session {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dump {
  id: string;
  session_id: string;
  content: string;
  type: DumpType;
  created_at: string;
  author: string;
  avatar: string;
}

export interface Theme {
  id: string;
  session_id: string;
  title: string;
  tags: string[];
  confidence: number;
  dumpIds: string[];
}

export interface ActionItem {
  id: string;
  session_id: string;
  text: string;
  owner: string;
  priority: "high" | "medium" | "low";
  done: boolean;
  sourceDumpIds: string[];
}

export interface Question {
  id: string;
  session_id: string;
  text: string;
  votes: number;
  answered: boolean;
  sourceDumpIds: string[];
}

export type ViewSection = "dumps" | "structures" | "actions" | "themes" | "questions" | "timeline" | "archive" | "draft" | "roadmap";

interface WorkspaceState {
  sessions: Session[];
  activeSessionId: string | null;
  dumps: Dump[];
  themes: Theme[];
  actions: ActionItem[];
  questions: Question[];
  activeSection: ViewSection;
  selectedThemeId: string | null;
  selectedDumpId: string | null;
  isProcessing: boolean;
  showAIPanel: boolean;
  loading: boolean;
  sidebarCollapsed: boolean;
  thinkingSteps: ThinkingStep[];
  showThinking: boolean;
}

interface WorkspaceActions {
  addDump: (content: string) => void;
  createSession: (name: string) => void;
  deleteSession: (id: string) => void;
  switchSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  setActiveSection: (section: ViewSection) => void;
  selectTheme: (id: string | null) => void;
  selectDump: (id: string | null) => void;
  toggleAction: (id: string) => void;
  voteQuestion: (id: string) => void;
  toggleAIPanel: () => void;
  getDumpsForTheme: (themeId: string) => Dump[];
  getDumpsForAction: (actionId: string) => Dump[];
  getThemesForDump: (dumpId: string) => Theme[];
  refreshSessionData: () => void;
  processAllDumps: () => void;
  toggleSidebar: () => void;
  closeThinking: () => void;
}

const WorkspaceContext = createContext<(WorkspaceState & WorkspaceActions) | null>(null);

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};

// ─── Provider ───────────────────────────────────────────

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [dumps, setDumps] = useState<Dump[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeSection, setActiveSection] = useState<ViewSection>("dumps");
  const [selectedThemeId, selectTheme] = useState<string | null>(null);
  const [selectedDumpId, selectDump] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [showThinking, setShowThinking] = useState(false);

  // Load sessions
  useEffect(() => {
    if (!user) return;
    const loadSessions = async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) { console.error(error); return; }
      if (data && data.length > 0) {
        setSessions(data as Session[]);
        setActiveSessionId(data[0].id);
      } else {
        // Create default session
        const { data: newSession, error: createErr } = await supabase
          .from("sessions")
          .insert({ user_id: user.id, name: "My First Session" })
          .select()
          .single();
        if (!createErr && newSession) {
          setSessions([newSession as Session]);
          setActiveSessionId(newSession.id);
        }
      }
      setLoading(false);
    };
    loadSessions();
  }, [user]);

  // Load session data when active session changes
  useEffect(() => {
    if (!activeSessionId || !user) return;
    const loadSessionData = async () => {
      const [dumpsRes, themesRes, actionsRes, questionsRes] = await Promise.all([
        supabase.from("dumps").select("*").eq("session_id", activeSessionId).order("created_at", { ascending: false }),
        supabase.from("themes").select("*").eq("session_id", activeSessionId),
        supabase.from("actions").select("*").eq("session_id", activeSessionId),
        supabase.from("questions").select("*").eq("session_id", activeSessionId),
      ]);

      if (dumpsRes.data) {
        // Get profiles for authors
        const userIds = [...new Set(dumpsRes.data.map((d: any) => d.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_initials")
          .in("user_id", userIds);
        const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

        setDumps(dumpsRes.data.map((d: any) => {
          const profile = profileMap.get(d.user_id) as any;
          return {
            id: d.id,
            session_id: d.session_id,
            content: d.content,
            type: d.type as DumpType,
            created_at: d.created_at,
            author: profile?.display_name || "Unknown",
            avatar: profile?.avatar_initials || "??",
          };
        }));
      }

      if (themesRes.data) {
        // Load dump-theme relations
        const themeIds = themesRes.data.map((t: any) => t.id);
        const { data: relations } = themeIds.length > 0
          ? await supabase.from("dump_themes").select("*").in("theme_id", themeIds)
          : { data: [] };

        setThemes(themesRes.data.map((t: any) => ({
          id: t.id,
          session_id: t.session_id,
          title: t.title,
          tags: t.tags || [],
          confidence: t.confidence || 0,
          dumpIds: (relations || []).filter((r: any) => r.theme_id === t.id).map((r: any) => r.dump_id),
        })));
      }

      if (actionsRes.data) {
        setActions(actionsRes.data.map((a: any) => ({
          id: a.id,
          session_id: a.session_id,
          text: a.text,
          owner: a.owner || "Unassigned",
          priority: a.priority as "high" | "medium" | "low",
          done: a.done,
          sourceDumpIds: a.source_dump_ids || [],
        })));
      }

      if (questionsRes.data) {
        setQuestions(questionsRes.data.map((q: any) => ({
          id: q.id,
          session_id: q.session_id,
          text: q.text,
          votes: q.votes,
          answered: q.answered,
          sourceDumpIds: q.source_dump_ids || [],
        })));
      }
    };
    loadSessionData();
  }, [activeSessionId, user]);

  const addDump = useCallback(async (content: string) => {
    if (!user || !activeSessionId) return;
    setIsProcessing(true);
    const { data, error } = await supabase
      .from("dumps")
      .insert({ session_id: activeSessionId, user_id: user.id, content, type: "note" })
      .select()
      .single();

    if (error) { toast.error("Failed to save dump"); setIsProcessing(false); return; }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_initials")
      .eq("user_id", user.id)
      .maybeSingle();

    const newDump: Dump = {
      id: data.id,
      session_id: data.session_id,
      content: data.content,
      type: data.type as DumpType,
      created_at: data.created_at,
      author: profile?.display_name || "You",
      avatar: profile?.avatar_initials || "YO",
    };
    setDumps((prev) => [newDump, ...prev]);

    // Update session timestamp
    await supabase.from("sessions").update({ updated_at: new Date().toISOString() }).eq("id", activeSessionId);
    setIsProcessing(false);
  }, [user, activeSessionId]);


  const createSession = useCallback(async (name: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("sessions")
      .insert({ user_id: user.id, name })
      .select()
      .single();
    if (error) { toast.error("Failed to create session"); return; }
    setSessions((prev) => [data as Session, ...prev]);
    setActiveSessionId(data.id);
    setDumps([]);
    setThemes([]);
    setActions([]);
    setQuestions([]);
    toast.success("Session created!");
  }, [user]);

  const switchSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setActiveSection("dumps");
    selectTheme(null);
    selectDump(null);
  }, []);

  const renameSession = useCallback(async (id: string, name: string) => {
    const { error } = await supabase.from("sessions").update({ name }).eq("id", id);
    if (!error) {
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, name } : s));
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    // Delete related data first
    await Promise.all([
      supabase.from("dumps").delete().eq("session_id", id),
      supabase.from("themes").delete().eq("session_id", id),
      supabase.from("actions").delete().eq("session_id", id),
      supabase.from("questions").delete().eq("session_id", id),
    ]);
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) { toast.error("Failed to delete session"); return; }
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (id === activeSessionId && remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else if (remaining.length === 0) {
        setActiveSessionId(null);
      }
      return remaining;
    });
    toast.success("Session deleted");
  }, [activeSessionId]);

  const refreshSessionData = useCallback(async () => {
    if (!activeSessionId || !user) return;
    const [dumpsRes, themesRes, actionsRes, questionsRes] = await Promise.all([
      supabase.from("dumps").select("*").eq("session_id", activeSessionId).order("created_at", { ascending: false }),
      supabase.from("themes").select("*").eq("session_id", activeSessionId),
      supabase.from("actions").select("*").eq("session_id", activeSessionId),
      supabase.from("questions").select("*").eq("session_id", activeSessionId),
    ]);
    if (dumpsRes.data) {
      const userIds = [...new Set(dumpsRes.data.map((d: any) => d.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_initials").in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
      setDumps(dumpsRes.data.map((d: any) => {
        const profile = profileMap.get(d.user_id) as any;
        return { id: d.id, session_id: d.session_id, content: d.content, type: d.type as DumpType, created_at: d.created_at, author: profile?.display_name || "Unknown", avatar: profile?.avatar_initials || "??" };
      }));
    }
    if (themesRes.data) {
      const themeIds = themesRes.data.map((t: any) => t.id);
      const { data: relations } = themeIds.length > 0 ? await supabase.from("dump_themes").select("*").in("theme_id", themeIds) : { data: [] };
      setThemes(themesRes.data.map((t: any) => ({ id: t.id, session_id: t.session_id, title: t.title, tags: t.tags || [], confidence: t.confidence || 0, dumpIds: (relations || []).filter((r: any) => r.theme_id === t.id).map((r: any) => r.dump_id) })));
    }
    if (actionsRes.data) {
      setActions(actionsRes.data.map((a: any) => ({ id: a.id, session_id: a.session_id, text: a.text, owner: a.owner || "Unassigned", priority: a.priority as "high" | "medium" | "low", done: a.done, sourceDumpIds: a.source_dump_ids || [] })));
    }
    if (questionsRes.data) {
      setQuestions(questionsRes.data.map((q: any) => ({ id: q.id, session_id: q.session_id, text: q.text, votes: q.votes, answered: q.answered, sourceDumpIds: q.source_dump_ids || [] })));
    }
  }, [activeSessionId, user]);

  const processAllDumps = useCallback(async () => {
    if (!user || !activeSessionId) return;
    setIsProcessing(true);
    const unprocessed = dumps.filter((d) => d.type === "note");
    const toProcess = unprocessed.length > 0 ? unprocessed : dumps;

    // Initialize thinking steps
    const initialSteps: ThinkingStep[] = toProcess.map((d) => ({
      dumpId: d.id,
      dumpContent: d.content,
      status: "pending" as const,
      reasoning: [],
    }));
    setThinkingSteps(initialSteps);
    setShowThinking(true);

    try {
      for (let i = 0; i < toProcess.length; i++) {
        const dump = toProcess[i];
        // Mark current as processing
        setThinkingSteps((prev) =>
          prev.map((s, idx) => idx === i ? { ...s, status: "processing" as const } : s)
        );

        try {
          const resp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-dump`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ dump_id: dump.id, session_id: activeSessionId, user_id: user.id }),
            }
          );
          const data = await resp.json();

          if (data.success && data.result) {
            const r = data.result;
            setThinkingSteps((prev) =>
              prev.map((s, idx) =>
                idx === i
                  ? {
                      ...s,
                      status: "done" as const,
                      reasoning: r.reasoning || ["Analysis complete"],
                      result: {
                        type: r.type || "note",
                        actionsCount: r.actions?.length || 0,
                        questionsCount: r.questions?.length || 0,
                        themesCount: r.themes?.length || 0,
                      },
                    }
                  : s
              )
            );
          } else {
            setThinkingSteps((prev) =>
              prev.map((s, idx) => idx === i ? { ...s, status: "error" as const, reasoning: [data.error || "Failed"] } : s)
            );
          }
        } catch {
          setThinkingSteps((prev) =>
            prev.map((s, idx) => idx === i ? { ...s, status: "error" as const, reasoning: ["Network error"] } : s)
          );
        }
      }
      await refreshSessionData();
      toast.success(`Processed ${toProcess.length} dumps with AI`);
    } catch (e) {
      console.error("AI processing failed:", e);
      toast.error("AI processing failed");
    }
    setIsProcessing(false);
  }, [user, activeSessionId, dumps, refreshSessionData]);

  const toggleAction = useCallback(async (id: string) => {
    const action = actions.find((a) => a.id === id);
    if (!action) return;
    const { error } = await supabase.from("actions").update({ done: !action.done }).eq("id", id);
    if (!error) {
      setActions((prev) => prev.map((a) => a.id === id ? { ...a, done: !a.done } : a));
    }
  }, [actions]);

  const voteQuestion = useCallback(async (id: string) => {
    const q = questions.find((q) => q.id === id);
    if (!q) return;
    const { error } = await supabase.from("questions").update({ votes: q.votes + 1 }).eq("id", id);
    if (!error) {
      setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, votes: q.votes + 1 } : q));
    }
  }, [questions]);

  const toggleAIPanel = useCallback(() => setShowAIPanel((p) => !p), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((p) => !p), []);
  const closeThinking = useCallback(() => setShowThinking(false), []);

  const getDumpsForTheme = useCallback((themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme) return [];
    return dumps.filter((d) => theme.dumpIds.includes(d.id));
  }, [dumps, themes]);

  const getDumpsForAction = useCallback((actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    if (!action) return [];
    return dumps.filter((d) => action.sourceDumpIds.includes(d.id));
  }, [dumps, actions]);

  const getThemesForDump = useCallback((dumpId: string) => {
    return themes.filter((t) => t.dumpIds.includes(dumpId));
  }, [themes]);

  const value = useMemo(() => ({
    sessions, activeSessionId, dumps, themes, actions, questions,
    activeSection, selectedThemeId, selectedDumpId, isProcessing, showAIPanel, loading,
    sidebarCollapsed, thinkingSteps, showThinking,
    addDump, createSession, deleteSession, switchSession, renameSession,
    setActiveSection, selectTheme, selectDump,
    toggleAction, voteQuestion, toggleAIPanel, toggleSidebar, closeThinking,
    getDumpsForTheme, getDumpsForAction, getThemesForDump, refreshSessionData, processAllDumps,
  }), [sessions, activeSessionId, dumps, themes, actions, questions, activeSection, selectedThemeId, selectedDumpId, isProcessing, showAIPanel, loading, sidebarCollapsed, thinkingSteps, showThinking, addDump, createSession, deleteSession, switchSession, renameSession, toggleAction, voteQuestion, toggleAIPanel, toggleSidebar, closeThinking, getDumpsForTheme, getDumpsForAction, getThemesForDump, refreshSessionData, processAllDumps]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};
