import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, User, Clock, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { messagesApi } from '../api/messages.api';
import type { Conversation, Message } from '../types/message.types';

export default function ChatPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesApi.getConversations()
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    messagesApi.getMessages(selected.id)
      .then(setMessages)
      .catch(() => setMessages([]));
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selected) return;
    setSending(true);
    try {
      const msg = await messagesApi.sendMessage(selected.id, input.trim());
      setMessages(prev => [...prev, msg]);
      setInput('');
    } catch {
      setMessages(prev => [...prev, {
        id: String(Date.now()),
        conversation_id: selected.id,
        sender_id: 'me',
        content: input.trim(),
        created_at: new Date().toISOString(),
        is_read: false,
      } as Message]);
      setInput('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        {selected ? (
          <>
            <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 md:hidden">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => navigate('/feed')} className="p-2 rounded-lg hover:bg-gray-100 hidden md:block">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/feed')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <MessageCircle className="w-5 h-5 text-[#3F441C]" />
        <h1 className="flex-1 font-bold text-gray-900">
          {selected
            ? (selected.participants?.find(p => p.user_id !== 'me')?.display_name || t('Conversation', 'Conversation'))
            : t('Messages', 'Messages')}
        </h1>
      </header>

      {/* Main Container: Split screen on Desktop */}
      <div className="flex-1 max-w-5xl w-full mx-auto flex flex-col md:flex-row md:bg-white md:my-4 md:rounded-2xl md:shadow-sm md:overflow-hidden md:border md:border-gray-200">
        
        {/* Liste des conversations (Left Panel) */}
        <div className={`flex flex-col w-full md:w-1/3 md:border-r border-gray-200 bg-[#F5F5F0] md:bg-white ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading && (
              <p className="text-center text-gray-400 py-12 text-sm">{t('Chargement...', 'Loading...')}</p>
            )}
            {!loading && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Inbox className="w-12 h-12 text-gray-300" />
                <p className="text-gray-400 text-sm text-center">
                  {t('Aucune conversation pour le moment.', 'No conversations yet.')}
                  <br />
                  {t('Contactez un vendeur depuis le fil d\'actualité.', 'Contact a seller from the feed.')}
                </p>
                <button
                  onClick={() => navigate('/feed')}
                  className="px-4 py-2 bg-[#3F441C] text-white rounded-xl text-sm hover:opacity-90 mt-2"
                >
                  {t('Aller au fil', 'Go to feed')}
                </button>
              </div>
            )}
            {conversations.map(conv => {
              const other = conv.participants?.find(p => p.user_id !== 'me');
              const isSelected = selected?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full rounded-2xl border p-4 flex items-center gap-3 transition-all text-left ${
                    isSelected 
                      ? 'bg-[#3F441C]/5 border-[#3F441C]/20 shadow-sm' 
                      : 'bg-white border-gray-100 hover:shadow-md md:hover:bg-gray-50'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-[#3F441C] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(other?.display_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isSelected ? 'font-bold text-[#3F441C]' : 'font-semibold text-gray-900'}`}>
                      {other?.display_name || t('Utilisateur', 'User')}
                    </p>
                    {conv.last_message && (
                      <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-[#3F441C]/70' : 'text-gray-400'}`}>
                        {conv.last_message.content}
                      </p>
                    )}
                  </div>
                  {conv.updated_at && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(conv.updated_at).toLocaleDateString('fr-CM', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vue conversation (Right Panel) */}
        <div className={`flex flex-col w-full md:w-2/3 bg-[#F5F5F0] md:bg-white relative ${!selected ? 'hidden md:flex' : 'flex-1 flex'}`}>
          {selected ? (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">
                    {t('Démarrez la conversation ci-dessous.', 'Start the conversation below.')}
                  </p>
                )}
                {messages.map(msg => {
                  const isMe = msg.sender_id === 'me';
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-[#3F441C] flex items-center justify-center text-white mr-2 flex-shrink-0 self-end">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-snug shadow-sm ${
                          isMe ? 'bg-[#3F441C] text-white rounded-br-sm' : 'bg-white md:bg-gray-50 text-gray-800 rounded-bl-sm border border-gray-100'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="bg-white md:bg-gray-50 border-t border-gray-100 px-4 py-3 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={t('Écrire un message...', 'Write a message...')}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3F441C]/20 shadow-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-4 py-2.5 bg-[#3F441C] text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* Desktop Empty State */
            <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-4 bg-gray-50/50">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">{t('Sélectionnez une conversation pour commencer', 'Select a conversation to start')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
