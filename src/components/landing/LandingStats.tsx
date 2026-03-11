import { motion } from "framer-motion";

const stats = [
  { value: "50K+", label: "Ideas Processed" },
  { value: "2.4K", label: "Active Builders" },
  { value: "98%", label: "Time Saved" },
  { value: "∞", label: "Possibilities" },
];

const LandingStats = () => {
  return (
    <section className="relative py-20 px-6 border-y border-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-[2.5rem] md:text-[3.5rem] font-extrabold tracking-[-0.04em] text-foreground leading-none mb-2">
                {stat.value}
              </div>
              <p className="text-[12px] text-muted-foreground uppercase tracking-[0.15em] font-medium">
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
