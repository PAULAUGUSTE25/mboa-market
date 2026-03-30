import { useState } from 'react';
import { multiAI } from '@/services/multiAI';
import { Send, Bot, User, Loader } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  cached?: boolean;
}

export default function AIChat() {
  const { themeMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Bonjour ! Je suis votre assistant agricole MBOA Market. Comment puis-je vous aider aujourd\'hui ?',
      provider: 'Local'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = themeMode === 'dark';

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await multiAI.generateResponse(input);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text,
        provider: response.provider,
        cached: response.cached
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Désolé, une erreur s\'est produite. Veuillez réessayer.',
        provider: 'Error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    '🌽 Comment cultiver du maïs ?',
    '🍅 Conseils pour les tomates',
    '💧 Systèmes d\'irrigation',
    '💰 Analyser les prix'
  ];

  return (
    <div className={`flex flex-col h-[600px] rounded-2xl overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-white/10 bg-gradient-to-r from-green-500/20 to-emerald-500/20' : 'border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Assistant Agricole IA
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Propulsé par Multi-AI • Toujours disponible
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user'
                ? 'bg-blue-500'
                : 'bg-gradient-to-br from-green-500 to-emerald-500'
            }`}>
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : isDark
                  ? 'bg-white/10 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>
              {message.provider && message.role === 'assistant' && (
                <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {message.cached && '💾 '}{message.provider}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
              <Loader className="w-5 h-5 animate-spin text-green-500" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className={`px-4 py-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Questions rapides :
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInput(q.substring(2))}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question agricole..."
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isDark
                ? 'bg-white/10 text-white placeholder-gray-400'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !loading
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg'
                : isDark
                ? 'bg-white/10 opacity-50'
                : 'bg-gray-200 opacity-50'
            }`}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
