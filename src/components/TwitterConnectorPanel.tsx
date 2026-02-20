import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Twitter, Search, Hash, Calendar, Sliders, Zap, ChevronRight,
  TrendingUp, MessageSquare, Lightbulb, AlertCircle, CheckCircle2,
  Heart, Repeat2, ExternalLink, Brain, Target, Rocket, BarChart3,
  X, RefreshCw, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/store/WorkspaceStore";
import { Slider } from "@/components/ui/slider";

// ─── Types ──────────────────────────────────────────────

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author: { username: string; name: string; profile_image_url?: string };
  metrics: { like_count?: number; retweet_count?: number; reply_count?: number };
}

interface AIOutput {
  summary: string;
  themes: Array<{ title: string; description: string; tags: string[]; confidence: number; tweetCount?: number }>;
  actions: Array<{ text: string; priority: string; rationale?: string }>;
  questions: Array<{ text: string; importance?: string }>;
  opportunities: Array<{ title: string; description: string; potential: string }>;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  topInsights: string[];
  roadmapSuggestions: string[];
}

const TIMELINE_OPTIONS = [
  { value: "2months", label: "2 Months" },
  { value: "2years", label: "2 Years" },
  { value: "20years", label: "Max Range" },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "text-destructive bg-destructive/10 border-destructive/20",
  medium: "text-foreground/70 bg-foreground/10 border-border",
  low: "text-muted-foreground bg-muted/50 border-border",
};

// ─── Tag Input ───────────────────────────────────────────

const TagInput = ({
  values,
  onChange,
  placeholder,
  icon: Icon,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  icon: typeof Search;
}) => {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim().replace(/^[@#]/, "");
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background/50 focus-within:border-ring/50 transition-colors">
          <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
        </div>
        <button
          onClick={add}
          className="px-3 py-2 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground text-[12px] font-medium transition-colors border border-border"
        >
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-foreground/10 border border-border text-[12px] text-foreground font-mono"
            >
              {v}
              <button onClick={() => onChange(values.filter((x) => x !== v))}>
                <X className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Tweet Card ──────────────────────────────────────────

const TweetCard = ({ tweet, index }: { tweet: Tweet; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.2 }}
    className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors group"
  >
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-full bg-foreground/10 border border-border flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-foreground">
          {tweet.author.username.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[12px] font-semibold text-foreground">{tweet.author.name}</span>
          <span className="text-[11px] text-muted-foreground font-mono">@{tweet.author.username}</span>
        </div>
        <p className="text-[12px] text-foreground/80 leading-relaxed break-words">{tweet.text}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Heart className="w-3 h-3" />
            {(tweet.metrics.like_count || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Repeat2 className="w-3 h-3" />
            {(tweet.metrics.retweet_count || 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-muted-foreground ml-auto">
            {new Date(tweet.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

// ─── Insight Badge ────────────────────────────────────────

const InsightBadge = ({ icon: Icon, label, value, color }: { icon: typeof Brain; label: string; value: number | string; color: string }) => (
  <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border", color)}>
    <Icon className="w-3.5 h-3.5 shrink-0" />
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-[13px] font-semibold">{value}</div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────

const TwitterConnectorPanel = () => {
  const { user } = useAuth();
  const { activeSessionId, refreshSessionData } = useWorkspace();

  const [usernames, setUsernames] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [timelineRange, setTimelineRange] = useState("2months");
  const [tweetLimit, setTweetLimit] = useState([20]);
  const [analyzing, setAnalyzing] = useState(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [aiOutput, setAiOutput] = useState<AIOutput | null>(null);
  const [activeTab, setActiveTab] = useState<"tweets" | "insights" | "opportunities">("insights");
  const [hasResults, setHasResults] = useState(false);

  const canAnalyze = (usernames.length > 0 || hashtags.length > 0) && !analyzing;

  const handleAnalyze = useCallback(async () => {
    if (!user || !canAnalyze) return;
    setAnalyzing(true);
    setHasResults(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twitter-analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            usernames,
            hashtags,
            timelineRange,
            tweetLimit: tweetLimit[0],
            sessionId: activeSessionId,
          }),
        }
      );

      const data = await resp.json();

      if (!resp.ok || data.error) {
        throw new Error(data.error || "Analysis failed");
      }

      if (data.message) {
        toast.info(data.message);
        setAnalyzing(false);
        return;
      }

      setTweets(data.tweets || []);
      setAiOutput(data.aiOutput || null);
      setHasResults(true);

      if (activeSessionId) {
        await refreshSessionData();
        toast.success(`Analyzed ${data.tweets?.length || 0} tweets — insights added to session!`);
      } else {
        toast.success(`Analyzed ${data.tweets?.length || 0} tweets successfully!`);
      }
    } catch (e: any) {
      console.error("Twitter analyze error:", e);
      toast.error(e.message || "Failed to analyze tweets");
    }
    setAnalyzing(false);
  }, [user, usernames, hashtags, timelineRange, tweetLimit, activeSessionId, canAnalyze, refreshSessionData]);

  const handleReset = () => {
    setTweets([]);
    setAiOutput(null);
    setHasResults(false);
    setActiveTab("insights");
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-border flex items-center justify-center">
              <Twitter className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">Twitter Intelligence</h2>
              <p className="text-[11px] text-muted-foreground">Turn tweets into product insights</p>
            </div>
          </div>
          {hasResults && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] text-muted-foreground hover:text-foreground border border-border hover:border-ring/50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto cf-scrollbar">
        <AnimatePresence mode="wait">
          {!hasResults ? (
            /* ── Config Form ── */
            <motion.div
              key="config"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-5"
            >
              {/* Targets */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Target Accounts
                  </label>
                  <TagInput values={usernames} onChange={setUsernames} placeholder="@elonmusk, @sama..." icon={Search} />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Hashtags
                  </label>
                  <TagInput values={hashtags} onChange={setHashtags} placeholder="#ai, #startups..." icon={Hash} />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Timeline */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  <Calendar className="inline w-3 h-3 mr-1" />
                  Timeline Range
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIMELINE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTimelineRange(opt.value)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-[12px] font-medium border transition-all",
                        timelineRange === opt.value
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-muted-foreground border-border hover:border-ring/50 hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tweet Limit */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  <Sliders className="inline w-3 h-3 mr-1" />
                  Tweet Limit — <span className="text-foreground font-bold">{tweetLimit[0]}</span>
                </label>
                <Slider
                  min={10}
                  max={100}
                  step={10}
                  value={tweetLimit}
                  onValueChange={setTweetLimit}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Note */}
              {activeSessionId && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-foreground/5 border border-border">
                  <Zap className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Insights will be automatically added to your active session as themes, actions, and questions.
                  </p>
                </div>
              )}

              {/* Analyze button */}
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-semibold transition-all duration-200",
                  canAnalyze
                    ? "bg-foreground text-background hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {analyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.div>
                    Analyzing tweets...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Analyze Tweets
                  </>
                )}
              </button>

              {!canAnalyze && !analyzing && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Add at least one username or hashtag to proceed
                </p>
              )}
            </motion.div>
          ) : (
            /* ── Results ── */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col"
            >
              {/* Stats bar */}
              {aiOutput && (
                <div className="px-6 pt-4 pb-3 grid grid-cols-3 gap-2">
                  <InsightBadge icon={MessageSquare} label="Tweets" value={tweets.length} color="border-border bg-card/50" />
                  <InsightBadge icon={TrendingUp} label="Themes" value={aiOutput.themes?.length || 0} color="border-border bg-card/50" />
                  <InsightBadge icon={Target} label="Actions" value={aiOutput.actions?.length || 0} color="border-border bg-card/50" />
                </div>
              )}

              {/* Sentiment */}
              {aiOutput?.sentimentBreakdown && (
                <div className="px-6 pb-3">
                  <div className="flex rounded-lg overflow-hidden h-2 border border-border">
                    <div className="bg-primary/60 transition-all" style={{ width: `${aiOutput.sentimentBreakdown.positive}%` }} />
                    <div className="bg-muted-foreground/40 transition-all" style={{ width: `${aiOutput.sentimentBreakdown.neutral}%` }} />
                    <div className="bg-destructive/60 transition-all" style={{ width: `${aiOutput.sentimentBreakdown.negative}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>+{aiOutput.sentimentBreakdown.positive}% positive</span>
                    <span>{aiOutput.sentimentBreakdown.neutral}% neutral</span>
                    <span>{aiOutput.sentimentBreakdown.negative}% negative</span>
                  </div>
                </div>
              )}

              {/* Summary */}
              {aiOutput?.summary && (
                <div className="mx-6 mb-3 p-3 rounded-lg bg-foreground/5 border border-border">
                  <p className="text-[12px] text-foreground/80 leading-relaxed">{aiOutput.summary}</p>
                </div>
              )}

              {/* Tabs */}
              <div className="px-6 mb-3 flex gap-1 border-b border-border pb-0">
                {(["insights", "tweets", "opportunities"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-2 text-[12px] font-medium capitalize border-b-2 transition-colors -mb-px",
                      activeTab === tab
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="px-6 pb-6 space-y-3">
                <AnimatePresence mode="wait">
                  {/* ── Insights Tab ── */}
                  {activeTab === "insights" && aiOutput && (
                    <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      {/* Top Insights */}
                      {aiOutput.topInsights?.length > 0 && (
                        <div>
                          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Key Insights</h3>
                          <div className="space-y-2">
                            {aiOutput.topInsights.map((insight, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-card/50 border border-border"
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-[12px] text-foreground/80 leading-relaxed">{insight}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Themes */}
                      {aiOutput.themes?.length > 0 && (
                        <div>
                          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Themes</h3>
                          <div className="space-y-2">
                            {aiOutput.themes.map((theme, i) => (
                              <div key={i} className="p-3 rounded-lg border border-border bg-card/50">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[12px] font-semibold text-foreground">{theme.title}</span>
                                  <span className="text-[10px] font-mono text-muted-foreground">{theme.confidence}%</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mb-2">{theme.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {theme.tags?.map((tag) => (
                                    <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-foreground/10 text-foreground/70 font-mono">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {aiOutput.actions?.length > 0 && (
                        <div>
                          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Action Items</h3>
                          <div className="space-y-2">
                            {aiOutput.actions.map((action, i) => (
                              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-card/50">
                                <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] text-foreground/80">{action.text}</p>
                                  {action.rationale && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{action.rationale}</p>
                                  )}
                                </div>
                                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0", PRIORITY_COLOR[action.priority] || PRIORITY_COLOR.medium)}>
                                  {action.priority}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Questions */}
                      {aiOutput.questions?.length > 0 && (
                        <div>
                          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Questions to Explore</h3>
                          <div className="space-y-2">
                            {aiOutput.questions.map((q, i) => (
                              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-border bg-card/50">
                                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-[12px] text-foreground/80">{q.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Roadmap suggestions */}
                      {aiOutput.roadmapSuggestions?.length > 0 && (
                        <div>
                          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                            <Rocket className="inline w-3 h-3 mr-1" />
                            Roadmap Suggestions
                          </h3>
                          <div className="space-y-2">
                            {aiOutput.roadmapSuggestions.map((s, i) => (
                              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-border bg-card/50">
                                <span className="text-[10px] font-mono text-muted-foreground mt-0.5 shrink-0 w-5">{i + 1}.</span>
                                <p className="text-[12px] text-foreground/80">{s}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ── Tweets Tab ── */}
                  {activeTab === "tweets" && (
                    <motion.div key="tweets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                      <p className="text-[11px] text-muted-foreground">{tweets.length} tweets retrieved</p>
                      {tweets.map((tweet, i) => <TweetCard key={tweet.id} tweet={tweet} index={i} />)}
                    </motion.div>
                  )}

                  {/* ── Opportunities Tab ── */}
                  {activeTab === "opportunities" && aiOutput && (
                    <motion.div key="opportunities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                      {aiOutput.opportunities?.length > 0 ? (
                        aiOutput.opportunities.map((opp, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="p-3.5 rounded-lg border border-border bg-card/50"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[13px] font-semibold text-foreground">{opp.title}</span>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-medium border",
                                opp.potential === "high" ? "bg-primary/10 text-primary border-primary/20" :
                                opp.potential === "medium" ? "bg-foreground/10 text-foreground/70 border-border" :
                                "text-muted-foreground bg-muted/50 border-border"
                              )}>
                                {opp.potential} potential
                              </span>
                            </div>
                            <p className="text-[12px] text-muted-foreground leading-relaxed">{opp.description}</p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center py-12 text-muted-foreground text-[13px]">
                          No opportunities identified
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TwitterConnectorPanel;
