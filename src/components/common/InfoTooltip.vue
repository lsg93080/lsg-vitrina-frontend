<template>
  <font-awesome-icon
    v-tooltip="text"
    :icon="['fas', 'info-circle']"
    class="cursor-help self-center text-xs opacity-40"
  />
</template>
<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>
