import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { User, Edit3, Save, X, MapPin, Briefcase, Package, Sprout, ShoppingCart, PackageSearch, Wheat, Beef, LogOut, Trash2, Users } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/utils/themeStyles';
import { getCardStyles, getTextStyles, getInputStyles, getButtonStyles } from '@/utils/cardStyles';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user?.profile?.display_name || '',
    activity_type: user?.profile?.activity_type || 'producer',
    domain: user?.profile?.domain || 'agriculture',
    region: user?.profile?.region || '',
    locality: user?.profile?.locality || '',
    crop: (user?.profile as any)?.crop || 'Tomate',
  });

  useEffect(() => {
    loadMyListings();
  }, []);

  // Synchronize crop with domain on mount and when domain/activity changes
  useEffect(() => {
    const agricultureProducts = ['Tomate', 'Maïs', 'Manioc', 'Haricot', 'Arachide', 'Piment', 'Gombo', 'Aubergine', 'Banane Plantain', 'Cacao', 'Café', 'Palmier à huile'];
    const elevageAdults = ['Poulet', 'Porc', 'Bovin', 'Mouton', 'Chèvre', 'Lapin', 'Canard', 'Dinde', 'Poisson (Pisciculture)', 'Abeille (Apiculture)', 'Escargot (Héliculture)'];
    const elevageYoung = ['Poussins', 'Porcelets', 'Veaux', 'Agneaux', 'Chevreaux', 'Lapereaux', 'Canetons', 'Dindonneaux', 'Alevins', 'Essaims d\'abeilles', 'Naissains d\'escargots'];
    const allElevageProducts = [...elevageAdults, ...elevageYoung];
    
    const currentCrop = formData.crop;
    const currentDomain = formData.domain;
    const currentActivityType = formData.activity_type;
    
    // Check if current crop matches the domain
    if (currentDomain === 'agriculture' && !agricultureProducts.includes(currentCrop)) {
      setFormData(prev => ({ ...prev, crop: 'Tomate' }));
    } else if (currentDomain === 'elevage') {
      // If not in elevage products list at all, set default
      if (!allElevageProducts.includes(currentCrop)) {
        const defaultCrop = currentActivityType === 'seed_provider' ? 'Poussins' : 'Poulet';
        setFormData(prev => ({ ...prev, crop: defaultCrop }));
      } 
      // If fournisseur but has adult animal, convert to young
      else if (currentActivityType === 'seed_provider' && elevageAdults.includes(currentCrop)) {
        const animalMap: Record<string, string> = {
          'Poulet': 'Poussins',
          'Porc': 'Porcelets',
          'Bovin': 'Veaux',
          'Mouton': 'Agneaux',
          'Chèvre': 'Chevreaux',
          'Lapin': 'Lapereaux',
          'Canard': 'Canetons',
          'Dinde': 'Dindonneaux',
          'Poisson (Pisciculture)': 'Alevins',
          'Abeille (Apiculture)': 'Essaims d\'abeilles',
          'Escargot (Héliculture)': 'Naissains d\'escargots'
        };
        const youngAnimal = animalMap[currentCrop] || 'Poussins';
        setFormData(prev => ({ ...prev, crop: youngAnimal }));
      }
      // If producteur/acheteur but has young animal, convert to adult
      else if (currentActivityType !== 'seed_provider' && elevageYoung.includes(currentCrop)) {
        const reverseMap: Record<string, string> = {
          'Poussins': 'Poulet',
          'Porcelets': 'Porc',
          'Veaux': 'Bovin',
          'Agneaux': 'Mouton',
          'Chevreaux': 'Chèvre',
          'Lapereaux': 'Lapin',
          'Canetons': 'Canard',
          'Dindonneaux': 'Dinde',
          'Alevins': 'Poisson (Pisciculture)',
          'Essaims d\'abeilles': 'Abeille (Apiculture)',
          'Naissains d\'escargots': 'Escargot (Héliculture)'
        };
        const adultAnimal = reverseMap[currentCrop] || 'Poulet';
        setFormData(prev => ({ ...prev, crop: adultAnimal }));
      }
    }
  }, [formData.domain, formData.activity_type]);

  const loadMyListings = async () => {
    try {
      setLoading(true);
      const listings = await api.getMyListings();
      // Ensure all listings have PUBLISHED status by default
      const listingsWithStatus = listings.map((listing: any) => ({
        ...listing,
        status: listing.status || 'PUBLISHED'
      }));
      setMyListings(listingsWithStatus);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updatedProfile = await api.updateProfile(formData);
      // Update user in store with new profile data including crop
      setUser({ ...user!, profile: { ...updatedProfile, crop: formData.crop } });
      setEditMode(false);
      alert('✅ Profil mis à jour avec succès!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('❌ Erreur lors de la mise à jour du profil');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteListing = async (listingId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la navigation vers le détail
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      await api.deleteListing(listingId);
      // Rafraîchir la liste après suppression
      setMyListings(myListings.filter(listing => listing.id !== listingId));
      alert('✅ Annonce supprimée avec succès!');
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert('❌ Erreur lors de la suppression de l\'annonce');
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      seed_provider: 'Fournisseur',
      producer: 'Producteur',
      buyer: 'Acheteur',
    };
    return labels[type] || type;
  };

  const getActivityTypeIcon = (type: string) => {
    if (type === 'seed_provider') return <PackageSearch className="h-5 w-5" strokeWidth={2} />;
    if (type === 'producer') return <Sprout className="h-5 w-5" strokeWidth={2} />;
    if (type === 'buyer') return <ShoppingCart className="h-5 w-5" strokeWidth={2} />;
    return <User className="h-5 w-5" strokeWidth={2} />;
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-['Inter','Plus_Jakarta_Sans',sans-serif]">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: theme === 'light' 
            ? `url('/light%20mode%20.png')`
            : `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')`,
        }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? `bg-gradient-to-br ${styles.background}` : ''}`} style={{
          backdropFilter: theme === 'light' ? 'blur(2px)' : undefined,
          backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : undefined
        }}></div>
      </div>

      {/* Animated Background Pattern - Dark Mode Only */}
      {theme === 'dark' && (
        <div className={`fixed inset-0 ${styles.blobs}`}>
          <div className={`absolute top-10 left-10 w-32 h-32 ${styles.blobColors[0]} rounded-full blur-3xl animate-pulse`}></div>
          <div className={`absolute top-40 right-20 w-40 h-40 ${styles.blobColors[1]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
          <div className={`absolute bottom-20 left-1/4 w-36 h-36 ${styles.blobColors[2]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
        </div>
      )}

      <div className="relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <button
          onClick={() => navigate('/feed')}
          className="mb-4 sm:mb-6 transition-all transform hover:scale-110 text-2xl font-bold"
          style={{ color: theme === 'light' ? '#374151' : styles.text.link }}
        >
          ←
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card - Responsive */}
          <div className="lg:col-span-1">
            <div 
              className="rounded-2xl backdrop-blur-xl shadow-lg p-6 sm:p-8 border"
              style={{
                ...getCardStyles(theme, 'emerald'),
                borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Avatar et Infos - Responsive */}
              <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                {/* Avatar Photo Réel - Responsive */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 sm:mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-600/30 flex items-center justify-center border-3 sm:border-4 border-emerald-500/30 shadow-lg">
                    <User className="h-12 w-12 sm:h-14 sm:w-14 text-emerald-400" strokeWidth={1.5} />
                  </div>
                  {/* Status Badge Responsive */}
                  <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full border-2 sm:border-3 border-[#060D0A] shadow-md"></div>
                </div>
                <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ fontFamily: 'Inter, Plus Jakarta Sans, sans-serif', color: getTextStyles(theme).title }}>
                  {user.profile?.display_name || 'Utilisateur'}
                </h2>
                <p className="text-xs sm:text-sm font-normal mb-1" style={{ color: getTextStyles(theme).muted }}>{user.phone}</p>
                {user.email && (
                  <p className="text-xs sm:text-sm font-normal" style={{ color: getTextStyles(theme).muted }}>{user.email}</p>
                )}
              </div>

              {/* Activity Type Selector Responsive */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs font-medium mb-3" style={{ color: getTextStyles(theme).muted }}>
                  Type d'activité
                </label>
                {showActivitySelector ? (
                  <div className="space-y-2">
                    {[
                      { value: 'seed_provider', label: 'Fournisseur' },
                      { value: 'producer', label: 'Producteur' },
                      { value: 'buyer', label: 'Acheteur' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFormData({ ...formData, activity_type: option.value });
                          setShowActivitySelector(false);
                          setEditMode(true);
                        }}
                        className="w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-all border-2"
                        style={{
                          background: theme === 'light'
                            ? (formData.activity_type === option.value ? '#10B981' : '#FFFFFF')
                            : (formData.activity_type === option.value ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
                          borderColor: theme === 'light'
                            ? (formData.activity_type === option.value ? '#10B981' : '#D1D5DB')
                            : (formData.activity_type === option.value ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)')
                        }}
                      >
                        <div className="flex-shrink-0">
                          {option.value === 'seed_provider' && <PackageSearch className="h-5 w-5 text-emerald-400" strokeWidth={2} />}
                          {option.value === 'producer' && <Sprout className="h-5 w-5 text-emerald-400" strokeWidth={2} />}
                          {option.value === 'buyer' && <ShoppingCart className="h-5 w-5 text-emerald-400" strokeWidth={2} />}
                        </div>
                        <span className="font-semibold text-sm sm:text-base" style={{ color: theme === 'light' ? (formData.activity_type === option.value ? '#FFFFFF' : '#1A1A1A') : '#FFFFFF' }}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowActivitySelector(true)}
                    className="w-full p-2.5 sm:p-3 rounded-2xl font-semibold transition-all flex items-center justify-between border text-sm sm:text-base"
                    style={{
                      ...getButtonStyles(theme, 'primary', 'emerald'),
                      borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <span className="flex items-center">
                      <span className="text-lg sm:text-xl mr-2 sm:mr-3">{getActivityTypeIcon(formData.activity_type)}</span>
                      {getActivityTypeLabel(formData.activity_type)}
                    </span>
                    <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>

              {/* Location Info Responsive */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Région</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={getInputStyles(theme)}
                    />
                  ) : (
                    <p className="text-sm sm:text-base font-semibold" style={{ color: getTextStyles(theme).title }}>{user.profile?.region || 'Non spécifié'}</p>
                  )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Localité</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.locality}
                      onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      className="w-full md:w-1/2 xl:w-1/3 px-3 py-2 border-2 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all"
                      style={getInputStyles(theme)}
                    />
                  ) : (
                    <p className="text-sm sm:text-base font-semibold" style={{ color: getTextStyles(theme).title }}>{user.profile?.locality || 'Non spécifié'}</p>
                  )}
                  </div>
                </div>

                {/* Domain Selection - Agriculture or Elevage */}
                <div className="flex items-start gap-3">
                  {formData.domain === 'agriculture' ? (
                    <Wheat className="h-4 w-4 text-gray-400 mt-1" />
                  ) : (
                    <Beef className="h-4 w-4 text-gray-400 mt-1" />
                  )}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Domaine d'activité</label>
                    {editMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ 
                              ...formData, 
                              domain: 'agriculture',
                              crop: 'Tomate'
                            });
                          }}
                          className="p-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2"
                          style={{
                            background: theme === 'light'
                              ? (formData.domain === 'agriculture' ? '#10B981' : '#FFFFFF')
                              : (formData.domain === 'agriculture' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)'),
                            borderColor: theme === 'light'
                              ? (formData.domain === 'agriculture' ? '#10B981' : '#D1D5DB')
                              : (formData.domain === 'agriculture' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.2)'),
                            color: theme === 'light'
                              ? (formData.domain === 'agriculture' ? '#FFFFFF' : '#1A1A1A')
                              : '#FFFFFF'
                          }}
                        >
                          <Wheat className="h-5 w-5" />
                          <span className="text-sm">Agriculture</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ 
                              ...formData, 
                              domain: 'elevage',
                              crop: formData.activity_type === 'seed_provider' ? 'Poussins' : 'Poulet'
                            });
                          }}
                          className="p-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2"
                          style={{
                            background: theme === 'light'
                              ? (formData.domain === 'elevage' ? '#F59E0B' : '#FFFFFF')
                              : (formData.domain === 'elevage' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(255, 255, 255, 0.05)'),
                            borderColor: theme === 'light'
                              ? (formData.domain === 'elevage' ? '#F59E0B' : '#D1D5DB')
                              : (formData.domain === 'elevage' ? 'rgba(251, 146, 60, 0.5)' : 'rgba(255, 255, 255, 0.2)'),
                            color: theme === 'light'
                              ? (formData.domain === 'elevage' ? '#FFFFFF' : '#1A1A1A')
                              : '#FFFFFF'
                          }}
                        >
                          <Beef className="h-5 w-5" />
                          <span className="text-sm">Élevage</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold rounded-full flex items-center gap-2">
                          {formData.domain === 'agriculture' ? (
                            <>
                              <Wheat className="h-4 w-4" />
                              Agriculture
                            </>
                          ) : (
                            <>
                              <Beef className="h-4 w-4" />
                              Élevage
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Product Selection - For all activity types in both agriculture and elevage */}
                <div className="flex items-start gap-3">
                  {formData.domain === 'agriculture' ? (
                    <Sprout className="h-4 w-4 text-gray-400 mt-1" />
                  ) : (
                    <Beef className="h-4 w-4 text-gray-400 mt-1" />
                  )}
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {formData.domain === 'elevage' 
                        ? (formData.activity_type === 'seed_provider' ? 'Jeunes animaux fournis' : formData.activity_type === 'buyer' ? 'Type d\'animal recherché' : 'Type d\'animal élevé')
                        : (formData.activity_type === 'seed_provider' ? 'Semences fournies' : formData.activity_type === 'buyer' ? 'Produit recherché' : 'Culture principale')
                      }
                    </label>
                      {editMode ? (
                        <select
                          value={formData.crop}
                          onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                          className="w-full px-4 py-3 border-2 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 transition-all duration-200"
                          style={{
                            ...getInputStyles(theme),
                            colorScheme: theme === 'dark' ? 'dark' : 'light'
                          }}
                        >
                          {formData.domain === 'elevage' ? (
                            // Options pour l'élevage
                            formData.activity_type === 'seed_provider' ? (
                              // Jeunes animaux pour les fournisseurs
                              <>
                                <option value="Poussins">🐣 Poussins (bébés poulets)</option>
                                <option value="Porcelets">🐷 Porcelets (bébés porcs)</option>
                                <option value="Veaux">🐮 Veaux (bébés bovins)</option>
                                <option value="Agneaux">🐑 Agneaux (bébés moutons)</option>
                                <option value="Chevreaux">🐐 Chevreaux (bébés chèvres)</option>
                                <option value="Lapereaux">🐇 Lapereaux (bébés lapins)</option>
                                <option value="Canetons">🦆 Canetons (bébés canards)</option>
                                <option value="Dindonneaux">🦃 Dindonneaux (bébés dindes)</option>
                                <option value="Alevins">🐟 Alevins (bébés poissons)</option>
                                <option value="Essaims d'abeilles">🐝 Essaims d'abeilles</option>
                                <option value="Naissains d'escargots">🐌 Naissains d'escargots</option>
                              </>
                            ) : (
                              // Animaux adultes pour producteurs et acheteurs
                              <>
                                <option value="Poulet">🐔 Poulet</option>
                                <option value="Porc">🐷 Porc</option>
                                <option value="Bovin">🐄 Bovin</option>
                                <option value="Mouton">🐑 Mouton</option>
                                <option value="Chèvre">🐐 Chèvre</option>
                                <option value="Lapin">🐇 Lapin</option>
                                <option value="Canard">🦆 Canard</option>
                                <option value="Dinde">🦃 Dinde</option>
                                <option value="Poisson (Pisciculture)">🐟 Poisson (Pisciculture)</option>
                                <option value="Abeille (Apiculture)">🐝 Abeille (Apiculture)</option>
                                <option value="Escargot (Héliculture)">🐌 Escargot (Héliculture)</option>
                              </>
                            )
                          ) : (
                            // Options pour l'agriculture
                            <>
                              <option value="Tomate">🍅 Tomate</option>
                              <option value="Maïs">🌽 Maïs</option>
                              <option value="Manioc">🥔 Manioc</option>
                              <option value="Haricot">🫘 Haricot</option>
                              <option value="Arachide">🥜 Arachide</option>
                              <option value="Piment">🌶️ Piment</option>
                              <option value="Gombo">🫛 Gombo</option>
                              <option value="Aubergine">🍆 Aubergine</option>
                              <option value="Banane Plantain">🍌 Banane Plantain</option>
                              <option value="Cacao">🍫 Cacao</option>
                              <option value="Café">☕ Café</option>
                              <option value="Palmier à huile">🌴 Palmier à huile</option>
                            </>
                          )}
                        </select>
                      ) : (
                        <p className="text-sm sm:text-base font-semibold" style={{ color: getTextStyles(theme).title }}>{formData.crop || 'Non spécifié'}</p>
                      )}
                    </div>
                  </div>
              </div>

              {/* Action Buttons - Responsive */}
              <div className="space-y-2.5 sm:space-y-3">
                {editMode ? (
                  <>
                    <button
                      onClick={handleUpdateProfile}
                      className="w-full border py-2.5 sm:py-3 rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                      style={getButtonStyles(theme, 'primary', 'emerald')}
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          display_name: user.profile?.display_name || '',
                          activity_type: user.profile?.activity_type || 'producer',
                          domain: user.profile?.domain || 'agriculture',
                          region: user.profile?.region || '',
                          locality: user.profile?.locality || '',
                          crop: (user?.profile as any)?.crop || 'Tomate',
                        });
                      }}
                      className="w-full border py-2.5 sm:py-3 rounded-2xl font-semibold transition-all text-sm sm:text-base"
                      style={getButtonStyles(theme, 'secondary')}
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full border py-2.5 sm:py-3 rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                    style={getButtonStyles(theme, 'primary', 'emerald')}
                  >
                    <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Modifier le profil
                  </button>
                )}
                {/* Déconnexion Responsive */}
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 sm:py-3 rounded-[16px] font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  style={{
                    color: '#DC2626',
                    background: theme === 'light' ? '#FEE2E2' : 'transparent',
                    border: theme === 'light' ? '1px solid #FCA5A5' : 'none'
                  }}
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* My Listings - Responsive */}
          <div className="lg:col-span-2">
            <div 
              className="rounded-2xl backdrop-blur-xl shadow-lg p-6 sm:p-8 border"
              style={{
                ...getCardStyles(theme, 'emerald'),
                borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ fontFamily: 'Inter, Plus Jakarta Sans, sans-serif', color: getTextStyles(theme).title }}>
                Mes Annonces ({myListings.length})
              </h3>

              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-emerald-500 border-t-transparent"></div>
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base" style={{ color: getTextStyles(theme).body }}>Chargement...</p>
                </div>
              ) : myListings.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-base sm:text-lg mb-3 sm:mb-4" style={{ color: getTextStyles(theme).body }}>Aucune annonce pour le moment</p>
                  <button
                    onClick={() => navigate('/listings/create')}
                    className="border px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all shadow-lg text-sm sm:text-base"
                    style={getButtonStyles(theme, 'primary', 'emerald')}
                  >
                    ➞ Créer une annonce
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative group/card backdrop-blur-sm"
                      style={{
                        background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: theme === 'light' ? '#D1D5DB' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
                      }}
                    >
                      {/* Vignette Image Responsive */}
                      <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                        {listing.images && listing.images.length > 0 ? (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-[12px] sm:rounded-[16px] overflow-hidden flex-shrink-0">
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-[12px] sm:rounded-[16px] flex items-center justify-center flex-shrink-0">
                            <Sprout className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                          </div>
                        )}
                        {/* Titres Responsive */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm sm:text-base mb-1 truncate" style={{ color: getTextStyles(theme).title }}>{listing.title}</h4>
                          <p className="text-xs sm:text-sm line-clamp-2" style={{ color: getTextStyles(theme).muted }}>{listing.description}</p>
                        </div>
                      </div>
                      {/* Prix et Actions Responsive */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base sm:text-lg font-bold text-emerald-400">
                          {listing.price} FCFA
                        </span>
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Pastille de Statut */}
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              (listing.status === 'active' || listing.status === 'PUBLISHED') ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="text-[10px] sm:text-xs font-medium text-gray-400">
                              {(listing.status === 'active' || listing.status === 'PUBLISHED') ? 'Publié' : 'Inactif'}
                            </span>
                          </div>
                          {/* Bouton Supprimer */}
                          <button
                            onClick={(e) => handleDeleteListing(listing.id, e)}
                            className="p-1.5 sm:p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all opacity-0 group-hover/card:opacity-100"
                            title="Supprimer l'annonce"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links - Responsive */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <button
                onClick={() => navigate('/community/agriculture')}
                className="group rounded-2xl p-4 sm:p-5 md:p-6 border-2 transition-all duration-300 backdrop-blur-sm"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.2)',
                  boxShadow: theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                {/* Icône SVG Responsive */}
                <Sprout className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-emerald-400 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <p className="font-semibold text-xs sm:text-sm md:text-base transition-colors" style={{ color: theme === 'light' ? '#1A1A1A' : '#FFFFFF' }}>Communauté Agriculture</p>
              </button>
              <button
                onClick={() => navigate('/community/elevage')}
                className="group rounded-2xl p-4 sm:p-5 md:p-6 border-2 transition-all duration-300 backdrop-blur-sm"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.2)',
                  boxShadow: theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                {/* Icône SVG Responsive */}
                <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-amber-400 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <p className="font-semibold text-xs sm:text-sm md:text-base transition-colors" style={{ color: theme === 'light' ? '#1A1A1A' : '#FFFFFF' }}>Communauté Élevage</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
