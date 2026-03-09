import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "For individuals getting started",
    features: [
      "1 brainstorming session",
      "AI-powered dump processing",
      "Basic theme extraction",
      "Export to markdown",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "For power users & small teams",
    features: [
      "10 concurrent sessions",
      "Unlimited AI processing",
      "PRD & roadmap generation",
      "Twitter Intelligence",
      "PDF & markdown export",
      "Priority support",
      "Session data persistence",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    desc: "For teams that ship fast",
    features: [
      "Unlimited sessions",
      "Unlimited AI processing",
      "All connectors",
      "Full generation suite",
      "Team collaboration",
      "Custom AI tuning",
      "Dedicated support & SLA",
      "API access",
    ],
    cta: "Go Team",
    popular: false,
  },
];

const LandingPricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-[0.2em]">Pricing</span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold mt-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-[15px] text-muted-foreground mt-4 max-w-md mx-auto">
            Start free. Upgrade when you need more power. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`relative rounded-2xl border p-8 transition-all ${
                plan.popular
                  ? "border-foreground/20 bg-card/40 shadow-[0_0_0_1px_hsl(var(--foreground)/0.05)]"
                  : "border-border bg-background hover:border-ring/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-semibold tracking-wide">
                  <Star className="w-3 h-3" /> POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-[15px] font-semibold">{plan.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-1">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mt-5">
                  <span className="text-[40px] font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-[13px] text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="w-4 h-4 text-cf-decision shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/auth")}
                className={`w-full h-10 text-[13px] font-medium rounded-full transition-all ${
                  plan.popular
                    ? "bg-foreground text-background hover:opacity-90"
                    : "bg-accent text-foreground border border-border hover:border-ring/40"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingPricing;
