interface SectorLogoProps {
  sector: 'agriculture' | 'elevage';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SectorLogo({ sector, className = '', size = 'md' }: SectorLogoProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const bgColor = sector === 'agriculture' ? 'bg-green-100' : 'bg-orange-100';
  const iconColor = sector === 'agriculture' ? '#10B981' : '#EA580C';

  return (
    <div className={`${bgColor} rounded-full ${sizeClasses[size]} flex items-center justify-center ${className}`}>
      {sector === 'agriculture' ? (
        // Plant/Sprout Icon for Agriculture
        <svg className="h-3/4 w-3/4" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          <path d="M12 22v-8M12 14c0-4-4-6-8-6 0 4 2 8 8 8z" fill={iconColor} opacity="0.3" />
          <path d="M12 14c0-4 4-6 8-6 0 4-2 8-8 8z" fill={iconColor} opacity="0.5" />
          <circle cx="12" cy="22" r="1" fill={iconColor} />
        </svg>
      ) : (
        // Cow/Animal Icon for Élevage
        <svg className="h-3/4 w-3/4" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
          {/* Animal head/body */}
          <ellipse cx="12" cy="14" rx="6" ry="4" fill={iconColor} opacity="0.3" />
          {/* Legs */}
          <line x1="9" y1="18" x2="9" y2="22" stroke={iconColor} strokeWidth="2" />
          <line x1="11" y1="18" x2="11" y2="22" stroke={iconColor} strokeWidth="2" />
          <line x1="13" y1="18" x2="13" y2="22" stroke={iconColor} strokeWidth="2" />
          <line x1="15" y1="18" x2="15" y2="22" stroke={iconColor} strokeWidth="2" />
          {/* Head */}
          <circle cx="12" cy="10" r="3" fill={iconColor} opacity="0.4" />
          {/* Horns */}
          <path d="M10 8 Q9 6 8 6" stroke={iconColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M14 8 Q15 6 16 6" stroke={iconColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Ears */}
          <circle cx="9.5" cy="10" r="1" fill={iconColor} />
          <circle cx="14.5" cy="10" r="1" fill={iconColor} />
        </svg>
      )}
    </div>
  );
}
