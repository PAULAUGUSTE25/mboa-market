import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import App from './App.tsx'
import './index.css'
import { keepAlive } from './services/keepAlive'

// Start keep-alive: warms up the backend immediately and pings every 10 min
// to prevent Render free-tier from spinning down due to inactivity.
keepAlive.start();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
