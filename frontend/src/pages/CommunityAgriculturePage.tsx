import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Wheat, Send, Building2, FileText, ChevronRight, MessageSquare } from 'lucide-react';
import { agricultureAnnouncements, type InstitutionalAnnouncement } from '../data/institutionalAnnouncements';
import CommunityPostCard from '../components/community/CommunityPostCard';
import { useLanguage } from '../contexts/LanguageContext';

const DOMAIN_COLOR = '#3F441C';

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
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'discussions' | 'officiel'>('discussions');

  const communityPosts = [
    {
      id: 1,
      author: 'Jean Kaptue',
      region: 'Ouest, Bafoussam',
      role: t('Producteur de maïs', 'Maize producer'),
      content: t('Belle récolte cette saison ! Mes rendements de maïs ont augmenté de 20% grâce à une meilleure gestion de l\'irrigation. Je partage mes techniques avec plaisir.', 'Great harvest this season! My maize yields increased by 20% thanks to better irrigation management. Happy to share my techniques.'),
      likes: 24,
      comments: 7,
      timeAgo: t('Il y a 2h', '2h ago'),
      avatar: 'JK',
    },
    {
      id: 2,
      author: 'Marie Nganou',
      region: 'Centre, Yaoundé',
      role: t('Agricultrice bio', 'Organic farmer'),
      content: t('Je cherche des conseils sur les engrais organiques pour mes cultures de manioc. Quelqu\'un a-t-il testé le compost de déchets ménagers ? Quels sont vos retours ?', 'Looking for advice on organic fertilizers for my cassava crops. Has anyone tested household waste compost? What are your thoughts?'),
      likes: 12,
      comments: 18,
      timeAgo: t('Il y a 5h', '5h ago'),
      avatar: 'MN',
    },
    {
      id: 3,
      author: 'Paul Mfou',
      region: 'Littoral, Douala',
      role: t('Fournisseur de semences', 'Seed supplier'),
      content: t('Nouveau système d\'irrigation installé sur mon exploitation de 5 hectares. Économie d\'eau de 40% par rapport à l\'ancien système. Heureux de partager mon expérience !', 'New irrigation system installed on my 5-hectare farm. 40% water savings compared to the old system. Happy to share my experience!'),
      likes: 31,
      comments: 11,
      timeAgo: t('Il y a 1j', '1d ago'),
      avatar: 'PM',
    },
    {
      id: 4,
      author: 'Aminata Fouda',
      region: 'Nord, Garoua',
      role: t('Productrice de sorgho', 'Sorghum producer'),
      content: t('Alerte sécheresse dans le Nord ! Nous avons besoin de solidarité. Si vous avez des semences résistantes à la chaleur disponibles, contactez-moi. Merci à la communauté.', 'Drought alert in the North! We need solidarity. If you have heat-resistant seeds available, contact me. Thanks to the community.'),
      likes: 48,
      comments: 22,
      timeAgo: t('Il y a 2j', '2d ago'),
      avatar: 'AF',
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
            <span className="font-semibold" style={{ color: DOMAIN_COLOR }}>12 847</span>
            <span>{t('membres', 'members')}</span>
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
            {/* Créer une discussion */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder={t("Partagez une expérience, posez une question à la communauté...", "Share an experience, ask a question to the community...")}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F441C]/30 resize-none text-sm text-gray-800"
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
