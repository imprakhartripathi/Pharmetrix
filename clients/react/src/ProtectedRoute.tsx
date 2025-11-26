import { useEffect, useState, type ReactElement } from 'react'
import { checkSession } from './services/session'

const API_URL = (() => {
  const envUrl = (import.meta.env.PRIMARY_BACKEND_URL as string | undefined) ?? 'http://localhost:4200'
  if (typeof window === 'undefined') return envUrl
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  return isLocal ? envUrl : 'https://pharmetrix.onrender.com'
})()

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        // Check local session validity
        const sessionCheck = checkSession()
        if (!sessionCheck.isValid) {
          // Invalid locally - SessionManager will handle the popup/redirect
          if (!cancelled) setAllowed(true) // Allow render so SessionManager can show popup
          return
        }

        const token = localStorage.getItem('token')
        if (!token) {
          if (!cancelled) setAllowed(true) // Allow render so SessionManager can handle it
          return
        }

        // Verify token with backend
        const resp = await fetch(`${API_URL}/check-token`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!resp.ok) {
          // Invalid on backend - SessionManager will handle the popup/redirect
          if (!cancelled) setAllowed(true) // Allow render
          return
        }

        if (!cancelled) setAllowed(true)
      } catch (err) {
        if (!cancelled) setAllowed(true) // Allow render so SessionManager can handle errors
      }
    }
    check()
    return () => { cancelled = true }
  }, [])

  if (allowed === null) return null // loading state
  return children
}