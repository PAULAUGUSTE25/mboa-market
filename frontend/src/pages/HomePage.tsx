import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, CheckCircle, PackageSearch, ShoppingCart, Beef, ChevronLeft, ChevronRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/utils/themeStyles';

export default function HomePage() {
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedMainIndex, setSelectedMainIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const allSections = [
    {
      id: 'agriculture',
      title: 'AGRICULTURE',
      subtitle: 'Cultures et Produits Agricoles',
      tagline: 'Accédez au plus grand marché de produits frais et de semences du Cameroun',
      cta: 'Entrer dans le marché',
      icon: Sprout,
      color: 'emerald',
      bgColor: 'from-emerald-950/40 via-emerald-900/20 to-emerald-950/40',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      glowColor: 'bg-emerald-500',
      type: 'main',
      badges: [
        { label: 'Semences', icon: '🌱' },
        { label: 'Légumes', icon: '🥬' },
        { label: 'Fruits', icon: '🍎' },
        { label: 'Céréales', icon: '🌾' }
      ]
    },
    {
      id: 'elevage',
      title: 'ÉLEVAGE',
      subtitle: 'Animaux et Produits d\'Élevage',
      tagline: 'Trouvez les meilleurs animaux et produits d\'élevage pour votre exploitation',
      cta: 'Découvrir les offres',
      icon: Beef,
      color: 'amber',
      bgColor: 'from-amber-950/40 via-amber-900/20 to-amber-950/40',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      glowColor: 'bg-amber-500',
      type: 'main',
      badges: [
        { label: 'Bovins', icon: '🐄' },
        { label: 'Caprins', icon: '🐐' },
        { label: 'Volailles', icon: '🐔' },
        { label: 'Porcins', icon: '🐷' }
      ]
    },
    {
      id: 'fournisseur',
      title: 'Fournisseurs',
      subtitle: 'Vendez vos semences et animaux',
      tagline: 'Développez votre activité en touchant des milliers d\'agriculteurs et éleveurs',
      cta: 'Devenir fournisseur',
      icon: PackageSearch,
      color: 'emerald',
      bgColor: 'from-teal-950/40 via-teal-900/20 to-teal-950/40',
      borderColor: 'border-teal-500/30',
      textColor: 'text-teal-400',
      glowColor: 'bg-teal-500',
      type: 'user',
      badges: [
        { label: 'Visibilité', icon: '👁️' },
        { label: 'Ventes directes', icon: '💰' },
        { label: 'Réseau', icon: '🤝' }
      ]
    },
    {
      id: 'producteur',
      title: 'Producteurs',
      subtitle: 'Agriculture et élevage',
      tagline: 'Vendez vos récoltes et productions directement aux acheteurs sans intermédiaire',
      cta: 'Rejoindre la communauté',
      icon: Sprout,
      color: 'emerald',
      bgColor: 'from-green-950/40 via-green-900/20 to-green-950/40',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      glowColor: 'bg-green-500',
      type: 'user',
      badges: [
        { label: 'Meilleurs prix', icon: '📈' },
        { label: 'Paiement rapide', icon: '⚡' },
        { label: 'Zéro commission', icon: '🎯' }
      ]
    },
    {
      id: 'acheteur',
      title: 'Acheteurs',
      subtitle: 'Produits agricoles et animaux',
      tagline: 'Approvisionnez-vous en produits frais directement auprès des producteurs locaux',
      cta: 'Commencer mes achats',
      icon: ShoppingCart,
      color: 'amber',
      bgColor: 'from-orange-950/40 via-orange-900/20 to-orange-950/40',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      glowColor: 'bg-orange-500',
      type: 'user',
      badges: [
        { label: 'Fraîcheur garantie', icon: '✨' },
        { label: 'Prix producteur', icon: '💵' },
        { label: 'Livraison', icon: '🚚' }
      ]
    }
  ];

  const modalContent = {
    agriculture: {
      title: 'AGRICULTURE',
      color: 'green',
      description: 'Plateforme dédiée aux cultures et produits agricoles',
      features: [
        'Achat et vente de semences certifiées',
        'Légumes frais et fruits de saison',
        'Céréales (maïs, riz, mil) et tubercules (manioc, igname)',
        'Cultures de rente (café, cacao, palmier à huile)',
        'Conseils agronomiques personnalisés',
        'Suivi des prix du marché en temps réel'
      ],
      stats: [
        { label: 'Producteurs', value: '500+' },
        { label: 'Produits', value: '1000+' },
        { label: 'Régions', value: '10' }
      ]
    },
    elevage: {
      title: 'ÉLEVAGE',
      color: 'amber',
      description: 'Marketplace pour animaux et produits d\'élevage',
      features: [
        'Bovins de race locale et améliorée',
        'Produits laitiers frais et transformés',
        'Caprins, ovins et porcins',
        'Volailles (poulets, canards, dindes) et œufs',
        'Aliments pour bétail et équipements',
        'Services vétérinaires et vaccinations'
      ],
      stats: [
        { label: 'Éleveurs', value: '300+' },
        { label: 'Animaux', value: '5000+' },
        { label: 'Vétérinaires', value: '50+' }
      ]
    },
    fournisseur: {
      title: 'FOURNISSEURS',
      color: 'green',
      description: 'Vendez vos semences, animaux et équipements',
      features: [
        'Créez votre boutique en ligne gratuitement',
        'Gérez vos stocks en temps réel',
        'Recevez des commandes directement',
        'Système de paiement sécurisé',
        'Livraison organisée avec transporteurs',
        'Support client dédié 24/7'
      ],
      stats: [
        { label: 'Commission', value: '5%' },
        { label: 'Paiement', value: '48h' },
        { label: 'Visibilité', value: 'Nationale' }
      ]
    },
    producteur: {
      title: 'PRODUCTEURS',
      color: 'teal',
      description: 'Vendez directement vos récoltes et productions',
      features: [
        'Éliminez les intermédiaires',
        'Fixez vos propres prix',
        'Accédez à un large réseau d\'acheteurs',
        'Recevez des conseils d\'experts',
        'Formations gratuites en ligne',
        'Assurance récolte disponible'
      ],
      stats: [
        { label: 'Marge', value: '+40%' },
        { label: 'Acheteurs', value: '2000+' },
        { label: 'Formations', value: '50+' }
      ]
    },
    acheteur: {
      title: 'ACHETEURS',
      color: 'amber',
      description: 'Achetez en gros directement aux producteurs',
      features: [
        'Prix compétitifs sans intermédiaires',
        'Produits frais et de qualité garantie',
        'Commandes en gros ou détail',
        'Livraison rapide dans toute la région',
        'Traçabilité complète des produits',
        'Programme de fidélité avantageux'
      ],
      stats: [
        { label: 'Économie', value: '-30%' },
        { label: 'Livraison', value: '24-48h' },
        { label: 'Garantie', value: '100%' }
      ]
    }
  };

  const Modal = ({ type }: { type: string }) => {
    const content = modalContent[type as keyof typeof modalContent];
    if (!content) return null;

    const colorClasses = {
      green: {
        bg: 'from-emerald-950/60 via-emerald-900/40 to-emerald-950/60',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'bg-emerald-500',
        shadow: 'rgba(16,185,129,0.3)'
      },
      amber: {
        bg: 'from-amber-950/60 via-amber-900/40 to-amber-950/60',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'bg-amber-500',
        shadow: 'rgba(251,146,60,0.3)'
      },
      teal: {
        bg: 'from-teal-950/60 via-teal-900/40 to-teal-950/60',
        text: 'text-teal-400',
        border: 'border-teal-500/30',
        glow: 'bg-teal-500',
        shadow: 'rgba(20,184,166,0.3)'
      }
    };

    const colors = colorClasses[content.color as keyof typeof colorClasses];

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={() => setActiveModal(null)}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className={`backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${colors.border} bg-gradient-to-br ${colors.bg}`}
          style={{ boxShadow: `0 20px 60px ${colors.shadow}` }}
        >
          {/* Header Premium Dark Mode */}
          <div className="relative p-8 border-b border-white/10">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className={`text-3xl md:text-4xl font-extrabold ${colors.text} mb-3`}>
              {content.title}
            </h2>
            <p className="text-gray-300/90 text-lg leading-relaxed">{content.description}</p>
          </div>

          {/* Contenu */}
          <div className="p-8">
            {/* Statistiques - Glassmorphism Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {content.stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-center p-4 rounded-2xl border-2 ${colors.border} bg-white/10 backdrop-blur-md hover:bg-white/15 transition-all shadow-lg`}
                >
                  <div className={`text-2xl md:text-3xl font-bold ${colors.text} mb-1`}>{stat.value}</div>
                  <div className="text-sm text-gray-200 font-semibold">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Fonctionnalités */}
            <h3 className="text-xl font-bold text-white mb-6">Fonctionnalités</h3>
            <ul className="space-y-4">
              {content.features.map((feature, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-6 h-6 rounded-full ${colors.glow} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-300 text-base leading-relaxed">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {/* Boutons d'action - Premium Style */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className={`flex-1 ${colors.text} border ${colors.border} bg-gradient-to-r ${colors.bg} py-4 px-6 rounded-xl font-bold text-center hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-95`}
                style={{ boxShadow: `0 4px 15px ${colors.shadow}` }}
              >
                Commencer maintenant
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-4 border border-white/20 rounded-xl font-semibold text-gray-300 hover:bg-white/5 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const selectedSection = allSections[selectedMainIndex];
  const SelectedIcon = selectedSection.icon;

  return (
    <div className="min-h-screen overflow-x-hidden relative" style={{ 
      color: theme === 'dark' ? 'white' : '#000000'
    }}>
      {/* Background Image - Both Modes with Light Filter */}
      <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: theme === 'light' 
                ? `url('/light%20mode%20.png')`
                : `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')`,
            }}
          >
            <div className={`absolute inset-0 ${theme === 'dark' ? `bg-gradient-to-br ${styles.background}` : ''}`} style={{
              backdropFilter: theme === 'light' ? 'blur(2px)' : undefined,
              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : undefined
            }}></div>
          </div>

          {/* Animated Background Pattern - Dark Mode Only */}
          {theme === 'dark' && (
            <div className={`absolute inset-0 ${styles.blobs}`}>
              <div className={`absolute top-10 left-10 w-32 h-32 ${styles.blobColors[0]} rounded-full blur-3xl animate-pulse`}></div>
              <div className={`absolute top-40 right-20 w-40 h-40 ${styles.blobColors[1]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
              <div className={`absolute bottom-20 left-1/2 w-36 h-36 ${styles.blobColors[2]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
            </div>
          )}
        </>
      {/* Visible Animated Icon Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMainIndex}
          initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
          animate={{ 
            opacity: [0, 0.1, 0.08, 0.1],
            scale: [0.98, 1, 1.01, 1],
            rotate: 0
          }}
          exit={{ opacity: 0, scale: 1.1, rotate: 10 }}
          transition={{ 
            opacity: { duration: 1.2, times: [0, 0.4, 0.7, 1], ease: "easeInOut" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 0.8, ease: "easeOut" }
          }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        >
          <div className={`${
            selectedSection.color === 'emerald' ? 'text-emerald-500/[0.12]' : 'text-amber-500/[0.12]'
          }`}>
            <SelectedIcon 
              className="w-[600px] h-[600px]"
              strokeWidth={0.6}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Animated Glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`glow-${selectedMainIndex}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1,
            scale: [1, 1.05, 1]
          }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ 
            opacity: { duration: 0.8 },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="fixed inset-0 pointer-events-none"
        >
          <motion.div 
            animate={{
              opacity: [0.06, 0.09, 0.06]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] ${
              selectedSection.color === 'emerald' ? 'bg-emerald-500/[0.06]' : 'bg-amber-500/[0.06]'
            }`} 
          />
        </motion.div>
      </AnimatePresence>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section with Large Logo and Auth Buttons - Centered */}
        <div className="flex flex-col items-center justify-center mb-8 sm:mb-12 md:mb-16 mt-8 sm:mt-12 md:mt-16">
          <Logo size="lg" className="scale-110 sm:scale-125 md:scale-150 mb-6 sm:mb-8" />
          
          {/* Auth Buttons directly below logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/select-sector"
              className="px-8 sm:px-10 py-3.5 sm:py-4 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg whitespace-nowrap"
              style={{
                background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                border: theme === 'light' ? '3px solid #1A1A1A' : '2px solid rgba(255, 255, 255, 0.1)',
                color: theme === 'light' ? '#1A1A1A' : '#D1D5DB',
                boxShadow: theme === 'light' ? '0 6px 20px rgba(0, 0, 0, 0.25)' : 'none'
              }}
            >
              Se Connecter
            </Link>
            <Link
              to="/register"
              className="px-8 sm:px-12 py-3.5 sm:py-4 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg whitespace-nowrap"
              style={{
                background: theme === 'light' 
                  ? '#10B981'
                  : 'rgba(16, 185, 129, 0.2)',
                border: theme === 'light' ? 'none' : '2px solid rgba(16, 185, 129, 0.3)',
                color: '#FFFFFF',
                boxShadow: theme === 'light' 
                  ? '0 6px 24px rgba(16, 185, 129, 0.4)'
                  : '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              S'inscrire
            </Link>
          </div>
        </div>

        {/* Unified Carousel - All Sections */}
        <div className="w-full max-w-7xl mx-auto mb-8 sm:mb-12 md:mb-16 px-4">
          <div className="relative overflow-visible">
            {/* Navigation Buttons - Conditional visibility */}
            {selectedMainIndex > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.15, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setDirection(-1);
                  setSelectedMainIndex(selectedMainIndex - 1);
                }}
                className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                  border: theme === 'light' ? '3px solid #1A1A1A' : '2px solid rgba(255, 255, 255, 0.1)',
                  color: theme === 'light' ? '#1A1A1A' : 'white',
                  boxShadow: theme === 'light' ? '0 6px 20px rgba(0, 0, 0, 0.3)' : '0 0 20px rgba(0, 0, 0, 0.5)'
                }}
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" strokeWidth={theme === 'light' ? 3 : 2} />
              </motion.button>
            )}
            {selectedMainIndex < allSections.length - 1 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.15, x: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setDirection(1);
                  setSelectedMainIndex(selectedMainIndex + 1);
                }}
                className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                  border: theme === 'light' ? '3px solid #1A1A1A' : '2px solid rgba(255, 255, 255, 0.1)',
                  color: theme === 'light' ? '#1A1A1A' : 'white',
                  boxShadow: theme === 'light' ? '0 6px 20px rgba(0, 0, 0, 0.3)' : '0 0 20px rgba(0, 0, 0, 0.5)'
                }}
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" strokeWidth={theme === 'light' ? 3 : 2} />
              </motion.button>
            )}

            {/* Cards Container with Fade Effect */}
            <div className="flex items-center justify-center gap-4 md:gap-6 py-6 md:py-8 overflow-visible">
              <AnimatePresence mode="sync">
              {allSections.map((sector, index) => {
                const isSelected = index === selectedMainIndex;
                const distance = Math.abs(index - selectedMainIndex);
                const isVisible = isMobile ? isSelected : distance <= 2;
                const Icon = sector.icon;

                return (
                  <motion.div
                    key={sector.id}
                    initial={{
                      x: direction > 0 ? 300 : -300,
                      opacity: 0,
                      scale: 0.8
                    }}
                    animate={{
                      scale: isSelected ? (isMobile ? 1 : isTablet ? 1.05 : 1.1) : distance === 1 ? (isTablet ? 0.85 : 0.8) : 0.7,
                      opacity: isSelected ? 1 : (isMobile ? 0 : distance === 1 ? 0.5 : 0.25),
                      x: isMobile ? 0 : (index - selectedMainIndex) * (isTablet ? 25 : 35),
                      filter: isSelected ? 'blur(0px)' : distance === 1 ? 'blur(1px)' : 'blur(3px)',
                    }}
                    exit={{
                      x: direction > 0 ? -300 : 300,
                      opacity: 0,
                      scale: 0.8
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    onClick={() => {
                      if (index !== selectedMainIndex) {
                        setDirection(index > selectedMainIndex ? 1 : -1);
                      }
                      setSelectedMainIndex(index);
                      if (sector.type === 'main' || sector.type === 'user') {
                        setActiveModal(sector.id);
                      }
                    }}
                    className={`relative cursor-pointer ${
                      isVisible ? 'block' : 'hidden'
                    }`}
                    style={{
                      width: isMobile ? '85vw' : isTablet ? (isSelected ? '55vw' : '45vw') : (isSelected ? '500px' : '380px'),
                      maxWidth: isMobile ? '90vw' : isTablet ? '600px' : '500px',
                      minHeight: 'auto',
                      height: 'auto'
                    }}
                  >
                    {/* Opaque White Card with Strong Shadow */}
                    <div
                      className={`relative rounded-2xl transition-all duration-500 flex flex-col justify-between p-6 sm:p-8 md:p-10 min-h-full ${
                        theme === 'dark' ? `border ${sector.borderColor} ${sector.bgColor} backdrop-blur-2xl` : ''
                      } ${
                        isSelected
                          ? 'shadow-[0_0_40px_rgba(16,185,129,0.2)]'
                          : ''
                      }`}
                      style={{
                        border: theme === 'light' ? `3px solid ${sector.color === 'emerald' ? '#10B981' : '#F59E0B'}` : undefined,
                        background: theme === 'light' 
                          ? '#FFFFFF'
                          : undefined,
                        boxShadow: theme === 'light' 
                          ? '0 12px 40px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)' 
                          : undefined
                      }}
                    >
                      {/* Animated Glow on Selected Card */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: [0.1, 0.15, 0.1],
                            scale: [1, 1.005, 1]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className={`absolute -inset-[2px] rounded-2xl blur-xl -z-10 bg-gradient-to-br ${sector.bgColor.replace('/40', '/25').replace('/20', '/30')}`}
                        />
                      )}

                      {/* Card Content - Header Section */}
                      <div className="text-center flex-shrink-0">
                        <div 
                          className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 transition-all shadow-lg ${
                            isSelected ? 'group-hover:scale-110' : ''
                          } ${theme === 'dark' ? `backdrop-blur-sm border-2 ${sector.borderColor} bg-gradient-to-br ${sector.bgColor.replace('/40', '/30').replace('/20', '/15')}` : ''}`}
                          style={{
                            border: theme === 'light' ? 'none' : undefined,
                            background: theme === 'light'
                              ? (sector.color === 'emerald' ? '#10B981' : '#F59E0B')
                              : undefined,
                            boxShadow: theme === 'light' ? '0 4px 16px rgba(0, 0, 0, 0.2)' : undefined
                          }}
                        >
                          <Icon 
                            className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 transition-all duration-500 ${
                              isSelected ? 'group-hover:rotate-12' : ''
                            } ${theme === 'dark' ? sector.textColor : ''}`}
                            strokeWidth={theme === 'light' ? 3 : 1.5}
                            style={{
                              color: theme === 'light' ? '#FFFFFF' : undefined
                            }}
                          />
                        </div>
                        <h2 
                          className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 transition-colors ${
                            isSelected ? `hover:${sector.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}` : ''
                          }`}
                          style={{ 
                            color: theme === 'light' ? '#1A1A1A' : 'white',
                            letterSpacing: '0.02em',
                            textShadow: theme === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.1)' : undefined
                          }}
                        >
                          {sector.title}
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl font-bold px-2 mb-4" style={{ color: theme === 'light' ? '#1A1A1A' : '#D1D5DB' }}>
                          {sector.subtitle}
                        </p>
                      </div>

                      {/* Middle Content - Flexible Space */}
                      <div className="flex-grow flex flex-col justify-center">
                        {/* Tagline - Value Proposition */}
                        {isSelected && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-base sm:text-lg md:text-xl leading-relaxed px-2 mb-4 font-semibold"
                          style={{ color: theme === 'light' ? '#1A1A1A' : 'rgba(209, 213, 219, 0.9)' }}
                        >
                          {sector.tagline}
                        </motion.p>
                        )}

                        {/* Badges - Modern Horizontal Pills */}
                        {isSelected && sector.badges && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-wrap gap-2 justify-center mb-3"
                        >
                          {sector.badges.map((badge: any, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all transform hover:scale-105 ${
                                theme === 'dark' ? `backdrop-blur-sm border-2 border ${sector.borderColor} bg-white/5 hover:bg-white/10` : 'hover:brightness-110'
                              }`}
                              style={{
                                border: theme === 'light' ? 'none' : undefined,
                                background: theme === 'light'
                                  ? (sector.color === 'emerald' ? '#10B981' : '#F59E0B')
                                  : undefined,
                                boxShadow: theme === 'light' ? '0 3px 10px rgba(0, 0, 0, 0.2)' : undefined
                              }}
                            >
                              <span className="text-xl">{badge.icon}</span>
                              <span className="text-sm sm:text-base md:text-lg font-black" style={{ color: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)' }}>{badge.label}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                        )}
                      </div>

                      {/* Bottom Section - CTA Button */}
                      <div className="flex-shrink-0">
                        {isSelected && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className={`w-full py-4 px-8 rounded-xl font-black text-base sm:text-lg md:text-xl uppercase tracking-wide transition-all transform hover:scale-[1.02] active:scale-95 ${
                            theme === 'dark' ? `${sector.textColor} border-2 border ${sector.borderColor} bg-gradient-to-r ${sector.bgColor}` : ''
                          }`}
                          style={{
                            border: theme === 'light' ? 'none' : undefined,
                            background: theme === 'light'
                              ? (sector.color === 'emerald' ? '#10B981' : '#F59E0B')
                              : undefined,
                            color: theme === 'light' ? '#FFFFFF' : undefined,
                            boxShadow: theme === 'light' 
                              ? `0 6px 20px ${sector.color === 'emerald' ? 'rgba(16,185,129,0.4)' : 'rgba(251,146,60,0.4)'}`
                              : `0 4px 15px ${sector.color === 'emerald' ? 'rgba(16,185,129,0.2)' : 'rgba(251,146,60,0.2)'}`,
                          }}
                        >
                          {sector.cta}
                        </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>

            {/* Progress Indicators */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 flex-wrap">
              {allSections.map((sector, index) => (
                <motion.button
                  key={sector.id}
                  onClick={() => {
                    setDirection(index > selectedMainIndex ? 1 : -1);
                    setSelectedMainIndex(index);
                  }}
                  whileHover={{ scale: 1.2 }}
                  className="relative"
                >
                  <div
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      index === selectedMainIndex
                        ? `w-8 sm:w-10 shadow-[0_0_10px_rgba(16,185,129,0.5)]`
                        : 'w-1.5 sm:w-2'
                    } ${theme === 'dark' ? sector.glowColor : ''}`}
                    style={{
                      background: theme === 'light'
                        ? (index === selectedMainIndex
                          ? (sector.color === 'emerald' ? '#10B981' : '#F59E0B')
                          : 'rgba(107, 114, 128, 0.4)')
                        : undefined
                    }}
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modals */}
      {activeModal && <Modal type={activeModal} />}
    </div>
  );
}
