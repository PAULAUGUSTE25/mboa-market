import { ArrowLeft, GraduationCap, Star, MessageCircle, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const EXPERTS = [
  {
    name: 'Dr. Jean-Pierre Kamga',
    specialtyFr: 'Sciences des cultures & Agronomie',
    specialtyEn: 'Crop Science & Agronomy',
    org: 'IRAD — Yaoundé',
    region: 'Centre',
    domain: 'agriculture' as const,
    rating: 4.9,
    consultations: 215,
    avatar: 'JK',
    bioFr: 'Chercheur senior à l\'IRAD, spécialiste des variétés améliorées de maïs et de manioc au Cameroun. 18 ans d\'expérience de terrain.',
    bioEn: 'Senior researcher at IRAD, specialist in improved maize and cassava varieties in Cameroon. 18 years of field experience.',
    phone: '+237 699 000 001',
  },
  {
    name: 'Dr. Marie-Claire Nkolo',
    specialtyFr: 'Élevage bovin & Zootechnie',
    specialtyEn: 'Bovine Livestock & Animal Husbandry',
    org: 'MINEPIA — Délégation Adamaoua',
    region: 'Adamaoua',
    domain: 'elevage' as const,
    rating: 4.8,
    consultations: 183,
    avatar: 'MN',
    bioFr: 'Inspectrice vétérinaire régionale, experte des races bovines Gudali et Fulani. Accompagne les éleveurs de l\'Adamaoua depuis 12 ans.',
    bioEn: 'Regional veterinary inspector, expert in Gudali and Fulani cattle breeds. Has supported Adamaoua farmers for 12 years.',
    phone: '+237 699 000 002',
  },
  {
    name: 'Pr. Paul Tsafack',
    specialtyFr: 'Fertilité des sols & Agroécologie',
    specialtyEn: 'Soil Fertility & Agroecology',
    org: 'Université de Dschang — FASA',
    region: 'Ouest',
    domain: 'agriculture' as const,
    rating: 4.9,
    consultations: 302,
    avatar: 'PT',
    bioFr: 'Professeur à la FASA, auteur de 40+ publications sur la gestion des sols tropicaux. Fondateur du programme AgroEco Cameroun.',
    bioEn: 'Professor at FASA, author of 40+ publications on tropical soil management. Founder of the AgroEco Cameroon program.',
    phone: '+237 699 000 003',
  },
  {
    name: 'Dr. Aminata Bello',
    specialtyFr: 'Aquaculture & Pisciculture',
    specialtyEn: 'Aquaculture & Fish Farming',
    org: 'MINEPIA — Direction des Pêches',
    region: 'Littoral',
    domain: 'elevage' as const,
    rating: 4.7,
    consultations: 127,
    avatar: 'AB',
    bioFr: 'Directrice adjointe des pêches, spécialiste de la pisciculture de tilapia et de silure en milieu tropical camerounais.',
    bioEn: 'Deputy director of fisheries, specialist in tilapia and catfish farming in Cameroonian tropical environments.',
    phone: '+237 699 000 004',
  },
  {
    name: 'Ing. Samuel Fouda',
    specialtyFr: 'Mécanisation agricole & Irrigation',
    specialtyEn: 'Agricultural Mechanization & Irrigation',
    org: 'MINADER — Génie Rural',
    region: 'Centre',
    domain: 'agriculture' as const,
    rating: 4.6,
    consultations: 98,
    avatar: 'SF',
    bioFr: 'Ingénieur en génie rural, spécialiste des systèmes d\'irrigation adaptés aux petits exploitants du Cameroun.',
    bioEn: 'Rural engineering specialist, expert in irrigation systems adapted to small-scale farmers in Cameroon.',
    phone: '+237 699 000 005',
  },
  {
    name: 'Dr. Grace Tchatchou',
    specialtyFr: 'Santé vétérinaire & Maladies animales',
    specialtyEn: 'Veterinary Health & Animal Diseases',
    org: 'LANAVET — Garoua',
    region: 'Nord',
    domain: 'elevage' as const,
    rating: 4.8,
    consultations: 156,
    avatar: 'GT',
    bioFr: 'Vétérinaire de terrain au LANAVET, spécialiste des maladies tropicales animales (PPCB, fièvre aphteuse, trypanosomose).',
    bioEn: 'Field veterinarian at LANAVET, specialist in tropical animal diseases (CBPP, FMD, trypanosomosis).',
    phone: '+237 699 000 006',
  },
];

export default function ExpertsPage() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'agriculture' | 'elevage'>('all');
  const [contactExpert, setContactExpert] = useState<string | null>(null);

  const displayed = EXPERTS.filter(e => filter === 'all' || e.domain === filter);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/feed')} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <GraduationCap className="w-5 h-5 text-[#3F441C]" />
        <h1 className="flex-1 font-bold text-gray-900">{t('Experts Agri-Élevage', 'Agri-Livestock Experts')}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Filtre domaine */}
        <div className="flex gap-2">
          {(['all', 'agriculture', 'elevage'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f ? 'bg-[#3F441C] text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f === 'all' ? t('Tous', 'All') : f === 'agriculture' ? t('Agriculture', 'Agriculture') : t('Élevage', 'Livestock')}
            </button>
          ))}
        </div>

        {displayed.map((expert, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: expert.domain === 'elevage' ? '#7C3D12' : '#3F441C' }}
              >
                {expert.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{expert.name}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: expert.domain === 'elevage' ? '#7C3D12' : '#3F441C' }}>
                      {lang === 'fr' ? expert.specialtyFr : expert.specialtyEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-700">{expert.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{expert.org}</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />{expert.region}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {lang === 'fr' ? expert.bioFr : expert.bioEn}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {expert.consultations} {t('consultations réalisées', 'consultations completed')}
                </p>
              </div>
            </div>

            {contactExpert === expert.name ? (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#3F441C]" />
                <span className="text-sm font-semibold text-gray-800">{expert.phone}</span>
                <button onClick={() => setContactExpert(null)} className="ml-auto text-xs text-gray-400 hover:text-gray-600">
                  {t('Fermer', 'Close')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setContactExpert(expert.name)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: expert.domain === 'elevage' ? '#7C3D12' : '#3F441C' }}
              >
                <MessageCircle className="w-4 h-4" />
                {t('Consulter', 'Consult')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
