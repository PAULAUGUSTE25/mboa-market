export type OfficialNews = {
  id: string;
  title: string;
  summary: string;
  domain: 'agriculture' | 'elevage';
  date: string;
  source: string;
  source_url?: string;
  tags: string[];
};

export const officialNewsData: OfficialNews[] = [
  // Agriculture
  {
    id: 'news-minader-2025-02-campagne-mais',
    title: "Lancement de la campagne maïs 2025",
    summary: "Le MINADER annonce le démarrage officiel de la campagne maïs dans les régions Centre, Ouest et Littoral avec un appui en semences certifiées et encadrement technique.",
    domain: 'agriculture',
    date: '2025-02-10',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Campagne', 'Maïs', 'Semences']
  },
  {
    id: 'news-irad-2025-01-varietes-mais',
    title: "Nouvelles variétés de maïs tolérantes au stress hydrique",
    summary: "L’IRAD présente des variétés améliorées adaptées aux zones soudano-sahéliennes, disponibles via ses stations régionales.",
    domain: 'agriculture',
    date: '2025-01-28',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Variétés améliorées', 'Résilience', 'Zones sèches']
  },
  {
    id: 'news-minader-2025-02-cacao-qualite',
    title: "Programme qualité cacao 2025",
    summary: "Renforcement du contrôle qualité post-récolte (séchage et fermentation) et sensibilisation contre les résidus chimiques.",
    domain: 'agriculture',
    date: '2025-02-05',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Cacao', 'Qualité', 'Post-récolte']
  },

  // Elevage
  {
    id: 'news-minepia-2025-01-newcastle-campagne',
    title: "Campagne de vaccination Newcastle 2025",
    summary: "Le MINEPIA lance une campagne nationale de vaccination contre la maladie de Newcastle dans les élevages de volailles.",
    domain: 'elevage',
    date: '2025-01-22',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Volailles', 'Vaccination', 'Newcastle']
  },
  {
    id: 'news-minepia-2024-12-biosecurite',
    title: "Renforcement de la biosécurité dans les fermes avicoles",
    summary: "Publication d’un guide pratique de biosécurité: contrôle des entrées, désinfection, gestion des déchets et quarantaine.",
    domain: 'elevage',
    date: '2024-12-12',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Biosécurité', 'Aviculture']
  },
  {
    id: 'news-elevage-2025-02-pasteurellose',
    title: "Alerte sanitaire – Prévention de la pasteurellose bovine",
    summary: "Recommandations préventives en saison sèche: abreuvement, complémentation et vigilance clinique.",
    domain: 'elevage',
    date: '2025-02-06',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Bovins', 'Santé animale']
  },

  // Agriculture – additions
  {
    id: 'news-oncc-2025-02-cacao-prix',
    title: "ONCC – Mise à jour des prix indicatifs du cacao",
    summary: "L'ONCC publie les prix indicatifs pour la campagne en cours et rappelle les bonnes pratiques de fermentation et séchage.",
    domain: 'agriculture',
    date: '2025-02-08',
    source: 'ONCC',
    source_url: 'https://oncc.cm/',
    tags: ['Cacao', 'Prix', 'Qualité']
  },
  {
    id: 'news-minader-2025-02-semences-calendrier',
    title: "MINADER – Calendrier de distribution des semences",
    summary: "Publication des points de distribution des semences certifiées par région pour la campagne 2025.",
    domain: 'agriculture',
    date: '2025-02-09',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Semences', 'Distribution', 'Campagne 2025']
  },
  {
    id: 'news-irad-2025-01-riz-nerica',
    title: "IRAD – Disponibilité de variétés de riz NERICA",
    summary: "Annonce de disponibilités en semences NERICA pour zones inondables et de bas-fonds, avec itinéraires techniques.",
    domain: 'agriculture',
    date: '2025-01-26',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Riz', 'NERICA', 'Semences']
  },
  {
    id: 'news-sodecoton-2025-02-appui-producteurs',
    title: "SODECOTON – Appui aux producteurs de coton",
    summary: "Programme d'accompagnement technique et accès intrants subventionnés pour la campagne cotonnière.",
    domain: 'agriculture',
    date: '2025-02-07',
    source: 'SODECOTON',
    source_url: 'https://www.sodecoton.cm/',
    tags: ['Coton', 'Intrants', 'Accompagnement']
  },

  // Elevage – additions
  {
    id: 'news-minepia-2025-02-cliniques-mobiles',
    title: "MINEPIA – Tournée des cliniques vétérinaires mobiles",
    summary: "Calendrier des cliniques mobiles par région pour consultations, vaccination et sensibilisation.",
    domain: 'elevage',
    date: '2025-02-09',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Services vétérinaires', 'Vaccination']
  },
  {
    id: 'news-lanavet-2025-02-vaccins-disponibles',
    title: "LANAVET – Disponibilité de vaccins vétérinaires",
    summary: "Annonce des lots disponibles (Newcastle, PPR, charbon bactéridien) et points de vente agréés.",
    domain: 'elevage',
    date: '2025-02-08',
    source: 'LANAVET',
    source_url: 'https://lanavet.cm/',
    tags: ['Vaccins', 'LANAVET', 'Santé animale']
  },
  {
    id: 'news-minepia-2025-02-ppr-sensibilisation',
    title: "Sensibilisation – Peste des petits ruminants (PPR)",
    summary: "Mesures de prévention en élevage ovin/caprin et rappel des signes cliniques à surveiller.",
    domain: 'elevage',
    date: '2025-02-05',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['PPR', 'Caprins', 'Ovins']
  },
  // Agriculture – more
  {
    id: 'news-minader-2025-02-fertilisants-subvention',
    title: 'Subvention des engrais 2025 – modalités d’accès',
    summary: "Le MINADER publie les modalités d’accès aux intrants subventionnés et la liste des points de distribution par région.",
    domain: 'agriculture',
    date: '2025-02-11',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Engrais', 'Subvention', 'Intrants']
  },
  {
    id: 'news-irad-2025-02-formation-cep',
    title: 'IRAD – Formations Champs Écoles Paysans (CEP)',
    summary: "Calendrier des sessions CEP sur la gestion intégrée de la fertilité et la lutte contre ravageurs/maladies.",
    domain: 'agriculture',
    date: '2025-02-10',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Formation', 'CEP', 'Bonnes pratiques']
  },
  {
    id: 'news-oncc-2025-02-tracabilite-cacao',
    title: 'ONCC – Renforcement de la traçabilité du cacao',
    summary: "Mise en œuvre d’outils numériques pour améliorer la traçabilité et la qualité des lots à l’export.",
    domain: 'agriculture',
    date: '2025-02-10',
    source: 'ONCC',
    source_url: 'https://oncc.cm/',
    tags: ['Traçabilité', 'Cacao', 'Qualité']
  },
  // Elevage – more
  {
    id: 'news-minepia-2025-02-marches-betail',
    title: 'Bulletin des marchés à bétail – prix moyens hebdomadaires',
    summary: "Publication des prix moyens des bovins et petits ruminants par région et tendance de la semaine.",
    domain: 'elevage',
    date: '2025-02-11',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Prix', 'Marchés', 'Bovins']
  },
  {
    id: 'news-lanavet-2025-02-certification-qualite',
    title: 'LANAVET – Renforcement de la certification qualité',
    summary: "Amélioration des capacités de contrôle qualité des lots de vaccins et extension de la distribution régionale.",
    domain: 'elevage',
    date: '2025-02-10',
    source: 'LANAVET',
    source_url: 'https://lanavet.cm/',
    tags: ['Qualité', 'Vaccins', 'LANAVET']
  },
  {
    id: 'news-minepia-2025-02-auxiliaires-veterinaires',
    title: 'Appui aux auxiliaires d’élevage – dispositif renforcé',
    summary: "Renforcement du maillage d’auxiliaires vétérinaires communautaires et sessions de recyclage par région.",
    domain: 'elevage',
    date: '2025-02-07',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Services vétérinaires', 'Proximité', 'Formation']
  }
];

export const getOfficialNews = (domain: 'agriculture' | 'elevage') => {
  return officialNewsData.filter(n => n.domain === domain);
};
