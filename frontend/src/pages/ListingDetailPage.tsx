import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { MapPin, ArrowLeft, Package, User, MessageCircle, ChevronLeft, ChevronRight, Scale, Tag, MoreVertical, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuthStore } from '../store/authStore';
import { listingsApi } from '../api/listings.api';
import { messagesApi } from '../api/messages.api';
import type { Listing, ListingComment } from '../types/listing.types';
import OrderModal from '../components/OrderModal';

const formatFCFA = (n: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n);

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuthStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<ListingComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsReload, setCommentsReload] = useState(0);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentsError, setCommentsError] = useState('');
  const [commentSubmitError, setCommentSubmitError] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactingSeller, setContactingSeller] = useState(false);

  useEffect(() => {
    if (!id) return;
    listingsApi.getById(id)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setComments([]);
      setCommentsLoading(false);
      return;
    }

    let cancelled = false;
    setCommentsLoading(true);
    setCommentsError('');
    listingsApi.getComments(id)
      .then((result) => {
        if (!cancelled) setComments(result);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCommentsError(getErrorMessage(
            error,
            t('Impossible de charger les commentaires.', 'Unable to load comments.')
          ));
        }
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, commentsReload, t]);

  useEffect(() => {
    if (loading || !listing || window.location.hash !== '#comments') return;
    const timeout = window.setTimeout(() => {
      document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loading, listing]);

  const images = listing?.images?.length ? listing.images : [];
  const domainColor = '#3F441C';
  const isOwner = Boolean(user?.id) && listing?.seller_id === user?.id;

  const contactSeller = async () => {
    if (!listing) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (isOwner || contactingSeller) return;

    setContactingSeller(true);
    try {
      const conversation = await messagesApi.createConversation({
        participant_user_id: listing.seller_id,
        listing_id: listing.id,
        initial_message: t(
          `Bonjour, je suis intéressé(e) par votre annonce « ${listing.title} ». Est-elle toujours disponible ?`,
          `Hello, I am interested in your listing "${listing.title}". Is it still available?`
        ),
      });
      navigate(`/chat?conversation_id=${encodeURIComponent(conversation.id)}`);
    } catch (error: any) {
      alert(
        error?.response?.data?.detail ||
        t('Impossible de contacter ce vendeur pour le moment.', 'Unable to contact this seller right now.')
      );
    } finally {
      setContactingSeller(false);
    }
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !commentDraft.trim() || commentSubmitting) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setCommentSubmitting(true);
    setCommentSubmitError('');
    try {
      const comment = await listingsApi.addComment(id, commentDraft);
      setComments((current) => [...current, comment]);
      setCommentDraft('');
    } catch (error: unknown) {
      setCommentSubmitError(getErrorMessage(
        error,
        t('Impossible de publier votre commentaire.', 'Unable to publish your comment.')
      ));
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <p className="text-gray-400 text-sm">{t('Chargement...', 'Loading...')}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center gap-4 p-6">
        <Package className="w-16 h-16 text-gray-300" />
        <p className="text-gray-500">{t('Publication introuvable.', 'Listing not found.')}</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#3F441C] text-white rounded-xl text-sm">
          {t('Retour', 'Back')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="flex-1 font-bold text-gray-900 truncate">{listing.title}</h1>
        {!isOwner && (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px] z-20">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setOrderModalOpen(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4 text-[#3F441C]" />
                {t('Commander directement', 'Order directly')}
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  void contactSeller();
                }}
                disabled={contactingSeller}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4 text-[#3F441C]" />
                {contactingSeller ? t('Ouverture…', 'Opening…') : t('Contacter le vendeur', 'Contact seller')}
              </button>
            </div>
          )}
        </div>
        )}
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Galerie photos */}
        <div className="relative bg-gray-100 aspect-video">
          {images.length > 0 ? (
            <img
              src={images[imgIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 text-gray-300" />
            </div>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1.5 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setImgIndex(i => (i + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1.5 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-4 py-5 space-y-4">
          {/* Titre + prix */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{listing.title}</h2>
            {listing.variety && (
              <p className="text-sm text-gray-500 mb-3">{t('Variété', 'Variety')} : {listing.variety}</p>
            )}
            <p className="text-2xl font-bold" style={{ color: domainColor }}>
              {formatFCFA(listing.price_per_unit)} <span className="text-sm font-normal text-gray-400">/ {listing.unit}</span>
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-gray-400" />
                {listing.quantity} {listing.unit} {t('disponibles', 'available')}
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  listing.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {listing.status === 'PUBLISHED' ? t('Disponible', 'Available') : listing.status}
              </span>
            </div>
          </div>

          {/* Infos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {t('Informations', 'Details')}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{listing.locality ? `${listing.locality}, ` : ''}{listing.region}, Cameroun</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{t('Catégorie ID', 'Category')} : {listing.category_id}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>
                {listing.seller?.profile?.display_name || t('Vendeur local', 'Local seller')}
                {listing.seller?.profile?.activity_type && (
                  <span className="text-gray-400"> · {listing.seller.profile.activity_type}</span>
                )}
              </span>
            </div>
          </div>

          <section id="comments" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#3F441C]" />
              <h3 className="font-semibold text-gray-900">
                {t('Commentaires publics', 'Public comments')} ({comments.length})
              </h3>
            </div>

            {commentsLoading ? (
              <p className="text-sm text-gray-500">{t('Chargement des commentaires…', 'Loading comments…')}</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t('Pas encore de commentaire. Soyez le premier à poser une question.', 'No comments yet. Be the first to ask a question.')}
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <article key={comment.id} className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-800">
                        {comment.author?.display_name || t('Utilisateur', 'User')}
                      </p>
                      <time className="shrink-0 text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleString(lang === 'fr' ? 'fr-CM' : 'en-CM')}
                      </time>
                    </div>
                    {comment.author?.activity_type && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {comment.author.activity_type}
                        {comment.author.region ? ` · ${comment.author.region}` : ''}
                      </p>
                    )}
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">{comment.content}</p>
                  </article>
                ))}
              </div>
            )}

            {commentsError && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <span>{commentsError}</span>
                <button
                  type="button"
                  onClick={() => setCommentsReload((value) => value + 1)}
                  className="font-semibold underline"
                >
                  {t('Réessayer', 'Retry')}
                </button>
              </div>
            )}

            {user ? (
              <form onSubmit={submitComment} className="space-y-2">
                <label htmlFor="listing-comment" className="sr-only">
                  {t('Votre commentaire', 'Your comment')}
                </label>
                <textarea
                  id="listing-comment"
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder={t('Posez une question ou laissez un commentaire…', 'Ask a question or leave a comment…')}
                  className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#3F441C]"
                />
                {commentSubmitError && (
                  <p role="alert" className="text-sm text-red-700">{commentSubmitError}</p>
                )}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-400">{commentDraft.length}/2000</span>
                  <button
                    type="submit"
                    disabled={!commentDraft.trim() || commentSubmitting}
                    className="rounded-xl bg-[#3F441C] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {commentSubmitting ? t('Publication…', 'Posting…') : t('Publier le commentaire', 'Post comment')}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full rounded-xl border border-[#3F441C] px-4 py-2.5 text-sm font-semibold text-[#3F441C]"
              >
                {t('Connectez-vous pour commenter', 'Sign in to comment')}
              </button>
            )}
          </section>

          {/* CTA contact */}
          {!isOwner && (
            <button
              onClick={() => void contactSeller()}
              disabled={contactingSeller}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: domainColor }}
            >
              <MessageCircle className="w-5 h-5" />
              {contactingSeller ? t('Ouverture de la discussion…', 'Opening chat…') : t('Contacter le vendeur', 'Contact the seller')}
            </button>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {listing && !isOwner && (
        <OrderModal
          isOpen={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          listing={{
            id: listing.id,
            title: listing.title,
            price_per_unit: listing.price_per_unit,
            unit: listing.unit,
            quantity: listing.quantity,
            region: listing.region,
            locality: listing.locality,
            seller_id: listing.seller_id || '',
          }}
        />
      )}
    </div>
  );
}
