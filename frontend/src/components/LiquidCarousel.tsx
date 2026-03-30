import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';

interface LiquidCarouselProps {
  images: string[];
  titles?: string[];
  subtitles?: string[];
  autoPlay?: boolean;
  interval?: number;
  onSlideChange?: (index: number) => void;
  className?: string;
  overlayContent?: (currentIndex: number) => React.ReactNode;
}

export default function LiquidCarousel({
  images,
  titles = [],
  subtitles = [],
  autoPlay = true,
  interval = 5000,
  onSlideChange,
  className = '',
  overlayContent
}: LiquidCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  
  const currentImageRef = useRef<HTMLDivElement>(null);
  const nextImageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Preload images
  useEffect(() => {
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);
  
  const animateTransition = useCallback(() => {
    if (!currentImageRef.current || !nextImageRef.current || isTransitioning) return;
    
    setIsTransitioning(true);
    
    const currentImg = currentImageRef.current;
    const nextImg = nextImageRef.current;
    
    // Reset next image
    gsap.set(nextImg, {
      opacity: 0,
      scale: 1.1,
      filter: 'blur(10px) saturate(1.5)',
      clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)'
    });
    
    // Create liquid distortion timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIndex(nextIndex);
        setDisplayIndex(nextIndex);
        setIsTransitioning(false);
        onSlideChange?.(nextIndex);
        
        // Reset for next transition
        gsap.set(currentImg, { 
          opacity: 1, 
          scale: 1, 
          filter: 'blur(0px) saturate(1)',
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
        });
      }
    });
    
    // Animate current image out with liquid effect
    tl.to(currentImg, {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(15px) saturate(0.5)',
      duration: 0.8,
      ease: 'power2.inOut'
    }, 0);
    
    // Animate next image in with expanding liquid effect
    tl.to(nextImg, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px) saturate(1)',
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 1.2,
      ease: 'power3.out'
    }, 0.2);
    
  }, [isTransitioning, nextIndex, onSlideChange]);
  
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    const next = (currentIndex + 1) % images.length;
    setNextIndex(next);
    setTimeout(() => animateTransition(), 50);
  }, [currentIndex, images.length, isTransitioning, animateTransition]);
  
  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    const prev = (currentIndex - 1 + images.length) % images.length;
    setNextIndex(prev);
    setTimeout(() => animateTransition(), 50);
  }, [currentIndex, images.length, isTransitioning, animateTransition]);
  
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setNextIndex(index);
    setTimeout(() => animateTransition(), 50);
  }, [currentIndex, isTransitioning, animateTransition]);
  
  // Auto-play
  useEffect(() => {
    if (!autoPlay || isTransitioning) return;
    
    const timer = setInterval(() => {
      goToNext();
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoPlay, interval, isTransitioning, goToNext]);
  
  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Current Image */}
      <div
        ref={currentImageRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
          willChange: 'transform, opacity, filter'
        }}
      />
      
      {/* Next Image (for transition) */}
      <div
        ref={nextImageRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${images[nextIndex]})`,
          opacity: 0,
          willChange: 'transform, opacity, filter, clip-path'
        }}
      />
      
      {/* Liquid Effect Overlay - SVG Filter */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="liquid-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(0,0,0,0.4) 0%, 
            rgba(0,0,0,0.1) 40%, 
            rgba(0,0,0,0.1) 60%, 
            rgba(0,0,0,0.6) 100%
          )`
        }}
      />
      
      {/* Overlay Content */}
      {overlayContent && (
        <div className="absolute inset-0 z-10">
          {overlayContent(displayIndex)}
        </div>
      )}
      
      {/* Title & Subtitle */}
      {(titles.length > 0 || subtitles.length > 0) && (
        <div className="absolute bottom-20 left-8 z-10 text-white">
          {titles[displayIndex] && (
            <h2 
              className="text-4xl md:text-6xl font-bold mb-2 transition-all duration-500"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)'
              }}
            >
              {titles[displayIndex]}
            </h2>
          )}
          {subtitles[displayIndex] && (
            <p 
              className="text-lg md:text-xl opacity-80 transition-all duration-500"
              style={{
                opacity: isTransitioning ? 0 : 0.8,
                transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
                transitionDelay: '100ms'
              }}
            >
              {subtitles[displayIndex]}
            </p>
          )}
        </div>
      )}
      
      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 active:scale-95"
        disabled={isTransitioning}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 active:scale-95"
        disabled={isTransitioning}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${
              index === displayIndex 
                ? 'w-8 h-3 bg-white rounded-full' 
                : 'w-3 h-3 bg-white/40 hover:bg-white/60 rounded-full'
            }`}
            disabled={isTransitioning}
          />
        ))}
      </div>
    </div>
  );
}
