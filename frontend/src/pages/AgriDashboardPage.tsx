import {
  Leaf, TrendingUp, DollarSign, Sprout, AlertTriangle,
  Cloud, Calendar, BarChart3, Menu, Bell, Moon, Bug, Droplets, Tractor
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useUserFarm } from '../contexts/UserFarmContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuthStore } from '../store/authStore'
import BackButton from '../components/BackButton'

export default function AgriDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { farmData } = useUserFarm()
  const { t } = useLanguage()
  const { user } = useAuthStore()
  const userName = user?.profile?.display_name?.trim()
  const userInitials = (userName || user?.phone || 'U')
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const stats = useMemo(() => {
    const fields = farmData.fields
    const measuredSoilHealth = fields.filter(field => Number.isFinite(field.soilHealth))

    return {
      totalArea: fields.length ? fields.reduce((sum, field) => sum + field.area, 0) : null,
      activeFields: fields.length || null,
      avgSoilHealth: measuredSoilHealth.length
        ? Math.round(measuredSoilHealth.reduce((sum, field) => sum + field.soilHealth, 0) / measuredSoilHealth.length)
        : null,
    }
  }, [farmData])

  const insuranceDaysLeft = useMemo(() => {
    if (!farmData.insurance) return null
    const expiryDate = new Date(farmData.insurance.expiryDate)
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [farmData.insurance])

  const alerts = useMemo(() => {
    const alertList = []

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

    if (insuranceDaysLeft !== null && insuranceDaysLeft < 60) {
      alertList.push({
        severity: insuranceDaysLeft < 30 ? 'high' : 'medium',
        message: t(`Assurance expire dans ${insuranceDaysLeft} jours - Renouvellement nécessaire`, `Insurance expires in ${insuranceDaysLeft} days - Renewal needed`),
        field: t('Tous les champs', 'All fields'),
        type: 'insurance'
      })
    }

    return alertList.slice(0, 3)
  }, [farmData.fields, insuranceDaysLeft, t])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64 max-md:w-16' : 'w-16 md:w-20'} shrink-0 bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="p-2 md:p-4 mb-4">
          <BackButton to="/feed" />
        </div>
        <div className="p-2 md:p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`font-bold text-gray-800 ${sidebarOpen ? 'text-lg max-md:hidden' : 'hidden'}`}>MBOA Dashboard</h2>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#3F441C] text-white rounded-lg">
              <Leaf className="w-5 h-5" />
              {sidebarOpen && <span className="max-md:hidden">{t("Vue d'ensemble", "Farm Overview")}</span>}
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-4 flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">MBOA Smart Dashboard</h1>
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Moon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-[#3F441C] rounded-full flex items-center justify-center text-white font-bold" aria-label={userName || t('Profil utilisateur', 'User profile')}>
              {userInitials}
            </div>
          </div>
        </header>

        <div className="p-3 sm:p-6">
          {/* Farm Overview Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("Tableau de bord de la ferme", "Farm Overview Dashboard")}</h2>
            <p className="text-gray-600">{t("Vue d'ensemble des données agricoles que vous avez enregistrées", "Overview of the farm data you have recorded")}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{t('Surface Totale', 'Total Area')}</span>
                <Leaf className="w-5 h-5 text-[#3F441C]" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalArea === null ? '—' : `${stats.totalArea} ha`}</div>
              <div className="text-sm text-gray-500">{stats.activeFields === null ? t('Aucune donnée enregistrée', 'No data recorded') : `${stats.activeFields} ${t('champs actifs', 'active fields')}`}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{t('Rendement Projeté', 'Projected Yield')}</span>
                <TrendingUp className="w-5 h-5 text-[#3F441C]" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">—</div>
              <div className="text-sm text-gray-500">{t('Aucune prévision vérifiée disponible', 'No verified forecast available')}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{t('Revenu Estimé', 'Estimated Revenue')}</span>
                <DollarSign className="w-5 h-5 text-[#3F441C]" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">—</div>
              <div className="text-sm text-gray-500">{t('Aucune donnée financière enregistrée', 'No financial data recorded')}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{t('Santé Sol Moyenne', 'Avg Soil Health')}</span>
                <Sprout className="w-5 h-5 text-[#3F441C]" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stats.avgSoilHealth === null ? '—' : `${stats.avgSoilHealth}%`}</div>
              <div className="text-sm text-gray-500">
                {stats.avgSoilHealth === null ? t('Aucune mesure enregistrée', 'No measurements recorded') :
                  stats.avgSoilHealth >= 75 ? t('Excellente', 'Excellent') : stats.avgSoilHealth >= 60 ? t('Bonne', 'Good') : t('À améliorer', 'Needs improvement')}
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {alerts.length > 0 ? (
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
          ) : farmData.fields.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 text-sm text-gray-600">
              {t('Les alertes apparaîtront lorsque vous aurez enregistré des données agricoles.', 'Alerts will appear once you have recorded farm data.')}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 text-sm text-gray-600">
              {t('Aucune alerte détectée dans les données enregistrées.', 'No alerts found in the recorded data.')}
            </div>
          )}

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Yield Predictions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#3F441C]" />
                  {t('Prédictions IA de Rendement', 'AI Yield Predictions')}
                </h3>
              </div>
              <div className="min-h-40 flex items-center justify-center rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-600">
                {t('Aucune prévision disponible. Enregistrez des données de parcelle pour obtenir des estimations.', 'No forecast available. Record field data to receive estimates.')}
              </div>
            </div>

            {/* 7-Day Weather Impact */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">{t('Impact Météo 7 Jours', '7-Day Weather Impact')}</h3>
              </div>
              <div className="min-h-48 flex items-center justify-center rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-600">
                {t('Les prévisions météo ne sont pas disponibles pour le moment.', 'Weather forecasts are not available at this time.')}
              </div>
            </div>

            {/* Soil Health Monitor */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-5 h-5 text-[#3F441C]" />
                <h3 className="font-bold text-gray-800">{t('Moniteur Santé du Sol', 'Soil Health Monitor')}</h3>
              </div>
              {stats.avgSoilHealth === null ? (
                <div className="min-h-48 flex items-center justify-center rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-600">
                  {t('Aucune analyse de sol enregistrée.', 'No soil analysis recorded.')}
                </div>
              ) : (
                <div className="min-h-48 flex items-center justify-center rounded-lg bg-gray-50 p-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-gray-800">{stats.avgSoilHealth}%</div>
                    <div className="text-sm text-gray-600">{t('Santé moyenne des mesures enregistrées', 'Average of recorded measurements')}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Harvest Schedule */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#3F441C]" />
                <h3 className="font-bold text-gray-800">{t('Calendrier de Récolte', 'Harvest Schedule')}</h3>
              </div>
              {farmData.fields.length === 0 ? (
                <div className="min-h-40 flex items-center justify-center rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-600">
                  {t('Aucune parcelle avec une date de récolte enregistrée.', 'No fields with a recorded harvest date.')}
                </div>
              ) : (
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
                          <div className="bg-[#3F441C] h-2 rounded-full" style={{ width: `${readiness}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {daysToHarvest > 0 ? `${daysToHarvest} ${t('jours avant récolte', 'days to harvest')}` : t('Récolte en retard', 'Harvest overdue')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Revenue & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-[#3F441C]" />
                <h3 className="font-bold text-gray-800">{t('Revenus & Rentabilité (FCFA)', 'Revenue & Profitability (XAF)')}</h3>
              </div>
              <div className="min-h-64 flex items-center justify-center rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-600">
                {t('Aucune donnée de revenus ou de dépenses n’est enregistrée.', 'No revenue or expense data has been recorded.')}
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
