import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Wheat, Send, Building2, FileText, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import { agricultureAnnouncements, type InstitutionalAnnouncement } from '../data/institutionalAnnouncements';
import CommunityPostCard, { type CommunityPost } from '../components/community/CommunityPostCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuthStore } from '../store/authStore';
import httpClient from '@/api/client';

const DOMAIN_COLOR = '#3F441C';
const DOMAIN = 'agriculture';

const categoryIcon = (cat: InstitutionalAnnouncement['category']) => {
  switch (cat) {
    case 'presidence': return '🏛️';
    case 'ministere': return '🏢';
    case 'programme': return '📋';
    case 'alerte': return '🚨';
    case 'recherche': return '🔬';
    case 'reglementation': return '📜';
  }
};

export default function CommunityAgriculturePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'discussions' | 'officiel'>('discussions');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const loadPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await httpClient.get('/community/posts', {
        params: { domain: DOMAIN, page: pageNum, page_size: 20 },
      });
      const data = res.data;
      if (pageNum === 1) {
        setPosts(data.items || []);
      } else {
        setPosts(prev => [...prev, ...(data.items || [])]);
      }
      setTotalPosts(data.total || 0);
      setHasMore((data.page || 1) < (data.pages || 1));
      setPage(pageNum);
    } catch (err) {
      setLoadError(t(
        'Impossible de charger les publications. Vérifiez votre connexion.',
        'Unable to load posts. Check your connection.'
      ));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  const handlePublish = async () => {
    if (!newPost.trim() || !isAuthenticated || publishing) return;
    setPublishing(true);
    try {
      const res = await httpClient.post('/community/posts', {
        content: newPost.trim(),
        domain: DOMAIN,
      });
      setPosts(prev => [res.data, ...prev]);
      setTotalPosts(prev => prev + 1);
      setNewPost('');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : t(
        'Erreur lors de la publication. Réessayez.',
        'Error publishing. Please try again.'
      ));
    } finally {
      setPublishing(false);
    }
  };

  const handleLikeUpdate = (postId: string, liked: boolean, likesCount: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked_by_me: liked, likes_count: likesCount } : p));
  };

  const displayName = (user?.profile as any)?.display_name;

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate('/feed')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: DOMAIN_COLOR }}>
              <Wheat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('Communauté Agriculture', 'Agriculture Community')}</h1>
              <p className="text-xs text-gray-500">{t('Réseau des agriculteurs du Cameroun', 'Cameroon Farmers Network')}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span className="font-semibold" style={{ color: DOMAIN_COLOR }}>{totalPosts}</span>
            <span>{t('publications', 'posts')}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-0 border-t border-gray-100">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'discussions'
                ? 'border-[#3F441C] text-[#3F441C]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {t('Discussions', 'Discussions')}
          </button>
          <button
            onClick={() => setActiveTab('officiel')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'officiel'
                ? 'border-[#3F441C] text-[#3F441C]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {t('Communiqués officiels', 'Official Announcements')}
            <span className="bg-[#3F441C] text-white text-[10px] px-1.5 py-0.5 rounded-full">{agricultureAnnouncements.length}</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'discussions' ? (
          <>
            {/* Create post */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              {isAuthenticated ? (
                <>
                  <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder={t(
                      'Partagez une expérience, posez une question à la communauté...',
                      'Share an experience, ask a question to the community...'
                    )}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F441C]/30 resize-none text-sm text-gray-800"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handlePublish}
                      disabled={!newPost.trim() || publishing}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ backgroundColor: DOMAIN_COLOR }}
                    >
                      {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {t('Publier', 'Post')}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  {t(
                    'Connectez-vous pour publier et interagir avec la communauté.',
                    'Sign in to post and interact with the community.'
                  )}
                </p>
              )}
            </div>

            {/* Posts list */}
            <div className="space-y-4">
              {loading && posts.length === 0 && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#3F441C]" />
                </div>
              )}
              {loadError && (
                <div className="text-center py-6">
                  <p className="text-sm text-red-500 mb-3">{loadError}</p>
                  <button
                    onClick={() => loadPosts(1)}
                    className="text-sm text-[#3F441C] font-semibold hover:underline"
                  >
                    {t('Réessayer', 'Retry')}
                  </button>
                </div>
              )}
              {!loading && !loadError && posts.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">
                  {t(
                    'Aucune publication pour l\'instant. Soyez le premier à partager !',
                    'No posts yet. Be the first to share!'
                  )}
                </div>
              )}
              {posts.map(post => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  domainColor={DOMAIN_COLOR}
                  isAuthenticated={isAuthenticated}
                  currentUserName={displayName}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
              {hasMore && !loading && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => loadPosts(page + 1)}
                    className="text-sm text-[#3F441C] font-semibold hover:underline px-6 py-2 rounded-xl border border-[#3F441C]/30 hover:bg-[#3F441C]/5 transition-colors"
                  >
                    {t('Voir plus', 'Load more')}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              {t('Communiqués des institutions et organes officiels', 'Announcements from institutions and official bodies')}
            </p>
            <div className="space-y-4">
              {agricultureAnnouncements.map(ann => (
                <div key={ann.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                      {categoryIcon(ann.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wide"
                          style={{ backgroundColor: ann.badgeColor }}
                        >
                          {ann.badge}
                        </span>
                        <span className="text-xs text-gray-400">{ann.date}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-tight">{ann.institution}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{ann.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{ann.summary}</p>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">{t('Communiqué officiel', 'Official Announcement')}</span>
                    <ChevronRight className="w-3 h-3 text-gray-300 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
