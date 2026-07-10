import { computed } from 'vue'
import { useTheme } from './useTheme'

export function useChartTheme() {
  const { theme } = useTheme()

  const textColor = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _theme = theme.value // Access theme.value to ensure reactivity, even if it's not directly used in the computation
    return getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
  })

  const pieLibrary = computed(() => ({
    plugins: {
      legend: { labels: { color: textColor.value } }
    }
  }))

  return { theme, pieLibrary }
}
