<template>
  <section class="lsg-card">
    <header class="flex items-center gap-2 px-6 pt-5 pb-3">
      <font-awesome-icon :icon="icon" class="text-sm text-[var(--primary-color)]" />
      <h3 class="lsg-card__title">{{ title }}</h3>
    </header>
    <div class="lsg-card__underline mx-6 mb-2" />

    <div class="flex flex-col divide-y divide-white/10 px-6 pb-5">
      <div
        v-for="item in items"
        :key="item.typeLabel"
        class="group flex cursor-pointer gap-5 py-5 first:pt-3 last:pb-0"
        @click="item.publication && $emit('navigate', item.publication)"
      >
        <img
          v-if="item.publication?.thumbnailUrl"
          :src="item.publication.thumbnailUrl"
          :alt="item.publication.title"
          class="h-32 w-32 shrink-0 rounded-xl object-cover ring-1 ring-white/10 transition-all duration-300 group-hover:shadow-[var(--primary-color)]/10 group-hover:shadow-lg group-hover:ring-[var(--primary-color)]/50"
        />
        <div
          v-else
          class="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-white/5"
        >
          <font-awesome-icon
            :icon="['far', 'image']"
            class="text-3xl text-[var(--text-color-light)]"
          />
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <p
            class="truncate text-left text-lg font-bold text-[var(--text-color)] transition-colors group-hover:text-[var(--primary-color)]"
          >
            {{ item.publication?.title || t('status.unknown') }}
          </p>

          <div class="flex items-center gap-2">
            <font-awesome-icon
              :icon="item.typeIcon"
              class="text-sm text-[var(--secondary-color)]"
            />
            <span class="text-sm text-[var(--secondary-color)] capitalize">{{
              item.typeLabel
            }}</span>
          </div>

          <div v-if="item.publication" class="mt-1 flex flex-col gap-1.5">
            <!-- Downloads + Rating row -->
            <div class="flex flex-wrap items-center gap-4 text-xs text-[var(--text-color-light)]">
              <span class="flex items-center gap-1.5">
                <font-awesome-icon :icon="['fas', 'download']" class="text-[0.65rem]" />
                {{ (item.publication.downloads ?? 0).toLocaleString() }}
              </span>
              <span v-if="item.publication.totalReviews > 0" class="flex items-center gap-1.5">
                <font-awesome-icon
                  :icon="['fas', 'star']"
                  class="text-[0.65rem] text-[var(--primary-color)]"
                />
                {{ item.publication.averageRating.toFixed(1) }}
                <span class="text-[var(--text-color-light)]/60"
                  >({{ item.publication.totalReviews }})</span
                >
              </span>
              <span v-if="item.publication.releaseYear" class="flex items-center gap-1.5">
                <font-awesome-icon :icon="['fas', 'calendar-days']" class="text-[0.65rem]" />
                {{ item.publication.releaseYear }}
              </span>
            </div>

            <div
              v-if="item.publication.platforms?.length"
              class="flex items-center gap-2 text-xs text-[var(--text-color-light)]"
            >
              <font-awesome-icon
                v-for="platform in item.publication.platforms"
                :key="platform"
                :icon="platformIcon(platform)"
                class="text-sm"
              />
            </div>

            <div v-if="item.publication.tags?.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in item.publication.tags.slice(0, 3)"
                :key="tag"
                class="rounded bg-white/5 px-2 py-0.5 text-[0.65rem] text-[var(--text-color-light)] capitalize"
              >
                {{ tag }}
              </span>
              <span
                v-if="item.publication.tags.length > 3"
                class="rounded bg-white/5 px-2 py-0.5 text-[0.65rem] text-[var(--text-color-light)]"
              >
                +{{ item.publication.tags.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { PublicationResponseDto } from '@/types/models/publication'

export interface HighlightItem {
  publication: PublicationResponseDto | null
  typeIcon: [string, string]
  typeLabel: string
}

defineProps<{
  title: string
  icon: [string, string]
  items: HighlightItem[]
}>()

defineEmits<{
  navigate: [pub: PublicationResponseDto]
}>()

const { t } = useI18n()

const PLATFORM_ICONS: Record<string, string[]> = {
  windows: ['fab', 'windows'],
  linux: ['fab', 'linux'],
  macos: ['fab', 'apple'],
  android: ['fab', 'android']
}

function platformIcon(platform: string): string[] {
  return PLATFORM_ICONS[platform] ?? ['fas', 'desktop']
}
</script>
