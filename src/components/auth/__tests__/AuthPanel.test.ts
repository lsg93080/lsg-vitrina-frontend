import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock the store composable so AuthPanel can read isNewUser/credentials without Vuex.
const storeState = {
  isNewUser: false,
  platformUserId: 'platform-uuid',
  appUserCredentials: { email: 'a@b.c', displayName: 'Tester', photoUrl: null }
}
vi.mock('@/composables/useAppStore', () => ({
  useAppStore: () => ({ state: storeState })
}))

// Spy on contributor creation; first-time login should call it.
const createContributor = vi.fn().mockResolvedValue({})
vi.mock('@/api/contributors', () => ({
  createContributor: (...args: unknown[]) => createContributor(...args)
}))

import AuthPanel from '../AuthPanel.vue'

// Stub the three forms; each exposes a button that invokes the passed onAuthComplete.
const formStub = {
  props: ['onAuthComplete', 'toggleShowLoginPopup', 'toggleShowForgottenPassPopup'],
  template: '<button class="complete" @click="onAuthComplete && onAuthComplete()">x</button>'
}

const mountPanel = (props = {}) =>
  mount(AuthPanel, {
    props,
    global: {
      stubs: {
        SignInForm: formStub,
        SignUpForm: { template: '<div class="signup" />' },
        ForgotPassword: { template: '<div class="forgot" />' }
      }
    }
  })

describe('AuthPanel.vue', () => {
  beforeEach(() => {
    storeState.isNewUser = false
    createContributor.mockClear()
  })

  it('defaults to sign-in mode', () => {
    const wrapper = mountPanel()
    expect(wrapper.find('.complete').exists()).toBe(true)
    expect(wrapper.find('.signup').exists()).toBe(false)
    expect(wrapper.find('.forgot').exists()).toBe(false)
  })

  it('initialMode "sign-up" selects the SignUpForm', () => {
    const wrapper = mountPanel({ initialMode: 'sign-up' })
    expect(wrapper.find('.signup').exists()).toBe(true)
    expect(wrapper.find('.complete').exists()).toBe(false)
  })

  it('initialMode "forgot" selects the ForgotPassword form', () => {
    const wrapper = mountPanel({ initialMode: 'forgot' })
    expect(wrapper.find('.forgot').exists()).toBe(true)
  })

  it('emits update:mode with the current mode on mount', () => {
    const wrapper = mountPanel({ initialMode: 'sign-up' })
    const events = wrapper.emitted('update:mode')
    expect(events?.[0]).toEqual(['sign-up'])
  })

  it('emits auth-complete with isNewUser false for an existing user', async () => {
    const wrapper = mountPanel()
    await wrapper.find('.complete').trigger('click')
    await flush()
    expect(wrapper.emitted('auth-complete')?.[0]).toEqual([{ isNewUser: false }])
    expect(createContributor).not.toHaveBeenCalled()
  })

  it('creates a contributor and emits isNewUser true for a first-time user', async () => {
    storeState.isNewUser = true
    const wrapper = mountPanel()
    await wrapper.find('.complete').trigger('click')
    await flush()
    expect(createContributor).toHaveBeenCalledOnce()
    expect(wrapper.emitted('auth-complete')?.[0]).toEqual([{ isNewUser: true }])
  })
})

// Lets pending microtasks (the async onAuthComplete) settle before assertions.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))
