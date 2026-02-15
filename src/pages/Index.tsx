import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Eye, EyeOff, Sparkles, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import AppSidebar from "@/components/AppSidebar";
import DumpInput from "@/components/DumpInput";
import DumpCard, { Dump } from "@/components/DumpCard";
import AIStructuredView from "@/components/AIStructuredView";
import { mockDumps } from "@/data/mockDumps";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dumps");
  const [dumps, setDumps] = useState<Dump[]>(mockDumps);
  const [showAI, setShowAI] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNewDump = (content: string) => {
    const newDump: Dump = {
      id: String(Date.now()),
      content,
      author: "You",
      avatar: "YO",
      timestamp: "Just now",
      type: "note",
      aiDetected: false,
    };
    setDumps([newDump, ...dumps]);

    // Simulate AI processing
    setIsProcessing(true);
    setTimeout(() => {
      setDumps((prev) =>
        prev.map((d) =>
          d.id === newDump.id ? { ...d, aiDetected: true, type: "idea" as const } : d
        )
      );
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-foreground">Q2 Pricing Strategy</h1>
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-cf-decision/10 text-cf-decision">
              Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Online Users */}
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {["MC", "AR", "JL", "SK"].map((initials) => (
                  <div
                    key={initials}
                    className="w-7 h-7 rounded-full bg-accent border-2 border-card flex items-center justify-center text-[10px] font-semibold text-accent-foreground"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                <Users className="w-3 h-3 inline mr-0.5" />4 online
              </span>
            </div>

            {/* AI Toggle */}
            <button
              onClick={() => setShowAI(!showAI)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                showAI
                  ? "cf-gradient-primary text-primary-foreground cf-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {showAI ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showAI ? "AI View" : "Raw Dumps"}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {showAI ? (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-auto p-6"
              >
                <AIStructuredView />
              </motion.div>
            ) : (
              <motion.div
                key="dumps"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full overflow-auto p-6 space-y-4"
              >
                {/* Input */}
                <DumpInput onSubmit={handleNewDump} />

                {/* Processing indicator */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <Brain className="w-4 h-4 text-primary animate-pulse-soft" />
                    <span className="text-xs text-primary font-medium">AI is processing your dump...</span>
                  </motion.div>
                )}

                {/* Dumps List */}
                <div className="space-y-2">
                  {dumps.map((dump, i) => (
                    <DumpCard key={dump.id} dump={dump} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Index;
