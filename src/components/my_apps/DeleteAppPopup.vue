<template>
  <Dialog
    v-model:visible="showDeleteAppPopup"
    modal
    :draggable="false"
    :header="t('contributions.action.delete-app')"
    :dismissableMask="true"
    contentClass="flex items-center justify-center h-full"
  >
    <div
      v-if="!showMessage"
      class="flex h-full w-[90vw] max-w-[400px] flex-col items-center justify-center gap-4 text-[var(--text-color)]"
    >
      <label for="app-id">{{ t(`contributions.action.delete`) + ': ' + inputCode }}</label>
      <InputOtp
        ref="inputOtpElement"
        id="app-id"
        name="app-id"
        v-model="inputValue"
        :length="inputCode.toString().length"
        integerOnly
      />
      <Button
        data-test="delete-app-button"
        :label="t('contributions.delete')"
        :severity="isIdCorrect ? 'danger' : 'primary'"
        @click="onDeleteApp()"
        :disabled="!isIdCorrect"
      />
    </div>
    <Message v-if="showMessage" :severity="message?.severity">{{ message?.text }}</Message>
  </Dialog>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InputOtp from 'primevue/inputotp'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useApp } from '@/composables/app'
import type { Repository } from '@/types/models/repository'

const { t } = useI18n()

const props = defineProps<{
  app: Repository
}>()

const app = ref(props.app)
const inputValue = ref('')
const repoId = ref<number>(app.value.repoId)
const inputCode = computed(() => {
  return parseInt(repoId.value.toString().split('', 5).join('')) //Max 5 digits
})
const isIdCorrect = computed(() => {
  return inputValue.value === inputCode.value.toString()
})

const showMessage = ref<boolean>(false)

const showDeleteAppPopup = defineModel('showDeleteAppPopup', {
  type: Boolean,
  required: true
})

const apps = defineModel('apps', {
  type: Array<Repository>,
  required: true
})
const { message, deleteAppEverywhere } = useApp(apps)

const onDeleteApp = async () => {
  await deleteAppEverywhere(app.value.id!, repoId.value)
  showMessage.value = true
}
</script>
<style scoped></style>
