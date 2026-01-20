import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useTheme } from './contexts/ThemeContext'
import ThemeToggleButton from './components/ThemeToggleButton'
import SelectSectorPage from './pages/SelectSectorPage'
import LoginPage from './pages/LoginPage'
import LoginAgriculturePage from './pages/LoginAgriculturePage'
import LoginElevagePage from './pages/LoginElevagePage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
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

function App() {
  const { user } = useAuthStore()
  const { theme } = useTheme()

  return (
    <div className="min-h-screen relative">
      {/* Background pour Light Mode uniquement */}
      {theme === 'light' && (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/light%20mode%20.png')`,
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
        </>
      )}
      
      {/* Bouton Toggle élégant et discret */}
      <ThemeToggleButton />
      
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/advice" element={<AdvicePage />} />
      <Route path="/select-sector" element={<SelectSectorPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/agriculture" element={<LoginAgriculturePage />} />
      <Route path="/login/elevage" element={<LoginElevagePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/listings" element={<ListingsPage />} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />
      <Route path="/experts" element={<ExpertsPage />} />
      <Route path="/tips" element={<TipsPage />} />
      
      {/* Community Pages */}
      <Route path="/community/agriculture" element={<CommunityAgriculturePage />} />
      <Route path="/community/elevage" element={<CommunityElevagePage />} />
      
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
      
      {/* Redirect old dashboard to profile */}
      <Route path="/dashboard" element={<Navigate to="/profile" />} />
      
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
  )
}

export default App
