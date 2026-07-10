<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :dismissableMask="true"
    :header="header"
    contentClass="flex items-center justify-center"
    :style="{ width: '420px' }"
    @update:visible="emit('update:visible', $event)"
    @hide="reset"
  >
    <div class="flex w-full flex-col items-center gap-4 py-2 text-[var(--text-color)]">
      <p class="text-center text-sm text-[var(--text-muted-color)]">
        <slot name="description">{{ description }}</slot>
      </p>

      <label class="text-sm font-medium">
        {{ t('common.confirm-with-code.label', { code }) }}
      </label>

      <InputOtp v-model="inputValue" :length="CODE_LENGTH" integerOnly />

      <Button
        :label="confirmLabel ?? t('actions.confirm')"
        :severity="isCorrect ? 'danger' : 'secondary'"
        :disabled="!isCorrect"
        :loading="loading"
        @click="onConfirm"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputOtp from 'primevue/inputotp'

const props = defineProps<{
  visible: boolean
  header: string
  description?: string
  confirmLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'update:visible', value: boolean): void
}>()

const CODE_LENGTH = 4

const { t } = useI18n()

const inputValue = ref('')
const code = ref('')

const isCorrect = computed(() => inputValue.value === code.value)

function reset(): void {
  inputValue.value = ''
  code.value = ''
}

function onConfirm(): void {
  if (!isCorrect.value) return
  emit('confirm')
}

// Generate a fresh code each time the dialog opens
watch(
  () => props.visible,
  (open) => {
    if (open) {
      code.value = String(Math.floor(1000 + Math.random() * 9000))
      inputValue.value = ''
    } else {
      reset()
    }
  }
)
</script>
