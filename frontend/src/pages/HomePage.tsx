import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Beef, Users, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation d'entrée pour le contenu
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    { icon: Sprout, label: 'Agriculture' },
    { icon: Beef, label: 'Élevage' },
    { icon: Users, label: 'Communauté' },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full relative flex items-center justify-center lg:justify-end overflow-hidden"
    >
      {/* Background Image Realiste */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/background pic.png')`, // Image de fond fournie
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay sombre léger pour le contraste */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Glassmorphism Card */}
      <div 
        ref={contentRef}
        className="relative z-10 w-full max-w-md mr-0 lg:mr-20 px-6 py-12 m-4"
      >
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-[2rem] shadow-2xl p-8 sm:p-10 overflow-hidden relative">
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          {/* Header avec Logo */}
          <div className="relative z-10 flex flex-col items-center text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center shadow-lg mb-6 p-4"
            >
               <img
                src="/new logo.png"
                alt="MBOA Market"
                className="w-full h-full object-contain"
              />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
              MBOA Market
            </h1>
            <p className="text-white/90 font-medium text-sm max-w-[260px]">
              La plateforme de référence pour l'agriculture et l'élevage au Cameroun
            </p>
          </div>

          {/* Action Buttons - Contrastés */}
          <div className="relative z-10 space-y-4">
            <Link to="/login" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold text-lg shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                Se Connecter
              </motion.button>
            </Link>
            
            <Link to="/register" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2 border border-gray-700"
              >
                S'inscrire
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>

          {/* Features / Icons */}
          <div className="relative z-10 mt-10 pt-6 border-t border-white/20">
            <div className="flex justify-between items-center px-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex flex-col items-center gap-2 text-white/90">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium">{feature.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Footer Text */}
          <div className="relative z-10 mt-8 text-center">
            <p className="text-white/60 text-xs">
              © 2026 MBOA Market. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
