import { useEffect, useState } from 'react';
import { ThumbsUp, MessageSquare, Send, X, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import httpClient from '@/api/client';

export interface CommunityPost {
  id: string;
  author_id: string;
  author?: {
    display_name: string;
    region: string;
    activity_type: string;
    avatar_storage_key?: string | null;
  } | null;
  domain: string;
  content: string;
  is_demo?: boolean;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  created_at: string;
}

interface Comment {
  id: string;
  author?: { display_name: string; region: string } | null;
  content: string;
  created_at: string;
  is_ai_generated?: boolean;
}

interface Props {
  post: CommunityPost;
  domainColor: string;
  isAuthenticated: boolean;
  currentUserName?: string;
  onLikeUpdate?: (postId: string, liked: boolean, likesCount: number) => void;
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export default function CommunityPostCard({ post, domainColor, isAuthenticated, currentUserName, onLikeUpdate }: Props) {
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [submitting, setSubmitting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const authorName = post.author?.display_name ?? 'Anonyme';
  const authorRegion = post.author?.region ?? '';
  const authorRole = post.author?.activity_type ?? '';

  const handleLike = async () => {
    if (!isAuthenticated) return;
    if (likeLoading) return;
    setLikeLoading(true);
    // Optimistic update
    const newLiked = !liked;
    const newCount = newLiked ? likesCount + 1 : likesCount - 1;
    setLiked(newLiked);
    setLikesCount(newCount);
    try {
      const res = await httpClient.post(`/community/posts/${post.id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
      onLikeUpdate?.(post.id, res.data.liked, res.data.likes_count);
    } catch (err) {
      // Revert on error
      setLiked(!newLiked);
      setLikesCount(likesCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const res = await httpClient.get(`/community/posts/${post.id}/comments`);
      setComments(res.data || []);
      setCommentsCount((res.data || []).length);
    } catch {
      // Keep the current comments visible if a refresh temporarily fails.
    }
  };

  useEffect(() => {
    if (!commentOpen || !post.is_demo) return;
    const interval = window.setInterval(() => {
      httpClient.get(`/community/posts/${post.id}/comments`)
        .then((res) => {
          setComments(res.data || []);
          setCommentsCount((res.data || []).length);
        })
        .catch(() => {
          // Keep the current comments visible if a refresh temporarily fails.
        });
    }, 3000);
    return () => window.clearInterval(interval);
  }, [commentOpen, post.id, post.is_demo]);

  const toggleComments = async () => {
    if (!commentOpen) {
      await loadComments();
    }
    setCommentOpen(prev => !prev);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !isAuthenticated || submitting) return;
    setSubmitting(true);
    try {
      const res = await httpClient.post(`/community/posts/${post.id}/comments`, {
        content: commentText.trim(),
      });
      setComments(prev => [...prev, res.data]);
      setCommentsCount(prev => prev + 1);
      setCommentText('');
    } catch (err: any) {
      alert('Erreur lors de l\'envoi du commentaire. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Author header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: domainColor }}
        >
          {initials(authorName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{authorName}</span>
            {authorRole && (
              <span
                className="text-xs text-white px-2 py-0.5 rounded-full"
                style={{ backgroundColor: domainColor }}
              >
                {authorRole}
              </span>
            )}
            {post.is_demo && (
              <span className="text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Démonstration
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            {authorRegion && <><MapPin className="w-3 h-3" /><span>{authorRegion}</span><span>·</span></>}
            <span>{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={!isAuthenticated || likeLoading}
          title={isAuthenticated ? undefined : 'Connectez-vous pour liker'}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-95 ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
          <span>{likesCount}</span>
        </button>

        {/* Comments toggle */}
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-blue-500 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{commentsCount} commentaire{commentsCount !== 1 ? 's' : ''}</span>
          {commentOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Comments section */}
      {commentOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 italic text-center py-2">
              Aucun commentaire pour l'instant. Soyez le premier !
            </p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 items-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: domainColor }}
              >
                {initials(c.author?.display_name ?? '?')}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-700">
                  {c.is_ai_generated ? 'Bigiss · IA' : c.author?.display_name ?? 'Anonyme'}
                  {c.is_ai_generated && (
                    <span className="ml-1.5 font-normal text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      Réponse automatisée
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}

          {isAuthenticated ? (
            <div className="flex gap-2 items-center">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                placeholder="Écrire un commentaire..."
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-30"
                disabled={submitting}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                className="p-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: domainColor }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic text-center">
              Connectez-vous pour commenter.
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setCommentOpen(false); setCommentText(''); }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
