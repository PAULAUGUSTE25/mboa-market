import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { User as UserIcon, Wheat, Heart, MessageCircle, AlertTriangle, Lightbulb, Award, Megaphone, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeStyles } from '@/utils/themeStyles';
import { getCardStyles, getTextStyles } from '@/utils/cardStyles';
import { generateDemoCommunityPosts } from '@/data/demoCommunityPosts';

export default function CommunityAgriculturePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme } = useTheme();
  const styles = getThemeStyles(theme);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [commentingPost, setCommentingPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showMenuPost, setShowMenuPost] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // Load demo community posts
      const demoPosts = generateDemoCommunityPosts();
      
      // Load demo listings (always show)
      const { generateDemoListings } = await import('@/data/demoListings');
      const demoListings = generateDemoListings();
      
      // Load REAL listings from API
      let realListings: any[] = [];
      try {
        // Try to load PUBLISHED listings
        const response = await api.getListings({ page: 1, page_size: 100, status: 'PUBLISHED' });
        realListings = response.items || [];
        
        // If no PUBLISHED listings, try loading all listings (backend might still have DRAFT)
        if (realListings.length === 0) {
          const allResponse = await api.getListings({ page: 1, page_size: 100 });
          realListings = allResponse.items || [];
        }
      } catch (apiError) {
        console.warn('Could not load real listings from API:', apiError);
      }
      
      // Combine real and demo listings (always show both)
      const allListings = [...demoListings, ...realListings];
      
      // Convert listings to post format
      const listingPosts = allListings
        .filter((listing: any) => {
          // Check if listing belongs to agriculture domain
          const isAgriculture = 
            listing.category_id === 'agriculture' || 
            listing.domain === 'agriculture' ||
            listing.seller?.profile?.domain === 'agriculture';
          return isAgriculture;
        })
        .map((listing: any) => ({
          id: listing.id,
          author: listing.seller?.profile?.display_name || 'Utilisateur',
          author_role: 'community_member',
          title: listing.title,
          content: `Quantité: ${listing.quantity} ${listing.unit}\nPrix: ${listing.price_per_unit} ${listing.currency}/${listing.unit}\nRégion: ${listing.region}${listing.locality ? ` - ${listing.locality}` : ''}`,
          domain: 'agriculture',
          type: 'announcement',
          region: listing.region,
          images: listing.images || [],
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          created_at: listing.created_at
        }));
      
      // Combine posts and listings
      let allPosts = [...demoPosts.filter((post: any) => post.domain === 'agriculture'), ...listingPosts];
      
      // Filter by type if selected
      if (filter !== 'all') {
        allPosts = allPosts.filter((post: any) => post.type === filter);
      }
      
      // Sort by date (most recent first)
      allPosts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setPosts(allPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) {
      alert('Connectez-vous pour aimer ce post');
      return;
    }
    
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: likedPosts.has(postId) ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleComment = (postId: string) => {
    if (!user) {
      alert('Connectez-vous pour commenter');
      return;
    }
    
    if (commentingPost === postId) {
      if (commentText.trim()) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments + 1
            };
          }
          return post;
        }));
        setCommentText('');
        setCommentingPost(null);
        alert('✅ Commentaire ajouté avec succès!');
      }
    } else {
      setCommentingPost(postId);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) {
      alert('Connectez-vous pour supprimer');
      return;
    }

    const confirmDelete = window.confirm('🗑️ Êtes-vous sûr de vouloir supprimer cette publication ?\n\nCette action est irréversible.');
    if (!confirmDelete) return;

    try {
      // Try to delete via API
      await api.deleteListing(postId);
    } catch (error) {
      console.warn('Could not delete via API, removing locally:', error);
    }

    // Remove from local state
    setPosts(prev => prev.filter(post => post.id !== postId));
    setShowMenuPost(null);
    alert('✅ Publication supprimée avec succès!');
  };

  const isPostOwner = (post: any) => {
    if (!user) return false;
    // Check if current user is the post author
    return post.author === user.profile?.display_name || 
           post.id?.includes('local-') || // Local posts created by user
           post.seller_id === user.id;
  };

  const getActivityTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      seed_provider: 'Fournisseur',
      producer: 'Producteur',
      buyer: 'Acheteur',
    };
    return labels[type] || type;
  };

  const getActivityTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      seed_provider: 'bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 border border-cyan-400/30 text-cyan-200',
      producer: 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30 text-emerald-200',
      buyer: 'bg-gradient-to-br from-purple-500/30 to-purple-600/20 border border-purple-400/30 text-purple-200',
    };
    return colors[type] || 'bg-gradient-to-br from-white/20 to-white/10 border border-white/30 text-white';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: theme === 'light' 
            ? `url('/light%20mode%20.png')`
            : `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')`,
        }}
      >
        <div className={`absolute inset-0 ${theme === 'dark' ? `bg-gradient-to-br ${styles.background}` : ''}`} style={{
          backdropFilter: theme === 'light' ? 'blur(2px)' : undefined,
          backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : undefined
        }}></div>
      </div>

      {/* Animated Background Pattern - Dark Mode Only */}
      {theme === 'dark' && (
        <div className={`fixed inset-0 ${styles.blobs}`}>
          <div className={`absolute top-10 left-10 w-32 h-32 ${styles.blobColors[0]} rounded-full blur-3xl animate-pulse`}></div>
          <div className={`absolute top-40 right-20 w-40 h-40 ${styles.blobColors[1]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
          <div className={`absolute bottom-20 left-1/4 w-36 h-36 ${styles.blobColors[2]} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
        </div>
      )}

      {/* Visible Animated Icon Background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
        animate={{ 
          opacity: [0, 0.1, 0.08, 0.1],
          scale: [0.98, 1, 1.01, 1],
          rotate: 0
        }}
        transition={{ 
          opacity: { duration: 1.2, times: [0, 0.4, 0.7, 1], ease: "easeInOut" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 0.8, ease: "easeOut" }
        }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      >
        <div className="text-emerald-500/[0.12]">
          <Wheat className="w-[600px] h-[600px]" strokeWidth={0.6} />
        </div>
      </motion.div>

      {/* Animated Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1,
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          opacity: { duration: 0.8 },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="fixed inset-0 pointer-events-none"
      >
        <motion.div 
          animate={{
            opacity: [0.06, 0.09, 0.06]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] bg-emerald-500/[0.06]"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/feed')}
            className="mb-4 sm:mb-6 transition-all transform hover:scale-110 text-2xl font-bold"
            style={{ color: theme === 'light' ? '#374151' : '#9CA3AF' }}
          >
            ←
          </button>
          
          {user && (
            <button
              onClick={() => navigate('/profile')}
              className="group relative"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/30 border-2 border-emerald-500/50 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110">
                <UserIcon className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              <div className="absolute top-14 right-0 bg-white/10 backdrop-blur-md rounded-xl shadow-xl px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-emerald-500/30">
                <p className="text-sm font-bold text-white">{user.profile?.display_name}</p>
                <p className="text-xs text-white/70">{getActivityTypeLabel(user.profile?.activity_type || '')}</p>
              </div>
            </button>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center shadow-xl">
              <Wheat className="h-8 w-8 text-emerald-300" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: getTextStyles(theme).title }}>
                Communauté Agriculture
              </h1>
              <p className="font-medium" style={{ color: getTextStyles(theme).muted }}>
                Cultures et Produits Agricoles
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-full font-bold transition-all border-2"
            style={{
              background: theme === 'light'
                ? (filter === 'all' ? '#10b918d0' : '#FFFFFF')
                : (filter === 'all' ? 'rgba(24, 185, 16, 0.65)' : 'rgba(255, 255, 255, 0.1)'),
              borderColor: theme === 'light'
                ? (filter === 'all' ? '#3ab910a2' : '#D1D5DB')
                : (filter === 'all' ? 'rgba(16, 185, 53, 0.54)' : 'rgba(255, 255, 255, 0.2)'),
              color: theme === 'light'
                ? (filter === 'all' ? '#FFFFFF' : '#1A1A1A')
                : '#FFFFFF'
            }}
          >
            Tous les posts
          </button>
          <button
            onClick={() => setFilter('expert_advice')}
            className="px-4 py-2 rounded-full font-bold transition-all border-2"
            style={{
              background: theme === 'light'
                ? (filter === 'expert_advice' ? '#06B6D4' : '#FFFFFF')
                : (filter === 'expert_advice' ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.1)'),
              borderColor: theme === 'light'
                ? (filter === 'expert_advice' ? '#06B6D4' : '#D1D5DB')
                : (filter === 'expert_advice' ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.2)'),
              color: theme === 'light'
                ? (filter === 'expert_advice' ? '#FFFFFF' : '#1A1A1A')
                : '#FFFFFF'
            }}
          >
            <Award className="h-4 w-4 inline-block mr-2" strokeWidth={2} />
            Conseils Experts
          </button>
          <button
            onClick={() => setFilter('tip')}
            className="px-4 py-2 rounded-full font-bold transition-all border-2"
            style={{
              background: theme === 'light'
                ? (filter === 'tip' ? '#10B981' : '#FFFFFF')
                : (filter === 'tip' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'),
              borderColor: theme === 'light'
                ? (filter === 'tip' ? '#10B981' : '#D1D5DB')
                : (filter === 'tip' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.2)'),
              color: theme === 'light'
                ? (filter === 'tip' ? '#FFFFFF' : '#1A1A1A')
                : '#FFFFFF'
            }}
          >
            <Lightbulb className="h-4 w-4 inline-block mr-2" strokeWidth={2} />
            Astuces
          </button>
          <button
            onClick={() => setFilter('announcement')}
            className="px-4 py-2 rounded-full font-bold transition-all border-2"
            style={{
              background: theme === 'light'
                ? (filter === 'announcement' ? '#A855F7' : '#FFFFFF')
                : (filter === 'announcement' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.1)'),
              borderColor: theme === 'light'
                ? (filter === 'announcement' ? '#A855F7' : '#D1D5DB')
                : (filter === 'announcement' ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255, 255, 255, 0.2)'),
              color: theme === 'light'
                ? (filter === 'announcement' ? '#FFFFFF' : '#1A1A1A')
                : '#FFFFFF'
            }}
          >
            <Megaphone className="h-4 w-4 inline-block mr-2" strokeWidth={2} />
            Annonces
          </button>
          <button
            onClick={() => setFilter('warning')}
            className="px-4 py-2 rounded-full font-bold transition-all border-2"
            style={{
              background: theme === 'light'
                ? (filter === 'warning' ? '#f87b0dff' : '#FFFFFF')
                : (filter === 'warning' ? 'rgba(208, 68, 7, 0.73)' : 'rgba(255, 255, 255, 0.1)'),
              borderColor: theme === 'light'
                ? (filter === 'warning' ? '#EF4444' : '#D1D5DB')
                : (filter === 'warning' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.2)'),
              color: theme === 'light'
                ? (filter === 'warning' ? '#FFFFFF' : '#1A1A1A')
                : '#FFFFFF'
            }}
          >
            <AlertTriangle className="h-4 w-4 inline-block mr-2" strokeWidth={2} />
            Alertes
          </button>
        </motion.div>

        {user && (
          <div 
            className="mb-6 backdrop-blur-md rounded-2xl p-5 border shadow-xl"
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#10B981' : 'rgba(16, 185, 129, 0.3)'
            }}
          >
            <p className="text-sm flex items-center gap-3" style={{ color: getTextStyles(theme).body }}>
              <span className="font-medium">Connecté en tant que:</span>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${getActivityTypeColor(user.profile?.activity_type || '')}`}>
                {getActivityTypeLabel(user.profile?.activity_type || '')}
              </span>
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4" style={{ color: getTextStyles(theme).body }}>Chargement des posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div 
            className="text-center py-12 backdrop-blur-md rounded-2xl border"
            style={{
              ...getCardStyles(theme, 'emerald'),
              borderColor: theme === 'light' ? '#10B981' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <p className="text-lg font-bold" style={{ color: getTextStyles(theme).title }}>Aucun post disponible</p>
            <p className="text-sm mt-2" style={{ color: getTextStyles(theme).muted }}>
              Revenez plus tard pour voir les nouveaux posts de la communauté !
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border"
                style={{
                  background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                  borderColor: theme === 'light' ? '#D1D5DB' : 'rgba(255, 255, 255, 0.2)'
                }}
              >
                {post.images && post.images.length > 0 && (
                  <div className="h-64 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm relative overflow-hidden">
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${
                          post.type === 'expert_advice' ? 'bg-cyan-500/30 border border-cyan-400/30 text-cyan-200' :
                          post.type === 'tip' ? 'bg-emerald-500/30 border border-emerald-400/30 text-emerald-200' :
                          post.type === 'warning' ? 'bg-red-500/30 border border-red-400/30 text-red-200' :
                          post.type === 'announcement' ? 'bg-purple-500/30 border border-purple-400/30 text-purple-200' :
                          'bg-blue-500/30 border border-blue-400/30 text-blue-200'
                        }`}>
                          {post.type === 'expert_advice' ? '👨‍🌾 Expert' :
                           post.type === 'tip' ? '💡 Astuce' :
                           post.type === 'warning' ? '⚠️ Alerte' :
                           post.type === 'announcement' ? '📢 Annonce' :
                           '🎉 Succès'}
                        </span>
                        <span className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                          {post.region}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: getTextStyles(theme).title }}>
                        {post.title}
                      </h3>
                    </div>
                    
                    {/* Edit/Delete Menu - Only for post owner */}
                    {isPostOwner(post) && (
                      <div className="relative">
                        <button
                          onClick={() => setShowMenuPost(showMenuPost === post.id ? null : post.id)}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                          style={{ color: getTextStyles(theme).muted }}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {showMenuPost === post.id && (
                          <div 
                            className="absolute right-0 top-10 rounded-lg shadow-xl border z-50 min-w-[160px]"
                            style={{
                              background: theme === 'light' ? '#FFFFFF' : 'rgba(0, 0, 0, 0.9)',
                              borderColor: theme === 'light' ? '#D1D5DB' : 'rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            <button
                              onClick={() => {
                                alert('🚧 Fonction de modification en cours de développement');
                                setShowMenuPost(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-emerald-500/10 transition-colors"
                              style={{ color: getTextStyles(theme).body }}
                            >
                              <Edit2 className="h-4 w-4" />
                              <span>Modifier</span>
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 transition-colors text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm mb-4 whitespace-pre-line" style={{ color: getTextStyles(theme).body }}>
                    {post.content}
                  </p>
                  
                  <div className="pt-4 border-t" style={{ borderColor: theme === 'light' ? '#E5E7EB' : 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            likedPosts.has(post.id) 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'hover:text-emerald-400'
                          }`} 
                          style={{ color: likedPosts.has(post.id) ? undefined : getTextStyles(theme).muted }}
                        >
                          <Heart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </button>
                        <button 
                          onClick={() => handleComment(post.id)}
                          className="flex items-center gap-2 text-sm hover:text-emerald-400 transition-colors" 
                          style={{ color: getTextStyles(theme).muted }}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </button>
                      </div>
                      <div className="text-xs" style={{ color: getTextStyles(theme).muted }}>
                        Par {post.author}
                      </div>
                    </div>
                    
                    {commentingPost === post.id && (
                      <div className="mt-3">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Écrivez votre commentaire..."
                          className="w-full rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                          style={{
                            background: theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: theme === 'light' ? '#D1D5DB' : 'rgba(255, 255, 255, 0.2)',
                            color: getTextStyles(theme).body
                          }}
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleComment(post.id)}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                          >
                            Publier
                          </button>
                          <button
                            onClick={() => {
                              setCommentingPost(null);
                              setCommentText('');
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                              background: theme === 'light' ? '#F3F4F6' : 'rgba(255, 255, 255, 0.1)',
                              color: getTextStyles(theme).body
                            }}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
