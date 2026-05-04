import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Lock, User, MapPin, ShoppingCart, CheckCircle, Truck } from 'lucide-react';
import { SproutIcon, CowIcon } from '@/components/icons/UnifiedIcons';
import BackButton from '@/components/BackButton';
import gsap from 'gsap';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, loading, error } = useAuthStore();
  const { t } = useLanguage();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animation d'entrée pour la carte
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const isElevage = formData.profile.domain === 'elevage';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: {[key: string]: string} = {};
    
    if (!formData.phone.startsWith('+')) {
      errors.phone = t('Le numéro doit commencer par + (ex: +237...)', 'Number must start with + (e.g. +237...)');
    } else if (formData.phone.length < 10) {
      errors.phone = t('Le numéro de téléphone est trop court', 'Phone number is too short');
    }
    
    // Validation du mot de passe forte (backend exige)
    if (formData.password.length < 8) {
      errors.password = t('Minimum 8 caractères requis', 'Minimum 8 characters required');
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = t('Doit contenir au moins une majuscule', 'Must contain at least one uppercase letter');
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = t('Doit contenir au moins une minuscule', 'Must contain at least one lowercase letter');
    } else if (!/\d/.test(formData.password)) {
      errors.password = t('Doit contenir au moins un chiffre', 'Must contain at least one number');
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      errors.password = t('Doit contenir au moins un caractère spécial (!@#$%...)', 'Must contain at least one special character (!@#$%...)');
    }
    
    if (!formData.profile.display_name.trim()) {
      errors.display_name = t('Le nom complet est obligatoire', 'Full name is required');
    }
    
    if (!formData.profile.region.trim()) {
      errors.region = t('La région est obligatoire', 'Region is required');
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setFieldErrors({});
    
    try {
      await register(formData);
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/feed');
      }, 3000);
    } catch (err: any) {
      console.error('Registration failed:', err);
      
      // Gérer les erreurs de validation du backend (422)
      if (err.response?.status === 422 && err.response?.data?.detail) {
        const validationErrors: {[key: string]: string} = {};
        const details = err.response.data.detail;
        
        if (Array.isArray(details)) {
          details.forEach((error: any) => {
            const field = error.loc?.[error.loc.length - 1] || 'general';
            validationErrors[field] = error.msg || t('Erreur de validation', 'Validation error');
          });
        } else if (typeof details === 'string') {
          validationErrors.general = details;
        }
        
        setFieldErrors(validationErrors);
      } else {
        const errorMsg = err.response?.data?.detail || t('Inscription échouée. Vérifiez vos informations.', 'Registration failed. Check your information.');
        setFieldErrors({ general: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) });
      }
    }
  };

  const activityTypes = [
    { value: 'seed_provider', label: t('Fournisseur', 'Supplier'), icon: Truck },
    { value: 'producer', label: t('Producteur', 'Producer'), icon: SproutIcon },
    { value: 'buyer', label: t('Acheteur', 'Buyer'), icon: ShoppingCart },
  ];

  return (
    <div ref={containerRef} className="min-h-screen w-full overflow-hidden relative flex items-center justify-center lg:justify-end">
      {/* Background Slideshow */}
      <BackgroundSlideshow 
        images={[
          '/images/backgrounds/back gount',
          '/images/backgrounds/pexels-szafran-34125512.jpg'
        ]}
        interval={5000}
        overlay={true}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 mx-4 max-w-sm border border-gray-200 shadow-2xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#3F441C] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('Bienvenue!', 'Welcome!')}</h2>
            <p className="text-gray-500 mb-4">{t('Votre compte a été créé avec succès', 'Your account was created successfully')}</p>
            <div className="flex items-center justify-center gap-2 text-[#3F441C]">
              <div className="w-2 h-2 bg-[#F5F5F0]0 rounded-full animate-pulse" />
              <span className="text-sm">{t('Redirection...', 'Redirecting...')}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-8 left-6 z-20">
        <BackButton to="/" />
      </div>

      {/* Register Card */}
      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-md mr-0 lg:mr-20 px-6 py-8 m-4 h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-[2rem] shadow-2xl p-6 sm:p-8 relative">
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[2rem]" />

          {/* Header with Logo */}
          <div className="relative z-10 flex flex-col items-center text-center mb-6">
            <motion.img
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              src="/new logo.png"
              alt="MBOA Market"
              className="h-16 sm:h-20 w-auto object-contain mb-4 drop-shadow-lg"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-md">{t('Inscription', 'Register')}</h1>
            <p className="text-white/90 text-sm font-medium">{t('Rejoignez MBOA Market', 'Join MBOA Market')}</p>
          </div>

          <div className="relative z-10">
            {/* Error Message */}
            {(error || fieldErrors.general) && (
              <div className="mb-4 p-3 bg-red-500/80 border border-red-500/50 rounded-xl text-sm text-white flex items-center justify-between shadow-sm backdrop-blur-sm">
                <span>{error || fieldErrors.general}</span>
                <button
                  onClick={() => setFieldErrors({})}
                  className="text-white hover:text-red-100 font-bold text-lg"
                >
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone */}
              <div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    placeholder={t('Téléphone (+237...)', 'Phone (+237...)')}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (fieldErrors.phone) {
                        const newErrors = {...fieldErrors};
                        delete newErrors.phone;
                        setFieldErrors(newErrors);
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/90 border ${
                      fieldErrors.phone ? 'border-red-500' : 'border-white/50'
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F5F5F0]0 focus:ring-2 focus:ring-[#F5F5F0]0/20 transition-all shadow-inner`}
                    required
                  />
                </div>
                {fieldErrors.phone && <p className="text-red-200 text-xs mt-1 ml-1 font-medium drop-shadow-md">{fieldErrors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    placeholder={t('Mot de passe (min 8 car.)', 'Password (min 8 char.)')}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (fieldErrors.password) {
                        const newErrors = {...fieldErrors};
                        delete newErrors.password;
                        setFieldErrors(newErrors);
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/90 border ${
                      fieldErrors.password ? 'border-red-500' : 'border-white/50'
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F5F5F0]0 focus:ring-2 focus:ring-[#F5F5F0]0/20 transition-all shadow-inner`}
                    required
                  />
                </div>
                {fieldErrors.password && <p className="text-red-200 text-xs mt-1 ml-1 font-medium drop-shadow-md">{fieldErrors.password}</p>}
              </div>

              {/* Display Name */}
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder={t('Nom complet', 'Full name')}
                    value={formData.profile.display_name}
                    onChange={(e) => {
                      setFormData({ ...formData, profile: { ...formData.profile, display_name: e.target.value } });
                      if (fieldErrors.display_name) {
                        const newErrors = {...fieldErrors};
                        delete newErrors.display_name;
                        setFieldErrors(newErrors);
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/90 border ${
                      fieldErrors.display_name ? 'border-red-500' : 'border-white/50'
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F5F5F0]0 focus:ring-2 focus:ring-[#F5F5F0]0/20 transition-all shadow-inner`}
                    required
                  />
                </div>
                {fieldErrors.display_name && <p className="text-red-200 text-xs mt-1 ml-1 font-medium drop-shadow-md">{fieldErrors.display_name}</p>}
              </div>

              {/* Domain Selection */}
              <div>
                <label className="block text-xs font-medium text-white/90 mb-2 drop-shadow-md">{t('Domaine', 'Domain')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profile: { ...formData.profile, domain: 'agriculture' } })}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 shadow-sm ${
                      formData.profile.domain === 'agriculture'
                        ? 'bg-gradient-to-br from-[#A0B96B] to-[#829952] text-white border-[#7A7D5C]'
                        : 'bg-white/50 text-gray-700 border-white/50 hover:bg-white/70'
                    }`}
                  >
                    <SproutIcon size={20} />
                    <span className="text-sm font-medium">{t('Agriculture', 'Agriculture')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profile: { ...formData.profile, domain: 'elevage' } })}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 shadow-sm ${
                      formData.profile.domain === 'elevage'
                        ? 'bg-gradient-to-br from-[#A0B96B] to-[#829952] text-white border-[#7A7D5C]'
                        : 'bg-white/50 text-gray-700 border-white/50 hover:bg-white/70'
                    }`}
                  >
                    <CowIcon size={20} />
                    <span className="text-sm font-medium">{t('Élevage', 'Livestock')}</span>
                  </button>
                </div>
              </div>

              {/* Activity Type */}
              <div>
                <label className="block text-xs font-medium text-white/90 mb-2 drop-shadow-md">{t("Type d'activité", 'Activity type')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {activityTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.profile.activity_type === type.value;
                    const isReactIcon = type.value === 'producer'; // Seul Producteur est React Icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, profile: { ...formData.profile, activity_type: type.value } })}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 shadow-sm ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#A0B96B] to-[#829952] text-white border-[#7A7D5C]'
                            : 'bg-white/50 text-gray-700 border-white/50 hover:bg-white/70'
                        }`}
                      >
                        {isReactIcon ? (
                          <Icon size={20} />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Region */}
              <div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder={t('Région', 'Region')}
                    value={formData.profile.region}
                    onChange={(e) => {
                      setFormData({ ...formData, profile: { ...formData.profile, region: e.target.value } });
                      if (fieldErrors.region) {
                        const newErrors = {...fieldErrors};
                        delete newErrors.region;
                        setFieldErrors(newErrors);
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/90 border ${
                      fieldErrors.region ? 'border-red-500' : 'border-white/50'
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F5F5F0]0 focus:ring-2 focus:ring-[#F5F5F0]0/20 transition-all shadow-inner`}
                    required
                  />
                </div>
                {fieldErrors.region && <p className="text-red-200 text-xs mt-1 ml-1 font-medium drop-shadow-md">{fieldErrors.region}</p>}
              </div>

              {/* Locality */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder={t('Localité (optionnel)', 'Locality (optional)')}
                  value={formData.profile.locality}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, locality: e.target.value } })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/90 border border-white/50 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#F5F5F0]0 focus:ring-2 focus:ring-[#F5F5F0]0/20 transition-all shadow-inner"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all bg-[#3F441C] hover:bg-[#353916] shadow-[#F5F5F0]0/30"
              >
                {loading ? t('Inscription...', 'Signing up...') : t("S'inscrire", 'Sign Up')}
              </motion.button>
            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-white/90 mt-5 font-medium drop-shadow-md">
              {t('Déjà inscrit?', 'Already registered?')}
              <Link to="/login" className="text-white font-bold hover:text-[#D9DAC8] transition-colors underline decoration-2 decoration-[#7A7D5C] underline-offset-4 ml-1">
                {t('Se connecter', 'Log in')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
