import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────

export type DumpType = "idea" | "decision" | "question" | "blocker" | "action" | "note";

export interface Dump {
  id: string;
  content: string;
  author: string;
  avatar: string;
  timestamp: string;
  type: DumpType;
  themeIds: string[];
  reactions: number;
  replies: number;
}

export interface Theme {
  id: string;
  title: string;
  tags: string[];
  confidence: number;
  dumpIds: string[];
}

export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  priority: "high" | "medium" | "low";
  done: boolean;
  sourceDumpIds: string[];
}

export interface Question {
  id: string;
  text: string;
  votes: number;
  answered: boolean;
  sourceDumpIds: string[];
}

export interface Risk {
  id: string;
  text: string;
  severity: "high" | "medium" | "low";
  sourceDumpIds: string[];
}

export interface GeneratedDoc {
  id: string;
  title: string;
  status: "draft" | "reviewed" | "published";
  lastUpdated: string;
  sourceDumpIds: string[];
  content: string;
}

export type ViewSection = "dumps" | "structures" | "actions" | "themes" | "questions" | "timeline" | "archive";

interface WorkspaceState {
  dumps: Dump[];
  themes: Theme[];
  actions: ActionItem[];
  questions: Question[];
  risks: Risk[];
  docs: GeneratedDoc[];
  activeSection: ViewSection;
  selectedThemeId: string | null;
  selectedDumpId: string | null;
  isProcessing: boolean;
  showAIPanel: boolean;
}

interface WorkspaceActions {
  addDump: (content: string) => void;
  setActiveSection: (section: ViewSection) => void;
  selectTheme: (id: string | null) => void;
  selectDump: (id: string | null) => void;
  toggleAction: (id: string) => void;
  voteQuestion: (id: string) => void;
  toggleAIPanel: () => void;
  getDumpsForTheme: (themeId: string) => Dump[];
  getDumpsForAction: (actionId: string) => Dump[];
  getThemesForDump: (dumpId: string) => Theme[];
}

const WorkspaceContext = createContext<(WorkspaceState & WorkspaceActions) | null>(null);

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};

// ─── Initial Data ───────────────────────────────────────

const initialDumps: Dump[] = [
  { id: "d1", content: "We need to figure out pricing for enterprise tier. Current thinking is somewhere between $50-100/user/month based on the value we deliver.", author: "Marcus Chen", avatar: "MC", timestamp: "2 min ago", type: "idea", themeIds: ["t1", "t3"], reactions: 3, replies: 2 },
  { id: "d2", content: "Sarah mentioned competitors charge $50/user/month but their AI capabilities are way behind ours. We have a genuine differentiator here.", author: "Alex Rivera", avatar: "AR", timestamp: "5 min ago", type: "note", themeIds: ["t1"], reactions: 1, replies: 0 },
  { id: "d3", content: "Our costs are higher because of AI processing — roughly $12/user/month in compute. Need to factor this into any pricing model.", author: "Jordan Lee", avatar: "JL", timestamp: "7 min ago", type: "blocker", themeIds: ["t1"], reactions: 2, replies: 1 },
  { id: "d4", content: "Maybe start at $75 and see feedback? We can always adjust. Let's not overthink this — ship and iterate.", author: "Sarah Kim", avatar: "SK", timestamp: "10 min ago", type: "decision", themeIds: ["t1"], reactions: 5, replies: 3 },
  { id: "d5", content: "Need to check with finance team first before we commit to any pricing. They had concerns about margin targets last quarter.", author: "Marcus Chen", avatar: "MC", timestamp: "12 min ago", type: "action", themeIds: ["t1"], reactions: 0, replies: 0 },
  { id: "d6", content: "Launch target: end of Q2. That gives us about 10 weeks to finalize everything including billing integration.", author: "Alex Rivera", avatar: "AR", timestamp: "14 min ago", type: "note", themeIds: ["t2"], reactions: 0, replies: 0 },
  { id: "d7", content: "Worry: $75 might be too expensive for startups. Should we consider a startup-specific tier? Maybe $30/user with limited AI features?", author: "Jordan Lee", avatar: "JL", timestamp: "16 min ago", type: "question", themeIds: ["t1", "t3"], reactions: 4, replies: 2 },
  { id: "d8", content: "What if we do usage-based pricing for the AI features? Pay per dump processed rather than flat rate. More fair for smaller teams.", author: "Sarah Kim", avatar: "SK", timestamp: "18 min ago", type: "idea", themeIds: ["t1", "t3"], reactions: 2, replies: 0 },
  { id: "d9", content: "We should benchmark against Linear and Notion pricing. Both charge per seat but offer volume discounts. That model works well for teams.", author: "Marcus Chen", avatar: "MC", timestamp: "22 min ago", type: "idea", themeIds: ["t1"], reactions: 1, replies: 1 },
  { id: "d10", content: "The billing integration with Stripe should take about 2 weeks. We've done it before. No blockers on the eng side.", author: "Alex Rivera", avatar: "AR", timestamp: "25 min ago", type: "note", themeIds: ["t2"], reactions: 0, replies: 0 },
];

const initialThemes: Theme[] = [
  { id: "t1", title: "Enterprise Pricing Strategy", tags: ["pricing", "enterprise", "competitors"], confidence: 94, dumpIds: ["d1", "d2", "d3", "d4", "d5", "d7", "d8", "d9"] },
  { id: "t2", title: "Q2 Launch Timeline", tags: ["timeline", "launch", "engineering"], confidence: 88, dumpIds: ["d6", "d10"] },
  { id: "t3", title: "Startup Market Accessibility", tags: ["startups", "pricing tiers", "growth"], confidence: 79, dumpIds: ["d1", "d7", "d8"] },
];

const initialActions: ActionItem[] = [
  { id: "a1", text: "Validate pricing with finance team", owner: "Marcus", priority: "high", done: false, sourceDumpIds: ["d5"] },
  { id: "a2", text: "Prepare competitive analysis deck", owner: "Sarah", priority: "medium", done: false, sourceDumpIds: ["d2", "d9"] },
  { id: "a3", text: "Set up Stripe billing integration", owner: "Alex", priority: "medium", done: false, sourceDumpIds: ["d10"] },
  { id: "a4", text: "Draft startup tier proposal", owner: "Jordan", priority: "low", done: false, sourceDumpIds: ["d7", "d8"] },
  { id: "a5", text: "Schedule stakeholder pricing review", owner: "Unassigned", priority: "high", done: false, sourceDumpIds: ["d1", "d4"] },
];

const initialQuestions: Question[] = [
  { id: "q1", text: "Will $75/user/month price out startup customers?", votes: 4, answered: false, sourceDumpIds: ["d7"] },
  { id: "q2", text: "Should we offer annual billing discounts?", votes: 2, answered: false, sourceDumpIds: ["d9"] },
  { id: "q3", text: "What's our exact cost per user for AI processing?", votes: 3, answered: false, sourceDumpIds: ["d3"] },
  { id: "q4", text: "Is usage-based pricing feasible for our infrastructure?", votes: 1, answered: false, sourceDumpIds: ["d8"] },
];

const initialRisks: Risk[] = [
  { id: "r1", text: "Pricing may exclude startup market segment", severity: "medium", sourceDumpIds: ["d7"] },
  { id: "r2", text: "AI processing costs could increase with scale", severity: "high", sourceDumpIds: ["d3"] },
  { id: "r3", text: "Finance team may push back on margin targets", severity: "medium", sourceDumpIds: ["d5"] },
];

const initialDocs: GeneratedDoc[] = [
  { id: "doc1", title: "Enterprise Pricing Strategy Brief", status: "draft", lastUpdated: "2 min ago", sourceDumpIds: ["d1", "d2", "d3", "d4", "d5", "d7", "d8", "d9"], content: "## Proposed Pricing\n$75/user/month for enterprise tier\n\n## Rationale\n- Competitor benchmark: $50/user/month\n- Our AI costs: ~$12/user/month\n- Genuine differentiator in AI capabilities\n\n## Open Questions\n- Startup tier pricing?\n- Usage-based vs flat rate?\n\n## Next Steps\n- [ ] Validate with finance team\n- [ ] Competitive analysis\n- Timeline: End of Q2" },
  { id: "doc2", title: "Q2 Launch Checklist", status: "draft", lastUpdated: "5 min ago", sourceDumpIds: ["d6", "d10"], content: "## Timeline\n10 weeks until end of Q2\n\n## Engineering\n- Stripe billing integration (~2 weeks)\n- No blockers identified\n\n## Dependencies\n- Finance team sign-off on pricing\n- Competitive analysis complete" },
];

// ─── Provider ───────────────────────────────────────────

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [dumps, setDumps] = useState<Dump[]>(initialDumps);
  const [themes] = useState<Theme[]>(initialThemes);
  const [actions, setActions] = useState<ActionItem[]>(initialActions);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [risks] = useState<Risk[]>(initialRisks);
  const [docs] = useState<GeneratedDoc[]>(initialDocs);
  const [activeSection, setActiveSection] = useState<ViewSection>("dumps");
  const [selectedThemeId, selectTheme] = useState<string | null>(null);
  const [selectedDumpId, selectDump] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const addDump = useCallback((content: string) => {
    const newDump: Dump = {
      id: `d${Date.now()}`,
      content,
      author: "You",
      avatar: "YO",
      timestamp: "Just now",
      type: "note",
      themeIds: [],
      reactions: 0,
      replies: 0,
    };
    setDumps((prev) => [newDump, ...prev]);
    setIsProcessing(true);
    setTimeout(() => {
      setDumps((prev) =>
        prev.map((d) =>
          d.id === newDump.id ? { ...d, type: "idea", themeIds: ["t1"] } : d
        )
      );
      setIsProcessing(false);
    }, 2500);
  }, []);

  const toggleAction = useCallback((id: string) => {
    setActions((prev) => prev.map((a) => a.id === id ? { ...a, done: !a.done } : a));
  }, []);

  const voteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, votes: q.votes + 1 } : q));
  }, []);

  const toggleAIPanel = useCallback(() => setShowAIPanel((p) => !p), []);

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
    dumps, themes, actions, questions, risks, docs,
    activeSection, selectedThemeId, selectedDumpId, isProcessing, showAIPanel,
    addDump, setActiveSection, selectTheme, selectDump,
    toggleAction, voteQuestion, toggleAIPanel,
    getDumpsForTheme, getDumpsForAction, getThemesForDump,
  }), [dumps, themes, actions, questions, risks, docs, activeSection, selectedThemeId, selectedDumpId, isProcessing, showAIPanel, addDump, toggleAction, voteQuestion, toggleAIPanel, getDumpsForTheme, getDumpsForAction, getThemesForDump]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};
