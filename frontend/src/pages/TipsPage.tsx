import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, Calendar, TrendingUp, Heart, Leaf, Sprout, Droplets, Sun, Package } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getTextStyles, getCardStyles } from '@/utils/cardStyles';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: 'agriculture' | 'elevage' | 'commerce';
  season: string;
  author: string;
  date: string;
  likes: number;
}

export default function TipsPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedSector, setSelectedSector] = useState<'agriculture' | 'elevage' | 'all'>('all');

  // Mock data - À remplacer par des données de l'API
  const tips: Tip[] = [
    {
      id: '1',
      title: 'C\'est le moment de planter le maïs!',
      content: 'Mars est la période idéale pour planter le maïs dans la région du Centre. Préparez vos champs et profitez des premières pluies.',
      category: 'agriculture',
      season: 'Saison des pluies',
      author: 'Dr. Jean Kamga, Agronome',
      date: '2024-03-15',
      likes: 45,
    },
    {
      id: '2',
      title: 'Vaccination des volailles - Important!',
      content: 'N\'oubliez pas de vacciner vos poulets contre la maladie de Newcastle. Consultez un vétérinaire pour le calendrier vaccinal.',
      category: 'elevage',
      season: 'Toute l\'année',
      author: 'Dr. Marie Ngo, Vétérinaire',
      date: '2024-03-14',
      likes: 38,
    },
    {
      id: '3',
      title: 'Prix des tomates en hausse',
      content: 'Les prix des tomates augmentent en ce moment. C\'est le bon moment pour vendre si vous avez des stocks.',
      category: 'commerce',
      season: 'Mars',
      author: 'Paul Mbida, Conseiller',
      date: '2024-03-13',
      likes: 52,
    },
  ];

  const filteredTips = selectedSector === 'all'
    ? tips
    : tips.filter(t => t.category === selectedSector);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'agriculture': return <Leaf className="h-5 w-5" />;
      case 'elevage': return <Sprout className="h-5 w-5" />;
      case 'commerce': return <TrendingUp className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-['Inter','Plus_Jakarta_Sans',sans-serif]">
      {/* Background Image - Same as other pages */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/85 via-teal-950/80 to-amber-950/85"></div>
      </div>

      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-amber-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-teal-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Visible Animated Icon Background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
        animate={{ 
          opacity: [0, 0.1, 0.08, 0.1],
          scale: [0.98, 1, 1.01, 1],
          rotate: 0
        }}
        transition={{ 
          opacity: { duration: 1.2, times: [0, 0.4, 0.7, 1], ease: "easeInOut" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 0.8, ease: "easeOut" }
        }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      >
        <div className="text-emerald-500/[0.12]">
          <Lightbulb className="w-[600px] h-[600px]" strokeWidth={0.6} />
        </div>
      </motion.div>

      {/* Animated Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1,
          scale: [1, 1.05, 1]
        }}
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] bg-emerald-500/[0.06]"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
      {/* Header Responsive */}
      <div className="bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-green-600/90 shadow-lg backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Bouton Retour */}
          <button
            onClick={() => navigate('/feed')}
            className="mb-4 sm:mb-6 transition-all transform hover:scale-110 text-2xl font-bold"
            style={{ color: getTextStyles(theme).muted }}
          >
            ←
          </button>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-3"
            style={{ color: theme === 'dark' ? '#FFFFFF' : '#FFFFFF' }}
          >
            Conseils & Astuces
          </motion.h1>
          <p className="text-base sm:text-lg md:text-xl font-medium" style={{ color: theme === 'dark' ? 'rgba(209, 213, 219, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}>
            Conseils d'experts pour réussir dans l'agriculture et l'élevage
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Conseil du Jour Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group backdrop-blur-md bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-500/30 rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-amber-500/25 cursor-pointer"
        >
          <div className="flex items-start space-x-4 sm:space-x-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Lightbulb className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" strokeWidth={2} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: theme === 'dark' ? '#FFFFFF' : getTextStyles(theme).title }}>
                Conseil du Jour
              </h2>
              <p className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4 leading-relaxed" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : getTextStyles(theme).body }}>
                {tips[0].content}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-medium truncate" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : getTextStyles(theme).muted }}>
                  Par {tips[0].author}
                </p>
                <button className="text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  En savoir plus →
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sector Filter Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8"
        >
          <button
            onClick={() => setSelectedSector('all')}
            className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold transition-all duration-300 text-sm sm:text-base"
            style={{
              backgroundColor: selectedSector === 'all' ? 'rgba(16, 185, 129, 0.3)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : getCardStyles(theme, 'emerald').backgroundColor),
              color: selectedSector === 'all' ? (theme === 'dark' ? '#FFFFFF' : '#FFFFFF') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : getTextStyles(theme).body),
              border: selectedSector === 'all' ? '2px solid rgba(16, 185, 129, 0.5)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)')
            }}
          >
            Tous les Conseils
          </button>
          <button
            onClick={() => setSelectedSector('agriculture')}
            className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
            style={{
              backgroundColor: selectedSector === 'agriculture' ? 'rgba(16, 185, 129, 0.3)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : getCardStyles(theme, 'emerald').backgroundColor),
              color: selectedSector === 'agriculture' ? (theme === 'dark' ? '#FFFFFF' : '#FFFFFF') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : getTextStyles(theme).body),
              border: selectedSector === 'agriculture' ? '2px solid rgba(16, 185, 129, 0.5)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)')
            }}
          >
            <Sprout className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Agriculture
          </button>
          <button
            onClick={() => setSelectedSector('elevage')}
            className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
            style={{
              backgroundColor: selectedSector === 'elevage' ? 'rgba(245, 158, 11, 0.3)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : getCardStyles(theme, 'emerald').backgroundColor),
              color: selectedSector === 'elevage' ? (theme === 'dark' ? '#FFFFFF' : '#FFFFFF') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : getTextStyles(theme).body),
              border: selectedSector === 'elevage' ? '2px solid rgba(245, 158, 11, 0.5)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)')
            }}
          >
            <Leaf className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Élevage
          </button>
        </motion.div>

        {/* Tips Grid Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          {filteredTips.map((tip) => (
            <div
              key={tip.id}
              className="group backdrop-blur-md rounded-[16px] sm:rounded-[20px] shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300 cursor-pointer border"
              style={{
                ...getCardStyles(theme, 'emerald'),
                borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Image d'illustration Responsive */}
              <div className="h-40 sm:h-48 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-green-500/20 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  {tip.category === 'agriculture' && <Sprout className="h-16 w-16 sm:h-20 sm:w-20 text-emerald-400" strokeWidth={1} />}
                  {tip.category === 'elevage' && <Leaf className="h-16 w-16 sm:h-20 sm:w-20 text-amber-400" strokeWidth={1} />}
                  {tip.category === 'commerce' && <TrendingUp className="h-16 w-16 sm:h-20 sm:w-20 text-purple-400" strokeWidth={1} />}
                </div>
              </div>
              
              {/* Contenu Responsive */}
              <div className="p-4 sm:p-5 md:p-6">
                {/* Category Badge Responsive */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {getCategoryIcon(tip.category)}
                    <span className="capitalize">{tip.category}</span>
                  </span>
                  <span className="text-[10px] sm:text-xs flex items-center gap-1" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : getTextStyles(theme).muted }}>
                    <Calendar className="h-3 w-3" />
                    {tip.season}
                  </span>
                </div>

                {/* Title Responsive */}
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 group-hover:text-emerald-300 transition-colors" style={{ color: theme === 'dark' ? '#FFFFFF' : getTextStyles(theme).title }}>
                  {tip.title}
                </h3>

                {/* Content Responsive */}
                <p className="text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : getTextStyles(theme).body }}>
                  {tip.content}
                </p>

                {/* Footer Responsive */}
                <div className="pt-3 sm:pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] sm:text-xs min-w-0" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : getTextStyles(theme).muted }}>
                      <p className="font-bold truncate" style={{ color: theme === 'dark' ? '#FFFFFF' : getTextStyles(theme).title }}>{tip.author}</p>
                      <p className="mt-0.5">{new Date(tip.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <button className="flex items-center space-x-1 sm:space-x-1.5 hover:text-red-400 transition-colors group/like flex-shrink-0" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : getTextStyles(theme).muted }}>
                      <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover/like:fill-red-500" />
                      <span className="text-xs sm:text-sm font-medium">{tip.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Seasonal Calendar Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mt-10 md:mt-12 backdrop-blur-md rounded-[20px] sm:rounded-[24px] shadow-lg p-6 sm:p-8 border"
          style={{
            ...getCardStyles(theme, 'emerald'),
            borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.2)'
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center" style={{ color: theme === 'dark' ? '#FFFFFF' : getTextStyles(theme).title }}>
            <Calendar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mr-2 sm:mr-3 text-emerald-400" strokeWidth={2} />
            Calendrier Agricole
          </h2>
          
          {/* Timeline Responsive */}
          <div className="relative">
            {/* Ligne de temps */}
            <div className="absolute top-10 sm:top-12 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-amber-500/30"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative">
              {/* Saison des Pluies Responsive */}
              <div className="backdrop-blur-sm bg-emerald-500/10 rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 border-2 border-emerald-500/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/30 border border-emerald-500/50 rounded-full flex items-center justify-center shadow-lg">
                    <Droplets className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : getTextStyles(theme).title }}>
                    Saison des Pluies
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-medium mb-3 sm:mb-4" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : getTextStyles(theme).muted }}>Mars - Novembre</p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Sprout className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs sm:text-sm" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : getTextStyles(theme).body }}><strong>Planter:</strong> Maïs, manioc, arachides</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Sprout className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs sm:text-sm" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : getTextStyles(theme).body }}><strong>Cultiver:</strong> Tomates, légumes feuilles</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs sm:text-sm" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : getTextStyles(theme).body }}><strong>Entretenir:</strong> Café, cacao</span>
                  </li>
                </ul>
              </div>

              {/* Saison Sèche Responsive */}
              <div className="backdrop-blur-sm bg-amber-500/10 rounded-[16px] sm:rounded-[20px] p-5 sm:p-6 border-2 border-amber-500/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/30 border border-amber-500/50 rounded-full flex items-center justify-center shadow-lg">
                    <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : getTextStyles(theme).title }}>
                    Saison Sèche
                  </h3>
                </div>
                <p className="text-xs sm:text-sm font-medium mb-3 sm:mb-4" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : getTextStyles(theme).muted }}>Décembre - Février</p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs sm:text-sm" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : getTextStyles(theme).body }}><strong>Récolter:</strong> Céréales</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Sprout className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs sm:text-sm" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : getTextStyles(theme).body }}><strong>Planter:</strong> Légumes résistants</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-xs sm:text-sm" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : getTextStyles(theme).body }}><strong>Irriguer:</strong> Cultures sensibles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
