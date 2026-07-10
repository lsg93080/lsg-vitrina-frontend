<template>
  <Dialog
    v-model:visible="showImagesPopup"
    modal
    :style="{ width: width }"
    :header="t('publish.images-popup.header')"
    dismissableMask
  >
    <div
      class="flex h-full w-full flex-col items-center justify-center gap-2 overflow-y-auto p-10 text-start"
    >
      <label for="img-url">{{ t('publish.images-popup.url-label') }}</label>
      <InputText
        class="w-full"
        v-model="imageUrl"
        type="url"
        name="img-url"
        id="img-url"
        @value-change="showImage = true"
        :placeholder="t('publish.images-popup.url-placeholder')"
      />
      <PrimeImage
        class="aspect-video h-[120px] rounded-md object-cover"
        @error="showImage = false"
        v-if="showImage"
        :src="imageUrl"
        alt=""
        preview
      />
      <p class="text-[var(--text-color)]" v-if="errorMessage != ''">
        {{ errorMessage }}
      </p>
      <Button
        @click="handleNewImage()"
        :label="t('publish.images-popup.upload-button')"
        :variant="showImage ? 'primary' : 'disabled'"
        :disabled="!showImage"
      />
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import PrimeImage from 'primevue/image'

const { t } = useI18n()

const imageUrl = ref('')
const errorMessage = ref('')
const showImage = ref(false)
const isImageURL = ref(false)
const imgIsRepeated = ref(false)
const showImagesPopup = defineModel<boolean>()

const props = defineProps<{
  width?: string
  height?: string
  images: string[]
}>()

const emit = defineEmits<{
  (e: 'add-image', url: string): void
}>()

watch(imageUrl, (newVal) => {
  onShowImage(newVal)
})

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

function verifyImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Use window.Image explicitly to avoid collision with PrimeVue Image component
    const img = new window.Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

async function onShowImage(url: string): Promise<void> {
  if (!isValidUrl(url)) {
    errorMessage.value = t('publish.images-popup.error-invalid-url')
    showImage.value = false
    return
  }
  isImageURL.value = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url)
  if (!isImageURL.value) {
    errorMessage.value = t('publish.images-popup.error-not-image')
    showImage.value = false
    return
  }
  const isValidImage = await verifyImageUrl(url)
  if (!isValidImage) {
    errorMessage.value = t('publish.images-popup.error-load-failed')
    showImage.value = false
    return
  }
  errorMessage.value = ''
  showImage.value = true
}

function handleNewImage(): void {
  imgIsRepeated.value = props.images.includes(imageUrl.value)
  if (imgIsRepeated.value) {
    errorMessage.value = t('publish.images-popup.error-already-added')
    return
  }
  if (showImage.value) {
    emit('add-image', imageUrl.value)
    showImagesPopup.value = false
  }
}
</script>
<style scoped></style>
