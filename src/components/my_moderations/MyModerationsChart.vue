<template>
  <div class="chart">
    <p class="chart__title">Review Veredicts (%)</p>
    <PieChart
      class="chart__pie"
      :key="theme"
      :library="pieLibrary"
      :data="[
        [t('contributions.approved'), counts.safeCount],
        [t('contributions.denied'), counts.unsafeCount],
        [t('contributions.pending'), counts.pendingCount]
      ]"
      :messages="{ empty: t('status.no-data') }"
    />
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useChartTheme } from '@/composables/useChartTheme'
import PieChart from '@/components/common/PieChart.vue'

const { t } = useI18n()
const { theme, pieLibrary } = useChartTheme()

const counts = defineModel({
  type: Object as () => {
    safeCount: number
    unsafeCount: number
    pendingCount: number
  },
  required: true
})
</script>
<style scoped></style>
