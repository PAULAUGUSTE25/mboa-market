import { useState, useEffect } from 'react';
import { Activity, Package, ArrowLeft, MapPin, Tag, Eye, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { listingsApi } from '../api/listings.api';
import type { Listing } from '../types/listing.types';

const LOCAL_LISTINGS_KEY = 'local_created_listings';

const normalizeValue = (value?: string | number) =>
  String(value ?? '').trim().toLowerCase();

const formatFCFA = (n: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);

export default function MyActivityPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const domainColor = user?.profile?.domain === 'elevage' ? '#7C3D12' : '#3F441C';

  const getStoredLocalListings = (): Listing[] => {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_LISTINGS_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  };

  const isSameListing = (a: Listing, b: Listing) => {
    return (
      normalizeValue(a.title) === normalizeValue(b.title) &&
      Number(a.price_per_unit || 0) === Number(b.price_per_unit || 0) &&
      Number(a.quantity || 0) === Number(b.quantity || 0) &&
      normalizeValue(a.unit) === normalizeValue(b.unit) &&
      normalizeValue(a.region) === normalizeValue(b.region) &&
      normalizeValue(a.locality) === normalizeValue(b.locality)
    );
  };

  const syncLocalListingsWithApi = (localListings: Listing[], apiListings: Listing[]) => {
    const remainingLocal = localListings.filter((local) => {
      if (!String(local.id || '').startsWith('local-')) return true;
      return !apiListings.some((apiListing) => isSameListing(local, apiListing));
    });

    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(remainingLocal));
    return remainingLocal;
  };

  useEffect(() => {
    const localListings = getStoredLocalListings();

    listingsApi.getMyListings()
      .then(data => {
        const apiListings = Array.isArray(data) ? data : (data as any).items || [];
        const syncedLocalListings = syncLocalListingsWithApi(localListings, apiListings);
        const merged = [...syncedLocalListings, ...apiListings];
        const uniqueById = merged.filter((listing, index, arr) =>
          index === arr.findIndex(item => item.id === listing.id)
        );
        setListings(uniqueById);
      })
      .catch(() => setListings(localListings))
      .finally(() => setLoading(false));
  }, []);

  const totalValue = listings.reduce((sum, l) => sum + (l.price_per_unit || 0) * (l.quantity || 1), 0);
  const activeCount = listings.filter(l => l.status === 'PUBLISHED').length;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/feed')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Activity className="w-5 h-5" style={{ color: domainColor }} />
        <h1 className="flex-1 font-bold text-gray-900">{t('Mon Activité', 'My Activity')}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('Publications', 'Listings'), value: listings.length, color: domainColor },
            { label: t('Actives', 'Active'), value: activeCount, color: '#16A34A' },
            { label: t('Valeur totale', 'Total value'), value: formatFCFA(totalValue), color: '#1D4ED8', small: true },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xl font-bold" style={{ color: stat.color, fontSize: stat.small ? '13px' : undefined }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bouton créer */}
        <button
          onClick={() => navigate('/feed')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: domainColor }}
        >
          <Plus className="w-4 h-4" />
          {t('Créer une nouvelle publication', 'Create a new listing')}
        </button>

        {/* Liste des annonces */}
        <h2 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          {t('Mes publications', 'My listings')}
        </h2>

        {loading && (
          <p className="text-center text-gray-400 py-10 text-sm">{t('Chargement...', 'Loading...')}</p>
        )}

        {!loading && listings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {t('Vous n\'avez pas encore de publications.', 'You have no listings yet.')}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {listings.map(listing => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3"
            >
              {listing.images?.[0] ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-7 h-7 text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{listing.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: domainColor }}>
                    {formatFCFA((listing.price_per_unit || 0) * (listing.quantity || 1))}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      listing.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {listing.status === 'PUBLISHED' ? t('Publiée', 'Published') : listing.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {listing.region && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />{listing.locality ? `${listing.locality}, ` : ''}{listing.region}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <Tag className="w-3 h-3" />{listing.quantity} {listing.unit}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/listings/${listing.id}`)}
                className="p-2 rounded-lg hover:bg-gray-50 flex-shrink-0"
              >
                <Eye className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
