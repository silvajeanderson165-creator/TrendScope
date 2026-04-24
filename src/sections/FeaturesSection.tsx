import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Globe, Shield, TrendingUp, Clock, Layers } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

const features = [
  {
    icon: Zap,
    title: "Busca Instantânea",
    description:
      "Resultados em menos de 2 segundos graças ao cache inteligente e processamento paralelo em múltiplas fontes.",
  },
  {
    icon: Globe,
    title: "Múltiplas Fontes",
    description:
      "Agrega conteúdo de Google, Bing, DuckDuckGo e dezenas de motores de busca via infraestrutura SearXNG distribuída.",
  },
  {
    icon: Shield,
    title: "Privacidade Garantida",
    description:
      "Zero rastreamento. Nenhum dado pessoal é vendido ou compartilhado. Buscas criptografadas e anônimas por design.",
  },
  {
    icon: TrendingUp,
    title: "Relevância Inteligente",
    description:
      "Algoritmo de ranking que combina popularidade, frescor do conteúdo e autoridade da fonte para entregar o melhor.",
  },
  {
    icon: Clock,
    title: "Conteúdo Sempre Atual",
    description:
      "O índice é atualizado continuamente. Você sempre vê o que está bombando agora, não semanas atrás.",
  },
  {
    icon: Layers,
    title: "Curadoria Visual",
    description:
      "Cada resultado vem com imagem de preview, resumo gerado e metadados ricos. Navegue antes de clicar.",
  },
];

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 px-4 overflow-hidden"
      style={{ background: "#070B14" }}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(ellipse, rgba(56, 189, 248, 0.2), transparent 70%)",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(56,189,248,0.1)] border border-[rgba(56,189,248,0.2)] text-[#38BDF8] text-sm font-medium mb-4">
            Recursos
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#F0F9FF] mb-4 tracking-tight">
            Tecnologia de ponta,{" "}
            <span className="text-[#38BDF8]">simples de usar</span>
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto text-lg">
            Cada detalhe foi pensado para entregar a melhor experiência de
            descoberta de conteúdo.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <SpotlightCard
              key={feature.title}
              index={isInView ? index : 0}
              className="p-6"
              glowIntensity={1.2}
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] mb-4 shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)]">
                <feature.icon className="w-6 h-6 text-[#070B14]" />
              </div>
              <h3 className="text-[#F0F9FF] font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                {feature.description}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
