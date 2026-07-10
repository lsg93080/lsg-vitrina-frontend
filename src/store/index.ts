import {
  createUserWithEmailAndPassword,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from '@firebase/auth'
import { createStore, type Store } from 'vuex'
import type { InjectionKey } from 'vue'
import { loginWithFirebase, registerWithFirebase } from '@/api/authService'
import { getConnections } from '@/api/oauthService'
import type { UserRole } from '@/types/models/auth'
import type { OAuthConnection } from '@/types/models/oauth'

// Firebase error codes re-mapped to user-friendly messages.
// Component layer is responsible for displaying these via i18n. Store only throws.
const CRED_ERRORS: Record<string, string> = {
  'auth/invalid-email': 'auth/invalid-credentials',
  'auth/wrong-password': 'auth/invalid-credentials',
  'auth/user-not-found': 'auth/invalid-credentials',
  'auth/invalid-credential': 'auth/invalid-credentials',
  'auth/account-exists-with-different-credential': 'auth/account-exists-with-different-credential'
}

interface AppUserCredentials {
  providerId: string | null
  emailVerified: boolean | null
  displayName: string | null
  photoUrl: string | null
  uid: string | null
  email: string | null
  jwt?: string | null
}

interface FilterQuery {
  query: string
  types: string[]
  esrb: string[]
  platforms: string[]
  selectedTag: string
  yearFrom: number | null
  yearTo: number | null
}

interface CurrentRoute {
  section: string
  subsection: string
}

export interface State {
  appUserCredentials: AppUserCredentials
  lang: string
  currentRoute: CurrentRoute
  jwt: string | null
  platformUserId: string | null
  roles: UserRole[]
  isLogged: boolean
  isNewUser: boolean
  formStep: number | null
  filterToggle: boolean
  filterQuery: FilterQuery
  tags: Array<{ name: string; value: string }>
  selectedTag: string
  oauthConnections: OAuthConnection[]
}

export const key: InjectionKey<Store<State>> = Symbol()

// Persist display identity so other same-origin LSG microfrontends can render the user.
const persistDisplay = (displayName: string | null, avatar: string | null): void => {
  if (displayName) {
    localStorage.setItem('vitrina_displayName', displayName)
  } else {
    localStorage.removeItem('vitrina_displayName')
  }
  if (avatar) {
    localStorage.setItem('vitrina_avatar', avatar)
  } else {
    localStorage.removeItem('vitrina_avatar')
  }
}

export default createStore<State>({
  state: {
    appUserCredentials: {
      providerId: null,
      emailVerified: null,
      displayName: null,
      photoUrl: null,
      uid: null,
      email: null
    },
    lang: localStorage.getItem('lang') || (navigator.language.startsWith('es') ? 'es' : 'en'),
    currentRoute: {
      section: 'Store',
      subsection: ''
    },
    jwt: localStorage.getItem('vitrina_jwt') || null,
    platformUserId: localStorage.getItem('vitrina_userId') || null,
    roles: (() => {
      try {
        return JSON.parse(localStorage.getItem('vitrina_roles') || '[]') as UserRole[]
      } catch {
        return []
      }
    })(),
    isLogged: !!localStorage.getItem('vitrina_jwt'),
    isNewUser: false,
    formStep: null,
    filterToggle: false,
    filterQuery: {
      query: '',
      types: [],
      esrb: [],
      platforms: [],
      selectedTag: '',
      yearFrom: null,
      yearTo: null
    },
    tags: [{ name: 'Todos', value: '' }],
    selectedTag: '',
    oauthConnections: []
  },
  mutations: {
    mutateFormStep(state, payload: number | null) {
      if (!payload) {
        state.formStep = 1
        return
      }
      state.formStep = (state.formStep ?? 0) + payload
    },
    mutateQuery(state, payload: FilterQuery) {
      state.filterQuery = payload
    },
    mutateTag(state, payload: string) {
      state.selectedTag = payload
    },
    mutateTags(state, payload: Array<{ name: string; value: string }>) {
      state.tags = payload
    },
    mutateLang(state, payload: string) {
      state.lang = payload
    },
    toggleFilter(state, payload?: { isVisible: boolean }) {
      if (payload) {
        state.filterToggle = payload.isVisible
        return
      }
      state.filterToggle = !state.filterToggle
    },
    setIsLogged(state, payload: boolean) {
      state.isLogged = payload
    },
    setIsNewUser(state, payload: boolean) {
      state.isNewUser = payload
    },
    setJwt(state, jwt: string | null) {
      state.jwt = jwt
      state.isLogged = !!jwt
      state.appUserCredentials.jwt = jwt
      if (jwt) {
        localStorage.setItem('vitrina_jwt', jwt)
      } else {
        localStorage.removeItem('vitrina_jwt')
      }
    },
    setPlatformUserId(state, userId: string | null) {
      state.platformUserId = userId
      if (userId) {
        localStorage.setItem('vitrina_userId', userId)
      } else {
        localStorage.removeItem('vitrina_userId')
      }
    },
    setRoles(state, roles: UserRole[]) {
      state.roles = roles
      localStorage.setItem('vitrina_roles', JSON.stringify(roles))
    },
    setOAuthConnections(state, connections: OAuthConnection[]) {
      state.oauthConnections = connections
    },
    setUserCredentials(
      state,
      payload: {
        user: { uid: string; emailVerified: boolean }
        _tokenResponse: {
          providerId: string
          screenName?: string
          displayName?: string
          email?: string
          photoUrl?: string
        }
      } | null
    ) {
      if (!payload) {
        const keys = Object.keys(state.appUserCredentials) as Array<keyof AppUserCredentials>
        keys.forEach((k) => {
          ;(state.appUserCredentials as unknown as Record<string, unknown>)[k] = null
        })
        persistDisplay(null, null)
        return
      }
      const { uid, emailVerified } = payload.user
      const { providerId, screenName, displayName, email, photoUrl } = payload._tokenResponse

      state.appUserCredentials = {
        providerId,
        emailVerified: emailVerified || false,
        displayName: displayName || screenName || null,
        photoUrl: photoUrl || 'https://img.icons8.com/color/48/000000/firebase.png',
        uid,
        email: email ?? null
      }
      persistDisplay(state.appUserCredentials.displayName, state.appUserCredentials.photoUrl)
    }
  },
  actions: {
    async logout({ commit }) {
      const auth = getAuth()
      await signOut(auth)
      commit('setIsLogged', false)
      commit('setUserCredentials', auth.currentUser)
      commit('setJwt', null)
      commit('setPlatformUserId', null)
      commit('setRoles', [])
      commit('setOAuthConnections', [])
      // Wipe auth/display keys; preserve `lang` and `vitrina_theme`.
      localStorage.removeItem('vitrina_displayName')
      localStorage.removeItem('vitrina_avatar')
    },
    async login(
      { commit },
      { provider, email, password }: { provider: string; email?: string; password?: string }
    ) {
      const auth = getAuth()
      let credentials = null
      switch (provider) {
        case 'google':
          try {
            credentials = await signInWithPopup(auth, new GoogleAuthProvider())
            if (!credentials.user.emailVerified) {
              try {
                await sendEmailVerification(auth.currentUser!)
              } catch (_) {
                /* non-blocking */
              }
            }
          } catch (error: unknown) {
            const e = error as { code?: string; message?: string }
            const mapped = e.code ? CRED_ERRORS[e.code] : undefined
            throw Object.assign(new Error(mapped ?? e.message), { code: mapped ?? e.code })
          }
          break
        case 'github':
          try {
            credentials = await signInWithPopup(auth, new GithubAuthProvider())
            if (!credentials.user.emailVerified) {
              try {
                await sendEmailVerification(auth.currentUser!)
              } catch (_) {
                /* non-blocking */
              }
            }
          } catch (error: unknown) {
            const e = error as { code?: string; message?: string }
            const mapped = e.code ? CRED_ERRORS[e.code] : undefined
            throw Object.assign(new Error(mapped ?? e.message), { code: mapped ?? e.code })
          }
          break
        default:
          try {
            credentials = await signInWithEmailAndPassword(auth, email!, password!)
            if (!credentials.user.emailVerified) {
              try {
                await sendEmailVerification(auth.currentUser!)
              } catch (_) {
                /* non-blocking */
              }
            }
          } catch (error: unknown) {
            const e = error as { code?: string; message?: string }
            const mapped = e.code ? CRED_ERRORS[e.code] : undefined
            throw Object.assign(new Error(mapped ?? e.message), { code: mapped ?? e.code })
          }
          break
      }

      // credentials is always set at this point (errors throw above)
      const cred = credentials!
      localStorage.removeItem('publicUserInfo')
      commit('setUserCredentials', cred)

      // Exchange Firebase token for platform JWT from Auth Service.
      // Falls back to register if user does not exist yet (first OAuth sign-in).
      try {
        const firebaseIdToken = await cred.user.getIdToken()
        let authResponse
        try {
          authResponse = await loginWithFirebase(firebaseIdToken)
        } catch (loginError: unknown) {
          const e = loginError as { response?: { status?: number }; status?: number }
          const status = e?.response?.status ?? e?.status
          if (status === 401 || status === 404) {
            authResponse = await registerWithFirebase(firebaseIdToken)
          } else {
            throw loginError
          }
        }
        commit('setJwt', authResponse.access_token)
        commit('setPlatformUserId', authResponse.user.id)
        commit('setRoles', authResponse.user.roles)
        commit('setIsNewUser', authResponse.isNewUser)
        commit('setIsLogged', true)
      } catch (error) {
        console.warn(
          '[store] Platform JWT exchange failed. Vitrina API calls may return 401.',
          error
        )
      }
    },
    async loadOAuthConnections({ commit }) {
      try {
        const connections = await getConnections()
        commit('setOAuthConnections', connections)
      } catch {
        // Non-fatal. Components handle missing connections gracefully
      }
    },
    async reset(_, { email }: { email: string }) {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, email)
    },
    async signup(
      { commit },
      { username, email, password }: { username: string; email: string; password: string }
    ) {
      const auth = getAuth()
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        try {
          await sendEmailVerification(auth.currentUser!)
        } catch (error) {
          console.warn('[store] Failed to send email verification:', error)
        }
        try {
          await updateProfile(auth.currentUser!, { displayName: username })
          commit('setUserCredentials', {
            user: {
              uid: userCred.user.uid,
              emailVerified: userCred.user.emailVerified
            },
            _tokenResponse: {
              displayName: username,
              photoUrl: null,
              email: userCred.user.email,
              providerId: 'password'
            }
          })
        } catch {
          // Non-fatal: display name update failed, credentials still set without it
        }
        // Exchange Firebase token for platform JWT
        // Falls back to login if user already exists on the platform (409 Conflict)
        try {
          const firebaseIdToken = await userCred.user.getIdToken()
          let authResponse
          try {
            authResponse = await registerWithFirebase(firebaseIdToken)
          } catch (registerError: unknown) {
            const e = registerError as { response?: { status?: number }; status?: number }
            const status = e?.response?.status ?? e?.status
            if (status === 409) {
              authResponse = await loginWithFirebase(firebaseIdToken)
            } else {
              throw registerError
            }
          }
          commit('setJwt', authResponse.access_token)
          commit('setPlatformUserId', authResponse.user.id)
          commit('setRoles', authResponse.user.roles)
          commit('setIsNewUser', authResponse.isNewUser)
          commit('setIsLogged', true)
        } catch (error) {
          console.warn(
            '[store] Platform JWT registration failed. Vitrina API calls may return 401.',
            error
          )
        }
      } catch (error) {
        // Re-throw so the calling component (SignUpForm) can show inline error feedback
        throw error
      }
    },
    async initLogin({ commit }) {
      const auth = await getAuth()
      if (!auth.currentUser) {
        return
      }
      let token: string | null = null
      try {
        token = await auth.currentUser.getIdToken()
      } catch {
        // Token retrieval failed, session restore will be skipped
      }
      onAuthStateChanged(auth, async (userCred) => {
        // Skip if no token available
        if (!token) {
          return
        }
        // Get sign in provider by decoding current user token (payload is in [1] position)
        const tokenPayload = token.split('.')[1] ?? ''
        const decoded = JSON.parse(atob(tokenPayload)) as {
          firebase: { sign_in_provider: string }
        }
        const currentProvider = decoded.firebase.sign_in_provider
        if (userCred) {
          const { uid, emailVerified } = userCred
          const providerData = userCred.providerData.find(
            (element) => element.providerId === currentProvider
          )
          const { displayName, photoURL: photoUrl, email } = providerData || {}
          const screenName = (userCred as unknown as { reloadUserInfo?: { screenName?: string } })
            ?.reloadUserInfo?.screenName
          commit('setIsLogged', true)
          commit('setUserCredentials', {
            user: {
              uid,
              emailVerified
            },
            _tokenResponse: {
              displayName: displayName || screenName,
              photoUrl,
              email,
              providerId: currentProvider
            }
          })

          // Renew platform JWT on session restore if not cached
          if (!localStorage.getItem('vitrina_jwt')) {
            try {
              const freshToken = await userCred.getIdToken()
              const authResponse = await loginWithFirebase(freshToken)
              commit('setJwt', authResponse.access_token)
              commit('setPlatformUserId', authResponse.user.id)
              commit('setRoles', authResponse.user.roles)
              commit('setIsNewUser', authResponse.isNewUser)
            } catch (error) {
              console.warn('[store] Platform JWT renewal failed on session restore.', error)
            }
          }
        }
      })
    }
  },
  modules: {}
})
