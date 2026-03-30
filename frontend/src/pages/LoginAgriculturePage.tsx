import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { getCardStyles, getTextStyles, getInputStyles, getButtonStyles } from '@/utils/cardStyles';
import Logo from '@/components/Logo';
import { Sprout, Phone, Lock, Wheat, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginAgriculturePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { login, loading, error, setUser } = useAuthStore();
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
      
      // Update user profile with agriculture domain
      try {
        await api.updateProfile({ domain: 'agriculture' });
        // Refresh user data with updated profile
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (profileErr) {
        console.error('Failed to update domain:', profileErr);
      }
      
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div 
            className="backdrop-blur-md rounded-3xl shadow-2xl p-8 mx-4 max-w-md border-2"
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#2E7D32' : 'rgba(16, 185, 129, 0.4)'
            }}
          >
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg">
                <span className="text-3xl text-white">✓</span>
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: getTextStyles(theme).title }}>Connexion Réussie!</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p style={{ color: getTextStyles(theme).body }}>Bienvenue dans le secteur Agriculture</p>
                <Wheat className="h-5 w-5 text-emerald-400" strokeWidth={2} />
              </div>
              <div className="flex items-center justify-center space-x-2 text-emerald-400 mt-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Redirection...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-4 sm:py-8 font-['Inter','Plus_Jakarta_Sans',sans-serif]">
      {/* Background Image avec Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=2000')`,
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
          <div className="absolute bottom-40 right-1/3 w-44 h-44 bg-green-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
      )}

      {/* Login Card - Glassmorphism Premium Responsive */}
      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-6 lg:mx-auto">
        <div 
          className="backdrop-blur-[25px] rounded-[24px] sm:rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 sm:p-8 border relative overflow-hidden"
          style={{
            ...getCardStyles(theme, 'emerald'),
            borderColor: theme === 'light' ? '#2E7D32' : 'rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Bordure Lumineuse */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          
          {/* Bouton Retour */}
          <button
            onClick={() => navigate('/select-sector')}
            className="mb-6 transition-all transform hover:scale-110 w-10 h-10 rounded-full flex items-center justify-center"
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

          {/* Logo Responsive */}
          <div className="text-center mb-4 sm:mb-6">
            <Logo size="lg" className="mb-3 sm:mb-4" />
            {/* Icône SVG Agriculture Responsive */}
            <div className="flex justify-center mb-2 sm:mb-3">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                style={{
                  background: theme === 'light' ? '#2E7D32' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: theme === 'light' ? '0 4px 16px rgba(0, 0, 0, 0.2)' : 'none'
                }}
              >
                <Sprout className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={theme === 'light' ? 3 : 1.5} style={{ color: theme === 'light' ? '#FFFFFF' : '#86EFAC' }} />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-1 text-left pl-2" style={{ letterSpacing: '0.05em', color: getTextStyles(theme).title }}>AGRICULTURE</h2>
            <p className="text-sm sm:text-base text-left pl-2" style={{ color: getTextStyles(theme).subtitle }}>Cultures et Produits Agricoles</p>
          </div>

          {(error || fieldErrors.general) && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-400/50 text-white rounded-xl text-sm flex items-center justify-between">
              <span>{error || fieldErrors.general}</span>
              <button
                onClick={() => setFieldErrors({})}
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
                <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ opacity: 0.6 }}>
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
                  style={getInputStyles(theme, !!fieldErrors.phone)}
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
                  className="w-full pl-12 pr-4 py-4 backdrop-blur-md border-2 rounded-xl focus:outline-none transition-all duration-300 focus:ring-2"
                  style={getInputStyles(theme, !!fieldErrors.password)}
                  required
                />
              </div>
              {fieldErrors.password && (
                <p className="text-red-300 text-xs mt-2 ml-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Bouton avec style adaptatif */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full font-bold text-lg uppercase tracking-wide transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-8"
              style={getButtonStyles(theme, 'primary', 'emerald')}
            >
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>

          {/* Lien Inscription */}
          <p className="text-center text-sm mt-6" style={{ color: getTextStyles(theme).body }}>
            Pas de compte?{' '}
            <Link to="/register" className="font-bold transition-colors underline" style={{ color: theme === 'light' ? '#2E7D32' : '#6EE7B7' }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
