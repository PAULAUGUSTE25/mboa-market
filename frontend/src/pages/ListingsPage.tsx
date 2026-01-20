import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { Search, Filter, MapPin, Package, Heart, MessageCircle, ShoppingCart, Wheat, Beef, ArrowLeft, X, Grid, List } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import Logo from '@/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { getCardStyles, getTextStyles, getInputStyles, getButtonStyles } from '@/utils/cardStyles';

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
  const { user } = useAuthStore();
  const navigate = useNavigate();
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
      case 'producer': return <Wheat className="h-3 w-3" />;
      case 'seed_provider': return <Package className="h-3 w-3" />;
      case 'buyer': return <ShoppingCart className="h-3 w-3" />;
      default: return <Wheat className="h-3 w-3" />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#060D0A]' : 'bg-[#F0F2F5]'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 ${theme === 'dark' ? 'bg-[#060D0A]/95 backdrop-blur-xl border-b border-white/10' : 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Back & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <ArrowLeft className="h-5 w-5" style={{ color: getTextStyles(theme).body }} />
              </button>
              <Logo size="sm" />
              <h1 className="text-lg font-bold hidden sm:block" style={{ color: getTextStyles(theme).title }}>
                Marketplace
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher produits, vendeurs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm transition-all"
                  style={getInputStyles(theme)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter & View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-full transition-all ${showFilters ? 'bg-emerald-500 text-white' : theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <Filter className="h-5 w-5" />
              </button>
              <div className={`hidden sm:flex rounded-full p-1 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Sector Filter */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: getTextStyles(theme).muted }}>
                    SECTEUR
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'all', label: 'Tous' },
                      { value: 'agriculture', label: 'Agriculture', icon: <Wheat className="h-4 w-4" /> },
                      { value: 'elevage', label: 'Élevage', icon: <Beef className="h-4 w-4" /> },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedSector(option.value as any)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedSector === option.value
                            ? 'bg-emerald-500 text-white'
                            : theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-100'
                        }`}
                        style={selectedSector !== option.value ? { color: getTextStyles(theme).body } : {}}
                      >
                        {option.icon}
                        <span className="hidden sm:inline">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: getTextStyles(theme).muted }}>
                    RÉGION
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={getInputStyles(theme)}
                  >
                    <option value="all">Toutes les régions</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: getTextStyles(theme).muted }}>
                    PRIX
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={getInputStyles(theme)}
                  >
                    <option value="all">Tous les prix</option>
                    <option value="low">Moins de 5,000 FCFA</option>
                    <option value="medium">5,000 - 20,000 FCFA</option>
                    <option value="high">Plus de 20,000 FCFA</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>
            {filteredListings.length} annonce{filteredListings.length !== 1 ? 's' : ''} trouvée{filteredListings.length !== 1 ? 's' : ''}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
            >
              Effacer la recherche
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          /* Empty State */
          <div className={`text-center py-16 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2" style={{ color: getTextStyles(theme).title }}>
              Aucune annonce trouvée
            </h3>
            <p className="text-sm mb-4" style={{ color: getTextStyles(theme).muted }}>
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('all');
                setSelectedRegion('all');
                setPriceRange('all');
              }}
              className="px-6 py-2 rounded-full font-medium transition-all hover:scale-105"
              style={getButtonStyles(theme, 'primary', 'emerald')}
            >
              Réinitialiser les filtres
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
                className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                  theme === 'dark' ? 'bg-white/[0.03] border border-white/10 hover:border-emerald-500/50' : 'bg-white shadow-sm hover:shadow-lg'
                } ${viewMode === 'list' ? 'flex' : ''}`}
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
                  {/* Domain Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    listing.seller?.profile?.domain === 'elevage'
                      ? 'bg-amber-500/90 text-white'
                      : 'bg-emerald-500/90 text-white'
                  }`}>
                    {listing.seller?.profile?.domain === 'elevage' ? <Beef className="h-3 w-3" /> : <Wheat className="h-3 w-3" />}
                    <span className="hidden sm:inline">{listing.seller?.profile?.domain === 'elevage' ? 'Élevage' : 'Agriculture'}</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ color: getTextStyles(theme).title }}>
                      {listing.title}
                    </h3>
                    {listing.variety && (
                      <p className="text-xs mb-2" style={{ color: getTextStyles(theme).muted }}>
                        Variété: {listing.variety}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs mb-2" style={{ color: getTextStyles(theme).muted }}>
                      <MapPin className="h-3 w-3" />
                      <span>{listing.region}{listing.locality ? `, ${listing.locality}` : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-lg font-bold text-emerald-500">
                        {listing.price_per_unit.toLocaleString()} <span className="text-xs font-normal">FCFA/{listing.unit}</span>
                      </p>
                      <p className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                        {listing.quantity} {listing.unit} disponible{listing.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    {viewMode === 'list' && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/chat');
                          }}
                          className="p-2 rounded-full transition-all"
                          style={getButtonStyles(theme, 'secondary', 'emerald')}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/listings/${listing.id}?action=order`, { state: { listing } });
                          }}
                          className="p-2 rounded-full transition-all"
                          style={getButtonStyles(theme, 'primary', 'emerald')}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Seller Info */}
                  <div className={`flex items-center gap-2 mt-3 pt-3 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        background: listing.seller?.profile?.domain === 'elevage'
                          ? (theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : '#FEF3C7')
                          : (theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5'),
                        color: listing.seller?.profile?.domain === 'elevage'
                          ? (theme === 'dark' ? '#FCD34D' : '#D97706')
                          : (theme === 'dark' ? '#6EE7B7' : '#059669')
                      }}
                    >
                      {listing.seller?.profile?.display_name?.[0] || 'V'}
                    </div>
                    <span className="text-xs font-medium truncate" style={{ color: getTextStyles(theme).body }}>
                      {listing.seller?.profile?.display_name || 'Vendeur'}
                    </span>
                    <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: getTextStyles(theme).muted }}>
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
    </div>
  );
}
