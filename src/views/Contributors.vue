<template>
  <section class="w-full overflow-y-auto p-8">
    <header class="p-0 text-start">
      <h2>{{ t('nav.contributors') }}</h2>
      <p class="mt-1 text-sm text-[var(--text-color-light)]">{{ t('contr-card.subtitle') }}</p>
    </header>
    <LoadingState v-if="isFetching" />
    <EmptyState
      v-else-if="fetchError"
      :icon="['fas', 'triangle-exclamation']"
      :title="t('store.error-loading')"
      :primary-action="{
        label: t('store.retry'),
        icon: ['fas', 'rotate-right'],
        action: fetchContributors
      }"
    />
    <EmptyState
      v-else-if="contributors.length === 0"
      :icon="['fas', 'users']"
      :title="t('store.empty-contr')"
    />
    <div v-else class="contributors-grid">
      <contr-card v-for="contr in contributors" :key="contr.id" :contrDetails="contr" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ContrCard from '@/components/contributors/ContrCard.vue'
import { getContributors } from '@/api/contributors'
import type { ContributorResponseDto, ContributorCardDto } from '@/types/models/contributor'

const props = defineProps<{
  searchedRoute?: string
  searchedContributions?: Record<string, any>
}>()

const { t } = useI18n()

const contributors = ref<ContributorCardDto[]>([])
const isFetching = ref<boolean | null>(null)
const fetchError = ref(false)

// Flatten ContributorResponseDto (nested contrInfo) into ContributorCardDto for the card.
function toCardDto(c: ContributorResponseDto): ContributorCardDto {
  return {
    id: c.id,
    userId: c.userId,
    username: c.contrInfo.username,
    imgUrl: c.contrInfo.imgUrl || null,
    bio: c.contrInfo.bio,
    postsQty: c.contrInfo.postsQty,
    videogamesQty: c.contrInfo.videogamesQty,
    extensionsQty: c.contrInfo.extensionsQty,
    totalRating: c.contrInfo.totalRating,
    totalComments: c.contrInfo.totalComments,
    downloads: c.contrInfo.downloads,
    lastPost: c.contrInfo.lastPost,
    socials: c.contrInfo.socials ?? {}
  }
}

async function fetchContributors() {
  try {
    fetchError.value = false
    isFetching.value = true
    const results = await getContributors()
    contributors.value = results.data.map(toCardDto)
  } catch {
    contributors.value = []
    fetchError.value = true
  } finally {
    isFetching.value = false
  }
}

watch(
  () => props.searchedContributions,
  (newValue) => {
    if (props.searchedRoute === 'Contributors') {
      contributors.value = (newValue as ContributorResponseDto[]).map(toCardDto)
    }
  }
)

fetchContributors()
</script>
<style scoped>
.contributors-grid {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  grid-auto-rows: auto;
  gap: 1.5rem;
  padding-top: 1rem;
}
</style>
