import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface ResultCardProps {
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  date: string;
  index: number;
}

/**
 * ResultCard com efeito spotlight — top glow interativo que segue o mouse
 * Inspirado nos cards da referência
 */
export default function ResultCard({ title, description, url, image, source, date, index }: ResultCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <motion.a
      ref={cardRef}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      className="group block rounded-2xl overflow-hidden relative"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      whileHover={{ y: -6 }}
    >
      {/* === CAMADA 0: Shadow externo === */}
      <div
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"
        style={{
          background: `radial-gradient(
            400px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%,
            rgba(56, 189, 248, 0.35),
            transparent 60%
          )`,
        }}
      />

      {/* === CAMADA 1: Fundo base === */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ background: "linear-gradient(180deg, #0F1B2D 0%, #0A1420 100%)" }}
      />

      {/* === CAMADA 2: Top spotlight glow estático === */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(
            ellipse 80% 40% at 50% 0%,
            rgba(56, 189, 248, 0.1),
            transparent 70%
          )`,
        }}
      />

      {/* === CAMADA 3: Interactive spotlight que segue o mouse === */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(
            500px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%,
            rgba(56, 189, 248, 0.15),
            transparent 60%
          )`,
        }}
      />

      {/* === CAMADA 4: Border glow com mix-blend-mode === */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100"
        style={{
          background: `linear-gradient(
            180deg,
            rgba(56, 189, 248, 0.3) 0%,
            rgba(56, 189, 248, 0.1) 12%,
            transparent 35%,
            transparent 100%
          )`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1.2px",
          mixBlendMode: "screen",
        }}
      />

      {/* === CAMADA 5: Inner border sutil === */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: "1px solid rgba(56, 189, 248, 0.08)",
          boxShadow: `
            inset 0 1px 0 rgba(56, 189, 248, 0.1),
            0 4px 20px -5px rgba(0, 0, 0, 0.4)
          `,
        }}
      />

      {/* === CONTEÚDO === */}
      <div className="relative z-10">
        {/* Image area */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop";
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(7, 11, 20, 0.9) 0%, transparent 60%)",
            }}
          />
          {/* Top image glow line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.6), transparent)",
            }}
          />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-2 rounded-full bg-[rgba(56,189,248,0.15)] backdrop-blur-sm border border-[rgba(56,189,248,0.25)]">
              <ExternalLink className="w-4 h-4 text-[#38BDF8]" />
            </div>
          </div>
        </div>

        {/* Text area */}
        <div className="p-5">
          <h3 className="text-[#F0F9FF] font-semibold text-lg leading-snug line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-[#94A3B8] text-sm leading-relaxed line-clamp-3 mb-3">
            {description}
          </p>
          <div className="flex items-center justify-between text-xs text-[#475569]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.2)] flex items-center justify-center">
                <span className="text-[8px] text-[#38BDF8] font-bold">
                  {source.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="uppercase tracking-wider">{source}</span>
            </div>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}
