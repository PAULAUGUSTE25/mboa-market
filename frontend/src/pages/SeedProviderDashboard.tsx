import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, Wheat, Beef, MessageSquare, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/utils/themeStyles';
import SectorSwitcher from '@/components/SectorSwitcher';

interface Listing {
  id: string;
  title: string;
  variety: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  status: string;
  created_at: string;
}

export default function SeedProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentSector, setCurrentSector] = useState<'agriculture' | 'elevage'>('agriculture');

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.getMyListings();
      setListings(response);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')` }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.background}`}></div>
      </div>

      {/* Animated Background Pattern */}
      <div className={`fixed inset-0 ${styles.blobs}`}>
        <div className={`absolute top-10 left-10 w-32 h-32 ${styles.blobColors[0]} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute top-40 right-20 w-40 h-40 ${styles.blobColors[1]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-20 left-1/4 w-36 h-36 ${styles.blobColors[2]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
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
        <div className={currentSector === 'agriculture' ? 'text-emerald-500/[0.12]' : 'text-amber-500/[0.12]'}>
          {currentSector === 'agriculture' ? (
            <Wheat className="w-[600px] h-[600px]" strokeWidth={0.6} />
          ) : (
            <Beef className="w-[600px] h-[600px]" strokeWidth={0.6} />
          )}
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
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] ${
            currentSector === 'agriculture' ? 'bg-emerald-500/[0.06]' : 'bg-amber-500/[0.06]'
          }`}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <div className={`shadow-lg transition-colors backdrop-blur-md ${
        currentSector === 'agriculture' 
          ? 'bg-gradient-to-r from-emerald-600/90 to-green-700/90' 
          : 'bg-gradient-to-r from-amber-600/90 to-orange-600/90'
      }`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {currentSector === 'agriculture' ? (
                    <Wheat className="h-5 w-5 text-white" strokeWidth={2} />
                  ) : (
                    <Beef className="h-5 w-5 text-white" strokeWidth={2} />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Fournisseur - {currentSector === 'agriculture' ? 'Agriculture' : 'Élevage'}
                </h1>
              </div>
              <p className="text-white/90">
                {currentSector === 'agriculture' 
                  ? 'Gérez vos annonces de semences et plants' 
                  : 'Gérez vos annonces d\'animaux'}
              </p>
            </div>
            <SectorSwitcher 
              currentSector={currentSector} 
              onSectorChange={setCurrentSector}
            />
          </div>
        </div>
      </div>


      {/* Stats */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Tableau de Bord
            </h2>
            <p className="mt-1 text-sm sm:text-base text-white/80">
              Bienvenue, {user?.profile?.display_name}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border-2 rounded-xl shadow-lg text-sm sm:text-base font-bold text-white transition-all hover:scale-105 ${
              currentSector === 'agriculture'
                ? 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30'
            }`}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle Annonce
          </button>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 overflow-hidden shadow-xl hover:shadow-2xl rounded-2xl hover:bg-white/15 transition-all duration-300"
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg ${
                    currentSector === 'agriculture' 
                      ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30' 
                      : 'bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-400/30'
                  }`}>
                    <Package className={`h-7 w-7 sm:h-8 sm:w-8 ${
                      currentSector === 'agriculture' ? 'text-emerald-300' : 'text-amber-300'
                    }`} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-white/60 truncate mb-1">
                    Annonces Actives
                  </dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {listings.filter(l => l.status === 'PUBLISHED').length}
                  </dd>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 overflow-hidden shadow-xl hover:shadow-2xl rounded-2xl hover:bg-white/15 transition-all duration-300"
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg ${
                    currentSector === 'agriculture' 
                      ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30' 
                      : 'bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-400/30'
                  }`}>
                    <MessageSquare className={`h-7 w-7 sm:h-8 sm:w-8 ${
                      currentSector === 'agriculture' ? 'text-emerald-300' : 'text-amber-300'
                    }`} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-white/60 truncate mb-1">
                    Messages
                  </dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-white tracking-tight">0</dd>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 overflow-hidden shadow-xl hover:shadow-2xl rounded-2xl hover:bg-white/15 transition-all duration-300"
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-lg ${
                    currentSector === 'agriculture' 
                      ? 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30' 
                      : 'bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-400/30'
                  }`}>
                    <TrendingUp className={`h-7 w-7 sm:h-8 sm:w-8 ${
                      currentSector === 'agriculture' ? 'text-emerald-300' : 'text-amber-300'
                    }`} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-white/60 truncate mb-1">
                    Ventes ce mois
                  </dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-white tracking-tight">0</dd>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Listings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
            {currentSector === 'agriculture' 
              ? 'Mes Annonces de Semences et Plants' 
              : 'Mes Annonces d\'Animaux'}
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg rounded-xl p-8 sm:p-12 text-center">
              <Package className={`mx-auto h-12 w-12 sm:h-16 sm:w-16 ${
                currentSector === 'agriculture' ? 'text-emerald-400' : 'text-amber-400'
              }`} />
              <h3 className="mt-4 text-base sm:text-lg font-bold text-white">
                Aucune annonce
              </h3>
              <p className="mt-2 text-sm sm:text-base text-white/70">
                {currentSector === 'agriculture' 
                  ? 'Commencez par créer votre première annonce de semences ou plants.' 
                  : 'Commencez par créer votre première annonce d\'animaux.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className={`inline-flex items-center px-6 py-3 border-2 shadow-lg text-sm sm:text-base font-bold rounded-xl text-white transition-all hover:scale-105 ${
                    currentSector === 'agriculture'
                      ? 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30'
                  }`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Créer une annonce
                </button>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg overflow-hidden rounded-xl">
              <ul className="divide-y divide-white/10">
                {listings.map((listing) => (
                  <li key={listing.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-white/5 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            {listing.title || 'Sans titre'}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-white/70">
                            {listing.variety && `Variété: ${listing.variety} • `}
                            Quantité: {listing.quantity} {listing.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="text-right">
                            <p className="text-base sm:text-lg font-bold text-white">
                              {listing.price_per_unit} {listing.currency}
                            </p>
                            <p className="text-xs sm:text-sm text-white/70">par {listing.unit}</p>
                          </div>
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${
                              listing.status === 'PUBLISHED'
                                ? (currentSector === 'agriculture' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30')
                                : 'bg-white/10 text-white/70 border border-white/20'
                            }`}
                          >
                            {listing.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
      </div>

      {/* Create Listing Modal - Will be implemented */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl max-w-2xl w-full p-6 sm:p-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Créer une nouvelle annonce</h2>
            <p className="text-white/70 text-sm sm:text-base">Formulaire de création à implémenter...</p>
            <button
              onClick={() => setShowCreateForm(false)}
              className={`mt-6 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 ${
                currentSector === 'agriculture'
                  ? 'bg-emerald-500/20 border-2 border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 border-2 border-amber-500/30 hover:bg-amber-500/30'
              }`}
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
