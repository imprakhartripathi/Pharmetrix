import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { checkSession, clearSession, tokenExists } from '../services/session'

export type SessionStatus = 'authenticated' | 'expired' | 'invalid' | 'missing' | 'loading'

export interface SessionContextType {
  status: SessionStatus
  isSessionValid: boolean
  showSessionModal: boolean
  sessionReason: 'EXPIRED' | 'INVALID' | 'MISSING' | null
  validateSession: () => void
  handleSessionInvalid: (reason: 'EXPIRED' | 'INVALID') => void
  dismissSessionModal: () => void
  logout: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [showModal, setShowModal] = useState(false)
  const [sessionReason, setSessionReason] = useState<'EXPIRED' | 'INVALID' | 'MISSING' | null>(null)

  const validateSession = useCallback(() => {
    const result = checkSession()
    if (result.isValid) {
      setStatus('authenticated')
      setShowModal(false)
    } else if (tokenExists()) {
      const reason = (result.reason as 'EXPIRED' | 'INVALID') || 'INVALID'
      setStatus(reason === 'EXPIRED' ? 'expired' : 'invalid')
      setSessionReason(reason)
      clearSession()
      setShowModal(true)
    } else {
      setStatus('missing')
      setShowModal(false)
    }
  }, [])

  const handleSessionInvalid = useCallback((reason: 'EXPIRED' | 'INVALID') => {
    setStatus(reason === 'EXPIRED' ? 'expired' : 'invalid')
    setSessionReason(reason)
    clearSession()
    setShowModal(true)
  }, [])

  const dismissSessionModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setStatus('missing')
    setShowModal(false)
    setSessionReason(null)
    window.location.href = '/auth'
  }, [])

  useEffect(() => {
    validateSession()
    const interval = setInterval(validateSession, 30000)
    return () => clearInterval(interval)
  }, [validateSession])

  const contextValue: SessionContextType = {
    status,
    isSessionValid: status === 'authenticated',
    showSessionModal: showModal,
    sessionReason,
    validateSession,
    handleSessionInvalid,
    dismissSessionModal,
    logout,
  }

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}
