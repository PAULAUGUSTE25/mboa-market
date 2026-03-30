import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { getCardStyles, getTextStyles, getInputStyles } from '@/utils/cardStyles';
import Logo from '@/components/Logo';
import { Phone, Lock, User, MapPin, PackageSearch, ShoppingCart, Sprout, Beef, ChevronLeft } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const { register, loading, error } = useAuthStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // Get sector from URL params (agriculture or elevage)
  const sectorFromUrl = searchParams.get('sector');
  const initialDomain = sectorFromUrl === 'elevage' ? 'elevage' : 'agriculture';
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    profile: {
      display_name: '',
      activity_type: 'producer',
      domain: initialDomain,
      region: '',
      locality: '',
    },
  });
  
  // Update domain when URL params change
  useEffect(() => {
    if (sectorFromUrl) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          domain: sectorFromUrl === 'elevage' ? 'elevage' : 'agriculture'
        }
      }));
    }
  }, [sectorFromUrl]);

  // Couleurs et images selon le domaine sélectionné
  const isElevage = formData.profile.domain === 'elevage';
  const sectorColors = {
    primary: isElevage ? '#B71C1C' : '#2E7D32',
    primaryLight: isElevage ? 'rgba(183, 28, 28, 0.3)' : 'rgba(46, 125, 50, 0.3)',
    glow: isElevage ? 'rgba(183, 28, 28, 0.2)' : 'rgba(46, 125, 50, 0.2)',
    gradient: isElevage ? 'from-red-500/20 to-red-600/20' : 'from-emerald-500/20 to-green-600/20',
    iconColor: isElevage ? 'text-red-500/[0.12]' : 'text-emerald-500/[0.12]',
    glowBg: isElevage ? 'bg-red-500/[0.06]' : 'bg-emerald-500/[0.06]'
  };
  const sectorBgImage = isElevage 
    ? 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=2000'
    : 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=2000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    const errors: {[key: string]: string} = {};
    
    // Validation
    if (!formData.phone.startsWith('+')) {
      errors.phone = 'Le numéro doit commencer par + (ex: +237...)';
    } else if (formData.phone.length < 10) {
      errors.phone = 'Le numéro de téléphone est trop court';
    }
    
    if (formData.password.length < 6) {
      errors.password = 'Minimum 6 caractères requis';
    }
    
    if (!formData.profile.display_name.trim()) {
      errors.display_name = 'Le nom complet est obligatoire';
    }
    
    if (!formData.profile.region.trim()) {
      errors.region = 'La région est obligatoire';
    }
    
    // If there are validation errors, show them
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    // Clear errors before submission
    setFieldErrors({});
    
    try {
      await register(formData);
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/feed');
      }, 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Inscription échouée. Vérifiez vos informations.';
      setFieldErrors({ general: errorMsg });
      console.error('Registration failed:', err);
    }
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className="backdrop-blur-md rounded-3xl shadow-2xl p-8 mx-4 max-w-md transform animate-scaleIn border-2"
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#2E7D32' : 'rgba(16, 185, 129, 0.4)'
            }}
          >
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: getTextStyles(theme).title }}>Bienvenue sur MBOA Market!</h2>
              <p className="mb-2" style={{ color: getTextStyles(theme).body }}>
                Merci d'avoir rejoint notre communauté agricole et d'élevage.
              </p>
              <p className="text-sm mb-4" style={{ color: getTextStyles(theme).muted }}>
                Votre inscription a été enregistrée avec succès. 🎉
              </p>
              <div className="flex items-center justify-center space-x-2 text-teal-600">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Redirection en cours...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-['Inter','Plus_Jakarta_Sans',sans-serif] py-8">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed transition-all duration-500"
        style={{
          backgroundImage: `url('${sectorBgImage}')`,
        }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-green-950/85 via-teal-950/80 to-amber-950/85' : ''}`} style={{
          backdropFilter: theme === 'light' ? 'blur(0.5px)' : undefined,
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.15)' : undefined
        }}></div>
      </div>

      {/* Animated Background Pattern - Dark Mode Only */}
      {theme === 'dark' && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-amber-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-teal-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      )}

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
        <div className={sectorColors.iconColor}>
          {isElevage ? (
            <Beef 
              className="w-[600px] h-[600px]"
              strokeWidth={0.6}
            />
          ) : (
            <Sprout 
              className="w-[600px] h-[600px]"
              strokeWidth={0.6}
            />
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
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] ${sectorColors.glowBg}`}
        />
      </motion.div>

      {/* Conteneur Central Glassmorphism - Responsive */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4 sm:mx-6 lg:mx-auto"
      >
        <div 
          className="backdrop-blur-[25px] rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 sm:p-8 border relative overflow-hidden"
          style={{
            ...getCardStyles(theme, isElevage ? 'red' : 'emerald'),
            borderColor: theme === 'light' ? sectorColors.primary : 'rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Bordure Lumineuse */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          
          {/* Subtle Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.08, 0.12, 0.08],
              scale: [1, 1.005, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute -inset-[2px] rounded-[24px] sm:rounded-[32px] blur-2xl -z-10 bg-gradient-to-r ${sectorColors.gradient}`}
          />
          
          {/* Bouton Retour */}
          <button
            onClick={() => navigate('/')}
            className="mb-4 transition-all transform hover:scale-110 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
              border: theme === 'light' ? '2px solid #1A1A1A' : '2px solid rgba(255, 255, 255, 0.5)',
              boxShadow: theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'
            }}
          >
            <ChevronLeft 
              className="w-6 h-6" 
              strokeWidth={2.5}
              style={{ color: theme === 'light' ? '#1A1A1A' : '#FFFFFF' }}
            />
          </button>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4 sm:mb-6"
          >
            <Logo size="lg" className="mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-extrabold mb-1 text-left pl-2" style={{ color: getTextStyles(theme).title }}>INSCRIPTION</h2>
            <p className="text-sm sm:text-base text-left pl-2" style={{ color: getTextStyles(theme).subtitle }}>Rejoignez la communauté MBOA Market</p>
          </motion.div>

          {(error || fieldErrors.general) && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-400/50 text-white rounded-[16px] text-sm flex items-center justify-between">
              <span>{error || fieldErrors.general}</span>
              <button
                onClick={() => setFieldErrors({})}
                className="text-white hover:text-red-200 font-bold ml-2 text-xl"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input avec Icône - Téléphone */}
            <div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ opacity: 0.6 }}>
                  <Phone className="h-5 w-5" strokeWidth={1.5} style={{ color: getInputStyles(theme).color }} />
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (fieldErrors.phone) {
                      const newErrors = {...fieldErrors};
                      delete newErrors.phone;
                      setFieldErrors(newErrors);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3.5 backdrop-blur-md border-2 rounded-[16px] focus:outline-none focus:ring-2 transition-all duration-300"
                  style={getInputStyles(theme, !!fieldErrors.phone)}
                  placeholder="Numéro de téléphone"
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-red-300 text-xs mt-1.5 ml-1">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Input avec Icône - Mot de passe */}
            <div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ opacity: 0.6 }}>
                  <Lock className="h-5 w-5" strokeWidth={1.5} style={{ color: getInputStyles(theme).color }} />
                </div>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (fieldErrors.password) {
                      const newErrors = {...fieldErrors};
                      delete newErrors.password;
                      setFieldErrors(newErrors);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3.5 backdrop-blur-md border-2 rounded-[16px] focus:outline-none focus:ring-2 transition-all duration-300"
                  style={getInputStyles(theme, !!fieldErrors.password)}
                  required
                />
              </div>
              {fieldErrors.password && (
                <p className="text-red-300 text-xs mt-1.5 ml-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Input avec Icône - Nom complet */}
            <div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ opacity: 0.6 }}>
                  <User className="h-5 w-5" strokeWidth={1.5} style={{ color: getInputStyles(theme).color }} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.profile.display_name}
                  onChange={(e) => {
                    setFormData({ ...formData, profile: { ...formData.profile, display_name: e.target.value } });
                    if (fieldErrors.display_name) {
                      const newErrors = {...fieldErrors};
                      delete newErrors.display_name;
                      setFieldErrors(newErrors);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3.5 backdrop-blur-md border-2 rounded-[16px] focus:outline-none focus:ring-2 transition-all duration-300"
                  style={getInputStyles(theme, !!fieldErrors.display_name)}
                  placeholder="Nom complet"
                />
              </div>
              {fieldErrors.display_name && (
                <p className="text-red-300 text-xs mt-1.5 ml-1">{fieldErrors.display_name}</p>
              )}
            </div>

            {/* Domaine - Sélection Agriculture/Élevage */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: getTextStyles(theme).title }}>Domaine d'activité</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div
                  onClick={() => setFormData({ ...formData, profile: { ...formData.profile, domain: 'agriculture' } })}
                  className="group cursor-pointer rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 border-2 transition-all duration-300"
                  style={{
                    background: theme === 'light' 
                      ? (formData.profile.domain === 'agriculture' ? '#2E7D32' : '#FFFFFF')
                      : (formData.profile.domain === 'agriculture' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.05)'),
                    borderColor: theme === 'light'
                      ? (formData.profile.domain === 'agriculture' ? '#2E7D32' : '#D1D5DB')
                      : (formData.profile.domain === 'agriculture' ? '#4ADE80' : 'rgba(255, 255, 255, 0.2)'),
                    boxShadow: formData.profile.domain === 'agriculture' 
                      ? (theme === 'light' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(34, 197, 94, 0.2)')
                      : 'none'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 transition-all"
                      style={{
                        background: theme === 'light'
                          ? (formData.profile.domain === 'agriculture' ? '#FFFFFF' : '#2E7D32')
                          : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <Sprout 
                        className="h-5 w-5 sm:h-6 sm:w-6 transition-colors" 
                        strokeWidth={1.5}
                        style={{
                          color: theme === 'light'
                            ? (formData.profile.domain === 'agriculture' ? '#2E7D32' : '#FFFFFF')
                            : (formData.profile.domain === 'agriculture' ? '#86EFAC' : 'rgba(255, 255, 255, 0.7)')
                        }}
                      />
                    </div>
                    <span 
                      className="text-[10px] sm:text-xs font-semibold"
                      style={{
                        color: theme === 'light'
                          ? (formData.profile.domain === 'agriculture' ? '#FFFFFF' : '#1A1A1A')
                          : (formData.profile.domain === 'agriculture' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)')
                      }}
                    >Agriculture</span>
                  </div>
                </div>
                
                <div
                  onClick={() => setFormData({ ...formData, profile: { ...formData.profile, domain: 'elevage' } })}
                  className="group cursor-pointer rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 border-2 transition-all duration-300"
                  style={{
                    background: theme === 'light' 
                      ? (formData.profile.domain === 'elevage' ? '#B71C1C' : '#FFFFFF')
                      : (formData.profile.domain === 'elevage' ? 'rgba(183, 28, 28, 0.3)' : 'rgba(255, 255, 255, 0.05)'),
                    borderColor: theme === 'light'
                      ? (formData.profile.domain === 'elevage' ? '#B71C1C' : '#D1D5DB')
                      : (formData.profile.domain === 'elevage' ? '#FCD34D' : 'rgba(255, 255, 255, 0.2)'),
                    boxShadow: formData.profile.domain === 'elevage' 
                      ? (theme === 'light' ? '0 4px 12px rgba(183, 28, 28, 0.3)' : '0 4px 12px rgba(183, 28, 28, 0.2)')
                      : 'none'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 transition-all"
                      style={{
                        background: theme === 'light'
                          ? (formData.profile.domain === 'elevage' ? '#FFFFFF' : '#B71C1C')
                          : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <Beef 
                        className="h-5 w-5 sm:h-6 sm:w-6 transition-colors" 
                        strokeWidth={1.5}
                        style={{
                          color: theme === 'light'
                            ? (formData.profile.domain === 'elevage' ? '#B71C1C' : '#FFFFFF')
                            : (formData.profile.domain === 'elevage' ? '#EF5350' : 'rgba(255, 255, 255, 0.7)')
                        }}
                      />
                    </div>
                    <span 
                      className="text-[10px] sm:text-xs font-semibold"
                      style={{
                        color: theme === 'light'
                          ? (formData.profile.domain === 'elevage' ? '#FFFFFF' : '#1A1A1A')
                          : (formData.profile.domain === 'elevage' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)')
                      }}
                    >Élevage</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Type d'activité - Grille Responsive */}
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-semibold mb-2" style={{ color: getTextStyles(theme).title }}>Type d'activité</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div
                  onClick={() => setFormData({ ...formData, profile: { ...formData.profile, activity_type: 'seed_provider' } })}
                  className="group cursor-pointer rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 border-2 transition-all duration-300"
                  style={{
                    background: theme === 'light'
                      ? (formData.profile.activity_type === 'seed_provider' ? '#1565C0' : '#FFFFFF')
                      : (formData.profile.activity_type === 'seed_provider' ? 'rgba(21, 101, 192, 0.3)' : 'rgba(255, 255, 255, 0.05)'),
                    borderColor: theme === 'light'
                      ? (formData.profile.activity_type === 'seed_provider' ? '#1565C0' : '#D1D5DB')
                      : (formData.profile.activity_type === 'seed_provider' ? '#64B5F6' : 'rgba(255, 255, 255, 0.2)'),
                    boxShadow: formData.profile.activity_type === 'seed_provider'
                      ? (theme === 'light' ? '0 4px 12px rgba(21, 101, 192, 0.3)' : '0 4px 12px rgba(21, 101, 192, 0.2)')
                      : 'none'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 transition-all"
                      style={{
                        background: theme === 'light'
                          ? (formData.profile.activity_type === 'seed_provider' ? '#FFFFFF' : '#1565C0')
                          : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <PackageSearch 
                        className="h-5 w-5 sm:h-6 sm:w-6 transition-colors" 
                        strokeWidth={1.5}
                        style={{
                          color: theme === 'light'
                            ? (formData.profile.activity_type === 'seed_provider' ? '#1565C0' : '#FFFFFF')
                            : (formData.profile.activity_type === 'seed_provider' ? '#64B5F6' : 'rgba(255, 255, 255, 0.7)')
                        }}
                      />
                    </div>
                    <span 
                      className="text-[10px] sm:text-xs font-semibold"
                      style={{
                        color: theme === 'light'
                          ? (formData.profile.activity_type === 'seed_provider' ? '#FFFFFF' : '#1A1A1A')
                          : (formData.profile.activity_type === 'seed_provider' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)')
                      }}
                    >Fournisseur</span>
                  </div>
                </div>
                
                <div
                  onClick={() => setFormData({ ...formData, profile: { ...formData.profile, activity_type: 'producer' } })}
                  className="group cursor-pointer rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 border-2 transition-all duration-300"
                  style={{
                    background: theme === 'light'
                      ? (formData.profile.activity_type === 'producer' ? '#6B7280' : '#FFFFFF')
                      : (formData.profile.activity_type === 'producer' ? 'rgba(107, 114, 128, 0.3)' : 'rgba(255, 255, 255, 0.05)'),
                    borderColor: theme === 'light'
                      ? (formData.profile.activity_type === 'producer' ? '#6B7280' : '#D1D5DB')
                      : (formData.profile.activity_type === 'producer' ? '#9CA3AF' : 'rgba(255, 255, 255, 0.2)'),
                    boxShadow: formData.profile.activity_type === 'producer'
                      ? (theme === 'light' ? '0 4px 12px rgba(107, 114, 128, 0.3)' : '0 4px 12px rgba(107, 114, 128, 0.2)')
                      : 'none'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 transition-all"
                      style={{
                        background: theme === 'light'
                          ? (formData.profile.activity_type === 'producer' ? '#FFFFFF' : '#6B7280')
                          : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <Sprout 
                        className="h-5 w-5 sm:h-6 sm:w-6 transition-colors" 
                        strokeWidth={1.5}
                        style={{
                          color: theme === 'light'
                            ? (formData.profile.activity_type === 'producer' ? '#6B7280' : '#FFFFFF')
                            : (formData.profile.activity_type === 'producer' ? '#9CA3AF' : 'rgba(255, 255, 255, 0.7)')
                        }}
                      />
                    </div>
                    <span 
                      className="text-[10px] sm:text-xs font-semibold"
                      style={{
                        color: theme === 'light'
                          ? (formData.profile.activity_type === 'producer' ? '#FFFFFF' : '#1A1A1A')
                          : (formData.profile.activity_type === 'producer' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)')
                      }}
                    >Producteur</span>
                  </div>
                </div>
                
                <div
                  onClick={() => setFormData({ ...formData, profile: { ...formData.profile, activity_type: 'buyer' } })}
                  className="group cursor-pointer rounded-[12px] sm:rounded-[16px] p-3 sm:p-4 border-2 transition-all duration-300"
                  style={{
                    background: theme === 'light'
                      ? (formData.profile.activity_type === 'buyer' ? '#2E7D32' : '#FFFFFF')
                      : (formData.profile.activity_type === 'buyer' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.05)'),
                    borderColor: theme === 'light'
                      ? (formData.profile.activity_type === 'buyer' ? '#2E7D32' : '#D1D5DB')
                      : (formData.profile.activity_type === 'buyer' ? '#4ADE80' : 'rgba(255, 255, 255, 0.2)'),
                    boxShadow: formData.profile.activity_type === 'buyer'
                      ? (theme === 'light' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(34, 197, 94, 0.2)')
                      : 'none'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 transition-all"
                      style={{
                        background: theme === 'light'
                          ? (formData.profile.activity_type === 'buyer' ? '#FFFFFF' : '#2E7D32')
                          : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <ShoppingCart 
                        className="h-5 w-5 sm:h-6 sm:w-6 transition-colors" 
                        strokeWidth={1.5}
                        style={{
                          color: theme === 'light'
                            ? (formData.profile.activity_type === 'buyer' ? '#2E7D32' : '#FFFFFF')
                            : (formData.profile.activity_type === 'buyer' ? '#86EFAC' : 'rgba(255, 255, 255, 0.7)')
                        }}
                      />
                    </div>
                    <span 
                      className="text-[10px] sm:text-xs font-semibold"
                      style={{
                        color: theme === 'light'
                          ? (formData.profile.activity_type === 'buyer' ? '#FFFFFF' : '#1A1A1A')
                          : (formData.profile.activity_type === 'buyer' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)')
                      }}
                    >Acheteur</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input avec Icône - Région */}
            <div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ opacity: 0.6 }}>
                  <MapPin className="h-5 w-5" strokeWidth={1.5} style={{ color: getInputStyles(theme).color }} />
                </div>
                <input
                  type="text"
                  placeholder="Région"
                  value={formData.profile.region}
                  onChange={(e) => {
                    setFormData({ ...formData, profile: { ...formData.profile, region: e.target.value } });
                    if (fieldErrors.region) {
                      const newErrors = {...fieldErrors};
                      delete newErrors.region;
                      setFieldErrors(newErrors);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3.5 backdrop-blur-md border-2 rounded-[16px] focus:outline-none focus:ring-2 transition-all duration-300"
                  style={getInputStyles(theme, !!fieldErrors.region)}
                  required
                />
              </div>
              {fieldErrors.region && (
                <p className="text-red-300 text-xs mt-1.5 ml-1">{fieldErrors.region}</p>
              )}
            </div>

            {/* Input avec Icône - Localité */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ opacity: 0.6 }}>
                <MapPin className="h-5 w-5" strokeWidth={1.5} style={{ color: getInputStyles(theme).color }} />
              </div>
              <input
                type="text"
                placeholder="Localité"
                value={formData.profile.locality}
                onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, locality: e.target.value } })}
                className="w-full pl-12 pr-4 py-3.5 backdrop-blur-md border-2 rounded-[16px] focus:outline-none focus:ring-2 transition-all duration-300"
                style={getInputStyles(theme)}
              />
            </div>

            {/* Bouton Principal Responsive */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 rounded-[16px] font-bold text-base sm:text-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4 sm:mt-6"
              style={{
                background: sectorColors.primary,
                color: '#FFFFFF',
                boxShadow: `0 4px 15px ${sectorColors.glow}`
              }}
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          {/* Lien de Connexion Bien Visible */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: getTextStyles(theme).body }}>
              Déjà inscrit?{' '}
              <Link to="/login" className="font-bold transition-colors underline" style={{ color: theme === 'light' ? '#2E7D32' : '#6EE7B7' }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
