<template>
  <section class="main-contributions">
    <restricted v-if="!isUserLogged || !isEmailVerified" />
    <template v-else>
      <header class="pb-4 text-start">
        <h2>{{ t('nav.reviews') }}</h2>
        <p class="mt-1 text-sm text-[var(--text-color-light)]">
          {{ t('contributions.reviews-subtitle') }}
        </p>
      </header>
      <data-table
        v-model:expandedRows="expandedRows"
        v-model:filters="filters"
        :value="reviews"
        removableSort
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        dataKey="id"
        :globalFilterFields="['title', 'repoId', 'releaseId', 'comment']"
        :loading="isFetching"
        rowHover
        @row-click="(e) => handleRowClick(e)"
      >
        <template #header>
          <div class="flex items-center justify-between pb-2">
            <div class="flex items-center justify-start gap-2">
              <font-awesome-icon class="w-7" :icon="['fas', 'search']" />
              <InputText
                v-focus
                v-model="filters['global'].value"
                :placeholder="t('contributions.review-table.search')"
              />
            </div>
            <Button
              v-if="filters['global'].value"
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
            :icon="['fas', 'comment-slash']"
            :title="t('contributions.review-table.empty')"
            :primary-action="{
              label: t('contributions.review-table.browse-store'),
              action: () => router.push({ name: 'Publications' })
            }"
          />
        </template>
        <template #loading>
          <Message severity="info">{{ t('contributions.review-table.loading') }}</Message>
        </template>
        <column expander></column>
        <column field="title" :header="t('contributions.review-table.title')" sortable>
          <template #body="slotProps">
            <span class="line-clamp-2">{{ slotProps.data.title }}</span>
          </template>
        </column>
        <column field="rating" :header="t('contributions.review-table.rating')" sortable>
          <template #body="slotProps">
            <Rating v-model="slotProps.data.rating" :stars="5" :readonly="true" class="h-5" />
          </template>
        </column>
        <column
          field="repoId"
          :header="t('contributions.review-table.repository')"
          sortable
          class="hidden md:table-cell"
          headerClass="hidden md:table-cell"
        ></column>
        <column
          field="releaseId"
          :header="t('contributions.review-table.tag')"
          sortable
          class="hidden md:table-cell"
          headerClass="hidden md:table-cell"
        ></column>
        <column
          field="createdAt"
          :header="t('contributions.review-table.date')"
          sortable
          class="hidden md:table-cell"
          headerClass="hidden md:table-cell"
        >
          <template #body="slotProps">
            {{
              formatDate(slotProps.data.createdAt, { lang: store.state.lang, includeTime: true })
            }}
          </template>
        </column>
        <column
          field="actions"
          :header="t('contributions.review-table.actions')"
          headerClass="flex justify-center"
        >
          <template #body="slotProps">
            <div class="flex justify-center gap-1">
              <Button
                v-tooltip.top="t('contributions.action.edit-review')"
                variant="text"
                @click="
                  () => {
                    selectedReview = slotProps.data
                    showEditReviewPopup = true
                  }
                "
              >
                <font-awesome-icon :icon="['fas', 'pen']" />
              </Button>
              <Button
                v-tooltip.top="t('contributions.action.delete-review')"
                variant="text"
                @click="
                  () => {
                    selectedReview = slotProps.data
                    showDeleteReviewPopup = true
                  }
                "
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </Button>
            </div>
          </template>
        </column>
        <template #expansion="slotProps">
          <div class="p-0 text-[var(--text-color)]">
            <div class="mb-2 flex flex-wrap gap-x-6 gap-y-1 text-sm md:hidden">
              <span
                ><strong>{{ t('contributions.review-table.repository') }}:</strong>
                <span class="ml-1">{{ slotProps.data.repoId }}</span></span
              >
              <span
                ><strong>{{ t('contributions.review-table.tag') }}:</strong>
                <span class="ml-1">{{ slotProps.data.releaseId }}</span></span
              >
              <span
                ><strong>{{ t('contributions.review-table.date') }}:</strong>
                <span class="ml-1">{{
                  formatDate(slotProps.data.createdAt, {
                    lang: store.state.lang,
                    includeTime: true
                  })
                }}</span></span
              >
            </div>
            <p>{{ slotProps.data.comment }}</p>
          </div>
        </template>
      </data-table>
      <MyReviewsChart v-if="showChart" v-model="reviews" />
      <EditReviewPopup
        v-if="showEditReviewPopup"
        v-model:showEditReviewPopup="showEditReviewPopup"
        v-model:reviews="reviews"
        :review="selectedReview"
      />
      <DeleteReviewPopup
        v-if="showDeleteReviewPopup"
        v-model:showDeleteReviewPopup="showDeleteReviewPopup"
        v-model:reviews="reviews"
        :review="selectedReview"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import Restricted from '@/components/common/Restricted.vue'
import { useI18n } from 'vue-i18n'
import { computed, onBeforeMount, ref, type Ref } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MyReviewsChart from '@/components/my_reviews/MyReviewsChart.vue'
import EditReviewPopup from '@/components/my_reviews/EditReviewPopup.vue'
import DeleteReviewPopup from '@/components/my_reviews/DeleteReviewPopup.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import type { ReviewResponseDto } from '@/types/models/review'
import { useReview } from '@/composables/review'
import { useToast } from 'primevue/usetoast'
import { useDataTableFilter } from '@/composables/dataTableFilter'
import Message from 'primevue/message'
import Rating from 'primevue/rating'
import { formatDate } from '@/utils/formatDate'

const { t } = useI18n()
const store = useAppStore()
const toast = useToast()
const router = useRouter()

const { filters, expandedRows, clearFilter, toggleRow } = useDataTableFilter()
const { reviews, fetchUserReviews } = useReview()
const isFetching: Ref<boolean> = ref(false)
const isUserLogged: Ref<boolean> = computed(() => store.state.isLogged)
// platformUserId is the Auth Service UUID stored after login (matches authorId in reviews)
const userUid: Ref<string> = computed(() => store.state.platformUserId)
const isEmailVerified: Ref<boolean> = computed(() => store.state.appUserCredentials.emailVerified)
const showEditReviewPopup: Ref<boolean> = ref(false)
const showDeleteReviewPopup: Ref<boolean> = ref(false)
const selectedReview = ref<ReviewResponseDto>({} as ReviewResponseDto)

const showChart = computed<boolean>(() => {
  return reviews.value.length > 0 && !filters.value.global.value && !isFetching.value
})

onBeforeMount(async () => {
  if (!isUserLogged.value) {
    return
  }
  try {
    isFetching.value = true
    await fetchUserReviews(userUid.value)
  } catch {
    toast.add({
      severity: 'error',
      summary: t('contributions.message.fetch-reviews-failure'),
      life: 4000
    })
  } finally {
    isFetching.value = false
  }
})

const emit = defineEmits<{
  (e: 'row-expand', event: { data: any; index: number }): void
  (e: 'row-collapse', event: { data: any; index: number }): void
}>()

const handleRowClick = (event: { data: any; index: number }) => {
  const rowKey = (event.data.id ?? event.data._id ?? '').toString()
  const wasExpanded = !!expandedRows.value[rowKey]
  toggleRow(rowKey)
  if (wasExpanded) {
    emit('row-collapse', event)
  } else {
    emit('row-expand', event)
  }
}
</script>
<style scoped></style>
