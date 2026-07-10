<template>
  <div class="flex flex-col items-center gap-3 py-8 text-[var(--text-color)]">
    <font-awesome-icon v-if="icon" :icon="icon" class="text-3xl opacity-30" />
    <p class="text-sm">{{ title }}</p>
    <p v-if="description" class="max-w-[40ch] text-center text-xs opacity-50">{{ description }}</p>
    <div v-if="primaryAction || secondaryAction" class="flex items-center gap-2">
      <Button
        v-if="primaryAction"
        :label="primaryAction.label"
        size="small"
        outlined
        @click="primaryAction.action"
      >
        <template v-if="primaryAction.icon" #icon>
          <font-awesome-icon :icon="primaryAction.icon" class="mr-2" />
        </template>
      </Button>
      <Button
        v-if="secondaryAction"
        :label="secondaryAction.label"
        size="small"
        text
        @click="secondaryAction.action"
      >
        <template v-if="secondaryAction.icon" #icon>
          <font-awesome-icon :icon="secondaryAction.icon" class="mr-2" />
        </template>
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import Button from 'primevue/button'

interface ActionButton {
  label: string
  action: () => void
  icon?: string[]
}

defineProps<{
  icon?: string[]
  title: string
  description?: string
  primaryAction?: ActionButton
  secondaryAction?: ActionButton
}>()
</script>
