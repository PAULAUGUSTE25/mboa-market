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
      className={`flex-shrink-0 w-80 ${className}`}
    >
      {/* Card Glassmorphism - Crème doux et apaisant */}
      <div
        className="rounded-3xl p-8 backdrop-blur-[12px] h-full"
        style={{
          background: palette.surface.glass,
          border: `1px solid ${palette.surface.glassBorder}`,
          boxShadow: palette.shadow.lg,
        }}
      >
        {/* Icon Circle */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: iconColor,
              boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-2xl font-bold text-center mb-2 uppercase"
          style={{ 
            color: palette.text.primary,
            letterSpacing: '0.05em'
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        <p
          className="text-center mb-4 text-sm"
          style={{ 
            color: palette.text.secondary,
          }}
        >
          {subtitle}
        </p>

        {/* Description */}
        <p
          className="text-center mb-6 text-sm leading-relaxed"
          style={{ 
            color: palette.text.secondary,
          }}
        >
          {description}
        </p>

        {/* Tags Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="px-3 py-2 rounded-full text-xs font-semibold text-center transition-all hover:scale-105"
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
          className="w-full py-4 rounded-2xl font-bold text-sm uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
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
