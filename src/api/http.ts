import axios from 'axios'
import store from '@/store'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  // Serialize arrays as repeated params: types=a&types=b (NestJS @Transform(toArray) expects this)
  paramsSerializer: (params) => {
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((v) => qs.append(key, String(v)))
      } else if (value !== undefined && value !== null) {
        qs.append(key, String(value))
      }
    }
    return qs.toString()
  }
})

// REQUEST INTERCEPTOR: Attaches platform JWT (not Firebase ID token) to every request.
// Strategy: 1. Try Vuex first (available after initLogin), 2. Fallback to localStorage
// (available from previous session, before initLogin completes on page reload).
http.interceptors.request.use((config) => {
  const jwt: string | null =
    (store.state as any).appUserCredentials?.jwt ?? localStorage.getItem('vitrina_jwt')

  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`
  }
  return config
})

// RESPONSE INTERCEPTOR: On 401 (expired/invalid token), execute logout and clear state.
// Does not redirect here. Navigation logic stays in component or navigation guard
// (separation of concerns).
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await store.dispatch('logout')
    }
    return Promise.reject(error)
  }
)

export default http
