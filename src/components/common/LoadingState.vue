<template>
  <div class="flex items-center justify-center py-12">
    <font-awesome-icon
      :icon="['fas', 'sync']"
      class="fa-spin text-[var(--primary-color)]"
      :class="sizeClass"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md'
  }
)

const sizeClass = computed(
  () =>
    ({
      sm: 'fa-lg',
      md: 'fa-2x',
      lg: 'fa-3x'
    })[props.size]
)
</script>
