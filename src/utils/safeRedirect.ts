// Guards `redirect_uri` against open-redirects: accepts only same-origin targets.
export const safeRedirect = (target?: string | null, fallback = '/'): string => {
  if (!target || target.startsWith('//')) {
    return fallback
  }

  try {
    const parsed = new URL(target, window.location.origin)
    if (parsed.origin !== window.location.origin) {
      return fallback
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
