interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const heights = {
    sm: 'h-16',
    md: 'h-24',
    lg: 'h-48',
    xl: 'h-56'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* MBOA Market Logo Image */}
      <img 
        src="/new logo.png" 
        alt="MBOA Market" 
        className={`${heights[size]} w-auto object-contain`}
      />
    </div>
  );
}
