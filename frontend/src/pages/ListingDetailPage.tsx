import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Package, User, MessageCircle, ChevronLeft, ChevronRight, Scale, Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { listingsApi } from '../api/listings.api';
import type { Listing } from '../types/listing.types';

const formatFCFA = (n: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    listingsApi.getById(id)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  const images = listing?.images?.length ? listing.images : [];
  const domainColor = '#3F441C';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <p className="text-gray-400 text-sm">{t('Chargement...', 'Loading...')}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center gap-4 p-6">
        <Package className="w-16 h-16 text-gray-300" />
        <p className="text-gray-500">{t('Publication introuvable.', 'Listing not found.')}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#3F441C] text-white rounded-xl text-sm">
          {t('Retour', 'Back')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="flex-1 font-bold text-gray-900 truncate">{listing.title}</h1>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Galerie photos */}
        <div className="relative bg-gray-100 aspect-video">
          {images.length > 0 ? (
            <img
              src={images[imgIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 text-gray-300" />
            </div>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1.5 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImgIndex(i => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1.5 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-4 py-5 space-y-4">
          {/* Titre + prix */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{listing.title}</h2>
            {listing.variety && (
              <p className="text-sm text-gray-500 mb-3">{t('Variété', 'Variety')} : {listing.variety}</p>
            )}
            <p className="text-2xl font-bold" style={{ color: domainColor }}>
              {formatFCFA(listing.price_per_unit)} <span className="text-sm font-normal text-gray-400">/ {listing.unit}</span>
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-gray-400" />
                {listing.quantity} {listing.unit} {t('disponibles', 'available')}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  listing.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {listing.status === 'PUBLISHED' ? t('Disponible', 'Available') : listing.status}
              </span>
            </div>
          </div>

          {/* Infos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {t('Informations', 'Details')}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{listing.locality ? `${listing.locality}, ` : ''}{listing.region}, Cameroun</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{t('Catégorie ID', 'Category')} : {listing.category_id}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                {listing.seller?.profile?.display_name || t('Vendeur local', 'Local seller')}
                {listing.seller?.profile?.activity_type && (
                  <span className="text-gray-400"> · {listing.seller.profile.activity_type}</span>
                )}
              </span>
            </div>
          </div>

          {/* CTA contact */}
          <button
            onClick={() => navigate('/chat')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: domainColor }}
          >
            <MessageCircle className="w-5 h-5" />
            {t('Contacter le vendeur', 'Contact the seller')}
          </button>
        </div>
      </div>
    </div>
  );
}
