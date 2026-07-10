<template>
  <section class="main-contributions">
    <restricted v-if="!store.state.isLogged || !store.state.appUserCredentials.emailVerified" />
    <template v-else>
      <header class="pb-4 text-start">
        <h2>{{ t('contributions.moderations') }}</h2>
        <p class="mt-1 text-sm text-[var(--text-color-light)]">
          {{ t('contributions.moderations-subtitle') }}
        </p>
        <div class="mt-3 flex items-center gap-3">
          <ToggleSwitch
            v-model="isReviewer"
            inputId="reviewer-toggle"
            @update:model-value="handleToggleReviewer"
          />
          <label for="reviewer-toggle" class="text-sm">
            {{ t('settings.reviewer.label') }}
            <InfoTooltip :text="t('settings.reviewer.description')" />
          </label>
        </div>
      </header>
      <data-table
        v-model:expandedRows="expandedRows"
        v-model:filters="filters"
        :value="reviews"
        :loading="isFetching"
        removableSort
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        dataKey="id"
        :globalFilterFields="['publicationRepoId', 'status']"
        rowHover
        @row-click="handleRowClick"
      >
        <template #header>
          <div class="flex items-center justify-between pb-2">
            <div class="flex items-center justify-start gap-2">
              <font-awesome-icon class="w-7" :icon="['fas', 'search']" />
              <InputText
                v-focus
                v-model="filters['global'].value"
                :placeholder="t('contributions.moderation-table.search')"
              />
            </div>
            <Button
              v-if="filters['global'].value"
              @click="clearFilter"
              size="small"
              variant="outlined"
              v-tooltip.left="t('contributions.action.clear-filters')"
            >
              <div><font-awesome-icon :icon="['fas', 'filter-circle-xmark']" /></div>
            </Button>
          </div>
        </template>
        <template #empty>
          <EmptyState
            :icon="['fas', 'clipboard-check']"
            :title="t('contributions.moderation-table.empty')"
            :description="t('contributions.moderation-table.empty-hint')"
          />
        </template>
        <template #loading>
          <Message severity="info">{{ t('contributions.moderation-table.loading') }}</Message>
        </template>
        <column expander />
        <column
          field="publicationRepoId"
          :header="t('contributions.moderation-table.publication')"
          sortable
        />
        <column field="status" :header="t('contributions.moderation-table.status')" sortable>
          <template #body="slotProps">
            <Tag
              :severity="statusSeverity(slotProps.data.status)"
              :value="statusLabel(slotProps.data.status)"
            />
          </template>
        </column>
        <column field="verdict" :header="t('contributions.moderation-table.veredict')" sortable>
          <template #body="slotProps">
            <span v-if="slotProps.data.verdict === null">--</span>
            <Tag
              v-else
              :severity="slotProps.data.verdict.isSafe ? 'success' : 'danger'"
              :value="
                slotProps.data.verdict.isSafe
                  ? t('contributions.approved')
                  : t('contributions.denied')
              "
            />
          </template>
        </column>
        <column
          field="assignedAt"
          :header="t('contributions.moderation-table.assigned-date')"
          sortable
          class="hidden md:table-cell"
          headerClass="hidden md:table-cell"
        >
          <template #body="slotProps">
            {{ formatDate(slotProps.data.assignedAt, { lang: store.state.lang }) }}
          </template>
        </column>
        <column
          field="reviewedAt"
          :header="t('contributions.moderation-table.date')"
          sortable
          class="hidden md:table-cell"
          headerClass="hidden md:table-cell"
        >
          <template #body="slotProps">
            {{
              slotProps.data.reviewedAt
                ? formatDate(slotProps.data.reviewedAt, {
                    lang: store.state.lang,
                    includeTime: true
                  })
                : '--'
            }}
          </template>
        </column>
        <template #expansion="slotProps">
          <div class="p-2 text-[var(--text-color)]">
            <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 [&>span]:font-bold">
              <span>{{ t('contributions.moderation-table.actions') }}</span>
              <div>
                <router-link
                  v-if="slotProps.data.status === 'pending'"
                  :to="{
                    name: 'Details',
                    query: { repoId: slotProps.data.publicationRepoId, verdict: 'true' }
                  }"
                >
                  <Button :label="t('verdict.review-action')" severity="warn" size="small" outlined>
                    <template #icon>
                      <font-awesome-icon :icon="['fas', 'shield-halved']" class="mr-2" />
                    </template>
                  </Button>
                </router-link>
                <router-link
                  v-else
                  :to="{
                    name: 'Details',
                    query: { repoId: slotProps.data.publicationRepoId }
                  }"
                >
                  <Button
                    :label="t('verdict.view-publication')"
                    severity="secondary"
                    size="small"
                    outlined
                  >
                    <template #icon>
                      <font-awesome-icon :icon="['fas', 'eye']" class="mr-2" />
                    </template>
                  </Button>
                </router-link>
              </div>
              <span>{{ t('contributions.moderation-table.publication') }}</span>
              <p>{{ slotProps.data.publicationRepoId }}</p>
              <span>{{ t('contributions.moderation-table.reviewer-email') }}</span>
              <p>{{ slotProps.data.reviewerEmail }}</p>
              <span class="md:hidden">{{ t('contributions.moderation-table.assigned-date') }}</span>
              <p class="md:hidden">
                {{ formatDate(slotProps.data.assignedAt, { lang: store.state.lang }) }}
              </p>
              <span class="md:hidden">{{ t('contributions.moderation-table.date') }}</span>
              <p class="md:hidden">
                {{
                  slotProps.data.reviewedAt
                    ? formatDate(slotProps.data.reviewedAt, {
                        lang: store.state.lang,
                        includeTime: true
                      })
                    : '--'
                }}
              </p>
              <span>{{ t('contributions.moderation-table.additional-comments') }}</span>
              <p>{{ slotProps.data.verdict?.comment || '--' }}</p>
            </div>
          </div>
        </template>
      </data-table>
      <MyModerationsChart v-if="showChart" v-model="counts" />
    </template>
  </section>
</template>
<script setup lang="ts">
import Restricted from '@/components/common/Restricted.vue'
import { useI18n } from 'vue-i18n'
import { getMyAssignments, getMyAssignmentsHistory } from '@/api/moderation'
import type { ReviewerAssignment } from '@/api/moderation'
import { onBeforeMount, ref, computed } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import { useDataTableFilter } from '@/composables/dataTableFilter'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import MyModerationsChart from '@/components/my_moderations/MyModerationsChart.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import InfoTooltip from '@/components/common/InfoTooltip.vue'
import ToggleSwitch from 'primevue/toggleswitch'
import { getContributorByUserId, updateContributorByUserId } from '@/api/contributors'
import { formatDate } from '@/utils/formatDate'

const { t } = useI18n()
const store = useAppStore()
const toast = useToast()

const { filters, expandedRows, clearFilter, toggleRow } = useDataTableFilter()
const reviews = ref<ReviewerAssignment[]>([])
const isFetching = ref(false)
const isReviewer = ref(false)
const isUserLogged = computed<boolean>(() => store.state.isLogged)
const doneCount = ref(0)
const safeCount = ref(0)
const unsafeCount = ref(0)
const pendingCount = ref(0)
const counts = computed(() => ({
  safeCount: safeCount.value,
  unsafeCount: unsafeCount.value,
  pendingCount: pendingCount.value
}))
const showChart = computed<boolean>(() => reviews.value.length > 0)

const statusSeverity = (status: ReviewerAssignment['status']) =>
  status === 'done' ? 'success' : 'warn'

const statusLabel = (status: ReviewerAssignment['status']) =>
  status === 'done' ? t('contributions.moderation-table.done') : t('contributions.pending')

async function handleToggleReviewer(value: boolean) {
  const userId = store.state.platformUserId
  if (!userId) return
  try {
    await updateContributorByUserId(userId, { isReviewer: value })
    toast.add({
      severity: 'success',
      summary: value ? t('contributions.reviewer-enabled') : t('contributions.reviewer-disabled'),
      life: 3000
    })
  } catch {
    isReviewer.value = !value
    toast.add({ severity: 'error', summary: t('settings.platforms.error'), life: 4000 })
  }
}

onBeforeMount(async () => {
  if (!isUserLogged.value) return
  const userId = store.state.platformUserId
  if (userId) {
    try {
      const response = await getContributorByUserId(userId)
      isReviewer.value = response.data.isReviewer ?? false
    } catch {
      // Keep default (false)
    }
  }
  try {
    isFetching.value = true
    const [pendingResult, historyResult] = await Promise.all([
      getMyAssignments(),
      getMyAssignmentsHistory()
    ])
    reviews.value = [...pendingResult.data.data, ...historyResult.data.data]
    reviews.value.forEach((assignment) => {
      if (assignment.status === 'pending') {
        pendingCount.value++
      } else {
        doneCount.value++
        if (assignment.verdict?.isSafe) {
          safeCount.value++
        } else {
          unsafeCount.value++
        }
      }
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('contributions.message.fetch-moderations-failure'),
      life: 4000
    })
  } finally {
    isFetching.value = false
  }
})

const emit = defineEmits<{
  (e: 'row-expand', event: { data: ReviewerAssignment; index: number }): void
  (e: 'row-collapse', event: { data: ReviewerAssignment; index: number }): void
}>()

const handleRowClick = (event: { data: ReviewerAssignment; index: number }) => {
  const key = event.data.id
  const wasExpanded = !!expandedRows.value[key]
  toggleRow(key)
  if (wasExpanded) {
    emit('row-collapse', event)
  } else {
    emit('row-expand', event)
  }
}
</script>
<style scoped></style>
