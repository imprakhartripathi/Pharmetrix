import axios from 'axios'
import { clearSession } from './session'

let sessionInvalidCallback: ((reason: 'EXPIRED' | 'INVALID') => void) | null = null

export const registerSessionInvalidCallback = (callback: (reason: 'EXPIRED' | 'INVALID') => void) => {
  sessionInvalidCallback = callback
}

let interceptorId: number | null = null

export const setupAuthInterceptor = () => {
  if (interceptorId !== null) {
    axios.interceptors.response.eject(interceptorId)
  }

  interceptorId = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status

      if (status === 401) {
        clearSession()
        if (sessionInvalidCallback) {
          sessionInvalidCallback('INVALID')
        }
      }

      if (status === 403) {
        clearSession()
        if (sessionInvalidCallback) {
          sessionInvalidCallback('INVALID')
        }
      }

      return Promise.reject(error)
    }
  )
}

export const removeAuthInterceptor = () => {
  if (interceptorId !== null) {
    axios.interceptors.response.eject(interceptorId)
    interceptorId = null
  }
}
