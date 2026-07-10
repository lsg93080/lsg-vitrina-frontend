<template>
  <div class="flex w-full flex-col items-start">
    <!-- Mobile trigger (hidden on md+) -->
    <div class="flex w-full items-center gap-2 md:hidden">
      <Button variant="outlined" class="gap-2" @click="showMobileFilters = true">
        <font-awesome-icon :icon="['fas', 'filter']" />
        {{ t('store.filters.change') }}
        <Badge v-if="activeFilterCount > 0" :value="activeFilterCount" severity="warn" />
      </Button>
      <Button
        v-if="showClearButton"
        class="ml-auto"
        :label="t('store.filters.clear')"
        variant="outlined"
        @click="setDefault()"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'filter-circle-xmark']" />
        </template>
      </Button>
    </div>

    <Dialog
      v-model:visible="showMobileFilters"
      modal
      :draggable="false"
      :dismissableMask="true"
      :header="t('store.filters.title')"
      :style="{ width: 'min(480px, 95vw)' }"
      :contentStyle="{ overflowY: 'auto', maxHeight: '65vh' }"
    >
      <div class="flex flex-col gap-5 text-start">
        <section>
          <header>
            <h3>{{ t('store.filters.date') }}</h3>
          </header>
          <div class="flex flex-col">
            <label for="m-startDate">{{ t('store.filters.date-since') }}</label>
            <DatePicker
              inputId="m-startDate"
              v-model="startDate"
              showIcon
              iconDisplay="input"
              :minDate="defaultStartDate"
              :maxDate="endDate"
              view="year"
              dateFormat="yy"
              fluid
              inputClass="text-center"
            />
            <label class="pt-2" for="m-endDate">{{ t('store.filters.date-until') }}</label>
            <DatePicker
              v-model="endDate"
              showIcon
              iconDisplay="input"
              inputId="m-endDate"
              :minDate="startDate"
              :maxDate="defaultEndDate"
              view="year"
              dateFormat="yy"
              fluid
              inputClass="text-center"
            />
          </div>
        </section>
        <Divider class="!my-0" />
        <section>
          <header class="flex items-start justify-start gap-2 pb-0">
            <Checkbox
              name="m-filter-types"
              inputId="m-all-types"
              :model-value="areAllTypesSelected"
              @value-change="(v) => (v ? selectAll('type') : clearFilter('type'))"
              binary
            />
            <label for="m-all-types" class="font-bold">{{ t('store.filters.type') }}</label>
          </header>
          <div class="space-x-2 pl-2" v-for="appType in APP_TYPES" :key="appType.id">
            <Checkbox
              name="m-filter-types"
              :inputId="`m-${appType.label}`"
              :value="appType"
              v-model="selectedTypes"
              class="checkbox-list"
            />
            <label :for="`m-${appType.label}`">{{ appType.name }}</label>
          </div>
        </section>
        <Divider class="!my-0" />
        <section>
          <header class="flex items-start justify-start gap-2 pb-0">
            <Checkbox
              name="m-filter-esrb"
              inputId="m-all-esrb"
              :model-value="areAllESRBSelected"
              @value-change="(v) => (v ? selectAll('esrb') : clearFilter('esrb'))"
              binary
            />
            <label for="m-all-esrb" class="font-bold">{{ t('store.filters.esrb') }}</label>
            <InfoTooltip :text="t('store.filters.esrb-tooltip')" />
          </header>
          <div class="space-x-2 pl-2" v-for="esrb in ESRB_RATINGS" :key="esrb.id">
            <Checkbox
              name="m-filter-esrb"
              :inputId="`m-${esrb.name}`"
              :value="esrb"
              v-model="selectedESRB"
              class="checkbox-list"
            />
            <label :for="`m-${esrb.name}`">{{ t('esrb.' + esrb.label) }}</label>
          </div>
        </section>
        <Divider class="!my-0" />
        <section>
          <header class="flex items-start justify-start gap-2 pb-0">
            <Checkbox
              name="m-filter-platforms"
              inputId="m-all-platforms"
              :model-value="areAllPlatformsSelected"
              @value-change="(v) => (v ? selectAll('platforms') : clearFilter('platforms'))"
              binary
            />
            <label for="m-all-platforms" class="font-bold">{{ t('store.filters.platform') }}</label>
          </header>
          <div class="space-x-2 pl-2" v-for="platform in PLATFORMS" :key="platform.id">
            <Checkbox
              name="m-filter-platforms"
              :inputId="`m-${platform.name}`"
              :value="platform"
              v-model="selectedPlatforms"
              class="checkbox-list"
            />
            <label :for="`m-${platform.name}`">{{ platform.name }}</label>
          </div>
        </section>
        <Divider class="!my-0" />
        <section class="flex flex-col">
          <header class="flex items-start justify-start gap-2 pb-0.5">
            <label class="font-bold">{{ t('store.filters.tags') }}</label>
            <InfoTooltip :text="t('store.filters.tags-tooltip')" />
          </header>
          <InputText
            v-model="inputTag"
            :maxlength="20"
            :placeholder="t('store.filters.tags-placeholder')"
            @keydown.enter="
              () => {
                store.commit('mutateTag', inputTag)
                inputTag = ''
                updateQuery()
                emit('on-search')
              }
            "
            fluid
          />
          <Chip
            v-if="selectedTag != ''"
            :label="selectedTag"
            class="mt-1 ml-2 w-fit leading-1 capitalize"
            removable
            @remove="
              () => {
                store.commit('mutateTag', '')
                updateQuery()
                emit('on-search')
              }
            "
          />
        </section>
      </div>
      <template #footer>
        <Button
          v-if="showClearButton"
          :label="t('store.filters.clear')"
          variant="outlined"
          @click="setDefault()"
        >
          <template #icon>
            <font-awesome-icon :icon="['fas', 'filter-circle-xmark']" />
          </template>
        </Button>
      </template>
    </Dialog>

    <!-- Desktop header (hidden below md) -->
    <header class="hidden w-full gap-2 md:flex">
      <Button
        v-tooltip="t(`store.filters.tooltip-${showFilters ? 'hide' : 'show'}`)"
        variant="outlined"
        class="gap-2"
        @click="showFilters = !showFilters"
      >
        <font-awesome-icon :icon="['fas', 'filter']" />
        {{ t('store.filters.title') }}
        <Badge v-if="activeFilterCount > 0" :value="activeFilterCount" severity="warn" />
        <font-awesome-icon :icon="['fas', showFilters ? 'chevron-up' : 'chevron-down']" />
      </Button>
      <Button
        v-if="showClearButton"
        class="ml-auto self-end"
        :label="t('store.filters.clear')"
        variant="outlined"
        @click="setDefault()"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'filter-circle-xmark']" />
        </template>
      </Button>
    </header>

    <!-- Desktop filter panel (hidden below md) -->
    <div v-if="showFilters" class="hidden w-full gap-4 pt-4 text-start md:flex">
      <section class="w-[150px]">
        <header>
          <h3>{{ t('store.filters.date') }}</h3>
        </header>
        <div class="flex flex-col">
          <label for="startDate">{{ t('store.filters.date-since') }}</label>
          <DatePicker
            inputId="startDate"
            v-model="startDate"
            :defaultValue="defaultStartDate"
            showIcon
            iconDisplay="input"
            :minDate="defaultStartDate"
            :maxDate="endDate"
            view="year"
            dateFormat="yy"
            fluid
            inputClass="text-center"
          />
          <label class="pt-2" for="endDate">{{ t('store.filters.date-until') }}</label>
          <DatePicker
            v-model="endDate"
            :defaultValue="defaultEndDate"
            showIcon
            iconDisplay="input"
            inputId="endDate"
            :minDate="startDate"
            :maxDate="defaultEndDate"
            view="year"
            dateFormat="yy"
            fluid
            inputClass="text-center"
          />
        </div>
      </section>
      <section>
        <header class="flex items-start justify-start gap-2 pb-0">
          <Checkbox
            name="filter-types"
            inputId="all-types"
            :model-value="areAllTypesSelected"
            @value-change="(v) => (v ? selectAll('type') : clearFilter('type'))"
            binary
          />
          <label for="all-types" class="font-bold">{{ t('store.filters.type') }}</label>
        </header>
        <div class="space-x-2 pl-2" v-for="appType in APP_TYPES" :key="appType.id">
          <Checkbox
            name="filter-types"
            :inputId="appType.label"
            :value="appType"
            v-model="selectedTypes"
            class="checkbox-list"
          />
          <label :for="appType.label">{{ appType.name }}</label>
        </div>
      </section>
      <section>
        <header class="flex items-start justify-start gap-2 pb-0">
          <Checkbox
            name="filter-esrb"
            inputId="all-esrb"
            :model-value="areAllESRBSelected"
            @value-change="(v) => (v ? selectAll('esrb') : clearFilter('esrb'))"
            binary
          />
          <label for="all-esrb" class="font-bold">{{ t('store.filters.esrb') }}</label>
          <InfoTooltip :text="t('store.filters.esrb-tooltip')" />
        </header>
        <div class="space-x-2 pl-2" v-for="esrb in ESRB_RATINGS" :key="esrb.id">
          <Checkbox
            name="filter-esrb"
            :inputId="esrb.name"
            :value="esrb"
            v-model="selectedESRB"
            class="checkbox-list"
          />
          <label :for="esrb.name">{{ t('esrb.' + esrb.label) }}</label>
        </div>
      </section>
      <section>
        <header class="flex items-start justify-start gap-2 pb-0">
          <Checkbox
            name="filter-platforms"
            inputId="all-platforms"
            :model-value="areAllPlatformsSelected"
            @value-change="(v) => (v ? selectAll('platforms') : clearFilter('platforms'))"
            binary
          />
          <label for="all-platforms" class="font-bold">{{ t('store.filters.platform') }}</label>
        </header>
        <div class="space-x-2 pl-2" v-for="platform in PLATFORMS" :key="platform.id">
          <Checkbox
            name="filter-platforms"
            :inputId="platform.name"
            :value="platform"
            v-model="selectedPlatforms"
            class="checkbox-list"
          />
          <label :for="platform.name">{{ platform.name }}</label>
        </div>
      </section>
      <section class="flex flex-col flex-wrap">
        <header class="flex items-start justify-start gap-2 pb-0.5">
          <label class="font-bold">{{ t('store.filters.tags') }}</label>
          <InfoTooltip :text="t('store.filters.tags-tooltip')" />
        </header>
        <InputText
          v-model="inputTag"
          :maxlength="20"
          :placeholder="t('store.filters.tags-placeholder')"
          @keydown.enter="
            () => {
              store.commit('mutateTag', inputTag)
              inputTag = ''
              updateQuery()
              emit('on-search')
            }
          "
          fluid
        />
        <Chip
          v-if="selectedTag != ''"
          :label="selectedTag"
          class="mt-1 ml-2 w-fit leading-1 capitalize"
          removable
          @remove="
            () => {
              store.commit('mutateTag', '')
              updateQuery()
              emit('on-search')
            }
          "
        ></Chip>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Chip from 'primevue/chip'
import InputText from 'primevue/inputtext'
import InfoTooltip from '@/components/common/InfoTooltip.vue'
import type { Platform } from '@/types/models/platform'
import type { ESRB } from '@/types/models/esrb'
import type { AppType } from '@/types/models/appType'
import { ESRB_RATINGS } from '@/catalogs/esrbRatings'
import { PLATFORMS } from '@/catalogs/platforms'
import { APP_TYPES } from '@/catalogs/appTypes'

const store = useAppStore()
const { t } = useI18n()
const router = useRouter()

const selectedTypes = ref<AppType[]>([])
const selectedESRB = ref<ESRB[]>([])
const selectedPlatforms = ref<Platform[]>([])
const showFilters = ref(true)
const showMobileFilters = ref(false)
const mounted = ref(false)
const defaultStartDate = new Date(2019, 0)
const defaultEndDate = new Date()

const showClearButton = computed(() => {
  return (
    selectedTypes.value.length !== APP_TYPES.length ||
    selectedESRB.value.length !== ESRB_RATINGS.length ||
    selectedPlatforms.value.length !== PLATFORMS.length ||
    startDate.value.getFullYear() !== defaultStartDate.getFullYear() ||
    endDate.value.getFullYear() !== defaultEndDate.getFullYear() ||
    store.state.selectedTag.length > 0
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (selectedTypes.value.length < APP_TYPES.length) count++
  if (selectedESRB.value.length < ESRB_RATINGS.length) count++
  if (selectedPlatforms.value.length < PLATFORMS.length) count++
  if (startDate.value.getFullYear() !== defaultStartDate.getFullYear()) count++
  if (endDate.value.getFullYear() !== defaultEndDate.getFullYear()) count++
  if (store.state.selectedTag.length > 0) count++
  return count
})

const areAllTypesSelected = computed(() => selectedTypes.value.length === APP_TYPES.length)
const areAllESRBSelected = computed(() => selectedESRB.value.length === ESRB_RATINGS.length)
const areAllPlatformsSelected = computed(() => selectedPlatforms.value.length === PLATFORMS.length)

const state = computed(() => store.state)
const tags = computed(() => state.value.tags)
const inputTag = ref('')
const selectedTag = computed<string>(() => state.value.selectedTag)
const emit = defineEmits(['on-search'])

const startDate = ref(new Date(2019, 0))
const endDate = ref(new Date())

onMounted(() => {
  const query = router.currentRoute.value.query

  // Restore filter state from URL query params if any are present
  const hasUrlParams =
    query.yearFrom || query.yearTo || query['types[]'] || query['esrb[]'] || query['platforms[]']

  if (hasUrlParams) {
    // Restore date range from year values
    if (query.yearFrom) {
      startDate.value = new Date(Number(query.yearFrom), 0)
    }
    if (query.yearTo) {
      endDate.value = new Date(Number(query.yearTo), 0)
    }

    // Restore types: match URL labels against APP_TYPES catalog
    if (query['types[]']) {
      const typeValues = Array.isArray(query['types[]']) ? query['types[]'] : [query['types[]']]
      selectedTypes.value = APP_TYPES.filter((t) => typeValues.includes(t.label))
    } else {
      selectedTypes.value = [...APP_TYPES]
    }

    // Restore ESRB ratings: match URL labels against ESRB_RATINGS catalog
    if (query['esrb[]']) {
      const esrbValues = Array.isArray(query['esrb[]']) ? query['esrb[]'] : [query['esrb[]']]
      selectedESRB.value = ESRB_RATINGS.filter((e) => esrbValues.includes(e.label ?? ''))
    } else {
      selectedESRB.value = [...ESRB_RATINGS]
    }

    // Restore platforms: URL stores enum values ('macos', 'windows', etc.), match against catalog
    if (query['platforms[]']) {
      const platformValues = Array.isArray(query['platforms[]'])
        ? query['platforms[]']
        : [query['platforms[]']]
      selectedPlatforms.value = PLATFORMS.filter((p) => platformValues.includes(p.value))
    } else {
      selectedPlatforms.value = [...PLATFORMS]
    }

    updateQuery()
    mounted.value = true
    emit('on-search')
  } else {
    // No URL params: default to all filters selected
    selectAll('all')
    store.commit('mutateTag', '')
    mounted.value = true
  }
})

const clearFilter = (type: string) => {
  if (type === 'type') selectedTypes.value = []
  else if (type === 'esrb') selectedESRB.value = []
  else if (type === 'platforms') selectedPlatforms.value = []
  updateQuery()
}

const selectAll = (type: string) => {
  if (type === 'platforms') {
    selectedPlatforms.value = [...PLATFORMS]
  } else if (type === 'type') {
    selectedTypes.value = [...APP_TYPES]
  } else if (type === 'esrb') {
    selectedESRB.value = [...ESRB_RATINGS]
  } else {
    selectedPlatforms.value = [...PLATFORMS]
    selectedESRB.value = [...ESRB_RATINGS]
    selectedTypes.value = [...APP_TYPES]
    startDate.value = new Date(defaultStartDate)
    endDate.value = new Date(defaultEndDate)
  }
  updateQuery()
}

const setDefault = () => {
  selectAll('all')
  store.commit('mutateTag', '')
  emit('on-search')
}

defineExpose({ setDefault })

const updateQuery = () => {
  const newQuery = {
    ...store.state.filterQuery,
    types: selectedTypes.value,
    esrb: selectedESRB.value,
    platforms: selectedPlatforms.value,
    selectedTag: selectedTag.value,
    yearFrom: startDate.value.getFullYear(),
    yearTo: endDate.value.getFullYear()
  }
  store.commit('mutateQuery', newQuery)

  // Sync current filter state to URL query params for shareable, persistent URLs.
  // Only push params that differ from the full default selection to keep URLs clean.
  const urlParams: Record<string, string | string[]> = {}

  if (selectedTypes.value.length > 0 && selectedTypes.value.length < APP_TYPES.length) {
    urlParams['types[]'] = selectedTypes.value.map((t) => t.label)
  }

  if (selectedESRB.value.length > 0 && selectedESRB.value.length < ESRB_RATINGS.length) {
    urlParams['esrb[]'] = selectedESRB.value.map((e) => e.label ?? '')
  }

  if (selectedPlatforms.value.length > 0 && selectedPlatforms.value.length < PLATFORMS.length) {
    urlParams['platforms[]'] = selectedPlatforms.value.map((p) => p.value)
  }

  const currentYear = defaultEndDate.getFullYear()
  if (startDate.value.getFullYear() !== defaultStartDate.getFullYear()) {
    urlParams.yearFrom = String(startDate.value.getFullYear())
  }

  if (endDate.value.getFullYear() !== currentYear) {
    urlParams.yearTo = String(endDate.value.getFullYear())
  }

  // Replace current route query without changing the route name
  router.replace({ query: urlParams })
}

watch([selectedESRB, selectedPlatforms, selectedTypes, startDate, endDate], () => {
  updateQuery()
  if (mounted.value) {
    emit('on-search')
  }
})
</script>
<style scoped>
h3 {
  font-weight: bold;
}

.checkbox-list {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: -14px;
    left: -5px;
    z-index: -1;
    height: 130%;
    width: 100%;
    border: 1px solid var(--p-checkbox-border-color);
    border-width: 0 0 1px 1px;
    border-radius: 0 3px;
  }
}
</style>
