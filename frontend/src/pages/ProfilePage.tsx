import { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit, LogOut, Save, X, Wheat, Beef, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import { usersApi } from '../api/users.api';

const CAMEROON_REGIONS = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
  'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest',
];

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: user?.profile?.display_name || '',
    region: user?.profile?.region || '',
    locality: user?.profile?.locality || '',
    activity_type: user?.profile?.activity_type || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile(form as Parameters<typeof usersApi.updateProfile>[0]);
      setUser(updated);
      setEditing(false);
    } catch {
      if (user) {
        setUser({
          ...user,
          profile: { ...user.profile, ...form } as typeof user.profile,
        });
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.profile?.display_name || user?.phone || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const domainColor = user?.profile?.domain === 'elevage' ? '#7C3D12' : '#3F441C';

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#F5F5F0' }}>
      {/* Video Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.35)' }}>
          <source src="https://res.cloudinary.com/dvfmmovlw/video/upload/video_background_pw0i8m.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>
      {/* Contenu au-dessus de la vidéo */}
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/feed')} className="p-2 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="flex-1 font-bold text-gray-900">
          {t('Mon Profil', 'My Profile')}
        </h1>
        <LanguageToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('Déconnexion', 'Log out')}
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Avatar + nom */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ backgroundColor: domainColor }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {user?.profile?.display_name || t('Utilisateur', 'User')}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {user?.profile?.domain === 'elevage' ? (
                <Beef className="w-4 h-4 text-[#7C3D12]" />
              ) : (
                <Wheat className="w-4 h-4 text-[#3F441C]" />
              )}
              <span className="text-sm text-gray-500 capitalize">
                {user?.profile?.activity_type || t('Membre', 'Member')}
              </span>
            </div>
            {user?.profile?.region && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {user.profile.locality ? `${user.profile.locality}, ` : ''}{user.profile.region}
                </span>
              </div>
            )}
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-105"
              style={{ borderColor: domainColor, color: domainColor }}
            >
              <Edit className="w-4 h-4" />
              {t('Modifier', 'Edit')}
            </button>
          )}
        </div>

        {/* Formulaire d'édition */}
        {editing && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">{t('Modifier mes informations', 'Edit my information')}</h3>

            <div>
              <label className="text-xs text-gray-500 font-medium">{t('Nom complet / Nom d\'affichage', 'Full name / Display name')}</label>
              <input
                value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3F441C]/20"
                placeholder={t('Ex: Jean Kaptue', 'Ex: Jean Kaptue')}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">{t('Activité principale', 'Main activity')}</label>
              <input
                value={form.activity_type}
                onChange={e => setForm(f => ({ ...f, activity_type: e.target.value }))}
                className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3F441C]/20"
                placeholder={t('Ex: Producteur de maïs', 'Ex: Maize producer')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">{t('Région', 'Region')}</label>
                <select
                  value={form.region}
                  onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                  className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3F441C]/20 bg-white"
                >
                  <option value="">{t('Choisir...', 'Select...')}</option>
                  {CAMEROON_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">{t('Localité', 'Locality')}</label>
                <input
                  value={form.locality}
                  onChange={e => setForm(f => ({ ...f, locality: e.target.value }))}
                  className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3F441C]/20"
                  placeholder={t('Ex: Bafoussam', 'Ex: Bafoussam')}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: domainColor }}
              >
                <Save className="w-4 h-4" />
                {saving ? t('Enregistrement...', 'Saving...') : t('Enregistrer', 'Save')}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                {t('Annuler', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Informations de contact */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {t('Informations de contact', 'Contact information')}
          </h3>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">{t('Téléphone', 'Phone')}</p>
              <p className="font-semibold text-gray-800 text-sm">{user?.phone || t('Non fourni', 'Not provided')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-semibold text-gray-800 text-sm">{user?.email || t('Non fourni', 'Not provided')}</p>
            </div>
          </div>
        </div>

        {/* Confidentialité */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <button
            onClick={() => navigate('/privacy')}
            className="flex items-center gap-3 w-full text-left"
          >
            <Shield className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-700">{t('Politique de confidentialité', 'Privacy Policy')}</span>
          </button>
        </div>

        {/* Déconnexion mobile */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-2xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          {t('Se déconnecter', 'Log out')}
        </button>
      </div>
      </div>
    </div>
  );
}
