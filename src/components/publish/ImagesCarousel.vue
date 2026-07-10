<template>
  <div class="flex min-h-[100px] flex-col items-center justify-center gap-5 rounded-md pt-5">
    <div
      class="flex w-full flex-col items-center justify-end gap-2 text-lg leading-none font-semibold text-[var(--text-color)]"
    >
      {{
        images.length != 0
          ? t('publish.images-total') + ' ' + images.length
          : t('publish.form-no-images')
      }}
    </div>
    <div v-if="images.length != 0" id="images" class="flex w-full items-center gap-2">
      <Button :disabled="currentIndex === 0" variant="text" size="large" @click="prevImage">
        <font-awesome-icon icon="chevron-left" />
      </Button>
      <div class="grid-row-span-1 grid w-full grid-flow-col grid-cols-4 place-items-center gap-2">
        <div class="relative" v-for="(image, index) in visibleImages" :key="index">
          <Image
            :src="image ? image : defaultIMG"
            alt="default image"
            class="aspect-video h-[100px] w-full overflow-clip rounded-md"
            preview
            image-class="h-full w-full object-cover"
          />
          <Button
            class="absolute top-0 left-0 z-10"
            size="small"
            @click="deleteImage(image)"
            variant="outlined"
            ><span>{{ t('actions.delete') }}</span
            ><font-awesome-icon icon="trash"
          /></Button>
        </div>
      </div>
      <Button
        :disabled="
          visibleImages.length === 0 ||
          visibleImages[visibleImages.length - 1] === images[images.length - 1]
        "
        variant="text"
        size="large"
        @click="nextImage"
      >
        <font-awesome-icon icon="chevron-right" />
      </Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import defaultIMG from '@/assets/defaultIMG.jpg'
import Button from 'primevue/button'
import Image from 'primevue/image'

const { t } = useI18n()
const images = defineModel({
  type: Array<string>,
  required: true
})
const currentIndex = ref(0)
const imagesPerPage = ref(4)

const visibleImages = computed(() => {
  return images.value.slice(currentIndex.value, currentIndex.value + imagesPerPage.value)
})

const nextImage = () => {
  if (currentIndex.value + imagesPerPage.value < images.value.length) {
    currentIndex.value += imagesPerPage.value
  }
}

const prevImage = () => {
  if (currentIndex.value - imagesPerPage.value >= 0) {
    currentIndex.value -= imagesPerPage.value
  }
}

const deleteImage = (image: string) => {
  images.value.splice(images.value.indexOf(image), 1)
  if (visibleImages.value.length === 0 && currentIndex.value > 0) {
    currentIndex.value -= imagesPerPage.value
  }
}
</script>
<style scoped>
button:disabled {
  color: var(--disabled-color-dark);
}
</style>
