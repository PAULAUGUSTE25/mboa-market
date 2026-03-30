interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  // Responsive heights for different screen sizes
  const heights = {
    xs: 'h-10 sm:h-12',
    sm: 'h-12 sm:h-14 md:h-16',
    md: 'h-16 sm:h-20 md:h-24',
    lg: 'h-24 sm:h-32 md:h-40 lg:h-48',
    xl: 'h-32 sm:h-40 md:h-48 lg:h-56'
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
