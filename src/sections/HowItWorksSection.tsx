import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Search, Cpu, Eye } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Digite seu tema",
    description:
      "Insira qualquer assunto, tendência ou palavra-chave no campo de busca. Nosso sistema aceita termos em qualquer idioma.",
  },
  {
    icon: Cpu,
    number: "02",
    title: "Processamento inteligente",
    description:
      "Nosso backend consulta simultaneamente múltiplos motores de busca, aplica filtros de relevância e enriquece cada resultado com metadados.",
  },
  {
    icon: Eye,
    number: "03",
    title: "Descubra o melhor conteúdo",
    description:
      "Receba os 5 posts mais relevantes, cada um com imagem, resumo objetivo e link direto. Clique e aprofunde-se no que interessa.",
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 px-4"
      style={{ background: "#070B14" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.2)] text-[#38BDF8] text-sm font-medium mb-4">
            Como Funciona
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#F0F9FF] mb-4 tracking-tight">
            Três passos para{" "}
            <span className="text-[#38BDF8]">descobrir tudo</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-[rgba(56,189,248,0.2)] to-transparent" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.2,
              }}
            >
              <SpotlightCard index={index} className="p-8 text-center" glowIntensity={1.5}>
                <div className="relative mb-6 inline-block">
                  <div className="w-20 h-20 rounded-2xl bg-[rgba(56,189,248,0.08)] border border-[rgba(56,189,248,0.15)] flex items-center justify-center relative z-10">
                    <step.icon className="w-8 h-8 text-[#38BDF8]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#38BDF8] flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                    <span className="text-[#070B14] text-xs font-bold">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-[#F0F9FF] font-semibold text-xl mb-3">
                  {step.title}
                </h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
