import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, ArrowRight, ChevronRight } from 'lucide-react';

type CardId = 0 | 1 | 2 | 3 | 4;

interface Card {
  emoji: string;
  tag_fr: string; tag_en: string;
  teaser_fr: string; teaser_en: string;
  reveal_fr: string; reveal_en: string;
  cta_label_fr: string; cta_label_en: string;
  gradient: string;
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
    cta_label_fr: 'En savoir plus →', cta_label_en: 'Learn more →',
    next_teaser_fr: 'Et si vous pouviez vendre votre maïs directement à un acheteur de Douala depuis chez vous ?',
    next_teaser_en: 'What if you could sell your corn directly to a buyer in Douala from home?',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    emoji: '🌽',
    tag_fr: 'Vente directe', tag_en: 'Direct sale',
    teaser_fr: 'Vendre votre maïs à Douala sans quitter votre village, c\'est possible ?',
    teaser_en: 'Selling your corn in Douala without leaving your village — is it possible?',
    reveal_fr: 'Oui ! Sur MBOA Market, vous publiez votre annonce avec photos et prix. Des acheteurs de toutes les 10 régions vous contactent directement. Aucun déplacement nécessaire.',
    reveal_en: 'Yes! On MBOA Market, you post your listing with photos and price. Buyers from all 10 regions contact you directly. No travel required.',
    cta_label_fr: 'Découvrir comment →', cta_label_en: 'Discover how →',
    next_teaser_fr: 'Saviez-vous que des éleveurs de poulets vendent leur stock en moins de 48h sur notre plateforme ?',
    next_teaser_en: 'Did you know that chicken farmers sell their stock in less than 48h on our platform?',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    emoji: '🐓',
    tag_fr: 'Élevage', tag_en: 'Livestock',
    teaser_fr: 'Des éleveurs écoulent tout leur stock de poulets en moins de 48h. Leur secret ?',
    teaser_en: 'Some breeders sell their entire chicken stock in under 48h. Their secret?',
    reveal_fr: 'Ils publient une annonce sur MBOA Market avec le nombre de têtes, le poids et le prix. Boucheries, hôtels et particuliers les contactent immédiatement. Pas d\'intermédiaire, marge maximale.',
    reveal_en: 'They post a listing on MBOA Market with the number of heads, weight and price. Butcheries, hotels and individuals contact them immediately. No middleman, maximum margin.',
    cta_label_fr: 'Voir comment ça marche →', cta_label_en: 'See how it works →',
    next_teaser_fr: 'Acheteurs : comparez 50+ vendeurs et évitez de payer trop cher. Comment ?',
    next_teaser_en: 'Buyers: compare 50+ sellers and avoid overpaying. How?',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    emoji: '🛒',
    tag_fr: 'Achat malin', tag_en: 'Smart buying',
    teaser_fr: 'Comment ne plus jamais payer vos produits agricoles plus cher que le prix réel ?',
    teaser_en: 'How to never overpay for agricultural products again?',
    reveal_fr: 'MBOA Market affiche le prix du marché en temps réel pour 50+ produits. Comparez les offres de dizaines de vendeurs vérifiés avant d\'acheter. Économisez jusqu\'à 30% sur vos achats.',
    reveal_en: 'MBOA Market shows real-time market prices for 50+ products. Compare offers from dozens of verified sellers before buying. Save up to 30% on your purchases.',
    cta_label_fr: 'Je veux essayer →', cta_label_en: 'I want to try →',
    next_teaser_fr: 'Prêt(e) à rejoindre 5 000+ agriculteurs, éleveurs et acheteurs du Cameroun ?',
    next_teaser_en: 'Ready to join 5,000+ farmers, breeders and buyers from Cameroon?',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    emoji: '🇨🇲',
    tag_fr: 'Rejoignez-nous', tag_en: 'Join us',
    teaser_fr: '5 000+ membres font déjà confiance à MBOA Market. Pourquoi pas vous ?',
    teaser_en: '5,000+ members already trust MBOA Market. Why not you?',
    reveal_fr: 'Inscription gratuite. Aucun abonnement. Aucune commission cachée. Vendez ou achetez librement dans toutes les 10 régions du Cameroun. Votre profil vérifié inspire confiance dès le premier jour.',
    reveal_en: 'Free registration. No subscription. No hidden fees. Buy or sell freely across all 10 regions of Cameroon. Your verified profile builds trust from day one.',
    cta_label_fr: 'M\'inscrire maintenant →', cta_label_en: 'Register now →',
    gradient: 'from-emerald-600 to-teal-600',
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
      {/* Backdrop — pas de onClick, le flow est obligatoire */}
      <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
        initial={{ y: 80, scale: 0.93, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 80, scale: 0.93, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        {/* Gradient top bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${card.gradient} transition-all duration-500`} />

        {/* Header */}
        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex gap-1.5 items-center">
            {CARDS.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i === cardIndex ? `w-5 h-2 bg-gradient-to-r ${card.gradient}` : i < cardIndex ? 'w-2 h-2 bg-gray-300' : 'w-2 h-2 bg-gray-200'}`} />
            ))}
          </div>
          {isLast ? (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${cardIndex}-${revealed}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28 }}
            className="p-5 pb-4"
          >
            {/* Tag */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${card.gradient} bg-opacity-10 mb-3`}
              style={{ background: 'rgba(16,185,129,0.08)' }}>
              <span className={`text-xs font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                {lang === 'en' ? card.tag_en : card.tag_fr}
              </span>
            </div>

            {!revealed ? (
              /* ── TEASER MODE ── */
              <>
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-4xl flex-shrink-0 mt-0.5">{card.emoji}</span>
                  <h2 className="text-lg font-black text-gray-900 leading-snug">
                    {lang === 'en' ? card.teaser_en : card.teaser_fr}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleReveal}
                  className={`w-full py-3 rounded-2xl bg-gradient-to-r ${card.gradient} text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg`}
                >
                  {lang === 'en' ? card.cta_label_en : card.cta_label_fr}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </>
            ) : (
              /* ── REVEAL MODE ── */
              <>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-4xl flex-shrink-0 mt-0.5">{card.emoji}</span>
                  <h2 className="text-base font-black text-gray-900 leading-snug">
                    {lang === 'en' ? card.teaser_en : card.teaser_fr}
                  </h2>
                </div>
                <div className={`rounded-2xl p-4 mb-4`} style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(5,150,105,0.04))' }}>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {lang === 'en' ? card.reveal_en : card.reveal_fr}
                  </p>
                </div>

                {/* Next teaser hook */}
                {!isLast && card.next_teaser_fr && (
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-3 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">
                      {lang === 'en' ? '🔥 Next:' : '🔥 Ensuite :'}{' '}
                      <span className="text-gray-700 italic">
                        {lang === 'en' ? card.next_teaser_en : card.next_teaser_fr}
                      </span>
                    </p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  className={`w-full py-3 rounded-2xl bg-gradient-to-r ${card.gradient} text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg`}
                >
                  {isLast
                    ? t("M'inscrire gratuitement", 'Register for free')
                    : t('Suite →', 'Next →')}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer skip — uniquement sur la dernière carte */}
        {isLast && (
          <div className="px-5 pb-4 text-center">
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              {t('Continuer sans inscription', 'Continue without registering')}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
