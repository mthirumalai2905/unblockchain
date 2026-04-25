import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity, Users, Eye, Zap, Trash2, Download, ArrowLeft, Loader2, Search,
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, subDays, startOfDay } from "date-fns";

type LogRow = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  event_name: string;
  category: string;
  route: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_size: string | null;
  language: string | null;
  timezone: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const COLORS = [
  "hsl(var(--foreground))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--foreground) / 0.7)",
  "hsl(var(--foreground) / 0.5)",
  "hsl(var(--foreground) / 0.35)",
  "hsl(var(--foreground) / 0.25)",
  "hsl(var(--foreground) / 0.15)",
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();

  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Redirect if not admin
  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) { navigate("/auth"); return; }
    if (!isAdmin) { toast.error("Admin access required"); navigate("/dashboard"); }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    const since = subDays(new Date(), days).toISOString();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) toast.error("Failed to load logs: " + error.message);
    setLogs((data as LogRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void fetchLogs();
  }, [isAdmin, days]);

  // Realtime subscription
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("audit_logs_admin")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_logs" }, (payload) => {
        setLogs((prev) => [payload.new as LogRow, ...prev].slice(0, 2000));
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [isAdmin]);

  // ─── Aggregates ────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (categoryFilter !== "all" && l.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${l.event_name} ${l.user_email ?? ""} ${l.route ?? ""} ${l.browser ?? ""} ${l.os ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, categoryFilter, search]);

  const stats = useMemo(() => {
    const uniqueUsers = new Set(logs.filter((l) => l.user_id).map((l) => l.user_id)).size;
    const pageViews = logs.filter((l) => l.event_name === "page_view").length;
    const today = startOfDay(new Date()).getTime();
    const todayCount = logs.filter((l) => new Date(l.created_at).getTime() >= today).length;
    return { total: logs.length, uniqueUsers, pageViews, todayCount };
  }, [logs]);

  const timeSeries = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      buckets[format(d, "MMM d")] = 0;
    }
    logs.forEach((l) => {
      const k = format(new Date(l.created_at), "MMM d");
      if (k in buckets) buckets[k]++;
    });
    return Object.entries(buckets).map(([date, count]) => ({ date, events: count }));
  }, [logs, days]);

  const tally = (key: keyof LogRow) => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      const v = (l[key] as string | null) ?? "Unknown";
      counts[v] = (counts[v] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  };

  const deviceData = useMemo(() => tally("device_type"), [logs]);
  const browserData = useMemo(() => tally("browser").slice(0, 6), [logs]);
  const osData = useMemo(() => tally("os").slice(0, 6), [logs]);
  const eventData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => { counts[l.event_name] = (counts[l.event_name] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const categories = useMemo(() => {
    const s = new Set<string>(logs.map((l) => l.category));
    return ["all", ...Array.from(s).sort()];
  }, [logs]);

  // ─── Actions ───────────────────────────────────────────
  const exportCsv = () => {
    const headers = ["created_at", "event_name", "category", "user_email", "route", "device_type", "browser", "os", "language", "timezone"];
    const rows = filteredLogs.map((l) => headers.map((h) => JSON.stringify((l as any)[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit_logs_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const purgeOld = async () => {
    if (!confirm(`Delete logs older than ${days} days?`)) return;
    const cutoff = subDays(new Date(), days).toISOString();
    const { error } = await supabase.from("audit_logs").delete().lt("created_at", cutoff);
    if (error) { toast.error(error.message); return; }
    toast.success("Old logs purged");
    void fetchLogs();
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-[15px] font-bold tracking-tight">Admin · Audit Console</h1>
              <p className="text-[11px] text-muted-foreground">Real-time activity across the entire workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-[12px] h-8 px-2.5 rounded-md border border-border bg-background hover:bg-accent transition-colors"
            >
              <option value={1}>Last 24h</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button onClick={exportCsv} className="text-[12px] h-8 px-3 rounded-md border border-border hover:bg-accent flex items-center gap-1.5 transition-colors">
              <Download className="w-3 h-3" /> Export
            </button>
            <button onClick={purgeOld} className="text-[12px] h-8 px-3 rounded-md border border-border hover:bg-accent text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors">
              <Trash2 className="w-3 h-3" /> Purge
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Activity className="w-4 h-4" />} label="Total events" value={stats.total} />
          <StatCard icon={<Users className="w-4 h-4" />} label="Unique users" value={stats.uniqueUsers} />
          <StatCard icon={<Eye className="w-4 h-4" />} label="Page views" value={stats.pageViews} />
          <StatCard icon={<Zap className="w-4 h-4" />} label="Today" value={stats.todayCount} />
        </div>

        {/* Time series */}
        <div className="rounded-xl border border-border bg-card/40 backdrop-blur-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold tracking-tight">Events over time</h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">Last {days} days</span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                />
                <Line type="monotone" dataKey="events" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--foreground))" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PieCard title="Devices" data={deviceData} />
          <PieCard title="Browsers" data={browserData} />
          <PieCard title="Operating systems" data={osData} />
        </div>

        {/* Top events bar */}
        <div className="rounded-xl border border-border bg-card/40 backdrop-blur-md p-6">
          <h2 className="text-[13px] font-semibold tracking-tight mb-4">Top events</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventData} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={140} />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" fill="hsl(var(--foreground))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live event feed */}
        <div className="rounded-xl border border-border bg-card/40 backdrop-blur-md overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
              <h2 className="text-[13px] font-semibold tracking-tight">Live event feed</h2>
              <span className="text-[10px] text-muted-foreground">({filteredLogs.length} of {logs.length})</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-[11px] h-7 px-2 rounded-md border border-border bg-background"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="text-[11px] h-7 pl-6 pr-2 rounded-md border border-border bg-background w-[180px]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[520px]">
            {loading && logs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-[12px]">Loading logs…</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-[12px]">No events match.</div>
            ) : (
              <table className="w-full text-[11px]">
                <thead className="bg-muted/30 text-muted-foreground uppercase tracking-[0.12em] text-[10px]">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Time</th>
                    <th className="text-left px-4 py-2 font-medium">Event</th>
                    <th className="text-left px-4 py-2 font-medium">Category</th>
                    <th className="text-left px-4 py-2 font-medium">User</th>
                    <th className="text-left px-4 py-2 font-medium">Route</th>
                    <th className="text-left px-4 py-2 font-medium">Device</th>
                    <th className="text-left px-4 py-2 font-medium">Browser</th>
                    <th className="text-left px-4 py-2 font-medium">OS</th>
                    <th className="text-left px-4 py-2 font-medium">TZ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 500).map((l) => (
                    <motion.tr
                      key={l.id}
                      initial={{ opacity: 0, backgroundColor: "hsl(var(--accent))" }}
                      animate={{ opacity: 1, backgroundColor: "transparent" }}
                      transition={{ duration: 0.6 }}
                      className="border-t border-border hover:bg-accent/40"
                    >
                      <td className="px-4 py-2 font-mono text-muted-foreground whitespace-nowrap">{format(new Date(l.created_at), "MMM d, HH:mm:ss")}</td>
                      <td className="px-4 py-2 font-medium">{l.event_name}</td>
                      <td className="px-4 py-2"><span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider border border-border">{l.category}</span></td>
                      <td className="px-4 py-2 text-muted-foreground truncate max-w-[180px]">{l.user_email ?? "anon"}</td>
                      <td className="px-4 py-2 font-mono text-muted-foreground truncate max-w-[140px]">{l.route ?? "—"}</td>
                      <td className="px-4 py-2 capitalize">{l.device_type ?? "—"}</td>
                      <td className="px-4 py-2">{l.browser ?? "—"}</td>
                      <td className="px-4 py-2">{l.os ?? "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground truncate max-w-[140px]">{l.timezone ?? "—"}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="rounded-xl border border-border bg-card/40 backdrop-blur-md p-5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      <span className="text-muted-foreground">{icon}</span>
    </div>
    <div className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</div>
  </div>
);

const PieCard = ({ title, data }: { title: string; data: { name: string; value: number }[] }) => (
  <div className="rounded-xl border border-border bg-card/40 backdrop-blur-md p-5">
    <h3 className="text-[12px] font-semibold tracking-tight mb-3">{title}</h3>
    <div className="h-[200px]">
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-[11px] text-muted-foreground">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              innerRadius={40} outerRadius={70}
              paddingAngle={2}
            >
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={1} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

export default Admin;
