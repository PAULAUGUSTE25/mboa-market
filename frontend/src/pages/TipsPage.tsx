import { ArrowLeft, Lightbulb, Calendar, Cloud, Bug, Sprout, Beef, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';

interface Tip { icon: LucideIcon; color: string; titleFr: string; titleEn: string; contentFr: string; contentEn: string; tag: string; }

const TIPS: Tip[] = [
  {
    icon: Sprout, color: '#3F441C',
    titleFr: 'Préparation du sol',
    titleEn: 'Soil Preparation',
    contentFr: 'Testez le pH de votre sol avant la saison des pluies. Ajoutez du fumier composté 3 semaines avant les semis pour améliorer la structure du sol et les rendements du maïs et du manioc.',
    contentEn: 'Test your soil pH before the rainy season. Add composted manure 3 weeks before sowing to improve soil structure and yields of maize and cassava.',
    tag: 'Agriculture',
  },
  {
    icon: Calendar, color: '#1D4ED8',
    titleFr: 'Calendrier cultural camerounais',
    titleEn: 'Cameroonian Crop Calendar',
    contentFr: 'Deux saisons de pluies au Centre/Sud (mars-juin et sept-nov). Dans le Nord, une seule saison (juil-oct). Planifiez les semis de maïs 2 semaines après les premières pluies pour maximiser la germination.',
    contentEn: 'Two rainy seasons in Centre/South (Mar-Jun and Sep-Nov). In the North, one season (Jul-Oct). Plan maize planting 2 weeks after first rains to maximize germination.',
    tag: 'Agriculture',
  },
  {
    icon: Cloud, color: '#0891B2',
    titleFr: 'Sécheresse & adaptation',
    titleEn: 'Drought & Adaptation',
    contentFr: 'Dans l\'Extrême-Nord et l\'Adamaoua, optez pour le sorgho et le mil résistants à la chaleur. La technique du zaï (micro-bassins) peut améliorer la rétention d\'eau de 60% dans les zones arides.',
    contentEn: 'In Far North and Adamaoua, opt for heat-resistant sorghum and millet. The zaï technique (micro-basins) can improve water retention by 60% in arid zones.',
    tag: 'Zones arides',
  },
  {
    icon: Bug, color: '#DC2626',
    titleFr: 'Lutte antiparasitaire intégrée',
    titleEn: 'Integrated Pest Management',
    contentFr: 'Combinez méthodes biologiques (trichogrammes, neem) et chimiques homologuées MINADER. La chenille légionnaire se traite avec du Coragen® ou du Karaté Zéon® en début d\'infestation.',
    contentEn: 'Combine biological methods (trichogramma, neem) with MINADER-approved chemicals. Fall armyworm is treated with Coragen® or Karate Zeon® at the start of infestation.',
    tag: 'Protection',
  },
  {
    icon: Beef, color: '#7C3D12',
    titleFr: 'Nutrition du bétail',
    titleEn: 'Livestock Nutrition',
    contentFr: 'Un bovin adulte nécessite 8-10% de sa masse corporelle en fourrage frais par jour. Complétez avec des tourteaux de coton (riche en protéines) et du sel minéral disponibles dans les COOP locales.',
    contentEn: 'An adult cattle needs 8-10% of body weight in fresh forage per day. Supplement with cottonseed cake (protein-rich) and mineral salts available at local cooperatives.',
    tag: 'Élevage',
  },
  {
    icon: Banknote, color: '#16A34A',
    titleFr: 'Vente & prix du marché',
    titleEn: 'Sales & Market Prices',
    contentFr: 'Les prix du maïs varient entre 150 et 250 FCFA/kg selon la saison. Stockez 30% de votre récolte pour vendre après la période de récolte massive quand les prix remontent de 25 à 40%.',
    contentEn: 'Maize prices vary from 150 to 250 FCFA/kg depending on the season. Store 30% of your harvest to sell after peak harvest when prices rise 25-40%.',
    tag: 'Commerce',
  },
];

export default function TipsPage() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/feed')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h1 className="flex-1 font-bold text-gray-900">{t('Astuces Pratiques', 'Practical Tips')}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 grid gap-4 sm:grid-cols-2">
        {TIPS.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: tip.color + '18' }}>
                  <Icon className="w-5 h-5" style={{ color: tip.color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tip.color }}>
                  {tip.tag}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-2">
                {lang === 'fr' ? tip.titleFr : tip.titleEn}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {lang === 'fr' ? tip.contentFr : tip.contentEn}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
