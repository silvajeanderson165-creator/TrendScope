import { type ReactNode, useRef, useState } from "react";
import { motion } from "framer-motion";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
  glowColor?: string;
  glowIntensity?: number;
  interactive?: boolean;
}

/**
 * SpotlightCard — Efeito de holofote/lanterna na borda superior do card
 * Inspirado nos cards da referência com top-light glow
 */
export default function SpotlightCard({
  children,
  className = "",
  index = 0,
  glowColor = "56, 189, 248", // cyan-400 (#38BDF8)
  glowIntensity = 1,
  interactive = true,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`group relative rounded-2xl overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.1,
      }}
      whileHover={{ y: -4 }}
    >
      {/* === CAMADA 1: Fundo base escuro === */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(180deg, #0F1B2D 0%, #0A1420 100%)",
        }}
      />

      {/* === CAMADA 2: Top spotlight glow (o efeito principal da referência) === */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(
            600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%,
            rgba(${glowColor}, 0.12),
            transparent 60%
          )`,
        }}
      />
      {/* Static top glow — sempre visível sutilmente */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(
            ellipse 80% 40% at 50% 0%,
            rgba(${glowColor}, ${0.08 * glowIntensity}),
            transparent 70%
          )`,
        }}
      />

      {/* === CAMADA 3: Border glow no topo === */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(
            180deg,
            rgba(${glowColor}, ${0.25 * glowIntensity}) 0%,
            rgba(${glowColor}, ${0.08 * glowIntensity}) 15%,
            transparent 40%,
            transparent 100%
          )`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
          mixBlendMode: "screen",
        }}
      />

      {/* === CAMADA 4: Borda externa sutil === */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100"
        style={{
          border: `1px solid rgba(${glowColor}, 0.1)`,
          boxShadow: `
            inset 0 1px 0 rgba(${glowColor}, 0.15),
            0 0 0 1px rgba(${glowColor}, 0.03)
          `,
        }}
      />

      {/* === CAMADA 5: Inner bottom glow sutil === */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(
            ellipse 60% 80% at 50% 100%,
            rgba(${glowColor}, 0.04),
            transparent 70%
          )`,
        }}
      />

      {/* === CONTEÚDO === */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
