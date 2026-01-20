import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { getCardStyles, getTextStyles, getInputStyles, getButtonStyles } from '@/utils/cardStyles';
import Logo from '@/components/Logo';
import { Phone, Lock, Wheat, Beef, Sprout } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { login, loading, error, clearError } = useAuthStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

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
    <>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div 
            className="backdrop-blur-md rounded-3xl shadow-2xl p-8 mx-4 max-w-md border-2"
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.4)'
            }}
          >
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full">
                <span className="text-3xl text-white">✓</span>
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: getTextStyles(theme).title }}>Connexion Réussie!</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p style={{ color: getTextStyles(theme).body }}>Bienvenue sur MBOA Market</p>
                <Wheat className="h-5 w-5 text-green-600" strokeWidth={2} />
                <Beef className="h-5 w-5 text-amber-600" strokeWidth={2} />
              </div>
              <div className="flex items-center justify-center space-x-2 text-teal-600 mt-4">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Redirection...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-4 sm:py-8 font-['Inter','Plus_Jakarta_Sans',sans-serif]">
      {/* Background Image avec Overlay - Dark Mode uniquement */}
      {theme === 'dark' && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-950/85 via-teal-950/80 to-amber-950/85"></div>
          </div>

          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-40 h-40 bg-amber-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-teal-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-40 right-1/3 w-44 h-44 bg-green-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </>
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
        <div className="text-teal-500/[0.12]">
          <Lock 
            className="w-[600px] h-[600px]"
            strokeWidth={0.6}
          />
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] bg-teal-500/[0.06]"
        />
      </motion.div>

      {/* Login Card - Glassmorphism Premium Responsive */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4 sm:mx-6 lg:mx-auto"
      >
        <div 
          className="backdrop-blur-[25px] rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 sm:p-8 border relative overflow-hidden"
          style={getCardStyles(theme, 'emerald')}
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
            className="absolute -inset-[2px] rounded-[24px] sm:rounded-[32px] blur-2xl -z-10 bg-gradient-to-r from-teal-500/20 to-green-600/20"
          />
          
          {/* Bouton Retour */}
          <button
            onClick={() => navigate('/')}
            className="mb-4 sm:mb-6 transition-all transform hover:scale-110 text-2xl font-bold"
            style={{ color: theme === 'light' ? '#374151' : '#9CA3AF' }}
          >
            ←
          </button>

          {/* Logo Responsive */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 sm:mb-8"
          >
            <Logo size="md" className="mb-4 sm:mb-6" />
            {/* Icônes SVG Responsive */}
            <div className="flex justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Sprout className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400" strokeWidth={1.5} />
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Beef className="h-6 w-6 sm:h-7 sm:w-7 text-amber-400" strokeWidth={1.5} />
              </motion.div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2" style={{ color: getTextStyles(theme).title }}>CONNEXION</h2>
            <p className="text-sm sm:text-base" style={{ color: getTextStyles(theme).subtitle }}>Accédez à votre compte MBOA Market</p>
          </motion.div>

          {(error || fieldErrors.general) && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-400/50 text-white rounded-xl text-sm flex items-center justify-between">
              <span>{error || fieldErrors.general}</span>
              <button
                onClick={() => {
                  setFieldErrors({});
                  clearError();
                }}
                className="text-white hover:text-red-200 font-bold ml-2 text-xl"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Glass avec Icône SVG */}
            <div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ opacity: 0.5 }}>
                  <Phone className="h-5 w-5" strokeWidth={1.5} style={{ color: getInputStyles(theme).color }} />
                </div>
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
                  className="w-full pl-12 pr-4 py-4 backdrop-blur-md border-2 rounded-xl focus:outline-none transition-all duration-300 focus:ring-2"
                  style={{
                    ...getInputStyles(theme, !!fieldErrors.phone),
                    borderRadius: '12px'
                  }}
                  required
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-red-300 text-xs mt-2 ml-1">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Input Mot de Passe Glass */}
            <div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ opacity: 0.5 }}>
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
                  className="w-full pl-12 pr-4 py-4 backdrop-blur-md border-2 rounded-xl focus:outline-none transition-all duration-300 focus:ring-2"
                  style={{
                    ...getInputStyles(theme, !!fieldErrors.password),
                    borderRadius: '12px'
                  }}
                  required
                />
              </div>
              {fieldErrors.password && (
                <p className="text-red-300 text-xs mt-2 ml-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Bouton Dégradé Teal vers Green */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full font-bold text-lg uppercase tracking-wide transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-8 border-2"
              style={getButtonStyles(theme, 'primary', 'emerald')}
            >
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>

          {/* Lien Inscription */}
          <p className="text-center text-sm mt-6" style={{ color: getTextStyles(theme).body }}>
            Pas de compte?{' '}
            <Link to="/register" className="font-bold transition-colors underline" style={{ color: theme === 'light' ? '#10B981' : '#5EEAD4' }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
    </>
  );
}
