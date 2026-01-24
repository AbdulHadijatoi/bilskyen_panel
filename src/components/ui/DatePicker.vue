<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    transition="scale-transition"
    location="bottom"
    min-width="auto"
    max-width="300"
  >
    <template #activator="{ props: menuProps }">
      <v-text-field
        v-bind="menuProps"
        :model-value="displayValue"
        :label="label"
        :rules="rules"
        :readonly="readonly"
        :disabled="disabled"
        :hint="hint"
        :persistent-hint="persistentHint"
        density="compact"
        variant="outlined"
        prepend-inner-icon="mdi-calendar"
        clearable
        @click:clear="handleClear"
      />
    </template>
    <v-card>
      <v-card-text class="pa-2">
        <div class="date-picker-calendar">
          <div class="calendar-header d-flex justify-space-between align-center mb-2">
            <v-btn
              icon
              size="small"
              variant="text"
              @click="previousMonth"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <div class="text-subtitle-2 font-weight-medium">
              {{ currentMonthYear }}
            </div>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="nextMonth"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
          <div class="calendar-weekdays d-flex mb-1">
            <div
              v-for="day in weekDays"
              :key="day"
              class="weekday text-caption text-center"
            >
              {{ day }}
            </div>
          </div>
          <div class="calendar-days">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="calendar-day"
              :class="{
                'day-other-month': day.otherMonth,
                'day-selected': day.selected,
                'day-today': day.today,
              }"
              @click="selectDate(day.date)"
            >
              {{ day.day }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue?: string
  label?: string
  rules?: any[]
  readonly?: boolean
  disabled?: boolean
  hint?: string
  persistentHint?: boolean
  min?: string
  max?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  rules: () => [],
  readonly: false,
  disabled: false,
  hint: '',
  persistentHint: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const menuOpen = ref(false)
const currentDate = ref(new Date())

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const currentMonthYear = computed(() => {
  return `${months[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
})

const selectedDate = computed(() => {
  if (!props.modelValue) return null
  if (props.modelValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(props.modelValue + 'T00:00:00')
  }
  return null
})

const today = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days: Array<{
    day: number
    date: Date
    otherMonth: boolean
    selected: boolean
    today: boolean
  }> = []
  
  const current = new Date(startDate)
  for (let i = 0; i < 42; i++) {
    const date = new Date(current)
    const isOtherMonth = date.getMonth() !== month
    const isSelected = selectedDate.value && 
      date.getFullYear() === selectedDate.value.getFullYear() &&
      date.getMonth() === selectedDate.value.getMonth() &&
      date.getDate() === selectedDate.value.getDate()
    const isToday = date.getTime() === today.value.getTime()
    
    days.push({
      day: date.getDate(),
      date,
      otherMonth: isOtherMonth,
      selected: isSelected || false,
      today: isToday,
    })
    
    current.setDate(current.getDate() + 1)
  }
  
  return days
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  // Format YYYY-MM-DD to a readable format
  if (props.modelValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(props.modelValue + 'T00:00:00')
    if (isNaN(date.getTime())) return props.modelValue
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  return props.modelValue
})

const selectDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  emit('update:modelValue', dateStr)
  menuOpen.value = false
}

const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const handleClear = () => {
  emit('update:modelValue', '')
}

// Initialize currentDate to selected date or today
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(newValue + 'T00:00:00')
    if (!isNaN(date.getTime())) {
      currentDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
    }
  }
}, { immediate: true })
</script>

<style scoped>
.date-picker-calendar {
  width: 100%;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.weekday {
  padding: 0.5rem;
  font-weight: 500;
  color: var(--muted-foreground);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: var(--foreground);
}

.calendar-day:hover:not(.day-other-month) {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

.calendar-day.day-other-month {
  color: var(--muted-foreground);
  opacity: 0.5;
}

.calendar-day.day-selected {
  background-color: var(--primary);
  color: var(--primary-foreground);
  font-weight: 500;
}

.calendar-day.day-today {
  border: 1px solid var(--primary);
}

.calendar-day.day-today.day-selected {
  border-color: var(--primary-foreground);
}
</style>
