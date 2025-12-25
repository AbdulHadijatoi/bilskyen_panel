<template>
  <div>
    <div class="mb-4">
      <h2 class="text-h5 font-weight-bold mb-1">Admin Dashboard</h2>
      <p class="text-body-2 text-medium-emphasis">
        Overview of system statistics and recent activity.
      </p>
    </div>

    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card variant="outlined">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-1">Total Users</div>
            <div class="text-h4 font-weight-bold">{{ stats.totalUsers || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card variant="outlined">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-1">Total Dealers</div>
            <div class="text-h4 font-weight-bold">{{ stats.totalDealers || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card variant="outlined">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-1">Total Vehicles</div>
            <div class="text-h4 font-weight-bold">{{ stats.totalVehicles || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card variant="outlined">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-1">Active Subscriptions</div>
            <div class="text-h4 font-weight-bold">{{ stats.activeSubscriptions || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card variant="outlined">
      <v-card-text>
        <p class="text-center text-medium-emphasis py-8">
          Dashboard statistics and charts will be implemented here
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stats = ref({
  totalUsers: 0,
  totalDealers: 0,
  totalVehicles: 0,
  activeSubscriptions: 0,
})

onMounted(() => {
  // Load dashboard statistics
  // TODO: Implement API calls to load statistics
})
</script>

