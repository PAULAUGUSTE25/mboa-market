import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, TrendingDown, Minus, MapPin, Users, Package, ShieldCheck, X, ArrowRight, Lock } from 'lucide-react';

// ── Vidéo de fond ────────────────────────────────────────
const VIDEO_SRC = 'https://res.cloudinary.com/dvfmmovlw/video/upload/video_background_pw0i8m.mp4';

// ── Palette MBOA ──────────────────────────────────────────
const OLIVE = '#3F441C';
const OLIVE_DARK = '#353916';
const OLIVE_LIGHT = '#F5F5F0';
const OLIVE_MID = '#EEEEE5';
const OLIVE_BORDER = '#D9DAC8';

// ── Prix du marché en direct ───────────────────────────────
const TICKER = [
  { name: 'Cacao (Centre)', unit: 'kg', price: 2800, trend: 'up' },
  { name: 'Café Arabica (Ouest)', unit: 'kg', price: 3500, trend: 'up' },
  { name: 'Café Robusta (Sud-Ouest)', unit: 'kg', price: 2500, trend: 'stable' },
  { name: 'Maïs (Adamaoua)', unit: 'kg', price: 300, trend: 'stable' },
  { name: 'Manioc (Littoral)', unit: 'kg', price: 200, trend: 'down' },
  { name: 'Poulet de chair (Yaoundé)', unit: 'tête', price: 3500, trend: 'up' },
  { name: 'Œufs (Douala)', unit: 'plateau 30', price: 2800, trend: 'stable' },
  { name: 'Plantain (Sud)', unit: 'régime', price: 2000, trend: 'up' },
  { name: 'Tomate (Nord)', unit: 'kg', price: 500, trend: 'down' },
  { name: 'Macabo (Ouest)', unit: 'kg', price: 450, trend: 'stable' },
  { name: 'Porc vif (Centre)', unit: 'kg', price: 2200, trend: 'up' },
  { name: 'Chèvre (Adamaoua)', unit: 'tête', price: 50000, trend: 'up' },
  { name: 'Igname de Batibo', unit: 'kg', price: 500, trend: 'stable' },
  { name: 'Cotton SODECOTON', unit: 'kg', price: 350, trend: 'stable' },
  { name: 'Thé Ndawara (Nord-Ouest)', unit: 'kg', price: 2000, trend: 'up' },
  { name: 'Haricot (Extrême-Nord)', unit: 'kg', price: 900, trend: 'up' },
  { name: 'Oignon (Maroua)', unit: 'kg', price: 500, trend: 'stable' },
  { name: 'Riz local IRAD', unit: 'kg', price: 700, trend: 'up' },
  { name: 'Bœuf vif (Ngaoundéré)', unit: 'kg', price: 1800, trend: 'up' },
  { name: 'Tilapia (Bénué)', unit: 'kg', price: 3000, trend: 'stable' },
];

// ── Annonces de démonstration publiques ───────────────────
const PREVIEW = [
  { id: 1, emoji: '🌱', title: 'Cacao premier choix', seller: 'Etoga René', region: 'Centre', price: 5000, unit: 'kg', qty: 750, img: '/images/agriculture/cacao_de_mr_etoga_750kg_dispo.jpg', domain: 'agriculture' },
  { id: 2, emoji: '🐓', title: 'Poulets de chair 35j', seller: 'Ferme Ndéfo', region: 'Ouest', price: 3500, unit: 'unité', qty: 200, img: '/images/livestock/poulet_de_chaire_35_jour.jpg', domain: 'elevage' },
  { id: 3, emoji: '🌽', title: 'Maïs jaune de qualité', seller: 'Coopérative Centre', region: 'Centre', price: 350, unit: 'kg', qty: 500, img: '/images/backgrounds/champs_de_maise.jpg', domain: 'agriculture' },
  { id: 4, emoji: '🥬', title: 'Macabo rouge', seller: 'Producteurs Ouest', region: 'Ouest', price: 450, unit: 'kg', qty: 300, img: '/images/agriculture/bonne_qualite_de_macabo.jpg', domain: 'agriculture' },
  { id: 5, emoji: '🐖', title: 'Porcs sélectionnés', seller: 'Élevage Mballa', region: 'Littoral', price: 2200, unit: 'kg', qty: 6, img: '/images/livestock/porc_female_sans_graisse.jpg', domain: 'elevage' },
  { id: 6, emoji: '🍅', title: 'Tomates fraîches du jour', seller: 'Jardins Bamenda', region: 'Nord-Ouest', price: 600, unit: 'kg', qty: 200, img: '/images/agriculture/tomate_de_haute_qualite.jpg', domain: 'agriculture' },
  { id: 7, emoji: '🐄', title: 'Bœufs de trait', seller: 'Ranch Adamaoua', region: 'Adamaoua', price: 350000, unit: 'tête', qty: 3, img: '/images/livestock/chevre_de_louest.jpg', domain: 'elevage' },
  { id: 8, emoji: '🍌', title: 'Plantains mûrs', seller: 'Plantation Sud', region: 'Sud', price: 1200, unit: 'régime', qty: 80, img: '/images/agriculture/plantain_mur.jpg', domain: 'agriculture' },
  { id: 9, emoji: '🌿', title: 'Manioc frais récolté', seller: 'Ferme Littoral', region: 'Littoral', price: 200, unit: 'kg', qty: 1000, img: '/images/agriculture/bonmanioc.jpg', domain: 'agriculture' },
];

// ── Stats ──────────────────────────────────────────────────
const STATS = [
  { icon: Users, fr: '5 000+ membres', en: '5,000+ members' },
  { icon: MapPin, fr: '10 régions couvertes', en: '10 regions covered' },
  { icon: Package, fr: '50+ produits', en: '50+ products' },
  { icon: ShieldCheck, fr: 'Vendeurs vérifiés', en: 'Verified sellers' },
];

export default function LandingPage() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const tickerRef = useRef<HTMLDivElement>(null);
  const [lockedListing, setLockedListing] = useState<typeof PREVIEW[0] | null>(null);

  // Animation ticker
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let pos = 0;
    const speed = 0.5;
    const tick = () => {
      pos -= speed;
      if (Math.abs(pos) >= el.scrollWidth / 2) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const TrendIcon = ({ trend }: { trend: string }) =>
    trend === 'up' ? <TrendingUp className="w-3 h-3 text-green-600" /> :
    trend === 'down' ? <TrendingDown className="w-3 h-3 text-red-500" /> :
    <Minus className="w-3 h-3 text-gray-400" />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: OLIVE_LIGHT }}>

      {/* ── HERO VIDÉO PLEIN ÉCRAN ────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Vidéo en boucle */}
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.6)' }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        {/* Gradient overlay pour lisibilité */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)' }} />

        {/* ── NAVBAR flottante ───────────────────────────── */}
        <nav className="relative z-10 px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/new logo.png" alt="MBOA" className="h-9 w-auto drop-shadow-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="font-black text-lg text-white drop-shadow hidden sm:block">MBOA Market</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              {t('Se connecter', 'Log in')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: OLIVE }}
            >
              {t("S'inscrire", 'Register')}
            </button>
          </div>
        </nav>

        {/* ── Contenu hero centré ────────────────────────── */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center pb-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(63,68,28,0.85)', color: 'white' }}>
              🇨🇲 {t('MBOA Market, le marketplace du Cameroun', "MBOA Market, Cameroon's marketplace")}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-5 text-white drop-shadow-xl">
              {t('Vendez & achetez', 'Sell & buy')}<br />
              <span style={{ color: '#C8D070' }}>{t('au vrai prix du marché', 'at the real market price')}</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              {t('Agriculteurs, éleveurs, acheteurs — connectez-vous directement. Plus d\'intermédiaires, plus de valeur pour vous.', 'Farmers, breeders, buyers — connect directly. No more middlemen, more value for you.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="px-7 py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-2xl"
                style={{ backgroundColor: OLIVE }}
              >
                {t('Rejoindre gratuitement', 'Join for free')} <ArrowRight className="w-5 h-5" />
              </motion.button>
              <button
                onClick={() => navigate('/login')}
                className="px-7 py-3.5 rounded-xl font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                {t('Déjà membre ? Se connecter', 'Already a member? Log in')}
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── Stats bar en bas du hero ───────────────────── */}
        <div className="relative z-10 backdrop-blur-md border-t border-white/10" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="max-w-4xl mx-auto px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-white/10">
            {STATS.map(({ icon: Icon, fr, en }) => (
              <div key={fr} className="flex items-center justify-center gap-2 px-4 py-1">
                <Icon className="w-4 h-4 flex-shrink-0 text-white/60" />
                <span className="text-xs font-semibold text-white/90">{lang === 'en' ? en : fr}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────── */}
      <div className="w-full overflow-hidden border-y py-2.5" style={{ backgroundColor: OLIVE, borderColor: OLIVE_DARK }}>
        <div ref={tickerRef} className="flex gap-8 whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...TICKER, ...TICKER].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-white text-xs font-semibold">
              <TrendIcon trend={item.trend} />
              <span className="opacity-80">{item.name}</span>
              <span className="font-black">{item.price.toLocaleString()} FCFA</span>
              <span className="opacity-50">/{item.unit}</span>
              <span className="opacity-30 ml-2">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── LISTINGS PREVIEW ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black" style={{ color: OLIVE_DARK }}>
              {t('Annonces en circulation', 'Active listings')}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('Cliquez sur une annonce pour voir les détails', 'Click a listing to see details')}
            </p>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse"
            style={{ backgroundColor: OLIVE_MID, color: OLIVE }}>
            🔴 {t('En direct', 'Live')}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PREVIEW.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              onClick={() => setLockedListing(item)}
              className="bg-white rounded-xl border overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
              style={{ borderColor: OLIVE_BORDER }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x200/${OLIVE.slice(1)}/FFFFFF?text=${encodeURIComponent(item.emoji)}`;
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: item.domain === 'elevage' ? '#F59E0B' : OLIVE }}>
                    {item.domain === 'elevage' ? t('Élevage', 'Livestock') : t('Agriculture', 'Agriculture')}
                  </span>
                </div>
                {/* Lock overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2">
                    <Lock className="w-5 h-5" style={{ color: OLIVE }} />
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <h3 className="font-bold text-sm text-gray-900 mb-1 truncate">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-black" style={{ color: OLIVE }}>
                      {item.price.toLocaleString()} FCFA
                    </span>
                    <span className="text-xs text-gray-400">/{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {item.region}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 truncate">
                  {item.qty} {item.unit} · {item.seller}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Voir plus — invité à s'inscrire */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm border-2 transition-colors"
            style={{ borderColor: OLIVE, color: OLIVE }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = OLIVE_MID; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          >
            {t('Voir toutes les annonces (inscription requise)', 'View all listings (registration required)')}
          </button>
        </div>
      </section>

      {/* ── RÉSEAU ─────────────────────────────────────────── */}
      <section className="py-10 border-t" style={{ borderColor: OLIVE_BORDER }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xl font-black mb-2" style={{ color: OLIVE_DARK }}>
            {t('Notre réseau de planteurs & éleveurs', 'Our network of farmers & breeders')}
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-lg mx-auto">
            {t('Des producteurs vérifiés dans les 10 régions du Cameroun. Achetez en direct, au juste prix.', 'Verified producers across all 10 regions of Cameroon. Buy directly, at the right price.')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
            {['Centre', 'Littoral', 'Ouest', 'Nord', 'Adamaoua', 'Est', 'Sud', 'Nord-Ouest', 'Sud-Ouest', 'Extrême-Nord'].map(r => (
              <div key={r} className="py-2 px-3 rounded-lg text-xs font-semibold bg-white border text-center" style={{ borderColor: OLIVE_BORDER, color: OLIVE_DARK }}>
                📍 {r}
              </div>
            ))}
          </div>

          {/* CTA final */}
          <div className="rounded-2xl p-8 text-white text-center" style={{ backgroundColor: OLIVE }}>
            <div className="text-3xl mb-3">🌾</div>
            <h3 className="text-xl font-black mb-2">
              {t('Faites partie du réseau', 'Join the network')}
            </h3>
            <p className="text-sm opacity-80 mb-5 max-w-sm mx-auto">
              {t('Inscription gratuite. Publiez vos annonces, consultez les prix, contactez directement acheteurs et vendeurs.', 'Free registration. Post listings, check prices, contact buyers and sellers directly.')}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 mx-auto"
              style={{ backgroundColor: 'white', color: OLIVE }}
            >
              {t("M'inscrire gratuitement", 'Register for free')} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t py-6 text-center text-xs text-gray-400" style={{ borderColor: OLIVE_BORDER }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/new logo.png" alt="MBOA" className="h-5 w-auto opacity-60" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ color: OLIVE }}>MBOA Market</span>
        </div>
        <p>© 2026 MBOA Market · {t('Tous droits réservés', 'All rights reserved')}</p>
      </footer>

      {/* ── MODALE LOCK ────────────────────────────────────── */}
      <AnimatePresence>
        {lockedListing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setLockedListing(null)} />
            <motion.div
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border"
              style={{ borderColor: OLIVE_BORDER }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="h-1 w-full" style={{ backgroundColor: OLIVE }} />
              <button onClick={() => setLockedListing(null)} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: OLIVE_MID }}>
                <X className="w-3.5 h-3.5" style={{ color: OLIVE }} />
              </button>
              <div className="p-6">
                {/* Aperçu listing */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: OLIVE_BORDER }}>
                  <img src={lockedListing.img} alt="" className="w-14 h-14 rounded-xl object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/56x56/${OLIVE.slice(1)}/FFFFFF?text=${encodeURIComponent(lockedListing.emoji)}`; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{lockedListing.title}</p>
                    <p className="text-base font-black mt-0.5" style={{ color: OLIVE }}>
                      {lockedListing.price.toLocaleString()} FCFA/{lockedListing.unit}
                    </p>
                    <p className="text-xs text-gray-400">{lockedListing.seller} · {lockedListing.region}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: OLIVE_MID }}>
                    <Lock className="w-4 h-4" style={{ color: OLIVE }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {t('Contenu réservé aux membres', 'Members-only content')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('Inscription gratuite · Accès immédiat', 'Free registration · Immediate access')}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl p-3 mb-4 text-xs space-y-1.5" style={{ backgroundColor: OLIVE_LIGHT }}>
                  {[
                    t('📞 Coordonnées complètes du vendeur', '📞 Full seller contact info'),
                    t('📦 Stock disponible en temps réel', '📦 Real-time stock availability'),
                    t('💬 Messagerie directe vendeur/acheteur', '💬 Direct buyer/seller messaging'),
                    t('📊 Historique des prix du marché', '📊 Market price history'),
                  ].map(b => <div key={b} className="flex items-center gap-2" style={{ color: OLIVE_DARK }}><span>{b}</span></div>)}
                </div>

                <motion.button
                  whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setLockedListing(null); navigate('/register'); }}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mb-2"
                  style={{ backgroundColor: OLIVE }}
                >
                  {t("M'inscrire gratuitement", 'Register for free')} <ArrowRight className="w-4 h-4" />
                </motion.button>
                <button
                  onClick={() => { setLockedListing(null); navigate('/login'); }}
                  className="w-full py-2 text-xs text-center font-semibold"
                  style={{ color: OLIVE }}
                >
                  {t('Déjà membre ? Se connecter →', 'Already a member? Log in →')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
