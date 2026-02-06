<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  data: ChartData<'line'>
  options?: ChartOptions<'line'>
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: ChartJS<'line'> | null = null

onMounted(() => {
  if (chartCanvas.value) {
    chartInstance = new ChartJS(chartCanvas.value, {
      type: 'line',
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            border: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          y: {
            display: true,
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            border: {
              color: 'rgba(0, 0, 0, 0.1)',
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
