import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundSlideshowProps {
  images: string[];
  interval?: number;
  overlay?: boolean;
}

export default function BackgroundSlideshow({ 
  images, 
  interval = 8000, // 8 secondes entre chaque changement
  overlay = true 
}: BackgroundSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 3,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${images[currentIndex]}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'opacity',
            transform: 'translateZ(0)',
          }}
        />
      </AnimatePresence>
      
      {overlay && (
        <div 
          className="absolute inset-0 bg-black/20 z-10"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        />
      )}

      {/* Indicateurs de slide */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            style={{
              transform: 'translateZ(0)',
              willChange: 'width, background-color',
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
