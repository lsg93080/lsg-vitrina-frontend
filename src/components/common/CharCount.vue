<template>
  <p class="mt-1 text-right text-xs" :class="colorClass">
    <span v-if="min && current > 0 && current < min">{{ t('char-count.min', { min }) }} · </span>
    {{ current }}/{{ max }}
  </p>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  current: number
  max: number
  min?: number
  // Fraction of max at which the counter turns warning color (default 0.9)
  warnAt?: number
}>()

const threshold = computed(() => Math.floor(props.max * (props.warnAt ?? 0.9)))

const colorClass = computed(() => {
  if (props.min && props.current > 0 && props.current < props.min) return 'text-orange-400'
  if (props.current >= props.max) return 'text-red-400'
  if (props.current >= threshold.value) return 'text-orange-400'
  return 'text-[var(--text-color-light)]'
})
</script>
