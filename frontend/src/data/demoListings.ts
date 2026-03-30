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

  // === ANCIENNES PUBLICATIONS (images locales) ===
  createListing('Cacao - Fèves séchées', '/images/products/01-cacao.png', [800, 1500]);
  createListing('Café Arabica', '/images/products/02-cafe-arabica.png', [2000, 4000]);
  createListing('Café Robusta', '/images/products/03-cafe-robusta.png', [1500, 3000]);
  createListing('Coton - Balles', '/images/products/04-coton.png', [300, 800]);
  createListing('Canne à sucre', '/images/products/05-canne-sucre.png', [150, 400]);
  createListing('Thé - Feuilles', '/images/products/06-the.png', [800, 1500]);
  createListing('Hévéa - Latex', '/images/products/07-hevea.png', [400, 900]);
  createListing('Macabo frais - Récolte du jour', '/macabo-fresh.png', [500, 1200]);
  createListing('Plantain vert - Régime complet', '/plantain-fresh.png', [300, 800], 'régime');
  createListing('Manioc frais - Tubercules de qualité', '/manioc-fresh.png', [200, 600]);
  createListing('Houe traditionnelle (Daba) - Qualité artisanale', '/houe.png', [3000, 8000], 'pièce');
  createListing('Arrosoir traditionnel - Capacité 10L', '/arosoire.png', [2000, 5000], 'pièce');
  createListing('Tracteur agricole moderne - Avec charrue', '/tacteur.png', [15000000, 35000000], 'unité');
  createListing('Porcelets de qualité - Race améliorée', '/porc.png', [25000, 80000], 'tête', 'elevage');
  createListing('Porcs adultes - Prêts pour la vente', '/pig-farm.png', [80000, 150000], 'tête', 'elevage');
  createListing('Porcs de race - Élevage commercial', '/porc-race.png', [90000, 180000], 'tête', 'elevage');
  createListing('Poulets de chair - Prêts pour la vente', '/poulet-chair.png', [2500, 5000], 'tête', 'elevage');
  createListing('Chèvres adultes - Bonne santé', '/chevre.png', [30000, 75000], 'tête', 'elevage');
  createListing('Chèvres de race - Cornes recourbées', '/chevre-race.png', [40000, 90000], 'tête', 'elevage');
  createListing('Alevins de poisson-chat - Qualité supérieure', '/poisson-chat.png', [50, 200], 'unité', 'elevage');
  createListing('Aliment pour poissons Bluecrown - Sac 25kg', '/aliment-poisson.png', [15000, 35000], 'sac', 'elevage');
  createListing('Bac pisciculture en bâche - 2m x 1m', '/bac-pisciculture.png', [80000, 200000], 'unité', 'elevage');
  createListing('Bac pisciculture circulaire - Diamètre 2m', '/bac-rond-pisciculture.png', [100000, 250000], 'unité', 'elevage');

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
