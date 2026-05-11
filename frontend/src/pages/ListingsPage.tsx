import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Search, Filter, MapPin, Package, Heart, MessageCircle, ShoppingCart, X, Grid, List, MoreVertical, Phone } from 'lucide-react';
import OrderModal from '@/components/OrderModal';
import { WheatIcon, CowIcon } from '@/components/icons/UnifiedIcons';
import ScrollToTop from '@/components/ScrollToTop';
import Logo from '@/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import BackButton from '@/components/BackButton';
import { useLanguage } from '@/contexts/LanguageContext';

interface Listing {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  variety?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  region: string;
  locality?: string;
  status: string;
  created_at: string;
  images?: string[];
  seller?: {
    profile: {
      display_name: string;
      activity_type: string;
      domain?: string;
    };
  };
}

export default function ListingsPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<'all' | 'agriculture' | 'elevage'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const regions = ['Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 'Nord', 'Adamaoua', 'Est', 'Sud', 'Extrême-Nord'];

  useEffect(() => {
    loadListings();
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(new Set(savedFavorites));
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, selectedSector, selectedRegion, priceRange]);

  const loadListings = async () => {
    try {
      setLoading(true);
      
      // Import demo listings
      const { generateDemoListings } = await import('@/data/demoListings');
      let demoListings = generateDemoListings();
      demoListings = demoListings.filter((listing: any) => listing.images && listing.images.length > 0);
      
      // Load real listings from API
      let realListings: any[] = [];
      try {
        const response = await api.getListings({ page: 1, page_size: 100, status: 'PUBLISHED' });
        realListings = response.items || [];
      } catch (apiError) {
        console.warn('Could not load real listings from API:', apiError);
      }
      
      const allListings = [...demoListings, ...realListings];
      setListings(allListings);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.variety?.toLowerCase().includes(query) ||
        listing.region.toLowerCase().includes(query) ||
        listing.seller?.profile?.display_name?.toLowerCase().includes(query)
      );
    }

    // Sector filter
    if (selectedSector !== 'all') {
      filtered = filtered.filter(listing => {
        const domain = listing.seller?.profile?.domain || 'agriculture';
        return domain === selectedSector;
      });
    }

    // Region filter
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(listing => listing.region === selectedRegion);
    }

    // Price filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(listing => {
        const price = listing.price_per_unit;
        if (priceRange === 'low') return price < 5000;
        if (priceRange === 'medium') return price >= 5000 && price < 20000;
        if (priceRange === 'high') return price >= 20000;
        return true;
      });
    }

    setFilteredListings(filtered);
  };

  const toggleFavorite = (listingId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(listingId)) {
      newFavorites.delete(listingId);
    } else {
      newFavorites.add(listingId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  const getActivityIcon = (activityType?: string) => {
    switch (activityType) {
      case 'producer': return <WheatIcon size={12} />;
      case 'seed_provider': return <Package className="h-3 w-3" />;
      case 'buyer': return <ShoppingCart className="h-3 w-3" />;
      default: return <WheatIcon size={12} />;
    }
  };

  return (
    <div className="min-h-screen relative font-['Inter','Plus_Jakarta_Sans',sans-serif]">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/images/backgrounds/pexels-szafran-34125512.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/80' : 'bg-black/40'}`} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/20 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Back & Logo */}
            <div className="flex items-center gap-3">
              <div className="scale-75">
                <BackButton to="/feed" />
              </div>
              <Logo size="sm" />
              <h1 className="text-lg font-bold hidden sm:block text-white">
                {t('Marché', 'Marketplace')}
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  placeholder={t('Rechercher produits, vendeurs...', 'Search products, sellers...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm transition-all bg-white/10 border border-white/20 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-white/60 hover:text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter & View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-full transition-all ${showFilters ? 'bg-[#3F441C] text-white' : 'hover:bg-white/10 text-white'}`}
              >
                <Filter className="h-5 w-5" />
              </button>
              <div className="hidden sm:flex rounded-full p-1 bg-white/5 border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-[#3F441C] text-white' : 'text-white/60 hover:text-white'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-[#3F441C] text-white' : 'text-white/60 hover:text-white'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Sector Filter */}
                <div>
                  <label className="text-xs font-semibold mb-2 block text-white/60">
                    {t('SECTEUR', 'SECTOR')}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'all', label: t('Tous', 'All') },
                      { value: 'agriculture', label: 'Agriculture', icon: <WheatIcon size={16} /> },
                      { value: 'elevage', label: t('Élevage', 'Livestock'), icon: <CowIcon size={16} /> },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedSector(option.value as any)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSector === option.value
                            ? 'bg-[#3F441C] text-white border border-[#F5F5F0]0'
                            : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                        }`}
                      >
                        {option.icon}
                        <span className="hidden sm:inline">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="text-xs font-semibold mb-2 block text-white/60">
                    {t('RÉGION', 'REGION')}
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#F5F5F0]0"
                  >
                    <option value="all" className="bg-gray-900">{t('Toutes les régions', 'All regions')}</option>
                    {regions.map((region) => (
                      <option key={region} value={region} className="bg-gray-900">{region}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="text-xs font-semibold mb-2 block text-white/60">
                    {t('PRIX', 'PRICE')}
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#F5F5F0]0"
                  >
                    <option value="all" className="bg-gray-900">{t('Tous les prix', 'All prices')}</option>
                    <option value="low" className="bg-gray-900">{t('Moins de 5 000 FCFA', 'Under 5,000 FCFA')}</option>
                    <option value="medium" className="bg-gray-900">5 000 – 20 000 FCFA</option>
                    <option value="high" className="bg-gray-900">{t('Plus de 20 000 FCFA', 'Over 20,000 FCFA')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/60">
            {filteredListings.length} {t(filteredListings.length !== 1 ? 'annonces trouvées' : 'annonce trouvée', filteredListings.length !== 1 ? 'listings found' : 'listing found')}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-[#7A7D5C] hover:text-[#B8BAAA] font-medium"
            >
              {t('Effacer la recherche', 'Clear search')}
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F5F5F0]0 border-t-transparent"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
            <Package className="h-16 w-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-lg font-semibold mb-2 text-white">
              {t('Aucune annonce trouvée', 'No listings found')}
            </h3>
            <p className="text-sm mb-4 text-white/60">
              {t('Essayez de modifier vos filtres ou votre recherche', 'Try changing your filters or search terms')}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('all');
                setSelectedRegion('all');
                setPriceRange('all');
              }}
              className="px-6 py-2 rounded-full font-medium transition-all hover:scale-105 bg-[#3F441C] text-white"
            >
              {t('Réinitialiser les filtres', 'Reset filters')}
            </button>
          </div>
        ) : (
          /* Listings Grid/List */
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-4'
          }>
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-black/40 border border-white/10 hover:border-[#F5F5F0]0/50 backdrop-blur-md shadow-lg ${viewMode === 'list' ? 'flex' : ''}`}
                onClick={() => navigate(`/listings/${listing.id}`, { 
                  state: { 
                    listing: {
                      id: listing.id,
                      title: listing.title,
                      price: listing.price_per_unit,
                      unit: listing.unit,
                      quantity: listing.quantity,
                      images: listing.images,
                      seller_name: listing.seller?.profile?.display_name || 'Vendeur',
                      seller_id: listing.seller_id,
                      region: listing.region,
                      locality: listing.locality,
                      variety: listing.variety,
                    }
                  }
                })}
              >
                {/* Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-40 h-32 flex-shrink-0' : 'aspect-square'}`}>
                  <img
                    src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400'}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(listing.id);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
                      favorites.has(listing.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-black/30 text-white hover:bg-black/50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${favorites.has(listing.id) ? 'fill-current' : ''}`} />
                  </button>
                  {/* Three-dot Menu */}
                  <div className="absolute top-2 left-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === listing.id ? null : listing.id);
                      }}
                      className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {menuOpenId === listing.id && (
                      <div className="absolute left-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px] z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            setSelectedListing(listing);
                            setOrderModalOpen(true);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ShoppingCart className="h-4 w-4 text-[#3F441C]" />
                          {t('Commander directement', 'Order directly')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                            navigate(`/chat?listing_id=${listing.id}`);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4 text-[#3F441C]" />
                          {t('Contacter', 'Contact')}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Domain Badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-gradient-to-br from-[#A0B96B]/90 to-[#829952]/90 text-white">
                    {listing.seller?.profile?.domain === 'elevage' ? <CowIcon size={12} /> : <WheatIcon size={12} />}
                    <span className="hidden sm:inline">{listing.seller?.profile?.domain === 'elevage' ? t('Élevage', 'Livestock') : 'Agriculture'}</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-white group-hover:text-[#7A7D5C] transition-colors">
                      {listing.title}
                    </h3>
                    {listing.variety && (
                      <p className="text-xs mb-2 text-white/60">
                        {t('Variété', 'Variety')}: {listing.variety}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs mb-2 text-white/60">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.region}{listing.locality ? `, ${listing.locality}` : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-lg font-bold text-[#7A7D5C]">
                        {listing.price_per_unit.toLocaleString()} <span className="text-xs font-normal text-white/50">FCFA/{listing.unit}</span>
                      </p>
                      <p className="text-xs text-white/50">
                        {listing.quantity} {listing.unit} {t('disponible', 'available')}{listing.quantity > 1 ? t('s', '') : ''}
                      </p>
                    </div>
                    
                    {viewMode === 'list' && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/chat');
                          }}
                          className="p-2 rounded-full transition-all bg-white/10 hover:bg-white/20 text-white"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/listings/${listing.id}?action=order`, { state: { listing } });
                          }}
                          className="p-2 rounded-full transition-all bg-[#3F441C] hover:bg-[#F5F5F0]0 text-white"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    <div className="w-6 h-6 rounded-full bg-[#3F441C] flex items-center justify-center text-white text-xs font-bold border border-[#F5F5F0]0/30">
                      {listing.seller?.profile?.display_name?.[0] || 'V'}
                    </div>
                    <span className="text-xs font-medium truncate text-white/80">
                      {listing.seller?.profile?.display_name || 'Vendeur'}
                    </span>
                    <div className="ml-auto flex items-center gap-1 text-xs text-white/40">
                      {getActivityIcon(listing.seller?.profile?.activity_type)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ScrollToTop />

      {/* Order Modal */}
      {selectedListing && (
        <OrderModal
          isOpen={orderModalOpen}
          onClose={() => {
            setOrderModalOpen(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
        />
      )}
    </div>
  );
}
