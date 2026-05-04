import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, ArrowLeft, Send, Building2, FileText, ChevronRight } from 'lucide-react';
import { elevageAnnouncements, type InstitutionalAnnouncement } from '../data/institutionalAnnouncements';
import CommunityPostCard from '../components/community/CommunityPostCard';
import { useLanguage } from '../contexts/LanguageContext';

const DOMAIN_COLOR = '#7C3D12';

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

export default function CommunityElevagePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'discussions' | 'officiel'>('discussions');

  const communityPosts = [
    {
      id: 1,
      author: 'Samuel Djomo',
      region: 'Ouest, Bafoussam',
      role: t('Éleveur de poulets', 'Chicken farmer'),
      content: t('Nouveau lot de poulets de chair en très bonne santé. Recommandations d\'alimentation bienvenues ! J\'utilise actuellement un mélange maïs-soja local avec d\'excellents résultats.', 'New batch of very healthy broilers. Feeding recommendations welcome! Currently using a local corn-soy blend with excellent results.'),
      likes: 28,
      comments: 9,
      timeAgo: t('Il y a 1h', '1h ago'),
      avatar: 'SD',
    },
    {
      id: 2,
      author: 'Grace Tchamba',
      region: 'Centre, Yaoundé',
      role: t('Éleveuse bovine', 'Cattle farmer'),
      content: t('Visite vétérinaire aujourd\'hui — tout le bétail est en bonne santé ! Je recommande des vaccinations régulières, surtout avant la saison des pluies. Partagez vos protocoles de vaccination.', 'Vet visit today — all cattle are healthy! I recommend regular vaccinations, especially before the rainy season. Share your vaccination protocols.'),
      likes: 19,
      comments: 4,
      timeAgo: t('Il y a 3h', '3h ago'),
      avatar: 'GT',
    },
    {
      id: 3,
      author: 'David Lekol',
      region: 'Nord-Ouest, Bamenda',
      role: t('Éleveur bovin', 'Cattle farmer'),
      content: t('Je cherche à agrandir ma ferme bovine. Des conseils sur la gestion des pâturages en zone de hautes terres ? Mes 45 têtes de bétail manquent d\'espace pendant la saison sèche.', 'Looking to expand my cattle farm. Any advice on pasture management in highland areas? My 45 head of cattle lack space during the dry season.'),
      likes: 15,
      comments: 12,
      timeAgo: t('Il y a 6h', '6h ago'),
      avatar: 'DL',
    },
    {
      id: 4,
      author: 'Hawa Mbarga',
      region: 'Littoral, Douala',
      role: t('Piscicultrice', 'Fish farmer'),
      content: t('Ma production de tilapia a doublé cette année grâce à l\'alimentation en spiruline locale. Je vends en gros et au détail. Intéressés par un partenariat ? Contactez-moi !', 'My tilapia production doubled this year thanks to local spirulina feed. I sell wholesale and retail. Interested in a partnership? Contact me!'),
      likes: 42,
      comments: 16,
      timeAgo: t('Il y a 1j', '1d ago'),
      avatar: 'HM',
    },
  ];

  const [localPosts, setLocalPosts] = useState(communityPosts);

  const handlePublish = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      author: t('Vous', 'You'),
      region: 'Cameroun',
      role: t('Membre de la communauté', 'Community member'),
      content: newPost.trim(),
      likes: 0,
      comments: 0,
      timeAgo: t('À l\'instant', 'Just now'),
      avatar: 'V',
    };
    setLocalPosts([post, ...localPosts]);
    setNewPost('');
  };

  const handleLike = (id: number) => {
    setLikedPosts(prev => {
      const wasLiked = prev.has(id);
      const next = new Set(prev);
      wasLiked ? next.delete(id) : next.add(id);
      setLocalPosts(posts => posts.map(p =>
        p.id === id ? { ...p, likes: wasLiked ? p.likes - 1 : p.likes + 1 } : p
      ));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-orange-50">
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
              <span className="text-white text-lg">🐄</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('Communauté Élevage', 'Livestock Community')}</h1>
              <p className="text-xs text-gray-500">{t('Réseau des éleveurs du Cameroun', 'Cameroon Livestock Network')}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span className="font-semibold" style={{ color: DOMAIN_COLOR }}>8 542</span>
            <span>{t('membres', 'members')}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-0 border-t border-gray-100">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'discussions'
                ? 'text-[#7C3D12] border-[#7C3D12]'
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
                ? 'text-[#7C3D12] border-[#7C3D12]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            {t('Communiqués officiels', 'Official Announcements')}
            <span className="text-white text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: DOMAIN_COLOR }}>
              {elevageAnnouncements.length}
            </span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'discussions' ? (
          <>
            {/* Créer une discussion */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder={t("Partagez une expérience, posez une question à la communauté...", "Share an experience, ask a question to the community...")}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 resize-none text-sm text-gray-800"
                style={{ '--tw-ring-color': DOMAIN_COLOR } as React.CSSProperties}
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={handlePublish}
                  disabled={!newPost.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: DOMAIN_COLOR }}
                >
                  <Send className="w-4 h-4" />
                  {t('Publier', 'Post')}
                </button>
              </div>
            </div>

            {/* Liste des discussions */}
            <div className="space-y-4">
              {localPosts.map(post => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  domainColor={DOMAIN_COLOR}
                  liked={likedPosts.has(post.id)}
                  onLike={handleLike}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t('Communiqués des institutions et organes officiels', 'Announcements from institutions and official bodies')}</p>
            <div className="space-y-4">
              {elevageAnnouncements.map(ann => (
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
