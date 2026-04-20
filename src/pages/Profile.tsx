import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2, Pencil, Check, X, MessageSquare, Folder, Flame, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Profile {
  display_name: string | null;
  avatar_initials: string | null;
  avatar_url: string | null;
  bio: string | null;
  banner_url: string | null;
  created_at: string;
}

interface SessionInfo {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [dumpDates, setDumpDates] = useState<string[]>([]);
  const [dumpCount, setDumpCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [profileRes, sessionsRes, dumpsRes] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_initials, avatar_url, bio, banner_url, created_at").eq("user_id", user.id).maybeSingle(),
      supabase.from("sessions").select("id, name, created_at, updated_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("dumps").select("created_at").eq("user_id", user.id),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data as Profile);
      setNameDraft(profileRes.data.display_name || "");
      setBioDraft((profileRes.data as any).bio || "");
    }
    if (sessionsRes.data) setSessions(sessionsRes.data as SessionInfo[]);
    if (dumpsRes.data) {
      setDumpDates(dumpsRes.data.map((d: any) => d.created_at));
      setDumpCount(dumpsRes.data.length);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleImageUpload = async (file: File, kind: "avatar" | "banner") => {
    if (!user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${kind}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${publicUrl}?t=${Date.now()}`;
      const update = kind === "avatar" ? { avatar_url: url } : { banner_url: url };
      const { error: updErr } = await supabase.from("profiles").update(update).eq("user_id", user.id);
      if (updErr) throw updErr;
      setProfile((p) => p ? { ...p, ...update } : p);
      toast.success(`${kind === "avatar" ? "Profile picture" : "Banner"} updated!`);
    } catch (e: any) {
      toast.error("Upload failed: " + (e.message || "Unknown"));
    }
    setUploading(null);
  };

  const saveName = async () => {
    if (!user) return;
    const name = nameDraft.trim();
    if (!name) { toast.error("Name cannot be empty"); return; }
    const initials = name.slice(0, 2).toUpperCase();
    const { error } = await supabase.from("profiles").update({ display_name: name, avatar_initials: initials }).eq("user_id", user.id);
    if (error) { toast.error("Failed to save"); return; }
    setProfile((p) => p ? { ...p, display_name: name, avatar_initials: initials } : p);
    setEditingName(false);
    toast.success("Name updated");
  };

  const saveBio = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ bio: bioDraft }).eq("user_id", user.id);
    if (error) { toast.error("Failed to save"); return; }
    setProfile((p) => p ? { ...p, bio: bioDraft } : p);
    setEditingBio(false);
    toast.success("Bio updated");
  };

  // Build heatmap for last 12 weeks (84 days)
  const heatmap = useMemo(() => {
    const days = 84;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const counts = new Map<string, number>();
    for (const d of dumpDates) {
      const dt = new Date(d);
      dt.setHours(0, 0, 0, 0);
      const k = dt.toISOString().slice(0, 10);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const cells: { date: string; count: number; level: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = counts.get(key) || 0;
      const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4;
      cells.push({ date: key, count, level });
    }
    return cells;
  }, [dumpDates]);

  // Streak computation
  const streak = useMemo(() => {
    const set = new Set(dumpDates.map((d) => new Date(d).toISOString().slice(0, 10)));
    let s = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (set.has(d.toISOString().slice(0, 10))) s++;
      else if (i > 0) break;
    }
    return s;
  }, [dumpDates]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-[14px] font-semibold">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pb-16">
        {/* Banner */}
        <div className="relative group">
          <div
            className={cn(
              "h-48 sm:h-64 w-full overflow-hidden",
              !profile?.banner_url && "bg-gradient-to-br from-cf-idea/40 via-cf-decision/30 to-cf-question/40"
            )}
          >
            {profile?.banner_url && (
              <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover" />
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "banner")}
          />
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploading === "banner"}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-background/80 backdrop-blur-sm border border-border text-foreground hover:bg-background transition"
          >
            {uploading === "banner" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            <span>Edit banner</span>
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-4 sm:px-6 -mt-12 sm:-mt-14 relative">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-background overflow-hidden bg-accent flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.avatar_initials || "??"
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "avatar")}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading === "avatar"}
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition shadow-md"
              >
                {uploading === "avatar" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex-1 min-w-0 pb-2">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                    autoFocus
                    className="max-w-xs h-9"
                  />
                  <button onClick={saveName} className="p-1.5 rounded-md bg-foreground text-background hover:opacity-90"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setEditingName(false); setNameDraft(profile?.display_name || ""); }} className="p-1.5 rounded-md hover:bg-accent"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{profile?.display_name || "Unnamed"}</h2>
                  <button onClick={() => setEditingName(true)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Joined {memberSince}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bio</h3>
              {!editingBio && (
                <button onClick={() => setEditingBio(true)} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition">
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
            {editingBio ? (
              <div className="space-y-2">
                <Textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={saveBio}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingBio(false); setBioDraft(profile?.bio || ""); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-[13px] leading-[1.6] text-foreground/80 whitespace-pre-wrap">
                {profile?.bio || <span className="italic text-muted-foreground">No bio yet. Click the pencil to add one.</span>}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <StatCard icon={MessageSquare} label="Total dumps" value={dumpCount} />
            <StatCard icon={Folder} label="Sessions" value={sessions.length} />
            <StatCard icon={Flame} label="Day streak" value={streak} />
          </div>

          {/* Heatmap */}
          <div className="mt-8">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Activity · last 12 weeks</h3>
            <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
              <div className="grid grid-flow-col grid-rows-7 gap-[3px] w-fit">
                {heatmap.map((cell) => (
                  <div
                    key={cell.date}
                    title={`${cell.date}: ${cell.count} dump${cell.count === 1 ? "" : "s"}`}
                    className={cn(
                      "w-3 h-3 rounded-[3px] transition-colors",
                      cell.level === 0 && "bg-accent",
                      cell.level === 1 && "bg-cf-decision/30",
                      cell.level === 2 && "bg-cf-decision/55",
                      cell.level === 3 && "bg-cf-decision/80",
                      cell.level === 4 && "bg-cf-decision",
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-accent" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-cf-decision/30" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-cf-decision/55" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-cf-decision/80" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-cf-decision" />
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Sessions history */}
          <div className="mt-8">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Session history</h3>
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {sessions.length === 0 && (
                <p className="p-6 text-center text-[13px] text-muted-foreground">No sessions yet.</p>
              )}
              {sessions.map((s, i) => (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Created {new Date(s.created_at).toLocaleDateString()} · Updated {new Date(s.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground rotate-180" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: typeof MessageSquare; label: string; value: number }) => (
  <div className="rounded-lg border border-border bg-card p-4">
    <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-bold tabular-nums">{value}</p>
  </div>
);

export default ProfilePage;
