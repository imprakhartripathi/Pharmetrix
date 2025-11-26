// Centralized session management
// - Checks token presence and optional JWT expiration
// - Exposes isAuthenticated() and ensureAuthenticated(navigate)

export type SessionCheck = {
  isValid: boolean
  reason?: 'MISSING' | 'EXPIRED' | 'INVALID'
}

const TOKEN_KEY = 'token' // required by spec

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// Decode base64url safely
function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '==='.slice((base64.length + 3) % 4)
  try {
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    return ''
  }
}

function parseJwt(token: string): any | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const payloadJson = base64UrlDecode(parts[1])
    return JSON.parse(payloadJson)
  } catch {
    return null
  }
}

export function checkSession(): SessionCheck {
  const token = getToken()
  if (!token) return { isValid: false, reason: 'MISSING' }

  // Optional expiry check if JWT has exp claim
  const payload = parseJwt(token)
  if (payload && typeof payload.exp === 'number') {
    const nowSec = Math.floor(Date.now() / 1000)
    if (payload.exp <= nowSec) {
      return { isValid: false, reason: 'EXPIRED' }
    }
  }
  return { isValid: true }
}

export function isAuthenticated(): boolean {
  return checkSession().isValid
}

export function tokenExists(): boolean {
  return !!getToken()
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
}

// Ensures session before allowing protected route rendering.
// If invalid, clears session and redirects to /auth.
export function ensureAuthenticated(navigate: (path: string) => void) {
  const result = checkSession()
  if (!result.isValid) {
    clearSession()
    navigate('/auth')
  }
  return result.isValid
}

export function logout() {
  clearSession()
  window.location.href = '/auth'
}