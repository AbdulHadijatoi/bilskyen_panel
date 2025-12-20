<template>
  <div class="password-input-wrapper">
    <v-text-field
      :model-value="modelValue"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      :id="id"
      :tabindex="tabindex"
      variant="outlined"
      density="compact"
      hide-details="auto"
      class="password-input"
      @update:model-value="$emit('update:modelValue', $event)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    <v-btn
      type="button"
      variant="text"
      size="small"
      class="password-toggle-btn"
      :disabled="!modelValue || disabled"
      @click="togglePassword"
      icon
    >
      <v-icon v-if="showPassword && modelValue && !disabled" size="20">
        mdi-eye
      </v-icon>
      <v-icon v-else size="20">
        mdi-eye-off
      </v-icon>
      <span class="sr-only">
        {{ showPassword ? 'Hide password' : 'Show password' }}
      </span>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  autocomplete?: string
  id?: string
  tabindex?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  autocomplete: 'current-password',
  id: undefined,
  tabindex: undefined,
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-toggle-btn {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  height: 100%;
  padding: 0 0.75rem;
  min-width: auto;
}

.password-toggle-btn:hover {
  background-color: transparent !important;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Hide browser password toggles */
:deep(.password-input input[type="password"]::-ms-reveal),
:deep(.password-input input[type="password"]::-ms-clear) {
  display: none;
}
</style>

