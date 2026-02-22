import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";
import AppSidebar from "@/components/AppSidebar";
import DumpInput from "@/components/DumpInput";
import DumpCard from "@/components/DumpCard";
import AIStructuredView from "@/components/AIStructuredView";
import ThemesView from "@/components/ThemesView";
import ActionsView from "@/components/ActionsView";
import QuestionsView from "@/components/QuestionsView";
import TimelineView from "@/components/TimelineView";
import AISummaryPanel from "@/components/AISummaryPanel";
import DraftView from "@/components/DraftView";
import RoadmapView from "@/components/RoadmapView";
import ThinkingPanel from "@/components/ThinkingPanel";
import TwitterConnectorPanel from "@/components/TwitterConnectorPanel";

const DashboardContent = () => {
  const {
    dumps, activeSection, isProcessing, showAIPanel, toggleAIPanel, selectedDumpId, loading, sessions, activeSessionId,
    sidebarCollapsed, toggleSidebar, thinkingSteps, showThinking, closeThinking,
  } = useWorkspace();

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const filteredDumps = selectedDumpId
    ? dumps.filter((d) => d.id === selectedDumpId)
    : dumps;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "structures":
        return <AIStructuredView />;
      case "themes":
        return <ThemesView />;
      case "actions":
        return <ActionsView />;
      case "questions":
        return <QuestionsView />;
      case "timeline":
        return <TimelineView />;
      case "draft":
      case "roadmap":
      case "twitter":
        return null;
      case "archive":
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-[13px]">
            No archived sessions yet
          </div>
        );
      case "dumps":
      default:
        return (
          <div className="space-y-3">
            <DumpInput />

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-border bg-card"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-dot" />
                <span className="text-[12px] text-muted-foreground font-mono">Processing dump...</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              {filteredDumps.map((dump, i) => (
                <DumpCard key={dump.id} dump={dump} index={i} />
              ))}
              {dumps.length === 0 && !isProcessing && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-[13px] text-muted-foreground">No dumps yet. Start typing above!</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const isFullLayout = activeSection === "draft" || activeSection === "roadmap" || activeSection === "twitter";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="shrink-0 overflow-hidden"
          >
            <AppSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
            >
              {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <h1 className="text-[14px] font-semibold text-foreground">{activeSession?.name || "Untitled"}</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cf-decision" />
              <span className="text-[11px] font-mono text-muted-foreground">active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted-foreground font-mono">{dumps.length} dumps</span>
            <button
              onClick={toggleAIPanel}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border transition-all duration-150",
                showAIPanel
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-ring/50 hover:text-foreground"
              )}
            >
              <Brain className="w-3.5 h-3.5" />
              {showAIPanel ? "AI On" : "AI Off"}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {isFullLayout ? (
            <div className="flex-1 overflow-hidden">
              {activeSection === "draft" ? <DraftView /> : activeSection === "roadmap" ? <RoadmapView /> : <TwitterConnectorPanel />}
            </div>
          ) : (
            <div className="flex-1 overflow-auto cf-scrollbar">
              <div className="p-6 max-w-3xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection + (showAIPanel ? "-ai" : "") + activeSessionId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {showAIPanel && activeSection === "dumps" ? <AIStructuredView /> : renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showAIPanel && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="border-l border-border bg-sidebar shrink-0 overflow-hidden"
              >
                <AISummaryPanel />
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ThinkingPanel steps={thinkingSteps} isOpen={showThinking} onClose={closeThinking} />
    </div>
  );
};

export default DashboardContent;
