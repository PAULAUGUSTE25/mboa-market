import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { lightTheme } from '@/types/theme';

const palette = lightTheme.palette;

export interface SectorCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  tags: Array<{
    label: string;
    icon?: string;
  }>;
  buttonText: string;
  buttonColor: string;
  onAction?: () => void;
  className?: string;
}

export default function SectorCard({
  title,
  subtitle,
  description,
  icon: Icon,
  iconColor,
  tags,
  buttonText,
  buttonColor,
  onAction,
  className = '',
}: SectorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`flex-shrink-0 w-full sm:w-72 md:w-80 ${className}`}
    >
      {/* Card Glassmorphism - Crème doux et apaisant */}
      <div
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-[12px] h-full"
        style={{
          background: palette.surface.glass,
          border: `1px solid ${palette.surface.glassBorder}`,
          boxShadow: palette.shadow.lg,
        }}
      >
        {/* Icon Circle */}
        <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
            style={{
              background: iconColor,
              boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-1 sm:mb-2 uppercase"
          style={{ 
            color: palette.text.primary,
            letterSpacing: '0.05em'
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        <p
          className="text-center mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm"
          style={{ 
            color: palette.text.secondary,
          }}
        >
          {subtitle}
        </p>

        {/* Description */}
        <p
          className="text-center mb-4 sm:mb-5 md:mb-6 text-xs sm:text-sm leading-relaxed"
          style={{ 
            color: palette.text.secondary,
          }}
        >
          {description}
        </p>

        {/* Tags Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold text-center transition-all hover:scale-105"
              style={{
                background: palette.surface.main,
                color: palette.text.primary,
                boxShadow: palette.shadow.sm,
              }}
            >
              {tag.icon && <span className="mr-1">{tag.icon}</span>}
              {tag.label}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onAction}
          className="w-full py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: buttonColor,
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
            letterSpacing: '0.5px',
          }}
        >
          {buttonText}
        </button>
      </div>
    </motion.div>
  );
}
