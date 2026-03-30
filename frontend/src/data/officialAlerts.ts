export type OfficialAlert = {
  id: string;
  title: string;
  summary: string;
  domain: 'agriculture' | 'elevage';
  date: string;
  source: string;
  source_url?: string;
  tags: string[];
  severity?: 'info' | 'watch' | 'warning' | 'critical';
};

export const officialAlertsData: OfficialAlert[] = [
  // Agriculture alerts
  {
    id: 'alert-minader-2025-02-armyworm',
    title: "Alerte – Chenille légionnaire d’automne",
    summary: "Signalements en hausse sur maïs jeunes stades. Recommandations: surveillance hebdomadaire, piégeage et traitement ciblé si nécessaire.",
    domain: 'agriculture',
    date: '2025-02-10',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Maïs', 'Ravageurs', 'Surveillance'],
    severity: 'warning'
  },
  {
    id: 'alert-irad-2025-01-aflatoxines',
    title: "Prévention – Aflatoxines post‑récolte",
    summary: "Rappel: séchage à <13% d’humidité, stockage hermétique, contrôle des grains abîmés pour limiter risques sanitaires.",
    domain: 'agriculture',
    date: '2025-01-25',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Post‑récolte', 'Qualité', 'Sécurité alimentaire'],
    severity: 'info'
  },

  // Elevage alerts
  {
    id: 'alert-minepia-2025-02-influenza',
    title: "Alerte – Influenza aviaire hautement pathogène (IAHP)",
    summary: "Renforcer la biosécurité: limiter les mouvements, désinfection, signalement immédiat des mortalités anormales.",
    domain: 'elevage',
    date: '2025-02-08',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Volailles', 'Biosécurité', 'IAHP'],
    severity: 'critical'
  },
  {
    id: 'alert-minepia-2025-02-anthrax',
    title: "Veille – Charbon bactéridien (Anthrax)",
    summary: "Rappel des mesures: éviter l’ouverture des carcasses suspectes, informer les services vétérinaires, vaccination dans les zones à risque.",
    domain: 'elevage',
    date: '2025-02-04',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Bovins', 'Santé animale'],
    severity: 'watch'
  },
  // Agriculture – more alerts
  {
    id: 'alert-minader-2025-02-criquets',
    title: 'Veille – Risque de criquets dans l’Extrême‑Nord',
    summary: 'Surveillance renforcée demandée aux producteurs. Signaler les essaims au service de protection des végétaux.',
    domain: 'agriculture',
    date: '2025-02-09',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Criquets', 'Surveillance', 'Extrême‑Nord'],
    severity: 'watch'
  },
  {
    id: 'alert-irad-2025-02-mildiou-tomate',
    title: 'Alerte – Mildiou de la tomate',
    summary: 'Humidité élevée: risque fort de mildiou. Paillage, arrosage au sol, rotation et traitements préventifs recommandés.',
    domain: 'agriculture',
    date: '2025-02-10',
    source: 'IRAD',
    source_url: 'https://irad-cameroon.org/',
    tags: ['Tomate', 'Mildiou', 'Légumes'],
    severity: 'warning'
  },
  {
    id: 'alert-minader-2025-02-pluies-torrentielles',
    title: 'Info – Pluies intenses: risques de pourriture racinaire',
    summary: 'Aménager des billons drainants, éviter l’excès d’irrigation, améliorer l’aération du sol pour cultures sensibles (piment, tomate).',
    domain: 'agriculture',
    date: '2025-02-07',
    source: 'MINADER (Cameroun)',
    source_url: 'https://www.minader.gov.cm/',
    tags: ['Pluies', 'Drainage', 'Santé des plantes'],
    severity: 'info'
  },
  // Elevage – more alerts
  {
    id: 'alert-minepia-2025-02-fievre-rift',
    title: 'Veille – Fièvre de la Vallée du Rift',
    summary: 'Risque saisonnier signalé dans zones de bas‑fonds. Précautions: lutte contre moustiques, éviter abattage d’animaux malades.',
    domain: 'elevage',
    date: '2025-02-09',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Santé animale', 'Vectoriel', 'Ruminants'],
    severity: 'watch'
  },
  {
    id: 'alert-minepia-2025-02-fievre-aphteuse',
    title: 'Alerte – Fièvre aphteuse (FMD) dans l’Adamaoua',
    summary: 'Limiter mouvements de bétail, désinfection des points d’eau, informer services vétérinaires des lésions buccales et podales.',
    domain: 'elevage',
    date: '2025-02-10',
    source: 'MINEPIA (Cameroun)',
    source_url: 'https://www.minepia.gov.cm/',
    tags: ['Bovins', 'Fièvre aphteuse', 'Quarantaine'],
    severity: 'warning'
  }
];

export const getOfficialAlerts = (domain: 'agriculture' | 'elevage') => {
  return officialAlertsData.filter(a => a.domain === domain);
};
