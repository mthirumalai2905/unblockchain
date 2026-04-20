import { motion } from "framer-motion";

const stats = [
  { value: "50K+", label: "Ideas processed" },
  { value: "2.4K", label: "Active builders" },
  { value: "12×", label: "Faster shipping" },
  { value: "99.9%", label: "Uptime" },
];

const LandingStats = () => {
  return (
    <section className="relative py-16 px-6 border-y border-border bg-card/20">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="text-center px-4 py-2"
            >
              <div className="text-[2rem] md:text-[2.75rem] font-bold tracking-[-0.04em] text-foreground leading-none mb-2 tabular-nums">
                {stat.value}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingStats;
