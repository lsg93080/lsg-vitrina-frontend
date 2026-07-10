<template>
  <section class="main-contributions">
    <restricted v-if="!isUserLogged || !isEmailVerified" />
    <template v-else>
      <header class="pb-4 text-start">
        <h2>{{ t('nav.contributions') }}</h2>
        <p class="mt-1 text-sm text-[var(--text-color-light)]">
          {{ t('contributions.apps-subtitle') }}
        </p>
      </header>
      <DataTable
        v-model:expandedRows="expandedRows"
        v-model:filters="filters"
        :value="apps"
        removableSort
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        dataKey="id"
        :globalFilterFields="['title', 'type', 'status']"
        :loading="isFetching"
        rowHover
        @row-click="(e) => handleRowClick(e)"
        @row-expand="(e) => loadHistory(e.data.repoId.toString())"
      >
        <template #header>
          <div class="flex items-center justify-between pb-2">
            <div class="flex items-center justify-start gap-2">
              <font-awesome-icon class="w-7" :icon="['fas', 'search']" />
              <InputText
                v-focus
                v-model="filters.global!.value"
                :placeholder="t('contributions.app-table.search')"
              />
            </div>
            <Button
              v-if="filters.global!.value"
              @click="clearFilter()"
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
            :icon="['fas', 'box-open']"
            :title="t('contributions.app-table.empty')"
            :primary-action="{
              label: t('contributions.app-table.publish-first'),
              action: () => router.push({ name: 'Publish' })
            }"
          />
        </template>
        <template #loading>
          <Message severity="info">{{ t('contributions.app-table.loading') }}</Message>
        </template>
        <Column expander></Column>
        <Column
          class="w-full"
          field="title"
          :header="t('contributions.app-table.name')"
          sortable
        ></Column>
        <Column
          field="type"
          :header="t('contributions.app-table.type')"
          sortable
          class="hidden md:table-cell"
          headerClass="hidden md:table-cell"
        >
          <template #body="slotProps">
            <span class="capitalize">{{ slotProps.data.type }}</span>
          </template>
        </Column>
        <Column field="status" :header="t('contributions.app-table.status')" sortable>
          <template #body="slotProps">
            <Tag
              :severity="statusSeverity(slotProps.data.status)"
              :value="
                (slotProps.data.status ?? '--').charAt(0).toUpperCase() +
                (slotProps.data.status ?? '').slice(1)
              "
              class="w-24 justify-center"
            />
          </template>
        </Column>
        <Column
          field="createdAt"
          :header="t('contributions.app-table.date')"
          sortable
          class="hidden md:table-cell"
          headerClass="hidden md:table-cell"
        >
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt, { lang: store.state.lang }) }}
          </template>
        </Column>
        <column
          field="actions"
          :header="t('contributions.app-table.actions')"
          headerClass="flex justify-center"
        >
          <template #body="slotProps">
            <div class="flex justify-center gap-1">
              <Button
                v-tooltip.top="t('contributions.action.edit-app')"
                variant="text"
                @click="
                  () => {
                    selectedApp = slotProps.data
                    showEditAppPopup = true
                  }
                "
              >
                <font-awesome-icon :icon="['fas', 'pen']" />
              </Button>
              <Button
                v-tooltip.top="t('contributions.action.delete-app')"
                variant="text"
                @click="
                  () => {
                    selectedApp = slotProps.data
                    showDeleteAppPopup = true
                  }
                "
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </Button>
            </div>
          </template>
        </column>
        <template #expansion="slotProps">
          <div class="text-[var(--text-color)]">
            <div class="mb-2 flex flex-wrap gap-x-6 gap-y-1 text-sm md:hidden">
              <span
                ><strong>{{ t('contributions.app-table.type') }}:</strong>
                <span class="ml-1 capitalize">{{ slotProps.data.type }}</span></span
              >
              <span
                ><strong>{{ t('contributions.app-table.date') }}:</strong>
                <span class="ml-1">{{
                  formatDate(slotProps.data.createdAt, { lang: store.state.lang })
                }}</span></span
              >
            </div>
            <p v-if="slotProps.data.shortDescription">
              {{ slotProps.data.shortDescription }}
            </p>
            <Message v-else severity="info">{{
              t('contributions.app-table.no-description')
            }}</Message>
            <div
              v-if="
                historyLoading[slotProps.data.repoId] || historyCache[slotProps.data.repoId]?.length
              "
              class="mt-3 border-t pt-3"
            >
              <span class="text-sm font-semibold">{{ t('admin.reports-history') }}</span>
              <ProgressSpinner
                v-if="historyLoading[slotProps.data.repoId]"
                class="mt-2"
                style="width: 1.5rem; height: 1.5rem"
              />
              <template v-else>
                <div class="mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto">
                  <div
                    v-for="entry in historyCache[slotProps.data.repoId]"
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
                <div v-if="canReply(slotProps.data.repoId)" class="mt-2 flex gap-2">
                  <Textarea
                    v-model="replyMessages[slotProps.data.repoId]"
                    :placeholder="t('admin.reply-placeholder')"
                    rows="2"
                    maxlength="300"
                    class="flex-1"
                  />
                  <Button
                    size="small"
                    :label="t('admin.reply-send')"
                    :disabled="!replyMessages[slotProps.data.repoId]?.trim()"
                    :loading="replyLoading[slotProps.data.repoId]"
                    @click="sendReply(slotProps.data.repoId)"
                  />
                </div>
              </template>
            </div>
          </div>
        </template>
      </DataTable>

      <MyAppsChart v-if="showChart" v-model="apps" />
      <EditAppPopup
        v-if="showEditAppPopup"
        v-model:showEditAppPopup="showEditAppPopup"
        v-model:apps="apps"
        :app="selectedApp"
      />
      <DeleteAppPopup
        v-if="showDeleteAppPopup"
        v-model:showDeleteAppPopup="showDeleteAppPopup"
        v-model:apps="apps"
        :app="selectedApp"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import Restricted from '@/components/common/Restricted.vue'
import { useI18n } from 'vue-i18n'
import { computed, onBeforeMount, ref, watch, type Ref } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import type { Repository } from '@/types/models/repository'
import type { ReportsHistoryEntry } from '@/types/models/publication'
import { useApp } from '@/composables/app'
import { getReportsHistory, replyToReportsHistory } from '@/api/publications'
import { formatDate } from '@/utils/formatDate'
import { useDataTableFilter } from '@/composables/dataTableFilter'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import MyAppsChart from '@/components/my_apps/MyAppsChart.vue'
import EditAppPopup from '@/components/my_apps/EditAppPopup.vue'
import DeleteAppPopup from '@/components/my_apps/DeleteAppPopup.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const store = useAppStore()
const toast = useToast()
const router = useRouter()

const { filters, expandedRows, clearFilter, toggleRow } = useDataTableFilter()
const { apps, fetchUserApps, isFetching, message } = useApp()

watch(message, (msg) => {
  if (msg) {
    toast.add({ severity: msg.severity as 'error' | 'success', summary: msg.text, life: 4000 })
  }
})
const isUserLogged: Ref<boolean> = computed(() => store.state.isLogged)
// platformUserId is the Auth Service UUID stored after login and matches authorId in publications
const userUid: Ref<string> = computed(() => store.state.platformUserId)
const isEmailVerified: Ref<boolean> = computed(() => store.state.appUserCredentials.emailVerified)
const showEditAppPopup: Ref<boolean> = ref(false)
const showDeleteAppPopup: Ref<boolean> = ref(false)
const selectedApp = ref<Repository>({} as Repository)

const historyCache = ref<Record<string, ReportsHistoryEntry[]>>({})
const historyLoading = ref<Record<string, boolean>>({})
const replyMessages = ref<Record<string, string>>({})
const replyLoading = ref<Record<string, boolean>>({})

const statusSeverity = (status: string) => {
  if (status === 'active') return 'success'
  if (status === 'suspended') return 'danger'
  if (status === 'draft') return 'secondary'
  return 'info'
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

const loadHistory = async (repoId: string) => {
  historyLoading.value[repoId] = true
  try {
    const res = await getReportsHistory(repoId)
    historyCache.value[repoId] = res.data
  } catch {
    historyCache.value[repoId] = []
  } finally {
    historyLoading.value[repoId] = false
  }
}

const sendReply = async (repoId: string) => {
  const msg = replyMessages.value[repoId]?.trim()
  if (!msg) return
  replyLoading.value[repoId] = true
  try {
    const res = await replyToReportsHistory(repoId, msg)
    historyCache.value[repoId] = res.data
    replyMessages.value[repoId] = ''
    toast.add({ severity: 'success', summary: t('admin.reply-success'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('admin.reply-error'), life: 3000 })
  } finally {
    replyLoading.value[repoId] = false
  }
}

const canReply = (repoId: string) => {
  const history = historyCache.value[repoId]
  if (!history?.length) return false
  const last = history[history.length - 1]
  // Conversation is closed after reactivation
  if (last.action === 'reactivate') return false
  return last.authorId !== userUid.value
}

const showChart = computed<boolean>(() => {
  return apps.value.length > 0 && !filters.value.global.value && !isFetching.value
})

onBeforeMount(async () => {
  if (!isUserLogged.value) {
    return
  }
  await fetchUserApps(userUid.value)
})

const emit = defineEmits<{
  (e: 'row-expand', event: { data: any; index: number }): void
  (e: 'row-collapse', event: { data: any; index: number }): void
}>()

const handleRowClick = (event: { data: any; index: number }) => {
  const repoId = event.data.repoId.toString()
  const wasExpanded = !!expandedRows.value[repoId]
  toggleRow(repoId)
  if (wasExpanded) {
    emit('row-collapse', event)
  } else {
    emit('row-expand', event)
    if (!historyCache.value[repoId]) loadHistory(repoId)
  }
}
</script>
<style scoped></style>
