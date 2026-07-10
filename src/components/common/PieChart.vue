<template>
  <div :id="chartId" :style="chartStyle"></div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import Chartkick from 'vue-chartkick'
import { Chart, registerables } from 'chart.js'

// Chart.js is registered here (not in main.js) so the charting code is bundled
// into this lazily-loaded chunk instead of the entry bundle.
Chart.register(...registerables)
Chartkick.use(Chart)

const props = defineProps<{
  data: unknown
  colors?: string[]
  library?: Record<string, unknown>
  messages?: Record<string, string>
  height?: string
  width?: string
}>()

const chartId = `pie-chart-${Math.random().toString(36).slice(2)}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chart: any = null

const chartStyle = computed(() => ({
  height: props.height ?? '300px',
  width: props.width ?? '100%'
}))

// Chart.js hangs the main thread computing NaN arc angles when a pie's values sum to 0.
// Collapse that case to [] so Chartkick renders the empty message instead.
const chartData = computed(() => {
  const data = props.data
  if (data === undefined || data === null) {
    return []
  }
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every((pair) => Array.isArray(pair) && Number(pair[1]) <= 0)
  ) {
    return []
  }
  return data
})

// Deep-clone everything handed to Chart.js so it writes its internal state onto a detached
// copy, never onto Vue's reactive objects. Passing reactive data lets Chart.js mutate it,
// which retriggers the deep watcher endlessly: dev caps the recursion, prod just hangs.
function detach<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function buildOptions() {
  const options: Record<string, unknown> = {}
  if (props.colors) options.colors = detach(props.colors)
  // maintainAspectRatio:false with a fixed-height container also avoids Chart.js' resize feedback loop.
  options.library = detach({ maintainAspectRatio: false, ...(props.library ?? {}) })
  if (props.messages) options.messages = detach(props.messages)
  return options
}

function renderChart() {
  const data = detach(chartData.value)
  if (chart) {
    chart.updateData(data, buildOptions())
  } else {
    chart = new Chartkick.PieChart(chartId, data, buildOptions())
  }
}

onMounted(renderChart)
// Watch a serialized snapshot (not the live reactive objects) so Chart.js' own internal
// mutations can never retrigger this watcher.
watch(() => JSON.stringify([chartData.value, props.colors, props.library]), renderChart)
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>
