import { useState, useEffect } from 'react';
import { Sprout, ArrowLeft, Package, TrendingUp, MapPin, Plus, Wheat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../contexts/LanguageContext';
import { listingsApi } from '../api/listings.api';
import type { Listing } from '../types/listing.types';

const formatFCFA = (n: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);

export default function ProducerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsApi.getMyListings()
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const published = listings.filter(l => l.status === 'PUBLISHED');
  const sold = listings.filter(l => l.status === 'SOLD');
  const totalRevenue = sold.reduce((s, l) => s + l.price_per_unit * l.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/feed')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Wheat className="w-5 h-5 text-[#3F441C]" />
        <h1 className="flex-1 font-bold text-gray-900">{t('Tableau de bord Producteur', 'Producer Dashboard')}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Bienvenue */}
        <div className="bg-[#3F441C] rounded-2xl p-5 text-white">
          <p className="text-white/70 text-xs">{t('Bienvenue,', 'Welcome,')}</p>
          <p className="font-bold text-lg">{user?.profile?.display_name || t('Producteur', 'Producer')}</p>
          {user?.profile?.region && (
            <div className="flex items-center gap-1 mt-1 text-white/60 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{user.profile.locality ? `${user.profile.locality}, ` : ''}{user.profile.region}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Package, label: t('Actives', 'Active'), value: published.length, color: '#3F441C' },
            { icon: TrendingUp, label: t('Vendues', 'Sold'), value: sold.length, color: '#16A34A' },
            { icon: Sprout, label: t('Total', 'Total'), value: listings.length, color: '#1D4ED8' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Revenus */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            {t('Revenus estimés (ventes)', 'Estimated revenue (sales)')}
          </p>
          <p className="text-2xl font-bold text-green-600">{formatFCFA(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{t('Basé sur les annonces marquées vendues', 'Based on listings marked as sold')}</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/feed')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#3F441C] text-white text-sm font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          {t('Créer une annonce', 'Create a listing')}
        </button>

        {/* Annonces publiées */}
        {!loading && published.length > 0 && (
          <>
            <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              {t('Mes annonces actives', 'My active listings')}
            </h3>
            <div className="space-y-3">
              {published.slice(0, 5).map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  {l.images?.[0] ? (
                    <img src={l.images[0]} alt={l.title} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{l.title}</p>
                    <p className="text-xs text-[#3F441C] font-bold">{formatFCFA(l.price_per_unit)} / {l.unit}</p>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                    {t('Active', 'Active')}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
