import axios from 'axios'
import store from '@/store'
import type { OAuthAuthorizationUrl, OAuthConnection, OAuthProvider } from '@/types/models/oauth'

// Standalone instance for Auth Service OAuth endpoints (ADR-002: different base URL).
// Mirrors the JWT-attachment logic from http.ts: Vuex first, localStorage fallback.
const authHttp = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL,
  timeout: 15000
})

authHttp.interceptors.request.use((config) => {
  // JWT lives in store.state.jwt (not appUserCredentials.jwt which does not exist)
  const jwt: string | null = (store.state as any).jwt ?? localStorage.getItem('vitrina_jwt')

  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`
  }
  return config
})

// Returns the OAuth authorization URL for a provider; open it in a popup to start the consent flow.
export async function getAuthorizationUrl(
  provider: OAuthProvider,
  redirectUrl: string
): Promise<OAuthAuthorizationUrl> {
  const response = await authHttp.get<OAuthAuthorizationUrl>(`/oauth/${provider}/authorize`, {
    params: { redirect_url: redirectUrl }
  })
  return response.data
}

// Lists the user's OAuth connections (metadata only, never tokens).
export async function getConnections(): Promise<OAuthConnection[]> {
  const response = await authHttp.get<OAuthConnection[]>('/oauth/connections')
  return response.data
}

// Removes an OAuth connection by its internal ID.
export async function disconnectProvider(connectionId: string): Promise<void> {
  await authHttp.delete(`/oauth/connections/${connectionId}`)
}
