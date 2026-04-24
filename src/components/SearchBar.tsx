import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  isLoading,
  initialValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isFocused) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && isFocused) {
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-[680px] mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
    >
      <div
        className={`
          relative flex items-center h-14 md:h-16 rounded-full
          transition-all duration-300 ease-out
          ${isFocused 
            ? "border-glow glow-cyan" 
            : "border border-[rgba(56,189,248,0.12)]"
          }
        `}
        style={{
          background: "rgba(13, 21, 32, 0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="absolute left-4 md:left-6 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-[#38BDF8] animate-spin" />
          ) : (
            <Search
              className={`w-5 h-5 transition-colors duration-300 ${
                isFocused ? "text-[#38BDF8]" : "text-[#475569]"
              }`}
            />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Pesquise qualquer tema..."
          aria-label="Campo de busca"
          role="searchbox"
          className="
            w-full h-full bg-transparent pl-12 md:pl-14 pr-20
            text-[#F0F9FF] placeholder-[#475569]
            text-base md:text-lg
            outline-none border-none
            focus:ring-0
          "
          disabled={isLoading}
        />

        {query.trim() && !isLoading && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-20 md:right-24 p-1 rounded-full hover:bg-[rgba(56,189,248,0.08)] transition-colors"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4 text-[#475569]" />
          </button>
        )}

        {query.trim() && (
          <motion.button
            type="submit"
            disabled={isLoading}
            className="
              absolute right-2
              px-4 md:px-5 py-2 md:py-2.5 rounded-full
              bg-[#38BDF8] hover:bg-[#0EA5E9]
              text-[#070B14] text-sm font-semibold
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Buscar
          </motion.button>
        )}
      </div>
    </motion.form>
  );
}
