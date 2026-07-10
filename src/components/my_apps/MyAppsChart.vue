<template>
  <section class="chart">
    <header>
      <h2>Application Type</h2>
      <p>{{ totalPublications }} Total Applications</p>
    </header>
    <PieChart
      :key="theme"
      :library="pieLibrary"
      :data="[
        ['Videogame', videogameCount],
        ['Extension', extensionCount]
      ]"
      :messages="{ empty: t('status.no-data') }"
      :colors="['#FA5E15', '#018ABE']"
    />
  </section>
</template>
<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChartTheme } from '@/composables/useChartTheme'
import PieChart from '@/components/common/PieChart.vue'
import type { Repository } from '@/types/models/repository'

const { t } = useI18n()
const { theme, pieLibrary } = useChartTheme()

const videogameCount = ref(0)
const extensionCount = ref(0)

const publications = defineModel({
  type: Array<Repository>,
  required: true
})
const totalPublications = computed(() => publications.value.length)

onBeforeMount(() => {
  videogameCount.value = publications.value.filter((pub: any) => pub.type === 'videogame').length
  extensionCount.value = publications.value.filter((pub: any) => pub.type === 'extension').length
})
</script>
<style scoped></style>
