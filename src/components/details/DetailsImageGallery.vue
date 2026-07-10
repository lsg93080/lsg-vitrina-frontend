<template>
  <section v-if="images.length" class="gallery-container lsg-card overflow-hidden">
    <div
      class="group relative aspect-video w-full cursor-pointer overflow-hidden"
      @click="openFullscreen"
    >
      <Transition name="gallery-fade" mode="out-in">
        <img
          :key="selectedIndex"
          :src="images[selectedIndex]"
          :alt="`${t('details.screenshot')} ${selectedIndex + 1}`"
          class="h-full w-full object-cover"
        />
      </Transition>

      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
      />

      <!-- Arrow nav (left) -->
      <button
        class="gallery-arrow absolute top-1/2 left-3 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        @click.stop="prev"
        :aria-label="t('details.previousImage')"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-lg" />
      </button>

      <!-- Arrow nav (right) -->
      <button
        class="gallery-arrow absolute top-1/2 right-3 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        @click.stop="next"
        :aria-label="t('details.nextImage')"
      >
        <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-lg" />
      </button>

      <!-- Image counter + pause toggle -->
      <div class="absolute right-3 bottom-3 flex items-center gap-1.5">
        <button
          v-if="images.length > 1"
          class="flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white/60 backdrop-blur-sm transition-colors duration-200 hover:text-white"
          @click.stop="toggleAutoAdvance"
        >
          <font-awesome-icon :icon="['fas', isPaused ? 'play' : 'pause']" class="text-[0.55rem]" />
        </button>
        <span class="rounded-md bg-black/60 px-2 py-1 text-xs text-white/80 backdrop-blur-sm">
          {{ selectedIndex + 1 }} / {{ images.length }}
        </span>
      </div>

      <!-- Auto-advance progress bar -->
      <div v-if="images.length > 1" class="absolute right-0 bottom-0 left-0 h-[2px] bg-white/5">
        <div
          class="h-full bg-[var(--primary-color)]"
          :class="isAdvancing ? 'gallery-progress-fill' : ''"
          :style="{ '--advance-duration': `${AUTO_ADVANCE_MS}ms` }"
        />
      </div>
    </div>

    <div class="relative px-3 py-3">
      <div ref="thumbStripRef" class="flex gap-2 overflow-x-auto scroll-smooth">
        <button
          v-for="(image, index) in images"
          :key="index"
          class="gallery-thumb shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-300"
          :class="
            selectedIndex === index
              ? 'border-[var(--primary-color)] shadow-[0_0_10px_rgba(250,94,21,0.4)]'
              : 'border-transparent opacity-60 hover:opacity-90'
          "
          @click="selectImage(index)"
          :aria-label="`${t('details.screenshot')} ${index + 1}`"
        >
          <img
            :src="image"
            :alt="`${t('details.thumbnail')} ${index + 1}`"
            class="h-[60px] w-[107px] object-cover md:h-[72px] md:w-[128px]"
          />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fullscreen-fade">
        <div
          v-if="isFullscreen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          @click.self="closeFullscreen"
          @keydown.escape="closeFullscreen"
          @keydown.left="prev"
          @keydown.right="next"
          tabindex="0"
          ref="fullscreenRef"
        >
          <button
            class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
            @click="closeFullscreen"
            :aria-label="t('details.close')"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="text-xl" />
          </button>

          <button class="gallery-arrow-fs absolute top-1/2 left-4 -translate-y-1/2" @click="prev">
            <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-2xl" />
          </button>

          <img
            :src="images[selectedIndex]"
            :alt="`${t('details.screenshot')} ${selectedIndex + 1}`"
            class="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />

          <button class="gallery-arrow-fs absolute top-1/2 right-4 -translate-y-1/2" @click="next">
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="text-2xl" />
          </button>

          <span
            class="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-3 py-1 text-sm text-white/80"
          >
            {{ selectedIndex + 1 }} / {{ images.length }}
          </span>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

// i18n keys used:
// details.screenshot, details.thumbnail, details.previousImage,
// details.nextImage, details.close

const { t } = useI18n()

const props = defineProps<{
  images: string[]
}>()

const selectedIndex = ref(0)
const isFullscreen = ref(false)
const isAdvancing = ref(false)
const isPaused = ref(false)
const thumbStripRef = ref<HTMLElement | null>(null)
const fullscreenRef = ref<HTMLElement | null>(null)

const AUTO_ADVANCE_MS = 10000
let autoAdvanceTimer: ReturnType<typeof setInterval> | null = null

function selectImage(index: number) {
  selectedIndex.value = index
  pauseAutoAdvance()
  scrollThumbIntoView(index)
}

function prev() {
  selectedIndex.value = selectedIndex.value > 0 ? selectedIndex.value - 1 : props.images.length - 1
  pauseAutoAdvance()
  scrollThumbIntoView(selectedIndex.value)
}

function next() {
  selectedIndex.value = selectedIndex.value < props.images.length - 1 ? selectedIndex.value + 1 : 0
  pauseAutoAdvance()
  scrollThumbIntoView(selectedIndex.value)
}

function scrollThumbIntoView(index: number) {
  if (!thumbStripRef.value) return
  const thumbEl = thumbStripRef.value.children[index] as HTMLElement | undefined
  if (!thumbEl) return
  // Scroll only the thumbnail strip horizontally, not the whole page
  const strip = thumbStripRef.value
  const scrollTarget = thumbEl.offsetLeft - strip.clientWidth / 2 + thumbEl.clientWidth / 2
  strip.scrollTo({ left: scrollTarget, behavior: 'smooth' })
}

function handleThumbScroll(e: WheelEvent) {
  if (!thumbStripRef.value) return
  thumbStripRef.value.scrollLeft += e.deltaY
}

function startAutoAdvance() {
  stopAutoAdvance()
  if (props.images.length <= 1) return
  restartProgressBar()
  autoAdvanceTimer = setInterval(() => {
    selectedIndex.value = (selectedIndex.value + 1) % props.images.length
    scrollThumbIntoView(selectedIndex.value)
    restartProgressBar()
  }, AUTO_ADVANCE_MS)
}

function stopAutoAdvance() {
  if (autoAdvanceTimer !== null) {
    clearInterval(autoAdvanceTimer)
    autoAdvanceTimer = null
  }
  isAdvancing.value = false
}

// Stops auto-advance and marks it as user-paused (only toggle button can restart)
function pauseAutoAdvance() {
  stopAutoAdvance()
  isPaused.value = true
}

function restartProgressBar() {
  isAdvancing.value = false
  requestAnimationFrame(() => {
    isAdvancing.value = true
  })
}

function toggleAutoAdvance() {
  if (isPaused.value) {
    isPaused.value = false
    startAutoAdvance()
  } else {
    isPaused.value = true
    stopAutoAdvance()
  }
}

function openFullscreen() {
  isFullscreen.value = true
  pauseAutoAdvance()
  nextTick(() => fullscreenRef.value?.focus())
}

function closeFullscreen() {
  isFullscreen.value = false
}

watch(
  () => props.images,
  () => {
    selectedIndex.value = 0
    // New image set: restart auto-advance fresh regardless of paused state
    isPaused.value = false
    startAutoAdvance()
  }
)

onMounted(() => {
  startAutoAdvance()
  // Attach wheel listener with { passive: false } to avoid Chrome violation warning
  thumbStripRef.value?.addEventListener('wheel', handleThumbScroll, { passive: false })
})

onBeforeUnmount(() => {
  stopAutoAdvance()
  thumbStripRef.value?.removeEventListener('wheel', handleThumbScroll)
})
</script>

<style scoped>
.gallery-container {
  overflow: hidden;
}

.gallery-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.gallery-arrow:hover {
  background: var(--primary-color-30);
  border-color: var(--primary-color);
  box-shadow: 0 0 12px var(--primary-color-40);
}

.gallery-arrow-fs {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.gallery-arrow-fs:hover {
  background: var(--primary-color-30);
  border-color: var(--primary-color);
  box-shadow: 0 0 14px var(--primary-color-40);
}

.gallery-thumb {
  border: 2px solid transparent;
}

.gallery-container ::-webkit-scrollbar {
  height: 4px;
}

.gallery-container ::-webkit-scrollbar-track {
  background: transparent;
}

.gallery-container ::-webkit-scrollbar-thumb {
  background: var(--primary-color-30);
  border-radius: 2px;
}

@keyframes gallery-progress {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.gallery-progress-fill {
  opacity: 0.4;
  animation: gallery-progress var(--advance-duration, 6000ms) linear forwards;
}

.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity 0.35s ease-in-out;
}

.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0;
}

.fullscreen-fade-enter-active,
.fullscreen-fade-leave-active {
  transition: opacity 0.25s ease-in-out;
}

.fullscreen-fade-enter-from,
.fullscreen-fade-leave-to {
  opacity: 0;
}
</style>
