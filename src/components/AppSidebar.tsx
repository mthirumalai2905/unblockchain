import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, MessageSquare, Brain, CheckSquare, Lightbulb,
  HelpCircle, Clock, Archive, ChevronDown, Plus, Search,
  Command, LogOut, FileText, Trash2, Camera, Loader2, ListTodo, Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Map } from "lucide-react";
import { useWorkspace, ViewSection } from "@/store/WorkspaceStore";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import UserAvatar from "@/components/UserAvatar";
import { toast } from "sonner";

const navItems: { id: ViewSection; label: string; icon: typeof Brain }[] = [
  { id: "dumps", label: "Brain Dump", icon: MessageSquare },
  { id: "structures", label: "AI Insights", icon: Brain },
  { id: "actions", label: "Actions", icon: CheckSquare },
  { id: "personal", label: "Personal", icon: ListTodo },
  { id: "themes", label: "Themes", icon: Lightbulb },
  { id: "questions", label: "Questions", icon: HelpCircle },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "draft", label: "Draft PRD", icon: FileText },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "archive", label: "Archive", icon: Archive },
];

interface AppSidebarProps {
  onSearchOpen?: () => void;
}

const AppSidebar = ({ onSearchOpen }: AppSidebarProps) => {
  const {
    activeSection, setActiveSection, actions, questions, themes, dumps,
    sessions, activeSessionId, switchSession, createSession, deleteSession,
    archiveSession,
  } = useWorkspace();
  const { signOut, user } = useAuth();
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userProfile, setUserProfile] = useState<{ display_name: string; avatar_initials: string; avatar_url: string | null } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("display_name, avatar_initials, avatar_url").eq("user_id", user.id).single();
    if (data) setUserProfile(data as any);
  }, [user]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
      setUserProfile((prev) => prev ? { ...prev, avatar_url: avatarUrl } : null);
      toast.success("Profile picture updated!");
    } catch (err: any) {
      toast.error("Failed to upload: " + (err.message || "Unknown error"));
    }
    setUploadingAvatar(false);
  };

  const activeSessions = sessions.filter((s) => s.is_active);
  // Identify shared sessions (not owned by current user)
  const ownSessions = activeSessions.filter((s) => (s as any).user_id === user?.id || !(s as any).user_id);
  const sharedSessions = activeSessions.filter((s) => (s as any).user_id && (s as any).user_id !== user?.id);

  const counts: Partial<Record<ViewSection, number>> = {
    dumps: dumps.length,
    actions: actions.filter((a) => !a.done).length,
    themes: themes.length,
    questions: questions.filter((q) => !q.answered).length,
    archive: sessions.filter((s) => !s.is_active).length,
  };

  const handleCreateSession = () => {
    if (isCreating && newSessionName.trim()) {
      createSession(newSessionName.trim());
      setNewSessionName("");
      setIsCreating(false);
    } else {
      setIsCreating(true);
    }
  };

  const renderSessionList = (sessionList: typeof sessions, label?: string) => (
    <>
      {label && sessionList.length > 0 && (
        <p className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted flex items-center gap-1.5">
          <Share2 className="w-3 h-3" /> {label}
        </p>
      )}
      {sessionList.map((session) => {
        const isActive = session.id === activeSessionId;
        return (
          <div
            key={session.id}
            className={cn(
              "flex items-center rounded-md transition-colors group",
              isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
            )}
          >
            <button onClick={() => switchSession(session.id)} className="flex-1 text-left px-2.5 py-2 min-w-0">
              <div className="flex items-center justify-between">
                <span className={cn("text-[13px] truncate", isActive ? "text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground")}>
                  {session.name}
                </span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cf-decision shrink-0 ml-1" />}
              </div>
            </button>
            {!label && (
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all mr-1">
                <button onClick={(e) => { e.stopPropagation(); archiveSession(session.id); }} className="p-1 rounded text-muted-foreground/30 hover:text-cf-question transition-colors" title="Archive"><Archive className="w-3 h-3" /></button>
                <button onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} className="p-1 rounded text-muted-foreground/30 hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-3 h-3" /></button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <aside className="w-[240px] h-screen flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 select-none">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-sidebar-border">
        <a href="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-background" />
          </div>
          <span className="text-sm font-semibold text-sidebar-primary tracking-tight">DumpStash</span>
        </a>
        <div className="ml-auto"><ThemeToggle /></div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onSearchOpen}
          className="w-full flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-sidebar-muted rounded-md border border-sidebar-border hover:border-sidebar-muted/30 transition-colors bg-sidebar-accent/50"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <div className="ml-auto flex items-center gap-0.5 text-[10px] font-mono text-sidebar-muted">
            <Command className="w-2.5 h-2.5" />K
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-2 space-y-px">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const count = counts[item.id];
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] rounded-md transition-all duration-150",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-foreground")} />
              <span className="truncate">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span className={cn("ml-auto text-[11px] font-mono tabular-nums", isActive ? "text-sidebar-accent-foreground/60" : "text-sidebar-muted")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mx-3 my-1 h-px bg-sidebar-border" />

      {/* Sessions */}
      <div className="px-2 flex-1 min-h-0 overflow-y-auto cf-scrollbar">
        <button
          onClick={() => setSessionsOpen(!sessionsOpen)}
          className="w-full flex items-center gap-1 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", !sessionsOpen && "-rotate-90")} />
          Sessions
          <span className="ml-auto text-[10px] font-mono">{activeSessions.length}</span>
        </button>
        <AnimatePresence>
          {sessionsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden space-y-px"
            >
              {renderSessionList(ownSessions)}
              {renderSessionList(sharedSessions, "Shared with me")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Session + Profile */}
      <div className="p-3 space-y-2 border-t border-sidebar-border">
        <AnimatePresence>
          {isCreating && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <input
                autoFocus
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateSession(); if (e.key === "Escape") setIsCreating(false); }}
                placeholder="Session name..."
                className="w-full px-3 py-2 text-[13px] rounded-md bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50 transition-colors mb-2"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={handleCreateSession}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          {isCreating ? "Create" : "New Session"}
        </button>

        {/* Profile */}
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative w-8 h-8 rounded-full shrink-0 overflow-hidden group hover:ring-2 hover:ring-primary/30 transition-all"
          >
            <UserAvatar avatarUrl={userProfile?.avatar_url} initials={userProfile?.avatar_initials || "??"} size="md" className="w-8 h-8" />
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin text-foreground" /> : <Camera className="w-3 h-3 text-foreground" />}
            </div>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-sidebar-foreground truncate">{userProfile?.display_name || "User"}</p>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
