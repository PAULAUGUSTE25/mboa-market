import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { multiAI } from '@/services/multiAI';
import { useTheme } from '@/contexts/ThemeContext';
import { useDomain } from '@/contexts/DomainContext';
import { getDomainColors } from '@/utils/colors';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIAssistant() {
  const { theme } = useTheme();
  const { selectedDomain } = useDomain();
  const domainColors = getDomainColors(selectedDomain);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Bonjour! Je suis Bigiss, votre assistant IA de MBOA Market. Comment puis-je vous aider aujourd'hui dans vos activités agricoles ou d'élevage?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const resetConversation = () => {
    setMessages([
      {
        id: 'welcome',
        text: "Bonjour! Je suis Bigiss, votre assistant IA de MBOA Market. Comment puis-je vous aider aujourd'hui dans vos activités agricoles ou d'élevage?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
    setInputText('');
  };

  const handleClose = () => {
    setIsOpen(false);
    resetConversation();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await multiAI.generateResponse(userMessage.text, 'Tu es Bigiss, un assistant IA agricole pour MBOA Market au Cameroun.');
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, j'ai rencontré une erreur. Veuillez réessayer plus tard.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 font-['Inter','Plus_Jakarta_Sans',sans-serif] lg:bottom-6 lg:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-[320px] sm:w-[400px] h-[480px] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl border border-white/20 flex flex-col"
            style={{
              background: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/10" style={{ background: domainColors.gradient }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Bigiss</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    En ligne
                  </p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'text-white rounded-br-none'
                        : theme === 'dark' 
                          ? 'bg-white/10 text-white rounded-bl-none border border-white/10'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                    style={msg.sender === 'user' ? { backgroundColor: domainColors.primary } : undefined}
                  >
                    {msg.text}
                    <div className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-emerald-200' : 'opacity-60'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-2xl rounded-bl-none ${theme === 'dark' ? 'bg-white/10' : 'bg-white'} flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '0ms', backgroundColor: domainColors.primary }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '150ms', backgroundColor: domainColors.primary }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ animationDelay: '300ms', backgroundColor: domainColors.primary }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Posez votre question..."
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 text-white placeholder-white/40 border border-white/10' 
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-2.5 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:opacity-90" style={{ backgroundColor: domainColors.primary }}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center hover:shadow-[#2E7D32]/30 transition-shadow border-2 border-white/20 backdrop-blur-sm" style={{ background: domainColors.gradientDiagonal }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
