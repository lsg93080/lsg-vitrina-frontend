import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

let routeQuery: Record<string, string> = {}
vi.mock('vue-router', () => ({ useRoute: () => ({ query: routeQuery }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))

const dispatch = vi.fn().mockResolvedValue(undefined)
vi.mock('@/composables/useAppStore', () => ({
  useAppStore: () => ({ dispatch })
}))

import Logout from '../Logout.vue'

let navigated = ''
beforeEach(() => {
  routeQuery = {}
  navigated = ''
  dispatch.mockClear()
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

// onMounted runs an async sequence; let its microtasks settle.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('Logout.vue', () => {
  it('dispatches the logout action on mount', async () => {
    mount(Logout)
    await flush()
    expect(dispatch).toHaveBeenCalledWith('logout')
  })

  it('navigates to a valid redirect_uri after logout', async () => {
    routeQuery = { redirect_uri: '/home' }
    mount(Logout)
    await flush()
    expect(navigated).toBe('/home')
  })

  it('falls back to / when redirect_uri is missing', async () => {
    mount(Logout)
    await flush()
    expect(navigated).toBe('/')
  })

  it('sanitizes a hostile redirect_uri to /', async () => {
    routeQuery = { redirect_uri: '//evil.com' }
    mount(Logout)
    await flush()
    expect(navigated).toBe('/')
  })
})
