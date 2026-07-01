<template>
  <PanelShellHeader>
    <template #actions>
      <NotificationsButton />
    </template>
  </PanelShellHeader>
</template>

<script setup lang="ts">
import PanelShellHeader from '@/components/panel/PanelShellHeader.vue'
import NotificationsButton from './NotificationsButton.vue'
</script>
