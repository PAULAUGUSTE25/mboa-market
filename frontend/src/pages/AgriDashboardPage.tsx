import { 
  Leaf, TrendingUp, DollarSign, Sprout, AlertTriangle, 
  Cloud, Droplet, ThermometerSun, Calendar, BarChart3,
  Bug, Droplets, Tractor, LineChart, Menu, Bell, Moon, User
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useUserFarm } from '../contexts/UserFarmContext'
import { useLanguage } from '../contexts/LanguageContext'
import BackButton from '../components/BackButton'

export default function AgriDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { farmData } = useUserFarm()
  const { t } = useLanguage()

  // Calculer les statistiques dynamiques
  const stats = useMemo(() => {
    const totalArea = farmData.totalArea
    const activeFields = farmData.fields.length
    const avgSoilHealth = farmData.fields.reduce((sum, f) => sum + f.soilHealth, 0) / farmData.fields.length
    
    // Calcul du rendement projeté basé sur les cultures (rendements camerounais réalistes)
    const yieldEstimates: { [key: string]: number } = {
      'Maïs': 2.8, // tonnes/hectare (rendement moyen Cameroun)
      'Cacao': 0.6, // tonnes/hectare
      'Plantain': 12, // tonnes/hectare
      'Manioc': 10, // tonnes/hectare
      'Café': 0.9, // tonnes/hectare
      'Arachide': 1.5,
      'Haricot': 1.2
    }
    
    const projectedYield = farmData.fields.reduce((sum, field) => {
      const hectares = field.area // déjà en hectares
      const yieldPerHectare = yieldEstimates[field.crop] || 2
      return sum + (hectares * yieldPerHectare * (field.soilHealth / 100))
    }, 0)

    // Calcul du revenu estimé (prix moyen par tonne en FCFA - marché camerounais)
    const prices: { [key: string]: number } = {
      'Maïs': 180000, // FCFA/tonne
      'Cacao': 1500000, // FCFA/tonne
      'Plantain': 120000, // FCFA/tonne
      'Manioc': 85000, // FCFA/tonne
      'Café': 2200000, // FCFA/tonne
      'Arachide': 450000,
      'Haricot': 350000
    }
    
    const estimatedRevenue = farmData.fields.reduce((sum, field) => {
      const hectares = field.area // déjà en hectares
      const yieldPerHectare = yieldEstimates[field.crop] || 2
      const fieldYield = hectares * yieldPerHectare * (field.soilHealth / 100)
      const price = prices[field.crop] || 100000
      return sum + (fieldYield * price)
    }, 0)

    return {
      totalArea,
      activeFields,
      projectedYield: Math.round(projectedYield),
      estimatedRevenue: Math.round(estimatedRevenue),
      avgSoilHealth: Math.round(avgSoilHealth * 10) / 10
    }
  }, [farmData])

  // Calculer les jours restants avant expiration de l'assurance
  const insuranceDaysLeft = useMemo(() => {
    if (!farmData.insurance) return null
    const expiryDate = new Date(farmData.insurance.expiryDate)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [farmData.insurance])

  // Générer les alertes basées sur les données réelles
  const alerts = useMemo(() => {
    const alertList = []
    
    // Vérifier les niveaux de nutriments
    farmData.fields.forEach(field => {
      if (field.nitrogenLevel < 50) {
        alertList.push({
          severity: 'high',
          message: t(`Niveau d'azote faible dans ${field.name}`, `Low nitrogen level in ${field.name}`),
          field: field.name,
          type: 'nitrogen'
        })
      }
      if (field.moistureLevel < 35) {
        alertList.push({
          severity: 'medium',
          message: t(`Niveau d'humidité bas dans ${field.name} - Irrigation recommandée`, `Low moisture in ${field.name} - Irrigation recommended`),
          field: field.name,
          type: 'moisture'
        })
      }
      if (field.phLevel < 6.0) {
        alertList.push({
          severity: 'low',
          message: t(`pH du sol acide dans ${field.name} - Chaulage recommandé`, `Acidic soil pH in ${field.name} - Liming recommended`),
          field: field.name,
          type: 'ph'
        })
      }
    })

    // Vérifier l'assurance
    if (insuranceDaysLeft !== null && insuranceDaysLeft < 60) {
      alertList.push({
        severity: insuranceDaysLeft < 30 ? 'high' : 'medium',
        message: t(`Assurance expire dans ${insuranceDaysLeft} jours - Renouvellement nécessaire`, `Insurance expires in ${insuranceDaysLeft} days - Renewal needed`),
        field: t('Tous les champs', 'All fields'),
        type: 'insurance'
      })
    }

    return alertList.slice(0, 3) // Limiter à 3 alertes
  }, [farmData.fields, insuranceDaysLeft, t])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="p-4 mb-4">
          <BackButton to="/feed" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`font-bold text-gray-800 ${sidebarOpen ? 'text-lg' : 'hidden'}`}>MBOA Dashboard</h2>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#3F441C] text-white rounded-lg">
              <Leaf className="w-5 h-5" />
              {sidebarOpen && <span>{t("Vue d'ensemble", "Farm Overview")}</span>}
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">MBOA Smart Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Moon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-[#3F441C] rounded-full flex items-center justify-center text-white font-bold">
              AD
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Farm Overview Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("Tableau de bord de la ferme", "Farm Overview Dashboard")}</h2>
            <p className="text-gray-600">{t("Aperçus basés sur l'IA, surveillance en temps réel et analyses pour vos opérations", "AI-powered insights, real-time monitoring, and predictive analytics for your operations")}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{t('Surface Totale', 'Total Area')}</span>
                <Leaf className="w-5 h-5 text-[#3F441C]" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalArea} ha</div>
              <div className="text-sm text-[#3F441C]">{stats.activeFields} {t('champs actifs', 'active fields')}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{t('Rendement Projeté', 'Projected Yield')}</span>
                <TrendingUp className="w-5 h-5 text-[#3F441C]" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stats.projectedYield} {t('tonnes', 'tons')}</div>
              <div className="text-sm text-[#3F441C]">{t('Basé sur santé du sol', 'Based on soil health')}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{t('Revenu Estimé', 'Estimated Revenue')}</span>
                <DollarSign className="w-5 h-5 text-[#3F441C]" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{(stats.estimatedRevenue / 1000000).toFixed(1)}M FCFA</div>
              <div className="text-sm text-[#3F441C]">{t('Cette saison', 'This season')}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{t('Santé Sol Moyenne', 'Avg Soil Health')}</span>
                <Sprout className="w-5 h-5 text-[#3F441C]" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stats.avgSoilHealth}%</div>
              <div className="text-sm text-[#3F441C]">
                {stats.avgSoilHealth >= 75 ? t('Excellente', 'Excellent') : stats.avgSoilHealth >= 60 ? t('Bonne', 'Good') : t('À améliorer', 'Needs improvement')}
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-bold text-gray-800">{t('Alertes Actives', 'Active Alerts')} ({alerts.length})</h3>
              </div>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-start justify-between bg-white p-4 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <span className="font-semibold text-gray-800">{alert.message}</span>
                      </div>
                      <p className="text-sm text-gray-600">{t('Champ:', 'Field:')} {alert.field}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.severity === 'high' ? t('élevé', 'high') : alert.severity === 'medium' ? t('moyen', 'medium') : t('faible', 'low')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Yield Predictions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#3F441C]" />
                  {t('Prédictions IA de Rendement', 'AI Yield Predictions')}
                </h3>
                <span className="px-3 py-1 bg-[#EEEEE5] text-[#353916] text-xs font-semibold rounded-full">91.4% {t('Précision', 'Accuracy')}</span>
              </div>
              <div className="space-y-4">
                {farmData.fields.map((field) => {
                  const yieldEstimates: { [key: string]: number } = {
                    'Maïs': 2.8,
                    'Cacao': 0.6,
                    'Plantain': 12,
                    'Manioc': 10,
                    'Café': 0.9,
                    'Arachide': 1.5,
                    'Haricot': 1.2
                  }
                  const hectares = field.area // déjà en hectares
                  const yieldPerHectare = yieldEstimates[field.crop] || 2
                  const predicted = (hectares * yieldPerHectare).toFixed(1)
                  const confidence = Math.min(95, field.soilHealth + Math.random() * 10)
                  
                  return (
                    <div key={field.id}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">{field.crop} - {field.name}</span>
                        <span className="text-sm font-semibold text-[#3F441C]">{confidence.toFixed(0)}{t('% confiance', '% confidence')}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{t('Prédit:', 'Predicted:')} {predicted} {t('tonnes', 'tons')} ({hectares} ha)</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#3F441C] h-2 rounded-full" style={{width: `${confidence}%`}}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button className="w-full mt-4 py-2 bg-[#3F441C] text-white font-semibold rounded-lg hover:bg-[#353916]">
                {t('Voir Prédictions Détaillées →', 'View Detailed Predictions →')}
              </button>
            </div>

            {/* 7-Day Weather Impact */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">{t('Impact Météo 7 Jours', '7-Day Weather Impact')}</h3>
              </div>
              <div className="h-48 bg-gradient-to-b from-orange-100 via-yellow-100 to-[#EEEEE5] rounded-lg mb-4 relative">
                <div className="absolute inset-0 flex items-end justify-around p-4">
                  {[
                    t('Lun', 'Mon'), t('Mar', 'Tue'), t('Mer', 'Wed'),
                    t('Jeu', 'Thu'), t('Ven', 'Fri'), t('Sam', 'Sat'), t('Dim', 'Sun')
                  ].map((day, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs text-gray-600">{day}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <ThermometerSun className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">{t('Temp. Moy.', 'Avg Temp.')}</div>
                  <div className="text-lg font-bold text-gray-800">26°C</div>
                </div>
                <div className="text-center">
                  <Droplet className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">{t('Pluie Totale', 'Total Rain')}</div>
                  <div className="text-lg font-bold text-gray-800">85 mm</div>
                </div>
                <div className="text-center">
                  <Droplets className="w-6 h-6 text-cyan-600 mx-auto mb-1" />
                  <div className="text-xs text-gray-600">{t('Humidité', 'Humidity')}</div>
                  <div className="text-lg font-bold text-gray-800">78%</div>
                </div>
              </div>
            </div>

            {/* Soil Health Monitor */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-5 h-5 text-[#3F441C]" />
                <h3 className="font-bold text-gray-800">{t('Moniteur Santé du Sol', 'Soil Health Monitor')}</h3>
              </div>
              <div className="flex justify-center mb-6">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3F441C" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="62.8"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">pH 6.8</div>
                      <div className="text-xs text-gray-600">{t('Balance', 'Balance')}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">North Field A</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div className="bg-[#3F441C] h-2 rounded-full" style={{width: '77%'}}></div>
                  </div>
                  <div className="text-xs text-gray-600">77%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">South Field B</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div className="bg-[#3F441C] h-2 rounded-full" style={{width: '81%'}}></div>
                  </div>
                  <div className="text-xs text-gray-600">81%</div>
                </div>
              </div>
            </div>

            {/* Harvest Schedule */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#3F441C]" />
                <h3 className="font-bold text-gray-800">{t('Calendrier de Récolte', 'Harvest Schedule')}</h3>
              </div>
              <div className="space-y-4">
                {farmData.fields.map((field) => {
                  const today = new Date()
                  const harvestDate = new Date(field.expectedHarvestDate)
                  const plantDate = new Date(field.plantingDate)
                  const totalDays = Math.ceil((harvestDate.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24))
                  const daysPassed = Math.ceil((today.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24))
                  const daysToHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                  const readiness = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100))
                  
                  const status = readiness >= 90 ? 'ready' : readiness >= 60 ? 'on-track' : 'early'
                  const statusLabel = status === 'ready' ? t('prêt', 'ready') : status === 'on-track' ? t('en cours', 'on-track') : t('début', 'early')
                  const statusColor = status === 'ready' ? 'bg-[#EEEEE5] text-[#353916]' : 
                                     status === 'on-track' ? 'bg-blue-100 text-blue-700' : 
                                     'bg-yellow-100 text-yellow-700'
                  
                  return (
                    <div key={field.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-800">{field.crop}</div>
                          <div className="text-sm text-gray-600">{field.name} • {field.area} ha</div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{t('Maturité:', 'Maturity:')} {readiness.toFixed(0)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div className="bg-[#3F441C] h-2 rounded-full" style={{width: `${readiness}%`}}></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {daysToHarvest > 0 ? `${daysToHarvest} ${t('jours avant récolte', 'days to harvest')}` : t('Récolte en retard', 'Harvest overdue')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Revenue & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-[#3F441C]" />
                <h3 className="font-bold text-gray-800">{t('Revenus & Rentabilité (FCFA)', 'Revenue & Profitability (XAF)')}</h3>
              </div>
              <div className="h-64 flex items-end justify-around gap-2">
                {[
                  {month: t('Jan', 'Jan'), revenue: 12500000, expenses: 7800000, profit: 4700000},
                  {month: t('Fév', 'Feb'), revenue: 15200000, expenses: 9100000, profit: 6100000},
                  {month: t('Mar', 'Mar'), revenue: 18900000, expenses: 10500000, profit: 8400000},
                  {month: t('Avr', 'Apr'), revenue: 24300000, expenses: 12800000, profit: 11500000},
                  {month: t('Mai', 'May'), revenue: 35800000, expenses: 16500000, profit: 19300000},
                  {month: t('Jun', 'Jun'), revenue: 42500000, expenses: 19200000, profit: 23300000}
                ].map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-1">
                      <div className="bg-blue-500 rounded-t" style={{height: `${data.revenue / 250000}px`}}></div>
                      <div className="bg-orange-500" style={{height: `${data.expenses / 250000}px`}}></div>
                      <div className="bg-[#F5F5F0]0" style={{height: `${data.profit / 250000}px`}}></div>
                    </div>
                    <div className="text-xs text-gray-600">{data.month}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">{t('Revenus', 'Revenue')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">{t('Dépenses', 'Expenses')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#F5F5F0]0 rounded"></div>
                  <span className="text-gray-600">{t('Bénéfices', 'Profit')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">{t('Actions Rapides', 'Quick Actions')}</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{t('Planifier Nouvelle Saison', 'Plan New Season')}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Bug className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{t('Détecter Maladies', 'Detect Diseases')}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Droplets className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{t('Contrôle Irrigation', 'Irrigation Control')}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Tractor className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{t('État du Matériel', 'Equipment Status')}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{t('Voir Analytiques', 'View Analytics')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
