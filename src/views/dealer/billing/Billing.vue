<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-medium mb-1">{{ t('dealer.views.billing.title') }}</h1>
        <p class="text-body-2 text-medium-emphasis">{{ t('dealer.views.billing.subtitle') }}</p>
      </div>
    </div>

    <v-alert
      v-if="route.query.payment === 'success'"
      type="success"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ t('dealer.views.billing.paymentSuccess') }}
    </v-alert>

    <v-alert
      v-if="route.query.payment === 'cancelled'"
      type="info"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ t('dealer.views.billing.paymentCancelled') }}
    </v-alert>

    <v-alert
      v-if="!billingConfig?.stripe_enabled"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      {{ t('dealer.views.billing.stripeDisabled') }}
    </v-alert>

    <v-card variant="elevated" elevation="1" class="mb-6">
      <v-card-title class="pa-4">{{ t('dealer.views.billing.invoices') }}</v-card-title>
      <v-card-text class="pa-0">
        <div v-if="loadingInvoices" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <v-table v-else-if="invoices.length > 0" density="comfortable">
          <thead>
            <tr>
              <th>{{ t('dealer.views.billing.invoiceId') }}</th>
              <th>{{ t('dealer.views.billing.period') }}</th>
              <th>{{ t('dealer.views.billing.amount') }}</th>
              <th>{{ t('dealer.views.billing.status') }}</th>
              <th>{{ t('dealer.views.billing.dueDate') }}</th>
              <th class="text-end">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in invoices" :key="invoice.id">
              <td>#{{ invoice.id }}</td>
              <td>
                <span v-if="invoice.period_start && invoice.period_end">
                  {{ formatDate(invoice.period_start) }} — {{ formatDate(invoice.period_end) }}
                </span>
                <span v-else>—</span>
              </td>
              <td>{{ formatCents(invoice.total_cents, invoice.currency || 'DKK') }}</td>
              <td>
                <v-chip :color="invoiceStatusColor(invoice.status)" size="small" variant="tonal">
                  {{ invoice.status }}
                </v-chip>
              </td>
              <td>{{ invoice.due_at ? formatDate(invoice.due_at) : '—' }}</td>
              <td class="text-end">
                <v-btn
                  v-if="canPayInvoice(invoice)"
                  color="primary"
                  size="small"
                  variant="flat"
                  :loading="payingInvoiceId === invoice.id"
                  @click="payInvoice(invoice.id)"
                >
                  {{ t('dealer.views.billing.payNow') }}
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div v-else class="text-center py-8 text-medium-emphasis">
          {{ t('dealer.views.billing.noInvoices') }}
        </div>
      </v-card-text>
    </v-card>

    <v-card variant="elevated" elevation="1">
      <v-card-title class="pa-4">{{ t('dealer.views.billing.paymentHistory') }}</v-card-title>
      <v-card-text class="pa-0">
        <div v-if="loadingPayments" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <v-table v-else-if="payments.length > 0" density="comfortable">
          <thead>
            <tr>
              <th>{{ t('dealer.views.billing.date') }}</th>
              <th>{{ t('dealer.views.billing.purpose') }}</th>
              <th>{{ t('dealer.views.billing.amount') }}</th>
              <th>{{ t('dealer.views.billing.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td>{{ payment.created_at ? formatDate(payment.created_at) : '—' }}</td>
              <td>{{ payment.purpose }}</td>
              <td>{{ formatCents(payment.amount_cents, payment.currency) }}</td>
              <td>
                <v-chip :color="paymentStatusColor(payment.status)" size="small" variant="tonal">
                  {{ payment.status }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div v-else class="text-center py-8 text-medium-emphasis">
          {{ t('dealer.views.billing.noPayments') }}
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  getBillingConfig,
  getBillingInvoices,
  getPaymentHistory,
  checkoutInvoice,
  type DealerBillingConfig,
  type DealerInvoiceModel,
  type DealerPaymentModel,
} from '@/api/dealer.api'
import type { ApiErrorModel } from '@/models/api-error.model'

const { t, locale } = useI18n()
const route = useRoute()

const billingConfig = ref<DealerBillingConfig | null>(null)
const invoices = ref<DealerInvoiceModel[]>([])
const payments = ref<DealerPaymentModel[]>([])
const loadingInvoices = ref(false)
const loadingPayments = ref(false)
const payingInvoiceId = ref<number | null>(null)
const error = ref<string | null>(null)

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(locale.value === 'da' ? 'da-DK' : 'en-GB')
}

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat(locale.value === 'da' ? 'da-DK' : 'en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function canPayInvoice(invoice: DealerInvoiceModel) {
  if (!billingConfig.value?.stripe_enabled) return false
  if (invoice.total_cents <= 0) return false
  return ['sent', 'overdue'].includes(invoice.status)
}

function invoiceStatusColor(status: string) {
  if (status === 'paid') return 'success'
  if (status === 'overdue') return 'error'
  if (status === 'sent') return 'warning'
  return 'default'
}

function paymentStatusColor(status: string) {
  if (status === 'completed' || status === 'succeeded') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'failed') return 'error'
  return 'default'
}

async function loadConfig() {
  billingConfig.value = await getBillingConfig()
}

async function loadInvoices() {
  loadingInvoices.value = true
  try {
    const result = await getBillingInvoices({ limit: 50 })
    invoices.value = result.docs || []
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedLoadInvoices')
  } finally {
    loadingInvoices.value = false
  }
}

async function loadPayments() {
  loadingPayments.value = true
  try {
    const result = await getPaymentHistory({ limit: 50 })
    payments.value = result.docs || []
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('common.errors.failedLoadPayments')
  } finally {
    loadingPayments.value = false
  }
}

async function payInvoice(invoiceId: number) {
  payingInvoiceId.value = invoiceId
  try {
    const result = await checkoutInvoice(invoiceId)
    window.location.href = result.checkout_url
  } catch (err) {
    error.value = (err as ApiErrorModel).message || t('dealer.views.billing.checkoutFailed')
    payingInvoiceId.value = null
  }
}

onMounted(async () => {
  await Promise.all([loadConfig(), loadInvoices(), loadPayments()])
})
</script>
