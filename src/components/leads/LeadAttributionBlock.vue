<template>
  <div class="lead-attribution-block">
    <div class="d-flex align-center gap-2 mb-3">
      <span class="text-caption text-medium-emphasis">{{ t('common.leadAttribution.marketingAttribution') }}</span>
      <v-chip
        size="small"
        variant="flat"
        :color="getLeadTrafficChannelColor(lead)"
      >
        {{ getLeadTrafficChannelLabel(lead) }}
      </v-chip>
    </div>

    <template v-if="hasLeadAttribution(lead)">
      <v-row dense>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <div class="text-caption text-medium-emphasis mb-1">{{ t('common.leadAttribution.utmSource') }}</div>
            <div class="text-body-2">{{ lead.utmSource || t('common.na') }}</div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <div class="text-caption text-medium-emphasis mb-1">{{ t('common.leadAttribution.utmMedium') }}</div>
            <div class="text-body-2">{{ lead.utmMedium || t('common.na') }}</div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <div class="text-caption text-medium-emphasis mb-1">{{ t('common.leadAttribution.utmCampaign') }}</div>
            <div class="text-body-2">{{ lead.utmCampaign || t('common.na') }}</div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <div class="text-caption text-medium-emphasis mb-1">{{ t('common.leadAttribution.referrer') }}</div>
            <div class="text-body-2">
              <a
                v-if="lead.referrerUrl"
                :href="lead.referrerUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary text-truncate d-inline-block"
                style="max-width: 100%;"
              >
                {{ lead.referrerUrl }}
              </a>
              <span v-else>{{ t('common.na') }}</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </template>
    <p v-else class="text-body-2 text-medium-emphasis mb-0">
      {{ t('common.leadAttribution.noAttribution') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { LeadModel } from '@/models/lead.model'
import {
  getLeadTrafficChannelColor,
  getLeadTrafficChannelLabel,
  hasLeadAttribution,
} from '@/utils/leadHelpers'
import { useI18n } from 'vue-i18n'

defineProps<{
  lead: LeadModel
}>()

const { t } = useI18n()
</script>
