import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { MessageCircle, Heart, MapPin, Package, Plus, X, ShoppingCart, Globe, Wheat, Beef, PackageSearch, Sprout, User, Send, Search, Clock, TrendingUp, Sparkles, Star } from 'lucide-react';
import Logo from '@/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { getCardStyles, getTextStyles, getInputStyles, getButtonStyles } from '@/utils/cardStyles';

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

export default function FeedPage() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedSector, setSelectedSector] = useState<'all' | 'agriculture' | 'elevage'>('all');
  const [selectedFilter, setSelectedFilter] = useState<'domain' | 'specialization'>('domain');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [toastMessage, setToastMessage] = useState<{text: string; type: 'success' | 'info'} | null>(null);

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
      setToastMessage({ text: `❤️ "${listingTitle || 'Article'}" ajouté aux favoris`, type: 'success' });
    } else {
      newFavorites.delete(listingId);
      setToastMessage({ text: `💔 Retiré des favoris`, type: 'info' });
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
  
  // Demo chat state for sidebar contacts
  const [showDemoChat, setShowDemoChat] = useState(false);
  const [demoChatContact, setDemoChatContact] = useState<{id: string; name: string; domain: string; activityType: string; lastProduct: string; region: string} | null>(null);
  const [demoChatMessages, setDemoChatMessages] = useState<Array<{ sender: 'me' | 'seller'; text: string; time: string }>>([]);
  const [demoChatInput, setDemoChatInput] = useState('');

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
        console.warn('Could not load real listings from API:', apiError);
      }
      
      // Combine real listings with demo listings (always show both)
      let allListings = [...demoListings, ...realListings];
      
      // Filter to show only listings with images
      allListings = allListings.filter((listing: any) => listing.images && listing.images.length > 0);
      
      setListings(allListings);
    } catch (error) {
      console.error('Failed to load feed:', error);
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
      console.error('Failed to load categories:', error);
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
    if (!chatMessage.trim()) return;

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
            
            alert('✅ Conversation sauvegardée! Vous pouvez la retrouver dans l\'onglet Messages.');
          } catch (error) {
            console.error('Failed to save demo conversation:', error);
            alert('⚠️ Erreur lors de la sauvegarde locale.');
          }
        } else {
          // Real listing - save to backend
          try {
            const result = await api.createConversation({
              participant_user_id: selectedListing.seller_id,
              listing_id: selectedListing.id,
              initial_message: myMessages
            });
            
            console.log('Conversation saved:', result);
            alert('✅ Conversation sauvegardée! Vous pouvez la retrouver dans l\'onglet Messages.');
          } catch (error: any) {
            console.error('Failed to save conversation:', error);
            alert(`⚠️ Erreur lors de la sauvegarde: ${error?.response?.data?.message || error?.message || 'Erreur inconnue'}\n\nLa conversation n'a pas été sauvegardée.`);
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
        category_id: newPost.category_id,
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

      try {
        // Try to create via API
        await api.createListing(listingData);
      } catch (apiError) {
        console.warn('API creation failed, storing locally:', apiError);
        
        // Fallback: Store locally and add to current listings
        const newListing = {
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
        
        // Add to current listings immediately
        setListings(prev => [newListing, ...prev]);
      }

      // Reset form
      setNewPost({
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
      setSelectedFiles([]);
      setPreviewUrls([]);
      setShowCreatePost(false);
      
      alert('✅ Publication créée avec succès!');
    } catch (error: any) {
      console.error('Failed to create post:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur inconnue';
      alert(`❌ Erreur lors de la création de la publication:\n${errorMessage}\n\nVeuillez vérifier tous les champs requis.`);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

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
            <span className="text-xs opacity-75">({favorites.size} favoris)</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#060D0A]/80 backdrop-blur-xl shadow-sm border-b border-white/10' : 'bg-white shadow-sm border-b border-gray-200'}`} style={{ userSelect: 'none', boxShadow: theme === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.1)' : undefined }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo Responsive */}
            <div className="flex-shrink-0">
              <Logo size="sm" className="sm:hidden" />
              <Logo size="md" className="hidden sm:block" />
            </div>

            {/* Advanced Search Bar with Dropdown */}
            <div className="flex-1 max-w-md hidden sm:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Rechercher produits, vendeurs..."
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
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-pulse" />
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
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-emerald-50'}`}
                          style={{ color: getTextStyles(theme).body }}
                        >
                          <Search className="h-3.5 w-3.5 text-emerald-500" />
                          <span dangerouslySetInnerHTML={{ 
                            __html: suggestion.replace(new RegExp(`(${searchQuery})`, 'gi'), '<strong class="text-emerald-500">$1</strong>') 
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
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
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
                        <Star className="h-3 w-3 text-amber-500" /> Mes favoris ({favorites.size})
                      </p>
                      <button
                        onClick={() => navigate('/listings?favorites=true')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-amber-50 text-amber-600'}`}
                      >
                        <Heart className="h-3.5 w-3.5 fill-current" />
                        Voir mes {favorites.size} favoris
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* All Navigation Icons Grouped Together */}
            <div className={`flex items-center gap-2 rounded-full p-1.5 shadow-sm ${theme === 'dark' ? 'bg-white/[0.05] border border-white/10' : 'bg-gray-100'}`}>
              {/* Domain Filter - Icon Only */}
              <div className={`relative inline-flex rounded-full p-1 shadow-sm ${theme === 'dark' ? 'bg-white/[0.05] border border-white/10' : 'bg-white'}`}>
                <div
                  className={`absolute top-1 bottom-1 rounded-full shadow-md transition-all duration-300 ease-out ${theme === 'dark' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-500'}`}
                  style={{
                    left: selectedSector === 'all' ? '2px' : selectedSector === 'agriculture' ? 'calc(33.33% + 1px)' : 'calc(66.66%)',
                    width: 'calc(33.33% - 2px)'
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
                  className={`p-2 rounded-full transition-all duration-300 shadow-sm hover:scale-105 ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
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
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full px-1 shadow-lg animate-bounce">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => navigate('/profile')}
                    className="group relative"
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
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 shadow-sm animate-pulse ${theme === 'dark' ? 'border-[#060D0A]' : 'border-white'}`}></div>
                  </button>
                </>
              )}

              {/* Login Button for non-authenticated users */}
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className={`px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm whitespace-nowrap ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                >
                  <span className="hidden sm:inline">Se connecter</span>
                  <span className="sm:hidden">Connexion</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3-Column Layout Container - Facebook Style */}
      <div className="w-full px-2 lg:px-4 py-4">
        <div className="flex gap-2 lg:gap-4">
          {/* LEFT SIDEBAR - Navigation (hidden on mobile) */}
          <aside className="hidden lg:block lg:w-60 xl:w-72 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="space-y-2">
              {/* User Profile Card */}
              {user && (
                <button
                  onClick={() => navigate('/profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] ${theme === 'dark' ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                >
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                    style={{
                      background: theme === 'dark' ? 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.3), rgba(13, 148, 136, 0.3))' : '#E5E7EB',
                      border: theme === 'dark' ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                      color: theme === 'dark' ? '#6EE7B7' : getTextStyles(theme).body
                    }}
                  >
                    {user.profile?.display_name?.[0] || 'U'}
                  </div>
                  <span className="font-semibold" style={{ color: getTextStyles(theme).title }}>
                    {user.profile?.display_name || 'Mon Profil'}
                  </span>
                </button>
              )}

              {/* Navigation Links */}
              <button
                onClick={() => navigate('/feed')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}
              >
                <Globe className="h-5 w-5" />
                <span className="font-medium">Fil d'actualité</span>
              </button>

              {user && (
                <>
                  <button
                    onClick={() => navigate('/chat')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] ${theme === 'dark' ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                  >
                    <MessageCircle className="h-5 w-5" style={{ color: getTextStyles(theme).body }} />
                    <span className="font-medium" style={{ color: getTextStyles(theme).body }}>Messages</span>
                  </button>

                  <button
                    onClick={() => navigate('/my-activity')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] ${theme === 'dark' ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                  >
                    <Sprout className="h-5 w-5" style={{ color: getTextStyles(theme).body }} />
                    <span className="font-medium" style={{ color: getTextStyles(theme).body }}>Mon Activité</span>
                  </button>

                  <button
                    onClick={() => navigate('/listings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] ${theme === 'dark' ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                  >
                    <Package className="h-5 w-5" style={{ color: getTextStyles(theme).body }} />
                    <span className="font-medium" style={{ color: getTextStyles(theme).body }}>Marketplace</span>
                  </button>
                </>
              )}

              {/* Shortcuts Section */}
              <div className={`mt-6 pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <p className="px-4 text-xs font-semibold mb-2" style={{ color: getTextStyles(theme).muted }}>
                  RACCOURCIS
                </p>
                <button
                  onClick={() => setSelectedSector('agriculture')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] ${theme === 'dark' ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                >
                  <Wheat className="h-5 w-5 text-green-500" />
                  <span className="font-medium" style={{ color: getTextStyles(theme).body }}>Agriculture</span>
                </button>
                <button
                  onClick={() => setSelectedSector('elevage')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] ${theme === 'dark' ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100'}`}
                >
                  <Beef className="h-5 w-5 text-amber-500" />
                  <span className="font-medium" style={{ color: getTextStyles(theme).body }}>Élevage</span>
                </button>
              </div>
            </div>
          </aside>

          {/* CENTER FEED - Main Content */}
          <main className="flex-1 w-full max-w-5xl mx-auto">
            {/* Create Post Button */}
            {user && (
              <div className={`rounded-2xl p-4 mb-6 ${theme === 'dark' ? 'bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-sm' : 'bg-white shadow-sm'}`} style={{ boxShadow: theme === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.1)' : undefined }}>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                  style={getButtonStyles(theme, 'secondary', 'emerald')}
                >
                  <Plus className="h-5 w-5" />
                  <span>Créer une publication</span>
                </button>
              </div>
            )}

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4 ${theme === 'dark' ? 'bg-black/80' : 'bg-black/50'}`}>
            <div 
              className="backdrop-blur-md rounded-none sm:rounded-2xl max-w-full sm:max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto border-0 sm:border shadow-2xl"
              style={{
                ...getCardStyles(theme, 'emerald'),
                borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold" style={{ color: getTextStyles(theme).title }}>Nouvelle Publication</h2>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="transition-colors hover:scale-110"
                    style={{ color: getTextStyles(theme).muted }}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                      Catégorie *
                    </label>
                    <select
                      value={newPost.category_id}
                      onChange={(e) => setNewPost({ ...newPost, category_id: e.target.value })}
                      required
                      className="w-full rounded-xl px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={getInputStyles(theme)}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name_fr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      required
                      placeholder="Ex: Maïs de qualité supérieure"
                      className="w-full rounded-xl px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={getInputStyles(theme)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                      Variété
                    </label>
                    <input
                      type="text"
                      value={newPost.variety}
                      onChange={(e) => setNewPost({ ...newPost, variety: e.target.value })}
                      placeholder="Ex: Hybride F1"
                      className="w-full rounded-xl px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={getInputStyles(theme)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                        Quantité *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newPost.quantity}
                        onChange={(e) => setNewPost({ ...newPost, quantity: e.target.value })}
                        required
                        placeholder="100"
                        className="w-full rounded-xl px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        style={getInputStyles(theme)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                        Unité *
                      </label>
                      <select
                        value={newPost.unit}
                        onChange={(e) => setNewPost({ ...newPost, unit: e.target.value })}
                        required
                        className="w-full rounded-xl px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        style={getInputStyles(theme)}
                      >
                        <option value="kg">kg</option>
                        <option value="tonne">tonne</option>
                        <option value="sac">sac</option>
                        <option value="unité">unité</option>
                        <option value="régime">régime</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                      Prix par unité (XAF) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPost.price_per_unit}
                      onChange={(e) => setNewPost({ ...newPost, price_per_unit: e.target.value })}
                      required
                      placeholder="2500"
                      className="w-full rounded-xl px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={getInputStyles(theme)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                        Région *
                      </label>
                      <input
                        type="text"
                        value={newPost.region}
                        onChange={(e) => setNewPost({ ...newPost, region: e.target.value })}
                        required
                        placeholder="Centre"
                        className="w-full rounded-xl px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        style={getInputStyles(theme)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                        Localité
                      </label>
                      <input
                        type="text"
                        value={newPost.locality}
                        onChange={(e) => setNewPost({ ...newPost, locality: e.target.value })}
                        placeholder="Yaoundé"
                        className="w-full rounded-xl px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        style={getInputStyles(theme)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                      Images / Vidéos
                    </label>
                    
                    {/* File Upload */}
                    <div className="mb-4">
                      <label className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'border-white/20 hover:border-emerald-500/50 bg-white/[0.02] hover:bg-white/[0.05]' : 'border-gray-300 hover:border-emerald-500 bg-gray-50 hover:bg-gray-100'}`}>
                        <div className="flex flex-col items-center space-y-2">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme === 'dark' ? '#10B981' : '#059669' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div className="text-center">
                            <p className="text-sm font-medium" style={{ color: getTextStyles(theme).body }}>
                              Cliquez pour télécharger des fichiers
                            </p>
                            <p className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                              Images (JPG, PNG, GIF) ou Vidéos (MP4, MOV)
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preview uploaded files */}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden border" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#D1D5DB' }}>
                            {selectedFiles[index]?.type.startsWith('video/') ? (
                              <video src={url} className="w-full h-32 object-cover" controls />
                            ) : (
                              <img src={url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* URL Input as alternative */}
                    <div className="mt-4">
                      <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Ou entrez une URL d'image :
                      </p>
                      <input
                        type="url"
                        value={newPost.image_url}
                        onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                        placeholder="https://exemple.com/image.jpg"
                        className="w-full rounded-xl px-4 py-3 border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        style={getInputStyles(theme)}
                      />
                      {newPost.image_url && previewUrls.length === 0 && (
                        <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#D1D5DB' }}>
                          <img
                            src={newPost.image_url}
                            alt="Aperçu URL"
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreatePost(false)}
                      className="w-full sm:flex-1 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105 text-sm sm:text-base"
                      style={getButtonStyles(theme, 'secondary', 'emerald')}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:flex-1 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105 text-sm sm:text-base"
                      style={getButtonStyles(theme, 'primary', 'emerald')}
                    >
                      Publier
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className={`rounded-3xl p-20 text-center ${theme === 'dark' ? 'bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-xl' : 'bg-white shadow-sm'}`} style={{ boxShadow: theme === 'light' ? '0 1px 2px rgba(0, 0, 0, 0.1)' : undefined }}>
            {selectedSector === 'elevage' ? (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mb-4">
                    <Beef className="h-12 w-12 text-amber-600" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: getTextStyles(theme).title }}>Pas encore de publications</h3>
                <p className="text-lg mb-2" style={{ color: getTextStyles(theme).body }}>
                  Le secteur Élevage arrive bientôt!
                </p>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Les publications d'élevage (bovins, volailles, porcs, etc.) seront disponibles prochainement. Revenez bientôt!
                </p>
              </>
            ) : selectedSector === 'agriculture' ? (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-full mb-4">
                    <Wheat className="h-12 w-12 text-green-600" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: getTextStyles(theme).title }}>Aucune publication</h3>
                <p className="text-lg mb-2" style={{ color: getTextStyles(theme).body }}>
                  Pas encore de publications agricoles
                </p>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Soyez le premier à publier une annonce dans le secteur Agriculture!
                </p>
              </>
            ) : (
              <>
                <Package className="mx-auto h-20 w-20 text-gray-500 mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold mb-3" style={{ color: getTextStyles(theme).title }}>Aucune publication</h3>
                <p className="text-lg" style={{ color: getTextStyles(theme).body }}>Soyez le premier à publier!</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {filteredListings.map((listing) => {
                return (
                  <div 
                    key={listing.id} 
                    className="backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.005]"
                    style={{
                      ...getCardStyles(theme, 'emerald'),
                      border: 'none',
                      boxShadow: theme === 'light' 
                        ? '0 4px 25px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04)' 
                        : '0 4px 25px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                  {/* Post Header - Alignement Vertical Parfait */}
                  <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm"
                          style={{
                            background: theme === 'dark' ? 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))' : '#E5E7EB',
                            border: theme === 'dark' ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                            color: theme === 'dark' ? '#6EE7B7' : getTextStyles(theme).body
                          }}
                        >
                          {listing.seller?.profile?.display_name?.[0] || 'U'}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: getTextStyles(theme).title, fontFamily: 'Inter, system-ui, sans-serif' }}>
                            {listing.seller?.profile?.display_name || 'Utilisateur'}
                          </h3>
                          <p className="text-xs text-gray-500">{formatDate(listing.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Domain Badge */}
                        {listing.seller?.profile?.domain && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${theme === 'dark' ? 'border' : ''} ${
                            listing.seller.profile.domain === 'agriculture'
                              ? (theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700')
                              : (theme === 'dark' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700')
                          }`}>
                            {listing.seller.profile.domain === 'agriculture' ? (
                              <><Wheat className="h-3.5 w-3.5" strokeWidth={2} /> Agriculture</>
                            ) : (
                              <><Beef className="h-3.5 w-3.5" strokeWidth={2} /> Élevage</>
                            )}
                          </span>
                        )}
                        {/* Category Badge - Discret */}
                        {listing.title.startsWith('VENTE:') && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${theme === 'dark' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-50 text-green-700'}`}>
                            VENTE
                          </span>
                        )}
                        {listing.title.startsWith('ACHAT:') && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-700'}`}>
                            ACHAT
                          </span>
                        )}
                        {listing.title.startsWith('FOURNITURE:') && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-50 text-purple-700'}`}>
                            FOURNISSEUR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Image - Dynamisée avec coins arrondis */}
                  {listing.images && listing.images.length > 0 && (
                    <div className={theme === 'dark' ? 'px-6 pt-4' : 'w-full'}>
                      <div className={`w-full aspect-[16/9] relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl border border-white/10' : 'bg-gray-100'}`}>
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover hover:scale-110 transition-all duration-[1200ms] ease-out"
                          style={{ 
                            willChange: 'transform',
                            backfaceVisibility: 'hidden',
                            transform: 'translateZ(0)'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Post Content - Hiérarchie Optimisée */}
                  <div className="px-6 py-5">
                    {/* Titre avec typographie moderne */}
                    <h2 className="text-2xl font-bold mb-2" style={{ color: getTextStyles(theme).title, fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>
                      {listing.title.replace('VENTE: ', '').replace('ACHAT: ', '').replace('FOURNITURE: ', '').replace('FOURNISSEUR: ', '')}
                    </h2>
                    
                    {/* Prix en avant - Couleur primaire */}
                    <div className="mb-4">
                      <p className={`text-4xl font-extrabold ${theme === 'dark' ? 'text-green-400' : 'text-emerald-600'}`} style={{ fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif' }}>
                        {listing.price_per_unit.toLocaleString()} <span className="text-lg text-gray-500 font-normal">{listing.currency}/{listing.unit}</span>
                      </p>
                    </div>

                    {listing.variety && (
                      <p className="text-sm mb-3" style={{ color: getTextStyles(theme).body, fontFamily: 'Inter, system-ui, sans-serif' }}>Variété: {listing.variety}</p>
                    )}
                    
                    {/* Infos regroupées - Alignement Baseline Parfait */}
                    <div className="flex items-baseline gap-4 mb-5 text-xs" style={{ color: getTextStyles(theme).muted }}>
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                        <span>{listing.quantity} {listing.unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                        <span>{listing.region}{listing.locality ? `, ${listing.locality}` : ''}</span>
                      </div>
                    </div>

                    {/* Actions - Alignement Horizontal Parfait */}
                    <div className={`flex items-center justify-between pt-5 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex items-center">
                        {/* Like Button - Cœur avec animation rebond */}
                        <button 
                          onClick={() => toggleFavorite(listing.id)}
                          className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                            favorites.has(listing.id) 
                              ? 'bg-red-500/20 text-red-500' 
                              : `text-gray-500 ${theme === 'dark' ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-red-50 hover:text-red-500'}`
                          }`}
                          aria-label="J'aime"
                        >
                          <Heart className={`h-6 w-6 transition-all duration-300 ${favorites.has(listing.id) ? 'fill-red-500' : ''}`} strokeWidth={2} />
                        </button>
                      </div>
                      
                      {/* Boutons d'action */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (!user) {
                              navigate('/login');
                              return;
                            }
                            setSelectedListing(listing);
                            setShowChatModal(true);
                            setChatMessages([{
                              sender: 'seller',
                              text: `Bonjour! Je suis ${listing.seller?.profile?.display_name || 'le vendeur'}. Comment puis-je vous aider concernant ${listing.title}?`,
                              time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                            }]);
                          }}
                          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm"
                          style={{ ...getButtonStyles(theme, 'secondary', 'emerald'), fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                          <MessageCircle className="h-4 w-4" strokeWidth={2} />
                          <span>Contacter</span>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/listings/${listing.id}?action=order`, { 
                            state: { 
                              listing: {
                                id: listing.id,
                                title: listing.title,
                                price: listing.price_per_unit,
                                unit: listing.unit,
                                quantity: listing.quantity,
                                images: listing.images,
                                seller_name: listing.seller?.profile?.display_name || 'Vendeur',
                                seller_id: listing.seller_id,
                                region: listing.region,
                                locality: listing.locality,
                                variety: listing.variety,
                                description: ''
              }
                            }
                          })}
                          className="group flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm"
                          style={{ ...getButtonStyles(theme, 'primary', 'emerald'), fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                          <ShoppingCart className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-[-2px]" strokeWidth={2} />
                          <span>Commander</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Suggested Posts Section - Fills empty space like Facebook */}
          {filteredListings.length > 0 && (
            <div className="mt-8 space-y-4">
              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-300'}`}></div>
                <p className="text-sm font-medium" style={{ color: getTextStyles(theme).muted }}>
                  Publications suggérées
                </p>
                <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-300'}`}></div>
              </div>

              {/* Show all listings again as suggestions (infinite scroll effect) */}
              <div className="space-y-6">
                {listings.slice(0, 5).map((listing, idx) => (
                  <div 
                    key={`suggested-${listing.id}-${idx}`}
                    className="backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.005]"
                    style={{
                      ...getCardStyles(theme, 'emerald'),
                      border: 'none',
                      boxShadow: theme === 'light' 
                        ? '0 4px 25px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04)' 
                        : '0 4px 25px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {/* Post Header */}
                    <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm"
                            style={{
                              background: theme === 'dark' ? 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))' : '#E5E7EB',
                              border: theme === 'dark' ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
                              color: theme === 'dark' ? '#6EE7B7' : getTextStyles(theme).body
                            }}
                          >
                            {listing.seller?.profile?.display_name?.[0] || 'U'}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium" style={{ color: getTextStyles(theme).title }}>
                              {listing.seller?.profile?.display_name || 'Utilisateur'}
                            </h3>
                            <p className="text-xs text-gray-500">{formatDate(listing.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {listing.seller?.profile?.domain && (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${theme === 'dark' ? 'border' : ''} ${
                              listing.seller.profile.domain === 'agriculture'
                                ? (theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700')
                                : (theme === 'dark' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700')
                            }`}>
                              {listing.seller.profile.domain === 'agriculture' ? (
                                <><Wheat className="h-3.5 w-3.5" strokeWidth={2} /> Agriculture</>
                              ) : (
                                <><Beef className="h-3.5 w-3.5" strokeWidth={2} /> Élevage</>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Post Image */}
                    {listing.images && listing.images.length > 0 && (
                      <div className={theme === 'dark' ? 'px-6 pt-4' : 'w-full'}>
                        <div className={`w-full aspect-[16/9] relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl border border-white/10' : 'bg-gray-100'}`}>
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover hover:scale-110 transition-all duration-[1200ms] ease-out"
                          />
                        </div>
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="px-6 py-5">
                      <h2 className="text-2xl font-bold mb-2" style={{ color: getTextStyles(theme).title }}>
                        {listing.title.replace('VENTE: ', '').replace('ACHAT: ', '').replace('FOURNITURE: ', '')}
                      </h2>
                      
                      <div className="mb-4">
                        <p className={`text-4xl font-extrabold ${theme === 'dark' ? 'text-green-400' : 'text-emerald-600'}`}>
                          {listing.price_per_unit.toLocaleString()} <span className="text-lg text-gray-500 font-normal">{listing.currency}/{listing.unit}</span>
                        </p>
                      </div>

                      <div className="flex items-baseline gap-4 mb-5 text-xs" style={{ color: getTextStyles(theme).muted }}>
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                          <span>{listing.quantity} {listing.unit}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                          <span>{listing.region}{listing.locality ? `, ${listing.locality}` : ''}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={`flex items-center justify-between pt-5 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                        <div className="flex items-center">
                          <button 
                            onClick={() => toggleFavorite(listing.id)}
                            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                              favorites.has(listing.id) 
                                ? 'bg-red-500/20 text-red-500' 
                                : `text-gray-500 ${theme === 'dark' ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-red-50 hover:text-red-500'}`
                            }`}
                          >
                            <Heart className={`h-6 w-6 transition-all duration-300 ${favorites.has(listing.id) ? 'fill-red-500' : ''}`} strokeWidth={2} />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (!user) {
                                navigate('/login');
                                return;
                              }
                              setSelectedListing(listing);
                              setShowChatModal(true);
                              setChatMessages([{
                                sender: 'seller',
                                text: `Bonjour! Je suis ${listing.seller?.profile?.display_name || 'le vendeur'}. Comment puis-je vous aider concernant ${listing.title}?`,
                                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                              }]);
                            }}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm"
                            style={getButtonStyles(theme, 'secondary', 'emerald')}
                          >
                            <MessageCircle className="h-4 w-4" strokeWidth={2} />
                            <span>Contacter</span>
                          </button>
                          
                          <button
                            onClick={() => navigate(`/listings/${listing.id}?action=order`, { 
                              state: { 
                                listing: {
                                  id: listing.id,
                                  title: listing.title,
                                  price: listing.price_per_unit,
                                  unit: listing.unit,
                                  quantity: listing.quantity,
                                  images: listing.images,
                                  seller_name: listing.seller?.profile?.display_name || 'Vendeur',
                                  seller_id: listing.seller_id,
                                  region: listing.region,
                                  locality: listing.locality,
                                  variety: listing.variety,
                                  description: ''
                                }
                              }
                            })}
                            className="group flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium text-xs sm:text-sm"
                            style={getButtonStyles(theme, 'primary', 'emerald')}
                          >
                            <ShoppingCart className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-[-2px]" strokeWidth={2} />
                            <span>Commander</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* End of feed message */}
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>
                  Vous avez tout vu pour le moment
                </p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="mt-4 px-6 py-2 rounded-full font-medium transition-all hover:scale-105"
                  style={getButtonStyles(theme, 'secondary', 'emerald')}
                >
                  Retour en haut
                </button>
              </div>
            </div>
          )}
        </>
        )}
          </main>

          {/* RIGHT SIDEBAR - Contacts & Suggestions (hidden on mobile) */}
          <aside className="hidden xl:block xl:w-80 2xl:w-96 flex-shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-transparent hover:scrollbar-thumb-emerald-600">
            <style>{`
              aside::-webkit-scrollbar {
                width: 8px;
              }
              aside::-webkit-scrollbar-track {
                background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
                border-radius: 10px;
              }
              aside::-webkit-scrollbar-thumb {
                background: ${theme === 'dark' ? 'rgba(16, 185, 129, 0.5)' : '#10B981'};
                border-radius: 10px;
              }
              aside::-webkit-scrollbar-thumb:hover {
                background: ${theme === 'dark' ? 'rgba(16, 185, 129, 0.7)' : '#059669'};
              }
            `}</style>
            <div className="space-y-6">
              {/* Sponsored Section */}
              <div>
                <p className="px-2 text-xs font-semibold mb-3" style={{ color: getTextStyles(theme).muted }}>
                  SPONSORISÉ
                </p>
                <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-white/[0.03] border border-white/10' : 'bg-white shadow-sm'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                      <Wheat className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm" style={{ color: getTextStyles(theme).title }}>
                        Semences Premium
                      </h4>
                      <p className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                        Qualité garantie
                      </p>
                    </div>
                  </div>
                  <p className="text-xs mb-2" style={{ color: getTextStyles(theme).body }}>
                    Découvrez nos semences certifiées pour un rendement optimal
                  </p>
                </div>
              </div>

              {/* Contacts Section - Dynamic from listings */}
              <div>
                <div className="flex items-center justify-between px-2 mb-3">
                  <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: getTextStyles(theme).muted }}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    VENDEURS ACTIFS
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-medium">
                    {listings.filter(l => l.seller?.profile?.display_name).reduce((acc, l) => {
                      if (!acc.includes(l.seller_id)) acc.push(l.seller_id);
                      return acc;
                    }, [] as string[]).length}
                  </span>
                </div>
                <div className="space-y-1">
                  {/* Dynamic contacts from listings sellers */}
                  {(() => {
                    // Extract unique sellers from listings with more data
                    const uniqueSellers = listings
                      .filter(l => l.seller?.profile?.display_name)
                      .reduce((acc, listing) => {
                        const sellerId = listing.seller_id;
                        if (!acc.find(s => s.id === sellerId)) {
                          acc.push({
                            id: sellerId,
                            name: listing.seller?.profile?.display_name || 'Vendeur',
                            domain: listing.seller?.profile?.domain || 'agriculture',
                            activityType: listing.seller?.profile?.activity_type || 'producer',
                            isOnline: Math.random() > 0.3,
                            lastProduct: listing.title,
                            region: listing.region
                          });
                        }
                        return acc;
                      }, [] as Array<{id: string; name: string; domain: string; activityType: string; isOnline: boolean; lastProduct: string; region: string}>)
                      .slice(0, 6);

                    if (uniqueSellers.length === 0) {
                      return (
                        <div className={`text-center py-4 rounded-xl ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                          <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs" style={{ color: getTextStyles(theme).muted }}>Aucun vendeur actif</p>
                        </div>
                      );
                    }

                    return uniqueSellers.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => startDemoChat(contact)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${theme === 'dark' ? 'hover:bg-emerald-500/10' : 'hover:bg-emerald-50'}`}
                      >
                        <div className="relative flex-shrink-0">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow"
                            style={{
                              background: contact.domain === 'agriculture' 
                                ? (theme === 'dark' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4))' : 'linear-gradient(135deg, #D1FAE5, #A7F3D0)')
                                : (theme === 'dark' ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.4))' : 'linear-gradient(135deg, #FEF3C7, #FDE68A)'),
                              border: theme === 'dark' ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid transparent',
                              color: contact.domain === 'agriculture' 
                                ? (theme === 'dark' ? '#6EE7B7' : '#059669')
                                : (theme === 'dark' ? '#FCD34D' : '#D97706')
                            }}
                          >
                            {contact.name[0].toUpperCase()}
                          </div>
                          <div 
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${contact.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}
                            style={{ borderColor: theme === 'dark' ? '#060D0A' : '#FFFFFF' }}
                          />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate" style={{ color: getTextStyles(theme).title }}>
                              {contact.name}
                            </span>
                            {contact.isOnline && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-medium">
                                En ligne
                              </span>
                            )}
                          </div>
                          <p className="text-xs truncate" style={{ color: getTextStyles(theme).muted }}>
                            {contact.lastProduct} • {contact.region}
                          </p>
                        </div>
                        <MessageCircle className={`h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {/* Suggestions Section */}
              <div>
                <p className="px-2 text-xs font-semibold mb-3" style={{ color: getTextStyles(theme).muted }}>
                  SUGGESTIONS POUR VOUS
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Groupe Maïs Cameroun', members: '2.3k', icon: Wheat },
                    { name: 'Éleveurs du Centre', members: '1.8k', icon: Beef },
                    { name: 'Marketplace Bio', members: '5.1k', icon: Package },
                  ].map((group, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-3 ${theme === 'dark' ? 'bg-white/[0.03] border border-white/10' : 'bg-white shadow-sm'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center">
                          <group.icon className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate" style={{ color: getTextStyles(theme).title }}>
                            {group.name}
                          </h4>
                          <p className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                            {group.members} membres
                          </p>
                        </div>
                      </div>
                      <button
                        className="w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                        style={getButtonStyles(theme, 'secondary', 'emerald')}
                      >
                        Rejoindre
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Links */}
              <div className="px-2 pt-4 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB' }}>
                <div className="flex flex-wrap gap-2 text-xs" style={{ color: getTextStyles(theme).muted }}>
                  <a href="#" className="hover:underline">Confidentialité</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Conditions</a>
                  <span>·</span>
                  <a href="#" className="hover:underline">Aide</a>
                </div>
                <p className="text-xs mt-2" style={{ color: getTextStyles(theme).muted }}>
                  MBOA Market © 2026
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

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
                  <p className="text-xs text-emerald-400">● En ligne</p>
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
              
              {/* Footer hint */}
              {chatMessages.length > 1 && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-white/60">
                    💬 Cette conversation sera sauvegardée dans l'onglet Messages
                  </p>
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
            <div className={`px-4 py-3 flex items-center gap-3 border-b ${theme === 'dark' ? 'border-white/10 bg-emerald-500/10' : 'border-gray-200 bg-emerald-50'}`}>
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
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold" style={{ color: getTextStyles(theme).title }}>{demoChatContact.name}</h3>
                <p className="text-xs flex items-center gap-1" style={{ color: getTextStyles(theme).muted }}>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
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
    </div>
  );
}
