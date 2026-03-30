interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  // Responsive heights for different screen sizes - Optimisé pour mobile
  const heights = {
    xs: 'h-8',
    sm: 'h-10 sm:h-12',
    md: 'h-14 sm:h-16 md:h-20',
    lg: 'h-20 sm:h-24 md:h-32 lg:h-40',
    xl: 'h-28 sm:h-32 md:h-40 lg:h-48'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* MBOA Market Logo Image */}
      <img 
        src="/new logo.png" 
        alt="MBOA Market" 
        className={`${heights[size]} w-auto object-contain max-w-full`}
      />
    </div>
  );
}
