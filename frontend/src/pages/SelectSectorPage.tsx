import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCardStyles, getTextStyles, getButtonStyles } from '@/utils/cardStyles';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { Sprout, Beef, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SelectSectorPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sectors = [
    {
      id: 'agriculture',
      title: t('AGRICULTURE', 'AGRICULTURE'),
      subtitle: t('Cultures et Produits Agricoles', 'Crops and Agricultural Products'),
      tagline: t('Accédez au plus grand marché de produits frais et de semences du Cameroun', 'Access the largest market of fresh products and seeds in Cameroon'),
      icon: <Sprout className="h-10 w-10 sm:h-12 sm:w-12 text-[#7A7D5C]" strokeWidth={1.5} />,
      color: 'olive',
      items: [
        t('Semences', 'Seeds'),
        t('Légumes', 'Vegetables'),
        t('Fruits', 'Fruits'),
        t('Céréales', 'Cereals')
      ],
      link: '/login/agriculture',
      bgImage: 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=2000'
    },
    {
      id: 'elevage',
      title: t('ÉLEVAGE', 'LIVESTOCK'),
      subtitle: t('Animaux et Produits d\'Élevage', 'Animals and Livestock Products'),
      tagline: t('Trouvez les meilleurs animaux et produits d\'élevage pour votre exploitation', 'Find the best animals and livestock products for your farm'),
      icon: <Beef className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" strokeWidth={1.5} />,
      color: 'red',
      items: [
        t('Bovins', 'Cattle'),
        t('Caprins', 'Goats'),
        t('Porcins', 'Pigs'),
        t('Volailles', 'Poultry')
      ],
      link: '/login/elevage',
      bgImage: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=2000'
    }
  ];

  const _selectedSector = sectors[selectedIndex];

  // Both sectors visible - no selection needed

  return (
    <div className="min-h-screen relative overflow-hidden font-['Inter','Plus_Jakarta_Sans',sans-serif]" style={{ color: theme === 'dark' ? 'white' : '#000000' }}>
      {/* Background Image - Dynamic based on selected section */}
      {sectors.map((sector, index) => (
        <motion.div
          key={`bg-${sector.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: index === selectedIndex ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ zIndex: index === selectedIndex ? 1 : 0 }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${sector.bgImage}')`,
            }}
          >
            <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-green-950/85 via-teal-950/80 to-amber-950/85' : ''}`} style={{
              backdropFilter: theme === 'light' ? 'blur(0.5px)' : undefined,
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.15)' : undefined
            }}></div>
          </div>
        </motion.div>
      ))}
      
      {/* Animated Background Pattern - Dark Mode Only */}
      {theme === 'dark' && (
        <div className="absolute inset-0 z-[2] opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#7A7D5C] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-amber-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/2 w-36 h-36 bg-teal-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <Logo size="xl" className="mb-4 sm:mb-6" />
          <div className="flex items-center w-full relative">
            {/* Bouton Retour - au bord gauche */}
            <button
              onClick={() => navigate('/')}
              className="absolute left-0 transition-all transform hover:scale-110 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                border: theme === 'light' ? '2px solid #1A1A1A' : '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'
              }}
            >
              <ChevronLeft 
                className="w-6 h-6" 
                strokeWidth={2.5}
                style={{ color: theme === 'light' ? '#1A1A1A' : '#FFFFFF' }}
              />
            </button>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl md:text-4xl font-black w-full text-center"
              style={{ color: theme === 'light' ? '#1A1A1A' : getTextStyles(theme).title }}
            >
              {t('Votre secteur', 'Your sector')}
            </motion.h1>
          </div>
        </div>

        {/* Horizontal Carousel - Both Cards Visible */}
        <div className="relative w-full max-w-7xl mx-auto px-4">
          {/* Navigation Arrows - Hidden on mobile, visible on tablet+ */}
          {selectedIndex > 0 && (
            <button
              onClick={() => setSelectedIndex(selectedIndex - 1)}
              className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                border: theme === 'light' ? '3px solid #1A1A1A' : '1px solid rgba(255, 255, 255, 0.1)',
                color: theme === 'light' ? '#1A1A1A' : 'white',
                boxShadow: theme === 'light' ? '0 6px 20px rgba(0, 0, 0, 0.3)' : '0 0 20px rgba(0, 0, 0, 0.5)',
                backdropFilter: theme === 'dark' ? 'blur(12px)' : 'none'
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {selectedIndex < sectors.length - 1 && (
            <button
              onClick={() => setSelectedIndex(selectedIndex + 1)}
              className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                border: theme === 'light' ? '3px solid #1A1A1A' : '1px solid rgba(255, 255, 255, 0.1)',
                color: theme === 'light' ? '#1A1A1A' : 'white',
                boxShadow: theme === 'light' ? '0 6px 20px rgba(0, 0, 0, 0.3)' : '0 0 20px rgba(0, 0, 0, 0.5)',
                backdropFilter: theme === 'dark' ? 'blur(12px)' : 'none'
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="flex items-stretch justify-center gap-6 sm:gap-8 lg:gap-12 py-6 md:py-8">
            {sectors.map((sector, index) => {
              const isSelected = index === selectedIndex;
              const isVisible = isMobile ? isSelected : true;
              
              if (!isVisible) return null;
              
              return (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, x: index > selectedIndex ? 300 : -300 }}
                animate={{ 
                  opacity: isSelected ? 1 : (isMobile ? 0 : 0.6), 
                  x: 0,
                  scale: isSelected ? 1.05 : 0.85,
                  filter: isSelected ? 'blur(0px)' : 'blur(2px)',
                  y: isSelected ? 0 : 20
                }}
                exit={{ opacity: 0, x: index > selectedIndex ? -300 : 300 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={() => setSelectedIndex(index)}
                className="relative w-full sm:w-1/2 sm:max-w-lg"
                style={{ pointerEvents: isSelected ? 'auto' : 'auto' }}
              >
                {/* Card with Hover Effect and Active State */}
                <Link
                  to={sector.link}
                  className={`block relative w-full rounded-2xl transition-all duration-500 p-4 sm:p-5 md:p-6 cursor-pointer group ${
                    theme === 'dark' ? 'backdrop-blur-2xl border' : ''
                  } ${isSelected ? 'ring-4 ring-offset-2' : ''}`}
                  style={{
                    minHeight: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: isSelected ? 'translateZ(0)' : 'translateZ(-20px)',
                    ...(theme === 'dark' ? getCardStyles(theme, sector.color === 'red' ? 'red' : 'olive') : {
                      background: '#FFFFFF',
                      border: isSelected 
                        ? `4px solid ${sector.color === 'olive' ? '#2E7D32' : '#B71C1C'}`
                        : `2px solid ${sector.color === 'olive' ? '#2E7D32' : '#B71C1C'}`,
                      boxShadow: isSelected 
                        ? `0 25px 70px rgba(${sector.color === 'olive' ? '16,185,129' : '183,28,28'},0.5), 0 10px 25px rgba(0, 0, 0, 0.3)`
                        : '0 8px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)'
                    })
                  }}
                >

                  <div className="flex flex-col gap-2 md:gap-3 flex-grow">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div 
                        className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                          theme === 'dark' ? `backdrop-blur-sm border ${sector.color === 'olive' ? 'bg-[#F5F5F0]0/20 border-[#F5F5F0]0/30' : 'bg-red-500/20 border-red-500/30'}` : ''
                        }`}
                        style={{
                          background: theme === 'light' ? (sector.color === 'olive' ? '#2E7D32' : '#B71C1C') : undefined,
                          boxShadow: theme === 'light' ? '0 4px 16px rgba(0, 0, 0, 0.2)' : undefined
                        }}
                      >
                        {theme === 'light' ? (
                          sector.color === 'olive' ? 
                            <Sprout className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={3} /> :
                            <Beef className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={3} />
                        ) : sector.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-left pl-2" style={{ 
                      color: theme === 'light' ? '#1A1A1A' : getTextStyles(theme).title,
                      textShadow: theme === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.1)' : undefined
                    }}>
                      {sector.title}
                    </h2>
                    <p className="text-sm md:text-base font-bold text-left pl-2" style={{ 
                      color: theme === 'light' ? '#374151' : getTextStyles(theme).subtitle
                    }}>
                      {sector.subtitle}
                    </p>

                    {/* Description/Tagline */}
                    <p className="text-sm md:text-base text-left font-medium pl-2 pr-2 mb-1" style={{ 
                      color: theme === 'light' ? '#1A1A1A' : getTextStyles(theme).body
                    }}>
                      {sector.tagline}
                    </p>

                    {/* Items Grid - Badge Style 2x2 */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 justify-items-center mb-2 w-full max-w-[280px] sm:max-w-xs mx-auto px-2">
                      {sector.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold w-full max-w-[120px] sm:max-w-[130px]"
                          style={{ 
                            backgroundColor: '#FFFFFF',
                            border: `2px solid ${sector.color === 'olive' ? '#2E7D32' : '#B71C1C'}`,
                            color: '#000000',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Button */}
                    <div
                      className="w-full py-3 rounded-xl font-black text-center transition-all text-sm uppercase tracking-wide mt-auto"
                      style={{
                        ...(theme === 'dark' ? getButtonStyles(theme, 'primary', sector.color === 'red' ? 'red' : 'olive') : {
                          background: sector.color === 'olive' ? '#2E7D32' : '#B71C1C',
                          color: '#FFFFFF',
                          border: 'none',
                          boxShadow: `0 6px 20px rgba(${sector.color === 'olive' ? '16,185,129' : '183,28,28'},0.4)`
                        })
                      }}
                    >
                      {t('Entrer dans le marché', 'Enter the market')}
                    </div>
                  </div>
                </Link>
              </motion.div>
              );
            })}
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {sectors.map((sector, index) => (
              <button
                key={sector.id}
                onClick={() => setSelectedIndex(index)}
                className="transition-all duration-300 hover:scale-125"
              >
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === selectedIndex
                      ? 'w-10'
                      : 'w-2'
                  }`}
                  style={{
                    backgroundColor: index === selectedIndex 
                      ? (sector.color === 'olive' ? '#2E7D32' : '#B71C1C')
                      : theme === 'light' ? '#D1D5DB' : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: index === selectedIndex 
                      ? `0 0 10px rgba(${sector.color === 'olive' ? '16,185,129' : '183,28,28'},0.5)`
                      : 'none'
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <p className="text-sm md:text-base font-semibold rounded-full px-4 md:px-6 py-2 md:py-3 inline-block text-center" style={{
            maxWidth: '90%',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            color: theme === 'light' ? '#1A1A1A' : '#9CA3AF',
            background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)',
            border: theme === 'light' ? '2px solid #E5E7EB' : '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: theme === 'dark' ? 'blur(4px)' : 'none',
            boxShadow: theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
          }}>
            {t('Vous pouvez travailler dans les deux secteurs après inscription', 'You can work in both sectors after registration')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
