import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ParticlesBackground from "@/components/ParticlesBackground";
import TypeWriter from "@/components/TypeWriter";
import { trpc } from "@/providers/trpc";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function HeroSection({ onSearch, isLoading }: HeroSectionProps) {
  const popularQuery = trpc.search.popular.useQuery(undefined, {
    staleTime: 60 * 1000,
  });

  const popularSearches = popularQuery.data?.searches.slice(0, 6) || [
    { query: "Inteligência Artificial", count: 42 },
    { query: "Marketing Digital", count: 38 },
    { query: "Programação", count: 35 },
    { query: "Data Science", count: 28 },
    { query: "Empreendedorismo", count: 25 },
    { query: "Design UX", count: 22 },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay — deep navy */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(7, 11, 20, 0.78) 0%, rgba(7, 11, 20, 0.95) 100%)",
        }}
      />

      {/* Radial gradient accent — cyan */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(56, 189, 248, 0.12) 0%, transparent 60%)",
        }}
      />

      {/* Particles */}
      <ParticlesBackground />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[800px] mx-auto text-center">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 md:mb-8"
          style={{
            background: "rgba(56, 189, 248, 0.12)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <Sparkles className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-[#38BDF8] text-xs md:text-sm font-medium tracking-wide uppercase">
            Descubra conteúdo em segundos
          </span>
        </motion.div>

        {/* Headline with TypeWriter */}
        <motion.h1
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#F0F9FF] mb-4 md:mb-6 tracking-tight"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.0 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          O que está{" "}
          <span className="text-[#38BDF8]">
            <TypeWriter
              words={["bombando", "trending", "viral", "relevante"]}
              typingSpeed={120}
              deletingSpeed={60}
              pauseMs={2500}
            />
          </span>
          <br className="hidden sm:block" />
          <span className="text-[#F0F9FF]"> na web?</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-[#94A3B8] text-sm md:text-lg max-w-[560px] mx-auto mb-8 md:mb-10 leading-relaxed px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        >
          Pesquise qualquer tema. Nós encontramos os 5 conteúdos mais relevantes
          e visualizados da internet, organizados com imagem e resumo.
        </motion.p>

        {/* Search Bar */}
        <SearchBar onSearch={onSearch} isLoading={isLoading} />

        {/* Popular searches chips */}
        <motion.div
          className="mt-6 flex flex-wrap justify-center gap-2 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <span className="text-[#475569] text-xs mr-1 self-center">Populares:</span>
          {popularSearches.map((s) => (
            <button
              key={s.query}
              onClick={() => onSearch(s.query)}
              className="
                px-3 py-1 rounded-full text-xs
                bg-[rgba(56,189,248,0.05)] border border-[rgba(56,189,248,0.12)]
                text-[#94A3B8] hover:text-[#F0F9FF] hover:border-[rgba(56,189,248,0.3)]
                transition-all duration-200
                hover:bg-[rgba(56,189,248,0.1)]
              "
            >
              {s.query}
            </button>
          ))}
        </motion.div>

        {/* Keyboard shortcut hint */}
        <motion.p
          className="mt-4 text-[#475569]/60 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          Pressione <kbd className="px-1.5 py-0.5 rounded bg-[rgba(56,189,248,0.08)] text-[#475569] text-[10px] font-mono border border-[rgba(56,189,248,0.12)]">/</kbd> para buscar
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <span className="text-[#475569] text-xs uppercase tracking-widest">
          Explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-[#475569]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
