import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/utils/themeStyles';
import { getCardStyles, getTextStyles, getInputStyles, getButtonStyles } from '@/utils/cardStyles';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  last_message: string | null;
  unread_count: number;
  updated_at: string;
  listing_id: string | null;
  listing?: {
    id: string;
    title: string;
    price_per_unit: number;
    currency: string;
    unit: string;
    images?: string[];
  };
}

export default function ChatPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadConversations();

    // Check if we need to start a new conversation
    const sellerId = searchParams.get('seller');
    const listingId = searchParams.get('listing');
    if (sellerId && listingId) {
      startNewConversation(sellerId, listingId);
    }
  }, [user, navigate, searchParams]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(activeConversation);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      // Load conversations from API
      let apiConversations: any[] = [];
      try {
        apiConversations = await api.getConversations();
      } catch (error) {
        console.error('Failed to load API conversations:', error);
      }
      
      // Load demo conversations from localStorage
      const demoConversations = JSON.parse(localStorage.getItem('demo_conversations') || '[]');
      
      // Merge both (demo conversations first, then API conversations)
      const allConversations = [...demoConversations, ...apiConversations];
      
      setConversations(allConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // Check if this is a demo conversation (starts with 'conv-')
      if (conversationId.startsWith('conv-')) {
        // Load from localStorage
        const demoConversations = JSON.parse(localStorage.getItem('demo_conversations') || '[]');
        const conversation = demoConversations.find((c: any) => c.id === conversationId);
        
        if (conversation && conversation.messages) {
          // Convert demo messages to API format
          const formattedMessages = conversation.messages.map((msg: any, index: number) => ({
            id: `msg-${index}`,
            conversation_id: conversationId,
            sender_id: msg.sender === 'me' ? user?.id : conversation.participant_id,
            content: msg.text,
            is_read: true,
            created_at: new Date().toISOString()
          }));
          setMessages(formattedMessages);
        }
      } else {
        // Load from API
        const data = await api.getConversation(conversationId);
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const startNewConversation = async (sellerId: string, listingId: string) => {
    try {
      const response = await api.createConversation({
        participant_user_id: sellerId,
        listing_id: listingId,
        initial_message: 'Bonjour, je suis intéressé par votre produit.'
      });
      
      if (response.id) {
        setActiveConversation(response.id);
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;

    try {
      setLoading(true);
      await api.sendMessage(activeConversation, newMessage);
      setNewMessage('');
      await loadMessages(activeConversation);
      await loadConversations(); // Update conversation list
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
 

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: theme === 'light' 
            ? `url('/light%20mode%20.png')`
            : `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')`,
        }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? `bg-gradient-to-br ${styles.background}` : ''}`} style={{
          backdropFilter: theme === 'light' ? 'blur(2px)' : undefined,
          backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : undefined
        }}></div>
      </div>

      {/* Animated Background Pattern - Dark Mode Only */}
      {theme === 'dark' && (
        <div className={`fixed inset-0 ${styles.blobs}`}>
          <div className={`absolute top-10 left-10 w-32 h-32 ${styles.blobColors[0]} rounded-full blur-3xl animate-pulse`}></div>
          <div className={`absolute top-40 right-20 w-40 h-40 ${styles.blobColors[1]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
          <div className={`absolute bottom-20 left-1/4 w-36 h-36 ${styles.blobColors[2]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
        </div>
      )}

      {/* Header */}
      <header 
        className="relative z-10 backdrop-blur-md border-b shadow-xl sticky top-0"
        style={{
          background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
          borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/feed')}
                className="transition-all transform hover:scale-110"
                style={{ color: theme === 'light' ? '#6B7280' : 'rgba(255, 255, 255, 0.7)' }}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: getTextStyles(theme).title }}>Messages</h1>
            </div>
            <Logo size="sm" />
          </div>
        </div>
      </header>

      <div className="relative z-10 w-full px-2 py-2">
        <div 
          className="backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border"
          style={{
            ...getCardStyles(theme, 'emerald'),
            borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)',
            height: 'calc(100vh - 100px)'
          }}
        >
          <div className="flex h-full">
            {/* Conversations List */}
            <div 
              className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 border-r flex-col`}
              style={{ borderColor: theme === 'light' ? '#e5e7ebc5' : 'rgba(255, 255, 255, 0.2)' }}
            >
              <div 
                className="p-3 md:p-4 border-b backdrop-blur-sm"
                style={{ borderColor: theme === 'light' ? '#e5e7ebc0' : 'rgba(255, 255, 255, 0.2)' }}
              >
                <h2 className="text-base md:text-lg font-semibold tracking-tight" style={{ color: getTextStyles(theme).title }}>Conversations</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="mx-auto h-12 w-12 mb-2" style={{ color: theme === 'light' ? '#9CA3AF' : 'rgba(255, 255, 255, 0.4)' }} />
                    <p className="text-sm" style={{ color: getTextStyles(theme).body }}>Aucune conversation</p>
                    <p className="text-xs mt-2" style={{ color: getTextStyles(theme).muted }}>Contactez un vendeur depuis le feed</p>
                  </div>
                ) : (
                  <ul className="divide-y" style={{ borderColor: theme === 'light' ? '#e5e7ebe6' : 'rgba(255, 255, 255, 0.1)' }}>
                    {conversations.map((conv) => (
                      <li
                        key={conv.id}
                        onClick={() => setActiveConversation(conv.id)}
                        className="p-3 md:p-4 cursor-pointer transition-all duration-200"
                        style={{
                          background: activeConversation === conv.id 
                            ? (theme === 'light' ? 'rgba(16, 185, 129, 0.1)' : '#168306c7')
                            : 'transparent',
                          borderLeft: activeConversation === conv.id ? '4px solid #11a709ff' : 'none',
                          minHeight: '72px'
                        }}
                        onMouseEnter={(e) => {
                          if (activeConversation !== conv.id) {
                            e.currentTarget.style.background = theme === 'light' ? '#f3f4f6e6' : 'rgba(255, 255, 255, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeConversation !== conv.id) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div 
                            className="font-bold"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '48px',
                              height: '48px',
                              minWidth: '48px',
                              minHeight: '48px',
                              maxWidth: '48px',
                              maxHeight: '48px',
                              flexShrink: 0,
                              flexGrow: 0,
                              borderRadius: '50%',
                              background: 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.2))',
                              color: theme === 'dark' ? '#FFFFFF' : getTextStyles(theme).title,
                              fontSize: '18px',
                              lineHeight: '48px',
                              textAlign: 'center',
                              boxShadow: '0 0 0 1px rgba(7, 148, 9, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              overflow: 'hidden',
                              verticalAlign: 'middle',
                              transform: 'translateZ(0)'
                            }}
                          >
                            {conv.participant_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm md:text-base truncate" style={{ color: getTextStyles(theme).title }}>{conv.participant_name}</p>
                              {conv.unread_count > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 shadow-md flex-shrink-0" style={{ color: '#FFFFFF' }}>
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                            <p className="text-xs md:text-sm truncate" style={{ color: getTextStyles(theme).muted }}>
                              {conv.last_message || 'Aucun message'}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Messages Header */}
                  <div 
                    className="p-3 md:p-4 border-b backdrop-blur-sm"
                    style={{ borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      {/* Back button for mobile */}
                      <button
                        onClick={() => setActiveConversation(null)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ color: theme === 'light' ? '#6B7280' : 'rgba(255, 255, 255, 0.7)' }}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center font-bold shadow-lg text-sm" style={{ color: theme === 'light' ? '#10B981' : '#FFFFFF' }}>
                        {conversations.find(c => c.id === activeConversation)?.participant_name[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate" style={{ color: getTextStyles(theme).title }}>
                          {conversations.find(c => c.id === activeConversation)?.participant_name}
                        </h3>
                        <p className="text-xs" style={{ color: theme === 'light' ? '#10B981' : '#6EE7B7' }}>En ligne</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    style={{ background: theme === 'light' ? '#FFFFFF' : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))' }}
                  >
                    {/* Product Context Card */}
                    {conversations.find(c => c.id === activeConversation)?.listing && (
                      <div 
                        className="mb-4 p-4 rounded-xl border cursor-pointer hover:shadow-lg transition-all"
                        style={{
                          ...getCardStyles(theme, 'emerald'),
                          borderColor: theme === 'light' ? '#039105ff' : 'rgba(16, 185, 129, 0.3)'
                        }}
                        onClick={() => {
                          const listing = conversations.find(c => c.id === activeConversation)?.listing;
                          if (listing) navigate(`/listings/${listing.id}`);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          {conversations.find(c => c.id === activeConversation)?.listing?.images?.[0] && (
                            <img 
                              src={conversations.find(c => c.id === activeConversation)?.listing?.images?.[0]} 
                              alt="Produit"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-xs font-medium mb-1" style={{ color: theme === 'light' ? '#10B981' : '#6EE7B7' }}>
                              💬 Conversation à propos de:
                            </p>
                            <h4 className="font-semibold text-sm" style={{ color: getTextStyles(theme).title }}>
                              {conversations.find(c => c.id === activeConversation)?.listing?.title}
                            </h4>
                            <p className="text-sm font-bold mt-1" style={{ color: theme === 'light' ? '#10B981' : '#6EE7B7' }}>
                              {conversations.find(c => c.id === activeConversation)?.listing?.price_per_unit} {conversations.find(c => c.id === activeConversation)?.listing?.currency}/{conversations.find(c => c.id === activeConversation)?.listing?.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <p style={{ color: getTextStyles(theme).muted }}>Aucun message</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg border"
                              style={{
                                ...(message.sender_id === user?.id
                                  ? {
                                      background: 'linear-gradient(to bottom right, rgba(9, 168, 19, 0.9) rgba(5, 150, 105, 0.8))',
                                      borderColor: 'rgba(16, 185, 129, 0.3)',
                                      color: '#FFFFFF'
                                    }
                                  : {
                                      ...getCardStyles(theme, 'emerald'),
                                      borderColor: theme === 'light' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.3)'
                                    }
                                )
                              }}
                            >
                              <p 
                                className="text-sm break-words"
                                style={{
                                  color: message.sender_id === user?.id ? '#FFFFFF' : getTextStyles(theme).body
                                }}
                              >{message.content}</p>
                              <p
                                className="text-xs mt-1"
                                style={{
                                  color: message.sender_id === user?.id 
                                    ? 'rgba(255, 255, 255, 0.8)' 
                                    : getTextStyles(theme).muted
                                }}
                              >
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div 
                    className="border-t p-2 md:p-4 backdrop-blur-sm"
                    style={{ borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="flex-1 backdrop-blur-md border rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        style={{
                          ...getInputStyles(theme),
                          background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)'
                        }}
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || loading}
                        className="px-3 md:px-6 py-2 md:py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1 md:space-x-2 shadow-lg"
                        style={getButtonStyles(theme, 'primary', 'emerald')}
                      >
                        <Send className="h-4 w-4 md:h-5 md:w-5" />
                        <span className="font-semibold text-sm md:text-base hidden sm:inline">Envoyer</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div 
                  className="flex-1 flex items-center justify-center"
                  style={{ background: theme === 'light' ? '#FFFFFF' : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))' }}
                >
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-16 w-16 mb-4" style={{ color: theme === 'light' ? '#9CA3AF' : 'rgba(255, 255, 255, 0.4)' }} />
                    <p className="text-lg font-medium" style={{ color: getTextStyles(theme).title }}>Sélectionnez une conversation</p>
                    <p className="text-sm mt-2" style={{ color: getTextStyles(theme).muted }}>Choisissez une conversation pour commencer à discuter</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
