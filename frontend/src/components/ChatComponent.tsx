import { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  participant_name: string;
  last_message?: string;
  unread_count: number;
  updated_at: string;
}

interface ChatComponentProps {
  listingId?: string;
  sellerId?: string;
  onClose?: () => void;
}

export default function ChatComponent({ listingId: _listingId, sellerId: _sellerId, onClose }: ChatComponentProps) {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
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
      // API call to load conversations
      // const data = await api.getConversations();
      // setConversations(data);
      
      // Mock data for now
      setConversations([
        {
          id: '1',
          participant_name: 'Semences Premium',
          last_message: 'Bonjour, les semences sont disponibles',
          unread_count: 2,
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (_conversationId: string) => {
    try {
      setLoading(true);
      // API call to load messages
      // const data = await api.getMessages(conversationId);
      // setMessages(data);
      
      // Mock data for now
      setMessages([
        {
          id: '1',
          sender_id: 'other',
          content: 'Bonjour, les semences sont disponibles',
          created_at: new Date().toISOString(),
          is_read: true,
        },
        {
          id: '2',
          sender_id: user?.id || '',
          content: 'Parfait, quelle est la quantité minimale?',
          created_at: new Date().toISOString(),
          is_read: true,
        },
      ]);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      // API call to send message
      // await api.sendMessage(activeConversation, newMessage);
      
      // Add message to local state
      const message: Message = {
        id: Date.now().toString(),
        sender_id: user?.id || '',
        content: newMessage,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[400px] sm:h-[500px] md:h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col max-h-[150px] md:max-h-full">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Messages</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-3 sm:p-4 text-center text-gray-500">
              <MessageCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-2" />
              <p className="text-xs sm:text-sm">Aucune conversation</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map((conv) => (
                <li
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 ${
                    activeConversation === conv.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {conv.participant_name}
                      </h3>
                      <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 truncate">
                        {conv.last_message}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-600 rounded-full">
                        {conv.unread_count}
                      </span>
                    )}
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
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
                        className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender_id === user?.id
                              ? 'text-green-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 sm:p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#2E7D32' }}
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
            <div className="text-center">
              <MessageCircle className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mb-2" />
              <p className="text-sm sm:text-base">Sélectionnez une conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
