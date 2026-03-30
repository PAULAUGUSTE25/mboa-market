import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { useDomain } from '@/contexts/DomainContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users, 
  Activity, BarChart3, PieChart, Calendar, Bell, Star, Award,
  ArrowUpRight, ArrowDownRight, Eye, Heart, MessageCircle, Share2,
  Sparkles, Brain, Target, Zap, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'sale' | 'view' | 'message' | 'favorite';
  title: string;
  description: string;
  time: string;
  amount?: string;
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { selectedDomain } = useDomain();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Stats data
  const stats: StatCard[] = [
    {
      title: 'Revenus Totaux',
      value: '2,450,000 FCFA',
      change: 12.5,
      icon: DollarSign,
      color: '#10B981'
    },
    {
      title: 'Ventes',
      value: '156',
      change: 8.2,
      icon: ShoppingCart,
      color: '#3B82F6'
    },
    {
      title: 'Produits Actifs',
      value: '24',
      change: -2.4,
      icon: Package,
      color: '#F59E0B'
    },
    {
      title: 'Visiteurs',
      value: '3,429',
      change: 15.8,
      icon: Users,
      color: '#8B5CF6'
    }
  ];

  // Recent activities
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'sale',
      title: 'Nouvelle vente',
      description: 'Maïs Bio - 50kg vendu à Jean Acheteur',
      time: 'Il y a 5 min',
      amount: '25,000 FCFA'
    },
    {
      id: '2',
      type: 'message',
      title: 'Nouveau message',
      description: 'Marie Agricultrice vous a envoyé un message',
      time: 'Il y a 15 min'
    },
    {
      id: '3',
      type: 'favorite',
      title: 'Produit favori',
      description: '3 personnes ont ajouté vos tomates aux favoris',
      time: 'Il y a 1h'
    },
    {
      id: '4',
      type: 'view',
      title: 'Vues du profil',
      description: 'Votre profil a été consulté 24 fois aujourd\'hui',
      time: 'Il y a 2h'
    }
  ];

  // AI Insights
  const aiInsights = [
    {
      icon: Brain,
      title: 'Recommandation IA',
      description: 'Augmentez vos prix de 8% - la demande est forte cette semaine',
      color: '#8B5CF6',
      action: 'Voir détails'
    },
    {
      icon: Target,
      title: 'Opportunité de vente',
      description: '12 acheteurs recherchent du maïs dans votre région',
      color: '#10B981',
      action: 'Contacter'
    },
    {
      icon: Zap,
      title: 'Tendance du marché',
      description: 'Les prix du riz augmentent de 15% - stockez maintenant',
      color: '#F59E0B',
      action: 'Analyser'
    }
  ];

  // Sales chart data (mock)
  const salesData = [
    { day: 'Lun', sales: 45 },
    { day: 'Mar', sales: 52 },
    { day: 'Mer', sales: 38 },
    { day: 'Jeu', sales: 65 },
    { day: 'Ven', sales: 58 },
    { day: 'Sam', sales: 72 },
    { day: 'Dim', sales: 48 }
  ];

  const maxSales = Math.max(...salesData.map(d => d.sales));

  const getCardStyles = (isDark: boolean) => ({
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E5E7EB',
    backdropFilter: 'blur(10px)'
  });

  const getTextStyles = (isDark: boolean) => ({
    title: isDark ? '#FFFFFF' : '#111827',
    subtitle: isDark ? '#9CA3AF' : '#6B7280',
    muted: isDark ? '#6B7280' : '#9CA3AF'
  });

  if (!user) return null;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#060D0A]' : 'bg-[#F0F2F5]'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#060D0A]/80 backdrop-blur-xl border-b border-white/10' : 'bg-white border-b border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: getTextStyles(theme === 'dark').title }}>
                Tableau de Bord
              </h1>
              <p className="text-sm mt-1" style={{ color: getTextStyles(theme === 'dark').subtitle }}>
                Bienvenue, {user.profile?.display_name || 'Utilisateur'} 👋
              </p>
            </div>

            {/* Time Range Selector */}
            <div className={`flex gap-2 p-1 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
              {(['today', 'week', 'month', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? theme === 'dark'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white text-emerald-600 shadow-sm'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === 'today' ? 'Aujourd\'hui' : range === 'week' ? 'Semaine' : range === 'month' ? 'Mois' : 'Année'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 transition-all hover:scale-105 cursor-pointer"
              style={getCardStyles(theme === 'dark')}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <h3 className="text-sm font-medium mb-1" style={{ color: getTextStyles(theme === 'dark').subtitle }}>
                {stat.title}
              </h3>
              <p className="text-2xl font-bold" style={{ color: getTextStyles(theme === 'dark').title }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* AI Insights */}
        <div className="rounded-2xl p-6" style={getCardStyles(theme === 'dark')}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold" style={{ color: getTextStyles(theme === 'dark').title }}>
              Insights IA
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'} transition-all cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${insight.color}20` }}
                  >
                    <insight.icon className="w-5 h-5" style={{ color: insight.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1" style={{ color: getTextStyles(theme === 'dark').title }}>
                      {insight.title}
                    </h3>
                    <p className="text-xs mb-2" style={{ color: getTextStyles(theme === 'dark').subtitle }}>
                      {insight.description}
                    </p>
                    <button
                      className="text-xs font-medium hover:underline"
                      style={{ color: insight.color }}
                    >
                      {insight.action} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 rounded-2xl p-6" style={getCardStyles(theme === 'dark')}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold" style={{ color: getTextStyles(theme === 'dark').title }}>
                  Ventes de la semaine
                </h2>
              </div>
              <button className="text-sm font-medium text-blue-500 hover:underline">
                Voir tout
              </button>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {salesData.map((data, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12" style={{ color: getTextStyles(theme === 'dark').subtitle }}>
                    {data.day}
                  </span>
                  <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }}>
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{
                        width: `${(data.sales / maxSales) * 100}%`,
                        background: 'linear-gradient(to right, #10B981, #059669)'
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right" style={{ color: getTextStyles(theme === 'dark').title }}>
                    {data.sales}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl p-6" style={getCardStyles(theme === 'dark')}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold" style={{ color: getTextStyles(theme === 'dark').title }}>
                Activité Récente
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const icons = {
                  sale: ShoppingCart,
                  message: MessageCircle,
                  favorite: Heart,
                  view: Eye
                };
                const colors = {
                  sale: '#10B981',
                  message: '#3B82F6',
                  favorite: '#EF4444',
                  view: '#8B5CF6'
                };
                const Icon = icons[activity.type];
                
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${colors[activity.type]}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: colors[activity.type] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm" style={{ color: getTextStyles(theme === 'dark').title }}>
                        {activity.title}
                      </h3>
                      <p className="text-xs mt-0.5 truncate" style={{ color: getTextStyles(theme === 'dark').subtitle }}>
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs" style={{ color: getTextStyles(theme === 'dark').muted }}>
                          {activity.time}
                        </span>
                        {activity.amount && (
                          <span className="text-xs font-bold text-green-500">
                            {activity.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-6" style={getCardStyles(theme === 'dark')}>
          <h2 className="text-lg font-bold mb-4" style={{ color: getTextStyles(theme === 'dark').title }}>
            Actions Rapides
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: 'Ajouter Produit', color: '#10B981' },
              { icon: Users, label: 'Voir Clients', color: '#3B82F6' },
              { icon: BarChart3, label: 'Analytics', color: '#8B5CF6' },
              { icon: Bell, label: 'Notifications', color: '#F59E0B' }
            ].map((action, index) => (
              <button
                key={index}
                className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'} transition-all hover:scale-105`}
              >
                <action.icon className="w-6 h-6 mx-auto mb-2" style={{ color: action.color }} />
                <p className="text-sm font-medium text-center" style={{ color: getTextStyles(theme === 'dark').title }}>
                  {action.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
