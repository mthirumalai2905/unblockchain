import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const SessionActivityCalendar = () => {
  const { dumps, sessions, activeSessionId } = useWorkspace();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const countsByDay = useMemo(() => {
    const map = new Map<string, number>();
    dumps.forEach((d) => {
      const dt = new Date(d.created_at);
      const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [dumps]);

  const maxCount = useMemo(() => {
    let m = 0;
    countsByDay.forEach((v) => { if (v > m) m = v; });
    return m;
  }, [countsByDay]);

  const { year, month, daysInMonth, firstWeekday } = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    return {
      year: y,
      month: m,
      daysInMonth: new Date(y, m + 1, 0).getDate(),
      firstWeekday: new Date(y, m, 1).getDay(),
    };
  }, [cursor]);

  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const intensity = (count: number) => {
    if (!count) return 0;
    if (maxCount <= 1) return 4;
    const ratio = count / maxCount;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  };

  const cells: Array<{ day: number | null; count: number; level: number }> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, count: 0, level: 0 });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${month}-${d}`;
    const count = countsByDay.get(key) || 0;
    cells.push({ day: d, count, level: intensity(count) });
  }

  const monthTotal = useMemo(() => {
    let total = 0;
    countsByDay.forEach((v, k) => {
      const [y, m] = k.split("-").map(Number);
      if (y === year && m === month) total += v;
    });
    return total;
  }, [countsByDay, year, month]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-[12px] font-medium border border-border text-muted-foreground hover:border-ring/50 hover:text-foreground transition-all duration-150"
          title="Activity calendar"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Activity</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-0 overflow-hidden">
        <div className="px-4 pt-3.5 pb-2.5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Session activity</p>
              <p className="text-[12px] font-medium text-foreground truncate">{activeSession?.name || "Untitled"}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-[18px] font-semibold text-foreground leading-none">{monthTotal}</p>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono mt-1">dumps</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <p className="text-[12px] font-medium text-foreground">{MONTHS[month]} {year}</p>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className="text-center text-[9px] uppercase tracking-wider text-muted-foreground font-mono py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((c, i) => {
              if (c.day === null) return <div key={i} className="aspect-square" />;
              const todayCell = isToday(c.day);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, delay: i * 0.005 }}
                  title={`${c.count} dump${c.count === 1 ? "" : "s"}`}
                  className={cn(
                    "aspect-square rounded-md flex items-center justify-center text-[10px] font-mono relative cursor-default transition-all",
                    c.level === 0 && "bg-muted/40 text-muted-foreground/60",
                    c.level === 1 && "bg-cf-decision/20 text-foreground",
                    c.level === 2 && "bg-cf-decision/40 text-foreground",
                    c.level === 3 && "bg-cf-decision/65 text-background",
                    c.level === 4 && "bg-cf-decision text-background",
                    todayCell && "ring-1 ring-ring ring-offset-1 ring-offset-background"
                  )}
                >
                  {c.day}
                  {c.count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 text-[8px] font-mono px-1 rounded-full bg-foreground text-background leading-tight">
                      {c.count}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">Less</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted/40" />
              <div className="w-2.5 h-2.5 rounded-sm bg-cf-decision/20" />
              <div className="w-2.5 h-2.5 rounded-sm bg-cf-decision/40" />
              <div className="w-2.5 h-2.5 rounded-sm bg-cf-decision/65" />
              <div className="w-2.5 h-2.5 rounded-sm bg-cf-decision" />
            </div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">More</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SessionActivityCalendar;
