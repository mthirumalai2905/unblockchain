import { motion } from "framer-motion";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceStore";
import DumpCard from "@/components/DumpCard";
import { cn } from "@/lib/utils";

const ThemesView = () => {
  const { themes, selectedThemeId, selectTheme, getDumpsForTheme, setActiveSection } = useWorkspace();

  if (selectedThemeId) {
    const theme = themes.find((t) => t.id === selectedThemeId);
    if (!theme) return null;
    const relatedDumps = getDumpsForTheme(selectedThemeId);

    return (
      <div className="max-w-3xl space-y-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={() => selectTheme(null)}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Themes
          </button>

          <div className="p-5 rounded-lg bg-card border border-border cf-shadow-md mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">{theme.title}</h2>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {theme.tags.map((tag) => (
                <span key={tag} className="px-2 py-[2px] text-[11px] font-mono rounded bg-accent text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
              <span>{theme.confidence}% confidence</span>
              <span>{theme.dumpIds.length} related dumps</span>
            </div>
          </div>

          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3 px-0.5">
            Related Dumps
          </h3>
          <div className="space-y-1.5">
            {relatedDumps.map((dump, i) => (
              <DumpCard key={dump.id} dump={dump} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-2 px-0.5 mb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">All Themes</h3>
        <span className="text-[11px] font-mono text-muted-foreground/50">{themes.length}</span>
      </div>

      {themes.map((theme, i) => {
        const dumps = getDumpsForTheme(theme.id);
        return (
          <motion.button
            key={theme.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => selectTheme(theme.id)}
            className="w-full text-left p-4 rounded-lg bg-card border border-border hover:border-ring/30 transition-all group cursor-pointer hover:cf-shadow-md"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-[14px] font-medium text-foreground">{theme.title}</h4>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {theme.tags.map((tag) => (
                <span key={tag} className="px-2 py-[2px] text-[10px] font-mono rounded bg-accent text-muted-foreground">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {/* Mini avatars of contributors */}
              <div className="flex -space-x-1.5">
                {[...new Set(dumps.map((d) => d.avatar))].slice(0, 4).map((av) => (
                  <div key={av} className="w-5 h-5 rounded-full bg-accent border border-card flex items-center justify-center text-[8px] font-semibold text-muted-foreground">
                    {av}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground/50 font-mono">
                {theme.dumpIds.length} dumps · {theme.confidence}% confidence
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ThemesView;
