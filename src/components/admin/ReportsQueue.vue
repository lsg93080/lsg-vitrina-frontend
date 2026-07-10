<template>
  <section>
    <div class="mb-4 flex flex-wrap items-end gap-3">
      <div class="flex w-full flex-col gap-1 sm:w-64">
        <label class="text-sm">{{ t('admin.search-label') }}</label>
        <IconField>
          <InputIcon>
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="text-sm" />
          </InputIcon>
          <InputText
            v-model="searchQuery"
            :placeholder="t('admin.search-placeholder')"
            class="w-full"
          />
        </IconField>
      </div>
      <div class="flex w-full flex-col gap-1 sm:w-44">
        <label class="text-sm">{{ t('admin.status') }}</label>
        <Select
          v-model="selectedStatus"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('admin.filter-all-statuses')"
          :disabled="onlyPending"
          class="w-full"
          @change="onFilterChange"
        >
          <template #dropdownicon>
            <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-xs" />
          </template>
        </Select>
      </div>
      <div class="flex w-full flex-col gap-1 sm:w-52">
        <label class="text-sm">{{ t('admin.reason') }}</label>
        <Select
          v-model="selectedReason"
          :options="reasonOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('admin.filter-all-reasons')"
          class="w-full"
          @change="onFilterChange"
        >
          <template #dropdownicon>
            <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-xs" />
          </template>
        </Select>
      </div>
      <div class="flex w-full flex-col gap-1 sm:w-auto">
        <label class="text-sm">{{ t('admin.filter-date-range') }}</label>
        <div class="flex gap-4">
          <div class="w-full sm:w-44">
            <DatePicker
              v-model="dateFrom"
              :placeholder="t('admin.filter-date-from')"
              showIcon
              iconDisplay="input"
              :dateFormat="dateFormat"
              fluid
            >
              <template #inputicon="{ clickCallback }">
                <font-awesome-icon
                  :icon="['fas', 'calendar-days']"
                  class="cursor-pointer"
                  @click="clickCallback"
                />
              </template>
            </DatePicker>
          </div>
          <div class="w-full sm:w-44">
            <DatePicker
              v-model="dateTo"
              :placeholder="t('admin.filter-date-to')"
              showIcon
              iconDisplay="input"
              :dateFormat="dateFormat"
              fluid
            >
              <template #inputicon="{ clickCallback }">
                <font-awesome-icon
                  :icon="['fas', 'calendar-days']"
                  class="cursor-pointer"
                  @click="clickCallback"
                />
              </template>
            </DatePicker>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Checkbox
          v-model="onlyPending"
          binary
          inputId="only-pending"
          @change="onOnlyPendingChange"
        />
        <label for="only-pending" class="cursor-pointer text-sm">{{
          t('admin.only-pending')
        }}</label>
      </div>
      <Button
        v-if="hasActiveFilters"
        :label="t('admin.clear-filters')"
        text
        size="small"
        severity="secondary"
        @click="clearFilters"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'filter-circle-xmark']" class="mr-1" />
        </template>
      </Button>
    </div>
    <data-table
      v-model:expandedRows="expandedRows"
      :value="reports"
      :loading="isFetching"
      lazy
      paginator
      :rows="pageSize"
      :totalRecords="totalRecords"
      :rowsPerPageOptions="[10, 20, 50]"
      dataKey="id"
      rowHover
      @page="onPage"
      @row-click="onRowClick"
      @row-expand="onRowExpand"
    >
      <template #paginatorstart>
        <span class="text-sm opacity-60">
          {{ paginationLabel }}
        </span>
      </template>
      <template #empty>
        <Message class="flex justify-center">{{ t('admin.no-reports') }}</Message>
      </template>
      <template #loading>
        <ProgressSpinner style="width: 2rem; height: 2rem" />
      </template>
      <column expander style="width: 3rem" />
      <column field="publicationId" :header="t('admin.publication-id')" sortable />
      <column
        field="reporterName"
        :header="t('admin.reporter')"
        sortable
        class="hidden md:table-cell"
        headerClass="hidden md:table-cell"
      >
        <template #body="slotProps">
          {{ slotProps.data.reporterName ?? slotProps.data.reporterId }}
        </template>
      </column>
      <column field="reason" :header="t('admin.reason')" sortable>
        <template #body="slotProps">
          {{ t(`report.reason.${slotProps.data.reason}`) }}
        </template>
      </column>
      <column
        field="createdAt"
        :header="t('admin.date')"
        sortable
        class="hidden md:table-cell"
        headerClass="hidden md:table-cell"
      >
        <template #body="slotProps">
          {{ formatDate(slotProps.data.createdAt, { lang: store.state.lang }) }}
        </template>
      </column>
      <column field="status" :header="t('admin.status')" sortable>
        <template #body="slotProps">
          <Tag
            :severity="statusSeverity(slotProps.data.status)"
            :value="statusLabel(slotProps.data.status)"
            class="w-24 justify-center"
          />
        </template>
      </column>
      <template #expansion="slotProps">
        <div class="px-2 py-3">
          <span class="text-sm font-semibold"
            >{{ t('admin.report-title') }} #{{ slotProps.data.id }}</span
          >
          <div class="mt-1 mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm md:hidden">
            <span
              ><strong>{{ t('admin.reporter') }}:</strong>
              <span class="ml-1">{{
                slotProps.data.reporterName ?? slotProps.data.reporterId
              }}</span></span
            >
            <span
              ><strong>{{ t('admin.date') }}:</strong>
              <span class="ml-1">{{
                formatDate(slotProps.data.createdAt, { lang: store.state.lang })
              }}</span></span
            >
          </div>
          <div v-if="slotProps.data.description" class="mt-1 mb-3">
            <span class="text-sm font-semibold">{{ t('admin.report-content') }}</span>
            <p class="mt-1 text-sm opacity-80">{{ slotProps.data.description }}</p>
          </div>
          <p v-if="slotProps.data.publicationAuthorName" class="mb-3 text-sm">
            <span class="font-semibold">{{ t('admin.publication-author') }}</span>
            {{ slotProps.data.publicationAuthorName }}
          </p>
          <div class="mb-3">
            <router-link
              :to="{ name: 'Details', query: { repoId: slotProps.data.publicationId } }"
              class="flex items-center gap-1 text-sm text-[var(--p-primary-color)] hover:underline"
              target="_blank"
            >
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="text-xs" />
              {{ t('admin.view-publication') }}
            </router-link>
          </div>
          <div v-if="slotProps.data.status === 'pending'" class="mb-3 flex flex-col gap-2">
            <Textarea
              v-model="adminMessages[slotProps.data.id]"
              :placeholder="
                slotProps.data.publicationStatus === 'suspended'
                  ? t('admin.reactivate-message-placeholder')
                  : t('admin.admin-message-placeholder')
              "
              rows="2"
              maxlength="300"
              class="w-full"
            />
            <div v-if="slotProps.data.publicationStatus === 'suspended'" class="flex gap-2">
              <Button
                size="small"
                variant="outlined"
                severity="secondary"
                :label="t('admin.reply-send')"
                :disabled="!adminMessages[slotProps.data.id]?.trim()"
                :loading="resolvingId === slotProps.data.id"
                @click="handleAdminReply(slotProps.data.id, slotProps.data.publicationId)"
              >
                <template #icon>
                  <font-awesome-icon :icon="['fas', 'comments']" class="mr-1" />
                </template>
              </Button>
              <Button
                size="small"
                severity="success"
                :label="t('admin.reply-and-reactivate')"
                :disabled="!adminMessages[slotProps.data.id]?.trim()"
                :loading="resolvingId === slotProps.data.id"
                @click="handleReactivateFromReport(slotProps.data.id, slotProps.data.publicationId)"
              >
                <template #icon>
                  <font-awesome-icon :icon="['fas', 'check']" class="mr-1" />
                </template>
              </Button>
            </div>
            <div v-else class="flex gap-2">
              <Button
                size="small"
                variant="outlined"
                severity="secondary"
                :label="t('admin.dismiss')"
                :loading="resolvingId === slotProps.data.id"
                @click="handleResolve(slotProps.data.id, 'dismiss', slotProps.data.publicationId)"
              >
                <template #icon>
                  <font-awesome-icon :icon="['fas', 'xmark']" class="mr-1" />
                </template>
              </Button>
              <Button
                size="small"
                variant="outlined"
                severity="warn"
                :label="t('admin.warn')"
                :loading="resolvingId === slotProps.data.id"
                @click="handleResolve(slotProps.data.id, 'warn', slotProps.data.publicationId)"
              >
                <template #icon>
                  <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="mr-1" />
                </template>
              </Button>
              <Button
                size="small"
                severity="danger"
                :label="t('admin.suspend')"
                :loading="resolvingId === slotProps.data.id"
                @click="handleResolve(slotProps.data.id, 'suspend', slotProps.data.publicationId)"
              >
                <template #icon>
                  <font-awesome-icon :icon="['fas', 'ban']" class="mr-1" />
                </template>
              </Button>
            </div>
          </div>
          <div class="mt-3 border-t pt-3">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-semibold">{{ t('admin.reports-history') }}</span>
              <Button
                size="small"
                text
                severity="secondary"
                @click="loadHistory(slotProps.data.publicationId)"
              >
                <template #icon>
                  <font-awesome-icon :icon="['fas', 'rotate-right']" class="mr-1 text-xs" />
                </template>
              </Button>
            </div>
            <ProgressSpinner
              v-if="historyLoading[slotProps.data.publicationId]"
              style="width: 1.5rem; height: 1.5rem"
            />
            <div
              v-else-if="historyCache[slotProps.data.publicationId]?.length"
              class="flex max-h-48 flex-col gap-2 overflow-y-auto"
            >
              <div
                v-for="entry in historyCache[slotProps.data.publicationId]"
                :key="entry.id"
                class="rounded p-2 text-sm"
                style="background-color: var(--background-secondary-color)"
              >
                <div class="flex items-center gap-2">
                  <Tag
                    :severity="actionSeverity(entry.action)"
                    :value="actionLabel(entry.action)"
                    class="text-xs"
                  />
                  <span class="font-medium">{{ entry.authorName }}</span>
                  <span class="opacity-50">{{
                    formatDate(entry.createdAt, { lang: store.state.lang })
                  }}</span>
                </div>
                <p class="mt-1 opacity-80">{{ entry.message }}</p>
              </div>
            </div>
            <p v-else class="text-sm opacity-50">{{ t('admin.no-history') }}</p>
          </div>
        </div>
      </template>
    </data-table>
  </section>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import { getReports, resolveReport } from '@/api/reports'
import { getReportsHistory, reactivatePublication } from '@/api/publications'
import type { ReportAction } from '@/types/models/report'
import type { Report, ReportStatus } from '@/types/models/report'
import type { ReportsHistoryEntry } from '@/types/models/publication'
import { formatDate } from '@/utils/formatDate'

const ONLY_PENDING_KEY = 'admin:reports:onlyPending'

const { t } = useI18n()
const store = useAppStore()
const toast = useToast()

const reports = ref<Report[]>([])
const expandedRows = ref<Record<string, boolean>>({})
const isFetching = ref(false)
const resolvingId = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)
const adminMessages = ref<Record<string, string>>({})
const historyCache = ref<Record<string, ReportsHistoryEntry[]>>({})
const historyLoading = ref<Record<string, boolean>>({})
const searchQuery = ref('')
const selectedStatus = ref<string | undefined>(undefined)
const selectedReason = ref<string | undefined>(undefined)
const dateFrom = ref<Date | null>(null)
const dateTo = ref<Date | null>(new Date())

const storedPending = localStorage.getItem(ONLY_PENDING_KEY)
const onlyPending = ref(storedPending !== null ? storedPending === 'true' : true)

const dateFormat = computed(() => (store.state.lang === 'es' ? 'dd/mm/yy' : 'mm/dd/yy'))

const statusOptions = computed(() => [
  { label: t('admin.filter-all-statuses'), value: undefined },
  { label: t('admin.pending'), value: 'pending' },
  { label: t('admin.dismissed'), value: 'dismissed' },
  { label: t('admin.warned'), value: 'warned' },
  { label: t('admin.suspended'), value: 'suspended' }
])

const reasonOptions = computed(() => [
  { label: t('admin.filter-all-reasons'), value: undefined },
  { label: t('report.reason.nsfw'), value: 'nsfw' },
  { label: t('report.reason.inappropriate'), value: 'inappropriate' },
  { label: t('report.reason.malware'), value: 'malware' },
  { label: t('report.reason.copyright'), value: 'copyright' },
  { label: t('report.reason.other'), value: 'other' }
])

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const isDateToDefault = () => {
  if (!dateTo.value) return false
  const d = new Date(dateTo.value)
  d.setHours(0, 0, 0, 0)
  return d.getTime() === today().getTime()
}

const paginationLabel = computed(() => {
  if (totalRecords.value === 0) return ''
  const lang = store.state.lang as string
  const from = (currentPage.value - 1) * pageSize.value + 1
  const to = Math.min(currentPage.value * pageSize.value, totalRecords.value)
  return t('admin.pagination-summary', {
    from: from.toLocaleString(lang),
    to: to.toLocaleString(lang),
    total: totalRecords.value.toLocaleString(lang)
  })
})

const hasActiveFilters = computed(
  () =>
    !!searchQuery.value.trim() ||
    !!selectedStatus.value ||
    !!selectedReason.value ||
    !!dateFrom.value ||
    !isDateToDefault()
)

const statusSeverity = (status: ReportStatus) => {
  if (status === 'pending') return 'warn'
  if (status === 'suspended') return 'danger'
  if (status === 'warned') return 'secondary'
  return 'success'
}

const statusLabel = (status: ReportStatus): string => {
  if (status === 'pending') return t('admin.pending')
  if (status === 'dismissed') return t('admin.dismissed')
  if (status === 'warned') return t('admin.warned')
  if (status === 'suspended') return t('admin.suspended')
  return t('admin.resolved')
}

const actionLabel = (action: string) => {
  const map: Record<string, string> = {
    warn: t('admin.action-warn'),
    suspend: t('admin.action-suspend'),
    reactivate: t('admin.action-reactivate'),
    reply: t('admin.action-reply')
  }
  return map[action] ?? action
}

const actionSeverity = (action: string) => {
  if (action === 'warn') return 'warn'
  if (action === 'suspend') return 'danger'
  if (action === 'reactivate') return 'success'
  return 'info'
}

const loadHistory = async (publicationId: string) => {
  historyLoading.value[publicationId] = true
  try {
    const res = await getReportsHistory(publicationId)
    historyCache.value[publicationId] = res.data
  } catch {
    historyCache.value[publicationId] = []
  } finally {
    historyLoading.value[publicationId] = false
  }
}

const handleAdminReply = async (reportId: string, publicationId: string) => {
  const msg = adminMessages.value[reportId]?.trim()
  if (!msg) return
  try {
    resolvingId.value = reportId
    await resolveReport(reportId, 'warn', msg)
    await loadHistory(publicationId)
    adminMessages.value[reportId] = ''
    toast.add({ severity: 'success', summary: t('admin.reply-success'), life: 3000 })
    await fetchReports()
  } catch {
    toast.add({ severity: 'error', summary: t('admin.reply-error'), life: 3000 })
  } finally {
    resolvingId.value = null
  }
}

const handleReactivateFromReport = async (reportId: string, publicationId: string) => {
  const msg = adminMessages.value[reportId]?.trim()
  if (!msg) return
  try {
    resolvingId.value = reportId
    await reactivatePublication(publicationId, msg)
    await resolveReport(reportId, 'dismiss')
    adminMessages.value[reportId] = ''
    toast.add({ severity: 'success', summary: t('admin.reactivate-success'), life: 3000 })
    await fetchReports()
  } catch {
    toast.add({ severity: 'error', summary: t('admin.reactivate-error'), life: 3000 })
  } finally {
    resolvingId.value = null
  }
}

const fetchReports = async () => {
  try {
    isFetching.value = true
    const params: Record<string, unknown> = {
      page: currentPage.value,
      limit: pageSize.value
    }
    if (onlyPending.value) {
      params.status = 'pending'
    } else if (selectedStatus.value) {
      params.status = selectedStatus.value
    }
    if (searchQuery.value.trim()) {
      params.publicationId = searchQuery.value.trim()
    }
    if (selectedReason.value) {
      params.reason = selectedReason.value
    }
    if (dateFrom.value) {
      params.dateFrom = dateFrom.value.toISOString().split('T')[0]
    }
    if (dateTo.value) {
      params.dateTo = dateTo.value.toISOString().split('T')[0]
    }
    const res = await getReports(params)
    reports.value = res.data.data
    totalRecords.value = res.data.total
  } catch {
    toast.add({ severity: 'error', summary: t('admin.resolve-error'), life: 3000 })
  } finally {
    isFetching.value = false
  }
}

const onRowExpand = (event: { data: Report }) => {
  loadHistory(event.data.publicationId)
}

const onRowClick = (event: { data: Report }) => {
  const id = event.data.id
  if (expandedRows.value[id]) {
    delete expandedRows.value[id]
  } else {
    expandedRows.value = { ...expandedRows.value, [id]: true }
  }
}

const onPage = (event: { page: number; rows: number }) => {
  currentPage.value = event.page + 1
  pageSize.value = event.rows
  fetchReports()
}

const onFilterChange = () => {
  currentPage.value = 1
  fetchReports()
}

const onOnlyPendingChange = () => {
  localStorage.setItem(ONLY_PENDING_KEY, String(onlyPending.value))
  if (onlyPending.value) {
    selectedStatus.value = undefined
  }
  currentPage.value = 1
  fetchReports()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = undefined
  selectedReason.value = undefined
  dateFrom.value = null
  dateTo.value = new Date()
  currentPage.value = 1
  fetchReports()
}

const handleResolve = async (id: string, action: ReportAction, publicationId: string) => {
  const msg = adminMessages.value[id]?.trim()
  if ((action === 'warn' || action === 'suspend') && !msg) {
    toast.add({ severity: 'warn', summary: t('admin.message-required'), life: 3000 })
    return
  }
  try {
    resolvingId.value = id
    await resolveReport(id, action, msg || undefined)
    adminMessages.value[id] = ''
    toast.add({ severity: 'success', summary: t('admin.resolve-success'), life: 3000 })
    if (msg) await loadHistory(publicationId)
    await fetchReports()
  } catch {
    toast.add({ severity: 'error', summary: t('admin.resolve-error'), life: 3000 })
  } finally {
    resolvingId.value = null
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchReports()
  }, 400)
})

watch([dateFrom, dateTo], () => {
  currentPage.value = 1
  fetchReports()
})

onBeforeMount(fetchReports)
</script>
<style scoped></style>
