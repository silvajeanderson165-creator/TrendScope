import { motion } from "framer-motion";

interface SkeletonCardProps {
  index: number;
}

export default function SkeletonCard({ index }: SkeletonCardProps) {
  return (
    <motion.div
      className="
        rounded-2xl overflow-hidden
        bg-[#0D1520] border border-[rgba(56,189,248,0.04)]
      "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      {/* Image skeleton */}
      <div className="aspect-video bg-[#0F1724] animate-shimmer" />
      
      {/* Text skeleton */}
      <div className="p-5 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 bg-[#0F1724] rounded animate-shimmer w-[85%]" />
        <div className="h-5 bg-[#0F1724] rounded animate-shimmer w-[60%]" />
        
        {/* Description skeleton */}
        <div className="space-y-2 pt-1">
          <div className="h-3 bg-[#0F1724] rounded animate-shimmer w-full" />
          <div className="h-3 bg-[#0F1724] rounded animate-shimmer w-[90%]" />
          <div className="h-3 bg-[#0F1724] rounded animate-shimmer w-[70%]" />
        </div>
        
        {/* Meta skeleton */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 bg-[#0F1724] rounded animate-shimmer w-20" />
          <div className="h-3 bg-[#0F1724] rounded animate-shimmer w-16" />
        </div>
      </div>
    </motion.div>
  );
}
