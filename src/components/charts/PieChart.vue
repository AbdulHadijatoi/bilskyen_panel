<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  data: ChartData<'pie'>
  options?: ChartOptions<'pie'>
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: ChartJS<'pie'> | null = null

onMounted(() => {
  if (chartCanvas.value) {
    chartInstance = new ChartJS(chartCanvas.value, {
      type: 'pie',
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right' as const,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || ''
                const value = context.parsed || 0
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
        ...props.options,
      },
    })
  }
})

watch(
  () => props.data,
  () => {
    if (chartInstance) {
      chartInstance.data = props.data
      chartInstance.update()
    }
  },
  { deep: true }
)

watch(
  () => props.options,
  () => {
    if (chartInstance && props.options) {
      chartInstance.options = { ...chartInstance.options, ...props.options }
      chartInstance.update()
    }
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
