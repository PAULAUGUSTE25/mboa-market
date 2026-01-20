import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Shield, Calendar, DollarSign, Users, CheckCircle, ShoppingCart } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/utils/themeStyles';

interface AdviceCategory {
  id: string;
  title: string;
  icon: any;
  color: string;
  tips: Tip[];
}

interface Tip {
  title: string;
  description: string;
  category: 'buying' | 'selling' | 'pricing' | 'quality' | 'timing' | 'safety';
}

const adviceData: AdviceCategory[] = [
  {
    id: 'buying',
    title: 'Conseils d\'Achat',
    icon: ShoppingCart,
    color: 'blue',
    tips: [
      {
        title: 'Vérifiez la qualité avant d\'acheter',
        description: 'Demandez toujours des photos détaillées et des informations sur la provenance. N\'hésitez pas à poser des questions sur les conditions de culture ou d\'élevage.',
        category: 'buying'
      },
      {
        title: 'Comparez les prix',
        description: 'Consultez plusieurs vendeurs pour le même produit. Les prix peuvent varier selon la région et la saison.',
        category: 'buying'
      },
      {
        title: 'Privilégiez les vendeurs vérifiés',
        description: 'Les vendeurs avec un badge "Vérifié" ou "Gold" ont prouvé leur fiabilité. Consultez leurs avis avant d\'acheter.',
        category: 'buying'
      },
      {
        title: 'Négociez pour les achats en gros',
        description: 'Pour des quantités importantes, n\'hésitez pas à négocier le prix. Les vendeurs sont souvent ouverts à des réductions pour les commandes volumineuses.',
        category: 'buying'
      }
    ]
  },
  {
    id: 'selling',
    title: 'Conseils de Vente',
    icon: TrendingUp,
    color: 'green',
    tips: [
      {
        title: 'Prenez de belles photos',
        description: 'Des photos claires et bien éclairées augmentent vos chances de vente de 70%. Montrez le produit sous différents angles.',
        category: 'selling'
      },
      {
        title: 'Soyez précis dans vos descriptions',
        description: 'Indiquez la variété, la quantité exacte, la provenance et les conditions de culture. Plus vous êtes transparent, plus vous inspirez confiance.',
        category: 'selling'
      },
      {
        title: 'Répondez rapidement aux messages',
        description: 'Les acheteurs apprécient les vendeurs réactifs. Essayez de répondre dans les 2 heures pour maximiser vos ventes.',
        category: 'selling'
      },
      {
        title: 'Offrez des options de livraison',
        description: 'Proposez plusieurs modes de livraison (retrait sur place, livraison à domicile). Cela augmente vos chances de vente.',
        category: 'selling'
      }
    ]
  },
  {
    id: 'pricing',
    title: 'Stratégie de Prix',
    icon: DollarSign,
    color: 'yellow',
    tips: [
      {
        title: 'Connaissez les prix du marché',
        description: 'Consultez régulièrement les prix pratiqués pour vos produits. Un prix trop élevé décourage les acheteurs, un prix trop bas éveille les soupçons.',
        category: 'pricing'
      },
      {
        title: 'Ajustez selon la saison',
        description: 'Les prix varient selon la disponibilité saisonnière. Vendez plus cher en basse saison, ajustez en haute saison.',
        category: 'pricing'
      },
      {
        title: 'Proposez des promotions',
        description: 'Les offres spéciales attirent l\'attention. Essayez "Achetez 10 sacs, obtenez 5% de réduction".',
        category: 'pricing'
      },
      {
        title: 'Incluez les frais de transport',
        description: 'Soyez transparent sur les coûts totaux. Les acheteurs préfèrent connaître le prix final dès le départ.',
        category: 'pricing'
      }
    ]
  },
  {
    id: 'quality',
    title: 'Garantir la Qualité',
    icon: CheckCircle,
    color: 'purple',
    tips: [
      {
        title: 'Stockez correctement vos produits',
        description: 'Conservez les semences au sec et au frais. Les produits frais doivent être réfrigérés. Une bonne conservation = meilleure qualité.',
        category: 'quality'
      },
      {
        title: 'Respectez les normes d\'hygiène',
        description: 'Pour les produits alimentaires, assurez-vous qu\'ils sont propres et exempts de contaminants. Utilisez des emballages appropriés.',
        category: 'quality'
      },
      {
        title: 'Testez vos semences',
        description: 'Avant de vendre des semences, vérifiez leur taux de germination. Cela évite les réclamations et renforce votre réputation.',
        category: 'quality'
      },
      {
        title: 'Documentez la traçabilité',
        description: 'Gardez des registres de vos sources, dates de récolte, et traitements appliqués. Les acheteurs sérieux apprécient cette transparence.',
        category: 'quality'
      }
    ]
  },
  {
    id: 'timing',
    title: 'Meilleur Moment pour Vendre/Acheter',
    icon: Calendar,
    color: 'orange',
    tips: [
      {
        title: 'Calendrier agricole',
        description: 'Achetez les semences 2-3 mois avant la saison des pluies. Vendez vos récoltes juste après la récolte pour un prix optimal.',
        category: 'timing'
      },
      {
        title: 'Évitez les périodes de surproduction',
        description: 'Pendant les pics de récolte, les prix chutent. Stockez si possible pour vendre plus tard à meilleur prix.',
        category: 'timing'
      },
      {
        title: 'Anticipez la demande',
        description: 'Les produits festifs (poulets, plantains) se vendent mieux avant les fêtes. Planifiez votre production en conséquence.',
        category: 'timing'
      },
      {
        title: 'Surveillez les tendances',
        description: 'Certains produits deviennent populaires à certaines périodes. Restez informé des tendances du marché.',
        category: 'timing'
      }
    ]
  },
  {
    id: 'safety',
    title: 'Sécurité des Transactions',
    icon: Shield,
    color: 'red',
    tips: [
      {
        title: 'Utilisez le système d\'escrow',
        description: 'Le paiement sécurisé protège acheteurs et vendeurs. L\'argent n\'est libéré qu\'après confirmation de réception.',
        category: 'safety'
      },
      {
        title: 'Rencontrez dans des lieux publics',
        description: 'Pour les transactions en personne, choisissez des lieux publics et fréquentés. Amenez quelqu\'un si possible.',
        category: 'safety'
      },
      {
        title: 'Méfiez-vous des prix trop bas',
        description: 'Un prix anormalement bas peut indiquer une arnaque ou un produit de mauvaise qualité. Faites preuve de discernement.',
        category: 'safety'
      },
      {
        title: 'Vérifiez l\'identité',
        description: 'Demandez une pièce d\'identité pour les transactions importantes. Les vendeurs sérieux n\'ont rien à cacher.',
        category: 'safety'
      }
    ]
  }
];

export default function AdvicePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: theme === 'light' 
            ? `url('/light%20mode%20.png')`
            : `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')`,
        }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? `bg-gradient-to-br ${styles.background}` : ''}`} style={{
          backdropFilter: theme === 'light' ? 'blur(2px)' : undefined,
          backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : undefined
        }}></div>
      </div>

      {/* Animated Background Pattern - Dark Mode Only */}
      {theme === 'dark' && (
        <div className={`fixed inset-0 ${styles.blobs}`}>
          <div className={`absolute top-10 left-10 w-32 h-32 ${styles.blobColors[0]} rounded-full blur-3xl animate-pulse`}></div>
          <div className={`absolute top-40 right-20 w-40 h-40 ${styles.blobColors[1]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
          <div className={`absolute bottom-20 left-1/4 w-36 h-36 ${styles.blobColors[2]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
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
        <div className="text-yellow-500/[0.12]">
          <Lightbulb className="w-[600px] h-[600px]" strokeWidth={0.6} />
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] bg-yellow-500/[0.06]"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton Retour */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 sm:mb-6 transition-all transform hover:scale-110 text-2xl font-bold"
          style={{
            color: theme === 'light' ? '#1A1A1A' : '#9CA3AF'
          }}
        >
          ←
        </button>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-yellow-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: theme === 'light' ? '#1A1A1A' : '#FFFFFF' }}>Conseils & Astuces</h1>
          </div>
          <p style={{ color: theme === 'light' ? '#4B5563' : 'rgba(209, 213, 219, 0.9)' }}>
            Guide de production et conseils d'experts
          </p>
        </motion.div>
        {/* Introduction */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-md bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-500/30 rounded-xl p-8 mb-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Devenez un Expert du Marché Agricole</h2>
          <p className="text-lg text-white/90">
            Découvrez les meilleures pratiques pour acheter et vendre sur MBOA Market. 
            Ces conseils sont basés sur l'expérience de nos meilleurs vendeurs et acheteurs.
          </p>
        </motion.div>

        {/* Category Grid */}
        {!selectedCategory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adviceData.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-2xl p-6 sm:p-8 text-left shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 border border-yellow-400/30 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="h-7 w-7 text-yellow-300" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white tracking-tight">{category.title}</h3>
                  <p className="text-sm text-white/60 font-medium">{category.tips.length} conseils disponibles</p>
                </button>
              );
            })}
          </div>
        ) : (
          /* Tips List */
          <div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-6 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white hover:bg-white/15 transition-all font-bold"
            >
              ← Retour aux catégories
            </button>

            {adviceData
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id}>
                    <div className="flex items-center space-x-3 mb-6">
                      <Icon className="h-10 w-10 text-yellow-400" />
                      <h2 className="text-3xl font-bold text-white">{category.title}</h2>
                    </div>

                    <div className="space-y-6">
                      {category.tips.map((tip, index) => (
                        <div
                          key={index}
                          className="backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 border-l-4 border-yellow-500 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300"
                        >
                          <h3 className="text-xl font-bold text-white mb-3 flex items-start gap-4">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/40 to-yellow-600/30 border border-yellow-500/50 text-yellow-200 font-bold text-base flex-shrink-0 shadow-md">
                              {index + 1}
                            </span>
                            <span className="flex-1">{tip.title}</span>
                          </h3>
                          <p className="text-white/70 leading-relaxed ml-14 text-base">{tip.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Success Stories Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Users className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Témoignages de Réussite</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-white/90 italic mb-2">
                "Grâce aux conseils sur la photographie, mes ventes ont augmenté de 150% en un mois!"
              </p>
              <p className="text-sm text-white/60">- Marie, Productrice de Maïs, Bafoussam</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-white/90 italic mb-2">
                "Le système d'escrow m'a permis d'acheter en toute confiance. Je recommande vivement!"
              </p>
              <p className="text-sm text-white/60">- Jean, Acheteur, Douala</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-white/90 italic mb-2">
                "En suivant les conseils de timing, j'ai pu vendre mes poulets 30% plus cher avant Noël."
              </p>
              <p className="text-sm text-white/60">- Paul, Éleveur, Yaoundé</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-white/90 italic mb-2">
                "La négociation en gros m'a permis d'économiser 20% sur mes achats de semences."
              </p>
              <p className="text-sm text-white/60">- Fatima, Productrice, Garoua</p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 backdrop-blur-md bg-emerald-500/30 border border-emerald-500/30 rounded-xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Prêt à Appliquer Ces Conseils?</h2>
          <p className="text-lg text-white/90 mb-6">
            Retournez au feed et commencez à acheter ou vendre avec confiance!
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-white/20 border-2 border-white/30 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/30 transition-all"
          >
            Retour à l'Accueil
          </button>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
