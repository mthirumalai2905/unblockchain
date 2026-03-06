import { motion } from "framer-motion";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useWorkspace } from "@/store/WorkspaceStore";

const ArchiveView = () => {
  const { sessions, restoreSession, deleteSession } = useWorkspace();
  const archivedSessions = sessions.filter((s) => !s.is_active);

  if (archivedSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-3">
          <Archive className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-[13px] text-muted-foreground">No archived sessions</p>
        <p className="text-[11px] text-muted-foreground/50 mt-1">Archive sessions from the sidebar to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-0.5 mb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Archived Sessions</h3>
        <span className="text-[11px] font-mono text-muted-foreground/50">{archivedSessions.length}</span>
      </div>

      {archivedSessions.map((session, i) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-ring/30 transition-all group"
        >
          <div className="min-w-0 flex-1">
            <h4 className="text-[14px] font-medium text-foreground truncate">{session.name}</h4>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Archived · {new Date(session.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 ml-3">
            <button
              onClick={() => restoreSession(session.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-muted-foreground hover:text-foreground border border-border hover:border-ring/50 transition-all"
            >
              <ArchiveRestore className="w-3.5 h-3.5" />
              Restore
            </button>
            <button
              onClick={() => deleteSession(session.id)}
              className="p-1.5 rounded-md text-muted-foreground/30 hover:text-destructive transition-colors"
              title="Delete permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ArchiveView;
