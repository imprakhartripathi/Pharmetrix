import { useEffect, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const navigate = useNavigate()
  const { isSessionValid, validateSession } = useSession()

  useEffect(() => {
    validateSession()
  }, [validateSession])

  useEffect(() => {
    if (!isSessionValid) {
      navigate('/auth', { replace: true })
    }
  }, [isSessionValid, navigate])

  if (!isSessionValid) {
    return <div className="loading-container">Verifying session...</div>
  }

  return children
}
