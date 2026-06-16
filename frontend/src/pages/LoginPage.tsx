import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/contexts/LanguageContext';
import TrustPopup from '@/components/TrustPopup';
import {
  Phone, Lock, CheckCircle, TrendingUp, Users, ShoppingBag,
  MapPin, ArrowRight, Star, BarChart3, Leaf, Beef
} from 'lucide-react';
import gsap from 'gsap';

// ─── Animated counter util ───
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el || started.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          setCount(Math.floor(p * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
}

// ─── Price ticker data (FCFA / Cameroun 2025) ───
const TICKER_DATA = [
  { product_fr: 'Maïs (Adamaoua)', product_en: 'Corn (Adamaoua)', price: 300, unit: 'kg', trend: '+2.3%', up: true },
  { product_fr: 'Cacao (Centre)', product_en: 'Cocoa (Centre)', price: 2800, unit: 'kg', trend: '+5.1%', up: true },
  { product_fr: 'Café Arabica (Ouest)', product_en: 'Arabica Coffee (West)', price: 3500, unit: 'kg', trend: '+3.5%', up: true },
  { product_fr: 'Café Robusta (Sud-Ouest)', product_en: 'Robusta Coffee (SW)', price: 2500, unit: 'kg', trend: '-1.2%', up: false },
  { product_fr: 'Plantain (Sud)', product_en: 'Plantain (South)', price: 2000, unit: 'régime', trend: '+3.5%', up: true },
  { product_fr: 'Manioc (Littoral)', product_en: 'Cassava (Littoral)', price: 200, unit: 'kg', trend: '+0.8%', up: true },
  { product_fr: 'Tomate (Nord)', product_en: 'Tomato (North)', price: 500, unit: 'kg', trend: '-4.1%', up: false },
  { product_fr: 'Poulet de chair (Yaoundé)', product_en: 'Broiler Chicken (Yaounde)', price: 3500, unit: 'tête', trend: '+6.2%', up: true },
  { product_fr: 'Œufs (Douala)', product_en: 'Eggs (Douala)', price: 2800, unit: 'plateau 30', trend: '+1.5%', up: true },
  { product_fr: 'Oignon (Maroua)', product_en: 'Onion (Maroua)', price: 500, unit: 'kg', trend: '+1.9%', up: true },
  { product_fr: 'Haricot (Extrême-Nord)', product_en: 'Beans (Far North)', price: 900, unit: 'kg', trend: '+2.7%', up: true },
  { product_fr: 'Macabo (Ouest)', product_en: 'Macabo (West)', price: 450, unit: 'kg', trend: '+0.5%', up: true },
  { product_fr: 'Igname de Batibo', product_en: 'Yam (Batibo)', price: 500, unit: 'kg', trend: 'stable', up: true },
  { product_fr: 'Porc vif (Centre)', product_en: 'Live Pig (Centre)', price: 2200, unit: 'kg', trend: '+2.1%', up: true },
  { product_fr: 'Chèvre (Adamaoua)', product_en: 'Goat (Adamaoua)', price: 50000, unit: 'tête', trend: '+4.0%', up: true },
  { product_fr: 'Bœuf vif (Ngaoundéré)', product_en: 'Live Cattle (Ngaoundere)', price: 1800, unit: 'kg', trend: '+3.2%', up: true },
  { product_fr: 'Cotton SODECOTON', product_en: 'SODECOTON Cotton', price: 350, unit: 'kg', trend: 'stable', up: true },
  { product_fr: 'Thé Ndawara (Nord-Ouest)', product_en: 'Ndawara Tea (NW)', price: 2000, unit: 'kg', trend: '+2.5%', up: true },
  { product_fr: 'Riz local IRAD', product_en: 'Local Rice (IRAD)', price: 700, unit: 'kg', trend: '+1.1%', up: true },
  { product_fr: 'Tilapia (Bénué)', product_en: 'Tilapia (Benoue)', price: 3000, unit: 'kg', trend: 'stable', up: true },
];

// ─── Testimonials ───
const TESTIMONIALS = [
  {
    name_fr: 'Jean Mbarga', name_en: 'Jean Mbarga',
    role_fr: 'Producteur - Centre', role_en: 'Producer - Centre',
    text_fr: 'MBOA Market m\'a permis de vendre mon maïs 30% plus cher qu\'au marché local.',
    text_en: 'MBOA Market helped me sell my corn 30% higher than the local market.',
    rating: 5,
  },
  {
    name_fr: 'Aminatou N.', name_en: 'Aminatou N.',
    role_fr: 'Fournisseur de semences', role_en: 'Seed Supplier',
    text_fr: 'J\'ai trouvé des acheteurs fiables pour mes semences certifiées en 48h.',
    text_en: 'I found reliable buyers for my certified seeds in just 48 hours.',
    rating: 5,
  },
  {
    name_fr: 'Paul Fouda', name_en: 'Paul Fouda',
    role_fr: 'Éleveur - Ouest', role_en: 'Livestock Farmer - West',
    text_fr: 'Grâce aux prévisions de prix, j\'ai vendu mes poulets au meilleur moment.',
    text_en: 'Thanks to price forecasts, I sold my chickens at the best time.',
    rating: 4,
  },
  {
    name_fr: 'Marie-Claire Etamé', name_en: 'Marie-Claire Etamé',
    role_fr: 'Agricultrice - Littoral', role_en: 'Farmer - Littoral',
    text_fr: 'La communauté MBOA m\'a appris de nouvelles techniques de culture.',
    text_en: 'The MBOA community taught me new farming techniques.',
    rating: 5,
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const { t, lang } = useLanguage();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const alreadySeen = !!sessionStorage.getItem('trust_popup_seen');
  const [showTrustPopup, setShowTrustPopup] = useState(!alreadySeen);
  const [formVisible, setFormVisible] = useState(alreadySeen);

  const handleCloseTrustPopup = () => {
    setShowTrustPopup(false);
    sessionStorage.setItem('trust_popup_seen', '1');
    setFormVisible(true);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

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

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Ticker scroll animation
  useEffect(() => {
    if (!tickerRef.current) return;
    const ticker = tickerRef.current;
    let animationId: number;
    let offset = 0;
    const speed = 0.5;
    const animate = () => {
      offset += speed;
      if (offset >= ticker.scrollWidth / 2) offset = 0;
      ticker.scrollLeft = offset;
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {[key: string]: string} = {};

    if (!formData.phone.startsWith('+')) {
      errors.phone = t('Le numéro doit commencer par + (ex: +237...)', 'Number must start with + (e.g. +237...)');
    } else if (formData.phone.length < 10) {
      errors.phone = t('Le numéro de téléphone est trop court', 'Phone number is too short');
    }

    if (!formData.password) {
      errors.password = t('Le mot de passe est obligatoire', 'Password is required');
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
      const errorMsg = err.response?.data?.detail || t('Identifiants incorrects', 'Invalid credentials');
      setFieldErrors({ general: errorMsg });
    }
  };

  // Animated counters
  const usersCount = useCountUp(2847, 2000);
  const listingsCount = useCountUp(15630, 2500);
  const regionsCount = useCountUp(10, 1500);

  return (
    <>
    <div ref={containerRef} className="min-h-screen w-full overflow-hidden relative flex">
      {/* ─── VIDEO BACKGROUND ─── Updated for Frankfurt backend */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.75)' }}
        >
          <source src="https://res.cloudinary.com/dvfmmovlw/video/upload/video_background_pw0i8m.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
      </div>

      {/* ─── SUCCESS MODAL ─── */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 mx-4 max-w-sm border border-gray-200 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3F441C] to-[#5A6129] flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t('Connexion Réussie!', 'Login Successful!')}
              </h2>
              <p className="text-gray-500 mb-4">
                {t('Bienvenue sur MBOA Market', 'Welcome to MBOA Market')}
              </p>
              <div className="flex items-center justify-center gap-2 text-[#3F441C]">
                <div className="w-2 h-2 bg-[#3F441C] rounded-full animate-pulse" />
                <span className="text-sm">{t('Redirection...', 'Redirecting...')}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LEFT PANEL : MARKETING ZONE ─── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between relative z-10 p-8 xl:p-12">
        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3"
        >
          <img src="/new logo.png" alt="MBOA Market" className="h-14 w-auto drop-shadow-lg" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">MBOA Market</h1>
            <p className="text-xs text-white/60 tracking-wider uppercase">{t('Plateforme Agricole du Cameroun', 'Cameroon Agricultural Platform')}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Users className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white" ref={usersCount.ref}>
                {usersCount.count.toLocaleString()}+
              </div>
              <p className="text-sm text-white/60">{t('Agriculteurs Connectés', 'Connected Farmers')}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white" ref={listingsCount.ref}>
                {listingsCount.count.toLocaleString()}+
              </div>
              <p className="text-sm text-white/60">{t('Annonces Actives', 'Active Listings')}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white" ref={regionsCount.ref}>
                {regionsCount.count}+
              </div>
              <p className="text-sm text-white/60">{t('Régions Couvertes', 'Regions Covered')}</p>
            </div>
          </motion.div>
        </div>

        {/* Testimonial */}
        <div className="max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5"
            >
              <p className="text-white/90 text-sm mb-3 italic">
                "{lang === 'en' ? TESTIMONIALS[activeTestimonial].text_en : TESTIMONIALS[activeTestimonial].text_fr}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white font-bold text-xs">
                  {TESTIMONIALS[activeTestimonial].name_fr[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {lang === 'en' ? TESTIMONIALS[activeTestimonial].name_en : TESTIMONIALS[activeTestimonial].name_fr}
                  </p>
                  <p className="text-white/50 text-xs">
                    {lang === 'en' ? TESTIMONIALS[activeTestimonial].role_en : TESTIMONIALS[activeTestimonial].role_fr}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── RIGHT PANEL : LOGIN FORM ─── */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-4 sm:p-8">
        <div className="w-full max-w-md relative">
          <AnimatePresence>
          {!formVisible && (
            <motion.div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="backdrop-blur-2xl bg-black/40 border border-white/20 rounded-[2rem] p-10 flex flex-col items-center gap-3 text-center w-full"
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              >
                <span className="text-5xl">👋</span>
                <p className="text-white font-bold text-lg">{t('Bienvenue sur MBOA Market', 'Welcome to MBOA Market')}</p>
                <p className="text-white/60 text-sm">{t('Découvrez nos avantages avant de vous connecter', 'Discover our benefits before logging in')}</p>
                <div className="flex gap-1.5 mt-2">
                  {[0,1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/30" />)}
                </div>
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={formVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.97, pointerEvents: 'none' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ pointerEvents: formVisible ? 'auto' : 'none' }}
          >
            <div className="backdrop-blur-2xl bg-white/15 border border-white/25 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 sm:p-10 overflow-hidden relative">
              {/* Animated shine */}
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shine_3s_infinite] pointer-events-none" />

              {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-6">
              <img src="/new logo.png" alt="MBOA Market" className="h-16 w-auto mb-2" />
              <h2 className="text-xl font-bold text-white">MBOA Market</h2>
            </div>

            {/* Header */}
            <div className="relative z-10 text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {t('Connexion', 'Login')}
              </h1>
              <p className="text-white/80 text-sm">
                {t('Accédez à votre compte agricole', 'Access your agricultural account')}
              </p>
            </div>

            <div className="relative z-10">
              {/* Error */}
              {(error || fieldErrors.general) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3.5 bg-red-500/70 border border-red-400/50 rounded-xl text-sm text-white flex items-center justify-between backdrop-blur-sm"
                >
                  <span>{error || fieldErrors.general}</span>
                  <button
                    onClick={() => { setFieldErrors({}); clearError(); }}
                    className="text-white hover:text-red-100 font-bold text-lg ml-2"
                  >
                    ×
                  </button>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Phone */}
                <div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#3F441C] transition-colors" />
                    <input
                      type="tel"
                      placeholder={t('Numéro de téléphone (+237...)', 'Phone number (+237...)')}
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (fieldErrors.phone) {
                          const ne = { ...fieldErrors }; delete ne.phone; setFieldErrors(ne);
                        }
                      }}
                      className={`w-full pl-12 pr-4 py-4 bg-gray-900/70 border ${
                        fieldErrors.phone ? 'border-red-500' : 'border-white/20'
                      } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner backdrop-blur-sm`}
                      required
                    />
                  </div>
                  {fieldErrors.phone && (
                    <motion.p
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-300 text-xs mt-1.5 ml-1 font-medium"
                    >
                      {fieldErrors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#3F441C] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('Mot de passe', 'Password')}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (fieldErrors.password) {
                          const ne = { ...fieldErrors }; delete ne.password; setFieldErrors(ne);
                        }
                      }}
                      className={`w-full pl-12 pr-12 py-4 bg-gray-900/70 border ${
                        fieldErrors.password ? 'border-red-500' : 'border-white/20'
                      } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner backdrop-blur-sm`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
                    >
                      {showPassword ? t('Cacher', 'Hide') : t('Voir', 'Show')}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-300 text-xs mt-1.5 ml-1 font-medium"
                    >
                      {fieldErrors.password}
                    </motion.p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(63,68,28,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#3F441C] to-[#5A6129] text-white font-bold rounded-xl shadow-lg transition-all hover:from-[#4A4F23] hover:to-[#656D30] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('Connexion...', 'Logging in...')}
                    </>
                  ) : (
                    <>
                      {t('Se Connecter', 'Log In')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Register link */}
              <p className="text-center text-sm text-white/80 mt-6">
                {t('Pas de compte?', 'No account?')}{' '}
                <Link
                  to="/register"
                  className="text-emerald-300 font-bold hover:text-emerald-200 transition-colors underline decoration-2 underline-offset-4"
                >
                  {t("S'inscrire", 'Register')}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      </div>

      {/* ─── BOTTOM TICKER : LIVE PRICES ─── */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-black/60 backdrop-blur-lg border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider shrink-0">
                {t('Prix du Jour', 'Daily Prices')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <div
              ref={tickerRef}
              className="overflow-hidden whitespace-nowrap flex-1"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
            >
              <div className="inline-flex gap-6 animate-marquee">
                {[...TICKER_DATA, ...TICKER_DATA].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-white/90">{lang === 'en' ? item.product_en : item.product_fr}</span>
                    <span className="text-white/50 text-xs">{item.unit}</span>
                    <span className="font-bold text-white">{item.price.toLocaleString()} FCFA</span>
                    <span className={`text-xs font-bold ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.trend}
                    </span>
                    <TrendingUp className={`w-3.5 h-3.5 ${item.up ? 'text-emerald-400 rotate-0' : 'text-red-400 rotate-180'}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Trust / Survey popup */}
    <AnimatePresence>
      {showTrustPopup && <TrustPopup onClose={handleCloseTrustPopup} />}
    </AnimatePresence>
    </>
  );
}
