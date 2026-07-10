<template>
  <section class="w-full overflow-y-auto px-4 py-6 md:p-8">
    <header class="p-0 text-start">
      <h2>{{ t('store.title') }}</h2>
      <p class="mt-1 text-sm text-[var(--text-color-light)]">{{ t('store.subtitle') }}</p>
    </header>
    <div class="h-fit w-full py-4">
      <InputGroup>
        <InputGroupAddon>
          <font-awesome-icon :icon="['fas', 'search']" />
        </InputGroupAddon>
        <InputText
          v-focus
          v-model="searchText"
          :placeholder="t('store.search-placeholder')"
          fluid
        />
        <InputGroupAddon v-if="isFiltering">
          <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin" />
        </InputGroupAddon>
      </InputGroup>
    </div>
    <FiltersMenu ref="filtersMenuRef" @on-search="runSearch" />

    <template v-if="isFiltering && repositories.length === 0">
      <p class="set-center mt-8 text-[var(--text-color-light)]">{{ t('store.searching') }}</p>
    </template>
    <template v-else-if="!isFiltering && repositories.length === 0">
      <EmptyState
        class="mt-8"
        :icon="['fas', 'search']"
        :title="t('store.empty-apps')"
        :primary-action="{ label: t('store.filters.clear'), action: clearAllFilters }"
      />
    </template>
    <template v-else>
      <p class="pt-4 text-start text-[var(--text-color-light)]">{{ t('store.helper-text') }}</p>
      <DataView
        :value="repositories"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
      >
        <template #list="slotProps">
          <div class="grid grid-cols-1 gap-2 py-4">
            <PubCard
              v-for="(repo, index) in slotProps.items"
              :key="repo.repoId"
              :repository="repo"
              :index="index"
              @on-search="runSearch"
            />
          </div>
        </template>
      </DataView>
    </template>
  </section>
</template>
<script setup lang="ts">
import PubCard from '@/components/publications/PubCard.vue'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import EmptyState from '@/components/common/EmptyState.vue'
import FiltersMenu from '@/components/publications/FiltersMenu.vue'
import DataView from 'primevue/dataview'

import { useI18n } from 'vue-i18n'
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/composables/useAppStore'
import { useToast } from 'primevue/usetoast'
import type { PublicationResponseDto } from '@/types/models/publication'
import { handleSearch } from '@/utils/handleSearch'

const { t } = useI18n()
const store = useAppStore()
const router = useRouter()
const toast = useToast()

const filtersMenuRef = ref<InstanceType<typeof FiltersMenu> | null>(null)
const repositories = ref<PublicationResponseDto[]>([])
const isFiltering = ref(false)
const searchText = ref('')

function clearAllFilters() {
  searchText.value = ''
  filtersMenuRef.value?.setDefault()
}

let searchDebounce: ReturnType<typeof setTimeout> | null = null

const runSearch = async () => {
  isFiltering.value = true
  try {
    const results = await handleSearch(router.currentRoute, store.state.filterQuery)
    repositories.value = (results ?? []) as PublicationResponseDto[]
  } catch {
    repositories.value = []
    toast.add({ severity: 'error', summary: t('store.error-loading'), life: 4000 })
  } finally {
    isFiltering.value = false
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
})

watch(searchText, (newVal) => {
  store.commit('mutateQuery', { ...store.state.filterQuery, query: newVal })
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    runSearch()
  }, 350)
})
</script>
<style scoped>
.pagination {
  position: absolute;
  top: 7rem;
  width: 100%;
}
</style>
