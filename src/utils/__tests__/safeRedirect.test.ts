import { describe, it, expect } from 'vitest'
import { safeRedirect } from '../safeRedirect'

// jsdom origin is http://localhost:3000 by default.
const ORIGIN = window.location.origin

describe('safeRedirect', () => {
  it('passes through a relative path unchanged', () => {
    expect(safeRedirect('/publications')).toBe('/publications')
  })

  it('preserves search and hash on a relative path', () => {
    expect(safeRedirect('/search?q=mario#top')).toBe('/search?q=mario#top')
  })

  it('relativizes a same-origin absolute URL', () => {
    expect(safeRedirect(`${ORIGIN}/profile?tab=reviews`)).toBe('/profile?tab=reviews')
  })

  it('falls back when target is empty', () => {
    expect(safeRedirect('')).toBe('/')
  })

  it('falls back when target is null', () => {
    expect(safeRedirect(null)).toBe('/')
  })

  it('falls back when target is undefined', () => {
    expect(safeRedirect(undefined)).toBe('/')
  })

  it('rejects protocol-relative //host targets', () => {
    expect(safeRedirect('//evil.com')).toBe('/')
  })

  it('rejects a cross-origin absolute URL', () => {
    expect(safeRedirect('https://evil.com/phish')).toBe('/')
  })

  it('falls back on an unparseable target', () => {
    expect(safeRedirect('http://')).toBe('/')
  })

  it('honors a custom fallback', () => {
    expect(safeRedirect('//evil.com', '/login')).toBe('/login')
  })
})
