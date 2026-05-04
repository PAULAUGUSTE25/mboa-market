// Demo listings - Clean slate ready for new publications
export const generateDemoListings = () => {
  const names = [
    'Ibrahim', 'Amadou', 'Marie', 'Sophie', 'Hassan', 'Jean', 'Paul', 'André',
    'Fatima', 'Aissatou', 'Mamadou', 'Aminata', 'Ousmane', 'Mariama', 'Abdoulaye',
    'Fatoumata', 'Moussa', 'Awa', 'Boubacar', 'Hawa', 'Seydou', 'Kadiatou',
    'Cheikh', 'Mariam', 'Alioune', 'Bintou', 'Modou', 'Coumba', 'Lamine', 'Ndeye'
  ];
  
  const regions = [
    'Centre', 'Littoral', 'Ouest', 'Nord', 'Adamaoua', 'Est', 'Sud', 'Nord-Ouest', 'Sud-Ouest', 'Extrême-Nord'
  ];
  
  const localities = [
    'Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 
    'Bamenda', 'Buea', 'Maroua', 'Dschang', 'Kribi', 'Limbe', 'Kumba', 'Ndop', 'Yagoua', 'Santchou'
  ];

  const listings: any[] = [];
  let id = 1;

  // Helper function to generate listing
  const createListing = (product: string, image: string, priceRange: [number, number], unit: string = 'kg', domain: 'agriculture' | 'elevage' = 'agriculture') => {
    const type = id % 3 ===                           0 ? 'VENTE' : id % 3 === 1 ? 'ACHAT' : 'FOURNITURE';
    const listing = {
      id: `demo-${id++}`,
      seller_id: `user-${id}`,
      category_id: domain,
      title: `${type}: ${product}`,
      variety: type === 'FOURNITURE' ? 'Semences certifiées' : 'Qualité premium',
      quantity: Math.floor(Math.random() * 500) + 50,
      unit: unit,
      price_per_unit: Math.floor(Math.random() * (priceRange[1] - priceRange[0])) + priceRange[0],
      currency: 'XAF',
      region: regions[Math.floor(Math.random() * regions.length)],
      locality: localities[Math.floor(Math.random() * localities.length)],
      status: 'PUBLISHED',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      seller: {
        profile: {
          display_name: names[Math.floor(Math.random() * names.length)] + ' ' + (type === 'ACHAT' ? 'Acheteur' : type === 'FOURNITURE' ? 'Fournisseur' : 'Producteur'),
          activity_type: type === 'ACHAT' ? 'buyer' : type === 'FOURNITURE' ? 'seed_provider' : 'producer',
          domain: domain
        }
      },
      images: [image]
    };
    listings.push(listing);
  };

  // Helper function for institutional listings (MINRESI, IRAD, MINADER)
  const createInstitutionalListing = (institution: string, product: string, image: string, priceRange: [number, number], unit: string = 'kg', domain: 'agriculture' | 'elevage' = 'agriculture') => {
    const listing = {
      id: `demo-${id++}`,
      seller_id: `institution-${id}`,
      category_id: domain,
      title: `${institution}: ${product}`,
      variety: 'Programme institutionnel',
      quantity: Math.floor(Math.random() * 1000) + 100,
      unit: unit,
      price_per_unit: Math.floor(Math.random() * (priceRange[1] - priceRange[0])) + priceRange[0],
      currency: 'XAF',
      region: 'Centre',
      locality: 'Yaoundé',
      status: 'PUBLISHED',
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      seller: {
        profile: {
          display_name: institution,
          activity_type: 'seed_provider',
          domain: domain
        }
      },
      images: [image]
    };
    listings.push(listing);
  };

  // === PUBLICATIONS AGRICULTURE ===
  createListing('Cacao - Fèves séchées', '/images/agriculture/01-cacao.png', [800, 1500]);
  createListing('Café Arabica de qualité', '/images/agriculture/02-cafe-arabica.png', [2000, 4000]);
  createListing('Café Robusta sélectionné', '/images/agriculture/03-cafe-robusta.png', [1500, 3000]);
  createListing('Cacao de Mr Etoga - 750kg disponible', '/images/agriculture/cacao_de_mr_etoga_750kg_dispo.jpg', [1000, 1500]);
  createListing('Café sélectionné - Qualité premium', '/images/agriculture/cafe_selectioné.jpg', [2500, 4500]);
  createListing('Café de Tolé - Production locale', '/images/agriculture/cafe_de_tolé.jpg', [2000, 4000]);
  createListing('Arrivage de 4 tonnes de Macabo', '/images/agriculture/arivage_de_4_tone_de_macabo.jpg', [600, 1200]);
  createListing('Bonne qualité de Macabo', '/images/agriculture/bonne_qualite_de_macabo.jpg', [500, 1000]);
  createListing('Macabo frais - Récolte du jour', '/images/agriculture/macabo-fresh.png', [500, 1200]);
  createListing('Bon Manioc - Tubercules frais', '/images/agriculture/bonmanioc.jpg', [250, 600]);
  createListing('Manioc frais - Qualité supérieure', '/images/agriculture/manioc-fresh.png', [200, 600]);
  createListing('Arrivage Patate - Fraîche', '/images/agriculture/ariivage_patate.jpg', [300, 700]);
  createListing('Pomme de Tonga - Fraîche', '/images/agriculture/pomme_de_tonga.jpg', [200, 500]);
  createListing('Arrivage Plantain', '/images/agriculture/arivage_plat.jpg', [400, 900], 'régime');
  createListing('Plantain mûr - Prêt à consommer', '/images/agriculture/plantain_mur.jpg', [450, 950], 'régime');
  createListing('Plantain vert - Régime complet', '/images/agriculture/plantain-fresh.png', [300, 800], 'régime');
  createListing('Banane plantain - Qualité export', '/images/agriculture/banane_cochon.jpg', [400, 850], 'régime');
  createListing('Tomate de haute qualité', '/images/agriculture/tomate_de_haute_qualite.jpg', [400, 900]);
  createListing('Laitue sélectionnée - Bio', '/images/agriculture/letu_selectioné.jpg', [300, 700]);
  createListing('Igname de Batibo - Grande taille', '/images/agriculture/yam_for_batibo.jpg', [500, 1200]);
  createListing('Cotton de la SODECOTON', '/images/agriculture/cotton_de_la_sodecoton.jpg', [350, 800]);
  createListing('Champ de Maïs - Récolte abondante', '/images/backgrounds/champs_de_maise.jpg', [200, 450]);

  // === PUBLICATIONS ÉLEVAGE ===
  createListing('Porc femelle sans graisse', '/images/livestock/porc_female_sans_graisse.jpg', [85000, 170000], 'tête', 'elevage');
  createListing('Porc long châssis', '/images/livestock/pourc_long_chassi.jpg', [95000, 190000], 'tête', 'elevage');
  createListing('Porcelet race sélectionnée', '/images/livestock/porcelet_race_selectioné.jpg', [30000, 70000], 'tête', 'elevage');
  createListing('Porcelet à vendre', '/images/livestock/porcellet_a_vendre.jpg', [25000, 65000], 'tête', 'elevage');
  createListing('Porcs adultes - Prêts pour la vente', '/images/livestock/porc.jpg', [80000, 150000], 'tête', 'elevage');
  createListing('Poulet de chair 35 jours - Ferme Ndefo', '/images/livestock/poulet_35_jour_ferme_ndefo.jpg', [3000, 6000], 'tête', 'elevage');
  createListing('Poulet de chair 35 jours', '/images/livestock/poulet_de_chaire_35_jour.jpg', [2800, 5500], 'tête', 'elevage');
  createListing('Poulets - Prêts à vendre', '/images/livestock/poulet-chair.png', [2500, 5000], 'tête', 'elevage');
  createListing('Poussin 21 jours - Vente', '/images/livestock/vente_pousin_21_jour.jpg', [1500, 3000], 'tête', 'elevage');
  createListing('Coq de ferme - Reproducteur', '/images/livestock/coq_de_ferme.jpg', [5000, 10000], 'tête', 'elevage');
  createListing('Chèvre de Bazou', '/images/livestock/chevre_de_bazou.jpg', [35000, 80000], 'tête', 'elevage');
  createListing('Chèvre de l\'Ouest - Race locale', '/images/livestock/chevre_de_louest.jpg', [40000, 85000], 'tête', 'elevage');
  createListing('Chèvres adultes - Bonne santé', '/images/livestock/chevre.png', [30000, 75000], 'tête', 'elevage');
  createListing('Lapin de chair à vendre', '/images/livestock/lapin_de_chaire_a_vendre.jpg', [8000, 16000], 'tête', 'elevage');
  createListing('Lapin de race Albinos', '/images/livestock/lapin_de_race_albinous.jpg', [10000, 20000], 'tête', 'elevage');
  createListing('Carpe grise de la Bénoué', '/images/livestock/carpe_grise_de_la_benue.jpg', [2500, 5000], 'kg', 'elevage');
  createListing('Carpe rouge du lac', '/images/livestock/carpe_rouge_du_lack.jpg', [3000, 6000], 'kg', 'elevage');
  createListing('Bars frais Kribi', '/images/livestock/bars_frais_kribi.jpg', [3500, 7000], 'kg', 'elevage');
  createListing('Bars bossu Kribi', '/images/livestock/bars_bossu_kribi.jpg', [3200, 6500], 'kg', 'elevage');
  createListing('Poisson frais - Pêche du jour', '/images/livestock/pioson_frais.jpg', [2000, 4500], 'kg', 'elevage');
  createListing('Alevins - Poisson-chat', '/images/livestock/alevin_status_pous_lutilisatueur_quand_cest_elevage.jpg', [50, 250], 'unité', 'elevage');

  // === PUBLICATIONS INSTITUTIONNELLES ===
  createInstitutionalListing('NDAWARA TEA', 'Champ de thé Ndawara - Production locale', '/images/backgrounds/champ_de_ndawara_tea.jpg', [1500, 3000], 'kg');
  createInstitutionalListing('SODECOTON', 'Cotton de la SODECOTON - Production certifiée', '/images/agriculture/cotton_de_la_sodecoton.jpg', [350, 800], 'kg');

  // === NOUVELLES PUBLICATIONS (images Unsplash) ===
  // Légumes frais
  createListing('Tomates fraîches - Récolte du jour', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800', [300, 800]);
  createListing('Oignons rouges - Qualité premium', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800', [200, 500]);
  createListing('Piments frais - Variété locale', 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800', [400, 900]);
  createListing('Aubergines violettes - Bio', 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=800', [250, 600]);
  createListing('Poivrons verts - Croquants', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800', [350, 750]);

  // Fruits
  createListing('Mangues mûres - Variété Kent', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800', [200, 500]);
  createListing('Papayes fraîches - Sucrées', 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800', [150, 400]);
  createListing('Ananas Victoria - Juteux', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=800', [500, 1200]);
  createListing('Oranges - Agrumes frais', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800', [200, 450]);

  // Tubercules
  createListing('Ignames - Récolte récente', 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=800', [400, 900]);
  createListing('Patates douces - Variété orange', 'https://images.unsplash.com/photo-1596910547037-0e3e2e1f6e0e?w=800', [250, 550]);

  // Céréales
  createListing('Maïs grain - Grande quantité', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800', [150, 400]);
  createListing('Riz local - Sac 50kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', [18000, 25000], 'sac');

  // Élevage - Bovins
  createListing('Vaches laitières - Race améliorée', 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=800', [350000, 800000], 'tête', 'elevage');
  createListing('Bœufs de labour - Dressés', 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800', [400000, 900000], 'tête', 'elevage');
  createListing('Veaux - 6 mois', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800', [150000, 300000], 'tête', 'elevage');

  // Élevage - Volaille
  createListing('Poules pondeuses - Production active', 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=800', [3500, 7000], 'tête', 'elevage');
  createListing('Canards - Élevage fermier', 'https://images.unsplash.com/photo-1459682687441-7761439a709d?w=800', [4000, 8000], 'tête', 'elevage');
  createListing('Œufs frais - Plateau de 30', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800', [2500, 4000], 'plateau', 'elevage');

  // Élevage - Moutons
  createListing('Moutons - Race locale', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800', [40000, 90000], 'tête', 'elevage');
  createListing('Cabri - 3 mois', 'https://images.unsplash.com/photo-1533318087102-b3ad366ed041?w=800', [20000, 45000], 'tête', 'elevage');

  // Pisciculture
  createListing('Tilapia frais - Élevage local', 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800', [2000, 4000], 'kg', 'elevage');
  createListing('Lapins - Élevage familial', 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800', [8000, 15000], 'tête', 'elevage');

  // Shuffle listings to randomize order
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return shuffleArray(listings);
};
