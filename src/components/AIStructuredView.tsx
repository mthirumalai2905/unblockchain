import { motion } from "framer-motion";
import {
  CheckSquare,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  FileText,
  ArrowRight,
  Check,
  X,
  Pencil,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AIStructuredView = () => {
  return (
    <div className="space-y-6">
      {/* AI Processing Status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20"
      >
        <div className="w-8 h-8 rounded-lg cf-gradient-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">AI has processed 12 dumps</p>
          <p className="text-xs text-muted-foreground">Last updated 2 minutes ago · 94% confidence</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-cf-decision animate-pulse-soft" />
      </motion.div>

      {/* Extracted Themes */}
      <Section title="Identified Themes" icon={Lightbulb} color="text-cf-idea">
        <ThemeCard
          title="Enterprise Pricing Strategy"
          dumpCount={4}
          confidence={92}
          tags={["pricing", "enterprise", "competitors"]}
        />
        <ThemeCard
          title="Product Launch Timeline"
          dumpCount={3}
          confidence={88}
          tags={["Q2", "launch", "milestones"]}
        />
        <ThemeCard
          title="Startup Market Concerns"
          dumpCount={2}
          confidence={76}
          tags={["startups", "accessibility", "pricing"]}
        />
      </Section>

      {/* Action Items */}
      <Section title="Action Items" icon={CheckSquare} color="text-cf-action">
        <ActionItem text="Validate pricing with finance team" owner="Unassigned" priority="high" />
        <ActionItem text="Prepare competitive analysis deck" owner="Sarah" priority="medium" />
        <ActionItem text="Schedule stakeholder review meeting" owner="Unassigned" priority="medium" />
        <ActionItem text="Draft enterprise tier feature comparison" owner="Alex" priority="low" />
      </Section>

      {/* Open Questions */}
      <Section title="Open Questions" icon={HelpCircle} color="text-cf-question">
        <QuestionItem text="Will $75/user/month price out startup customers?" votes={3} />
        <QuestionItem text="Should we offer a discount for annual billing?" votes={1} />
        <QuestionItem text="What's our cost per user for AI processing?" votes={2} />
      </Section>

      {/* Risks */}
      <Section title="Risks & Blockers" icon={AlertTriangle} color="text-cf-blocker">
        <RiskItem text="Pricing may exclude startup market segment" severity="medium" />
        <RiskItem text="AI processing costs could increase with scale" severity="high" />
      </Section>

      {/* Generated Document */}
      <Section title="Generated Documents" icon={FileText} color="text-foreground">
        <DocCard
          title="Enterprise Pricing Strategy Brief"
          status="draft"
          lastUpdated="2 min ago"
          sources={4}
        />
        <DocCard
          title="Q2 Launch Checklist"
          status="draft"
          lastUpdated="5 min ago"
          sources={3}
        />
      </Section>
    </div>
  );
};

const Section = ({ title, icon: Icon, color, children }: {
  title: string;
  icon: typeof Lightbulb;
  color: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-2"
  >
    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground px-1">
      <Icon className={cn("w-4 h-4", color)} />
      {title}
    </h3>
    <div className="space-y-2">{children}</div>
  </motion.div>
);

const ThemeCard = ({ title, dumpCount, confidence, tags }: {
  title: string;
  dumpCount: number;
  confidence: number;
  tags: string[];
}) => (
  <div className="group p-3.5 rounded-lg bg-card border border-border hover:border-cf-idea/30 cf-card-shadow transition-all">
    <div className="flex items-start justify-between mb-2">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <FeedbackButtons />
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      {tags.map((tag) => (
        <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-cf-idea/10 text-cf-idea">
          {tag}
        </span>
      ))}
      <span className="text-[10px] text-muted-foreground ml-auto">
        {dumpCount} dumps · {confidence}% confidence
      </span>
    </div>
  </div>
);

const ActionItem = ({ text, owner, priority }: {
  text: string;
  owner: string;
  priority: "high" | "medium" | "low";
}) => (
  <div className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-cf-action/30 cf-card-shadow transition-all">
    <div className={cn(
      "w-2 h-2 rounded-full shrink-0",
      priority === "high" && "bg-cf-blocker",
      priority === "medium" && "bg-cf-question",
      priority === "low" && "bg-cf-decision",
    )} />
    <span className="text-sm text-foreground flex-1">{text}</span>
    <span className="text-xs text-muted-foreground">{owner}</span>
    <FeedbackButtons />
  </div>
);

const QuestionItem = ({ text, votes }: { text: string; votes: number }) => (
  <div className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-cf-question/30 cf-card-shadow transition-all">
    <span className="text-sm text-foreground flex-1">{text}</span>
    <span className="text-xs text-muted-foreground">{votes} votes</span>
    <FeedbackButtons />
  </div>
);

const RiskItem = ({ text, severity }: { text: string; severity: "high" | "medium" | "low" }) => (
  <div className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-cf-blocker/30 cf-card-shadow transition-all">
    <div className={cn(
      "px-2 py-0.5 text-[10px] font-semibold uppercase rounded",
      severity === "high" ? "bg-cf-blocker/10 text-cf-blocker" : "bg-cf-question/10 text-cf-question"
    )}>
      {severity}
    </div>
    <span className="text-sm text-foreground flex-1">{text}</span>
    <FeedbackButtons />
  </div>
);

const DocCard = ({ title, status, lastUpdated, sources }: {
  title: string;
  status: string;
  lastUpdated: string;
  sources: number;
}) => (
  <div className="group flex items-center gap-3 p-3.5 rounded-lg bg-card border border-border hover:border-primary/20 cf-card-shadow transition-all cursor-pointer">
    <FileText className="w-4 h-4 text-primary shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground">{lastUpdated} · {sources} source dumps</div>
    </div>
    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-cf-question/10 text-cf-question uppercase">
      {status}
    </span>
    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const FeedbackButtons = () => (
  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
    <button className="p-1 rounded hover:bg-cf-decision/10 text-muted-foreground hover:text-cf-decision transition-colors">
      <Check className="w-3 h-3" />
    </button>
    <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
      <Pencil className="w-3 h-3" />
    </button>
    <button className="p-1 rounded hover:bg-cf-blocker/10 text-muted-foreground hover:text-cf-blocker transition-colors">
      <X className="w-3 h-3" />
    </button>
  </div>
);

export default AIStructuredView;
