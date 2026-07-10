<template>
  <div
    id="forgot-password-section"
    class="flex size-full flex-col items-center justify-center gap-2"
  >
    <p class="text-center">{{ t('auth.forgot-password.description') }}</p>
    <div class="prompt__container flex w-full flex-col">
      <label v-show="false" class="self-start" for="forgotten-password">Email</label>
      <InputText
        type="email"
        id="forgotten-password"
        name="forgotten-password"
        :placeholder="t('auth.forgot-password.email-placeholder')"
        v-model="resetEmail"
        required
      />
      <Button
        :label="t('auth.forgot-password.submit')"
        @click="handlePassReset"
        :disabled="isDisabled"
        class="mt-10 !w-full"
      />
    </div>
    <Button
      :label="t('actions.back')"
      variant="link"
      @click="toggleShowForgottenPassPopup()"
      class="self-start !pl-0"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const { t } = useI18n()
const toast = useToast()

const props = defineProps({
  showForgottenPassPopup: {
    type: Boolean,
    required: true
  },
  toggleShowForgottenPassPopup: {
    type: Function,
    required: true
  }
})

const resetEmail = ref('')
const isDisabled = computed(() => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.value.trim()))
const store = useAppStore()

const handlePassReset = async () => {
  try {
    await store.dispatch('reset', { email: resetEmail.value })
    toast.add({
      severity: 'success',
      summary: t('auth.forgot-password.success'),
      detail: t('auth.forgot-password.success-detail'),
      life: 7000
    })
    props.toggleShowForgottenPassPopup()
  } catch {
    toast.add({
      severity: 'error',
      summary: t('auth.forgot-password.error'),
      life: 5000
    })
  }
}
</script>
