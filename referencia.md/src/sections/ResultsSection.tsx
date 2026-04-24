import { motion } from "framer-motion";
import { SearchX, AlertCircle, TrendingUp } from "lucide-react";
import ResultCard from "@/components/ResultCard";
import SkeletonCard from "@/components/SkeletonCard";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  date: string;
  isMock?: boolean;
}

interface ResultsSectionProps {
  results: SearchResult[];
  query: string;
  isLoading: boolean;
  isVisible: boolean;
  error?: string;
  notice?: string;
}

export default function ResultsSection({
  results,
  query,
  isLoading,
  isVisible,
  error,
  notice,
}: ResultsSectionProps) {
  if (!isVisible) return null;

  return (
    <section
      id="results"
      className="relative py-16 md:py-28 px-4"
      style={{ background: "#070B14" }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          className="mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="text-2xl md:text-4xl font-bold text-[#F0F9FF] tracking-tight">
              Top 5 em:{" "}
              <span className="text-[#38BDF8]">{query}</span>
            </h2>
          </div>
          <p className="text-[#94A3B8] text-sm md:text-base ml-8">
            Os conteúdos mais relevantes encontrados
          </p>

          {notice && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-[rgba(56,189,248,0.06)] border border-[rgba(56,189,248,0.12)] max-w-xl">
              <AlertCircle className="w-4 h-4 text-[#38BDF8] mt-0.5 flex-shrink-0" />
              <p className="text-[#38BDF8] text-xs md:text-sm">{notice}</p>
            </div>
          )}
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* Error/Empty state */}
        {!isLoading && (error || results.length === 0) && (
          <motion.div
            className="flex flex-col items-center justify-center py-16 md:py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-4 rounded-full bg-[#0D1520] border border-[rgba(56,189,248,0.08)] mb-4">
              <SearchX className="w-10 h-10 text-[#475569]" />
            </div>
            <h3 className="text-xl font-semibold text-[#F0F9FF] mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-[#94A3B8] text-center max-w-md text-sm">
              Tente pesquisar com termos diferentes ou mais genéricos para
              encontrar conteúdo relevante.
            </p>
          </motion.div>
        )}

        {/* Results grid */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`
                  ${index >= 3 ? "sm:col-span-1 lg:col-span-1" : ""}
                  ${index === 3 ? "sm:col-start-1 lg:col-start-auto" : ""}
                  ${index === 4 ? "sm:col-start-2 lg:col-start-auto" : ""}
                `}
              >
                <ResultCard
                  title={result.title}
                  description={result.description}
                  url={result.url}
                  image={result.image}
                  source={result.source}
                  date={result.date}
                  index={index}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
