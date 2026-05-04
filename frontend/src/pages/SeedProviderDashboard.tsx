import { useState, useEffect } from 'react';
import { Package, ArrowLeft, TrendingUp, MapPin, Plus, Sprout, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../contexts/LanguageContext';
import { listingsApi } from '../api/listings.api';
import type { Listing } from '../types/listing.types';

const formatFCFA = (n: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);

export default function SeedProviderDashboard() {
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
  const totalStock = published.reduce((s, l) => s + l.quantity, 0);
  const totalRevenue = sold.reduce((s, l) => s + l.price_per_unit * l.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/feed')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Leaf className="w-5 h-5 text-[#3F441C]" />
        <h1 className="flex-1 font-bold text-gray-900">{t('Tableau de bord Fournisseur', 'Supplier Dashboard')}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Bienvenue */}
        <div className="bg-gradient-to-r from-[#3F441C] to-[#5C6228] rounded-2xl p-5 text-white">
          <p className="text-white/70 text-xs">{t('Tableau de bord', 'Dashboard')}</p>
          <p className="font-bold text-lg">{user?.profile?.display_name || t('Fournisseur de semences', 'Seed Provider')}</p>
          {user?.profile?.region && (
            <div className="flex items-center gap-1 mt-1 text-white/60 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{user.profile.locality ? `${user.profile.locality}, ` : ''}{user.profile.region}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Package, label: t('Produits en stock', 'Products in stock'), value: published.length, color: '#3F441C' },
            { icon: TrendingUp, label: t('Produits vendus', 'Products sold'), value: sold.length, color: '#16A34A' },
            { icon: Sprout, label: t('Unités disponibles', 'Units available'), value: totalStock, color: '#0891B2' },
            { icon: Leaf, label: t('Revenus estimés', 'Est. revenue'), value: formatFCFA(totalRevenue), color: '#7C3D12', small: true },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <Icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
                <p className="font-bold" style={{ color: s.color, fontSize: s.small ? '13px' : '20px' }}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Conseil MINADER */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-800 mb-1">
            {t('Rappel MINADER', 'MINADER Reminder')}
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            {t(
              'Tous les fournisseurs de semences doivent être enregistrés à la Direction du Matériel Végétal du MINADER. Gardez votre agrément à jour pour accéder aux programmes de subvention.',
              'All seed providers must be registered with the MINADER Directorate of Plant Material. Keep your accreditation up to date to access subsidy programs.'
            )}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/feed')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#3F441C] text-white text-sm font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          {t('Ajouter un produit', 'Add a product')}
        </button>

        {/* Liste produits */}
        {!loading && published.length > 0 && (
          <>
            <h3 className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              {t('Mes produits en vente', 'My products for sale')}
            </h3>
            <div className="space-y-3">
              {published.slice(0, 5).map(l => (
                <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  {l.images?.[0] ? (
                    <img src={l.images[0]} alt={l.title} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#EEEEE5] flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-[#3F441C]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{l.title}</p>
                    <p className="text-xs text-gray-500">{l.quantity} {l.unit} {t('disponibles', 'available')}</p>
                    <p className="text-xs text-[#3F441C] font-bold">{formatFCFA(l.price_per_unit)} / {l.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
