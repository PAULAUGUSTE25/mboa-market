import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface LiquidDistortionProps {
  images: string[];
  currentIndex: number;
  className?: string;
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}

export default function LiquidDistortion({ 
  images, 
  currentIndex,
  className = '',
  onTransitionStart,
  onTransitionEnd
}: LiquidDistortionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [turbulence, setTurbulence] = useState(0);
  const prevIndexRef = useRef(currentIndex);
  const animationRef = useRef<number>();

  // Handle transition
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      // Change image immediately
      setDisplayIndex(currentIndex);
      setIsTransitioning(true);
      onTransitionStart?.();
      prevIndexRef.current = currentIndex;
      
      // Animate turbulence only (no image switching during animation)
      let progress = 0;
      const animateTurbulence = () => {
        progress += 0.04;
        
        if (progress < 1) {
          // Smooth turbulence wave
          setTurbulence(Math.sin(progress * Math.PI) * 40);
          animationRef.current = requestAnimationFrame(animateTurbulence);
        } else {
          // End transition
          setTurbulence(0);
          setIsTransitioning(false);
          onTransitionEnd?.();
        }
      };
      
      animateTurbulence();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, onTransitionStart, onTransitionEnd]);

  // Subtle ambient animation
  const [ambientTime, setAmbientTime] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbientTime(t => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const ambientTurbulence = isTransitioning ? 0 : Math.sin(ambientTime) * 2 + 2;

  return (
    <motion.div
      className={`absolute inset-0 overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* SVG Filter for Liquid Distortion */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="liquid-distortion" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.015" 
              numOctaves="3" 
              seed="1"
              result="noise"
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale={turbulence + ambientTurbulence}
              xChannelSelector="R" 
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Background Image with Liquid Effect - No fade transition */}
      <div
        className="absolute inset-0"
        style={{
          filter: `url(#liquid-distortion)`,
        }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${images[displayIndex]}')`,
            transform: isTransitioning ? `scale(${1 + turbulence * 0.002})` : 'scale(1)',
            transition: 'transform 0.1s ease-out'
          }}
        />
      </div>

      {/* Overlay for better text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%)',
        }}
      />
    </motion.div>
  );
}
