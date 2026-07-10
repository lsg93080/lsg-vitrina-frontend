import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Route query is swapped per-test before mounting.
let routeQuery: Record<string, string> = {}
vi.mock('vue-router', () => ({ useRoute: () => ({ query: routeQuery }) }))

// jwt drives the on-mount redirect (not isLogged): the handoff to other
// microfrontends needs vitrina_jwt persisted, which only setJwt guarantees.
const storeState = { isLogged: false, jwt: null as string | null }
vi.mock('@/composables/useAppStore', () => ({
  useAppStore: () => ({ state: storeState })
}))

// Stub AuthPanel at the module level to cut its api->store import chain.
vi.mock('@/components/auth/AuthPanel.vue', () => ({
  default: { name: 'AuthPanel', template: '<div class="panel" />' }
}))

import Login from '../Login.vue'

// Capture full-page navigations without leaving jsdom.
let navigated = ''
beforeEach(() => {
  routeQuery = {}
  storeState.isLogged = false
  storeState.jwt = null
  navigated = ''
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      origin: 'http://localhost:3000',
      set href(v: string) {
        navigated = v
      }
    }
  })
})

const mountLogin = () => mount(Login)

describe('Login.vue', () => {
  it('renders the AuthPanel for an unauthenticated user', () => {
    const wrapper = mountLogin()
    expect(wrapper.find('.panel').exists()).toBe(true)
    expect(navigated).toBe('')
  })

  it('navigates to a valid redirect_uri once the jwt is present', () => {
    storeState.isLogged = true
    storeState.jwt = 'token'
    routeQuery = { redirect_uri: '/publications?tab=mine' }
    mountLogin()
    expect(navigated).toBe('/publications?tab=mine')
  })

  it('falls back to /vitrina/ when redirect_uri is missing', () => {
    storeState.isLogged = true
    storeState.jwt = 'token'
    mountLogin()
    expect(navigated).toBe('/vitrina/')
  })

  it('sanitizes a hostile redirect_uri to /vitrina/', () => {
    storeState.isLogged = true
    storeState.jwt = 'token'
    routeQuery = { redirect_uri: 'https://evil.com' }
    mountLogin()
    expect(navigated).toBe('/vitrina/')
  })

  it('does NOT redirect while isLogged is true but jwt is not yet persisted', () => {
    // Session-restore sets isLogged before the async JWT exchange writes vitrina_jwt.
    // Redirecting here would hand off without the JWT (the bug this gate fixes).
    storeState.isLogged = true
    storeState.jwt = null
    routeQuery = { redirect_uri: '/home' }
    mountLogin()
    expect(navigated).toBe('')
  })
})
