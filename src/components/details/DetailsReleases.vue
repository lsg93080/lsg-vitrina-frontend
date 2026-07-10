<template>
  <DetailsSectionCard :title="t('details.releases')">
    <LoadingState v-if="loading" />

    <template v-else-if="releases.length === 0">
      <div class="flex flex-col items-center gap-3 py-8 text-[var(--text-color-light)]">
        <font-awesome-icon :icon="['fas', 'box-open']" class="text-4xl opacity-40" />
        <p class="text-sm">{{ t('details.no-releases') }}</p>
      </div>
    </template>

    <template v-else>
      <DataTable
        :value="releases"
        :selection="selectedRow"
        selectionMode="single"
        dataKey="id"
        :rows="rowsPerPage"
        :totalRecords="totalRecords"
        :lazy="true"
        :paginator="totalRecords > rowsPerPage"
        :first="(currentPage - 1) * rowsPerPage"
        :rowsPerPageOptions="[5, 10, 20]"
        class="releases-table"
        :rowClass="rowHighlight"
        @row-select="onRowSelect"
        @page="onPageChange"
      >
        <Column field="version" :header="t('releases.version')" style="width: 7rem">
          <template #body="{ data }">
            <Tag :value="data.version" class="release-tag" />
          </template>
        </Column>

        <Column field="title" :header="t('releases.name')" style="min-width: 10rem">
          <template #body="{ data }">
            <span class="text-sm text-[var(--text-color)]">{{ data.title }}</span>
          </template>
        </Column>

        <Column field="releaseDate" :header="t('releases.date')" style="width: 8rem">
          <template #body="{ data }">
            <span class="text-xs text-[var(--text-color-light)]">
              {{ formatDate(data.releaseDate, { lang: locale }) }}
            </span>
          </template>
        </Column>

        <Column field="averageRating" :header="t('store.app-info.rating')" style="width: 7rem">
          <template #body="{ data }">
            <Stars v-if="data.totalReviews > 0" :rating="data.averageRating" />
            <span v-else class="text-xs text-[var(--text-color-light)]">
              {{ t('details.no-rating') }}
            </span>
          </template>
        </Column>

        <Column field="status" :header="t('releases.status')" style="width: 7rem">
          <template #body="{ data }">
            <Tag
              :value="t(`releases.status-${data.status}`)"
              :severity="statusSeverity(data.status)"
            />
          </template>
        </Column>

        <Column :header="t('details.downloads')" style="width: 4rem">
          <template #body="{ data }">
            <a
              v-if="data.downloadUrl"
              :href="data.downloadUrl"
              target="_blank"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition-all duration-200 hover:bg-white/5 hover:text-[var(--primary-color)]"
              @click="onDownloadClick"
            >
              <font-awesome-icon :icon="['fas', 'download']" />
            </a>
            <span v-else class="text-white/20">
              <font-awesome-icon :icon="['fas', 'download']" />
            </span>
          </template>
        </Column>
      </DataTable>
    </template>
    <div v-if="props.isOwner" class="m-4 flex justify-center">
      <Button :label="t('releases.add')" size="small" @click="emit('addRelease')">
        <template #icon>
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
        </template>
      </Button>
    </div>
  </DetailsSectionCard>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DataTable, {
  type DataTablePageEvent,
  type DataTableRowSelectEvent
} from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import DetailsSectionCard from '@/components/details/DetailsSectionCard.vue'
import Stars from '@/components/common/Stars.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { getReleases } from '@/api/publicationDetails'
import { trackDownload } from '@/api/publications'
import { formatDate } from '@/utils/formatDate'
import type { Release, ReleaseStatus } from '@/types/models/release'

interface Props {
  repoId: string
  selectedReleaseId?: string
  isOwner?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOwner: false
})

const emit = defineEmits<{
  selectRelease: [release: Release]
  'update:selectedReleaseId': [id: string]
  addRelease: []
}>()

const { t, locale } = useI18n()

const releases = ref<Release[]>([])
const selectedRow = ref<Release | null>(null)
const loading = ref(false)
const totalRecords = ref(0)
const currentPage = ref(1)
const rowsPerPage = ref(5)

function statusSeverity(status: ReleaseStatus): 'warn' | 'success' | 'danger' {
  const map: Record<ReleaseStatus, 'warn' | 'success' | 'danger'> = {
    pending: 'warn',
    approved: 'success',
    suspended: 'danger'
  }
  return map[status]
}

function rowHighlight(data: Release): string {
  return data.id === props.selectedReleaseId ? 'release-row-selected' : ''
}

async function fetchReleases(page: number, limit: number) {
  loading.value = true
  try {
    const result = await getReleases(props.repoId, page, limit)
    releases.value = result.data
    totalRecords.value = result.total
    currentPage.value = result.page
  } catch {
    releases.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

function selectRelease(release: Release) {
  selectedRow.value = release
  emit('selectRelease', release)
  emit('update:selectedReleaseId', release.id)
}

function onRowSelect(event: DataTableRowSelectEvent) {
  selectRelease(event.data as Release)
}

function onPageChange(event: DataTablePageEvent) {
  const newPage = event.first / event.rows + 1
  rowsPerPage.value = event.rows
  fetchReleases(newPage, event.rows)
}

watch(
  () => props.repoId,
  (newId) => {
    if (newId) {
      fetchReleases(1, rowsPerPage.value)
    }
  }
)

onMounted(async () => {
  if (props.repoId) {
    await fetchReleases(1, rowsPerPage.value)
    // Auto-select the first release if none is selected
    if (!props.selectedReleaseId && releases.value.length > 0) {
      selectRelease(releases.value[0])
    } else if (props.selectedReleaseId) {
      const found = releases.value.find((r) => r.id === props.selectedReleaseId)
      if (found) {
        selectedRow.value = found
      }
    }
  }
})

function onDownloadClick() {
  void trackDownload(props.repoId).catch(() => {})
}

function refresh() {
  fetchReleases(1, rowsPerPage.value)
}

defineExpose({ releases, refresh })
</script>

<style scoped>
.releases-table {
  --p-datatable-header-cell-background: transparent;
  --p-datatable-row-background: transparent;
}

.releases-table :deep(.p-datatable-header-cell) {
  color: var(--text-color-light);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.releases-table :deep(.p-datatable-tbody > tr) {
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.releases-table :deep(.p-datatable-tbody > tr:hover) {
  background: var(--primary-color-5);
}

.releases-table :deep(.p-datatable-tbody > tr.release-row-selected) {
  background: var(--primary-color-10);
  box-shadow: inset 0 0 0 1px var(--primary-color-40);
  border-radius: 4px;
}

.releases-table :deep(.p-datatable-tbody > tr.p-datatable-row-selected) {
  background: var(--primary-color-10);
  box-shadow: inset 0 0 0 1px var(--primary-color-40);
}

.releases-table :deep(.p-paginator) {
  background: transparent;
  border: none;
  padding-top: 0.75rem;
}

.release-tag {
  background: linear-gradient(135deg, var(--primary-color-20), var(--primary-color-10));
  color: var(--primary-color);
  border: 1px solid var(--primary-color-30);
  font-family: 'Audiowide', sans-serif;
  font-size: 0.75rem;
}
</style>
