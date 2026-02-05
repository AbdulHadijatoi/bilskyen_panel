<template>
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card
      variant="flat"
      elevation="0"
      :style="{ border: '1px solid rgba(0, 0, 0, 0.12)' }"
    >
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
        Remove Staff Member
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <div class="mb-4">
          <p class="text-body-2 mb-2">
            Are you sure you want to remove this staff member from your dealer?
          </p>
          
          <v-card
            variant="flat"
            elevation="0"
            :style="{ border: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: 'rgba(0, 0, 0, 0.02)' }"
            class="pa-3 mb-4"
          >
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2" size="20">mdi-account</v-icon>
              <span class="text-body-2 font-weight-medium">{{ staffMember?.name || 'N/A' }}</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2" size="20">mdi-email</v-icon>
              <span class="text-body-2">{{ staffMember?.email || 'N/A' }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon class="mr-2" size="20">mdi-account-cog</v-icon>
              <span class="text-body-2">{{ getRoleName(staffMember?.membership_role_id) }}</span>
            </div>
          </v-card>

          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            <div class="text-caption">
              <strong>Warning:</strong> This action will remove the staff member's access to your dealer account. 
              They will no longer be able to manage vehicles, leads, or access dealer features.
            </div>
          </v-alert>
        </div>

        <!-- Error Message -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          density="compact"
          class="mt-4"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="close"
          :disabled="deleting"
        >
          Cancel
        </v-btn>
        <v-btn
          color="error"
          variant="outlined"
          :loading="deleting"
          :disabled="deleting"
          @click="handleDelete"
        >
          {{ deleting ? 'Removing...' : 'Remove Staff' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { removeStaff } from '@/api/staff.api'

export interface StaffMember {
  id: number
  name: string
  email: string
  membership_role_id: number
}

const props = defineProps<{
  modelValue: boolean
  staffMember: StaffMember | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const dialog = ref(props.modelValue)
const deleting = ref(false)
const error = ref<string | null>(null)

// Get role name from ID
const getRoleName = (roleId?: number): string => {
  if (!roleId) return 'N/A'
  const roleMap: Record<number, string> = {
    1: 'Owner',
    2: 'Manager',
    3: 'Staff',
  }
  return roleMap[roleId] || 'Unknown'
}

// Watch for prop changes
watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
  if (!newVal) {
    resetDialog()
  }
})

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    resetDialog()
  }
})

// Reset dialog
const resetDialog = () => {
  error.value = null
  deleting.value = false
}

// Close dialog
const close = () => {
  dialog.value = false
}

// Handle delete
const handleDelete = async () => {
  if (!props.staffMember) {
    return
  }

  deleting.value = true
  error.value = null

  try {
    await removeStaff(props.staffMember.id)
    emit('success')
    close()
  } catch (err: any) {
    console.error('Failed to remove staff:', err)
    error.value = err?.message || 'Failed to remove staff member. Please try again.'
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
:deep(.v-field__prepend-inner) {
  padding-top: 0 !important;
}
</style>
