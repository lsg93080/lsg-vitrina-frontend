import { ref, computed, watch, type Ref } from 'vue'

export const DEFAULT_AVATAR =
  'https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png'

// Resolves an avatar URL, falling back to DEFAULT_AVATAR when the source is empty
// or the image fails to load (wire onAvatarError to the img @error handler).
export function useAvatar(
  source: Ref<string | null | undefined> | (() => string | null | undefined)
) {
  const hasError = ref(false)

  const resolvedSource = typeof source === 'function' ? computed(source) : source

  // Reset error when the source URL changes (user may have entered a new valid URL)
  watch(resolvedSource, () => {
    hasError.value = false
  })

  const avatarSrc = computed(() =>
    !hasError.value && resolvedSource.value ? resolvedSource.value : DEFAULT_AVATAR
  )

  function onAvatarError() {
    hasError.value = true
  }

  return { avatarSrc, onAvatarError }
}
