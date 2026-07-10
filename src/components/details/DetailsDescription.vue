<template>
  <div class="flex flex-col gap-6">
    <DetailsSectionCard v-if="description" :title="t('details.description')">
      <div class="text-left text-[0.95rem] leading-7 text-[var(--text-color)]">
        <div
          ref="descriptionRef"
          class="overflow-hidden transition-all duration-300 ease-in-out"
          :style="descriptionStyle"
        >
          {{ description }}
        </div>
        <button
          v-if="isDescriptionLong"
          class="mt-3 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-sm text-[var(--secondary-color)] transition-colors duration-200 hover:text-[var(--primary-color)]"
          @click="descriptionExpanded = !descriptionExpanded"
        >
          <font-awesome-icon
            :icon="['fas', descriptionExpanded ? 'chevron-up' : 'chevron-down']"
            class="text-xs"
          />
          {{ descriptionExpanded ? t('details.readLess') : t('details.readMore') }}
        </button>
      </div>
    </DetailsSectionCard>

    <DetailsSectionCard v-if="documentation" :title="t('details.documentation')">
      <MarkdownPreview
        :source="documentation"
        container-class="max-h-[900px] overflow-y-auto pr-2 text-left"
      />
    </DetailsSectionCard>

    <DetailsSectionCard v-if="hasSystemRequirements" :title="t('details.systemRequirements')">
      <div class="grid grid-cols-1 divide-y divide-white/5">
        <div
          v-for="req in systemRequirementRows"
          :key="req.label"
          class="grid grid-cols-[140px_1fr] gap-4 py-3 first:pt-0 last:pb-0"
        >
          <span class="text-sm text-[var(--text-color-light)]">{{ req.label }}</span>
          <span class="text-sm text-[var(--text-color)]">{{ req.value }}</span>
        </div>
      </div>
    </DetailsSectionCard>

    <DetailsSectionCard
      v-if="releaseNotes !== undefined"
      :title="t('details.releaseNotes')"
      collapsible
    >
      <MarkdownPreview
        v-if="releaseNotes"
        :source="releaseNotes"
        container-class="max-h-[400px] overflow-y-auto pr-2 text-left"
      />
      <p v-else class="text-sm text-[var(--text-color-light)] italic">
        {{ t('details.no-release-info') }}
      </p>
    </DetailsSectionCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailsSectionCard from './DetailsSectionCard.vue'
import MarkdownPreview from '@/components/common/MarkdownPreview.vue'

interface SystemRequirements {
  os?: string
  processor?: string
  memory?: string
  graphics?: string
  storage?: string
}

interface Props {
  description?: string
  documentation?: string
  releaseNotes?: string
  systemRequirements?: SystemRequirements
}

const props = defineProps<Props>()
const { t } = useI18n()

const DESCRIPTION_THRESHOLD = 300

const descriptionExpanded = ref(false)
const descriptionRef = ref<HTMLElement | null>(null)
const descriptionNaturalHeight = ref(0)

const isDescriptionLong = computed(() => (props.description?.length ?? 0) > DESCRIPTION_THRESHOLD)

const descriptionStyle = computed(() => {
  if (!isDescriptionLong.value) return {}
  return {
    maxHeight: descriptionExpanded.value ? `${descriptionNaturalHeight.value}px` : '4.5em'
  }
})

onMounted(() => {
  nextTick(() => {
    if (descriptionRef.value) {
      descriptionNaturalHeight.value = descriptionRef.value.scrollHeight
    }
  })
})

const hasSystemRequirements = computed(() => {
  if (!props.systemRequirements) return false
  return Object.values(props.systemRequirements).some((v) => !!v)
})

interface RequirementRow {
  label: string
  value: string
}

const systemRequirementRows = computed<RequirementRow[]>(() => {
  if (!props.systemRequirements) return []

  const mapping: { key: keyof SystemRequirements; labelKey: string }[] = [
    { key: 'os', labelKey: 'details.reqOs' },
    { key: 'processor', labelKey: 'details.reqProcessor' },
    { key: 'memory', labelKey: 'details.reqMemory' },
    { key: 'graphics', labelKey: 'details.reqGraphics' },
    { key: 'storage', labelKey: 'details.reqStorage' }
  ]

  return mapping
    .filter(({ key }) => !!props.systemRequirements![key])
    .map(({ key, labelKey }) => ({
      label: t(labelKey),
      value: props.systemRequirements![key]!
    }))
})
</script>
