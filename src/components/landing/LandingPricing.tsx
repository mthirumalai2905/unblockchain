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
      "AI dump processing",
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
    desc: "For power users and small teams",
    features: [
      "10 concurrent sessions",
      "Unlimited AI processing",
      "PRD and roadmap generation",
      "Twitter Intelligence",
      "PDF and markdown export",
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
      "Dedicated support and SLA",
      "API access",
    ],
    cta: "Go Team",
    popular: false,
  },
];

const LandingPricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative py-14 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 px-1"
        >
          <p className="lab-mono text-[11px] text-muted-foreground">pricing</p>
          <h2 className="font-display text-[1.75rem] sm:text-3xl md:text-[2.75rem] font-semibold mt-3 tracking-[-0.045em] leading-[1.1]">
            Simple, transparent pricing
          </h2>
          <p className="text-[14px] sm:text-[15px] text-muted-foreground mt-3 max-w-md mx-auto">
            Start free. Upgrade when you need more power. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`relative rounded-2xl border p-5 sm:p-6 md:p-8 transition-all min-w-0 ${
                plan.popular
                  ? "border-foreground/20 bg-card/40 shadow-[0_0_0_1px_hsl(var(--foreground)/0.05)] sm:col-span-2 lg:col-span-1"
                  : "border-border bg-background hover:border-ring/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-md bg-foreground text-background text-[10px] font-semibold tracking-wide whitespace-nowrap">
                  <Star className="w-3 h-3" /> Popular
                </div>
              )}

              <div className="mb-6 sm:mb-8">
                <h3 className="text-[15px] font-semibold">{plan.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-1">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mt-4 sm:mt-5">
                  <span className="text-[36px] sm:text-[40px] font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-[13px] text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]">
                    <Check className="w-4 h-4 text-cf-decision shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate("/auth")}
                className={`w-full h-10 text-[13px] font-medium rounded-xl transition-all ${
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
