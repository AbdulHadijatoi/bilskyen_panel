<template>
  <div v-if="!collapsed" class="panel-sidebar-search">
    <Search :size="14" class="panel-sidebar-search__icon" />
    <input
      :value="modelValue"
      type="search"
      class="panel-sidebar-search__input"
      :placeholder="placeholder"
      @input="onInput"
    />
    <kbd class="panel-sidebar-search__kbd">⌘F</kbd>
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

interface Props {
  modelValue: string
  collapsed?: boolean
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  collapsed: false,
  placeholder: 'Search...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
