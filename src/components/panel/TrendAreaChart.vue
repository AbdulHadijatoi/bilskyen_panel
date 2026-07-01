<template>
  <div class="trend-area-chart" :style="{ height: `${height}px` }">
    <div v-if="!points.length" class="trend-area-chart__empty">
      <span>{{ emptyText }}</span>
    </div>
    <VChart v-else :option="chartOption" autoresize class="trend-area-chart__canvas" />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import { buildAreaLineChartOption, type TrendPoint } from '@/utils/chartTheme'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])
provide(THEME_KEY, 'light')

interface Props {
  points: TrendPoint[]
  color?: string
  height?: number
  valueLabel?: string
  emptyText?: string
  formatValue?: (value: number) => string
  formatDate?: (date: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  height: 200,
  emptyText: 'No data',
  color: '#03418b',
})

const chartOption = computed(() =>
  buildAreaLineChartOption(props.points, {
    color: props.color,
    valueLabel: props.valueLabel,
    formatValue: props.formatValue,
    formatDate: props.formatDate,
  }),
)
</script>

<style scoped>
.trend-area-chart {
  width: 100%;
  position: relative;
}

.trend-area-chart__canvas {
  width: 100%;
  height: 100%;
}

.trend-area-chart__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: var(--radius-lg);
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 0.8125rem;
}
</style>
