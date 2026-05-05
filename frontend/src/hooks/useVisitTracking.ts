import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const SESSION_KEY = 'mboa_session_id'

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

function recordVisit(page: string, action = 'visit', userId?: string) {
  const payload = {
    session_id: getSessionId(),
    page,
    referrer: document.referrer || null,
    action,
    user_id: userId || null,
  }
  // navigator.sendBeacon est non-bloquant et fonctionne même si la page se ferme
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
  const url = `${API_URL}/analytics/visit`
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, blob)
  } else {
    fetch(url, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      .catch(() => {/* silent */})
  }
}

export function useVisitTracking(userId?: string) {
  const location = useLocation()
  const lastPage = useRef<string>('')

  useEffect(() => {
    const page = location.pathname
    if (page === lastPage.current) return
    lastPage.current = page
    recordVisit(page, 'visit', userId)
  }, [location.pathname, userId])
}

// Fonctions utilitaires pour auth.py replacé côté frontend
export function trackRegister(userId: string) {
  recordVisit(window.location.pathname, 'register', userId)
}

export function trackLogin(userId: string) {
  recordVisit(window.location.pathname, 'login', userId)
}
