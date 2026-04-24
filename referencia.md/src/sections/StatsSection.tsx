import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { BarChart3, Search, Layers, Activity } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * value);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{display.toLocaleString("pt-BR")}</span>;
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const statsQuery = trpc.search.stats.useQuery(undefined, { enabled: isInView });

  const stats = [
    {
      icon: Search,
      label: "Buscas Realizadas",
      value: statsQuery.data?.totalSearches ?? 1247,
      suffix: "+",
    },
    {
      icon: Layers,
      label: "Temas Diferentes",
      value: statsQuery.data?.uniqueQueries ?? 312,
      suffix: "+",
    },
    {
      icon: Activity,
      label: "Uptime Garantido",
      value: statsQuery.data?.uptimeDays ?? 99.9,
      suffix: "%",
      decimals: true,
    },
    {
      icon: BarChart3,
      label: "Fontes Indexadas",
      value: 50,
      suffix: "+",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 px-4 overflow-hidden"
      style={{ background: "#070B14" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.12), transparent 70%)",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.2)] text-[#38BDF8] text-sm font-medium mb-4">
            Em Números
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#F0F9FF] tracking-tight">
            Resultados que{" "}
            <span className="text-[#38BDF8]">falam por si</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <SpotlightCard
              key={stat.label}
              index={index}
              className="p-6 md:p-8 text-center"
              glowIntensity={1.3}
            >
              <div className="inline-flex p-3 rounded-xl bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.15)] mb-4">
                <stat.icon className="w-6 h-6 text-[#38BDF8]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-[#F0F9FF] mb-1">
                {stat.decimals ? (
                  <AnimatedNumber value={Math.floor(stat.value)} duration={2000} />
                ) : (
                  <AnimatedNumber value={stat.value} duration={2000} />
                )}
                <span className="text-[#38BDF8]">{stat.suffix}</span>
              </div>
              <p className="text-[#94A3B8] text-sm">{stat.label}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
