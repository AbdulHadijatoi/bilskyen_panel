<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">
          {{ editingItem ? `Edit ${title}` : `Create ${title}` }}
        </h2>
        <button
          class="close-button"
          @click="$emit('update:modelValue', false)"
          :disabled="loading"
        >
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div class="form-group" v-if="showBrand">
          <label class="form-label">Brand</label>
          <v-select
            v-model="formData.brand_id"
            :items="brands"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :disabled="loading"
            hide-details
            class="form-select"
          />
        </div>

        <div class="form-group" v-if="showEquipmentType">
          <label class="form-label">Equipment Type</label>
          <v-select
            v-model="formData.equipment_type_id"
            :items="equipmentTypes"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :disabled="loading"
            hide-details
            class="form-select"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            Name
            <span class="required">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ error: formData.name === '' && formTouched }"
            placeholder="Enter name"
            :disabled="loading"
            @blur="formTouched = true"
          />
          <p v-if="formData.name === '' && formTouched" class="form-error">
            Name is required
          </p>
        </div>
      </div>

      <div class="dialog-actions">
        <button
          class="dialog-button cancel"
          @click="$emit('update:modelValue', false)"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          class="dialog-button submit"
          @click="handleSubmit"
          :disabled="!isValid || loading"
        >
          <v-progress-circular
            v-if="loading"
            indeterminate
            size="16"
            width="2"
            color="white"
            class="mr-2"
          />
          <span>{{ editingItem ? 'Update' : 'Create' }}</span>
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ConstantModel, VehicleModelConstant, EquipmentConstant } from '@/api/admin.api'

interface Props {
  modelValue: boolean
  title: string
  editingItem?: ConstantModel | VehicleModelConstant | EquipmentConstant | null
  loading?: boolean
  brands?: ConstantModel[]
  equipmentTypes?: ConstantModel[]
  showBrand?: boolean
  showEquipmentType?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editingItem: null,
  loading: false,
  brands: () => [],
  equipmentTypes: () => [],
  showBrand: false,
  showEquipmentType: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: { name: string; brand_id?: number; equipment_type_id?: number }]
}>()

const formData = ref<{
  name: string
  brand_id?: number
  equipment_type_id?: number
}>({
  name: '',
  brand_id: undefined,
  equipment_type_id: undefined,
})

const formTouched = ref(false)

const isValid = computed(() => {
  return !!formData.value.name && 
    (!props.showBrand || !!formData.value.brand_id) &&
    (!props.showEquipmentType || !!formData.value.equipment_type_id)
})

watch(() => props.editingItem, (item) => {
  if (item) {
    formData.value = {
      name: item.name,
      brand_id: 'brand_id' in item ? item.brand_id : undefined,
      equipment_type_id: 'equipment_type_id' in item ? item.equipment_type_id : undefined,
    }
    formTouched.value = false
  } else {
    formData.value = {
      name: '',
      brand_id: undefined,
      equipment_type_id: undefined,
    }
    formTouched.value = false
  }
}, { immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    formData.value = {
      name: '',
      brand_id: undefined,
      equipment_type_id: undefined,
    }
    formTouched.value = false
  }
})

const handleSubmit = () => {
  formTouched.value = true
  if (isValid.value) {
    const submitData: { name: string; brand_id?: number; equipment_type_id?: number } = {
      name: formData.value.name,
    }
    if (props.showBrand && formData.value.brand_id) {
      submitData.brand_id = formData.value.brand_id
    }
    if (props.showEquipmentType && formData.value.equipment_type_id) {
      submitData.equipment_type_id = formData.value.equipment_type_id
    }
    emit('submit', submitData)
  }
}
</script>

<style scoped>
.dialog-container {
  background: var(--background);
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(var(--v-border-opacity), var(--v-border-opacity));
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--foreground);
  letter-spacing: -0.01em;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.6);
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: var(--foreground);
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
  margin-bottom: 0.5rem;
}

.required {
  color: rgb(var(--v-theme-error));
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(var(--v-border-opacity), var(--v-border-opacity));
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: var(--background);
  color: var(--foreground);
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.form-input.error {
  border-color: rgb(var(--v-theme-error));
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-error), 0.1);
}

.form-error {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-error));
  margin: 0.375rem 0 0 0;
}

.form-select {
  width: 100%;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(var(--v-border-opacity), var(--v-border-opacity));
}

.dialog-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.dialog-button.cancel {
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.dialog-button.cancel:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: var(--foreground);
}

.dialog-button.cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-button.submit {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.dialog-button.submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.dialog-button.submit:active:not(:disabled) {
  transform: translateY(0);
}

.dialog-button.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
