<template>
  <div class="translations-import-container">
    <!-- Header Section -->
    <div class="header-section mb-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Import Translations</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Bulk import translations from Excel or CSV files
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-arrow-left"
          size="default"
          variant="outlined"
          @click="$router.push('/admin/translations')"
        >
          Back to Management
        </v-btn>
      </div>
    </div>

    <!-- Instructions Card -->
    <v-card variant="flat" class="mb-6" elevation="1">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-information</v-icon>
        File Format Instructions
      </v-card-title>
      <v-card-text>
        <div class="mb-4">
          <p class="text-body-1 mb-3">
            Upload an Excel (.xlsx, .xls) or CSV file with the following columns:
          </p>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>key</code></td>
                <td><v-chip size="small" color="error">Required</v-chip></td>
                <td>Translation key (e.g., <code>add_vehicle_title</code>)</td>
              </tr>
              <tr>
                <td><code>default_value</code></td>
                <td><v-chip size="small" color="error">Required</v-chip></td>
                <td>Default English value</td>
              </tr>
              <tr>
                <td><code>en</code></td>
                <td><v-chip size="small" color="success">Optional</v-chip></td>
                <td>English translation (uses default_value if empty)</td>
              </tr>
              <tr>
                <td><code>da</code></td>
                <td><v-chip size="small" color="success">Optional</v-chip></td>
                <td>Danish translation</td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          <strong>Example CSV format:</strong>
          <pre class="mt-2 mb-0" style="font-size: 0.875rem;">key,default_value,en,da
add_vehicle_title,Add Vehicle,Add Vehicle,Tilføj Køretøj
validation_required,This field is required,This field is required,Dette felt er påkrævet</pre>
        </v-alert>

        <v-alert type="warning" variant="tonal" density="compact">
          <strong>Note:</strong> Existing translations with the same key will be updated. New keys will be created.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Upload Card -->
    <v-card variant="flat" elevation="1">
      <v-card-title>Upload File</v-card-title>
      <v-card-text>
        <v-file-input
          v-model="importFile"
          label="Select Excel or CSV file"
          accept=".xlsx,.xls,.csv"
          variant="outlined"
          density="comfortable"
          prepend-icon="mdi-file"
          show-size
          :disabled="importing"
          class="mb-4"
        >
          <template #prepend-inner>
            <v-icon>mdi-file-upload</v-icon>
          </template>
        </v-file-input>

        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-upload"
          :loading="importing"
          :disabled="!importFile"
          @click="handleImport"
          block
        >
          Import Translations
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Results Card -->
    <v-card
      v-if="importResult"
      variant="flat"
      class="mt-6"
      elevation="1"
      :color="importResult.errors?.length > 0 ? 'warning' : 'success'"
    >
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">{{ importResult.errors?.length > 0 ? 'mdi-alert' : 'mdi-check-circle' }}</v-icon>
        Import Results
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <div class="text-center pa-4" style="background: rgba(255,255,255,0.1); border-radius: 8px;">
              <div class="text-h4 font-weight-bold">{{ importResult.created }}</div>
              <div class="text-body-2">Keys Created</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="text-center pa-4" style="background: rgba(255,255,255,0.1); border-radius: 8px;">
              <div class="text-h4 font-weight-bold">{{ importResult.updated }}</div>
              <div class="text-body-2">Translations Updated</div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="text-center pa-4" style="background: rgba(255,255,255,0.1); border-radius: 8px;">
              <div class="text-h4 font-weight-bold">{{ importResult.errors?.length || 0 }}</div>
              <div class="text-body-2">Errors</div>
            </div>
          </v-col>
        </v-row>

        <v-alert
          v-if="importResult.errors?.length > 0"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          <div class="font-weight-semibold mb-2">Errors encountered:</div>
          <ul class="mb-0" style="padding-left: 1.5rem;">
            <li v-for="(error, index) in importResult.errors" :key="index" class="mb-1">
              {{ error }}
            </li>
          </ul>
        </v-alert>

        <div v-else class="mt-4">
          <v-alert type="success" variant="tonal" density="compact">
            Import completed successfully! All translations have been processed.
          </v-alert>
        </div>

        <div class="mt-4 d-flex gap-2">
          <v-btn
            color="primary"
            variant="outlined"
            @click="importFile = null; importResult = null"
          >
            Import Another File
          </v-btn>
          <v-btn
            color="primary"
            @click="$router.push('/admin/translations')"
          >
            View Translations
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { translationService } from '@/services/translationService'

const importFile = ref<File | null>(null)
const importing = ref(false)
const importResult = ref<{
  created: number
  updated: number
  errors: string[]
} | null>(null)

async function handleImport() {
  if (!importFile.value) return

  importing.value = true
  importResult.value = null

  try {
    const result = await translationService.importTranslations(importFile.value)
    if (result.success && result.data) {
      importResult.value = result.data
    }
  } catch (error: any) {
    console.error('Error importing translations:', error)
    importResult.value = {
      created: 0,
      updated: 0,
      errors: [error?.response?.data?.message || error?.message || 'Import failed'],
    }
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.translations-import-container {
  padding: 24px;
}

.header-section {
  margin-bottom: 24px;
}

pre {
  background: rgba(0, 0, 0, 0.1);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
