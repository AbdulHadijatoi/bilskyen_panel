<template>
  <v-dialog
    :model-value="settingsStore.isOpen"
    max-width="900"
    scrollable
    @update:model-value="handleDialogUpdate"
  >
    <v-card class="panel-settings-modal">
      <div class="panel-settings-modal__header">
        <div class="panel-settings-modal__title-row">
          <v-icon size="20">mdi-cog</v-icon>
          <h2 class="panel-settings-modal__title">{{ t('nav.settings') }}</h2>
        </div>
        <button
          type="button"
          class="panel-settings-modal__close"
          :aria-label="t('common.close')"
          @click="settingsStore.close()"
        >
          <v-icon size="18">mdi-close</v-icon>
        </button>
      </div>

      <div class="panel-settings-modal__body">
        <SettingsNav
          v-model="settingsStore.activeSection"
          :groups="navGroups"
        />
        <div class="panel-settings-modal__content">
          <div class="panel-settings-modal__content-header">
            <v-icon size="20" class="panel-settings-modal__content-icon">{{ activeItem?.icon }}</v-icon>
            <h3 class="panel-settings-modal__content-title">{{ activeItem?.label }}</h3>
          </div>
          <ProfilePanel v-if="settingsStore.activeSection === 'profile'" />
          <PasswordPanel v-else-if="settingsStore.activeSection === 'password'" />
          <SessionsPanel v-else-if="settingsStore.activeSection === 'sessions'" />
          <PlatformSettingsPanel v-else-if="settingsStore.activeSection === 'platform'" />
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsModalStore } from '@/stores/settingsModal'
import SettingsNav, { type SettingsNavGroup } from '@/components/settings/SettingsNav.vue'
import ProfilePanel from '@/components/settings/panels/ProfilePanel.vue'
import PasswordPanel from '@/components/settings/panels/PasswordPanel.vue'
import SessionsPanel from '@/components/settings/panels/SessionsPanel.vue'
import PlatformSettingsPanel from '@/components/settings/panels/PlatformSettingsPanel.vue'
import { isAdmin } from '@/utils/permissions'

const { t } = useI18n()
const settingsStore = useSettingsModalStore()

const navGroups = computed<SettingsNavGroup[]>(() => {
  const groups: SettingsNavGroup[] = [
    {
      title: t('settings.nav.account'),
      items: [
        { id: 'profile', label: t('settings.nav.profile'), icon: 'mdi-account' },
        { id: 'password', label: t('nav.changePassword'), icon: 'mdi-lock-reset' },
        { id: 'sessions', label: t('dealer.views.sessions.title'), icon: 'mdi-devices' },
      ],
    },
  ]

  if (isAdmin()) {
    groups.push({
      title: t('settings.nav.platform'),
      items: [
        { id: 'platform', label: t('settings.nav.localization'), icon: 'mdi-translate' },
      ],
    })
  }

  return groups
})

const activeItem = computed(() =>
  navGroups.value.flatMap((g) => g.items).find((item) => item.id === settingsStore.activeSection)
)

function handleDialogUpdate(value: boolean) {
  if (!value) {
    settingsStore.close()
  }
}
</script>

<style scoped>
.panel-settings-modal {
  border-radius: var(--radius-xl) !important;
  overflow: hidden;
}

.panel-settings-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border);
}

.panel-settings-modal__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.panel-settings-modal__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
}

.panel-settings-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--card);
  color: var(--muted-foreground);
  cursor: pointer;
}

.panel-settings-modal__close:hover {
  background: var(--muted);
  color: var(--foreground);
}

.panel-settings-modal__body {
  display: flex;
  min-height: 480px;
  max-height: min(80vh, 720px);
}

.panel-settings-modal__content {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}

.panel-settings-modal__content-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.panel-settings-modal__content-title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
}

.panel-settings-modal__content-icon {
  color: var(--muted-foreground);
}
</style>
