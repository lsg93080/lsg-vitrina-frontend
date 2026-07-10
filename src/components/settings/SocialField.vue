<template>
  <div class="flex items-center gap-2">
    <div class="flex w-[5rem] shrink-0 items-center gap-1.5">
      <font-awesome-icon :icon="social.icon" class="w-4 shrink-0 text-[var(--text-color-light)]" />
      <span class="text-xs text-[var(--text-color-light)]">{{ social.label }}</span>
    </div>
    <div class="flex-1">
      <InputText
        :model-value="modelValue ?? ''"
        :placeholder="social.placeholder"
        :maxlength="80"
        class="w-full text-sm"
        @update:model-value="$emit('update:modelValue', $event as string)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext'
import type { SocialPlatform } from '@/types/models/contributor'

interface SocialDef {
  key: SocialPlatform
  label: string
  icon: [string, string]
  placeholder: string
}

defineProps<{
  social: SocialDef
  modelValue?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
