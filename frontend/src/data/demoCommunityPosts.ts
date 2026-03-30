// Demo community posts - Publications avec images du net et prix réalistes du marché camerounais 2024
export const generateDemoCommunityPosts = () => {
  const expertNames = [
    'Dr. Mbarga Jean', 'Ing. Amadou Hassan', 'Prof. Marie Nguema', 'Dr. Sophie Kamga',
    'Ing. Paul Nkolo', 'Dr. Fatima Bello', 'Ing. André Tchouta', 'Dr. Aissatou Diallo'
  ];

  const regions = [
    'Centre', 'Littoral', 'Ouest', 'Nord', 'Adamaoua', 'Est', 'Sud', 'Nord-Ouest', 'Sud-Ouest', 'Extrême-Nord'
  ];

  const posts: any[] = [];
  let id = 1;

  const createPost = (
    title: string,
    content: string,
    domain: 'agriculture' | 'elevage',
    type: 'expert_advice' | 'tip' | 'announcement' | 'warning' | 'success_story',
    hasImage: boolean = false,
    image?: string
  ) => {
    const expert = expertNames[Math.floor(Math.random() * expertNames.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    
    posts.push({
      id: `community-${id++}`,
      author: expert,
      author_role: type === 'expert_advice' ? 'expert' : 'community_member',
      title,
      content,
      domain,
      type,
      region,
      images: hasImage && image ? [image] : [],
      likes: Math.floor(Math.random() * 150),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 30),
      created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  // ============================================
  // AGRICULTURE - Publications avec images internet
  // ============================================

  // TOMATES
  createPost(
    '🍅 Tomates fraîches - Récolte abondante',
    'Tomates fraîches disponibles ! Variété Roma, bien mûres et fermes. Prix : 800 FCFA/kg ou 15 000 FCFA/cagette de 25 kg. Idéal pour sauce et salade. Livraison possible à Douala.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // MAÏS
  createPost(
    '🌽 Maïs grain sec - Nouvelle récolte',
    'Maïs grain disponible ! Qualité supérieure, bien séché (14% humidité). Prix : 250 FCFA/kg ou 12 000 FCFA/sac de 50 kg. Idéal pour alimentation humaine ou animale. Stock : 5 tonnes.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // OIGNONS
  createPost(
    '🧅 Oignons du Nord - Qualité premium',
    'Oignons rouges et blancs disponibles ! Direct du Nord Cameroun. Prix : 600 FCFA/kg ou 25 000 FCFA/sac de 50 kg. Conservation longue durée. Livraison dans tout le pays.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/4197447/pexels-photo-4197447.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // PIMENTS
  createPost(
    '🌶️ Piments frais - Variétés locales',
    'Piments disponibles ! Piment rouge, piment vert, piment noir de Penja. Prix : 1 500 FCFA/kg (rouge), 2 000 FCFA/kg (Penja). Goût authentique du Cameroun.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/4022094/pexels-photo-4022094.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // BANANES PLANTAIN
  createPost(
    '🍌 Plantain mûr - Livraison rapide',
    'Régimes de plantain disponibles ! Gros régimes de 15-20 kg. Prix : 2 500 FCFA/régime. Variété locale, goût excellent. Livraison gratuite à partir de 20 régimes.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/2238309/pexels-photo-2238309.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // MANIOC
  createPost(
    '🥔 Manioc frais - Direct champ',
    'Manioc frais récolté ! Tubercules de 2-5 kg, sans fibres. Prix : 150 FCFA/kg. Parfait pour bâton de manioc, gari ou tapioca. Commande minimum : 50 kg.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/6157049/pexels-photo-6157049.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // HARICOTS
  createPost(
    '🫘 Haricots rouges - Nouvelle récolte',
    'Haricots rouges disponibles ! Grains bien formés, sans charançons. Prix : 1 200 FCFA/kg ou 55 000 FCFA/sac de 50 kg. Idéal pour koki et haricot sauce.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // ARACHIDES
  createPost(
    '🥜 Arachides décortiquées - Qualité A',
    'Arachides disponibles ! Bien séchées, sans moisissure. Prix : 1 500 FCFA/kg. Idéal pour huile, pâte d\'arachide ou consommation directe. Stock : 2 tonnes.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/4202466/pexels-photo-4202466.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // ANANAS
  createPost(
    '🍍 Ananas sucrés - Pain de sucre',
    'Ananas Pain de sucre disponibles ! Très sucrés, parfumés. Prix : 500 FCFA/pièce (petit) ou 1 000 FCFA/pièce (gros). Direct producteur de la région Littoral.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/1071878/pexels-photo-1071878.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // PAPAYES
  createPost(
    '🥭 Papayes mûres - Douces et juteuses',
    'Papayes disponibles ! Variété Solo, chair orange, très sucrée. Prix : 300 FCFA/kg. Parfait pour dessert ou jus. Livraison possible dans Yaoundé.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/5945755/pexels-photo-5945755.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // AVOCATS
  createPost(
    '🥑 Avocats de saison - Gros calibre',
    'Avocats disponibles ! Gros calibre, chair crémeuse. Prix : 200 FCFA/pièce ou 1 500 FCFA/kg. Saison en cours, profitez-en ! Stock limité.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/2228553/pexels-photo-2228553.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // CACAO
  createPost(
    '🍫 Cacao fermenté - Qualité export',
    'Fèves de cacao disponibles ! Grade 1, bien fermentées 6 jours, séchées au soleil. Prix : 1 800 FCFA/kg. Minimum : 50 kg. Certification en cours.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/867466/pexels-photo-867466.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // CAFÉ
  createPost(
    '☕ Café Arabica torréfié - Arôme intense',
    'Café Arabica de l\'Ouest ! Torréfié artisanalement, arôme chocolaté. Prix : 5 000 FCFA/kg (torréfié) ou 3 500 FCFA/kg (vert). Qualité exceptionnelle.',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // TRACTEUR
  createPost(
    '🚜 Service labour mécanisé - Tracteur disponible',
    'Tracteur pour labour disponible ! Tarif : 25 000 FCFA/hectare. Travail rapide et professionnel. Régions Centre, Sud et Littoral. Réservez maintenant pour la saison !',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // IRRIGATION
  createPost(
    '💧 Système d\'irrigation - Installation complète',
    'Irrigation goutte-à-goutte disponible ! Kit complet pour 1 hectare : 150 000 FCFA. Économie d\'eau de 60%. Installation et formation incluses. Investissez malin !',
    'agriculture',
    'announcement',
    true,
    'https://images.pexels.com/photos/5231142/pexels-photo-5231142.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // ============================================
  // ÉLEVAGE - Publications avec images internet
  // ============================================

  // POULETS
  createPost(
    '🐔 Poulets de chair - Prêts à vendre',
    'Poulets de chair disponibles ! Poids : 2-2.5 kg. Prix : 3 500 FCFA/kg vif ou 4 500 FCFA/kg abattu. Élevage sain, alimentation de qualité. Commande minimum : 10 poulets.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/1300375/pexels-photo-1300375.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // ŒUFS
  createPost(
    '🥚 Œufs frais du jour - Livraison possible',
    'Œufs frais disponibles ! Prix : 100 FCFA/unité ou 2 800 FCFA/plateau de 30. Poules nourries au maïs, jaune bien coloré. Livraison à domicile à Yaoundé.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // PORCS
  createPost(
    '🐷 Porcs engraissés - Prêts pour abattage',
    'Porcs disponibles ! Poids : 80-100 kg. Prix : 2 000 FCFA/kg vif. Race Large White, bien engraissés. Certificat sanitaire fourni. Livraison possible.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/1300361/pexels-photo-1300361.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // PORCELETS
  createPost(
    '🐖 Porcelets sevrés - Excellente génétique',
    'Porcelets disponibles ! Âge : 2-3 mois. Poids : 15-20 kg. Prix : 35 000 - 45 000 FCFA. Race Large White/Landrace. Vaccinés et vermifugés.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/4910743/pexels-photo-4910743.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // CHÈVRES
  createPost(
    '🐐 Chèvres Djallonké - Race locale rustique',
    'Chèvres disponibles ! Race Djallonké, résistante aux maladies. Femelles : 25 000 FCFA. Mâles reproducteurs : 40 000 FCFA. Idéal pour démarrer un élevage.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // MOUTONS
  createPost(
    '🐑 Moutons pour Tabaski - Réservez maintenant',
    'Moutons disponibles ! Race Djallonké, bien conformés. Prix : 80 000 - 150 000 FCFA selon taille. Réservez dès maintenant pour la Tabaski. Livraison possible.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // VACHES
  createPost(
    '🐄 Vaches laitières - Production garantie',
    'Vaches laitières disponibles ! Race métisse, production 8-12 L/jour. Prix : 450 000 - 600 000 FCFA. Certificat sanitaire fourni. Région Adamaoua.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // TILAPIA
  createPost(
    '🐟 Tilapia frais - Élevage local',
    'Tilapia disponible ! Poids : 300-500g. Prix : 2 000 FCFA/kg. Élevé en bassin, chair ferme et savoureuse. Commande minimum : 10 kg. Livraison possible.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/3640451/pexels-photo-3640451.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // POISSON-CHAT
  createPost(
    '🐟 Poisson-chat (Clarias) - Gros calibre',
    'Poissons-chats disponibles ! Poids : 800g-1.5kg. Prix : 2 500 FCFA/kg. Chair tendre, peu d\'arêtes. Idéal pour braisé ou sauce. Commande minimum : 5 kg.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // ALEVINS
  createPost(
    '🐟 Alevins de tilapia - Démarrez votre élevage',
    'Alevins disponibles ! Tilapia du Nil, taille 3-5 cm. Prix : 50 FCFA/alevin. Minimum : 500 alevins. Croissance rapide : 300g en 6 mois. Formation offerte.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // LAPINS
  createPost(
    '🐰 Lapins reproducteurs - Race locale améliorée',
    'Lapins disponibles ! Race locale améliorée, prolifique. Prix : 8 000 FCFA/lapin. Reproduction rapide : 6-8 petits/portée. Idéal pour viande ou élevage.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/4001296/pexels-photo-4001296.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // CANARDS
  createPost(
    '🦆 Canards de Barbarie - Chair savoureuse',
    'Canards disponibles ! Race Barbarie, poids 3-4 kg. Prix : 6 000 FCFA/canard. Chair maigre et savoureuse. Élevage en plein air. Commande minimum : 5 canards.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/162140/duckling-birds-yellow-background-162140.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // RUCHE / MIEL
  createPost(
    '🍯 Miel pur du Cameroun - Récolte artisanale',
    'Miel naturel disponible ! Miel de forêt, non chauffé. Prix : 4 000 FCFA/litre. Bienfaits santé garantis. Ruches disponibles aussi : 25 000 FCFA/ruche.',
    'elevage',
    'announcement',
    true,
    'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=800'
  );

  // ============================================
  // CONSEILS ET ALERTES (sans images)
  // ============================================

  createPost(
    '⚠️ Alerte : Peste porcine africaine',
    'Cas signalés dans la région de l\'Est ! Mesures urgentes : Isolez vos porcs, désinfectez, ne transportez pas d\'animaux. Mortalité 100%. Signalez tout cas suspect !',
    'elevage',
    'warning'
  );

  createPost(
    '💡 Astuce : Conservation des œufs',
    'Conservez vos œufs 3 semaines sans frigo ! Enduisez-les d\'huile végétale et stockez pointe vers le bas dans un endroit frais et sombre. Testez dans l\'eau avant usage.',
    'elevage',
    'tip'
  );

  createPost(
    '💡 Astuce : Abreuvoirs propres',
    'Nettoyez et désinfectez les abreuvoirs tous les 2 jours, remplacez l\'eau quotidiennement pour limiter les maladies digestives.',
    'elevage',
    'tip'
  );

  createPost(
    '💡 Astuce : Complémentation en saison sèche',
    'Apportez des blocs multinutritionnels, du foin et des sous-produits agro (son, tourteaux). Assurez un abreuvement 2x/jour pour maintenir le poids.',
    'elevage',
    'tip'
  );

  createPost(
    '💡 Astuce : Vermifugation pratique',
    'Vermifugez les jeunes animaux tous les 3 mois. Alternez les molécules et pesez pour une dose précise. Déparasitez avant la saison des pluies.',
    'elevage',
    'tip'
  );

  createPost(
    '📊 Prix du marché - Douala cette semaine',
    'Poulet vif : 3 500 FCFA/kg. Œufs : 100 FCFA/unité. Porc vif : 2 000 FCFA/kg. Poisson frais : 2 500 FCFA/kg. Tendance stable. Bon moment pour vendre !',
    'elevage',
    'announcement'
  );

  createPost(
    '⚠️ Alerte : Chenilles légionnaires dans l\'Ouest',
    'Invasion signalée ! Les chenilles attaquent maïs et sorgho. Inspectez vos champs chaque matin. Traitement bio : Bacillus thuringiensis. Agissez vite !',
    'agriculture',
    'warning'
  );

  createPost(
    '💡 Astuce : Engrais naturel gratuit',
    'Faites votre compost ! Mélangez : déchets de cuisine + feuilles mortes + fumier. Retournez chaque semaine. Prêt en 2-3 mois. Économisez 50 000 FCFA/hectare !',
    'agriculture',
    'tip'
  );

  createPost(
    '💡 Astuce : Paillage pour économiser l\'eau',
    'Couvrez le sol avec paille ou feuilles sèches : conserve l\'humidité, limite les mauvaises herbes et améliore la structure du sol.',
    'agriculture',
    'tip'
  );

  createPost(
    '💡 Astuce : Association maïs-haricot',
    'Semez 2 grains de maïs par poquet puis 1-2 graines de haricot 10 jours après : fixation d\'azote et meilleur rendement global.',
    'agriculture',
    'tip'
  );

  createPost(
    '💡 Astuce : Traitement bio contre les pucerons',
    'Pulvérisez une solution de savon noir (10 ml/L) et ail pilé tôt le matin. Répétez 2-3 fois à 5 jours d\'intervalle.',
    'agriculture',
    'tip'
  );

  createPost(
    '💡 Astuce : Conservation du manioc',
    'Pour le bâton de manioc : éplucher, tremper 3-4 jours, fermenter, presser et sécher au soleil pour un stockage prolongé.',
    'agriculture',
    'tip'
  );

  createPost(
    '📊 Prix du marché agricole - Yaoundé',
    'Tomate : 800 FCFA/kg. Oignon : 600 FCFA/kg. Plantain : 2 500 FCFA/régime. Maïs : 250 FCFA/kg. Manioc : 150 FCFA/kg. Tendance : hausse sur les légumes.',
    'agriculture',
    'announcement'
  );

  createPost(
    '📣 Annonce : Distribution de semences certifiées – Ouest',
    'Points de distribution à Bafoussam et Dschang cette semaine. Pièce d’identité et carte de producteur requises.',
    'agriculture',
    'announcement'
  );
  createPost(
    '📣 Annonce : Formation CEP – Fertilité des sols',
    'Session pratique sur compost, paillage et rotation. Inscription gratuite via la délégation départementale.',
    'agriculture',
    'announcement'
  );
  createPost(
    '📣 Annonce : Journée de démonstration – Paillage',
    'Démonstration de techniques de paillage et économie d’eau. Lieu: Edéa, samedi 15h.',
    'agriculture',
    'announcement'
  );

  createPost(
    '📣 Annonce : Vaccination Newcastle – Littoral',
    'Campagne gratuite auprès des petits élevages. Apportez vos sujets entre 8h et 12h, carnet d’élevage recommandé.',
    'elevage',
    'announcement'
  );
  createPost(
    '📣 Annonce : Formation hygiène avicole – Centre',
    'Biosécurité, pédiluves, désinfection et gestion des déchets. Attestation en fin de session.',
    'elevage',
    'announcement'
  );
  createPost(
    '📣 Annonce : Distribution de vaccins LANAVET – Nord',
    'Vaccins Newcastle et PPR disponibles dans les points agréés. Présenter un justificatif d’élevage.',
    'elevage',
    'announcement'
  );

  // Astuces supplémentaires (élevage)
  createPost(
    '💡 Astuce : Ventilation du poulailler',
    "Assurez un flux d'air croisé, densité <10 sujets/m2 en saison chaude, eau fraîche disponible pour limiter le stress thermique.",
    'elevage',
    'tip'
  );
  createPost(
    '💡 Astuce : Minéraux pour ruminants',
    'Mettre à disposition des pierres à lécher riches en sel et oligo-éléments; favorise ingestion et reproduction.',
    'elevage',
    'tip'
  );
  createPost(
    '💡 Astuce : Hygiène des mangeoires',
    'Retirer les refus chaque soir, laver les mangeoires 2-3 fois/semaine pour limiter les colibacilloses.',
    'elevage',
    'tip'
  );

  // Astuces supplémentaires (agriculture)
  createPost(
    '💡 Astuce : Rotation culturale 1/3',
    'Alternez céréales - légumineuses - tubercules pour casser les cycles de ravageurs et améliorer la fertilité.',
    'agriculture',
    'tip'
  );
  createPost(
    '💡 Astuce : Semis en poquet',
    'Semer en poquets de 2-3 graines et éclaircir après levée pour une meilleure vigueur et un espacement régulier.',
    'agriculture',
    'tip'
  );
  createPost(
    '💡 Astuce : Pièges jaunes contre aleurodes',
    'Installer des plaquettes jaunes engluées en bordure de parcelle pour réduire la pression des aleurodes.',
    'agriculture',
    'tip'
  );

  // Annonces supplémentaires
  createPost(
    "📣 Annonce : Achat groupé d'intrants",
    "Organisation d'un groupage pour NPK 15-15-15 et urée, réductions jusqu'à 12%. Inscriptions avant vendredi.",
    'agriculture',
    'announcement'
  );
  createPost(
    '📣 Annonce : Bourse de foin – Adamaoua',
    'Lot de foin de Brachiaria, bottes 20 kg disponibles, remise sur quantités. Transport négociable.',
    'elevage',
    'announcement'
  );

  // Alertes supplémentaires
  createPost(
    "⚠️ Alerte : Brûlures de soleil sur bananier",
    "Installer des ombrières temporaires pour jeunes plants; éviter une défoliation excessive lors de l'entretien.",
    'agriculture',
    'warning'
  );
  createPost(
    '⚠️ Alerte : Coccidiose en aviculture',
    'Diarrhées sanglantes chez les jeunes; hygiène des litières, anticoccidiens via eau de boisson, isolement des sujets.',
    'elevage',
    'warning'
  );

  // Shuffle posts
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return shuffleArray(posts);
};
