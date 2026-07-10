import axios from 'axios'
import type { AuthServiceResponse } from '@/types/models/auth'

// Standalone instance: Does NOT use http.ts (different base URL, ADR-002)
const authHttp = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL,
  timeout: 10000
})

// Exchanges a Firebase ID token for a platform JWT (login).
// Auth Service expects the Firebase token in the Authorization header, not the body.
export const loginWithFirebase = async (firebaseIdToken: string): Promise<AuthServiceResponse> => {
  const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL

  if (!authServiceUrl) {
    throw new Error(
      '[authService] VITE_AUTH_SERVICE_URL is not defined. ' +
        'Ensure the environment variable is configured in .env before running the project.'
    )
  }

  const response = await authHttp.post<AuthServiceResponse>('/auth/login', null, {
    headers: { Authorization: `Bearer ${firebaseIdToken}` }
  })
  return response.data
}

// Registers a new user via a Firebase ID token (token in the Authorization header).
// Returns a platform JWT plus user data with isNewUser=true.
export const registerWithFirebase = async (
  firebaseIdToken: string
): Promise<AuthServiceResponse> => {
  const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL

  if (!authServiceUrl) {
    throw new Error(
      '[authService] VITE_AUTH_SERVICE_URL is not defined. ' +
        'Ensure the environment variable is configured in .env before running the project.'
    )
  }

  const response = await authHttp.post<AuthServiceResponse>('/auth/register', null, {
    headers: { Authorization: `Bearer ${firebaseIdToken}` }
  })
  return response.data
}
