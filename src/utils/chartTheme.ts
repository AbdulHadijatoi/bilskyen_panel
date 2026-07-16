export interface TrendPoint {
  date: string
  count: number
}

export function getChartColor(varName: string, fallback = '#03418b'): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return value || fallback
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return `rgba(37, 99, 235, ${alpha})`
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function buildAreaLineChartOption(
  points: TrendPoint[],
  options: {
    color?: string
    valueLabel?: string
    formatValue?: (value: number) => string
    formatDate?: (date: string) => string
  } = {},
) {
  const color = options.color ?? getChartColor('--primary', '#03418b')
  const formatValue = options.formatValue ?? ((v: number) => String(v))
  const formatDate = options.formatDate ?? ((d: string) => d)
  const valueLabel = options.valueLabel ?? 'Count'
  const values = points.map((p) => p.count)
  const dates = points.map((p) => p.date)

  return {
    grid: { left: 4, right: 12, top: 16, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    yAxis: {
      type: 'value',
      show: true,
      min: 0,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: 'var(--border)', type: 'dashed', opacity: 0.6 },
      },
      axisLabel: {
        show: true,
        color: 'var(--muted-foreground)',
        fontSize: 11,
        formatter: (value: number) => formatValue(value),
      },
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)',
      borderWidth: 1,
      textStyle: { color: 'var(--foreground)', fontSize: 12 },
      formatter: (params: Array<{ axisValue: string; value: number }>) => {
        const point = params[0]
        if (!point) return ''
        return `<div style="font-weight:600;margin-bottom:4px">${formatDate(point.axisValue)}</div>
          <div>${valueLabel}: <strong>${formatValue(point.value)}</strong></div>`
      },
    },
    series: [
      {
        type: 'line',
        data: values,
        smooth: 0.45,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        emphasis: { focus: 'series', showSymbol: true },
        lineStyle: { color, width: 2.5 },
        itemStyle: { color, borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(color.startsWith('#') ? color : '#03418b', 0.28) },
              { offset: 1, color: hexToRgba(color.startsWith('#') ? color : '#03418b', 0.02) },
            ],
          },
        },
      },
    ],
  }
}
