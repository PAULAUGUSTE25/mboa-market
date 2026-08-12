import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { MessageCircle, Heart, MapPin, Package, Plus, X, ShoppingCart, Globe, Wheat, Beef, PackageSearch, Sprout, User, Send, Search, Clock, TrendingUp, TrendingDown, Minus, Sparkles, Star, Home, Activity, ShoppingBag, Leaf, Truck, BarChart3, Users, Phone, MoreVertical } from 'lucide-react';
import Logo from '@/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { getCardStyles, getTextStyles, getInputStyles, getButtonStyles } from '@/utils/cardStyles';
import { getDomainColors } from '@/utils/colors';
import { useDomain } from '@/contexts/DomainContext';
import { voiceAssistant } from '@/services/voiceAssistant';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import OrderModal from '@/components/OrderModal';

interface Listing {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  variety?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  region: string;
  locality?: string;
  status: string;
  created_at: string;
  images?: string[];
  seller?: {
    profile: {
      display_name: string;
      activity_type: string;
      domain?: string;
    };
  };
}

interface Category {
  id: string;
  name_fr: string;
  name_en: string;
}

const LOCAL_LISTINGS_KEY = 'local_created_listings';

const normalizeValue = (value?: string | number) =>
  String(value ?? '').trim().toLowerCase();

export default function FeedPage() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { selectedDomain: selectedSector, setSelectedDomain: setSelectedSector } = useDomain();
  const { t, lang } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<'domain' | 'specialization'>('domain');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [toastMessage, setToastMessage] = useState<{text: string; type: 'success' | 'info'} | null>(null);
  const [activeStory, setActiveStory] = useState<{id: number; name: string; image: string; time: string} | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.profile?.domain) {
      setSelectedSector(user.profile.domain as 'agriculture' | 'elevage');
    }
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(new Set(savedFavorites));
    // Load search history
    const savedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(savedHistory);
    // Simulate unread messages (in real app, fetch from API)
    setUnreadMessages(Math.floor(Math.random() * 5) + 1);
  }, [user]);

  const toggleFavorite = (listingId: string, listingTitle?: string) => {
    const newFavorites = new Set(favorites);
    const wasAdded = !newFavorites.has(listingId);
    
    if (wasAdded) {
      newFavorites.add(listingId);
      setToastMessage({ text: `"${listingTitle || t('Article', 'Item')}" ${t('aimé', 'liked')}`, type: 'success' });
    } else {
      newFavorites.delete(listingId);
      setToastMessage({ text: t('J\'aime retiré', 'Like removed'), type: 'info' });
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
    
    // Auto-hide toast after 2.5 seconds
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory.slice(0, 4)];
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    setSearchFocused(false);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Get search suggestions based on listings
  const getSearchSuggestions = () => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    const suggestions: string[] = [];
    
    listings.forEach(listing => {
      if (listing.title?.toLowerCase().includes(query) && !suggestions.includes(listing.title)) {
        suggestions.push(listing.title);
      }
      if (listing.variety?.toLowerCase().includes(query) && !suggestions.includes(listing.variety)) {
        suggestions.push(listing.variety);
      }
      if (listing.region?.toLowerCase().includes(query) && !suggestions.includes(listing.region)) {
        suggestions.push(listing.region);
      }
    });
    
    return suggestions.slice(0, 5);
  };

  // Get trending searches (most common products)
  const trendingSearches = ['Maïs', 'Cacao', 'Café', 'Manioc', 'Plantain'];

  // Create post form state
  const [newPost, setNewPost] = useState({
    category_id: '',
    title: '',
    variety: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    currency: 'XAF',
    region: '',
    locality: '',
    image_url: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Chat modal state
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'me' | 'seller'; text: string; time: string }>>([]);
  const [activeListingMenuId, setActiveListingMenuId] = useState<string | null>(null);
  const [orderListing, setOrderListing] = useState<Listing | null>(null);
  
  // Demo chat state for sidebar contacts
  const [showDemoChat, setShowDemoChat] = useState(false);
  const [demoChatContact, setDemoChatContact] = useState<{id: string; name: string; domain: string; activityType: string; lastProduct: string; region: string} | null>(null);
  const [demoChatMessages, setDemoChatMessages] = useState<Array<{ sender: 'me' | 'seller'; text: string; time: string }>>([]);
  const [demoChatInput, setDemoChatInput] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle'); // idle, listening, processing, speaking

  const getStoredLocalListings = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_LISTINGS_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  };

  const saveCreatedListingLocally = (listing: any) => {
    const current = getStoredLocalListings();
    const next = [listing, ...current.filter((item: any) => item.id !== listing.id)];
    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(next));
  };

  const isSameListing = (a: any, b: any) => {
    return (
      normalizeValue(a.title) === normalizeValue(b.title) &&
      Number(a.price_per_unit || 0) === Number(b.price_per_unit || 0) &&
      Number(a.quantity || 0) === Number(b.quantity || 0) &&
      normalizeValue(a.unit) === normalizeValue(b.unit) &&
      normalizeValue(a.region) === normalizeValue(b.region) &&
      normalizeValue(a.locality) === normalizeValue(b.locality)
    );
  };

  const syncLocalListingsWithApi = (localListings: any[], apiListings: any[]) => {
    const remainingLocal = localListings.filter((local) => {
      if (!String(local.id || '').startsWith('local-')) return true;
      return !apiListings.some((apiListing) => isSameListing(local, apiListing));
    });

    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(remainingLocal));
    return remainingLocal;
  };

  // Intelligent demo response generator - analyzes user message and responds contextually
  const getIntelligentResponse = (userMessage: string, contact: {name: string; activityType: string; lastProduct: string; region: string}, messageCount: number): string => {
    const msg = userMessage.toLowerCase();
    const product = contact.lastProduct;
    const sellerType = contact.activityType === 'producer' ? 'producteur' : contact.activityType === 'seed_provider' ? 'fournisseur' : 'acheteur';
    
    // Greeting responses
    if (msg.includes('bonjour') || msg.includes('salut') || msg.includes('hello') || msg.includes('bonsoir')) {
      return `Bonjour! Ravi de vous parler. Je suis ${contact.name}, ${sellerType} de ${product}. Comment puis-je vous aider aujourd'hui? 😊`;
    }
    
    // Price inquiries
    if (msg.includes('prix') || msg.includes('combien') || msg.includes('coût') || msg.includes('tarif') || msg.includes('cher')) {
      const prices = ['15 000', '25 000', '8 000', '12 500', '18 000'];
      const randomPrice = prices[Math.floor(Math.random() * prices.length)];
      return `Pour le ${product}, le prix est de ${randomPrice} FCFA par unité. Mais je peux vous faire un bon prix si vous prenez une grande quantité! Combien vous en faut-il? 💰`;
    }
    
    // Quantity inquiries
    if (msg.includes('quantité') || msg.includes('stock') || msg.includes('disponible') || msg.includes('reste') || msg.match(/\d+\s*(kg|tonnes?|sacs?|unités?)/)) {
      return `Oui, j'ai encore du stock disponible! Je peux vous fournir jusqu'à 500kg de ${product} de qualité supérieure. Pour les grosses commandes, je fais une réduction de 10%. 📦`;
    }
    
    // Delivery inquiries
    if (msg.includes('livr') || msg.includes('transport') || msg.includes('envoi') || msg.includes('expédi')) {
      return `Je livre dans toute la région de ${contact.region} et ses environs. Pour les commandes de plus de 100kg, la livraison est gratuite! Sinon c'est 2000 FCFA. Où êtes-vous situé exactement? 🚚`;
    }
    
    // Location inquiries
    if (msg.includes('où') || msg.includes('adresse') || msg.includes('situé') || msg.includes('localisation') || msg.includes('douala') || msg.includes('yaoundé') || msg.includes('bafoussam')) {
      return `Je suis basé à ${contact.region}. Je peux vous rencontrer au marché central ou livrer directement chez vous. Quelle option vous arrange le mieux? 📍`;
    }
    
    // Payment inquiries
    if (msg.includes('paiement') || msg.includes('payer') || msg.includes('mobile money') || msg.includes('orange') || msg.includes('mtn') || msg.includes('cash')) {
      return `J'accepte plusieurs modes de paiement: Mobile Money (Orange/MTN), paiement à la livraison, ou virement bancaire. Pour les nouveaux clients, je recommande le paiement à la livraison pour plus de confiance. 💳`;
    }
    
    // Quality inquiries
    if (msg.includes('qualité') || msg.includes('frais') || msg.includes('bio') || msg.includes('certif') || msg.includes('garanti')) {
      return `Mon ${product} est de première qualité! Je travaille avec des méthodes traditionnelles et respectueuses de l'environnement. Tous mes produits sont frais et je garantis la satisfaction. Vous pouvez vérifier avant d'acheter! ✅`;
    }
    
    // Negotiation
    if (msg.includes('négoci') || msg.includes('réduction') || msg.includes('remise') || msg.includes('moins cher') || msg.includes('discount')) {
      return `Je comprends! Pour vous, je peux faire un effort. Si vous prenez plus de 50kg, je vous fais -15%. Et si vous devenez un client régulier, on peut discuter d'un partenariat à long terme. Qu'en pensez-vous? 🤝`;
    }
    
    // Order/Buy intent
    if (msg.includes('commander') || msg.includes('acheter') || msg.includes('prendre') || msg.includes('veux') || msg.includes('besoin') || msg.includes('intéress')) {
      return `Parfait! Je suis ravi de votre intérêt pour mon ${product}. Pour finaliser la commande, j'ai besoin de: 1) La quantité souhaitée, 2) Votre localisation pour la livraison, 3) Votre numéro de téléphone. On peut aussi se retrouver au marché si vous préférez! 📝`;
    }
    
    // Thank you responses
    if (msg.includes('merci') || msg.includes('thanks') || msg.includes('super') || msg.includes('parfait') || msg.includes('excellent')) {
      return `C'est moi qui vous remercie! N'hésitez pas si vous avez d'autres questions. Je suis disponible tous les jours de 7h à 19h. Au plaisir de faire affaire avec vous! 🙏`;
    }
    
    // Phone number
    if (msg.match(/\d{9}/) || msg.includes('numéro') || msg.includes('téléphone') || msg.includes('appel')) {
      return `Merci! Je vous enregistre. Je vous appellerai demain matin pour confirmer les détails de la commande. Vous pouvez aussi me joindre sur WhatsApp pour plus de facilité. À très bientôt! 📱`;
    }
    
    // Goodbye
    if (msg.includes('au revoir') || msg.includes('bye') || msg.includes('à bientôt') || msg.includes('ciao')) {
      return `Au revoir et à très bientôt! N'hésitez pas à revenir vers moi pour vos besoins en ${product}. Bonne journée! 👋`;
    }
    
    // Default contextual responses based on conversation progress
    const defaultResponses = [
      `Bien sûr! Mon ${product} vient directement de ma production à ${contact.region}. C'est du 100% local et frais. Avez-vous des questions sur le prix ou la livraison?`,
      `Je travaille dans ce domaine depuis plus de 5 ans. Ma spécialité c'est le ${product} de qualité. Beaucoup de clients reviennent régulièrement. Que puis-je faire pour vous?`,
      `Absolument! Je peux vous montrer des photos de mon ${product} si vous voulez. La qualité est garantie. Dites-moi quelle quantité vous intéresse.`,
      `Je comprends. Pour le ${product}, c'est la bonne saison en ce moment. Les prix sont avantageux. Voulez-vous que je vous réserve une quantité?`,
      `Très bien! Je note votre demande. Je peux préparer votre commande rapidement. Préférez-vous récupérer au marché ou une livraison à domicile?`
    ];
    
    return defaultResponses[messageCount % defaultResponses.length];
  };

  // Save conversation to localStorage for ChatPage
  const saveConversationToStorage = (contact: {id: string; name: string; domain: string; activityType: string; lastProduct: string; region: string}, messages: Array<{sender: 'me' | 'seller'; text: string; time: string}>) => {
    const conversationId = `conv-${contact.id}`;
    const existingConversations = JSON.parse(localStorage.getItem('demo_conversations') || '[]');
    
    // Find or create conversation
    const existingIndex = existingConversations.findIndex((c: any) => c.id === conversationId);
    
    const conversationData = {
      id: conversationId,
      participant_id: contact.id,
      participant_name: contact.name,
      last_message: messages[messages.length - 1]?.text || '',
      unread_count: 0,
      updated_at: new Date().toISOString(),
      listing_id: null,
      messages: messages
    };
    
    if (existingIndex >= 0) {
      existingConversations[existingIndex] = conversationData;
    } else {
      existingConversations.unshift(conversationData);
    }
    
    localStorage.setItem('demo_conversations', JSON.stringify(existingConversations));
  };

  const startDemoChat = (contact: {id: string; name: string; domain: string; activityType: string; lastProduct: string; region: string}) => {
    setDemoChatContact(contact);
    const sellerType = contact.activityType === 'producer' ? 'producteur' : contact.activityType === 'seed_provider' ? 'fournisseur' : 'acheteur';
    const initialMessage = {
      sender: 'seller' as const,
      text: `Bonjour! 👋 Je suis ${contact.name}, ${sellerType} basé à ${contact.region}. Je vois que vous vous intéressez à mon ${contact.lastProduct}. C'est un excellent choix! Comment puis-je vous aider aujourd'hui?`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    setDemoChatMessages([initialMessage]);
    setShowDemoChat(true);
    setDemoChatInput('');
    
    // Save initial conversation to localStorage
    saveConversationToStorage(contact, [initialMessage]);
  };

  const sendDemoMessage = () => {
    if (!demoChatInput.trim() || !demoChatContact) return;
    
    const userText = demoChatInput.trim();
    const newMessage = {
      sender: 'me' as const,
      text: userText,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...demoChatMessages, newMessage];
    setDemoChatMessages(updatedMessages);
    setDemoChatInput('');
    
    // Save to localStorage immediately
    saveConversationToStorage(demoChatContact, updatedMessages);
    
    // Simulate typing indicator delay then intelligent response
    const typingDelay = 800 + Math.random() * 1200;
    
    setTimeout(() => {
      const response = getIntelligentResponse(userText, demoChatContact, demoChatMessages.length);
      const sellerMessage = {
        sender: 'seller' as const,
        text: response,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setDemoChatMessages(prev => {
        const newMessages = [...prev, sellerMessage];
        // Save updated conversation with seller response
        saveConversationToStorage(demoChatContact, newMessages);
        return newMessages;
      });
    }, typingDelay);
  };

  // Voice Assistant Functions
  const toggleVoiceAssistant = () => {
    if (isVoiceActive) {
      stopVoiceAssistant();
    } else {
      startVoiceAssistant();
    }
  };

  const startVoiceAssistant = () => {
    setIsVoiceActive(true);
    setVoiceStatus('listening');
    voiceAssistant.startListening();
    
    // Add visual feedback
    setTimeout(() => {
      setVoiceStatus('processing');
    }, 3000);
    
    // Reset status after processing
    setTimeout(() => {
      setVoiceStatus('idle');
    }, 5000);
  };

  const stopVoiceAssistant = () => {
    setIsVoiceActive(false);
    setVoiceStatus('idle');
    voiceAssistant.stopListening();
  };

  // Initialize voice assistant on component mount
  useEffect(() => {
    // Check if speech recognition is supported
    const status = voiceAssistant.getStatus();
    if (!status.isSupported) {
      console.warn('Speech recognition not supported in this browser');
    }
    
    return () => {
      // Cleanup on unmount
      if (isVoiceActive) {
        voiceAssistant.stopListening();
      }
    };
  }, []);

  useEffect(() => {
    loadFeed();
    loadCategories();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      
      // Import demo listings generator (always show)
      const { generateDemoListings } = await import('@/data/demoListings');
      let demoListings = generateDemoListings();
      
      // Only show demo listings with images
      demoListings = demoListings.filter((listing: any) => listing.images && listing.images.length > 0);
      
      // Load real listings from API
      let realListings: any[] = [];
      try {
        const response = await api.getListings({ page: 1, page_size: 50, status: 'PUBLISHED' });
        realListings = response.items || [];
        
        // If no PUBLISHED listings, try loading all
        if (realListings.length === 0) {
          const allResponse = await api.getListings({ page: 1, page_size: 50 });
          realListings = allResponse.items || [];
        }
      } catch (apiError) {
        // Chargement des annonces réelles échoué, affichage des données de démonstration
      }
      
      const localListings = getStoredLocalListings();
      const syncedLocalListings = syncLocalListingsWithApi(localListings, realListings);

      // Combine local + demo + real listings, deduplicated by id
      const merged = [...syncedLocalListings, ...demoListings, ...realListings];
      const uniqueById = merged.filter((listing: any, index: number, arr: any[]) =>
        index === arr.findIndex((item: any) => item.id === listing.id)
      );

      setListings(uniqueById);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      
      // If no categories from API, use demo categories
      if (!data || data.length === 0) {
        const demoCategories = [
          { id: 'agriculture', name_fr: 'Agriculture', name_en: 'Agriculture' },
          { id: 'elevage', name_fr: 'Élevage', name_en: 'Livestock' }
        ];
        setCategories(demoCategories);
      } else {
        setCategories(data);
      }
    } catch (error) {
      // Fallback to demo categories on error
      const demoCategories = [
        { id: 'agriculture', name_fr: 'Agriculture', name_en: 'Agriculture' },
        { id: 'elevage', name_fr: 'Élevage', name_en: 'Livestock' }
      ];
      setCategories(demoCategories);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        errors.push(`${file.name}: Format non supporté`);
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Fichier trop grand (max 5MB)`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('⚠️ Certains fichiers n\'ont pas pu être ajoutés:\n' + errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Create preview URLs with compression for images
    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Compress image
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setPreviewUrls(prev => [...prev, compressedDataUrl]);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        // Video - no compression
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim() || !selectedListing) return;

    const newMessage = {
      sender: 'me' as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatMessage('');

    // Simulation de réponse contextuelle du vendeur basée sur le message
    setTimeout(() => {
      const userMsg = newMessage.text.toLowerCase();
      let response = '';
      
      // Réponses contextuelles basées sur les mots-clés
      if (userMsg.includes('prix') || userMsg.includes('coût') || userMsg.includes('combien')) {
        response = `Le prix est de ${selectedListing?.price_per_unit || '500'} ${selectedListing?.currency || 'XAF'}/${selectedListing?.unit || 'kg'}. C'est négociable pour les grandes quantités.`;
      } else if (userMsg.includes('disponible') || userMsg.includes('stock')) {
        response = 'Oui, le produit est toujours disponible! J\'ai actuellement en stock.';
      } else if (userMsg.includes('livraison') || userMsg.includes('livrer')) {
        response = 'Je peux vous faire une livraison si vous êtes dans la région. Où êtes-vous situé?';
      } else if (userMsg.includes('qualité') || userMsg.includes('état')) {
        response = 'La qualité est excellente! Produit frais et de première qualité.';
      } else if (userMsg.includes('quantité') || userMsg.includes('combien')) {
        response = `J'ai ${selectedListing?.quantity || '100'} ${selectedListing?.unit || 'kg'} disponibles actuellement.`;
      } else if (userMsg.includes('quand') || userMsg.includes('date')) {
        response = 'Je suis disponible tous les jours. Quand souhaitez-vous récupérer la commande?';
      } else if (userMsg.includes('où') || userMsg.includes('lieu') || userMsg.includes('localisation')) {
        response = `Je suis situé à ${selectedListing?.locality || selectedListing?.region || 'Yaoundé'}. On peut se rencontrer là-bas.`;
      } else if (userMsg.includes('bonjour') || userMsg.includes('salut') || userMsg.includes('hello')) {
        response = 'Bonjour! Comment puis-je vous aider avec ce produit?';
      } else if (userMsg.includes('merci')) {
        response = 'De rien! N\'hésitez pas si vous avez d\'autres questions.';
      } else {
        // Réponses générales si pas de mot-clé spécifique
        const generalResponses = [
          'D\'accord, je note votre demande.',
          'Oui, je comprends. Que puis-je faire pour vous?',
          'Parfait! Dites-moi ce dont vous avez besoin.',
          'Je suis à votre disposition pour plus d\'informations.'
        ];
        response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
      }
      
      setChatMessages(prev => [...prev, {
        sender: 'seller',
        text: response,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const handleCloseChatModal = async () => {
    // Save conversation before closing
    if (chatMessages.length > 1 && selectedListing) {
      const myMessages = chatMessages.filter(m => m.sender === 'me').map(m => m.text).join('\n');
      
      if (myMessages.trim()) {
        // Check if this is a demo listing
        const isDemoListing = selectedListing.id.startsWith('demo-') || selectedListing.id.startsWith('local-') || 
                              selectedListing.seller_id.startsWith('user-') || selectedListing.seller_id.startsWith('demo-');
        
        if (isDemoListing) {
          // For demo listings, save to localStorage
          try {
            const existingConversations = JSON.parse(localStorage.getItem('demo_conversations') || '[]');
            
            const newConversation = {
              id: `conv-${Date.now()}`,
              participant_id: selectedListing.seller_id,
              participant_name: selectedListing.seller?.profile?.display_name || 'Vendeur',
              listing_id: selectedListing.id,
              listing: {
                id: selectedListing.id,
                title: selectedListing.title,
                price_per_unit: selectedListing.price_per_unit,
                currency: selectedListing.currency || 'XAF',
                unit: selectedListing.unit || 'kg',
                images: selectedListing.images
              },
              messages: chatMessages,
              last_message: chatMessages[chatMessages.length - 1].text,
              unread_count: 0,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            };
            
            existingConversations.unshift(newConversation);
            localStorage.setItem('demo_conversations', JSON.stringify(existingConversations));
            
            alert('Conversation sauvegardée! Vous pouvez la retrouver dans l\'onglet Messages.');
          } catch (error) {
            alert('Erreur lors de la sauvegarde locale.');
          }
        } else {
          // Real listing - save to backend
          try {
            const result = await api.createConversation({
              participant_user_id: selectedListing.seller_id,
              listing_id: selectedListing.id,
              initial_message: myMessages
            });
            
            alert('Conversation sauvegardée! Vous pouvez la retrouver dans l\'onglet Messages.');
          } catch (error: any) {
            alert(`Erreur lors de la sauvegarde: ${error?.response?.data?.message || error?.message || 'Erreur inconnue'}`);
          }
        }
      }
    }
    
    setShowChatModal(false);
    setSelectedListing(null);
    setChatMessages([]);
    setChatMessage('');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Validate domain - user can only post in their domain
    const userDomain = user.profile?.domain;
    if (!userDomain) {
      alert('❌ Erreur: Votre profil doit avoir un domaine défini (agriculture ou élevage)');
      return;
    }

    try {
      // Create listing data
      const listingData: any = {
        category_id: newPost.category_id || (selectedSector === 'all' ? 'agriculture' : selectedSector),
        title: newPost.title,
        variety: newPost.variety || undefined,
        quantity: parseFloat(newPost.quantity),
        unit: newPost.unit,
        price_per_unit: parseFloat(newPost.price_per_unit),
        currency: newPost.currency,
        region: newPost.region,
        locality: newPost.locality || undefined,
        domain: userDomain,
        status: 'PUBLISHED'
      };

      // If files are selected, use them; otherwise use URL if provided
      if (selectedFiles.length > 0) {
        // Store preview URLs as images (base64 data URLs)
        listingData.images = previewUrls;
      } else if (newPost.image_url) {
        listingData.images = [newPost.image_url];
      }

      let createdListing: any = null;
      try {
        // Try to create via API
        createdListing = await api.createListing(listingData);
      } catch (apiError) {
        // Fallback: local listing
      }

      const listingToDisplay = createdListing || {
        id: `local-${Date.now()}`,
        seller_id: user.id,
        ...listingData,
        created_at: new Date().toISOString(),
        seller: {
          profile: {
            display_name: user.profile?.display_name || 'Utilisateur',
            activity_type: user.profile?.activity_type,
            domain: userDomain
          }
        }
      };

      // Keep user's newly created listing visible in feed and activity
      saveCreatedListingLocally(listingToDisplay);
      setListings(prev => [listingToDisplay, ...prev.filter(item => item.id !== listingToDisplay.id)]);

      // Reset form
      setNewPost({
        category_id: selectedSector === 'all' ? 'agriculture' : selectedSector,
        title: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        price_per_unit: '',
        currency: 'XAF',
        region: '',
        locality: '',
        image_url: ''
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setShowCreatePost(false);
      
      alert('Publication créée avec succès!');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur inconnue';
      alert(`Erreur lors de la création de la publication: ${errorMessage}`);
    }
  };

  const filteredListings = listings.filter(listing => {
    const userActivityType = user?.profile?.activity_type || 'producer';
    const sellerActivityType = listing.seller?.profile?.activity_type;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        listing.title?.toLowerCase().includes(query) ||
        listing.variety?.toLowerCase().includes(query) ||
        listing.region?.toLowerCase().includes(query) ||
        listing.seller?.profile?.display_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    // If specialization filter is active, show only relevant content for user's activity type
    if (selectedFilter === 'specialization' && user) {
      // FOURNISSEUR: Voit les demandes (ACHAT)
      if (userActivityType === 'seed_provider') {
        return listing.title?.includes('ACHAT:') || sellerActivityType === 'buyer';
      }
      
      // PRODUCTEUR: Voit les demandes des fournisseurs et acheteurs
      if (userActivityType === 'producer') {
        return listing.title?.includes('FOURNITURE:') || 
               sellerActivityType === 'seed_provider' || 
               sellerActivityType === 'buyer';
      }
      
      // ACHETEUR: Voit les offres des producteurs
      if (userActivityType === 'buyer') {
        return listing.title?.includes('VENTE:') || sellerActivityType === 'producer';
      }
    }
    
    // Domain filter mode (default)
    // Filter by sector selector (all/agriculture/elevage)
    if (selectedSector !== 'all') {
      if (listing.seller?.profile?.domain !== selectedSector) {
        return false;
      }
    }
    
    return true;
  });

  const translateName = (name: string) => {
    if (lang === 'en') {
      return name
        .replace(/\bProducteur\b/g, 'Producer')
        .replace(/\bAcheteur\b/g, 'Buyer')
        .replace(/\bFournisseur\b/g, 'Supplier');
    }
    return name;
  };

  const translateTitle = (title: string) => {
    if (lang === 'en') {
      return title
        .replace(/^VENTE:\s*/i, 'SALE: ')
        .replace(/^ACHAT:\s*/i, 'BUY: ')
        .replace(/^FOURNITURE:\s*/i, 'SUPPLY: ');
    }
    return title;
  };

  const isVideoMedia = (mediaUrl: string) => {
    if (!mediaUrl) return false;
    const lowered = mediaUrl.toLowerCase();
    return lowered.startsWith('data:video/') || /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(lowered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (lang === 'en') {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-GB');
    }
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#060D0A]' : 'bg-[#F0F2F5]'}`} style={{ fontFamily: 'Inter, Plus Jakarta Sans, sans-serif' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div 
            className={`px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl flex items-center gap-2 ${
              toastMessage.type === 'success' 
                ? 'bg-gradient-to-r from-emerald-500/90 to-green-500/90 text-white' 
                : 'bg-gradient-to-r from-gray-500/90 to-slate-500/90 text-white'
            }`}
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
          >
            <span className="text-sm font-medium">{toastMessage.text}</span>
            <span className="text-xs opacity-75">({favorites.size} {t('j\'aime', 'likes')})</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#060D0A]/80 backdrop-blur-xl shadow-sm border-b border-white/10' : 'bg-white shadow-sm border-b border-gray-200'}`} style={{ userSelect: 'none', boxShadow: theme === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.1)' : undefined }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo Responsive - Optimisé pour mobile */}
            <div className="flex-shrink-0">
              <Logo size="xs" className="sm:hidden" />
              <Logo size="sm" className="hidden sm:block md:hidden" />
              <Logo size="md" className="hidden md:block" />
            </div>

            {/* Advanced Search Bar with Dropdown */}
            <div className="flex-1 max-w-md hidden sm:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder={t('Rechercher produits, vendeurs...', 'Search products, sellers...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm transition-all ${searchFocused ? 'rounded-t-2xl rounded-b-none' : 'rounded-full'}`}
                  style={{
                    ...getInputStyles(theme),
                    boxShadow: searchFocused ? '0 4px 20px rgba(0,0,0,0.15)' : undefined
                  }}
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                ) : (
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-pulse" style={{ color: getDomainColors(selectedSector).primary }} />
                )}
              </div>
              
              {/* Search Dropdown */}
              {searchFocused && (
                <div 
                  className={`absolute top-full left-0 right-0 rounded-b-2xl shadow-2xl border-t-0 overflow-hidden z-50 ${theme === 'dark' ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-gray-200'}`}
                  style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
                >
                  {/* Search Suggestions */}
                  {searchQuery && getSearchSuggestions().length > 0 && (
                    <div className="p-2">
                      <p className="px-3 py-1 text-xs font-semibold flex items-center gap-1.5" style={{ color: getTextStyles(theme).muted }}>
                        <Sparkles className="h-3 w-3" /> Suggestions
                      </p>
                      {getSearchSuggestions().map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(suggestion)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                          style={{ color: getTextStyles(theme).body }}
                        >
                          <Search className="h-3.5 w-3.5" style={{ color: getDomainColors(selectedSector).primary }} />
                          <span dangerouslySetInnerHTML={{ 
                            __html: suggestion.replace(new RegExp(`(${searchQuery})`, 'gi'), `<strong style="color: ${getDomainColors(selectedSector).primary}">$1</strong>`) 
                          }} />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Search History */}
                  {!searchQuery && searchHistory.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center justify-between px-3 py-1">
                        <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: getTextStyles(theme).muted }}>
                          <Clock className="h-3 w-3" /> Recherches récentes
                        </p>
                        <button 
                          onClick={clearSearchHistory}
                          className="text-xs text-red-500 hover:text-red-600 transition-colors"
                        >
                          Effacer
                        </button>
                      </div>
                      {searchHistory.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(item)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                          style={{ color: getTextStyles(theme).body }}
                        >
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Trending Searches */}
                  {!searchQuery && (
                    <div className={`p-2 ${searchHistory.length > 0 ? `border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}` : ''}`}>
                      <p className="px-3 py-1 text-xs font-semibold flex items-center gap-1.5" style={{ color: getTextStyles(theme).muted }}>
                        <TrendingUp className="h-3 w-3" /> Tendances
                      </p>
                      <div className="flex flex-wrap gap-2 px-3 py-2">
                        {trendingSearches.map((trend, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSearch(trend)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 hover:opacity-80"
                            style={{ backgroundColor: `${getDomainColors(selectedSector).primary}20`, color: getDomainColors(selectedSector).primary }}
                          >
                            {trend}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Favorites Quick Access */}
                  {favorites.size > 0 && !searchQuery && (
                    <div className={`p-2 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                      <p className="px-3 py-1 text-xs font-semibold flex items-center gap-1.5" style={{ color: getTextStyles(theme).muted }}>
                        <Star className="h-3 w-3 text-amber-500" /> {t('Mes j\'aime', 'My likes')} ({favorites.size})
                      </p>
                      <button
                        onClick={() => navigate('/listings?favorites=true')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-amber-50 text-amber-600'}`}
                      >
                        <Heart className="h-3.5 w-3.5 fill-current" />
                        {t('Voir mes', 'View my')} {favorites.size} {t('j\'aime', 'likes')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: getTextStyles(theme).muted }}
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
                <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
                <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
              </div>
            </button>
            
            {/* Voice Assistant Button - Optimisé et centré */}
            <button 
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 shadow-sm hover:scale-105 group flex items-center justify-center"
              onClick={toggleVoiceAssistant}
              style={{ 
                backgroundColor: isVoiceActive 
                  ? getDomainColors(selectedSector).primary 
                  : theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',
                color: isVoiceActive 
                  ? '#FFFFFF' 
                  : getTextStyles(theme).muted
              }}
              title="Assistant Vocal Bigiss"
            >
              {isVoiceActive ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
              {/* Voice status indicator */}
              {isVoiceActive && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full animate-pulse" 
                  style={{ 
                    backgroundColor: voiceStatus === 'listening' ? '#10B981' : 
                                     voiceStatus === 'processing' ? '#F59E0B' : '#6B7280'
                  }} />
              )}
            </button>
            
            {/* Mobile Search Icon */}
            <button 
              className="sm:hidden p-2 rounded-full transition-colors"
              onClick={() => setSearchFocused(!searchFocused)}
              style={{ color: getTextStyles(theme).muted }}
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* All Navigation Icons Grouped Together */}
            <div className={`flex items-center gap-2 rounded-full p-1.5 shadow-sm ${theme === 'dark' ? 'bg-white/[0.05] border border-white/10' : 'bg-gray-100'}`}>
              {/* Domain Filter - Icon Only */}
              <div className={`relative inline-flex rounded-full p-1 shadow-sm ${theme === 'dark' ? 'bg-white/[0.05] border border-white/10' : 'bg-white'}`}>
                <div
                  className="absolute top-1 bottom-1 rounded-full shadow-md transition-all duration-300 ease-out"
                  style={{
                    left: selectedSector === 'all' ? '2px' : selectedSector === 'agriculture' ? 'calc(33.33% + 1px)' : 'calc(66.66%)',
                    width: 'calc(33.33% - 2px)',
                    backgroundColor: theme === 'dark' ? `${getDomainColors(selectedSector).primary}30` : getDomainColors(selectedSector).primary,
                    border: theme === 'dark' ? `1px solid ${getDomainColors(selectedSector).primary}50` : 'none'
                  }}
                />
                
                <button
                  onClick={() => { setSelectedSector('all'); setSelectedFilter('domain'); }}
                  className="relative z-10 px-3 sm:px-4 py-2 rounded-full transition-all duration-300"
                  style={{
                    color: selectedSector === 'all'
                      ? (theme === 'dark' ? '#6EE7B7' : '#FFFFFF')
                      : getTextStyles(theme).muted
                  }}
                  title="Tout"
                >
                  <Globe className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  onClick={() => { setSelectedSector('agriculture'); setSelectedFilter('domain'); }}
                  className="relative z-10 px-3 sm:px-4 py-2 rounded-full transition-all duration-300"
                  style={{
                    color: selectedSector === 'agriculture'
                      ? (theme === 'dark' ? '#6EE7B7' : '#FFFFFF')
                      : getTextStyles(theme).muted
                  }}
                  title="Agriculture"
                >
                  <Wheat className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  onClick={() => { setSelectedSector('elevage'); setSelectedFilter('domain'); }}
                  className="relative z-10 px-3 sm:px-4 py-2 rounded-full transition-all duration-300"
                  style={{
                    color: selectedSector === 'elevage'
                      ? (theme === 'dark' ? '#FCD34D' : '#FFFFFF')
                      : getTextStyles(theme).muted
                  }}
                  title="Élevage"
                >
                  <Beef className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>

              {/* Activity Type - Navigate to dedicated page */}
              {user && (
                <button
                  onClick={() => navigate('/my-activity')}
                  className="p-2 rounded-full transition-all duration-300 shadow-sm hover:scale-105 text-white hover:opacity-90"
                  style={{ backgroundColor: getDomainColors(selectedSector).primary }}
                  title={user.profile?.activity_type === 'seed_provider' ? 'Mes Fournitures' : user.profile?.activity_type === 'producer' ? 'Mes Productions' : 'Mes Demandes'}
                >
                  {user.profile?.activity_type === 'seed_provider' ? (
                    <PackageSearch className="h-5 w-5" strokeWidth={2} />
                  ) : user.profile?.activity_type === 'producer' ? (
                    <Sprout className="h-5 w-5" strokeWidth={2} />
                  ) : (
                    <ShoppingCart className="h-5 w-5" strokeWidth={2} />
                  )}
                </button>
              )}

              {/* Messages and Profile Icons */}
              {user && (
                <>
                  <button
                    onClick={() => navigate('/chat')}
                    className="relative p-2 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm group"
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',
                      color: theme === 'dark' ? '#60A5FA' : getTextStyles(theme).muted,
                      border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}
                  >
                    <MessageCircle className="h-5 w-5" strokeWidth={2} />
                    {/* Notification Badge - Dynamic */}
                    {/* Badge désactivé - pas de messages réels */}
                  </button>
                  
                  <button
                    onClick={() => navigate('/profile')}
                    className="group relative flex-shrink-0"
                  >
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
                      style={{
                        background: theme === 'dark' ? 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.3), rgba(13, 148, 136, 0.3))' : '#F3F4F6',
                        border: theme === 'dark' ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                        color: theme === 'dark' ? '#6EE7B7' : getTextStyles(theme).muted
                      }}
                    >
                      <User className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 shadow-sm animate-pulse ${theme === 'dark' ? 'border-[#060D0A]' : 'border-white'}`} style={{ backgroundColor: getDomainColors(selectedSector).primary }}></div>
                  </button>
                </>
              )}

              {/* Login Button for non-authenticated users */}
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm whitespace-nowrap text-white"
                  style={{ backgroundColor: getDomainColors(selectedSector).primary }}
                >
                  <span className="hidden sm:inline">{t('Se connecter', 'Log in')}</span>
                  <span className="sm:hidden">{t('Connexion', 'Login')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar - Hidden on desktop */}
      {searchFocused && (
        <div className="sm:hidden sticky top-16 z-20 px-4 py-3 border-b" style={{ 
          backgroundColor: theme === 'dark' ? '#060D0A' : '#F0F2F5',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'
        }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <input
              type="text"
              placeholder={t('Rechercher produits, vendeurs...', 'Search products, sellers...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-full"
              style={{
                ...getInputStyles(theme),
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Facebook-style 3-Column Layout */}
      <div className="flex justify-between max-w-[1920px] mx-auto">
        {/* LEFT SIDEBAR - Fixed Static */}
        <aside className="hidden xl:block fixed left-0 top-16 w-[280px] h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none p-4 space-y-3">
          {/* User Profile Card */}
          <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/[0.03] border border-white/10 backdrop-blur-xl' : 'bg-white shadow-sm'}`}>
            <button
              onClick={() => {
                setNewPost(prev => ({ ...prev, category_id: prev.category_id || (selectedSector === 'all' ? 'agriculture' : selectedSector) }));
                setShowCreatePost(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
              style={getButtonStyles(theme, 'secondary', 'emerald')}
            >
              <Plus className="h-5 w-5" />
              <span>{t('Créer une publication', 'Create a post')}</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className={`rounded-2xl p-2 ${theme === 'dark' ? 'bg-white/[0.03] border border-white/10' : 'bg-white shadow-sm'}`}>
            {[
              { icon: Home, label: t('Fil d\'actualité', 'Home'), path: '/feed', active: true },
              { icon: BarChart3, label: t('Tableau de Bord', 'Dashboard'), path: '/dashboard' },
              { icon: Users, label: t('Communauté', 'Community'), path: selectedSector === 'elevage' ? '/community/elevage' : '/community/agriculture' },
              { icon: MessageCircle, label: t('Messages', 'Messages'), path: '/chat', badge: 0 },
              { icon: ShoppingBag, label: 'Marketplace', path: '/listings' },
              { icon: User, label: t('Mon Compte', 'My Account'), path: '/profile' },
              { icon: Activity, label: t('Mon Activité', 'My Activity'), path: '/my-activity' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  item.active 
                    ? '' 
                    : theme === 'dark' ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={item.active ? { backgroundColor: `${getDomainColors(selectedSector).primary}15`, color: getDomainColors(selectedSector).primary } : undefined}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Access */}
          <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-white/[0.03] border border-white/10' : 'bg-white shadow-sm'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-2" style={{ color: getTextStyles(theme).muted }}>
              {t('Raccourcis', 'Shortcuts')}
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedSector('agriculture')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium" style={{ color: getTextStyles(theme).title }}>Agriculture</span>
              </button>
              <button 
                onClick={() => setSelectedSector('elevage')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm font-medium" style={{ color: getTextStyles(theme).title }}>{t('Élevage', 'Livestock')}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Middle Column - Feed - Centered like Facebook */}
        <div className="w-full xl:ml-[280px] xl:mr-[360px] px-4 xl:px-8 space-y-6 pb-20">
            {/* Stories/Status Section - SUPPRIMÉ POUR LA PRÉSENTATION */}

            {/* Create Post Input (Mobile/Tablet) */}
            <div className={`lg:hidden rounded-2xl p-4 shadow-sm border ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  {(user?.profile as any)?.avatar_url ? (
                    <img src={(user?.profile as any)?.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                      {user?.profile?.display_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setNewPost(prev => ({ ...prev, category_id: prev.category_id || (selectedSector === 'all' ? 'agriculture' : selectedSector) }));
                    setShowCreatePost(true);
                  }}
                  className={`flex-1 text-left px-4 py-2.5 rounded-full text-sm transition-colors ${theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {t('Quoi de neuf', "What's new")}, {user?.profile?.display_name?.split(' ')[0] || t('Agriculteur', 'Farmer')} ?
                </button>
              </div>
            </div>

            {/* Feed Posts */}
            <div className="space-y-6">
              {loading ? (
                // Loading Skeletons
                [1, 2, 3].map((i) => (
                  <div key={i} className={`rounded-2xl p-4 shadow-sm border ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}>
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <div className="space-y-2">
                          <div className={`h-4 w-32 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />
                          <div className={`h-3 w-24 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />
                        </div>
                      </div>
                      <div className={`h-48 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                ))
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                    <PackageSearch className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: getTextStyles(theme).title }}>{t('Aucune publication trouvée', 'No listings found')}</h3>
                  <p style={{ color: getTextStyles(theme).muted }}>{t('Essayez de modifier vos filtres ou effectuez une nouvelle recherche.', 'Try changing your filters or search again.')}</p>
                </div>
              ) : (
                filteredListings.map((listing) => {
                  const isOwner = Boolean(user?.id) && listing.seller_id === user?.id;
                  return (
                    <div 
                      key={listing.id}
                      className={`rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}
                    >
                      {/* Post Header */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ background: getDomainColors(selectedSector).gradientDiagonal }}>
                              {(isOwner ? t('Vous', 'You') : (listing.seller?.profile?.display_name || 'U'))?.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1a1a1a] rounded-full p-0.5">
                              <div className="w-3 h-3 rounded-full border-2 border-white dark:border-[#1a1a1a]" style={{ backgroundColor: getDomainColors(selectedSector).primary }} />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-sm hover:underline cursor-pointer" style={{ color: getTextStyles(theme).title }}>
                              {isOwner ? t('Vous', 'You') : (listing.seller?.profile?.display_name || 'Utilisateur')}
                            </h3>
                            <div className="flex items-center gap-2 text-xs" style={{ color: getTextStyles(theme).muted }}>
                              <span>{formatDate(listing.created_at)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {listing.region}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isOwner && (
                          <div className="relative">
                            <button
                              onClick={() => setActiveListingMenuId(prev => prev === listing.id ? null : listing.id)}
                              className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {activeListingMenuId === listing.id && (
                              <div className={`absolute right-0 top-11 min-w-[190px] rounded-xl shadow-xl border z-20 py-1 ${theme === 'dark' ? 'bg-[#1f1f1f] border-white/10' : 'bg-white border-gray-100'}`}>
                                <button
                                  onClick={() => {
                                    setOrderListing(listing);
                                    setActiveListingMenuId(null);
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                  <ShoppingCart className="w-4 h-4" style={{ color: getDomainColors(selectedSector).primary }} />
                                  {t('Commander directement', 'Order directly')}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    {/* Post Content */}
                    <div className="px-4 pb-3">
                      <h4 className="font-bold text-lg mb-1" style={{ color: getTextStyles(theme).title }}>
                        {translateTitle(listing.title)} {listing.variety && <span className="font-normal text-base opacity-80">- {listing.variety}</span>}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium border" style={{ backgroundColor: `${getDomainColors(selectedSector).primary}15`, color: getDomainColors(selectedSector).primary, borderColor: `${getDomainColors(selectedSector).primary}30` }}>
                          {listing.category_id === 'agriculture' ? 'Agriculture' : t('Élevage', 'Livestock')}
                        </span>
                        {listing.quantity > 0 && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            {t('Stock', 'Stock')}: {listing.quantity} {listing.unit}
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold mb-2" style={{ color: getDomainColors(selectedSector).primary }}>
                        {listing.price_per_unit.toLocaleString()} {listing.currency}/{listing.unit}
                      </p>
                    </div>

                    {/* Post Media */}
                    {listing.images && listing.images.length > 0 && (
                      <div className="relative cursor-pointer group" onClick={() => { setSelectedListing(listing); setShowChatModal(true); }}>
                        <div className={`grid ${listing.images.length > 1 ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-1'} gap-0.5 bg-gray-100 dark:bg-gray-800`}>
                          {listing.images.slice(0, 4).map((img, idx) => (
                            <div key={idx} className={`relative ${listing.images && listing.images.length === 3 && idx === 0 ? 'row-span-2' : ''} h-48 sm:h-64 lg:h-72 overflow-hidden bg-gray-200 dark:bg-gray-700`}>
                              {isVideoMedia(img) ? (
                                <video
                                  src={img}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  controls
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                              ) : (
                                <img
                                  src={img}
                                  alt={`${listing.title} - ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/agriculture/bonmanioc.jpg';
                                  }}
                                  loading="lazy"
                                />
                              )}
                              {listing.images && listing.images.length > 4 && idx === 3 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <span className="text-white text-xl font-bold">+{listing.images.length - 4}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                      {/* Post Actions */}
                      <div className={`px-2 py-1 border-t flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                      <button 
                        onClick={() => toggleFavorite(listing.id, listing.title)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${favorites.has(listing.id) ? 'text-red-500' : (theme === 'dark' ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50')}`}
                      >
                        <Heart className={`w-5 h-5 transition-transform duration-300 ${favorites.has(listing.id) ? 'fill-current animate-heartbeat' : 'hover:scale-110'}`} />
                        <span className="text-sm font-medium hidden sm:inline">{favorites.has(listing.id) ? t('Aimé', 'Liked') : t('J\'aime', 'Like')}</span>
                      </button>
                      
                      <button 
                        onClick={() => { setSelectedListing(listing); setShowChatModal(true); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">{t('Commenter', 'Comment')}</span>
                      </button>

                      <button 
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Send className="w-5 h-5" />
                        <span className="text-sm font-medium hidden sm:inline">{t('Partager', 'Share')}</span>
                      </button>
                      
                      {!isOwner && (
                        <button 
                          onClick={() => {
                            const contact = {
                              id: listing.seller_id,
                              name: listing.seller?.profile?.display_name || 'Vendeur',
                              domain: listing.category_id,
                              activityType: listing.seller?.profile?.activity_type || 'producer',
                              lastProduct: listing.title,
                              region: listing.region
                            };
                            startDemoChat(contact);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors" style={{ color: getDomainColors(selectedSector).primary }}
                        >
                          <Phone className="w-5 h-5" />
                          <span className="text-sm font-medium">{t('Contacter', 'Contact')}</span>
                        </button>
                      )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        {/* RIGHT SIDEBAR - Fixed Static */}
        <aside className="hidden xl:block fixed right-0 top-16 w-[360px] h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none">
            <div className="h-full overflow-y-auto scrollbar-none p-4 space-y-6">
              {/* Sponsored */}
              <div className={`p-4 rounded-3xl shadow-sm border ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: getTextStyles(theme).muted }}>
                  {t('Sponsorisé', 'Sponsored')}
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      img: '/images/agriculture/bonne_qualite_de_macabo.jpg',
                      title: t('Semences Premium', 'Premium Seeds'),
                      desc: t('Semences certifiées pour un rendement optimal au Cameroun.', 'Certified seeds for optimal yield in Cameroon.'),
                      site: 'agrisemen.cm'
                    },
                    {
                      img: '/images/livestock/poulet_de_chaire_35_jour.jpg',
                      title: t('Ferme Ndefo - Élevage', 'Ndefo Farm - Livestock'),
                      desc: t('Poulets de chair et poussins disponibles toute l\'année.', 'Broiler chickens and chicks available year-round.'),
                      site: 'ferme-ndefo.cm'
                    },
                    {
                      img: '/images/agriculture/cacao_de_mr_etoga_750kg_dispo.jpg',
                      title: t('Exportation Cacao', 'Cacao Export'),
                      desc: t('Acheteurs internationaux recherchent cacao qualité supérieure.', 'International buyers seeking premium quality cacao.'),
                      site: 'camercacao.cm'
                    },
                  ].map((ad, i) => (
                    <a key={i} href="#" className="flex items-center gap-3 group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/10">
                        <img
                          src={ad.img}
                          alt={ad.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { e.currentTarget.src = '/images/agriculture/bonmanioc.jpg'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm mb-1" style={{ color: getTextStyles(theme).title }}>{ad.title}</h4>
                        <p className="text-xs line-clamp-2 mb-1" style={{ color: getTextStyles(theme).muted }}>{ad.desc}</p>
                        <span className="text-xs font-medium" style={{ color: getDomainColors(selectedSector).primary }}>{ad.site}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Active Sellers */}
              <div className={`p-4 rounded-3xl shadow-sm border ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: getTextStyles(theme).muted }}>
                    {t('Vendeurs Actifs', 'Active Sellers')}
                  </h3>
                  <span className="text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: getDomainColors(selectedSector).primary }}>46</span>
                </div>
                
                <div className="space-y-1">
                  {[
                    { name: translateName('Hassan Producteur'), role: 'producteur', item: t('Veaux', 'Calves'), status: 'online' },
                    { name: translateName('Lamine Acheteur'), role: 'acheteur', item: t('Poivrons', 'Peppers'), status: 'online' },
                    { name: translateName('Aissatou Fournisseur'), role: 'seed_provider', item: t('Canne à sucre', 'Sugarcane'), status: 'offline' },
                    { name: translateName('Ibrahim Fournisseur'), role: 'seed_provider', item: t('Porcelets', 'Piglets'), status: 'online' },
                    { name: translateName('Aminata Acheteur'), role: 'acheteur', item: t('Tracteur', 'Tractor'), status: 'online' },
                  ].map((contact, i) => (
                    <button
                      key={i}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors group ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                    >
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                          contact.role === 'producteur' ? 'bg-amber-100 text-amber-700' :
                          contact.role === 'seed_provider' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {contact.name.charAt(0)}
                        </div>
                        {contact.status === 'online' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1a1a1a]" style={{ backgroundColor: getDomainColors(selectedSector).primary }} />
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate" style={{ color: getTextStyles(theme).title }}>
                          {contact.name}
                        </h4>
                        <p className="text-xs truncate" style={{ color: getTextStyles(theme).muted }}>
                          {contact.role === 'producteur' ? t('VENTE: ', 'SALE: ') : contact.role === 'acheteur' ? t('ACHAT: ', 'BUY: ') : t('FOURNITURE: ', 'SUPPLY: ')}{contact.item}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions Groups */}
              <div className={`p-4 rounded-3xl shadow-sm border ${theme === 'dark' ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: getTextStyles(theme).muted }}>
                  {t('Groupes suggérés', 'Suggested groups')}
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Agri-Tech Cameroun', members: '12k', image: '/images/agriculture/cacao_de_mr_etoga_750kg_dispo.jpg' },
                    { name: 'Élevage Moderne', members: '8.5k', image: '/images/livestock/chevre_de_bazou.jpg' },
                    { name: 'Producteurs de Cacao', members: '5.2k', image: '/images/agriculture/cafe_selectioné.jpg' },
                    { name: 'Pisciculteurs Cameroun', members: '3.1k', image: '/images/livestock/bars_frais_kribi.jpg' },
                  ].map((group, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={group.image}
                            alt={group.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = '/images/agriculture/bonmanioc.jpg'; }}
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm" style={{ color: getTextStyles(theme).title }}>{group.name}</h4>
                          <p className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                            {group.members} {t('membres', 'members')}
                          </p>
                        </div>
                      </div>
                      <button
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                        style={getButtonStyles(theme, 'secondary', 'emerald')}
                      >
                        {t('Rejoindre', 'Join')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Links */}
              <div className="px-2 pt-4 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB' }}>
                <div className="flex flex-wrap gap-2 text-xs" style={{ color: getTextStyles(theme).muted }}>
                  <button onClick={() => navigate('/privacy')} className="hover:underline transition-colors" style={{ color: 'inherit' }}>{t('Confidentialité', 'Privacy')}</button>
                  <span>·</span>
                  <a href="#" className="hover:underline">{t('Conditions', 'Terms')}</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">{t('Aide', 'Help')}</a>
                </div>
                <p className="text-xs mt-2" style={{ color: getTextStyles(theme).muted }}>
                  MBOA Market &copy; 2026
                </p>
              </div>
            </div>
        </aside>
      </div>

      {/* Voice Assistant Floating UI */}
      {isVoiceActive && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
          {/* Voice Status Card */}
          <div 
            className={`rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
              voiceStatus === 'listening' ? 'animate-pulse' : ''
            }`}
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.3)',
              backgroundColor: voiceStatus === 'listening' 
                ? 'rgba(16, 185, 129, 0.1)' 
                : theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full animate-pulse`} 
                style={{ 
                  backgroundColor: voiceStatus === 'listening' ? '#10B981' : 
                                   voiceStatus === 'processing' ? '#F59E0B' : '#6B7280'
                }} 
              />
              <span className="text-sm font-medium" style={{ color: getTextStyles(theme).title }}>
                {voiceStatus === 'listening' ? t('Bigiss écoute...', 'Bigiss listening...') : 
                 voiceStatus === 'processing' ? t('Bigiss traite...', 'Bigiss processing...') : 
                 t('Bigiss prêt', 'Bigiss ready')}
              </span>
            </div>
            
            {/* Voice Wave Animation */}
            {voiceStatus === 'listening' && (
              <div className="flex items-center gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Processing Animation */}
            {voiceStatus === 'processing' && (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {/* Help Text */}
            <div className="mt-3 text-xs" style={{ color: getTextStyles(theme).muted }}>
              {voiceStatus === 'listening' 
                ? t('Dites "Bigiss" suivi de votre commande...', 'Say "Bigiss" followed by your command...') 
                : voiceStatus === 'processing'
                ? t('Analyse de votre demande...', 'Analyzing your request...')
                : t('Cliquez sur le micro pour recommencer', 'Click the mic to start again')
              }
            </div>
          </div>
          
          {/* Quick Commands */}
          <div className={`rounded-2xl p-3 shadow-lg backdrop-blur-xl border`}
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.3)',
              backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)'
            }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: getTextStyles(theme).title }}>
              {t('Commandes rapides:', 'Quick commands:')}
            </p>
            <div className="space-y-1">
              <div className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                • "Bigiss cherche du maïs"
              </div>
              <div className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                • "Bigiss va au profil"
              </div>
              <div className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                • "Bigiss analyse les prix"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedListing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-0 sm:p-4">
          <div 
            className="backdrop-blur-md rounded-none sm:rounded-2xl max-w-full sm:max-w-2xl w-full h-full sm:h-auto sm:max-h-[80vh] flex flex-col shadow-2xl border-0 sm:border"
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: getTextStyles(theme).title }}>{selectedListing.seller?.profile?.display_name || 'Vendeur'}</h3>
                  <p className="text-xs text-emerald-400">● {t('En ligne', 'Online')}</p>
                </div>
              </div>
              <button
                onClick={handleCloseChatModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white/70 hover:text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/5 to-transparent">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                      msg.sender === 'me'
                        ? 'bg-gradient-to-br from-emerald-500/90 to-emerald-600/80 text-white border border-emerald-400/30'
                        : 'backdrop-blur-md bg-white/20 text-white border border-white/30'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-emerald-100' : 'text-white/70'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                  style={getInputStyles(theme)}
                />
                <button
                  onClick={handleSendChatMessage}
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all hover:scale-105"
                  style={getButtonStyles(theme, 'primary', 'emerald')}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              
              {/* Footer hint and close button */}
              {chatMessages.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-white/60 text-center">
                    {t('Cette conversation sera sauvegardée dans l\'onglet Messages', 'This conversation will be saved in the Messages tab')}
                  </p>
                  <button
                    onClick={handleCloseChatModal}
                    className="w-full px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                    style={getButtonStyles(theme, 'secondary', 'emerald')}
                  >
                    {t('Fermer', 'Close')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Demo Chat Modal for Sidebar Contacts */}
      {showDemoChat && demoChatContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              ...getCardStyles(theme, 'emerald'),
              maxHeight: '80vh'
            }}
          >
            {/* Chat Header */}
            <div className={`px-4 py-3 flex items-center gap-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}
              style={{ backgroundColor: `${getDomainColors(selectedSector).primary}15` }}>
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{
                    background: demoChatContact.domain === 'agriculture' 
                      ? 'linear-gradient(135deg, #10B981, #059669)' 
                      : 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                    color: 'white'
                  }}
                >
                  {demoChatContact.name[0].toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: getDomainColors(selectedSector).primary }}></div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold" style={{ color: getTextStyles(theme).title }}>{demoChatContact.name}</h3>
                <p className="text-xs flex items-center gap-1" style={{ color: getTextStyles(theme).muted }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: getDomainColors(selectedSector).primary }}></span>
                  En ligne • {demoChatContact.region}
                </p>
              </div>
              <button 
                onClick={() => setShowDemoChat(false)}
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              >
                <X className="h-5 w-5" style={{ color: getTextStyles(theme).muted }} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '300px' }}>
              {demoChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                      msg.sender === 'me' 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-br-md' 
                        : theme === 'dark' 
                          ? 'bg-white/10 text-white rounded-bl-md' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-gray-500'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={demoChatInput}
                  onChange={(e) => setDemoChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendDemoMessage()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2.5 rounded-full text-sm"
                  style={getInputStyles(theme)}
                />
                <button
                  onClick={sendDemoMessage}
                  disabled={!demoChatInput.trim()}
                  className="p-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-xs mt-2" style={{ color: getTextStyles(theme).muted }}>
                Appuyez sur Entrée pour envoyer • Le vendeur répondra automatiquement
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {activeStory && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setActiveStory(null)}
        >
          {/* Progress Bar */}
          <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{ width: `${storyProgress}%` }}
            />
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                <img 
                  src={`https://i.pravatar.cc/100?img=${activeStory.id + 10}`} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{activeStory.name}</h3>
                <p className="text-white/60 text-xs">{activeStory.time}</p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveStory(null);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Story Image */}
          <div className="max-w-lg w-full h-[80vh] relative">
            <img 
              src={activeStory.image} 
              alt={activeStory.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Navigation hints */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white/60 text-sm">{t('Cliquez n\'importe où pour fermer', 'Click anywhere to close')}</p>
          </div>
        </div>
      )}

      {/* Mobile Menu Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div 
            className={`fixed top-0 left-0 bottom-0 w-80 z-50 lg:hidden transform transition-transform duration-300 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            } shadow-2xl overflow-y-auto`}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: getTextStyles(theme).title }}>
                  {t('Menu', 'Menu')}
                </h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" style={{ color: getTextStyles(theme).muted }} />
                </button>
              </div>
              
              {user && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {(user.profile as any)?.display_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: getTextStyles(theme).title }}>
                      {(user.profile as any)?.display_name || 'Utilisateur'}
                    </p>
                    <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>
                      {user.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-2">
              {[
                { icon: Home, label: t('Fil d\'actualité', 'Home'), path: '/feed' },
                { icon: BarChart3, label: t('Tableau de Bord', 'Dashboard'), path: '/dashboard' },
                { icon: Users, label: t('Communauté', 'Community'), path: selectedSector === 'elevage' ? '/community/elevage' : '/community/agriculture' },
                { icon: MessageCircle, label: t('Messages', 'Messages'), path: '/chat', badge: 0 },
                { icon: ShoppingBag, label: 'Marketplace', path: '/listings' },
                { icon: User, label: t('Mon Compte', 'My Account'), path: '/profile' },
                { icon: Activity, label: t('Mon Activité', 'My Activity'), path: '/my-activity' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" style={{ color: getDomainColors(selectedSector).primary }} />
                  <span className="font-medium flex-1 text-left" style={{ color: getTextStyles(theme).title }}>
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sectors */}
            <div className="p-4 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 px-2" style={{ color: getTextStyles(theme).muted }}>
                {t('Secteurs', 'Sectors')}
              </h3>
              <div className="space-y-1">
                <button 
                  onClick={() => {
                    setSelectedSector('agriculture');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: getTextStyles(theme).title }}>
                    Agriculture
                  </span>
                </button>
                <button 
                  onClick={() => {
                    setSelectedSector('elevage');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: getTextStyles(theme).title }}>
                    {t('Élevage', 'Livestock')}
                  </span>
                </button>
              </div>
            </div>

            {/* Logout */}
            {user && (
              <div className="p-4 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
                <button
                  onClick={() => {
                    useAuthStore.getState().logout();
                    navigate('/login');
                  }}
                  className="w-full px-4 py-3 rounded-xl font-medium transition-colors"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2',
                    color: '#EF4444'
                  }}
                >
                  {t('Déconnexion', 'Sign out')}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation - Optimisé avec icônes plus petites et mieux espacées */}
      <div className={`fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t ${
        theme === 'dark' ? 'bg-gray-900/98 border-white/10' : 'bg-white/98 border-gray-200'
      } backdrop-blur-xl safe-area-inset-bottom`}>
        <div className="flex items-center justify-around px-1 py-2.5">
          {[
            { icon: Home, label: t('Accueil', 'Home'), path: '/feed' },
            { icon: BarChart3, label: t('Tableau de bord', 'Dashboard'), path: '/dashboard' },
            { icon: Users, label: t('Communauté', 'Community'), path: selectedSector === 'elevage' ? '/community/elevage' : '/community/agriculture' },
            { icon: MessageCircle, label: t('Messages', 'Messages'), path: '/chat', badge: 0 },
            { icon: User, label: t('Profil', 'Profile'), path: '/profile' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all relative min-w-0 flex-1"
              style={{
                color: window.location.pathname === item.path 
                  ? getDomainColors(selectedSector).primary 
                  : getTextStyles(theme).muted
              }}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" strokeWidth={window.location.pathname === item.path ? 2.5 : 2} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-gray-100'}`}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
              <h2 className="font-bold text-lg" style={{ color: getTextStyles(theme).title }}>
                {t('Créer une publication', 'Create a post')}
              </h2>
              <button onClick={() => setShowCreatePost(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                <X className="w-5 h-5" style={{ color: getTextStyles(theme).muted }} />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).title }}>
                  {t('Catégorie', 'Category')} *
                </label>
                <select
                  value={newPost.category_id}
                  onChange={(e) => setNewPost({ ...newPost, category_id: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                >
                  <option value="">{t('Choisir une catégorie', 'Choose a category')}</option>
                  <option value="agriculture">{t('Agriculture', 'Agriculture')}</option>
                  <option value="elevage">{t('Élevage', 'Livestock')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).title }}>
                  {t('Titre', 'Title')} *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).title }}>
                    {t('Quantité', 'Quantity')} *
                  </label>
                  <input
                    type="number"
                    value={newPost.quantity}
                    onChange={(e) => setNewPost({ ...newPost, quantity: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                    style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).title }}>
                    {t('Unité', 'Unit')}
                  </label>
                  <select
                    value={newPost.unit}
                    onChange={(e) => setNewPost({ ...newPost, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                    style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="unité">unité</option>
                    <option value="sac">sac</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).title }}>
                  {t('Prix par unité (FCFA)', 'Price per unit (FCFA)')} *
                </label>
                <input
                  type="number"
                  value={newPost.price_per_unit}
                  onChange={(e) => setNewPost({ ...newPost, price_per_unit: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).title }}>
                  {t('Région', 'Region')} *
                </label>
                <select
                  value={newPost.region}
                  onChange={(e) => setNewPost({ ...newPost, region: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                >
                  <option value="">Sélectionner</option>
                  <option value="Centre">Centre</option>
                  <option value="Littoral">Littoral</option>
                  <option value="Ouest">Ouest</option>
                  <option value="Nord-Ouest">Nord-Ouest</option>
                  <option value="Sud-Ouest">Sud-Ouest</option>
                  <option value="Nord">Nord</option>
                  <option value="Adamaoua">Adamaoua</option>
                  <option value="Est">Est</option>
                  <option value="Sud">Sud</option>
                  <option value="Extrême-Nord">Extrême-Nord</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).title }}>
                  {t('Photos / Vidéos', 'Photos / Videos')}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-3 rounded-xl border file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                  style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9FAFB' }}
                />
                <p className="text-xs mt-1" style={{ color: getTextStyles(theme).muted }}>
                  {t('Formats acceptés: image et vidéo (max 5MB par fichier).', 'Accepted formats: image and video (max 5MB per file).')}
                </p>
              </div>
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previewUrls.map((preview, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden border" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}>
                      {isVideoMedia(preview) ? (
                        <video src={preview} className="w-full h-28 object-cover" controls muted playsInline preload="metadata" />
                      ) : (
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-28 object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                        aria-label="Supprimer le média"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors"
                  style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6', color: getTextStyles(theme).title }}
                >
                  {t('Annuler', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: getDomainColors(selectedSector).primary }}
                >
                  {t('Publier', 'Publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {orderListing && (
        <OrderModal
          isOpen={Boolean(orderListing)}
          onClose={() => setOrderListing(null)}
          listing={{
            id: orderListing.id,
            title: orderListing.title,
            price_per_unit: orderListing.price_per_unit,
            unit: orderListing.unit,
            quantity: orderListing.quantity,
            region: orderListing.region,
            locality: orderListing.locality,
            seller_id: orderListing.seller_id,
          }}
        />
      )}
    </div>
  );
}
