<template>
  <div class="financial-overview-card" :style="{ border: 'none', backgroundColor: 'transparent', padding: 0 }">
    <div class="financial-overview-header" :style="{ padding: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }">
      <div class="d-flex align-center flex-wrap" style="gap: 0.5rem;">
        <div class="d-flex flex-column flex-1" style="gap: 0.25rem;">
          <h2 class="text-xl font-semibold mb-0" style="line-height: 1.5;">Financial Overview</h2>
          <p class="text-sm mb-0" style="color: var(--muted-foreground);">
            Showing financial metrics for the last {{ granularity }}.
          </p>
        </div>

        <v-select
          v-model="granularity"
          :items="periods"
          density="compact"
          variant="outlined"
          hide-details
          style="max-width: 120px;"
        />
      </div>

      <FinancialOverviewCards :period="granularity" />
    </div>

    <div class="financial-overview-content" :style="{ padding: '2rem 0', paddingBottom: '2rem' }">
      <div v-if="loading || chartData.length === 0" class="d-flex align-center justify-center" :style="{ height: '250px', width: '100%', backgroundColor: 'var(--muted)', borderRadius: '0.5rem' }">
        <p class="text-sm" style="color: var(--muted-foreground);">
          {{ loading ? 'Loading chart data...' : 'No financial overview data available.' }}
        </p>
      </div>
      <div
        v-else
        ref="chartContainer"
        :style="{ height: '250px', width: '100%', minHeight: '250px', position: 'relative' }"
      >
        <VChart
          :option="chartOption"
          :style="{ height: '100%', width: '100%' }"
          autoresize
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import axios from 'axios'
import FinancialOverviewCards from './FinancialOverviewCards.vue'
import { API_DEALER_BASE } from '@/constants/app'
import { provide } from 'vue'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

provide(THEME_KEY, 'dark')

interface ChartDataPoint {
  periodStart: string
  revenue: number
  expense: number
  netProfit: number
  profitMargin: number
}

const granularity = ref<'week' | 'month' | 'quarter' | 'year'>('year')
const periods = [
  { title: 'Week', value: 'week' },
  { title: 'Month', value: 'month' },
  { title: 'Quarter', value: 'quarter' },
  { title: 'Year', value: 'year' },
]

const chartData = ref<ChartDataPoint[]>([])
const loading = ref(true)
const chartContainer = ref<HTMLElement | null>(null)

const formatCurrency = (value: number) => {
  return `${value.toLocaleString('da-DK', { maximumFractionDigits: 0 })} kr.`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  if (granularity.value === 'year') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getCssVariableRgb = (varName: string) => {
  if (typeof window === 'undefined') return 'rgb(59, 130, 246)'
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  const tempEl = document.createElement('div')
  tempEl.style.color = value
  document.body.appendChild(tempEl)
  const rgb = getComputedStyle(tempEl).color
  document.body.removeChild(tempEl)
  return rgb || 'rgb(59, 130, 246)'
}

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const rgbToHex = (rgb: string) => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  if (!match || !match[1] || !match[2] || !match[3]) return '#3b82f6'
  return '#' + [1, 2, 3].map(i => {
    const hex = parseInt(match[i]!).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

const chartOption = computed(() => {
  const data = chartData.value
  
  const chart1Rgb = getCssVariableRgb('--chart-1')
  const chart2Rgb = getCssVariableRgb('--chart-2')
  const chart3Rgb = getCssVariableRgb('--chart-3')
  const chart4Rgb = getCssVariableRgb('--chart-4')
  
  const chart1Hex = rgbToHex(chart1Rgb)
  const chart2Hex = rgbToHex(chart2Rgb)
  const chart3Hex = rgbToHex(chart3Rgb)
  const chart4Hex = rgbToHex(chart4Rgb)

  return {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.periodStart),
      boundaryGap: false,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: true,
        color: 'var(--muted-foreground)',
        fontSize: 12,
        formatter: (value: string) => formatDate(value),
        margin: 8,
      },
    },
    yAxis: {
      type: 'value',
      show: false,
      splitLine: {
        show: true,
        lineStyle: {
          color: 'var(--border)',
          opacity: 0.5,
          type: 'solid',
        },
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'var(--popover)',
      borderColor: 'var(--border)',
      textStyle: {
        color: 'var(--popover-foreground)',
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'var(--border)',
        },
      },
      formatter: (params: any) => {
        const date = formatDate(params[0].axisValue)
        let content = `<div style="margin-bottom: 4px; font-weight: 500;">${date}</div>`
        params.forEach((param: any) => {
          const value = param.value
          const formattedValue =
            param.seriesName === 'Profit Margin'
              ? `${parseFloat(String(value)).toFixed(1)}%`
              : formatCurrency(parseInt(String(value)))
          content += `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background-color: ${param.color};"></span>
              <span>${param.seriesName}</span>
              <span style="margin-left: auto; font-weight: 500; font-family: monospace;">${formattedValue}</span>
            </div>
          `
        })
        return content
      },
    },
    legend: {
      show: true,
      bottom: 0,
      itemGap: 20,
      textStyle: {
        color: 'var(--foreground)',
        fontSize: 12,
      },
      icon: 'rect',
      itemWidth: 12,
      itemHeight: 12,
    },
    series: [
      {
        name: 'Revenue',
        type: 'line',
        stack: 'total',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(chart1Hex, 0.6) },
              { offset: 1, color: hexToRgba(chart1Hex, 0.1) },
            ],
          },
        },
        lineStyle: {
          color: chart1Rgb,
          width: 0,
        },
        data: data.map((d) => d.revenue),
        smooth: true,
      },
      {
        name: 'Expense',
        type: 'line',
        stack: 'total',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(chart2Hex, 0.6) },
              { offset: 1, color: hexToRgba(chart2Hex, 0.1) },
            ],
          },
        },
        lineStyle: {
          color: chart2Rgb,
          width: 0,
        },
        data: data.map((d) => d.expense),
        smooth: true,
      },
      {
        name: 'Net Profit',
        type: 'line',
        stack: 'total',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(chart3Hex, 0.6) },
              { offset: 1, color: hexToRgba(chart3Hex, 0.1) },
            ],
          },
        },
        lineStyle: {
          color: chart3Rgb,
          width: 0,
        },
        data: data.map((d) => d.netProfit),
        smooth: true,
      },
      {
        name: 'Profit Margin',
        type: 'line',
        stack: 'total',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(chart4Hex, 0.6) },
              { offset: 1, color: hexToRgba(chart4Hex, 0.1) },
            ],
          },
        },
        lineStyle: {
          color: chart4Rgb,
          width: 0,
        },
        data: data.map((d) => d.profitMargin),
        smooth: true,
      },
    ],
  }
})

const fetchChartData = async () => {
  try {
    loading.value = true
    const response = await axios.get<ChartDataPoint[]>(
      `/api${API_DEALER_BASE}/accounting/get-financial-overview-chart?granularity=${granularity.value}`
    )
    chartData.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching chart data:', error)
    chartData.value = []
  } finally {
    loading.value = false
  }
}

watch(() => granularity.value, fetchChartData, { immediate: true })
</script>

<style scoped>
:deep(.echarts) {
  width: 100% !important;
  height: 100% !important;
}
</style>

