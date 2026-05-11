import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import App from './App.tsx'
import './index.css'

// Réveille le backend Render dès le chargement (évite le cold start de 30-50s)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
fetch(`${API_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(60000) })
  .catch(() => {});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
