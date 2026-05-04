import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import SelectSectorPage from './pages/SelectSectorPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import ChatPage from './pages/ChatPage'
import AdvicePage from './pages/AdvicePage'
import SeedProviderDashboard from './pages/SeedProviderDashboard'
import ProducerDashboard from './pages/ProducerDashboard'
import ListingsPage from './pages/ListingsPage'
import ListingDetailPage from './pages/ListingDetailPage'
import ExpertsPage from './pages/ExpertsPage'
import TipsPage from './pages/TipsPage'
import CommunityAgriculturePage from './pages/CommunityAgriculturePage'
import CommunityElevagePage from './pages/CommunityElevagePage'
import ProfilePage from './pages/ProfilePage'
import MyActivityPage from './pages/MyActivityPage'
import AgriDashboardPage from './pages/AgriDashboardPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import AIAssistant from './components/AIAssistant'
import { DomainProvider } from './contexts/DomainContext'
import { UserFarmProvider } from './contexts/UserFarmContext'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  const { user } = useAuthStore()

  return (
    <LanguageProvider>
    <DomainProvider>
    <UserFarmProvider>
    <div className="min-h-screen relative">
      <AIAssistant />
      {/* Background Light Mode */}
      <div 
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/backgrounds/light_mode.png')`,
          zIndex: -2,
        }}
      />
      {/* Overlay léger pour lisibilité */}
      <div 
        className="fixed inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 0%, rgba(250, 245, 235, 0.35) 50%, rgba(245, 240, 230, 0.4) 100%)',
          zIndex: -1,
        }}
      />
      
      <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/advice" element={<AdvicePage />} />
      <Route path="/select-sector" element={<SelectSectorPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/listings" element={<ListingsPage />} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />
      <Route path="/experts" element={<ExpertsPage />} />
      <Route path="/tips" element={<TipsPage />} />
      
      {/* Community Pages */}
      <Route path="/community/agriculture" element={<CommunityAgriculturePage />} />
      <Route path="/community/elevage" element={<CommunityElevagePage />} />
      
      {/* Legal Pages */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      
      {/* Profile Page - replaces dashboard */}
      <Route 
        path="/profile" 
        element={user ? <ProfilePage /> : <Navigate to="/login" />} 
      />
      
      {/* My Activity Page - role-specific view */}
      <Route 
        path="/my-activity" 
        element={user ? <MyActivityPage /> : <Navigate to="/login" />} 
      />
      
      {/* Dashboard Page - Smart Agri Dashboard */}
      <Route 
        path="/dashboard" 
        element={user ? <AgriDashboardPage /> : <Navigate to="/login" />} 
      />
      
      <Route 
        path="/seed-provider" 
        element={user ? <SeedProviderDashboard /> : <Navigate to="/login" />} 
      />
      
      <Route 
        path="/producer" 
        element={user ? <ProducerDashboard /> : <Navigate to="/login" />} 
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </div>
    </UserFarmProvider>
    </DomainProvider>
    </LanguageProvider>
  )
}

export default App
