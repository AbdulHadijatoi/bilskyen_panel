<template>
  <div class="d-flex flex-column" style="gap: 1rem; width: 100%;">
    <DealerDashboardHeader />
    <FinancialOverviewChart />

    <div class="d-grid dashboard-cards-grid" style="grid-template-columns: repeat(1, 1fr); gap: 2rem; padding-top: 1rem; width: 100%;">
      <VehiclesOverviewCard />
      <SalesOverviewCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import DealerDashboardHeader from '@/components/dealer/dashboard/DealerDashboardHeader.vue'
import FinancialOverviewChart from '@/components/dealer/dashboard/FinancialOverviewChart.vue'
import VehiclesOverviewCard from '@/components/dealer/dashboard/VehiclesOverviewCard.vue'
import SalesOverviewCard from '@/components/dealer/dashboard/SalesOverviewCard.vue'
</script>

<style scoped>
.d-grid {
  display: grid;
}

.dashboard-cards-grid {
  display: grid !important;
  width: 100% !important;
}

@media (min-width: 1024px) {
  .dashboard-cards-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
</style>
