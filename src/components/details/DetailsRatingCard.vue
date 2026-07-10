<template>
  <div class="lsg-card p-5">
    <div class="mb-4 flex items-center gap-4">
      <div class="flex items-baseline gap-1">
        <span
          class="text-5xl font-bold text-[var(--primary-color)]"
          style="text-shadow: 0 0 12px var(--primary-color-50)"
        >
          {{ formattedAverage }}
        </span>
        <span class="text-xl text-[var(--text-color-light)]">/5</span>
      </div>
      <font-awesome-icon
        :icon="['fas', 'star']"
        class="text-3xl text-[var(--primary-color)]"
        style="filter: drop-shadow(0 0 6px var(--primary-color-60))"
      />
    </div>

    <button
      class="mb-5 cursor-pointer text-sm text-[var(--text-color-light)] transition-colors duration-300 hover:text-[var(--primary-color)]"
      @click="emit('scrollToReviews')"
    >
      {{ t('details.total-reviews', { count: totalReviews }) }}
    </button>

    <div class="flex flex-col gap-2">
      <div
        v-for="level in starLevels"
        :key="level.star"
        class="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2"
      >
        <span class="text-right text-sm font-semibold text-[var(--text-color-light)]">
          {{ level.star }}&#9733;
        </span>
        <div class="h-3 overflow-hidden rounded-sm bg-white/10">
          <div
            class="h-full rounded-sm transition-all duration-700 ease-out"
            :style="{
              width: `${level.percentage}%`,
              background: barGradient(level.star)
            }"
          />
        </div>
        <span class="text-left text-xs text-[var(--text-color-light)]">
          {{ level.percentage }}%
        </span>
      </div>
    </div>

    <div v-if="isLoggedIn && props.canReview" class="mt-5">
      <Button :label="t('details.write-review')" class="w-full" @click="emit('writeReview')">
        <template #icon>
          <font-awesome-icon :icon="['fas', 'pen']" class="mr-2" />
        </template>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Button from 'primevue/button'
import { key } from '@/store/index'

interface RatingLevel {
  star: number
  count: number
}

interface Props {
  averageRating: number
  totalReviews: number
  ratingDistribution?: RatingLevel[]
  canReview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  ratingDistribution: () => [],
  canReview: false
})

const emit = defineEmits<{
  scrollToReviews: []
  writeReview: []
}>()

const { t } = useI18n()
const store = useStore(key)

const mounted = ref(false)
onMounted(() => {
  // Trigger bar animation after render
  setTimeout(() => {
    mounted.value = true
  }, 50)
})

const isLoggedIn = computed(() => store.state.isLogged)

const formattedAverage = computed(() =>
  props.totalReviews > 0 ? props.averageRating.toFixed(1) : '--'
)

const starLevels = computed(() => {
  const levels: Array<{ star: number; count: number; percentage: number }> = []
  for (let s = 5; s >= 1; s--) {
    const found = props.ratingDistribution?.find((r) => r.star === s)
    const count = found?.count ?? 0
    const pct = props.totalReviews > 0 ? Math.round((count / props.totalReviews) * 100) : 0
    levels.push({
      star: s,
      count,
      percentage: mounted.value ? pct : 0
    })
  }
  return levels
})

function barGradient(star: number): string {
  if (star >= 4) return 'linear-gradient(90deg, #fa5e15, #ff8c42)'
  if (star === 3) return 'linear-gradient(90deg, #c4842d, #dba04e)'
  return 'linear-gradient(90deg, #6b5b3e, #8a7550)'
}
</script>
