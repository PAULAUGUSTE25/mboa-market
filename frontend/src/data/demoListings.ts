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
    const type = id % 3 === 0 ? 'VENTE' : id % 3 === 1 ? 'ACHAT' : 'FOURNITURE';
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

  // === CULTURES DE RENTE - 7 PUBLICATIONS ===
  createListing('Cacao - Fèves séchées', '/images/products/01-cacao.png', [800, 1500]);
  createListing('Café Arabica', '/images/products/02-cafe-arabica.png', [2000, 4000]);
  createListing('Café Robusta', '/images/products/03-cafe-robusta.png', [1500, 3000]);
  createListing('Coton - Balles', '/images/products/04-coton.png', [300, 800]);
  createListing('Canne à sucre', '/images/products/05-canne-sucre.png', [150, 400]);
  createListing('Thé - Feuilles', '/images/products/06-the.png', [800, 1500]);
  createListing('Hévéa - Latex', '/images/products/07-hevea.png', [400, 900]);

  // === TUBERCULES - MACABO ===
  createListing('Macabo frais - Récolte du jour', '/macabo-fresh.png', [500, 1200]);

  // === FRUITS - PLANTAIN ===
  createListing('Plantain vert - Régime complet', '/plantain-fresh.png', [300, 800], 'régime');

  // === TUBERCULES - MANIOC ===
  createListing('Manioc frais - Tubercules de qualité', '/manioc-fresh.png', [200, 600]);

  // === OUTILS AGRICOLES - HOUE ===
  createListing('Houe traditionnelle (Daba) - Qualité artisanale', '/houe.png', [3000, 8000], 'pièce');

  // === OUTILS AGRICOLES - ARROSOIR ===
  createListing('Arrosoir traditionnel - Capacité 10L', '/arosoire.png', [2000, 5000], 'pièce');

  // === ÉQUIPEMENT AGRICOLE - TRACTEUR ===
  createListing('Tracteur agricole moderne - Avec charrue', '/tacteur.png', [15000000, 35000000], 'unité');

  // === ÉLEVAGE - PORCS ===
  createListing('Porcelets de qualité - Race améliorée', '/porc.png', [25000, 80000], 'tête', 'elevage');
  createListing('Porcs adultes - Prêts pour la vente', '/pig-farm.png', [80000, 150000], 'tête', 'elevage');
  createListing('Porcs de race - Élevage commercial', '/porc-race.png', [90000, 180000], 'tête', 'elevage');

  // === ÉLEVAGE - VOLAILLE ===
  createListing('Poulets de chair - Prêts pour la vente', '/poulet-chair.png', [2500, 5000], 'tête', 'elevage');

  // === ÉLEVAGE - CHÈVRES ===
  createListing('Chèvres adultes - Bonne santé', '/chevre.png', [30000, 75000], 'tête', 'elevage');
  createListing('Chèvres de race - Cornes recourbées', '/chevre-race.png', [40000, 90000], 'tête', 'elevage');

  // === ÉLEVAGE - POISSONS ===
  createListing('Alevins de poisson-chat - Qualité supérieure', '/poisson-chat.png', [50, 200], 'unité', 'elevage');

  // === FOURNITURES ÉLEVAGE - ALIMENTS ===
  createListing('Aliment pour poissons Bluecrown - Sac 25kg', '/aliment-poisson.png', [15000, 35000], 'sac', 'elevage');

  // === ÉQUIPEMENT PISCICULTURE - BAC ===
  createListing('Bac pisciculture en bâche - 2m x 1m', '/bac-pisciculture.png', [80000, 200000], 'unité', 'elevage');
  createListing('Bac pisciculture circulaire - Diamètre 2m', '/bac-rond-pisciculture.png', [100000, 250000], 'unité', 'elevage');

  // === DEMANDES CLIENTS AGRICULTURE (ACHAT) ===
  // These will automatically be ACHAT type based on id % 3 === 1
  createListing('Tomates fraîches - Demande urgente', '/images/products/01-cacao.png', [300, 800]);
  createListing('Maïs grain - Grande quantité', '/images/products/02-cafe-arabica.png', [150, 400]);
  createListing('Oignons - Qualité export', '/images/products/03-cafe-robusta.png', [200, 600]);
  
  // === DEMANDES CLIENTS ÉLEVAGE (ACHAT) ===
  createListing('Poulets vivants - Commande restaurant', '/poulet-chair.png', [2500, 5000], 'tête', 'elevage');
  createListing('Œufs frais - Livraison hebdomadaire', '/porc.png', [100, 300], 'plateau', 'elevage');
  createListing('Chèvres pour fête - Besoin 10 têtes', '/chevre.png', [30000, 75000], 'tête', 'elevage');

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
