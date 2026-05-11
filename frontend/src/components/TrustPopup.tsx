import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, ArrowRight, ChevronRight } from 'lucide-react';

// Palette officielle MBOA Market
const OLIVE = '#3F441C';
const OLIVE_DARK = '#353916';
const OLIVE_LIGHT = '#F5F5F0';
const OLIVE_MID = '#EEEEE5';
const OLIVE_BORDER = '#D9DAC8';

type CardId = 0 | 1 | 2 | 3 | 4;

interface Card {
  emoji: string;
  tag_fr: string; tag_en: string;
  teaser_fr: string; teaser_en: string;
  reveal_fr: string; reveal_en: string;
  cta_label_fr: string; cta_label_en: string;
  next_teaser_fr?: string; next_teaser_en?: string;
}

const CARDS: Card[] = [
  {
    emoji: '💰',
    tag_fr: 'Astuce prix', tag_en: 'Price tip',
    teaser_fr: 'Comment certains vendeurs obtiennent toujours le cacao à 5 000 FCFA/kg ?',
    teaser_en: 'How do some sellers always get cocoa at 5,000 FCFA/kg?',
    reveal_fr: 'Ils consultent les prix en temps réel sur MBOA Market avant de négocier. En connaissant le vrai prix du marché, ils ne se font plus avoir par les intermédiaires.',
    reveal_en: 'They check real-time prices on MBOA Market before negotiating. By knowing the true market price, they are no longer fooled by middlemen.',
    cta_label_fr: 'En savoir plus', cta_label_en: 'Learn more',
    next_teaser_fr: 'Et si vous pouviez vendre votre maïs directement à Douala depuis chez vous ?',
    next_teaser_en: 'What if you could sell your corn directly in Douala from home?',
  },
  {
    emoji: '🌽',
    tag_fr: 'Vente directe', tag_en: 'Direct sale',
    teaser_fr: 'Vendre votre maïs à Douala sans quitter votre village — c\'est possible ?',
    teaser_en: 'Selling your corn in Douala without leaving your village — is it possible?',
    reveal_fr: 'Oui ! Sur MBOA Market, vous publiez votre annonce avec photos et prix. Des acheteurs des 10 régions vous contactent directement. Aucun déplacement nécessaire.',
    reveal_en: 'Yes! On MBOA Market, you post your listing with photos and price. Buyers from all 10 regions contact you directly. No travel required.',
    cta_label_fr: 'Découvrir comment', cta_label_en: 'Discover how',
    next_teaser_fr: 'Des éleveurs vendent tout leur stock de poulets en moins de 48h. Leur secret ?',
    next_teaser_en: 'Some breeders sell their entire chicken stock in under 48h. Their secret?',
  },
  {
    emoji: '🐓',
    tag_fr: 'Élevage', tag_en: 'Livestock',
    teaser_fr: 'Des éleveurs écoulent tout leur stock de poulets en moins de 48h. Comment ?',
    teaser_en: 'Some breeders sell their entire chicken stock in under 48h. How?',
    reveal_fr: 'Ils publient une annonce avec le nombre de têtes, le poids et le prix. Boucheries, hôtels et particuliers les contactent immédiatement. Pas d\'intermédiaire, marge maximale.',
    reveal_en: 'They post a listing with head count, weight and price. Butcheries, hotels and individuals contact them immediately. No middleman, maximum margin.',
    cta_label_fr: 'Voir comment', cta_label_en: 'See how',
    next_teaser_fr: 'Comment ne plus jamais payer vos produits agricoles plus cher que le prix réel ?',
    next_teaser_en: 'How to never overpay for agricultural products again?',
  },
  {
    emoji: '🛒',
    tag_fr: 'Achat malin', tag_en: 'Smart buying',
    teaser_fr: 'Comment ne plus jamais payer vos produits agricoles plus cher que le prix réel ?',
    teaser_en: 'How to never overpay for agricultural products again?',
    reveal_fr: 'MBOA Market affiche le prix du marché en temps réel pour 50+ produits. Comparez les offres de dizaines de vendeurs vérifiés avant d\'acheter.',
    reveal_en: 'MBOA Market shows real-time market prices for 50+ products. Compare offers from dozens of verified sellers before buying.',
    cta_label_fr: 'Je veux essayer', cta_label_en: 'I want to try',
    next_teaser_fr: 'Prêt(e) à rejoindre 5 000+ membres au Cameroun ?',
    next_teaser_en: 'Ready to join 5,000+ members in Cameroon?',
  },
  {
    emoji: '🇨🇲',
    tag_fr: 'Rejoignez-nous', tag_en: 'Join us',
    teaser_fr: '5 000+ membres font déjà confiance à MBOA Market. Pourquoi pas vous ?',
    teaser_en: '5,000+ members already trust MBOA Market. Why not you?',
    reveal_fr: 'Inscription gratuite. Aucun abonnement. Aucune commission cachée. Vendez ou achetez librement dans toutes les 10 régions du Cameroun.',
    reveal_en: 'Free registration. No subscription. No hidden fees. Buy or sell freely across all 10 regions of Cameroon.',
    cta_label_fr: 'M\'inscrire gratuitement', cta_label_en: 'Register for free',
  },
];

interface Props { onClose: () => void; }

export default function TrustPopup({ onClose }: Props) {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [cardIndex, setCardIndex] = useState<CardId>(0);
  const [revealed, setRevealed] = useState(false);

  const card = CARDS[cardIndex];
  const isLast = cardIndex === CARDS.length - 1;

  const handleReveal = () => setRevealed(true);

  const handleNext = () => {
    if (isLast) {
      onClose();
      navigate('/register');
    } else {
      setCardIndex((cardIndex + 1) as CardId);
      setRevealed(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border"
        style={{ borderColor: OLIVE_BORDER }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* Top bar couleur MBOA */}
        <div className="h-1 w-full" style={{ backgroundColor: OLIVE }} />

        {/* Header */}
        <div className="px-5 pt-4 pb-0 flex items-center justify-between">
          {/* Logo + nom */}
          <div className="flex items-center gap-2">
            <img src="/new logo.png" alt="MBOA" className="h-6 w-auto" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-xs font-bold tracking-wide" style={{ color: OLIVE }}>MBOA Market</span>
          </div>
          {/* Progression */}
          <div className="flex gap-1.5 items-center">
            {CARDS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === cardIndex ? '20px' : '8px',
                  height: '6px',
                  backgroundColor: i <= cardIndex ? OLIVE : OLIVE_BORDER,
                }}
              />
            ))}
          </div>
          {/* Fermer uniquement sur la dernière carte */}
          {isLast ? (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: OLIVE_MID }}
            >
              <X className="w-3.5 h-3.5" style={{ color: OLIVE_DARK }} />
            </button>
          ) : <div className="w-7" />}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${cardIndex}-${revealed}`}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="p-5"
          >
            {/* Tag */}
            <div
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold mb-3"
              style={{ backgroundColor: OLIVE_MID, color: OLIVE_DARK }}
            >
              {lang === 'en' ? card.tag_en : card.tag_fr}
            </div>

            {!revealed ? (
              /* ── TEASER ── */
              <>
                <div className="flex items-start gap-3 mb-5">
                  <span className="text-3xl flex-shrink-0">{card.emoji}</span>
                  <h2 className="text-base font-bold leading-snug text-gray-900">
                    {lang === 'en' ? card.teaser_en : card.teaser_fr}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}
                  onClick={handleReveal}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
                  style={{ backgroundColor: OLIVE }}
                >
                  {lang === 'en' ? card.cta_label_en : card.cta_label_fr}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </>
            ) : (
              /* ── RÉVÉLATION ── */
              <>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl flex-shrink-0">{card.emoji}</span>
                  <h2 className="text-sm font-bold text-gray-800 leading-snug">
                    {lang === 'en' ? card.teaser_en : card.teaser_fr}
                  </h2>
                </div>

                {/* Réponse */}
                <div
                  className="rounded-xl p-3.5 mb-3 text-sm leading-relaxed"
                  style={{ backgroundColor: OLIVE_LIGHT, color: OLIVE_DARK, borderLeft: `3px solid ${OLIVE}` }}
                >
                  {lang === 'en' ? card.reveal_en : card.reveal_fr}
                </div>

                {/* Prochain teaser */}
                {!isLast && card.next_teaser_fr && (
                  <div
                    className="rounded-lg px-3 py-2 mb-3 text-xs"
                    style={{ backgroundColor: OLIVE_MID, borderColor: OLIVE_BORDER, border: `1px solid ${OLIVE_BORDER}` }}
                  >
                    <span className="font-semibold" style={{ color: OLIVE }}>
                      {lang === 'en' ? 'Next: ' : 'Ensuite : '}
                    </span>
                    <span className="text-gray-600 italic">
                      {lang === 'en' ? card.next_teaser_en : card.next_teaser_fr}
                    </span>
                  </div>
                )}

                <motion.button
                  whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
                  style={{ backgroundColor: OLIVE }}
                >
                  {isLast
                    ? t("M'inscrire gratuitement", 'Register for free')
                    : t('Continuer', 'Continue')}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        {isLast && (
          <div className="px-5 pb-4 text-center">
            <button
              onClick={onClose}
              className="text-xs transition-colors"
              style={{ color: OLIVE_BORDER }}
              onMouseEnter={e => (e.currentTarget.style.color = OLIVE)}
              onMouseLeave={e => (e.currentTarget.style.color = OLIVE_BORDER)}
            >
              {t('Continuer sans inscription', 'Continue without registering')}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
