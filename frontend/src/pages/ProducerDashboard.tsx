import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, ShoppingCart, Sprout, Wheat, Beef } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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
  category_id: string;
  seller_id: string;
}

export default function ProducerDashboard() {
  const _navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [seedListings, setSeedListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [currentSector, setCurrentSector] = useState<'agriculture' | 'elevage'>('agriculture');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load seed/animal listings to buy from (public, no auth needed)
      const allListings = await api.getListings({ page: 1, page_size: 20 });
      setSeedListings(allListings.items);
      
      // Load my harvest listings (requires auth)
      if (user) {
        try {
          const myItems = await api.getMyListings();
          setMyListings(myItems);
        } catch (err) {
          console.log('Could not load user listings - not authenticated');
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=2000')` }}>
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
        <div className={currentSector === 'agriculture' ? 'text-emerald-500/[0.12]' : 'text-red-500/[0.12]'}>
          <Sprout className="w-[600px] h-[600px]" strokeWidth={0.6} />
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
            currentSector === 'agriculture' ? 'bg-emerald-500/[0.06]' : 'bg-red-500/[0.06]'
          }`}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <div className={`shadow-lg transition-colors backdrop-blur-md ${
        currentSector === 'agriculture' 
          ? 'bg-gradient-to-r from-emerald-600/90 to-green-700/90' 
          : 'bg-gradient-to-r from-red-600/90 to-red-700/90'
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
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Producteur - {currentSector === 'agriculture' ? 'Agriculture' : 'Élevage'}
                </h1>
              </div>
              <p className="text-white/90">
                {currentSector === 'agriculture' 
                  ? 'Semences, cultures et produits agricoles' 
                  : 'Animaux et produits d\'élevage'}
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
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden shadow-lg rounded-xl hover:bg-white/15 transition-all"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    currentSector === 'agriculture' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    <ShoppingCart className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      currentSector === 'agriculture' ? 'text-emerald-400' : 'text-red-400'
                    }`} />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-white/70 truncate">
                      Achats
                    </dt>
                    <dd className="text-xl sm:text-2xl font-bold text-white">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden shadow-lg rounded-xl hover:bg-white/15 transition-all"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    currentSector === 'agriculture' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    <Sprout className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      currentSector === 'agriculture' ? 'text-emerald-400' : 'text-red-400'
                    }`} />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-white/70 truncate">
                      En Production
                    </dt>
                    <dd className="text-xl sm:text-2xl font-bold text-white">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden shadow-lg rounded-xl hover:bg-white/15 transition-all"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    currentSector === 'agriculture' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    <Package className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      currentSector === 'agriculture' ? 'text-emerald-400' : 'text-red-400'
                    }`} />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-white/70 truncate">
                      À Vendre
                    </dt>
                    <dd className="text-xl sm:text-2xl font-bold text-white">
                      {myListings.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden shadow-lg rounded-xl hover:bg-white/15 transition-all"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    currentSector === 'agriculture' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      currentSector === 'agriculture' ? 'text-emerald-400' : 'text-red-400'
                    }`} />
                  </div>
                </div>
                <div className="ml-4 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-white/70 truncate">
                      Ventes
                    </dt>
                    <dd className="text-xl sm:text-2xl font-bold text-white">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="border-b border-white/20">
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-6 py-3 rounded-full font-bold transition-all ${
                  activeTab === 'buy'
                    ? currentSector === 'agriculture'
                      ? 'bg-emerald-500/30 text-white border-2 border-emerald-500/50 shadow-lg'
                      : 'bg-red-500/30 text-white border-2 border-red-500/50 shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/20 backdrop-blur-sm'
                }`}
              >
                <ShoppingCart className="h-4 w-4 inline-block mr-2" strokeWidth={2} />
                {currentSector === 'agriculture' ? 'Acheter des Produits Agricoles' : 'Acheter des Animaux'}
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`px-6 py-3 rounded-full font-bold transition-all ${
                  activeTab === 'sell'
                    ? currentSector === 'agriculture'
                      ? 'bg-emerald-500/30 text-white border-2 border-emerald-500/50 shadow-lg'
                      : 'bg-red-500/30 text-white border-2 border-red-500/50 shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/20 backdrop-blur-sm'
                }`}
              >
                <Package className="h-4 w-4 inline-block mr-2" strokeWidth={2} />
                {currentSector === 'agriculture' ? 'Vendre des Produits Agricoles' : 'Vendre des Animaux'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'buy' ? (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
                {currentSector === 'agriculture' 
                  ? 'Semences et Plants Disponibles' 
                  : 'Animaux Disponibles'}
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : seedListings.length === 0 ? (
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-12 text-center">
                  <p className="text-white/70">Aucune annonce disponible pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {seedListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-white">
                          {listing.title || 'Sans titre'}
                        </h3>
                        {listing.variety && (
                          <p className="mt-1 text-sm text-white/70">
                            Variété: {listing.variety}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/70">
                              {listing.quantity} {listing.unit} disponible
                            </p>
                            <p className={`mt-1 text-xl font-bold ${
                              currentSector === 'agriculture' ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {listing.price_per_unit} {listing.currency}/{listing.unit}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            currentSector === 'agriculture'
                              ? 'bg-emerald-500/30 text-white border-2 border-emerald-500/50 hover:bg-emerald-500/40'
                              : 'bg-red-500/30 text-white border-2 border-red-500/50 hover:bg-red-500/40'
                          }`}>
                            Acheter
                          </button>
                          <button className="flex-1 border-2 border-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
                            Contacter
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {currentSector === 'agriculture' 
                    ? 'Mes Produits Agricoles à Vendre' 
                    : 'Mes Animaux à Vendre'}
                </h2>
                <Link
                  to="/create-listing"
                  className={`inline-flex items-center px-4 py-2 border-2 rounded-xl shadow-lg text-sm font-bold text-white transition-all hover:scale-105 ${
                    currentSector === 'agriculture'
                      ? 'bg-emerald-500/30 border-emerald-500/50 hover:bg-emerald-500/40'
                      : 'bg-red-500/30 border-red-500/50 hover:bg-red-500/40'
                  }`}
                >
                  Créer une annonce
                </Link>
              </div>
              {myListings.length === 0 ? (
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-12 text-center">
                  <Package className={`mx-auto h-12 w-12 ${
                    currentSector === 'agriculture' ? 'text-emerald-400' : 'text-red-400'
                  }`} />
                  <h3 className="mt-2 text-lg font-bold text-white">
                    {currentSector === 'agriculture' 
                      ? 'Aucun produit agricole en vente' 
                      : 'Aucun animal en vente'}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    {currentSector === 'agriculture' 
                      ? 'Créez votre première annonce pour vendre vos produits agricoles.' 
                      : 'Créez votre première annonce pour vendre vos animaux.'}
                  </p>
                </div>
              ) : (
                <div className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden rounded-xl">
                  <ul className="divide-y divide-white/10">
                    {myListings.map((listing) => (
                      <li key={listing.id} className="px-4 py-4 sm:px-6 hover:bg-white/5 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {listing.title}
                            </h3>
                            <p className="mt-1 text-sm text-white/70">
                              {listing.quantity} {listing.unit} disponible
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              currentSector === 'agriculture' ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {listing.price_per_unit} {listing.currency}
                            </p>
                            <p className="text-sm text-white/60">par {listing.unit}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
