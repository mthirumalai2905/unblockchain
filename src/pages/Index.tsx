import { motion, AnimatePresence } from "framer-motion";
import { Users, Eye, EyeOff, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceProvider, useWorkspace } from "@/store/WorkspaceStore";
import AppSidebar from "@/components/AppSidebar";
import DumpInput from "@/components/DumpInput";
import DumpCard from "@/components/DumpCard";
import AIStructuredView from "@/components/AIStructuredView";
import ThemesView from "@/components/ThemesView";
import ActionsView from "@/components/ActionsView";
import QuestionsView from "@/components/QuestionsView";
import TimelineView from "@/components/TimelineView";

const WorkspaceContent = () => {
  const {
    dumps, activeSection, isProcessing, showAIPanel, toggleAIPanel, selectedDumpId,
  } = useWorkspace();

  const filteredDumps = selectedDumpId
    ? dumps.filter((d) => d.id === selectedDumpId)
    : dumps;

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
      case "archive":
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-[13px]">
            No archived sessions yet
          </div>
        );
      case "dumps":
      default:
        return (
          <div className="space-y-3 max-w-3xl">
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
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[14px] font-semibold text-foreground">Q2 Pricing Strategy</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cf-decision" />
              <span className="text-[11px] font-mono text-muted-foreground">active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Avatars */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {["MC", "AR", "JL", "SK"].map((initials) => (
                  <div
                    key={initials}
                    className="w-6 h-6 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[9px] font-semibold text-muted-foreground"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                <Users className="w-3 h-3 inline mr-0.5" />4
              </span>
            </div>

            {/* AI Toggle */}
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

        {/* Content */}
        <div className="flex-1 overflow-auto cf-scrollbar">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection + (showAIPanel ? "-ai" : "")}
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
      </main>
    </div>
  );
};

const Index = () => (
  <WorkspaceProvider>
    <WorkspaceContent />
  </WorkspaceProvider>
);

export default Index;
