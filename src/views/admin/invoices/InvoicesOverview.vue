<template>
  <div class="invoices-overview">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium mb-1">{{ t('admin.views.invoices.title') }}</h1>
        <p class="text-body-2 text-medium-emphasis">{{ t('admin.views.invoices.subtitle') }}</p>
      </div>
    </div>

    <v-card variant="flat" class="mb-4">
      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              :label="t('common.status')"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleFilterChange"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

    <v-card variant="flat">
      <v-data-table-server
        :headers="headers"
        :items="invoices"
        :items-length="totalDocs"
        :loading="loading"
        :items-per-page="limit"
        @update:page="handlePageChange"
      >
        <template #item.dealer="{ item }">
          {{ item.dealer?.name || `#${item.dealer_id}` }}
        </template>
        <template #item.period="{ item }">
          {{ formatDate(item.period_start) }} – {{ formatDate(item.period_end) }}
        </template>
        <template #item.total_cents="{ item }">
          {{ formatMoney(item.total_cents, item.currency) }}
        </template>
        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="small" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex gap-1 justify-center">
            <v-btn icon="mdi-eye" size="x-small" variant="text" @click="openDetail(item)" />
            <v-btn
              v-if="item.status === 'draft'"
              icon="mdi-send"
              size="x-small"
              variant="text"
              color="primary"
              :loading="actionId === item.id && actionType === 'sent'"
              @click="markSent(item)"
            />
            <v-btn
              v-if="item.status === 'sent' || item.status === 'overdue'"
              icon="mdi-check"
              size="x-small"
              variant="text"
              color="success"
              :loading="actionId === item.id && actionType === 'paid'"
              @click="markPaid(item)"
            />
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="showDetail" max-width="720">
      <v-card v-if="selectedInvoice">
        <v-card-title class="pa-4">
          {{ t('admin.views.invoices.invoice') }} #{{ selectedInvoice.id }}
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <div class="mb-2">
            <strong>{{ t('admin.views.invoices.dealer') }}:</strong>
            {{ selectedInvoice.dealer?.name || `#${selectedInvoice.dealer_id}` }}
          </div>
          <div class="mb-2">
            <strong>{{ t('admin.views.invoices.period') }}:</strong>
            {{ formatDate(selectedInvoice.period_start) }} – {{ formatDate(selectedInvoice.period_end) }}
          </div>
          <div class="mb-4">
            <strong>{{ t('admin.views.invoices.total') }}:</strong>
            {{ formatMoney(selectedInvoice.total_cents, selectedInvoice.currency) }}
          </div>
          <v-table v-if="selectedInvoice.lines?.length" density="compact">
            <thead>
              <tr>
                <th>{{ t('admin.views.invoices.lineDescription') }}</th>
                <th>{{ t('admin.views.invoices.lineAmount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in selectedInvoice.lines" :key="line.id">
                <td>{{ line.description || line.vehicle?.title || `#${line.vehicle_id}` }}</td>
                <td>{{ formatMoney(line.total_cents ?? 0, selectedInvoice.currency) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showDetail = false">{{ t('common.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getDealerInvoices,
  getDealerInvoice,
  markDealerInvoiceSent,
  markDealerInvoicePaid,
  type DealerInvoiceModel,
} from '@/api/admin.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const invoices = ref<DealerInvoiceModel[]>([])
const totalDocs = ref(0)
const currentPage = ref(1)
const limit = 15
const statusFilter = ref<string | null>(null)
const showDetail = ref(false)
const selectedInvoice = ref<DealerInvoiceModel | null>(null)
const actionId = ref<number | null>(null)
const actionType = ref<'sent' | 'paid' | null>(null)

const statusOptions = [
  { title: 'Draft', value: 'draft' },
  { title: 'Sent', value: 'sent' },
  { title: 'Paid', value: 'paid' },
  { title: 'Overdue', value: 'overdue' },
]

const headers = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: 'Dealer', key: 'dealer' },
  { title: 'Period', key: 'period' },
  { title: 'Total', key: 'total_cents', width: '140px' },
  { title: 'Status', key: 'status', width: '120px' },
  { title: 'Actions', key: 'actions', width: '140px', align: 'center' as const, sortable: false },
]

function formatDate(value?: string | null): string {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

function formatMoney(cents: number, currency = 'DKK'): string {
  return `${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`
}

function statusColor(status: string): string {
  return ({ draft: 'grey', sent: 'info', paid: 'success', overdue: 'error' } as Record<string, string>)[status] || 'grey'
}

async function loadInvoices() {
  try {
    loading.value = true
    error.value = null
    const response = await getDealerInvoices({
      page: currentPage.value,
      limit,
      status: statusFilter.value || undefined,
    })
    invoices.value = response.docs
    totalDocs.value = response.totalDocs ?? 0
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load invoices'
  } finally {
    loading.value = false
  }
}

function handleFilterChange() {
  currentPage.value = 1
  loadInvoices()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadInvoices()
}

async function openDetail(invoice: DealerInvoiceModel) {
  try {
    selectedInvoice.value = await getDealerInvoice(invoice.id)
    showDetail.value = true
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to load invoice'
  }
}

async function markSent(invoice: DealerInvoiceModel) {
  actionId.value = invoice.id
  actionType.value = 'sent'
  try {
    await markDealerInvoiceSent(invoice.id)
    await loadInvoices()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to mark invoice as sent'
  } finally {
    actionId.value = null
    actionType.value = null
  }
}

async function markPaid(invoice: DealerInvoiceModel) {
  actionId.value = invoice.id
  actionType.value = 'paid'
  try {
    await markDealerInvoicePaid(invoice.id)
    await loadInvoices()
  } catch (err) {
    error.value = (err as ApiErrorModel).message || 'Failed to mark invoice as paid'
  } finally {
    actionId.value = null
    actionType.value = null
  }
}

onMounted(loadInvoices)
</script>
