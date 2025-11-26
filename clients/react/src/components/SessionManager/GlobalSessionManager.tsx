import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { setupAuthInterceptor, registerSessionInvalidCallback } from '../../services/authInterceptor'
import './SessionManager.scss'

export default function GlobalSessionManager() {
  const navigate = useNavigate()
  const { showSessionModal, sessionReason, dismissSessionModal, logout, handleSessionInvalid } =
    useSession()

  useEffect(() => {
    setupAuthInterceptor()
    registerSessionInvalidCallback((reason) => {
      handleSessionInvalid(reason)
    })
  }, [handleSessionInvalid])

  useEffect(() => {
    if (showSessionModal) {
      const timer = setTimeout(() => {
        logout()
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [showSessionModal, logout])

  if (!showSessionModal) return null

  const title = sessionReason === 'EXPIRED' ? 'Session Expired' : 'Session Invalid'
  const message =
    sessionReason === 'EXPIRED'
      ? 'Your session has expired. Please sign in again to continue.'
      : 'Your session is invalid. Please sign in again.'

  return (
    <div className="session-modal-overlay">
      <div className="session-modal-container">
        <div className="session-modal-content">
          <h2 className="session-modal-title">{title}</h2>
          <p className="session-modal-message">{message}</p>

          <div className="session-modal-actions">
            <button
              className="session-modal-btn session-modal-btn-primary"
              onClick={() => {
                dismissSessionModal()
                navigate('/auth')
              }}
            >
              Sign In Now
            </button>
            <button
              className="session-modal-btn session-modal-btn-secondary"
              onClick={dismissSessionModal}
            >
              Dismiss
            </button>
          </div>

          {/* <p className="session-modal-timer">Redirecting...</p> */}
        </div>
      </div>
    </div>
  )
}
