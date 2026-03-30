import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, X, CheckCircle, PackageSearch, ShoppingCart, Beef, ChevronLeft, ChevronRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import LiquidDistortion from '@/components/LiquidDistortion';

export default function HomePage() {
  const { theme } = useTheme();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedMainIndex, setSelectedMainIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLiquidTransitioning, setIsLiquidTransitioning] = useState(false);

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
        { label: 'Semences' },
        { label: 'Légumes' },
        { label: 'Fruits' },
        { label: 'Céréales' }
      ],
      bgImage: 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=2000'
    },
    {
      id: 'elevage',
      title: 'ÉLEVAGE',
      subtitle: 'Animaux et Produits d\'Élevage',
      tagline: 'Trouvez les meilleurs animaux et produits d\'élevage pour votre exploitation',
      cta: 'Découvrir les offres',
      icon: Beef,
      color: 'red',
      bgColor: 'from-red-950/40 via-red-900/20 to-red-950/40',
      borderColor: 'border-red-700/30',
      textColor: 'text-red-700',
      glowColor: 'bg-red-700',
      type: 'main',
      badges: [
        { label: 'Bovins' },
        { label: 'Caprins' },
        { label: 'Volailles' },
        { label: 'Porcins' }
      ],
      bgImage: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=2000'
    },
    {
      id: 'fournisseur',
      title: 'Fournisseurs',
      subtitle: 'Semences et animaux',
      tagline: 'Touchez des milliers d\'agriculteurs et éleveurs',
      cta: 'Devenir fournisseur',
      icon: PackageSearch,
      color: 'blue',
      bgColor: 'from-blue-950/40 via-blue-900/20 to-blue-950/40',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      glowColor: 'bg-blue-500',
      type: 'user',
      badges: [
        { label: 'Visibilité' },
        { label: 'Ventes' },
        { label: 'Réseau' },
        { label: 'Clients' }
      ],
      bgImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000'
    },
    {
      id: 'producteur',
      title: 'Producteurs',
      subtitle: 'Agriculture et élevage',
      tagline: 'Vendez vos récoltes et productions directement aux acheteurs sans intermédiaire',
      cta: 'Rejoindre la communauté',
      icon: Sprout,
      color: 'gray',
      bgColor: 'from-gray-950/40 via-gray-900/20 to-gray-950/40',
      borderColor: 'border-gray-500/30',
      textColor: 'text-gray-400',
      glowColor: 'bg-gray-500',
      type: 'user',
      badges: [
        { label: 'Meilleurs prix' },
        { label: 'Paiement rapide' },
        { label: 'Zéro commission' }
      ],
      bgImage: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=2000'
    },
    {
      id: 'acheteur',
      title: 'Acheteurs',
      subtitle: 'Produits agricoles et animaux',
      tagline: 'Approvisionnez-vous en produits frais directement auprès des producteurs locaux',
      cta: 'Commencer mes achats',
      icon: ShoppingCart,
      color: 'green',
      bgColor: 'from-green-950/40 via-green-900/20 to-green-950/40',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      glowColor: 'bg-green-500',
      type: 'user',
      badges: [
        { label: 'Fraîcheur garantie' },
        { label: 'Prix producteur' },
        { label: 'Livraison' }
      ],
      bgImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000'
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
      color: 'brown',
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
      color: 'blue',
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
      color: 'gray',
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
      color: 'green',
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
        bg: 'from-green-950/60 via-green-900/40 to-green-950/60',
        text: 'text-[#2E7D32]',
        border: 'border-[#2E7D32]/50',
        glow: 'bg-[#2E7D32]',
        shadow: 'rgba(46,125,50,0.3)',
        hex: '#2E7D32'
      },
      blue: {
        bg: 'from-blue-950/60 via-blue-900/40 to-blue-950/60',
        text: 'text-[#1565C0]',
        border: 'border-[#1565C0]/50',
        glow: 'bg-[#1565C0]',
        shadow: 'rgba(21,101,192,0.3)',
        hex: '#1565C0'
      },
      gray: {
        bg: 'from-gray-950/60 via-gray-900/40 to-gray-950/60',
        text: 'text-[#6B7280]',
        border: 'border-[#6B7280]/50',
        glow: 'bg-[#6B7280]',
        shadow: 'rgba(107,114,128,0.3)',
        hex: '#6B7280'
      },
      brown: {
        bg: 'from-red-950/60 via-red-900/40 to-red-950/60',
        text: 'text-[#B71C1C]',
        border: 'border-[#B71C1C]/50',
        glow: 'bg-[#B71C1C]',
        shadow: 'rgba(183,28,28,0.3)',
        hex: '#B71C1C'
      }
    };

    const colors = colorClasses[content.color as keyof typeof colorClasses];

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={() => setActiveModal(null)}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2"
          style={{ 
            backgroundColor: theme === 'light' ? '#FFFFFF' : 'rgba(15, 23, 20, 0.95)',
            borderColor: colors.hex,
            boxShadow: theme === 'light' ? '0 20px 60px rgba(0,0,0,0.3)' : `0 20px 60px ${colors.shadow}`
          }}
        >
          {/* Header */}
          <div 
            className="relative p-6 sm:p-8 border-b"
            style={{ borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255,255,255,0.1)' }}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-full p-2 transition-all"
              style={{ 
                color: theme === 'light' ? '#6B7280' : 'rgba(255,255,255,0.8)',
                backgroundColor: theme === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.1)'
              }}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3"
              style={{ color: colors.hex }}
            >
              {content.title}
            </h2>
            <p 
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: theme === 'light' ? '#4B5563' : 'rgba(209,213,219,0.9)' }}
            >
              {content.description}
            </p>
          </div>

          {/* Contenu */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* Statistiques - Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              {content.stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border-2 transition-all shadow-md"
                  style={{
                    borderColor: colors.hex,
                    backgroundColor: theme === 'light' ? '#F9FAFB' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div 
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1"
                    style={{ color: colors.hex }}
                  >
                    {stat.value}
                  </div>
                  <div 
                    className="text-[10px] sm:text-xs md:text-sm font-semibold truncate"
                    style={{ color: theme === 'light' ? '#374151' : '#E5E7EB' }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Fonctionnalités */}
            <h3 
              className="text-lg sm:text-xl font-bold mb-4 sm:mb-6"
              style={{ color: theme === 'light' ? '#1F2937' : '#FFFFFF' }}
            >
              Fonctionnalités
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {content.features.map((feature, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-2 sm:gap-3"
                >
                  <div 
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: colors.hex }}
                  >
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span 
                    className="text-sm sm:text-base leading-relaxed"
                    style={{ color: theme === 'light' ? '#4B5563' : '#D1D5DB' }}
                  >
                    {feature}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Boutons d'action */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to={`/register?sector=${type === 'elevage' ? 'elevage' : type === 'agriculture' ? 'agriculture' : 'agriculture'}`}
                className="flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-center transition-all transform hover:scale-[1.02] active:scale-95"
                style={{ 
                  backgroundColor: colors.hex,
                  color: '#FFFFFF',
                  boxShadow: `0 4px 15px ${colors.shadow}`
                }}
              >
                Commencer maintenant
              </Link>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all"
                style={{ 
                  border: theme === 'light' ? '2px solid #D1D5DB' : '2px solid rgba(255,255,255,0.2)',
                  color: theme === 'light' ? '#374151' : '#D1D5DB',
                  backgroundColor: theme === 'light' ? '#F9FAFB' : 'transparent'
                }}
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
      {/* Liquid Distortion Background Effect */}
      <LiquidDistortion 
        images={allSections.map(s => s.bgImage)}
        currentIndex={selectedMainIndex}
        className="z-[1]"
        onTransitionStart={() => setIsLiquidTransitioning(true)}
        onTransitionEnd={() => setIsLiquidTransitioning(false)}
      />
      
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
                boxShadow: theme === 'light' ? '0 6px 20px rgba(183, 28, 28, 0.25)' : 'none'
              }}
            >
              Se Connecter
            </Link>
            <Link
              to={`/register?sector=${selectedSection.id === 'elevage' ? 'elevage' : 'agriculture'}`}
              className="px-8 sm:px-12 py-3.5 sm:py-4 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-base sm:text-lg whitespace-nowrap"
              style={{
                background: selectedSection.id === 'elevage' ? '#B71C1C' : selectedSection.id === 'agriculture' ? '#2E7D32' : selectedSection.color === 'blue' ? '#1565C0' : selectedSection.color === 'green' ? '#2E7D32' : selectedSection.color === 'gray' ? '#6B7280' : '#2E7D32',
                border: 'none',
                color: '#FFFFFF',
                boxShadow: `0 6px 24px ${selectedSection.id === 'elevage' ? 'rgba(183, 28, 28, 0.5)' : selectedSection.id === 'agriculture' ? 'rgba(46, 125, 50, 0.5)' : selectedSection.color === 'blue' ? 'rgba(21, 101, 192, 0.5)' : selectedSection.color === 'green' ? 'rgba(46, 125, 50, 0.5)' : selectedSection.color === 'gray' ? 'rgba(107, 114, 128, 0.5)' : 'rgba(46, 125, 50, 0.5)'}`
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
                  background: '#FFFFFF',
                  border: `3px solid ${selectedSection.color === 'emerald' ? '#2E7D32' : selectedSection.color === 'red' ? '#B71C1C' : selectedSection.color === 'blue' ? '#1565C0' : selectedSection.color === 'green' ? '#2E7D32' : selectedSection.color === 'gray' ? '#6B7280' : '#F59E0B'}`,
                  color: selectedSection.color === 'emerald' ? '#2E7D32' : selectedSection.color === 'red' ? '#B71C1C' : selectedSection.color === 'blue' ? '#1565C0' : selectedSection.color === 'green' ? '#2E7D32' : selectedSection.color === 'gray' ? '#6B7280' : '#F59E0B',
                  boxShadow: `0 6px 20px ${selectedSection.color === 'emerald' ? 'rgba(46, 125, 50, 0.3)' : selectedSection.color === 'red' ? 'rgba(183, 28, 28, 0.3)' : selectedSection.color === 'blue' ? 'rgba(21, 101, 192, 0.3)' : selectedSection.color === 'green' ? 'rgba(46, 125, 50, 0.3)' : selectedSection.color === 'gray' ? 'rgba(107, 114, 128, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
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
                  background: '#FFFFFF',
                  border: `3px solid ${selectedSection.color === 'emerald' ? '#2E7D32' : selectedSection.color === 'red' ? '#B71C1C' : selectedSection.color === 'blue' ? '#1565C0' : selectedSection.color === 'green' ? '#2E7D32' : selectedSection.color === 'gray' ? '#6B7280' : '#F59E0B'}`,
                  color: selectedSection.color === 'emerald' ? '#2E7D32' : selectedSection.color === 'red' ? '#B71C1C' : selectedSection.color === 'blue' ? '#1565C0' : selectedSection.color === 'green' ? '#2E7D32' : selectedSection.color === 'gray' ? '#6B7280' : '#F59E0B',
                  boxShadow: `0 6px 20px ${selectedSection.color === 'emerald' ? 'rgba(46, 125, 50, 0.3)' : selectedSection.color === 'red' ? 'rgba(183, 28, 28, 0.3)' : selectedSection.color === 'blue' ? 'rgba(21, 101, 192, 0.3)' : selectedSection.color === 'green' ? 'rgba(46, 125, 50, 0.3)' : selectedSection.color === 'gray' ? 'rgba(107, 114, 128, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                }}
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" strokeWidth={theme === 'light' ? 3 : 2} />
              </motion.button>
            )}

            {/* Cards Container */}
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
                      height: 'auto',
                      filter: isLiquidTransitioning ? 'url(#liquid-distortion)' : 'none',
                      transition: 'filter 0.3s ease-out'
                    }}
                  >
                    {/* Opaque White Card with Strong Shadow */}
                    <div
                      className={`relative rounded-2xl transition-all duration-500 flex flex-col justify-between p-4 sm:p-5 md:p-6 min-h-full ${
                        theme === 'dark' ? `border ${sector.borderColor} ${sector.bgColor} backdrop-blur-2xl` : ''
                      } ${
                        isSelected
                          ? 'shadow-[0_0_40px_rgba(16,185,129,0.2)]'
                          : ''
                      }`}
                      style={{
                        border: theme === 'light' ? `3px solid ${sector.color === 'emerald' ? '#2E7D32' : sector.color === 'red' ? '#B71C1C' : sector.color === 'blue' ? '#1565C0' : sector.color === 'green' ? '#2E7D32' : sector.color === 'gray' ? '#6B7280' : '#F59E0B'}` : undefined,
                        background: theme === 'light' 
                          ? '#FFFFFF'
                          : undefined,
                        boxShadow: theme === 'light' 
                          ? '0 12px 40px rgba(183, 28, 28, 0.25), 0 4px 12px rgba(183, 28, 28, 0.15)' 
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
                          className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-all shadow-lg ${
                            isSelected ? 'group-hover:scale-110' : ''
                          } ${theme === 'dark' ? `backdrop-blur-sm border-2 ${sector.borderColor} bg-gradient-to-br ${sector.bgColor.replace('/40', '/30').replace('/20', '/15')}` : ''}`}
                          style={{
                            border: theme === 'light' ? 'none' : undefined,
                            background: theme === 'light'
                              ? (sector.color === 'emerald' ? '#2E7D32' : sector.color === 'red' ? '#B71C1C' : sector.color === 'blue' ? '#1565C0' : sector.color === 'green' ? '#2E7D32' : sector.color === 'gray' ? '#6B7280' : '#F59E0B')
                              : undefined,
                            boxShadow: theme === 'light' ? '0 4px 16px rgba(183, 28, 28, 0.2)' : undefined
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
                          className={`text-xl sm:text-2xl md:text-3xl font-black mb-1 sm:mb-2 transition-colors text-left pl-2 ${
                            isSelected ? `hover:${sector.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}` : ''
                          }`}
                          style={{ 
                            color: theme === 'light' ? '#1A1A1A' : 'white',
                            letterSpacing: '0.02em',
                            textShadow: theme === 'light' ? '0 1px 2px rgba(183, 28, 28, 0.1)' : undefined
                          }}
                        >
                          {sector.title}
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg font-bold pl-2 pr-2 mb-2 text-left" style={{ color: theme === 'light' ? '#1A1A1A' : '#D1D5DB' }}>
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
                          className="text-sm sm:text-base md:text-lg leading-relaxed pl-2 pr-2 mb-2 font-semibold text-left"
                          style={{ color: theme === 'light' ? '#1A1A1A' : 'rgba(209, 213, 219, 0.9)' }}
                        >
                          {sector.tagline}
                        </motion.p>
                        )}

                        {/* Badges - 2x2 Grid Layout */}
                        {isSelected && sector.badges && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="grid grid-cols-2 gap-1.5 sm:gap-2 justify-items-center mb-2 w-full max-w-[280px] sm:max-w-xs mx-auto px-2"
                        >
                          {sector.badges.map((badge: any, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                              className={`flex items-center justify-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition-all transform hover:scale-105 w-full max-w-[120px] sm:max-w-[130px] ${
                                theme === 'dark' ? `backdrop-blur-sm border-2 ${sector.borderColor} bg-white/10 hover:bg-white/15` : ''
                              }`}
                              style={{
                                backgroundColor: theme === 'light' ? '#FFFFFF' : undefined,
                                border: `2px solid ${sector.color === 'emerald' ? '#2E7D32' : sector.color === 'red' ? '#B71C1C' : sector.color === 'blue' ? '#1565C0' : sector.color === 'green' ? '#2E7D32' : sector.color === 'gray' ? '#6B7280' : '#F59E0B'}`,
                                boxShadow: theme === 'light' ? '0 2px 8px rgba(183, 28, 28, 0.1)' : undefined
                              }}
                            >
                              <span className="text-xs sm:text-sm font-bold truncate" style={{ color: theme === 'light' ? '#000000' : 'rgba(255, 255, 255, 0.9)' }}>{badge.label}</span>
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
                          className={`w-full py-3 px-6 rounded-xl font-black text-sm sm:text-base uppercase tracking-wide transition-all transform hover:scale-[1.02] active:scale-95 ${
                            theme === 'dark' ? `${sector.textColor} border-2 border ${sector.borderColor} bg-gradient-to-r ${sector.bgColor}` : ''
                          }`}
                          style={{
                            border: theme === 'light' ? 'none' : undefined,
                            background: theme === 'light'
                              ? (sector.color === 'emerald' ? '#2E7D32' : sector.color === 'red' ? '#B71C1C' : sector.color === 'blue' ? '#1565C0' : sector.color === 'green' ? '#2E7D32' : sector.color === 'gray' ? '#6B7280' : '#F59E0B')
                              : undefined,
                            color: theme === 'light' ? '#FFFFFF' : undefined,
                            boxShadow: theme === 'light' 
                              ? `0 6px 20px ${sector.color === 'emerald' ? 'rgba(16,185,129,0.4)' : sector.color === 'red' ? 'rgba(183,28,28,0.4)' : sector.color === 'blue' ? 'rgba(21,101,192,0.4)' : sector.color === 'green' ? 'rgba(46,125,50,0.4)' : sector.color === 'gray' ? 'rgba(107,114,128,0.4)' : 'rgba(251,146,60,0.4)'}`
                              : `0 4px 15px ${sector.color === 'emerald' ? 'rgba(16,185,129,0.2)' : sector.color === 'red' ? 'rgba(183,28,28,0.2)' : sector.color === 'blue' ? 'rgba(21,101,192,0.2)' : sector.color === 'green' ? 'rgba(46,125,50,0.2)' : sector.color === 'gray' ? 'rgba(107,114,128,0.2)' : 'rgba(251,146,60,0.2)'}`,
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
                          ? (sector.color === 'emerald' ? '#2E7D32' : '#F59E0B')
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
