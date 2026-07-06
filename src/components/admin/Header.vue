<template>
  <PanelShellHeader>
    <template #actions>
      <LanguageSwitcher />
    </template>
  </PanelShellHeader>
</template>

<script setup lang="ts">
import PanelShellHeader from '@/components/panel/PanelShellHeader.vue'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher.vue'
</script>
