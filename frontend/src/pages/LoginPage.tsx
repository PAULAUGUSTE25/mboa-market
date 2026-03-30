import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Phone, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import gsap from 'gsap';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: {[key: string]: string} = {};
    
    if (!formData.phone.startsWith('+')) {
      errors.phone = 'Le numéro doit commencer par + (ex: +237...)';
    } else if (formData.phone.length < 10) {
      errors.phone = 'Le numéro de téléphone est trop court';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est obligatoire';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setFieldErrors({});
    
    try {
      await login(formData);
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/feed');
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Identifiants incorrects';
      setFieldErrors({ general: errorMsg });
      console.error('Login failed:', err);
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connexion Réussie!</h2>
            <p className="text-gray-500 mb-4">Bienvenue sur MBOA Market</p>
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

      {/* Login Card */}
      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-md mr-0 lg:mr-20 px-6 py-12 m-4"
      >
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-[2rem] shadow-2xl p-8 sm:p-10 overflow-hidden relative">
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

          {/* Header with Logo */}
          <div className="relative z-10 flex flex-col items-center text-center mb-8">
            <motion.img
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              src="/new logo.png"
              alt="MBOA Market"
              className="h-20 sm:h-24 w-auto object-contain mb-4 drop-shadow-lg"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-md">Connexion</h1>
            <p className="text-white/90 text-sm font-medium">Accédez à votre compte</p>
          </div>

          <div className="relative z-10">
            {/* Error Message */}
            {(error || fieldErrors.general) && (
              <div className="mb-6 p-4 bg-red-500/80 border border-red-500/50 rounded-xl text-sm text-white flex items-center justify-between shadow-sm backdrop-blur-sm">
                <span>{error || fieldErrors.general}</span>
                <button
                  onClick={() => {
                    setFieldErrors({});
                    clearError();
                  }}
                  className="text-white hover:text-red-100 font-bold text-lg"
                >
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Input */}
              <div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    placeholder="Numéro de téléphone (+237...)"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (fieldErrors.phone) {
                        const newErrors = {...fieldErrors};
                        delete newErrors.phone;
                        setFieldErrors(newErrors);
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-4 bg-white/90 border ${
                      fieldErrors.phone ? 'border-red-500' : 'border-white/50'
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-inner`}
                    required
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-red-200 text-xs mt-2 ml-1 font-medium drop-shadow-md">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
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
                    className={`w-full pl-12 pr-4 py-4 bg-white/90 border ${
                      fieldErrors.password ? 'border-red-500' : 'border-white/50'
                    } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-inner`}
                    required
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-red-200 text-xs mt-2 ml-1 font-medium drop-shadow-md">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-600 via-green-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 disabled:opacity-50 transition-all"
              >
                {loading ? 'Connexion...' : 'Se Connecter'}
              </motion.button>
            </form>

            {/* Register Link */}
            <p className="text-center text-sm text-white/90 mt-6 font-medium drop-shadow-md">
              Pas de compte?{' '}
              <Link to="/register" className="text-white font-bold hover:text-green-200 transition-colors underline decoration-2 decoration-green-400 underline-offset-4">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
