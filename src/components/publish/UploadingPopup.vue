<template>
  <Dialog
    v-model:visible="isUploading"
    modal
    :draggable="false"
    dismissableMask
    :header="
      isUploading ? t('publish.uploading.header-uploading') : t('publish.uploading.header-complete')
    "
    contentClass="w-[90vw] max-w-[400px]"
  >
    <div v-if="errorFounded?.value">
      <Message severity="error" class="text-center">
        <p>{{ t('publish.uploading.error') }}</p>
        <div class="flex items-center justify-center gap-2">
          <font-awesome-icon class="fa-3x" :icon="['fas', 'times-circle']" />
          <p>{{ errorFounded.message }}</p>
        </div>
      </Message>
    </div>
    <div v-else class="uploading__container">
      <div v-if="!isUploaded" class="uploading__status">
        <p class="uploading__title">{{ t('publish.uploading.in-progress') }}</p>
        <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="4" />
      </div>
      <div v-else class="uploading__status">
        <p class="uploading__title">{{ t('publish.uploading.success') }}</p>
        <font-awesome-icon class="fa-3x" :icon="['fas', 'check-square']" />
        <p>{{ t('publish.uploading.redirecting') }}</p>
      </div>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

const { t } = useI18n()

const isUploading = defineModel<boolean>('isUploading')
const isUploaded = defineModel<boolean>('isUploaded')
const errorFounded = defineModel<{ value: boolean; message: string }>('errorFounded')
</script>
<style scoped></style>
