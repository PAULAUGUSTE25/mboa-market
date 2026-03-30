import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

// Strict typing for ExpertCard props
export interface ExpertCardProps {
  title: string;
  description: string;
  tags: Array<{
    label: string;
    icon?: string;
  }>;
  onConsult?: () => void;
  className?: string;
}

export default function ExpertCard({
  title,
  description,
  tags,
  onConsult,
  className = '',
}: ExpertCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative ${className}`}
    >
      {/* Card Glassmorphism - Beige/crème transparent comme dans l'image */}
      <div
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 backdrop-blur-[12px]"
        style={{
          background: 'rgba(245, 237, 220, 0.75)', // Beige/crème transparent
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15), 0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Icon - Cercle doré comme dans l'image */}
        <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #C9A227 100%)',
              boxShadow: '0 4px 12px 0 rgba(212, 175, 55, 0.4)',
            }}
          >
            <Users className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title - Noir profond */}
        <h3
          className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 sm:mb-3 md:mb-4"
          style={{ 
            color: '#1A1A1A',
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h3>

        {/* Description - Gris anthracite */}
        <p
          className="text-center mb-4 sm:mb-6 md:mb-8 leading-relaxed text-sm sm:text-base"
          style={{ color: '#4A4A4A' }}
        >
          {description}
        </p>

        {/* Tags - Pill avec bordures colorées et icônes */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105 hover:shadow-md cursor-pointer"
              style={{
                background: '#FFFFFF',
                border: index === 0 ? '2px solid #27AE60' : '2px solid #E67E22',
                color: '#1A1A1A',
                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
              }}
            >
              {tag.label}
            </div>
          ))}
        </div>

        {/* CTA Button - Orange/terracotta comme dans l'image */}
        <button
          onClick={onConsult}
          className="w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base uppercase transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #D2691E 0%, #C85A17 100%)', // Orange terracotta
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 6px 20px 0 rgba(210, 105, 30, 0.4)',
            letterSpacing: '1px',
          }}
        >
          DÉCOUVRIR LES OFFRES
        </button>
      </div>
    </motion.div>
  );
}
