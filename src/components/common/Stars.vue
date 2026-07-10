<template>
  <div class="stars">
    <font-awesome-layers v-for="n in 5" :key="n" class="fa-1x">
      <font-awesome-icon :icon="starIcon(n)" class="star-icon" />
    </font-awesome-layers>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  rating?: number
}>()

/* istanbul ignore next */
function starIcon(n: number): [string, string] {
  const r = props.rating ?? 0
  if (r >= n || n - r <= 0.25) return ['fas', 'star']
  if (n - r <= 0.75) return ['fas', 'star-half-alt']
  return ['far', 'star']
}
</script>

<style scoped>
.star-icon {
  color: var(--primary-color);
}
</style>
