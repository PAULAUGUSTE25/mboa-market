import { ArrowLeft, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface AdviceItem {
  icon: string;
  titleFr: string;
  titleEn: string;
  tipsF: string[];
  tipsE: string[];
}

const ADVICE: AdviceItem[] = [
  {
    icon: '🌱',
    titleFr: 'Gestion des cultures',
    titleEn: 'Crop Management',
    tipsF: [
      'Pratiquez la rotation des cultures chaque saison pour préserver la fertilité du sol.',
      'Testez régulièrement le pH du sol — l\'idéal pour le maïs est entre 5,8 et 7,0.',
      'Utilisez des engrais organiques (compost, fumier) avant les engrais chimiques.',
      'Paillez les cultures de manioc pour retenir l\'humidité et réduire les mauvaises herbes.',
    ],
    tipsE: [
      'Practice crop rotation every season to preserve soil fertility.',
      'Test soil pH regularly — ideal for maize is between 5.8 and 7.0.',
      'Use organic fertilizers (compost, manure) before chemical ones.',
      'Mulch cassava crops to retain moisture and reduce weeds.',
    ],
  },
  {
    icon: '💧',
    titleFr: 'Gestion de l\'eau',
    titleEn: 'Water Management',
    tipsF: [
      'L\'irrigation goutte-à-goutte réduit la consommation d\'eau jusqu\'à 40%.',
      'Récoltez l\'eau de pluie avec des bassins de rétention pour la saison sèche.',
      'Évitez l\'arrosage en plein soleil — arrosez tôt le matin ou le soir.',
      'Dans l\'Extrême-Nord : privilégiez les variétés résistantes à la sécheresse.',
    ],
    tipsE: [
      'Drip irrigation reduces water consumption by up to 40%.',
      'Collect rainwater with retention basins for the dry season.',
      'Avoid watering in direct sunlight — water early morning or evening.',
      'In Far North: prioritize drought-resistant varieties.',
    ],
  },
  {
    icon: '🐄',
    titleFr: 'Santé animale',
    titleEn: 'Animal Health',
    tipsF: [
      'Vaccinez systématiquement contre la fièvre aphteuse et la pasteurellose.',
      'Respectez le calendrier vétérinaire du MINEPIA pour votre région.',
      'Séparez les animaux malades immédiatement pour éviter la contagion.',
      'En saison des pluies : augmentez la surveillance contre les parasites externes.',
    ],
    tipsE: [
      'Systematically vaccinate against foot-and-mouth disease and pasteurellosis.',
      'Follow the veterinary schedule from MINEPIA for your region.',
      'Isolate sick animals immediately to prevent contagion.',
      'In rainy season: increase monitoring for external parasites.',
    ],
  },
  {
    icon: '📊',
    titleFr: 'Stratégies de marché',
    titleEn: 'Market Strategies',
    tipsF: [
      'Regroupez-vous en coopérative pour négocier de meilleurs prix de vente.',
      'Comparez les prix entre le marché local, les GIE et les exportateurs.',
      'La qualité prime toujours sur la quantité sur les marchés camerounais.',
      'Utilisez Mboa Market pour vendre directement sans intermédiaire.',
    ],
    tipsE: [
      'Join cooperatives to negotiate better selling prices.',
      'Compare prices between local markets, GIEs and exporters.',
      'Quality always beats quantity on Cameroonian markets.',
      'Use Mboa Market to sell directly without intermediaries.',
    ],
  },
  {
    icon: '🌿',
    titleFr: 'Agriculture durable',
    titleEn: 'Sustainable Farming',
    tipsF: [
      'L\'agroforesterie améliore les rendements et protège les sols contre l\'érosion.',
      'Le compostage des déchets ménagers réduit les coûts en intrants de 30%.',
      'Respectez les périodes de jachère recommandées par l\'IRAD.',
      'Plantez des légumineuses (niébé, soja) pour fixer l\'azote naturellement.',
    ],
    tipsE: [
      'Agroforestry improves yields and protects soils from erosion.',
      'Composting household waste reduces input costs by 30%.',
      'Follow fallow periods recommended by IRAD.',
      'Plant legumes (cowpea, soy) to fix nitrogen naturally.',
    ],
  },
  {
    icon: '🏛️',
    titleFr: 'Accès aux subventions',
    titleEn: 'Accessing Subsidies',
    tipsF: [
      'Enregistrez-vous auprès de votre délégation MINADER/MINEPIA pour accéder aux subventions.',
      'Le programme ACEFA propose des crédits agricoles à taux bonifiés.',
      'Les semences subventionnées sont disponibles à 50% du prix au MINADER.',
      'Contactez le FIDA Cameroun pour les programmes de financement rural.',
    ],
    tipsE: [
      'Register with your MINADER/MINEPIA delegation to access subsidies.',
      'The ACEFA program offers agricultural loans at reduced rates.',
      'Subsidized seeds are available at 50% price at MINADER.',
      'Contact FIDA Cameroon for rural financing programs.',
    ],
  },
];

export default function AdvicePage() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/feed')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h1 className="flex-1 font-bold text-gray-900">{t('Conseils Experts', 'Expert Advice')}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        <p className="text-xs text-gray-400">
          {t('Recommandations adaptées au contexte agricole camerounais.', 'Recommendations tailored to the Cameroonian agricultural context.')}
        </p>

        {ADVICE.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="flex-1 font-semibold text-gray-900 text-sm">
                {lang === 'fr' ? item.titleFr : item.titleEn}
              </span>
              {openIdx === idx ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {openIdx === idx && (
              <ul className="px-4 pb-4 space-y-2 border-t border-gray-50 pt-3">
                {(lang === 'fr' ? item.tipsF : item.tipsE).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3F441C] mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 leading-snug">{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
