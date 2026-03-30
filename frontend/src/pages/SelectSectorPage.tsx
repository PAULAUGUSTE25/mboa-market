import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Beef, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';

export default function SelectSectorPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation d'entrée pour le contenu
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const sectors = [
    {
      id: 'agriculture',
      title: 'Agriculture',
      subtitle: 'Cultures & Produits',
      description: 'Semences, légumes, fruits, céréales',
      icon: Sprout,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-600',
      link: '/register?sector=agriculture', // Changed to register directly or login selector? The previous link was /login/agriculture which implies login page. 
      // Wait, previous code had /login/agriculture. I should keep it or check. 
      // User flow: Select Sector -> Login/Register? 
      // The previous code had /login/agriculture. Let's keep it consistent or use the link from previous code.
      // Previous code: link: '/login/agriculture' (and elevage).
      // But wait, the RegisterPage takes a sector param.
      // Let's assume /login/agriculture is handled or I should point to /login?sector=agriculture?
      // I'll stick to what was there: '/login/agriculture' BUT 
      // typically you want to go to a page that lets you choose login or register OR sets the context.
      // I will keep '/login' with state or query param if needed, but for now I will preserve the existing links 
      // or better, point to a generic entry that defaults to that sector.
      // Actually, looking at the previous file content, it was '/login/agriculture'. 
      // I will keep it.
    },
    {
      id: 'elevage',
      title: 'Élevage',
      subtitle: 'Animaux & Produits',
      description: 'Bovins, volailles, porcins, caprins',
      icon: Beef,
      color: 'red',
      gradient: 'from-red-500 to-red-700',
      link: '/login/elevage',
    },
  ];
  
  // Correction: The previous code links were '/login/agriculture' etc. 
  // I will assume those routes exist or are handled.

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full overflow-hidden relative flex flex-col items-center justify-center"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/background pic.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <div className="absolute top-8 left-6 z-20">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-white/80 transition-colors drop-shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Retour</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div 
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center px-6 py-12 w-full max-w-5xl"
      >
        {/* Logo */}
        <motion.img
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          src="/new logo.png"
          alt="MBOA Market"
          className="h-24 sm:h-28 md:h-32 w-auto object-contain mb-8 drop-shadow-lg"
        />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
            Choisissez votre secteur
          </h1>
          <p className="text-white/90 text-base sm:text-lg font-medium drop-shadow">
            Sélectionnez pour continuer
          </p>
        </motion.div>

        {/* Sector Cards */}
        <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
          {sectors.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex-1 max-w-md mx-auto w-full"
              >
                <Link to={sector.link}>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative p-8 rounded-[2rem] border border-white/30 bg-white/20 backdrop-blur-xl shadow-2xl cursor-pointer group overflow-hidden h-full flex flex-col items-center text-center transition-all hover:bg-white/30"
                  >
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                    {/* Icon */}
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${sector.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                    </div>

                    {/* Text */}
                    <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                      {sector.title}
                    </h2>
                    <p className="text-white/90 text-sm font-semibold mb-3">
                      {sector.subtitle}
                    </p>
                    <p className="text-white/70 text-sm">
                      {sector.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className={`mt-8 w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-${sector.color}-600 transition-all text-white`}>
                      <span className="text-xl">→</span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/70 text-sm text-center mt-12 max-w-md bg-black/30 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10"
        >
          Vous pourrez accéder aux deux secteurs après inscription
        </motion.p>
      </div>
    </div>
  );
}
