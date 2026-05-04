import { useState } from 'react';
import { ThumbsUp, MessageSquare, Send, X, MessageCircle, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export interface CommunityPost {
  id: number;
  author: string;
  region: string;
  role: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  avatar: string;
}

interface Comment {
  author: string;
  text: string;
  time: string;
}

const QUICK_MESSAGES = [
  'Bonjour ! Votre publication m\'intéresse beaucoup.',
  'Pouvez-vous partager plus de détails sur cette technique ?',
  'Je suis intéressé(e) à collaborer avec vous sur ce sujet.',
  'Merci pour ce partage, c\'est très utile pour notre communauté !',
  'Dans quelle zone exactement êtes-vous basé(e) ?',
];

interface Props {
  post: CommunityPost;
  domainColor: string;
  liked: boolean;
  onLike: (id: number) => void;
}

export default function CommunityPostCard({ post, domainColor, liked, onLike }: Props) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ text: string; fromMe: boolean; time: string }[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customWarning, setCustomWarning] = useState(false);

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [
      ...prev,
      { author: 'Vous', text: commentText.trim(), time: 'À l\'instant' },
    ]);
    setCommentText('');
  };

  const handleQuickMessage = (msg: string) => {
    setChatMessages(prev => [
      ...prev,
      { text: msg, fromMe: true, time: 'À l\'instant' },
    ]);
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          text: `Bonjour ! Merci de me contacter. Je reviendrai vers vous dès que possible.`,
          fromMe: false,
          time: 'À l\'instant',
        },
      ]);
    }, 800);
  };

  const handleSendCustom = () => {
    if (!customInput.trim()) return;
    setCustomWarning(true);
    setTimeout(() => setCustomWarning(false), 4000);
    setCustomInput('');
  };

  const totalComments = post.comments + comments.length;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {/* En-tête auteur */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: domainColor }}
          >
            {post.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{post.author}</span>
              <span
                className="text-xs text-white px-2 py-0.5 rounded-full"
                style={{ backgroundColor: domainColor }}
              >
                {post.role}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{post.region}</span>
              <span>·</span>
              <span>{post.timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4">{post.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          {/* Like */}
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-95 ${
              liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
            <span>{post.likes + (liked ? 1 : 0)}</span>
          </button>

          {/* Commenter */}
          <button
            onClick={() => setCommentOpen(prev => !prev)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-blue-500 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{totalComments} commentaire{totalComments !== 1 ? 's' : ''}</span>
            {commentOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Contacter */}
          <button
            onClick={() => setChatOpen(true)}
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:scale-105"
            style={{ color: domainColor, borderColor: domainColor }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Contacter
          </button>
        </div>

        {/* Section commentaires inline */}
        {commentOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {comments.length === 0 && post.comments === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-2">
                Aucun commentaire pour l'instant. Soyez le premier !
              </p>
            )}
            {comments.map((c, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: domainColor }}
                >
                  V
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold text-gray-700">{c.author}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2 items-center">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                placeholder="Écrire un commentaire..."
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-30"
                style={{ '--tw-ring-color': domainColor } as React.CSSProperties}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="p-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: domainColor }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal causerie de contact */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: domainColor }}
              >
                {post.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
                <p className="text-xs text-gray-400">{post.role} · {post.region}</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[120px]">
              {chatMessages.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Choisissez un message rapide pour démarrer la conversation.
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                      msg.fromMe
                        ? 'text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                    style={msg.fromMe ? { backgroundColor: domainColor } : {}}
                  >
                    {msg.text}
                    <span className="block text-[10px] opacity-60 mt-0.5 text-right">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Messages rapides */}
            <div className="px-4 pb-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
                Messages rapides
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_MESSAGES.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickMessage(msg)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95 text-left"
                    style={{ borderColor: domainColor, color: domainColor }}
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* Zone message personnalisé */}
            <div className="px-4 pb-5 pt-2 border-t border-gray-100">
              {customWarning && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-2">
                  Désolé, la messagerie personnalisée est encore en cours de développement. Utilisez les messages rapides ci-dessus.
                </p>
              )}
              <div className="flex gap-2 items-center">
                <input
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendCustom()}
                  placeholder="Écrire un message..."
                  className="flex-1 text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <button
                  onClick={handleSendCustom}
                  disabled={!customInput.trim()}
                  className="p-2.5 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: domainColor }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
