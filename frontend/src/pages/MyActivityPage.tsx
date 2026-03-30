import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import { getCardStyles, getTextStyles, getButtonStyles } from '@/utils/cardStyles';
import { Package, Plus, Edit, Trash2, Eye, Lightbulb, PackageSearch, Sprout, ShoppingCart, TrendingUp } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';

interface Listing {
  id: string;
  title: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  region: string;
  status: string;
  created_at: string;
  images?: string[];
}

export default function MyActivityPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  
  // Dynamic text classes based on theme
  const textTitle = theme === 'light' ? 'text-gray-900' : '${textTitle}';
  const textBody = theme === 'light' ? 'text-gray-700' : '${textBody}';
  const textMuted = theme === 'light' ? 'text-gray-500' : '${textMuted}';
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [supplierListings, setSupplierListings] = useState<Listing[]>([]);
  const [clientRequests, setClientRequests] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'advice-next' | 'advice-current' | 'suppliers' | 'requests' | 'my-listings'>('advice-next');
  // Get crop from user profile (default to Tomate if not set)
  const selectedCrop = (user?.profile as any)?.crop || 'Tomate';

  // Comprehensive crop-specific advice data for Cameroon
  const cropAdviceData: Record<string, any> = {
    'Tomate': {
      regions: ['Ouest', 'Nord-Ouest', 'Littoral'],
      soil: {
        prep: 'Labour profond 25-30cm avec billonnage',
        organic: '15-20 tonnes/ha de fumier bien décomposé',
        ph: '6.0-6.8',
        drainage: 'Excellent drainage requis - éviter sols argileux lourds'
      },
      seeds: {
        varieties: 'Variétés F1 hybrides: Roma VF, Mongal F1, Padma',
        germination: '90-95%',
        treatment: 'Traitement à l\'eau chaude (50°C, 25min) contre bactériose',
        density: '25,000-30,000 plants/ha'
      },
      climate: {
        temp: '18-27°C (optimal 20-25°C)',
        rainfall: '600-1000mm bien répartis',
        sunlight: '8-10h/jour minimum',
        humidity: '60-70% - éviter >80% (maladies fongiques)'
      },
      calendar: {
        planting: 'Mars-Avril (Ouest) | Octobre-Novembre (Littoral)',
        spacing: '80cm entre rangs x 40cm entre plants',
        cycle: '90-110 jours selon variété',
        harvest: 'Récolte échelonnée sur 2-3 mois'
      },
      budget: {
        seeds: 35000,
        fertilizer: 65000,
        labor: 85000,
        total: 185000,
        yield: '25-40 tonnes/ha',
        revenue: '500,000-800,000 FCFA/ha'
      }
    },
    'Maïs': {
      regions: ['Ouest', 'Centre', 'Adamaoua', 'Nord-Ouest'],
      soil: {
        prep: 'Labour 15-20cm, hersage et nivellement',
        organic: '5-10 tonnes/ha de compost ou fumier',
        ph: '5.5-7.0',
        drainage: 'Bon drainage - tolère sols variés'
      },
      seeds: {
        varieties: 'CMS 8704, Kassai, ATP Y2000 (variétés améliorées)',
        germination: '85-90%',
        treatment: 'Traitement insecticide + fongicide (Apron Star)',
        density: '50,000-62,500 plants/ha'
      },
      climate: {
        temp: '20-30°C',
        rainfall: '500-800mm sur cycle cultural',
        sunlight: '6-8h/jour',
        humidity: '50-70%'
      },
      calendar: {
        planting: 'Mars-Avril (1ère saison) | Août-Sept (2ème saison)',
        spacing: '80cm entre rangs x 25cm entre poquets',
        cycle: '90-120 jours',
        harvest: 'Récolte quand grains à 25% humidité'
      },
      budget: {
        seeds: 28000,
        fertilizer: 55000,
        labor: 45000,
        total: 128000,
        yield: '3-5 tonnes/ha',
        revenue: '300,000-500,000 FCFA/ha'
      }
    },
    'Manioc': {
      regions: ['Centre', 'Sud', 'Est', 'Littoral', 'Sud-Ouest'],
      soil: {
        prep: 'Labour léger 10-15cm, buttage recommandé',
        organic: '5 tonnes/ha de compost',
        ph: '5.0-6.5',
        drainage: 'Drainage modéré - tolère sols pauvres'
      },
      seeds: {
        varieties: '8034, 8017, TMS (boutures saines)',
        germination: 'Boutures de 20-25cm, 5-8 nœuds',
        treatment: 'Trempage boutures 10min dans solution insecticide',
        density: '10,000 boutures/ha'
      },
      climate: {
        temp: '25-29°C',
        rainfall: '1000-1500mm/an',
        sunlight: '6-8h/jour',
        humidity: '70-80%'
      },
      calendar: {
        planting: 'Début saison des pluies (Mars-Avril)',
        spacing: '1m x 1m',
        cycle: '10-12 mois (variétés précoces) | 18-24 mois (tardives)',
        harvest: 'Récolte progressive selon besoins'
      },
      budget: {
        seeds: 15000,
        fertilizer: 25000,
        labor: 55000,
        total: 95000,
        yield: '15-25 tonnes/ha',
        revenue: '200,000-350,000 FCFA/ha'
      }
    },
    'Haricot': {
      regions: ['Ouest', 'Nord-Ouest', 'Adamaoua'],
      soil: {
        prep: 'Labour 20cm, affinage du sol',
        organic: '10 tonnes/ha de fumier décomposé',
        ph: '6.0-7.0',
        drainage: 'Excellent drainage obligatoire'
      },
      seeds: {
        varieties: 'Nain: Contender, Rognon | Grimpant: Kentucky Wonder',
        germination: '80-90%',
        treatment: 'Inoculation rhizobium pour fixation azote',
        density: '200,000-250,000 plants/ha (nain)'
      },
      climate: {
        temp: '15-25°C',
        rainfall: '400-600mm bien répartis',
        sunlight: '6-8h/jour',
        humidity: '60-70%'
      },
      calendar: {
        planting: 'Mars-Avril | Septembre-Octobre',
        spacing: '50cm x 10cm (nain) | 1m x 30cm (grimpant)',
        cycle: '60-75 jours (nain) | 90-110 jours (grimpant)',
        harvest: 'Récolte échelonnée tous les 3-4 jours'
      },
      budget: {
        seeds: 45000,
        fertilizer: 35000,
        labor: 65000,
        total: 145000,
        yield: '1.5-2.5 tonnes/ha',
        revenue: '400,000-650,000 FCFA/ha'
      }
    },
    'Arachide': {
      regions: ['Nord', 'Extrême-Nord', 'Adamaoua', 'Centre'],
      soil: {
        prep: 'Labour 15-20cm, sol meuble et aéré',
        organic: '5-8 tonnes/ha de fumier',
        ph: '5.5-6.5',
        drainage: 'Bon drainage - sols sablo-argileux idéaux'
      },
      seeds: {
        varieties: 'GH 119-20, Fleur 11, 28-206 (résistantes rosette)',
        germination: '85-95%',
        treatment: 'Traitement fongicide (Thirame)',
        density: '120,000-150,000 plants/ha'
      },
      climate: {
        temp: '25-30°C',
        rainfall: '500-700mm sur cycle',
        sunlight: '7-9h/jour',
        humidity: '50-60%'
      },
      calendar: {
        planting: 'Mai-Juin (début hivernage)',
        spacing: '40cm x 15cm',
        cycle: '90-120 jours',
        harvest: 'Arrachage quand feuilles jaunissent'
      },
      budget: {
        seeds: 32000,
        fertilizer: 42000,
        labor: 58000,
        total: 132000,
        yield: '1.5-2.5 tonnes/ha (coques)',
        revenue: '350,000-600,000 FCFA/ha'
      }
    },
    'Piment': {
      regions: ['Ouest', 'Nord-Ouest', 'Littoral', 'Sud-Ouest'],
      soil: {
        prep: 'Labour profond 25cm avec billonnage',
        organic: '20-25 tonnes/ha de fumier bien décomposé',
        ph: '6.0-7.0',
        drainage: 'Excellent drainage - sols riches en humus'
      },
      seeds: {
        varieties: 'Cayenne, Habanero, Piment oiseau local',
        germination: '70-85%',
        treatment: 'Trempage 12h + traitement fongicide',
        density: '30,000-40,000 plants/ha'
      },
      climate: {
        temp: '20-28°C',
        rainfall: '600-1000mm',
        sunlight: '8-10h/jour',
        humidity: '60-75%'
      },
      calendar: {
        planting: 'Mars-Avril (Ouest) | Toute année (Littoral avec irrigation)',
        spacing: '60cm x 40cm',
        cycle: '90-120 jours première récolte',
        harvest: 'Récoltes multiples sur 6-8 mois'
      },
      budget: {
        seeds: 38000,
        fertilizer: 58000,
        labor: 75000,
        total: 171000,
        yield: '8-15 tonnes/ha',
        revenue: '600,000-1,200,000 FCFA/ha'
      }
    },
    'Gombo': {
      regions: ['Nord', 'Extrême-Nord', 'Adamaoua', 'Centre'],
      soil: {
        prep: 'Labour 15-20cm, sol bien ameubli',
        organic: '10-15 tonnes/ha de fumier',
        ph: '6.0-7.5',
        drainage: 'Bon drainage - tolère chaleur'
      },
      seeds: {
        varieties: 'Clemson Spineless, Puso Makiling',
        germination: '75-85%',
        treatment: 'Trempage 24h eau tiède avant semis',
        density: '40,000-50,000 plants/ha'
      },
      climate: {
        temp: '25-35°C (tolère forte chaleur)',
        rainfall: '500-800mm',
        sunlight: '8-10h/jour',
        humidity: '50-70%'
      },
      calendar: {
        planting: 'Avril-Mai (début pluies)',
        spacing: '60cm x 30cm',
        cycle: '50-60 jours première récolte',
        harvest: 'Récolte tous les 2-3 jours pendant 2-3 mois'
      },
      budget: {
        seeds: 22000,
        fertilizer: 38000,
        labor: 52000,
        total: 112000,
        yield: '10-15 tonnes/ha',
        revenue: '300,000-500,000 FCFA/ha'
      }
    },
    'Aubergine': {
      regions: ['Ouest', 'Littoral', 'Centre', 'Sud-Ouest'],
      soil: {
        prep: 'Labour profond 25-30cm avec billons',
        organic: '15-20 tonnes/ha de compost',
        ph: '5.5-6.8',
        drainage: 'Excellent drainage - sols riches'
      },
      seeds: {
        varieties: 'Black Beauty, Violette de Barbentane, Locale',
        germination: '80-90%',
        treatment: 'Traitement fongicide semences',
        density: '20,000-25,000 plants/ha'
      },
      climate: {
        temp: '22-30°C',
        rainfall: '600-1000mm',
        sunlight: '8-10h/jour',
        humidity: '65-75%'
      },
      calendar: {
        planting: 'Mars-Avril | Septembre-Octobre',
        spacing: '80cm x 50cm',
        cycle: '90-120 jours',
        harvest: 'Récolte échelonnée 4-6 mois'
      },
      budget: {
        seeds: 42000,
        fertilizer: 62000,
        labor: 78000,
        total: 182000,
        yield: '20-35 tonnes/ha',
        revenue: '500,000-900,000 FCFA/ha'
      }
    },
    'Banane Plantain': {
      regions: ['Littoral', 'Sud-Ouest', 'Centre', 'Sud', 'Est'],
      soil: {
        prep: 'Trous 40x40x40cm, sol profond et fertile',
        organic: '15-20kg fumier/trou',
        ph: '5.5-7.0',
        drainage: 'Bon drainage - sols alluviaux idéaux'
      },
      seeds: {
        varieties: 'Big Ebanga, French Clair, Bâtard',
        germination: 'Rejets sains 1.5-2kg',
        treatment: 'Parage rejets + trempage solution insecticide',
        density: '1,600-2,000 plants/ha'
      },
      climate: {
        temp: '24-30°C',
        rainfall: '1500-2500mm/an bien répartis',
        sunlight: '6-8h/jour',
        humidity: '75-85%'
      },
      calendar: {
        planting: 'Début saison pluies (Mars-Avril)',
        spacing: '2.5m x 2.5m (triangle)',
        cycle: '10-14 mois première récolte',
        harvest: 'Production continue 15-20 ans'
      },
      budget: {
        seeds: 120000,
        fertilizer: 95000,
        labor: 135000,
        total: 350000,
        yield: '15-25 tonnes/ha/an',
        revenue: '600,000-1,000,000 FCFA/ha/an'
      }
    },
    'Cacao': {
      regions: ['Centre', 'Sud', 'Est', 'Littoral', 'Sud-Ouest'],
      soil: {
        prep: 'Défrichement, piquetage, trous 60x60x60cm',
        organic: '20-30kg fumier + compost/plant',
        ph: '6.0-7.0',
        drainage: 'Excellent drainage - sols forestiers profonds'
      },
      seeds: {
        varieties: 'Hybrides: SNK, T79/501, UPA (résistants maladies)',
        germination: 'Cabosses fraîches, plants greffés',
        treatment: 'Plants certifiés de pépinière',
        density: '1,000-1,250 plants/ha'
      },
      climate: {
        temp: '24-28°C',
        rainfall: '1500-2000mm/an',
        sunlight: 'Ombrage 30-50% (bananiers, arbres forestiers)',
        humidity: '75-85%'
      },
      calendar: {
        planting: 'Début saison pluies',
        spacing: '3m x 3m ou 2.5m x 4m',
        cycle: '3-4 ans première production',
        harvest: '2 récoltes/an (Oct-Jan, Mai-Juil)'
      },
      budget: {
        seeds: 250000,
        fertilizer: 125000,
        labor: 185000,
        total: 560000,
        yield: '800-1500 kg fèves sèches/ha/an',
        revenue: '1,200,000-2,500,000 FCFA/ha/an'
      }
    },
    'Café': {
      regions: ['Ouest', 'Nord-Ouest', 'Sud-Ouest'],
      soil: {
        prep: 'Trous 60x60x60cm, sol volcanique idéal',
        organic: '15-20kg fumier/plant',
        ph: '5.5-6.5',
        drainage: 'Excellent drainage - pentes modérées'
      },
      seeds: {
        varieties: 'Arabica: Java, Bourbon | Robusta: résistant altitude basse',
        germination: 'Plants greffés 12-18 mois',
        treatment: 'Plants certifiés pépinière',
        density: '1,300-1,600 plants/ha (Arabica)'
      },
      climate: {
        temp: '18-24°C (Arabica) | 24-30°C (Robusta)',
        rainfall: '1500-2000mm/an',
        sunlight: 'Ombrage léger 20-30%',
        humidity: '70-80%'
      },
      calendar: {
        planting: 'Début saison pluies',
        spacing: '2.5m x 2.5m',
        cycle: '3-4 ans première récolte',
        harvest: 'Octobre-Février (récolte principale)'
      },
      budget: {
        seeds: 280000,
        fertilizer: 145000,
        labor: 195000,
        total: 620000,
        yield: '800-1200 kg café marchand/ha',
        revenue: '1,500,000-2,800,000 FCFA/ha/an'
      }
    },
    'Palmier à huile': {
      regions: ['Littoral', 'Sud-Ouest', 'Centre', 'Sud'],
      soil: {
        prep: 'Défrichement, trous 60x60x60cm',
        organic: '25-30kg fumier/plant',
        ph: '5.0-6.5',
        drainage: 'Bon drainage - sols profonds'
      },
      seeds: {
        varieties: 'Tenera (hybride Dura x Pisifera)',
        germination: 'Plants sélectionnés 12-14 mois',
        treatment: 'Plants certifiés origine contrôlée',
        density: '143 plants/ha (9m x 9m triangle)'
      },
      climate: {
        temp: '24-32°C',
        rainfall: '1800-2500mm/an',
        sunlight: 'Plein soleil',
        humidity: '75-85%'
      },
      calendar: {
        planting: 'Début saison pluies',
        spacing: '9m x 9m (triangle équilatéral)',
        cycle: '3-4 ans première production',
        harvest: 'Récolte tous les 10-15 jours'
      },
      budget: {
        seeds: 350000,
        fertilizer: 185000,
        labor: 245000,
        total: 780000,
        yield: '15-25 tonnes régimes/ha/an',
        revenue: '2,000,000-3,500,000 FCFA/ha/an'
      }
    }
  };

  const currentCropData = cropAdviceData[selectedCrop] || cropAdviceData['Tomate'];
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadMyActivity();
  }, [user]);

  const loadMyActivity = async () => {
    try {
      setLoading(true);
      
      // Load my listings from API
      let listings: any[] = [];
      try {
        listings = await api.getMyListings();
      } catch (apiError) {
        console.warn('Could not load listings from API:', apiError);
      }
      
      // Load local listings from localStorage (created offline or demo)
      const localListings = JSON.parse(localStorage.getItem('my_local_listings') || '[]');
      
      // Combine API listings with local listings
      const allMyListings = [...listings, ...localListings];
      
      // Ensure all listings have PUBLISHED status by default
      const listingsWithStatus = allMyListings.map((listing: any) => ({
        ...listing,
        status: listing.status || 'PUBLISHED'
      }));
      setMyListings(listingsWithStatus);
      
      // Load all listings to filter by activity type and domain
      const allListings = await api.getListings({ page: 1, page_size: 50 });
      const userDomain = user?.profile?.domain;
      
      // Import demo listings if API returns empty
      let allItems = allListings.items;
      if (allItems.length === 0) {
        const { generateDemoListings } = await import('@/data/demoListings');
        allItems = generateDemoListings();
      }
      
      // For Producteur: show supplier listings (seed_provider) and buyer requests IN SAME DOMAIN
      if (user?.profile?.activity_type === 'producer') {
        setSupplierListings(allItems.filter((l: any) => 
          (l.seller?.profile?.activity_type === 'seed_provider' || l.title?.includes('FOURNITURE:')) &&
          (l.seller?.profile?.domain === userDomain || l.category_id === userDomain)
        ));
        setClientRequests(allItems.filter((l: any) => 
          (l.seller?.profile?.activity_type === 'buyer' || l.title?.includes('ACHAT:')) &&
          (l.seller?.profile?.domain === userDomain || l.category_id === userDomain)
        ));
      }
      
      // For Fournisseur: show buyer requests IN SAME DOMAIN
      if (user?.profile?.activity_type === 'seed_provider') {
        setClientRequests(allItems.filter((l: any) => 
          (l.seller?.profile?.activity_type === 'buyer' || l.title?.includes('ACHAT:')) &&
          (l.seller?.profile?.domain === userDomain || l.category_id === userDomain)
        ));
      }
      
      // For Acheteur: show producer listings IN SAME DOMAIN
      if (user?.profile?.activity_type === 'buyer') {
        setSupplierListings(allItems.filter((l: any) => 
          (l.seller?.profile?.activity_type === 'producer' || l.title?.includes('VENTE:')) &&
          (l.seller?.profile?.domain === userDomain || l.category_id === userDomain)
        ));
      }
      
      setStats({
        totalListings: allMyListings.length,
        activeListings: allMyListings.filter((l: Listing) => l.status === 'active' || l.status === 'PUBLISHED').length,
        totalViews: Math.floor(Math.random() * 500) + 100
      });
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityTitle = () => {
    const activityType = user?.profile?.activity_type;
    switch (activityType) {
      case 'seed_provider':
        return 'Mes Fournitures';
      case 'producer':
        return 'Mes Productions';
      case 'buyer':
        return 'Mes Demandes';
      default:
        return 'Mon Activité';
    }
  };

  const getActivityDescription = () => {
    const activityType = user?.profile?.activity_type;
    switch (activityType) {
      case 'seed_provider':
        return 'Gérez vos semences et animaux disponibles';
      case 'producer':
        return 'Gérez vos récoltes et productions';
      case 'buyer':
        return 'Gérez vos demandes d\'achat';
      default:
        return 'Gérez votre activité';
    }
  };

  const getEmptyStateMessage = () => {
    const activityType = user?.profile?.activity_type;
    switch (activityType) {
      case 'seed_provider':
        return 'Vous n\'avez pas encore de fournitures publiées. Commencez par ajouter vos semences ou animaux disponibles.';
      case 'producer':
        return 'Vous n\'avez pas encore de productions publiées. Commencez par ajouter vos récoltes disponibles.';
      case 'buyer':
        return 'Vous n\'avez pas encore de demandes publiées. Commencez par publier ce que vous recherchez.';
      default:
        return 'Aucune publication pour le moment.';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  // Extract product category from listing title for intelligent matching
  const extractProductCategory = (title: string): string => {
    const titleLower = title.toLowerCase();
    
    // Agriculture categories
    const agricultureCategories: Record<string, string[]> = {
      'Maïs': ['maïs', 'mais', 'corn'],
      'Tomate': ['tomate', 'tomato'],
      'Haricot': ['haricot', 'bean'],
      'Piment': ['piment', 'pepper', 'poivron'],
      'Gombo': ['gombo', 'okra'],
      'Manioc': ['manioc', 'cassava'],
      'Arachide': ['arachide', 'cacahuète', 'peanut'],
      'Riz': ['riz', 'rice'],
      'Banane': ['banane', 'plantain', 'banana'],
      'Cacao': ['cacao', 'cocoa'],
      'Café': ['café', 'coffee'],
      'Palmier': ['palmier', 'palm', 'huile de palme'],
    };

    // Élevage categories
    const elevageCategories: Record<string, string[]> = {
      'Poulet': ['poulet', 'poule', 'chicken', 'volaille'],
      'Porc': ['porc', 'cochon', 'porcelet', 'pig'],
      'Chèvre': ['chèvre', 'cabri', 'goat'],
      'Mouton': ['mouton', 'bélier', 'sheep'],
      'Lapin': ['lapin', 'rabbit'],
      'Canard': ['canard', 'duck'],
      'Bœuf': ['bœuf', 'boeuf', 'vache', 'cattle', 'bovin'],
      'Poisson': ['poisson', 'tilapia', 'fish', 'pisciculture'],
    };

    const allCategories = { ...agricultureCategories, ...elevageCategories };

    // Check each category
    for (const [category, keywords] of Object.entries(allCategories)) {
      for (const keyword of keywords) {
        if (titleLower.includes(keyword)) {
          return category;
        }
      }
    }

    return 'Autre';
  };

  // Get user's product categories from their listings
  const getUserProductCategories = (listings: Listing[]): string[] => {
    const categories = new Set<string>();
    listings.forEach(listing => {
      const category = extractProductCategory(listing.title);
      if (category !== 'Autre') {
        categories.add(category);
      }
    });
    return Array.from(categories);
  };

  // Generate fake client requests based on user's product categories
  const generateMatchingClientRequests = (userCategories: string[]): Listing[] => {
    if (userCategories.length === 0) return [];

    const requestTemplates: Record<string, Array<{title: string, quantity: number, unit: string, price: number, region: string}>> = {
      'Maïs': [
        { title: 'Recherche semences de Maïs CMS 8704 certifiées', quantity: 50, unit: 'kg', price: 2500, region: 'Ouest' },
        { title: 'Besoin urgent de Maïs hybride pour 5 hectares', quantity: 100, unit: 'kg', price: 2800, region: 'Centre' },
        { title: 'Achat de semences de Maïs résistant à la sécheresse', quantity: 75, unit: 'kg', price: 3000, region: 'Nord' },
      ],
      'Tomate': [
        { title: 'Recherche semences de Tomate Roma VF', quantity: 2, unit: 'kg', price: 15000, region: 'Littoral' },
        { title: 'Besoin de plants de Tomate hybride F1', quantity: 500, unit: 'plants', price: 200, region: 'Ouest' },
        { title: 'Achat semences Tomate Mongal F1 certifiées', quantity: 1, unit: 'kg', price: 18000, region: 'Nord-Ouest' },
      ],
      'Haricot': [
        { title: 'Recherche semences de Haricot nain', quantity: 30, unit: 'kg', price: 1500, region: 'Ouest' },
        { title: 'Besoin de Haricot grimpant pour culture', quantity: 25, unit: 'kg', price: 1800, region: 'Centre' },
      ],
      'Piment': [
        { title: 'Recherche semences de Piment Cayenne', quantity: 500, unit: 'g', price: 8000, region: 'Littoral' },
        { title: 'Achat de plants de Piment fort', quantity: 200, unit: 'plants', price: 150, region: 'Ouest' },
      ],
      'Gombo': [
        { title: 'Recherche semences de Gombo Clemson', quantity: 5, unit: 'kg', price: 3000, region: 'Centre' },
        { title: 'Besoin de Gombo pour plantation', quantity: 10, unit: 'kg', price: 2800, region: 'Littoral' },
      ],
      'Poulet': [
        { title: 'Recherche 100 Poulets de chair de 6 semaines', quantity: 100, unit: 'unités', price: 3500, region: 'Douala' },
        { title: 'Achat de Poussins de 1 jour', quantity: 500, unit: 'unités', price: 800, region: 'Yaoundé' },
        { title: 'Besoin de Poulets pondeuses', quantity: 50, unit: 'unités', price: 4000, region: 'Bafoussam' },
      ],
      'Porc': [
        { title: 'Recherche Porcelets sevrés', quantity: 20, unit: 'unités', price: 25000, region: 'Ouest' },
        { title: 'Achat de Porcs pour engraissement', quantity: 10, unit: 'unités', price: 45000, region: 'Centre' },
      ],
      'Chèvre': [
        { title: 'Recherche Chèvres naines', quantity: 15, unit: 'unités', price: 35000, region: 'Nord-Ouest' },
        { title: 'Achat de Cabris pour élevage', quantity: 25, unit: 'unités', price: 20000, region: 'Ouest' },
      ],
      'Lapin': [
        { title: 'Recherche Lapins reproducteurs', quantity: 10, unit: 'unités', price: 8000, region: 'Centre' },
        { title: 'Achat de Lapins pour démarrage élevage', quantity: 20, unit: 'unités', price: 7000, region: 'Littoral' },
      ],
      'Canard': [
        { title: 'Recherche Canetons de Barbarie', quantity: 50, unit: 'unités', price: 1500, region: 'Littoral' },
        { title: 'Achat de Canards adultes', quantity: 30, unit: 'unités', price: 3000, region: 'Sud' },
      ],
    };

    const fakeRequests: Listing[] = [];
    let idCounter = 1000;

    userCategories.forEach(category => {
      const templates = requestTemplates[category];
      if (templates) {
        templates.forEach(template => {
          fakeRequests.push({
            id: `fake-${idCounter++}`,
            title: template.title,
            quantity: template.quantity,
            unit: template.unit,
            price_per_unit: template.price,
            currency: 'FCFA',
            region: template.region,
            status: 'active',
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        });
      }
    });

    return fakeRequests;
  };

  // Generate fake supplier listings based on user's product categories
  const generateMatchingSupplierListings = (userCategories: string[]): Listing[] => {
    if (userCategories.length === 0) return [];

    const supplierTemplates: Record<string, Array<{title: string, quantity: number, unit: string, price: number, region: string, images?: string[]}>> = {
      'Maïs': [
        { title: 'Semences de Maïs CMS 8704 certifiées IRAD', quantity: 200, unit: 'kg', price: 2200, region: 'Ouest' },
        { title: 'Maïs hybride haute performance - Rendement 6T/ha', quantity: 150, unit: 'kg', price: 2600, region: 'Centre' },
        { title: 'Semences Maïs résistant sécheresse - Variété locale améliorée', quantity: 100, unit: 'kg', price: 2400, region: 'Nord' },
      ],
      'Tomate': [
        { title: 'Semences Tomate Roma VF - Qualité Premium', quantity: 5, unit: 'kg', price: 14000, region: 'Littoral' },
        { title: 'Plants de Tomate hybride F1 - Prêts à planter', quantity: 1000, unit: 'plants', price: 180, region: 'Ouest' },
        { title: 'Tomate Mongal F1 certifiée - Résistante maladies', quantity: 3, unit: 'kg', price: 17000, region: 'Nord-Ouest' },
      ],
      'Haricot': [
        { title: 'Semences Haricot nain - Variété précoce', quantity: 50, unit: 'kg', price: 1400, region: 'Ouest' },
        { title: 'Haricot grimpant - Production intensive', quantity: 40, unit: 'kg', price: 1700, region: 'Centre' },
      ],
      'Piment': [
        { title: 'Semences Piment Cayenne - Extra fort', quantity: 1, unit: 'kg', price: 7500, region: 'Littoral' },
        { title: 'Plants de Piment fort - 15cm de hauteur', quantity: 300, unit: 'plants', price: 140, region: 'Ouest' },
      ],
      'Gombo': [
        { title: 'Semences Gombo Clemson - Haute productivité', quantity: 10, unit: 'kg', price: 2800, region: 'Centre' },
        { title: 'Gombo vert tendre - Semences certifiées', quantity: 15, unit: 'kg', price: 2600, region: 'Littoral' },
      ],
      'Poulet': [
        { title: 'Poulets de chair 6 semaines - Prêts à vendre', quantity: 150, unit: 'unités', price: 3200, region: 'Douala' },
        { title: 'Poussins de 1 jour - Race Cobb 500', quantity: 1000, unit: 'unités', price: 750, region: 'Yaoundé' },
        { title: 'Poulets pondeuses 18 semaines - Ponte imminente', quantity: 80, unit: 'unités', price: 3800, region: 'Bafoussam' },
      ],
      'Porc': [
        { title: 'Porcelets sevrés 8 semaines - Race Large White', quantity: 30, unit: 'unités', price: 23000, region: 'Ouest' },
        { title: 'Porcs pour engraissement - 3 mois', quantity: 15, unit: 'unités', price: 42000, region: 'Centre' },
      ],
      'Chèvre': [
        { title: 'Chèvres naines - Excellente reproduction', quantity: 20, unit: 'unités', price: 33000, region: 'Nord-Ouest' },
        { title: 'Cabris 3 mois - Race locale améliorée', quantity: 30, unit: 'unités', price: 18000, region: 'Ouest' },
      ],
      'Lapin': [
        { title: 'Lapins reproducteurs - Race Californien', quantity: 15, unit: 'unités', price: 7500, region: 'Centre' },
        { title: 'Lapins 2 mois - Démarrage élevage', quantity: 25, unit: 'unités', price: 6500, region: 'Littoral' },
      ],
      'Canard': [
        { title: 'Canetons de Barbarie 1 semaine', quantity: 80, unit: 'unités', price: 1400, region: 'Littoral' },
        { title: 'Canards adultes reproducteurs', quantity: 40, unit: 'unités', price: 2800, region: 'Sud' },
      ],
    };

    const fakeSuppliers: Listing[] = [];
    let idCounter = 2000;

    userCategories.forEach(category => {
      const templates = supplierTemplates[category];
      if (templates) {
        templates.forEach(template => {
          fakeSuppliers.push({
            id: `fake-supplier-${idCounter++}`,
            title: template.title,
            quantity: template.quantity,
            unit: template.unit,
            price_per_unit: template.price,
            currency: 'FCFA',
            region: template.region,
            status: 'active',
            created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            images: template.images,
          });
        });
      }
    });

    return fakeSuppliers;
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-['Inter','Plus_Jakarta_Sans',sans-serif]">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/background pic.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/80' : 'bg-black/40'}`} />
      </div>

      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton Retour */}
        <button
          onClick={() => navigate('/feed')}
          className="mb-4 sm:mb-6 transition-all transform hover:scale-110 text-2xl font-bold text-white hover:text-emerald-400"
        >
          ←
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{getActivityTitle()}</h1>
            <p className="mt-1 text-white/80">{getActivityDescription()}</p>
          </div>
          <button
            onClick={() => navigate('/feed', { state: { openCreatePost: true } })}
            className="flex items-center space-x-2 px-4 py-2 border border-emerald-500/50 rounded-xl font-bold transition-all text-sm shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Publier</span>
          </button>
        </div>
        {/* Tabs Navigation - Hide when in advice-next mode */}
        {(activeTab === 'advice-current' || activeTab === 'suppliers' || activeTab === 'requests' || activeTab === 'my-listings') && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-6">
            {user?.profile?.activity_type === 'producer' && (
              <>
                <button
                  onClick={() => setActiveTab('suppliers')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold transition-all text-sm border ${
                    activeTab === 'suppliers' 
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' 
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <PackageSearch className="h-5 w-5" strokeWidth={2} />
                  Fournisseurs ({supplierListings.length})
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold transition-all text-sm border ${
                    activeTab === 'requests' 
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300' 
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" strokeWidth={2} />
                  Demandes Clients ({clientRequests.length})
                </button>
              </>
            )}
            {user?.profile?.activity_type === 'seed_provider' && (
              <>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border ${
                    activeTab === 'requests' 
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300' 
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" strokeWidth={2} />
                  Demandes Clients ({clientRequests.length})
                </button>
              </>
            )}
            {user?.profile?.activity_type === 'buyer' && (
              <>
                <button
                  onClick={() => setActiveTab('suppliers')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border ${
                    activeTab === 'suppliers' 
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' 
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Sprout className="h-5 w-5" strokeWidth={2} />
                  Offres Producteurs ({supplierListings.length})
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('my-listings')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all border ${
                activeTab === 'my-listings' 
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' 
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              }`}
            >
              <Package className="h-5 w-5" strokeWidth={2} />
              Mes Publications ({myListings.length})
            </button>
            </div>
          </div>
        )}

        {/* Simplified navigation for advice-next mode (Producer) */}
        {activeTab === 'advice-next' && user?.profile?.activity_type === 'producer' && (
          <div className="mb-6">
            <button
              onClick={() => setActiveTab('advice-current')}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all border bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              ← Retour aux onglets
            </button>
          </div>
        )}

        {/* Simplified navigation for seed-stats mode (Seed Provider) */}
        {activeTab === 'advice-next' && user?.profile?.activity_type === 'seed_provider' && (
          <div className="mb-6">
            <button
              onClick={() => setActiveTab('requests')}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all border bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              ← Retour aux onglets
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'advice-next' && user?.profile?.activity_type === 'producer' && (
          <div 
            className="backdrop-blur-md rounded-xl shadow-lg p-8 border border-emerald-500/30 bg-black/40"
          >
            {/* Header with crop selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-white">Guide de Production: {selectedCrop}</h1>
                  <p className="text-white/80">Conseils complets pour réussir votre culture de {selectedCrop.toLowerCase()}</p>
                </div>
                <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <Sprout className="h-10 w-10 text-emerald-400" strokeWidth={2} />
                </div>
              </div>
              
              {/* Info banner - crop is set in profile */}
              <div 
                className="rounded-xl p-4 backdrop-blur-sm border bg-cyan-900/20 border-cyan-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center">
                    <span className="text-xl">ℹ️</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-cyan-100">
                      <span className="font-bold text-cyan-300">Culture actuelle:</span> {selectedCrop}
                    </p>
                    <p className="text-xs text-cyan-200/70 mt-1">
                      Régions adaptées: {currentCropData.regions.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 rounded-xl hover:bg-cyan-500/30 font-bold text-sm transition-all"
                  >
                    Changer dans mon profil
                  </button>
                </div>
              </div>
            </div>

            {/* Comprehensive Advice Sections - Premium Design */}
            <div className="space-y-4">
              {/* 1. Préparation du sol */}
              <div 
                className="backdrop-blur-md rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all bg-black/30 border-white/10 border-l-4 border-l-emerald-500"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sprout className="h-5 w-5 text-emerald-400" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-white text-lg tracking-tight mb-1">Préparation du Sol</h2>
                    <p className="text-sm text-white/60">Fondation de votre réussite</p>
                  </div>
                </div>
                <div className="space-y-4 ml-14">
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Type de labour</p>
                    <p className="text-sm text-white/90">{currentCropData.soil.prep}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Matière organique</p>
                    <p className="text-sm text-white/90">{currentCropData.soil.organic}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">pH du sol</p>
                    <p className="text-sm text-white/90">{currentCropData.soil.ph}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Drainage</p>
                    <p className="text-sm text-white/90">{currentCropData.soil.drainage}</p>
                  </div>
                </div>
              </div>

              {/* 2. Semences */}
              <div 
                className="backdrop-blur-md rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all bg-black/30 border-white/10 border-l-4 border-l-cyan-500"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PackageSearch className="h-5 w-5 text-cyan-400" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-white text-lg tracking-tight mb-1">Choix des Semences</h2>
                    <p className="text-sm text-white/60">Qualité = Rendement</p>
                  </div>
                </div>
                <div className="space-y-4 ml-14">
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Variétés recommandées</p>
                    <p className="text-sm text-white/90">{currentCropData.seeds.varieties}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Taux de germination</p>
                    <p className="text-sm text-white/90">{currentCropData.seeds.germination}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Traitement des semences</p>
                    <p className="text-sm text-white/90">{currentCropData.seeds.treatment}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Densité de plantation</p>
                    <p className="text-sm text-white/90">{currentCropData.seeds.density}</p>
                  </div>
                </div>
              </div>

              {/* 3. Exigences Climatiques */}
              <div 
                className="backdrop-blur-md rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all bg-black/30 border-white/10 border-l-4 border-l-yellow-500"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">☀️</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-white text-lg tracking-tight mb-1">Exigences Climatiques</h2>
                    <p className="text-sm text-white/60">Conditions optimales</p>
                  </div>
                </div>
                <div className="space-y-4 ml-14">
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Température</p>
                    <p className="text-sm text-white/90">{currentCropData.climate.temp}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Pluviométrie</p>
                    <p className="text-sm text-white/90">{currentCropData.climate.rainfall}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Ensoleillement</p>
                    <p className="text-sm text-white/90">{currentCropData.climate.sunlight}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Humidité relative</p>
                    <p className="text-sm text-white/90">{currentCropData.climate.humidity}</p>
                  </div>
                </div>
              </div>

              {/* 4. Calendrier Cultural */}
              <div 
                className="backdrop-blur-md rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all bg-black/30 border-white/10 border-l-4 border-l-amber-500"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📅</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-white text-lg tracking-tight mb-1">Calendrier Cultural</h2>
                    <p className="text-sm text-white/60">Timing parfait</p>
                  </div>
                </div>
                <div className="space-y-4 ml-14">
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Période de plantation</p>
                    <p className="text-sm text-white/90">{currentCropData.calendar.planting}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Espacement</p>
                    <p className="text-sm text-white/90">{currentCropData.calendar.spacing}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Cycle cultural</p>
                    <p className="text-sm text-white/90">{currentCropData.calendar.cycle}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wide mb-1">Récolte</p>
                    <p className="text-sm text-white/90">{currentCropData.calendar.harvest}</p>
                  </div>
                </div>
              </div>

              {/* 5. Budget Prévisionnel - Premium KPI Design */}
              <div 
                className="backdrop-blur-md rounded-xl p-8 shadow-lg border bg-black/30 border-white/10"
              >
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-12 h-12 bg-purple-500/20 border-2 border-purple-500/50 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-white text-2xl tracking-tight mb-1">Budget Prévisionnel</h2>
                    <p className="text-sm text-white/60">Analyse financière par hectare</p>
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Semences Card */}
                  <div 
                    className="group relative rounded-2xl p-5 hover:shadow-lg transition-all duration-300 backdrop-blur-sm border bg-cyan-900/10 border-cyan-500/30"
                  >
                    <div className="absolute top-3 right-3 w-8 h-8 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🌱</span>
                    </div>
                    <p className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-3">Semences/Plants</p>
                    <p className="text-3xl font-bold text-white mb-1">{formatPrice(currentCropData.budget.seeds)}</p>
                    <p className="text-xs text-white/40">FCFA</p>
                    <div className="mt-3 pt-3 border-t border-cyan-500/30">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">% du total</span>
                        <span className="font-bold text-cyan-300">{Math.round((currentCropData.budget.seeds / currentCropData.budget.total) * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Engrais Card */}
                  <div 
                    className="group relative rounded-2xl p-5 hover:shadow-lg transition-all duration-300 backdrop-blur-sm border bg-emerald-900/10 border-emerald-500/30"
                  >
                    <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🧪</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3">Engrais & Produits</p>
                    <p className="text-3xl font-bold text-white mb-1">{formatPrice(currentCropData.budget.fertilizer)}</p>
                    <p className="text-xs text-white/40">FCFA</p>
                    <div className="mt-3 pt-3 border-t border-emerald-500/30">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">% du total</span>
                        <span className="font-bold text-emerald-300">{Math.round((currentCropData.budget.fertilizer / currentCropData.budget.total) * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Main d'œuvre Card */}
                  <div 
                    className="group relative rounded-2xl p-5 hover:shadow-lg transition-all duration-300 backdrop-blur-sm border bg-amber-900/10 border-amber-500/30"
                  >
                    <div className="absolute top-3 right-3 w-8 h-8 bg-amber-500/20 border border-amber-500/50 rounded-lg flex items-center justify-center">
                      <span className="text-lg">👷</span>
                    </div>
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">Main d'œuvre</p>
                    <p className="text-3xl font-bold text-white mb-1">{formatPrice(currentCropData.budget.labor)}</p>
                    <p className="text-xs text-white/40">FCFA</p>
                    <div className="mt-3 pt-3 border-t border-amber-500/30">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">% du total</span>
                        <span className="font-bold text-amber-300">{Math.round((currentCropData.budget.labor / currentCropData.budget.total) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary - Premium Design */}
                <div 
                  className="rounded-2xl p-6 backdrop-blur-sm border bg-white/5 border-white/10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coût Total */}
                    <div 
                      className="rounded-xl p-5 shadow-sm backdrop-blur-sm border bg-black/20 border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-white/60">Coût Total</span>
                        <div className="w-8 h-8 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center justify-center">
                          <span className="text-sm">📉</span>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{formatPrice(currentCropData.budget.total)}</p>
                      <p className="text-xs text-white/40 uppercase tracking-wide">FCFA/hectare</p>
                    </div>

                    {/* Revenu Estimé */}
                    <div 
                      className="rounded-xl p-5 shadow-sm backdrop-blur-sm border bg-black/20 border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-white/60">Revenu Estimé</span>
                        <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center justify-center">
                          <span className="text-sm">📈</span>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-emerald-400 mb-1">{currentCropData.budget.revenue.split('-')[0].trim()}</p>
                      <p className="text-xs text-white/40 uppercase tracking-wide">FCFA/hectare</p>
                    </div>
                  </div>

                  {/* Profitability Indicator */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">Rentabilité Estimée</span>
                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-full text-xs font-bold">
                        {Math.round((parseInt(currentCropData.budget.revenue.split('-')[0].replace(/[^0-9]/g, '')) / currentCropData.budget.total - 1) * 100)}% - {Math.round((parseInt(currentCropData.budget.revenue.split('-')[1].replace(/[^0-9]/g, '')) / currentCropData.budget.total - 1) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                    </div>
                    <div className="mt-3 flex items-start gap-2">
                      <span className="text-xs">💡</span>
                      <p className="text-xs text-white/60 leading-relaxed">
                        <span className="font-bold text-white">Rendement prévu:</span> {currentCropData.budget.yield}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seed Provider Statistics Section */}
        {activeTab === 'advice-next' && user?.profile?.activity_type === 'seed_provider' && (
          <div 
            className="backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/10 bg-black/40"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border-2 border-emerald-400/40 rounded-2xl flex items-center justify-center shadow-xl">
                    <PackageSearch className="h-10 w-10 text-emerald-300" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white">
                    Statistiques de Vente - {user?.profile?.domain === 'agriculture' ? 'Semences Agricoles' : 'Animaux d\'Élevage'}
                  </h1>
                  <p className="text-sm sm:text-base font-medium text-white/80">Analysez la demande et optimisez votre stock</p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="space-y-6">
              {/* Semences les plus demandées */}
              <div 
                className="backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border bg-black/30 border-white/10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <TrendingUp className="h-7 w-7 text-emerald-300" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight mb-1.5 text-white">
                      Produits les Plus Demandés
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-white/60">Top 5 des produits recherchés ce mois</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-emerald-100">
                  {user?.profile?.domain === 'agriculture' ? (
                    <>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border bg-white/5 border-white/10 hover:bg-white/10"
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#10B981' : 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#A7F3D0'
                            }}
                          >1</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Maïs (Hybride)</span>
                        </div>
                        <span 
                          className="flex items-center justify-center gap-1 w-16 sm:w-20 py-2 text-xs sm:text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >
                          <span>🛒</span>
                          <span>45</span>
                        </span>
                      </div>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border"
                        style={{
                          background: theme === 'light' ? '#F0FDF4' : 'linear-gradient(to right, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                          borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#10B981' : 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#A7F3D0'
                            }}
                          >2</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Tomate (Roma VF)</span>
                        </div>
                        <span 
                          className="px-5 py-2 text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >🛒 38</span>
                      </div>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border"
                        style={{
                          background: theme === 'light' ? '#F0FDF4' : 'linear-gradient(to right, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                          borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#10B981' : 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#A7F3D0'
                            }}
                          >3</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Haricot (Variété naine)</span>
                        </div>
                        <span 
                          className="px-5 py-2 text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >🛒 32</span>
                      </div>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border"
                        style={{
                          background: theme === 'light' ? '#F0FDF4' : 'linear-gradient(to right, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                          borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#10B981' : 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#A7F3D0'
                            }}
                          >4</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Piment (Cayenne)</span>
                        </div>
                        <span 
                          className="px-5 py-2 text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >🛒 28</span>
                      </div>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border"
                        style={{
                          background: theme === 'light' ? '#F0FDF4' : 'linear-gradient(to right, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                          borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#10B981' : 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#A7F3D0'
                            }}
                          >5</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Gombo (Clemson)</span>
                        </div>
                        <span 
                          className="px-5 py-2 text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >🛒 25</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border"
                        style={{
                          background: theme === 'light' ? '#FEF3C7' : 'linear-gradient(to right, rgba(251, 146, 60, 0.15), rgba(251, 146, 60, 0.05))',
                          borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.2)'
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to bottom right, rgba(251, 146, 60, 0.4), rgba(245, 158, 11, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                            }}
                          >1</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Poulets de chair</span>
                        </div>
                        <span 
                          className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >🛒 52</span>
                      </div>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border"
                        style={{
                          background: theme === 'light' ? '#FEF3C7' : 'linear-gradient(to right, rgba(251, 146, 60, 0.15), rgba(251, 146, 60, 0.05))',
                          borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.2)'
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to bottom right, rgba(251, 146, 60, 0.4), rgba(245, 158, 11, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                            }}
                          >2</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Porcelets</span>
                        </div>
                        <span 
                          className="px-5 py-2 text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >🛒 41</span>
                      </div>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border"
                        style={{
                          background: theme === 'light' ? '#FEF3C7' : 'linear-gradient(to right, rgba(251, 146, 60, 0.15), rgba(251, 146, 60, 0.05))',
                          borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.2)'
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to bottom right, rgba(251, 146, 60, 0.4), rgba(245, 158, 11, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                            }}
                          >3</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Chèvres</span>
                        </div>
                        <span 
                          className="px-5 py-2 text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >🛒 35</span>
                      </div>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border"
                        style={{
                          background: theme === 'light' ? '#FEF3C7' : 'linear-gradient(to right, rgba(251, 146, 60, 0.15), rgba(251, 146, 60, 0.05))',
                          borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.2)'
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to bottom right, rgba(251, 146, 60, 0.4), rgba(245, 158, 11, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                            }}
                          >4</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Lapins</span>
                        </div>
                        <span 
                          className="px-5 py-2 text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >🛒 29</span>
                      </div>
                      <div 
                        className="group relative flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl hover:shadow-lg transition-all duration-200 border"
                        style={{
                          background: theme === 'light' ? '#FEF3C7' : 'linear-gradient(to right, rgba(251, 146, 60, 0.15), rgba(251, 146, 60, 0.05))',
                          borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.2)'
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          <span 
                            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold text-sm sm:text-base rounded-lg flex-shrink-0 shadow-md"
                            style={{
                              background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to bottom right, rgba(251, 146, 60, 0.4), rgba(245, 158, 11, 0.3))',
                              color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                            }}
                          >5</span>
                          <span className="font-semibold text-base truncate" style={{ color: getTextStyles(theme).title }}>Canards</span>
                        </div>
                        <span 
                          className="px-5 py-2 text-sm font-bold rounded-full shadow-md whitespace-nowrap flex-shrink-0 border"
                          style={{
                            background: theme === 'light' ? '#F59E0B' : 'linear-gradient(to right, rgba(251, 146, 60, 0.3), rgba(245, 158, 11, 0.2))',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.4)',
                            color: theme === 'light' ? '#FFFFFF' : '#FCD34D'
                          }}
                        >🛒 22</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Stock disponible */}
              <div 
                className="backdrop-blur-md rounded-xl p-6 border-l-4 border"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(6, 182, 212, 0.2)',
                  borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(6, 182, 212, 0.3)',
                  borderLeftColor: '#06B6D4',
                  borderLeftWidth: '4px'
                }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 bg-cyan-500/30 border border-cyan-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-cyan-400" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-xl tracking-tight mb-1" style={{ color: getTextStyles(theme).title }}>Votre Stock Disponible</h2>
                    <p className="text-sm" style={{ color: getTextStyles(theme).body }}>Produits actuellement en vente</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-16">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      background: theme === 'light' ? '#F0FDFA' : 'rgba(6, 182, 212, 0.2)',
                      borderColor: theme === 'light' ? '#06B6D4' : 'rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    <p className="text-sm mb-1" style={{ color: getTextStyles(theme).body }}>Total produits</p>
                    <p className="text-3xl font-bold" style={{ color: getTextStyles(theme).title }}>{myListings.length}</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      background: theme === 'light' ? '#F0FDFA' : 'rgba(6, 182, 212, 0.2)',
                      borderColor: theme === 'light' ? '#06B6D4' : 'rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    <p className="text-sm mb-1" style={{ color: getTextStyles(theme).body }}>Produits actifs</p>
                    <p className="text-3xl font-bold text-cyan-400">{myListings.filter(l => l.status === 'active').length}</p>
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div 
                className="backdrop-blur-md rounded-xl p-6 border-l-4 border"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(168, 85, 247, 0.2)',
                  borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(168, 85, 247, 0.3)',
                  borderLeftColor: '#A855F7',
                  borderLeftWidth: '4px'
                }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 bg-purple-500/30 border border-purple-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-purple-400" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-xl tracking-tight mb-1" style={{ color: getTextStyles(theme).title }}>Recommandations</h2>
                    <p className="text-sm" style={{ color: getTextStyles(theme).body }}>Optimisez vos ventes</p>
                  </div>
                </div>
                <div className="space-y-3 ml-16">
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      background: theme === 'light' ? '#FAF5FF' : 'rgba(168, 85, 247, 0.2)',
                      borderColor: theme === 'light' ? '#A855F7' : 'rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    <p className="font-bold mb-2" style={{ color: getTextStyles(theme).title }}>📈 Forte demande détectée</p>
                    <p className="text-sm" style={{ color: getTextStyles(theme).body }}>
                      {user?.profile?.domain === 'agriculture' 
                        ? 'Le maïs CMS 8704 est très demandé. Augmentez votre stock pour maximiser vos ventes.'
                        : 'Les poulets de chair sont très demandés. Augmentez votre stock pour maximiser vos ventes.'}
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      background: theme === 'light' ? '#FAF5FF' : 'rgba(168, 85, 247, 0.2)',
                      borderColor: theme === 'light' ? '#A855F7' : 'rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    <p className="font-bold mb-2" style={{ color: getTextStyles(theme).title }}>💰 Opportunité de prix</p>
                    <p className="text-sm" style={{ color: getTextStyles(theme).body }}>
                      La saison des pluies approche. C'est le moment idéal pour proposer vos produits.
                    </p>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      background: theme === 'light' ? '#FAF5FF' : 'rgba(168, 85, 247, 0.2)',
                      borderColor: theme === 'light' ? '#A855F7' : 'rgba(168, 85, 247, 0.3)'
                    }}
                  >
                    <p className="font-bold mb-2" style={{ color: getTextStyles(theme).title }}>📦 Gestion de stock</p>
                    <p className="text-sm" style={{ color: getTextStyles(theme).body }}>
                      {myListings.length === 0 
                        ? 'Commencez par ajouter vos premiers produits pour attirer des clients.'
                        : `Vous avez ${myListings.length} produit(s). Pensez à renouveler votre stock régulièrement.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advice-current' && user?.profile?.activity_type === 'producer' && (
          <div 
            className="backdrop-blur-md rounded-xl shadow-lg p-8 border"
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/30 border-2 border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-emerald-400" strokeWidth={2} />
              </div>
              <h2 className={`text-2xl font-bold ${textTitle} mb-2`}>Conseils pour ma Production en Cours</h2>
              <p className={`${textMuted}`}>Optimisez vos cultures actuelles</p>
            </div>
            <div className="space-y-4">
              <div 
                className="p-6 backdrop-blur-md rounded-xl border-l-4 border"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(6, 182, 212, 0.2)',
                  borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(6, 182, 212, 0.3)',
                  borderLeftColor: '#06B6D4',
                  borderLeftWidth: '4px'
                }}
              >
                <h3 className={`font-bold ${textTitle} mb-2`}>Irrigation et arrosage</h3>
                <p className={`${textBody} text-sm mb-3`}>Arrosez régulièrement, surtout pendant la floraison et la formation des fruits. Évitez l'excès d'eau.</p>
                <div 
                  className="p-3 rounded-lg backdrop-blur-sm border"
                  style={{
                    background: theme === 'light' ? '#ECFDF5' : 'rgba(6, 182, 212, 0.3)',
                    borderColor: theme === 'light' ? '#06B6D4' : 'rgba(6, 182, 212, 0.4)'
                  }}
                >
                  <p className={`text-xs ${textTitle} font-bold`}>Fréquence recommandée: 2-3 fois par semaine en saison sèche</p>
                </div>
              </div>
              <div 
                className="p-6 backdrop-blur-md rounded-xl border-l-4 border"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(16, 185, 129, 0.2)',
                  borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(16, 185, 129, 0.3)',
                  borderLeftColor: '#10B981',
                  borderLeftWidth: '4px'
                }}
              >
                <h3 className={`font-bold ${textTitle} mb-2`}>Fertilisation</h3>
                <p className={`${textBody} text-sm mb-3`}>Apport d'engrais NPK 15-15-15 toutes les 3 semaines. Compléter avec engrais foliaire.</p>
                <div 
                  className="p-3 rounded-lg backdrop-blur-sm border"
                  style={{
                    background: theme === 'light' ? '#ECFDF5' : 'rgba(16, 185, 129, 0.3)',
                    borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <p className={`text-xs ${textTitle} font-bold`}>Dose: 200kg/ha par application</p>
                </div>
              </div>
              <div 
                className="p-6 backdrop-blur-md rounded-xl border-l-4 border"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(239, 68, 68, 0.2)',
                  borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(239, 68, 68, 0.3)',
                  borderLeftColor: '#EF4444',
                  borderLeftWidth: '4px'
                }}
              >
                <h3 className={`font-bold ${textTitle} mb-2`}>Protection phytosanitaire</h3>
                <p className={`${textBody} text-sm mb-3`}>Surveillez les maladies et ravageurs. Traitez préventivement avec des produits biologiques.</p>
                <div 
                  className="p-3 rounded-lg backdrop-blur-sm border"
                  style={{
                    background: theme === 'light' ? '#FEE2E2' : 'rgba(239, 68, 68, 0.3)',
                    borderColor: theme === 'light' ? '#EF4444' : 'rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <p className={`text-xs ${textTitle} font-bold`}>Inspection hebdomadaire recommandée</p>
                </div>
              </div>
              <div 
                className="p-6 backdrop-blur-md rounded-xl border-l-4 border"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(251, 146, 60, 0.2)',
                  borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(251, 146, 60, 0.3)',
                  borderLeftColor: '#F59E0B',
                  borderLeftWidth: '4px'
                }}
              >
                <h3 className={`font-bold ${textTitle} mb-2`}>Récolte prévisionnelle</h3>
                <p className={`${textBody} text-sm`}>Préparez vos contenants et planifiez la commercialisation 2 semaines avant la récolte.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className={`text-xl font-bold ${textTitle}`}>
                  {user?.profile?.activity_type === 'buyer' ? 'Offres des Producteurs' : 'Publications des Fournisseurs dans mon Domaine'}
                </h2>
                <button
                  onClick={() => navigate('/feed', { state: { openCreatePost: true } })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm"
                  style={getButtonStyles(theme, 'primary', 'emerald')}
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              <p className={`${textMuted} text-sm`}>Fournisseurs de semences et intrants dans le domaine {user?.profile?.domain === 'agriculture' ? 'Agriculture' : 'Élevage'}</p>
              
              {/* Smart filtering info */}
              {myListings.length > 0 && (
                <div 
                  className="mt-4 p-4 rounded-xl backdrop-blur-sm border"
                  style={{
                    background: theme === 'light' ? '#ECFDF5' : 'rgba(6, 182, 212, 0.2)',
                    borderColor: theme === 'light' ? '#10B981' : 'rgba(6, 182, 212, 0.3)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className={`${textTitle} font-bold text-sm mb-1`}>🎯 Filtrage Intelligent Activé</p>
                      <p className={`${textMuted} text-xs`}>
                        Vos catégories de produits : <span className="font-bold text-cyan-300">{getUserProductCategories(myListings).join(', ')}</span>
                        {getUserProductCategories(myListings).length > 0 && (
                          <span className="block mt-1">Les annonces affichées correspondent à vos produits pour un meilleur ciblage.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(() => {
              const userCategories = getUserProductCategories(myListings);
              const matchingSuppliers = userCategories.length > 0 
                ? [...supplierListings, ...generateMatchingSupplierListings(userCategories)]
                : supplierListings;
              
              return matchingSuppliers.length === 0 ? (
                <div 
                  className="backdrop-blur-md rounded-xl shadow-lg p-12 text-center border"
                  style={{
                    ...getCardStyles(theme, 'emerald'),
                    borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <PackageSearch className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className={`text-xl font-bold ${textTitle} mb-2`}>Aucune publication disponible</h3>
                  <p className={`${textMuted}`}>Les publications apparaîtront ici</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingSuppliers.map((listing: any) => (
                  <div key={listing.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/listings/${listing.id}`)}>
                    {listing.images && listing.images.length > 0 && (
                      <div className="aspect-video bg-white/5 relative overflow-hidden">
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`font-bold ${textTitle} line-clamp-2 flex-1`}>{listing.title}</h3>
                        <span className="px-2 py-1 bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-full whitespace-nowrap">
                          {extractProductCategory(listing.title)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className={`${textMuted}`}>Prix:</span>
                        <span className="font-bold text-emerald-400">{formatPrice(listing.price_per_unit)} {listing.currency}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`${textMuted}`}>Région:</span>
                        <span className={`font-bold ${textTitle}`}>{listing.region}</span>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className={`text-xl font-bold ${textTitle}`}>Demandes des Clients dans mon Domaine</h2>
                <button
                  onClick={() => navigate('/feed', { state: { openCreatePost: true } })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm"
                  style={getButtonStyles(theme, 'primary', 'amber')}
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              <p className={`${textMuted} text-sm`}>Opportunités de vente dans le domaine {user?.profile?.domain === 'agriculture' ? 'Agriculture' : 'Élevage'}</p>
              
              {/* Smart filtering info */}
              {myListings.length > 0 && (
                <div 
                  className="mt-4 p-4 rounded-xl backdrop-blur-sm border"
                  style={{
                    background: theme === 'light' ? '#FEF3C7' : 'rgba(251, 146, 60, 0.2)',
                    borderColor: theme === 'light' ? '#F59E0B' : 'rgba(251, 146, 60, 0.3)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className={`${textTitle} font-bold text-sm mb-1`}>🎯 Filtrage Intelligent Activé</p>
                      <p className={`${textMuted} text-xs`}>
                        Vos catégories de produits : <span className="font-bold text-amber-300">{getUserProductCategories(myListings).join(', ')}</span>
                        {getUserProductCategories(myListings).length > 0 && (
                          <span className="block mt-1">Les demandes affichées correspondent à vos produits pour maximiser vos opportunités de vente.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(() => {
              const userCategories = getUserProductCategories(myListings);
              const matchingRequests = userCategories.length > 0 
                ? [...clientRequests, ...generateMatchingClientRequests(userCategories)]
                : clientRequests;
              
              return matchingRequests.length === 0 ? (
                <div 
                  className="backdrop-blur-md rounded-xl shadow-lg p-12 text-center border"
                  style={{
                    ...getCardStyles(theme, 'amber'),
                    borderColor: theme === 'light' ? '#F59E0B' : 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <ShoppingCart className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2" style={{ color: getTextStyles(theme).title }}>Aucune demande pour le moment</h3>
                  <p style={{ color: getTextStyles(theme).body }}>Les demandes d'achat apparaîtront ici</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchingRequests.map((listing: any) => (
                  <div 
                    key={listing.id} 
                    className="backdrop-blur-md rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer border"
                    style={{
                      ...getCardStyles(theme, 'amber'),
                      borderColor: theme === 'light' ? '#F59E0B' : 'rgba(255, 255, 255, 0.2)'
                    }}
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold rounded-full">DEMANDE CLIENT</span>
                        <span className="text-xs" style={{ color: getTextStyles(theme).muted }}>{listing.seller?.profile?.display_name || 'Client'}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold line-clamp-2 flex-1" style={{ color: getTextStyles(theme).title }}>{listing.title}</h3>
                        <span className="px-2 py-1 bg-purple-500/30 border border-purple-500/50 text-purple-300 text-xs font-bold rounded-full whitespace-nowrap">
                          {extractProductCategory(listing.title)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: getTextStyles(theme).body }}>Quantité demandée:</span>
                          <span className="font-bold" style={{ color: getTextStyles(theme).title }}>{listing.quantity} {listing.unit}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: getTextStyles(theme).body }}>Prix proposé:</span>
                          <span className="font-bold text-emerald-400">{formatPrice(listing.price_per_unit)} FCFA/{listing.unit}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: getTextStyles(theme).body }}>Région:</span>
                          <span className="font-bold" style={{ color: getTextStyles(theme).title }}>{listing.region}</span>
                        </div>
                        <div 
                          className="mt-3 p-2 rounded text-xs backdrop-blur-sm border"
                          style={{
                            background: theme === 'light' ? '#FEF3C7' : 'rgba(255, 255, 255, 0.1)',
                            borderColor: theme === 'light' ? '#F59E0B' : 'rgba(255, 255, 255, 0.2)',
                            color: getTextStyles(theme).body
                          }}
                        >
                          <p className="font-bold">Conditions: Livraison souhaitée | Stockage disponible</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'my-listings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: getTextStyles(theme).title }}>Mes Publications</h2>
                <div className="flex gap-4 text-sm mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span style={{ color: getTextStyles(theme).body }}>{stats.activeListings} Actives</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span style={{ color: getTextStyles(theme).body }}>{stats.totalListings - stats.activeListings} Inactives</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/feed', { state: { openCreatePost: true } })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg hover:scale-105"
                style={getButtonStyles(theme, 'primary', 'emerald')}
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            ) : myListings.length === 0 ? (
              <div 
                className="backdrop-blur-md rounded-xl shadow-lg p-12 text-center border"
                style={{
                  ...getCardStyles(theme, 'emerald'),
                  borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="w-20 h-20 bg-emerald-500/30 border-2 border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: getTextStyles(theme).title }}>Aucune publication</h3>
                <p className="mb-6 max-w-md mx-auto" style={{ color: getTextStyles(theme).body }}>
                  {getEmptyStateMessage()}
                </p>
                <button
                  onClick={() => navigate('/feed')}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all border-2"
                  style={getButtonStyles(theme, 'primary', 'emerald')}
                >
                  <Plus className="h-5 w-5" />
                  <span>Créer ma première publication</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                      border: theme === 'light' ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {/* Image Section */}
                    {listing.images && listing.images.length > 0 ? (
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <span 
                            className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-md"
                            style={{
                              background: (listing.status === 'active' || listing.status === 'PUBLISHED') 
                                ? 'rgba(16, 185, 129, 0.9)' 
                                : 'rgba(156, 163, 175, 0.9)',
                              color: '#FFFFFF'
                            }}
                          >
                            {(listing.status === 'active' || listing.status === 'PUBLISHED') ? '✓ Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white text-2xl font-bold">
                            {formatPrice(listing.price_per_unit)} <span className="text-sm font-normal opacity-80">{listing.currency}/{listing.unit}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="aspect-video flex items-center justify-center"
                        style={{ background: theme === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <Package className="h-16 w-16" style={{ color: theme === 'light' ? '#9CA3AF' : 'rgba(255, 255, 255, 0.3)' }} />
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-3 line-clamp-2" style={{ color: getTextStyles(theme).title }}>
                        {listing.title}
                      </h3>
                      
                      {/* Info Grid */}
                      <div 
                        className="rounded-xl p-4 mb-4 space-y-3"
                        style={{ 
                          background: theme === 'light' ? '#F9FAFB' : 'rgba(255, 255, 255, 0.05)',
                          border: theme === 'light' ? '1px solid #E5E7EB' : '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: getTextStyles(theme).muted }}>📦 Quantité</span>
                          <span className="font-bold" style={{ color: getTextStyles(theme).title }}>
                            {listing.quantity} {listing.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: getTextStyles(theme).muted }}>📍 Région</span>
                          <span className="font-bold" style={{ color: getTextStyles(theme).title }}>{listing.region}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: getTextStyles(theme).muted }}>📅 Publié</span>
                          <span style={{ color: getTextStyles(theme).body }}>{formatDate(listing.created_at)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/listings/${listing.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 text-sm"
                          style={{
                            background: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.3)',
                            color: theme === 'light' ? '#FFFFFF' : '#6EE7B7',
                            border: theme === 'light' ? 'none' : '1px solid rgba(16, 185, 129, 0.5)'
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span>Voir</span>
                        </button>
                        <button 
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 text-sm"
                          style={{
                            background: theme === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.1)',
                            color: getTextStyles(theme).title,
                            border: theme === 'light' ? '1px solid #D1D5DB' : '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span>Modifier</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Supprimer cette publication ?')) {
                              const updatedListings = JSON.parse(localStorage.getItem('my_local_listings') || '[]')
                                .filter((l: any) => l.id !== listing.id);
                              localStorage.setItem('my_local_listings', JSON.stringify(updatedListings));
                              setMyListings(prev => prev.filter(l => l.id !== listing.id));
                            }
                          }}
                          className="p-2.5 rounded-xl transition-all hover:scale-105"
                          style={{
                            background: theme === 'light' ? '#FEE2E2' : 'rgba(239, 68, 68, 0.2)',
                            color: theme === 'light' ? '#DC2626' : '#F87171',
                            border: theme === 'light' ? '1px solid #FECACA' : '1px solid rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
