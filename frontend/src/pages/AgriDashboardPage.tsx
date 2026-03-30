import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import AIChat from '@/components/AIChat';
import { 
  Thermometer, Droplets, Sun, Wind, Sprout, 
  AlertTriangle, CheckCircle, Activity, Zap, CloudRain,
  Tractor, Wheat, BarChart3, Brain, Bell, Package,
  Settings, Lightbulb, Waves, Battery, Wifi
} from 'lucide-react';

export default function AgriDashboardPage() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'greenhouse' | 'farm' | 'analytics'>('greenhouse');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Greenhouse real-time data (simulated IoT)
  const [greenhouseData, setGreenhouseData] = useState({
    temperature: 24.5,
    humidity: 68,
    soilMoisture: 45,
    lightIntensity: 850,
    co2Level: 420,
    waterLevel: 78
  });

  // Farm data
  const farmStats = {
    totalCrops: 12,
    activeCrops: 8,
    livestock: 45,
    equipment: 15,
    alerts: 3
  };

  // Weather data
  const weather = {
    current: 28,
    condition: 'Ensoleillé',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: 'Lun', temp: 29, icon: '☀️', rain: 10 },
      { day: 'Mar', temp: 27, icon: '⛅', rain: 30 },
      { day: 'Mer', temp: 26, icon: '🌧️', rain: 70 },
      { day: 'Jeu', temp: 28, icon: '☀️', rain: 5 },
      { day: 'Ven', temp: 30, icon: '☀️', rain: 0 }
    ]
  };

  // Recommendations removed - cleaner interface

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGreenhouseData(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(40, Math.min(80, prev.humidity + (Math.random() - 0.5) * 2)),
        soilMoisture: Math.max(30, Math.min(70, prev.soilMoisture + (Math.random() - 0.5) * 3)),
        lightIntensity: Math.max(0, Math.min(1000, prev.lightIntensity + (Math.random() - 0.5) * 50)),
        co2Level: Math.max(350, Math.min(500, prev.co2Level + (Math.random() - 0.5) * 10)),
        waterLevel: Math.max(50, Math.min(100, prev.waterLevel + (Math.random() - 0.5) * 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isDark = theme.theme === 'dark';

  if (!user) return null;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-20 backdrop-blur-xl border-b ${isDark ? 'bg-gray-900/80 border-green-500/20' : 'bg-white/80 border-green-200'}`}>
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                � Tableau de Bord
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Gestion de votre ferme • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {(user.profile as any)?.display_name || 'Agriculteur'}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(user.profile as any)?.region || 'Cameroun'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                {(user.profile as any)?.display_name?.[0]?.toUpperCase() || '👤'}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'greenhouse', label: '🏡 Ma Serre', icon: Sprout },
              { id: 'farm', label: '🚜 Ma Ferme', icon: Tractor },
              { id: 'analytics', label: '📊 Statistiques', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white text-green-700 shadow-lg border border-green-200'
                    : isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 py-6 space-y-6">
        {/* Weather Widget */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${isDark ? 'bg-blue-500/20' : 'bg-white'}`}>
                ☀️
              </div>
              <div>
                <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {weather.current}°C
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {weather.condition} • Douala, Cameroun
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{weather.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-day forecast */}
            <div className="flex gap-3">
              {weather.forecast.map((day, idx) => (
                <div key={idx} className={`text-center p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                  <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{day.day}</p>
                  <div className="text-2xl my-2">{day.icon}</div>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{day.temp}°</p>
                  <div className="flex items-center gap-1 mt-1 justify-center">
                    <CloudRain className="w-3 h-3 text-blue-500" />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{day.rain}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'greenhouse' && (
          <>
            {/* Greenhouse Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Temperature Control */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                      <Thermometer className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Température</h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Serre #1</p>
                    </div>
                  </div>
                  <button className={`p-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {greenhouseData.temperature.toFixed(1)}°C
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-32 h-2 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-full relative">
                      <div 
                        className="absolute w-3 h-3 bg-white border-2 border-gray-900 rounded-full -top-0.5"
                        style={{ left: `${((greenhouseData.temperature - 15) / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Optimal: 22-26°C
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    <Wind className="w-4 h-4 inline mr-1" />
                    Refroidir
                  </button>
                  <button className={`flex-1 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                    <Zap className="w-4 h-4 inline mr-1" />
                    Chauffer
                  </button>
                </div>
              </div>

              {/* Humidity Control */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Humidité</h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Air & Sol</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    greenhouseData.humidity > 70 
                      ? 'bg-orange-500/20 text-orange-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {greenhouseData.humidity > 70 ? 'Élevée' : 'Normale'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Air</span>
                      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {greenhouseData.humidity.toFixed(0)}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${greenhouseData.humidity}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Sol</span>
                      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {greenhouseData.soilMoisture.toFixed(0)}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                        style={{ width: `${greenhouseData.soilMoisture}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button className={`w-full mt-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                  <Waves className="w-4 h-4 inline mr-1" />
                  Activer Irrigation
                </button>
              </div>

              {/* Light Control */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Sun className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Lumière</h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Intensité</p>
                    </div>
                  </div>
                  <button className={`p-2 rounded-lg ${isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                    <Lightbulb className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {greenhouseData.lightIntensity.toFixed(0)}
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>lux</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>LED Croissance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 font-medium">ON</span>
                      <div className="w-10 h-5 bg-green-500 rounded-full relative">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>UV Supplémentaire</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>OFF</span>
                      <div className={`w-10 h-5 rounded-full relative ${isDark ? 'bg-white/10' : 'bg-gray-300'}`}>
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CO2 & Water Levels */}
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Niveaux Critiques
                </h3>
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5 text-green-500" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>CO₂</span>
                      </div>
                      <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {greenhouseData.co2Level.toFixed(0)} ppm
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${(greenhouseData.co2Level / 500) * 100}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Optimal: 400-450 ppm
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Battery className="w-5 h-5 text-blue-500" />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Réservoir d'Eau</span>
                      </div>
                      <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {greenhouseData.waterLevel.toFixed(0)}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${greenhouseData.waterLevel}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {greenhouseData.waterLevel < 60 ? '⚠️ Niveau bas - Remplir bientôt' : '✅ Niveau optimal'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {activeTab === 'farm' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Farm Stats Cards */}
            {[
              { icon: Wheat, label: 'Cultures Actives', value: farmStats.activeCrops, total: farmStats.totalCrops, color: 'green' },
              { icon: Package, label: 'Bétail', value: farmStats.livestock, unit: 'têtes', color: 'amber' },
              { icon: Tractor, label: 'Équipements', value: farmStats.equipment, unit: 'actifs', color: 'blue' },
              { icon: Bell, label: 'Alertes', value: farmStats.alerts, unit: 'en attente', color: 'red' }
            ].map((stat, idx) => (
              <div key={idx} className={`rounded-2xl p-6 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                </div>
                <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </h3>
                <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                  {stat.total && <span className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/{stat.total}</span>}
                </div>
                {stat.unit && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.unit}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bigiss Assistant */}
            <div>
              <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                💬 Bigiss - Votre Assistant
              </h3>
              <AIChat />
            </div>

            {/* Analytics Preview */}
            <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
              <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Analytics IA Avancés
              </h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Graphiques détaillés, prédictions ML, et analyses approfondies
              </p>
              <div className="space-y-3">
                <div className={`p-4 rounded-xl text-left ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    📈 Prédictions de Rendement
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Utilisez l'IA pour prévoir vos récoltes
                  </p>
                </div>
                <div className={`p-4 rounded-xl text-left ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    💰 Analyse de Rentabilité
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Optimisez vos profits par culture
                  </p>
                </div>
                <div className={`p-4 rounded-xl text-left ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    🎯 Détection Maladies
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Vision IA pour diagnostiquer vos cultures
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
