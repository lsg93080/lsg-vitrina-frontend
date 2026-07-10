<template>
  <section class="section-card lsg-card">
    <header
      class="flex items-center justify-between px-6 pt-5 pb-3"
      :class="{ 'cursor-pointer': collapsible }"
      @click="collapsible ? toggleCollapsed() : undefined"
    >
      <div class="flex flex-col gap-1">
        <h3 class="section-title font-['Audiowide'] text-lg font-bold">
          {{ title }}
        </h3>
        <div class="section-underline h-[2px] w-12 rounded-full bg-[var(--primary-color)]" />
      </div>

      <div class="flex items-center gap-3">
        <slot name="header-actions" />
        <button
          v-if="collapsible"
          class="flex h-8 w-8 items-center justify-center rounded-md border-none bg-white/5 text-[var(--text-color-light)] transition-all duration-200 hover:bg-white/10 hover:text-[var(--primary-color)]"
          :aria-label="isCollapsed ? 'Expand section' : 'Collapse section'"
          @click.stop="toggleCollapsed"
        >
          <font-awesome-icon
            :icon="['fas', 'chevron-down']"
            class="text-sm transition-transform duration-300"
            :class="{ 'rotate-180': !isCollapsed }"
          />
        </button>
      </div>
    </header>

    <div
      ref="contentRef"
      class="section-content overflow-hidden transition-all duration-300 ease-in-out"
      :style="contentStyle"
    >
      <div ref="innerRef" :class="noPadding ? '' : 'px-6 pt-2 pb-5'">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

interface Props {
  title: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  noPadding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: false,
  defaultCollapsed: false,
  noPadding: false
})

const isCollapsed = ref(props.defaultCollapsed)
const innerRef = ref<HTMLElement | null>(null)
const innerHeight = ref(0)

function measureHeight() {
  if (innerRef.value) {
    innerHeight.value = innerRef.value.scrollHeight
  }
}

const contentStyle = computed(() => {
  if (!props.collapsible) return {}
  return {
    maxHeight: isCollapsed.value ? '0px' : `${innerHeight.value}px`,
    opacity: isCollapsed.value ? '0' : '1'
  }
})

function toggleCollapsed() {
  measureHeight()
  isCollapsed.value = !isCollapsed.value
}

watch(
  () => props.defaultCollapsed,
  (val) => {
    isCollapsed.value = val
  }
)

onMounted(() => {
  nextTick(() => measureHeight())
})
</script>

<style scoped>
.section-title {
  text-shadow: 0 0 8px var(--primary-color-25);
}

.section-underline {
  box-shadow: 0 0 6px var(--primary-color-40);
}
</style>
