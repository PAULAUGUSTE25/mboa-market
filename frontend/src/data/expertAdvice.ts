export type ExpertAdvice = {
  id: string;
  title: string;
  summary: string;
  domain: 'agriculture' | 'elevage';
  date: string;
  source: string;
  source_url?: string;
  tags: string[];
};

export const expertAdviceData: ExpertAdvice[] = [
  {
    id: 'advice-minader-mais-calendrier',
    title: "Calendrier de semis du maïs – zones forestières",
    summary: "Semis recommandé au début des pluies régulières. Espacement 75 x 40 cm, 2 graines/poquet. Privilégier des variétés adaptées locales.",
    domain: 'agriculture',
    date: '2025-02-01',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Maïs', 'Semis', 'Zones forestières']
  },
  {
    id: 'advice-irad-mais-engrais',
    title: "Fertilisation maïs – NPK et Urée",
    summary: "Appliquer NPK 15-15-15 au semis (100–150 kg/ha) puis Urée en couverture à 30–35 jours (50–100 kg/ha), selon la fertilité du sol.",
    domain: 'agriculture',
    date: '2025-01-20',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Maïs', 'Fertilisation', 'Bonne pratique']
  },
  {
    id: 'advice-irad-manioc-ravageurs',
    title: "Manioc – Gestion intégrée des ravageurs",
    summary: "Utiliser des boutures saines, surveiller la mosaïque et la cochenille. Arrachage sanitaire et variétés tolérantes recommandés.",
    domain: 'agriculture',
    date: '2024-12-10',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Manioc', 'GIR', 'Santé des plantes']
  },
  {
    id: 'advice-minader-postrecolte-mais',
    title: "Post-récolte maïs – séchage et stockage",
    summary: "Sécher à <13% d’humidité. Utiliser des sacs hermétiques et palettes. Contrôles réguliers contre insectes et moisissures (aflatoxines).",
    domain: 'agriculture',
    date: '2025-02-05',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Post-récolte', 'Stockage', 'Qualité']
  },
  {
    id: 'advice-minepia-newcastle',
    title: "Volailles – Vaccination contre la maladie de Newcastle",
    summary: "Vacciner dès 7 jours, rappel à 21 jours puis mensuel selon risque. Respect strict de la chaîne du froid et calendrier.",
    domain: 'elevage',
    date: '2025-01-15',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Volailles', 'Vaccination', 'Newcastle']
  },
  {
    id: 'advice-minepia-biosecurite-volaille',
    title: "Biosécurité en aviculture",
    summary: "Limiter les entrées, pédiluves aux accès, quarantaine des nouveaux sujets, nettoyage-désinfection hebdomadaire des bâtiments.",
    domain: 'elevage',
    date: '2024-11-25',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Biosécurité', 'Volailles', 'Hygiène']
  },
  {
    id: 'advice-minepia-bovins-saison-seche',
    title: "Bovins – Complémentation en saison sèche",
    summary: "Foin de qualité + blocs multi-nutritionnels. Accès à l’eau sécurisé. Surveiller l’état corporel et parasitisme.",
    domain: 'elevage',
    date: '2025-02-03',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Bovins', 'Nutrition', 'Saison sèche']
  },
  {
    id: 'advice-irad-cacao-entretien',
    title: "Cacao – Entretien des vergers",
    summary: "Élagage léger, désherbage maîtrisé, surveillance des capsides et pourriture brune. Récoltes fréquentes et séchage soigné.",
    domain: 'agriculture',
    date: '2024-12-18',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Cacao', 'Entretien', 'Protection']
  }
  ,
  {
    id: 'advice-irad-tomate-irrigation',
    title: 'Tomate – Irrigation et mildiou',
    summary: "Arroser le matin, éviter le mouillage du feuillage. Paillage conseillé. Surveiller le mildiou et alterner les matières actives.",
    domain: 'agriculture',
    date: '2025-02-12',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Tomate', 'Irrigation', 'Mildiou']
  },
  {
    id: 'advice-minader-sol-analyse',
    title: 'Fertilité des sols – Analyse et correction',
    summary: "Réaliser une analyse de sol avant fertilisation. Apporter chaux en cas d’acidité, matière organique régulière pour améliorer la structure.",
    domain: 'agriculture',
    date: '2025-02-11',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Sol', 'Fertilisation', 'pH']
  },
  {
    id: 'advice-irad-riz-nerica-transplant',
    title: 'Riz – Transplantation NERICA',
    summary: "Transplanter à 20-25 jours, 2-3 plants/poquet, espacement 20 x 20 cm. Maintenir une lame d’eau de 3-5 cm après reprise.",
    domain: 'agriculture',
    date: '2025-02-09',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Riz', 'NERICA', 'Transplantation']
  },
  {
    id: 'advice-minepia-chevres-parasites',
    title: 'Caprins – Lutte contre le parasitisme',
    summary: "Vermifuger selon poids, rotation de pâturage, abreuvement propre, complément minéral. Contrôles fécaux recommandés.",
    domain: 'elevage',
    date: '2025-02-10',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Caprins', 'Parasites', 'Hygiène']
  },
  {
    id: 'advice-minepia-porcs-biosecurite',
    title: 'Porcs – Biosécurité en élevage',
    summary: "Limiter les visiteurs, pédiluves à l’entrée, quarantaine des nouveaux animaux, désinfection du matériel et des véhicules.",
    domain: 'elevage',
    date: '2025-02-08',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Porcs', 'Biosécurité', 'Hygiène']
  },
  {
    id: 'advice-minepia-lapins-repro',
    title: 'Lapins – Bonnes pratiques de reproduction',
    summary: "Introduire la femelle chez le mâle, contrôler l’état corporel, sevrage à 6-8 semaines, hygiène stricte des cages.",
    domain: 'elevage',
    date: '2025-02-06',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Lapins', 'Reproduction', 'Hygiène']
  },
  {
    id: 'advice-minepia-aquaculture-eau',
    title: 'Aquaculture – Qualité de l’eau en étang',
    summary: "Surveiller l’oxygène tôt le matin, éviter les surdensités, apporter une aération d’appoint et gérer les apports organiques.",
    domain: 'elevage',
    date: '2025-02-04',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Aquaculture', 'Eau', 'Oxygène']
  },
  {
    id: 'advice-irad-cafe-ombre',
    title: 'Café – Gestion de l’ombrage',
    summary: "Maintenir un ombrage modéré (30-40%), élaguer les arbres d’ombrage et contrôler la rouille par pratiques culturales et variétés.",
    domain: 'agriculture',
    date: '2025-01-30',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Café', 'Ombrage', 'Rouille']
  }
];

export const getExpertAdvice = (domain: 'agriculture' | 'elevage') => {
  return expertAdviceData.filter(a => a.domain === domain);
};
