<template>
  <PanelShellHeader>
    <template #actions>
      <LanguageSwitcher />
      <NotificationsButton />
    </template>
  </PanelShellHeader>
</template>

<script setup lang="ts">
import PanelShellHeader from '@/components/panel/PanelShellHeader.vue'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher.vue'
import NotificationsButton from './NotificationsButton.vue'
</script>
