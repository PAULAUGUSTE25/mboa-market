import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Phone, Lock, User, MapPin, PackageSearch, ShoppingCart, Sprout, Beef, ArrowLeft, CheckCircle } from 'lucide-react';
import gsap from 'gsap';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, loading, error } = useAuthStore();
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
      const errorMsg = err.response?.data?.detail || 'Inscription échouée. Vérifiez vos informations.';
      setFieldErrors({ general: errorMsg });
      console.error('Registration failed:', err);
    }
  };

  const activityTypes = [
    { value: 'seed_provider', label: 'Fournisseur', icon: PackageSearch },
    { value: 'producer', label: 'Producteur', icon: Sprout },
    { value: 'buyer', label: 'Acheteur', icon: ShoppingCart },
  ];

  return (
    <div ref={containerRef} className="min-h-screen w-full overflow-hidden relative flex items-center justify-center lg:justify-end">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/background pic.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 mx-4 max-w-sm border border-gray-200 shadow-2xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue!</h2>
            <p className="text-gray-500 mb-4">Votre compte a été créé avec succès</p>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Redirection...</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-8 left-6 z-20">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-white/80 transition-colors drop-shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Retour</span>
        </motion.button>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-md">Inscription</h1>
            <p className="text-white/90 text-sm font-medium">Rejoignez MBOA Market</p>
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
                    placeholder="Téléphone (+237...)"
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
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-inner`}
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
                    placeholder="Mot de passe (min 6 car.)"
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
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-inner`}
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
                    placeholder="Nom complet"
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
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-inner`}
                    required
                  />
                </div>
                {fieldErrors.display_name && <p className="text-red-200 text-xs mt-1 ml-1 font-medium drop-shadow-md">{fieldErrors.display_name}</p>}
              </div>

              {/* Domain Selection */}
              <div>
                <label className="block text-xs font-medium text-white/90 mb-2 drop-shadow-md">Domaine</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profile: { ...formData.profile, domain: 'agriculture' } })}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 shadow-sm ${
                      formData.profile.domain === 'agriculture'
                        ? 'bg-green-500 text-white border-green-400'
                        : 'bg-white/50 text-gray-700 border-white/50 hover:bg-white/70'
                    }`}
                  >
                    <Sprout className="w-5 h-5" />
                    <span className="text-sm font-medium">Agriculture</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profile: { ...formData.profile, domain: 'elevage' } })}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 shadow-sm ${
                      formData.profile.domain === 'elevage'
                        ? 'bg-amber-500 text-white border-amber-400'
                        : 'bg-white/50 text-gray-700 border-white/50 hover:bg-white/70'
                    }`}
                  >
                    <Beef className="w-5 h-5" />
                    <span className="text-sm font-medium">Élevage</span>
                  </button>
                </div>
              </div>

              {/* Activity Type */}
              <div>
                <label className="block text-xs font-medium text-white/90 mb-2 drop-shadow-md">Type d'activité</label>
                <div className="grid grid-cols-3 gap-2">
                  {activityTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.profile.activity_type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, profile: { ...formData.profile, activity_type: type.value } })}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 shadow-sm ${
                          isSelected
                            ? isElevage 
                              ? 'bg-amber-500 text-white border-amber-400'
                              : 'bg-green-500 text-white border-green-400'
                            : 'bg-white/50 text-gray-700 border-white/50 hover:bg-white/70'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
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
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/90 border ${
                      fieldErrors.region ? 'border-red-500' : 'border-white/50'
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-inner`}
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
                  placeholder="Localité (optionnel)"
                  value={formData.profile.locality}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, locality: e.target.value } })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/90 border border-white/50 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-inner"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all bg-gradient-to-r from-green-600 via-green-500 to-amber-500 shadow-green-500/30"
              >
                {loading ? 'Inscription...' : "S'inscrire"}
              </motion.button>
            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-white/90 mt-5 font-medium drop-shadow-md">
              Déjà inscrit?{' '}
              <Link to="/login" className="text-white font-bold hover:text-green-200 transition-colors underline decoration-2 decoration-green-400 underline-offset-4">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
