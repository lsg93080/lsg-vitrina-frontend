import { describe, it, expect, beforeEach, vi } from 'vitest'

// useTheme holds a module-level singleton ref, so each test re-imports it after vi.resetModules() to avoid leaking state

// Stub localStorage so tests are fully isolated
const localStorageStore: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value
  },
  removeItem: (key: string) => {
    delete localStorageStore[key]
  },
  clear: () => {
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k])
  }
}
vi.stubGlobal('localStorage', localStorageMock)

async function freshUseTheme() {
  vi.resetModules()
  const mod = await import('../useTheme')
  return mod.useTheme
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorageMock.clear()
    delete document.documentElement.dataset.theme
  })

  it('defaults to dark when localStorage is empty', async () => {
    const useTheme = await freshUseTheme()
    const { theme, isDark } = useTheme()
    expect(theme.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('toggleTheme switches from dark to light and updates localStorage', async () => {
    const useTheme = await freshUseTheme()
    const { theme, toggleTheme } = useTheme()
    expect(theme.value).toBe('dark')
    toggleTheme()
    expect(theme.value).toBe('light')
    expect(localStorage.getItem('vitrina_theme')).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('toggleTheme switches back from light to dark', async () => {
    localStorage.setItem('vitrina_theme', 'light')
    const useTheme = await freshUseTheme()
    const { theme, toggleTheme } = useTheme()
    expect(theme.value).toBe('light')
    toggleTheme()
    expect(theme.value).toBe('dark')
    expect(localStorage.getItem('vitrina_theme')).toBe('dark')
  })

  it('setTheme("light") sets theme and updates data-theme attribute', async () => {
    const useTheme = await freshUseTheme()
    const { theme, setTheme, isDark } = useTheme()
    setTheme('light')
    expect(theme.value).toBe('light')
    expect(isDark.value).toBe(false)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('vitrina_theme')).toBe('light')
  })

  it('initializes from localStorage when value is "light"', async () => {
    localStorage.setItem('vitrina_theme', 'light')
    const useTheme = await freshUseTheme()
    const { theme, isDark } = useTheme()
    expect(theme.value).toBe('light')
    expect(isDark.value).toBe(false)
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('setTheme is idempotent when called with the current theme', async () => {
    const useTheme = await freshUseTheme()
    const { theme, setTheme } = useTheme()
    expect(theme.value).toBe('dark')
    setTheme('dark')
    expect(theme.value).toBe('dark')
    expect(localStorage.getItem('vitrina_theme')).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
