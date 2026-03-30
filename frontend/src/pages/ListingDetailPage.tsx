import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { ArrowLeft, MapPin, Package, User, MessageCircle, ShoppingCart, X, Send, Wallet, Smartphone } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/utils/themeStyles';
import { getCardStyles, getTextStyles, getInputStyles, getButtonStyles } from '@/utils/cardStyles';

interface Listing {
  id: string;
  seller_id: string;
  seller_name?: string;
  category_id: string;
  title: string;
  description: string;
  variety?: string;
  quantity: number;
  unit: string;
  price: number;
  location?: string;
  images?: string[];
  status: string;
  created_at: string;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [searchParams] = useSearchParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'me' | 'seller'; text: string; time: string }>>([]);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'orange' | 'mtn' | 'cash' | null>(null);
  const [orderStep, setOrderStep] = useState<'quantity' | 'payment' | 'confirmation'>('quantity');

  useEffect(() => {
    loadListing();
  }, [id]);

  useEffect(() => {
    // Ouvrir automatiquement la modal selon le paramètre d'URL
    const action = searchParams.get('action');
    if (action === 'chat' && listing) {
      handleStartChat();
    } else if (action === 'order' && listing) {
      handleStartOrder();
    }
  }, [searchParams, listing]);

  const loadListing = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données passées via l'état de navigation
      const stateData = location.state?.listing;
      
      if (stateData) {
        // Utiliser les vraies données de l'annonce
        const realListing: Listing = {
          id: stateData.id,
          seller_id: stateData.seller_id,
          seller_name: stateData.seller_name,
          category_id: '1',
          title: stateData.title.replace('VENTE: ', '').replace('ACHAT: ', '').replace('FOURNITURE: ', '').replace('FOURNISSEUR: ', ''),
          description: stateData.description || `Produit de qualité disponible en ${stateData.quantity} ${stateData.unit}`,
          variety: stateData.variety,
          quantity: stateData.quantity,
          unit: stateData.unit,
          price: stateData.price,
          location: `${stateData.region}${stateData.locality ? ', ' + stateData.locality : ''}`,
          images: stateData.images || [],
          status: 'active',
          created_at: new Date().toISOString(),
        };
        setListing(realListing);
      } else {
        // Fallback: données de démonstration
        const mockListing: Listing = {
          id: id || '1',
          seller_id: '123',
          seller_name: 'Paul Mbida',
          category_id: '1',
          title: 'Tomates fraîches bio',
          description: 'Tomates cultivées sans pesticides, fraîchement récoltées. Idéales pour salades et sauces.',
          variety: 'Roma',
          quantity: 50,
          unit: 'kg',
          price: 1500,
          location: 'Yaoundé, Centre',
          images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'],
          status: 'active',
          created_at: new Date().toISOString(),
        };
        setListing(mockListing);
      }
    } catch (error) {
      console.error('Failed to load listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setShowChatModal(true);
    // Message d'accueil automatique du vendeur
    setChatMessages([
      {
        sender: 'seller',
        text: `Bonjour! Je suis ${listing?.seller_name || 'le vendeur'}. Comment puis-je vous aider concernant ${listing?.title}?`,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = () => {
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
      
      // DÉTECTION DE RÉPONSES NÉGATIVES (refus, désintérêt)
      // Phrases de politesse à exclure de la détection négative
      const politePhrases = [
        'non cava', 'non ça va', 'non merci', 'non c\'est bon',
        'bonne journée', 'bonne soirée', 'bon courage', 'à bientôt',
        'au revoir', 'bye', 'salut', 'ciao'
      ];
      
      const isPoliteGoodbye = politePhrases.some(phrase => userMsg.includes(phrase));
      
      // Mots-clés vraiment négatifs (refus explicite)
      const strongNegativeKeywords = [
        'trop cher', 'pas intéressé', 'veux pas', 'veux plus',
        'annuler', 'annulation', 'cancel', 'laisse tomber',
        'oublie', 'tant pis', 'finalement non', 'finalement je'
      ];
      
      const hasStrongNegative = strongNegativeKeywords.some(keyword => userMsg.includes(keyword));
      
      // Détection contextuelle plus fine
      if (hasStrongNegative && !isPoliteGoodbye) {
        // Client semble refuser ou avoir un problème
        if (userMsg.includes('cher') || userMsg.includes('trop') || userMsg.includes('prix')) {
          response = 'Je comprends votre préoccupation sur le prix. Je peux vous proposer une réduction pour une commande plus importante, ou nous pouvons discuter d\'un arrangement. Sinon, pas de souci si ça ne convient pas pour le moment! 😊';
        } else if (userMsg.includes('loin') || userMsg.includes('éloigné') || userMsg.includes('livraison')) {
          response = 'Je comprends que la distance soit un problème. Je peux voir pour organiser une livraison ou trouver un point de rencontre plus pratique. Si ça reste compliqué, pas de problème, je comprends! 😊';
        } else if (userMsg.includes('annuler') || userMsg.includes('annulation') || userMsg.includes('cancel')) {
          response = 'Pas de problème du tout! Votre demande est annulée. N\'hésitez pas à me recontacter si vous changez d\'avis ou si vous avez besoin d\'autre chose. Bonne journée! 👋';
        } else if (userMsg.includes('intéressé') || userMsg.includes('interesse') || userMsg.includes('veux pas')) {
          response = 'Je comprends parfaitement! Merci d\'avoir pris le temps de me contacter. Si jamais vous changez d\'avis ou si vous cherchez autre chose, n\'hésitez pas à revenir. Bonne continuation! 😊';
        } else {
          response = 'Je comprends, pas de souci! Si vous avez des hésitations ou des questions, je suis là pour en discuter. Sinon, merci d\'avoir pris le temps de me contacter. N\'hésitez pas à revenir si vous changez d\'avis! 😊';
        }
      }
      // DÉTECTION AU REVOIR / FORMULES DE POLITESSE
      else if (isPoliteGoodbye || userMsg.includes('bonne journée') || userMsg.includes('bonne soirée') || 
               userMsg.includes('au revoir') || userMsg.includes('bye') || userMsg.includes('à bientôt') ||
               (userMsg.includes('non') && (userMsg.includes('ça va') || userMsg.includes('cava') || userMsg.includes('c\'est bon')))) {
        response = 'Merci à vous! Bonne journée et à bientôt! 😊👋';
      }
      // Réponses contextuelles POSITIVES basées sur les mots-clés
      else if (userMsg.includes('prix') || userMsg.includes('coût') || userMsg.includes('combien')) {
        response = `Le prix est de ${listing?.price || '500'} XAF/${listing?.unit || 'kg'}. C'est négociable pour les grandes quantités! 💰`;
      } else if (userMsg.includes('disponible') || userMsg.includes('stock')) {
        response = 'Oui, le produit est toujours disponible! J\'ai actuellement en stock. ✅';
      } else if (userMsg.includes('livraison') || userMsg.includes('livrer')) {
        response = 'Je peux vous faire une livraison si vous êtes dans la région. Où êtes-vous situé? 🚚';
      } else if (userMsg.includes('qualité') || userMsg.includes('état')) {
        response = 'La qualité est excellente! Produit frais et de première qualité. ⭐';
      } else if (userMsg.includes('quantité')) {
        response = `J'ai ${listing?.quantity || '100'} ${listing?.unit || 'kg'} disponibles actuellement. 📦`;
      } else if (userMsg.includes('quand') || userMsg.includes('date')) {
        response = 'Je suis disponible tous les jours. Quand souhaitez-vous récupérer la commande? 📅';
      } else if (userMsg.includes('où') || userMsg.includes('lieu') || userMsg.includes('localisation')) {
        response = `Je suis situé à ${listing?.location || 'Yaoundé'}. On peut se rencontrer là-bas. 📍`;
      } else if (userMsg.includes('bonjour') || userMsg.includes('salut') || userMsg.includes('hello') || userMsg.includes('bonsoir')) {
        response = 'Bonjour! Comment puis-je vous aider avec ce produit? 😊';
      } else if (userMsg.includes('merci') || userMsg.includes('thanks')) {
        response = 'De rien! N\'hésitez pas si vous avez d\'autres questions. 😊';
      } else if (userMsg.includes('oui') || userMsg.includes('ok') || userMsg.includes('d\'accord') || userMsg.includes('accord')) {
        response = 'Parfait! Que souhaitez-vous savoir d\'autre? Je suis là pour vous aider. 👍';
      } else if (userMsg.includes('commander') || userMsg.includes('acheter') || userMsg.includes('prendre')) {
        response = 'Excellent! Vous pouvez cliquer sur "Commander maintenant" pour finaliser votre commande. Je vous contacterai ensuite pour les détails. 🛒';
      } else {
        // Réponses générales si pas de mot-clé spécifique
        const generalResponses = [
          'D\'accord, je note votre demande. 📝',
          'Oui, je comprends. Que puis-je faire pour vous? 🤔',
          'Parfait! Dites-moi ce dont vous avez besoin. 💬',
          'Je suis à votre disposition pour plus d\'informations. 😊'
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
    if (chatMessages.length > 1 && listing) {
      const myMessages = chatMessages.filter(m => m.sender === 'me').map(m => m.text).join('\n');
      
      if (myMessages.trim()) {
        // Check if this is a demo listing
        const isDemoListing = listing.id.startsWith('demo-') || listing.id.startsWith('local-') || 
                              listing.seller_id.startsWith('user-') || listing.seller_id.startsWith('demo-');
        
        if (isDemoListing) {
          // For demo listings, save to localStorage
          try {
            const existingConversations = JSON.parse(localStorage.getItem('demo_conversations') || '[]');
            
            const newConversation = {
              id: `conv-${Date.now()}`,
              participant_id: listing.seller_id,
              participant_name: listing.seller_name || 'Vendeur',
              listing_id: listing.id,
              listing: {
                id: listing.id,
                title: listing.title,
                price_per_unit: listing.price,
                currency: 'XAF',
                unit: listing.unit || 'kg',
                images: listing.images
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
              participant_user_id: listing.seller_id,
              listing_id: listing.id,
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
    setChatMessages([]);
    setChatMessage('');
  };

  const handleStartOrder = () => {
    setShowOrderModal(true);
    setOrderStep('quantity');
    setOrderQuantity(1);
    setSelectedPaymentMethod(null);
  };

  const handleConfirmOrder = () => {
    if (orderStep === 'quantity') {
      setOrderStep('payment');
    } else if (orderStep === 'payment' && selectedPaymentMethod) {
      setOrderStep('confirmation');
      // Simulation de traitement de commande
      setTimeout(() => {
        alert(`✅ Commande confirmée!\n\nProduit: ${listing?.title}\nQuantité: ${orderQuantity} ${listing?.unit}\nMontant total: ${(listing?.price || 0) * orderQuantity} FCFA\nMode de paiement: ${selectedPaymentMethod === 'orange' ? 'Orange Money' : selectedPaymentMethod === 'mtn' ? 'MTN Mobile Money' : 'Paiement à la livraison'}\n\nVous serez contacté par ${listing?.seller_name} pour finaliser la transaction.`);
        setShowOrderModal(false);
        setOrderStep('quantity');
      }, 1500);
    }
  };

  const totalPrice = (listing?.price || 0) * orderQuantity;

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=2000')` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/85 via-teal-950/80 to-amber-950/85"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=2000')` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-950/85 via-teal-950/80 to-amber-950/85"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Annonce non trouvée</h2>
            <button onClick={() => navigate('/feed')} className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Retour au feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=2000')` }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.background}`}></div>
      </div>

      {/* Animated Background Pattern */}
      <div className={`fixed inset-0 ${styles.blobs}`}>
        <div className={`absolute top-10 left-10 w-32 h-32 ${styles.blobColors[0]} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute top-40 right-20 w-40 h-40 ${styles.blobColors[1]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-20 left-1/4 w-36 h-36 ${styles.blobColors[2]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className={`relative z-10 ${styles.header} sticky top-0`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center ${styles.text.link} mb-4 transition-all`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-200">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: getTextStyles(theme).title }}>{listing.title}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-green-600">{listing.price} FCFA</span>
                <span style={{ color: getTextStyles(theme).muted }}>/ {listing.unit}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div 
              className="backdrop-blur-md rounded-2xl p-4 border"
              style={{
                ...getCardStyles(theme, 'emerald'),
                borderColor: theme === 'light' ? '#2E7D32' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: getTextStyles(theme).title }}>{listing.seller_name}</p>
                  <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>Vendeur</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>Localisation</p>
                  <p className="font-medium" style={{ color: getTextStyles(theme).body }}>{listing.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>Quantité disponible</p>
                  <p className="font-medium" style={{ color: getTextStyles(theme).body }}>{listing.quantity} {listing.unit}</p>
                </div>
              </div>
              {listing.variety && (
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>Variété</p>
                    <p className="font-medium" style={{ color: getTextStyles(theme).body }}>{listing.variety}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2" style={{ color: getTextStyles(theme).title }}>Description</h3>
              <p className="leading-relaxed" style={{ color: getTextStyles(theme).body }}>{listing.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleStartChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105 text-sm sm:text-base"
                style={getButtonStyles(theme, 'secondary', 'emerald')}
              >
                <MessageCircle className="h-4 sm:h-5 w-4 sm:w-5" />
                Contacter {listing.seller_name?.split(' ')[0]}
              </button>
              <button
                onClick={handleStartOrder}
                className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105 text-sm sm:text-base"
                style={getButtonStyles(theme, 'primary', 'emerald')}
              >
                <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5" />
                Commander maintenant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-0 sm:p-4">
          <div 
            className="backdrop-blur-md rounded-none sm:rounded-2xl max-w-full sm:max-w-2xl w-full h-full sm:h-auto sm:max-h-[80vh] flex flex-col shadow-2xl border-0 sm:border"
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#2E7D32' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {/* Bouton Retour */}
                <button
                  onClick={handleCloseChatModal}
                  className="p-2 hover:bg-emerald-500/20 rounded-lg transition-all hover:scale-110"
                  title="Retour"
                  style={{
                    color: theme === 'light' ? '#059669' : '#10b981'
                  }}
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: getTextStyles(theme).title }}>{listing.seller_name}</h3>
                  <p className="text-xs text-emerald-400">● En ligne</p>
                </div>
              </div>
              <button
                onClick={handleCloseChatModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Fermer"
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
                    className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${
                      msg.sender === 'me'
                        ? 'bg-gradient-to-br from-emerald-500/90 to-emerald-600/80 text-white border border-emerald-400/30'
                        : theme === 'light'
                          ? 'bg-white border border-gray-200'
                          : 'backdrop-blur-md bg-white/20 border border-white/30'
                    }`}
                  >
                    <p 
                      className="text-sm"
                      style={{ 
                        color: msg.sender === 'me' 
                          ? 'white' 
                          : theme === 'light' 
                            ? '#1f2937' 
                            : 'white' 
                      }}
                    >
                      {msg.text}
                    </p>
                    <p 
                      className="text-xs mt-1"
                      style={{ 
                        color: msg.sender === 'me' 
                          ? '#d1fae5' 
                          : theme === 'light' 
                            ? '#6b7280' 
                            : 'rgba(255, 255, 255, 0.7)' 
                      }}
                    >
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                  style={getInputStyles(theme)}
                />
                <button
                  onClick={handleSendMessage}
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

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-0 sm:p-4">
          <div 
            className="backdrop-blur-md rounded-none sm:rounded-2xl max-w-full sm:max-w-md w-full h-full sm:h-auto shadow-2xl border-0 sm:border"
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#2E7D32' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold" style={{ color: getTextStyles(theme).title }}>
                {orderStep === 'quantity' && 'Quantité'}
                {orderStep === 'payment' && 'Mode de paiement'}
                {orderStep === 'confirmation' && 'Confirmation'}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                style={{ color: getTextStyles(theme).muted }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {orderStep === 'quantity' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: getTextStyles(theme).body }}>
                      Quantité souhaitée
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        className="w-10 h-10 rounded-lg border flex items-center justify-center font-bold transition-all hover:scale-110"
                        style={getButtonStyles(theme, 'secondary', 'emerald')}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 text-center text-xl font-bold border-2 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        style={getInputStyles(theme)}
                      />
                      <button
                        onClick={() => setOrderQuantity(Math.min(listing.quantity, orderQuantity + 1))}
                        className="w-10 h-10 rounded-lg border flex items-center justify-center font-bold transition-all hover:scale-110"
                        style={getButtonStyles(theme, 'secondary', 'emerald')}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm mt-2" style={{ color: getTextStyles(theme).muted }}>
                      Maximum disponible: {listing.quantity} {listing.unit}
                    </p>
                  </div>
                  <div className="backdrop-blur-md bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span style={{ color: getTextStyles(theme).body }}>Total</span>
                      <span className="text-2xl font-bold text-emerald-400">{totalPrice} FCFA</span>
                    </div>
                  </div>
                </div>
              )}

              {orderStep === 'payment' && (
                <div className="space-y-3">
                  <p className="text-sm mb-4" style={{ color: getTextStyles(theme).body }}>Choisissez votre mode de paiement</p>
                  
                  <button
                    onClick={() => setSelectedPaymentMethod('orange')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedPaymentMethod === 'orange'
                        ? 'border-orange-500/50 bg-orange-500/20'
                        : 'border-white/20 hover:border-orange-400/30 bg-white/5'
                    }`}
                  >
                    <Smartphone className="h-6 w-6 text-orange-400" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold" style={{ color: getTextStyles(theme).title }}>Orange Money</p>
                      <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>Paiement mobile sécurisé</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod('mtn')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedPaymentMethod === 'mtn'
                        ? 'border-yellow-500/50 bg-yellow-500/20'
                        : 'border-white/20 hover:border-yellow-400/30 bg-white/5'
                    }`}
                  >
                    <Smartphone className="h-6 w-6 text-yellow-400" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold" style={{ color: getTextStyles(theme).title }}>MTN Mobile Money</p>
                      <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>Paiement mobile sécurisé</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedPaymentMethod === 'cash'
                        ? 'border-emerald-500/50 bg-emerald-500/20'
                        : 'border-white/20 hover:border-emerald-400/30 bg-white/5'
                    }`}
                  >
                    <Wallet className="h-6 w-6 text-emerald-400" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold" style={{ color: getTextStyles(theme).title }}>Paiement à la livraison</p>
                      <p className="text-sm" style={{ color: getTextStyles(theme).muted }}>Payez en espèces</p>
                    </div>
                  </button>

                  <div className="backdrop-blur-md bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span style={{ color: getTextStyles(theme).body }}>Montant à payer</span>
                      <span className="text-2xl font-bold text-emerald-400">{totalPrice} FCFA</span>
                    </div>
                  </div>
                </div>
              )}

              {orderStep === 'confirmation' && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-lg font-semibold" style={{ color: getTextStyles(theme).title }}>Traitement de votre commande...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {orderStep !== 'confirmation' && (
              <div className="p-6 border-t border-white/10 space-y-3">
                {/* Bouton Retour/Annuler pour l'étape paiement */}
                {orderStep === 'payment' && (
                  <button
                    onClick={() => setOrderStep('quantity')}
                    className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 border-2"
                    style={getButtonStyles(theme, 'secondary', 'emerald')}
                  >
                    ← Retour
                  </button>
                )}
                
                <button
                  onClick={handleConfirmOrder}
                  disabled={orderStep === 'payment' && !selectedPaymentMethod}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={getButtonStyles(theme, 'primary', 'emerald')}
                >
                  {orderStep === 'quantity' ? 'Continuer' : 'Confirmer la commande'}
                </button>
                
                {/* Bouton Annuler la commande */}
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setOrderStep('quantity');
                    setSelectedPaymentMethod(null);
                  }}
                  className="w-full py-2 text-sm transition-all hover:scale-105"
                  style={{ color: getTextStyles(theme).muted }}
                >
                  Annuler la commande
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
