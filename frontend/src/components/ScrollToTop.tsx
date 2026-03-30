import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Afficher le bouton après avoir scrollé de 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Vérifier immédiatement au montage
    toggleVisibility();

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] group"
          aria-label="Retour en haut"
        >
          <div 
            className="backdrop-blur-md border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(to bottom right, #2E7D32, #1B5E20)',
              borderColor: 'rgba(46, 125, 50, 0.5)',
              boxShadow: '0 10px 40px rgba(46, 125, 50, 0.3)'
            }}
          >
            <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-3 py-2 shadow-xl whitespace-nowrap">
              <p className="text-sm font-semibold text-white">Retour en haut</p>
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
