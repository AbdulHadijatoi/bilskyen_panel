<template>
  <div class="mini-preview" :style="rootStyle">
    <div v-if="kind === 'layout'" class="mini-preview__layout">
      <div v-for="(bar, i) in layoutBars" :key="i" class="mini-preview__bar" :style="bar" />
    </div>
    <div v-else-if="kind === 'style'" class="mini-preview__style">
      <div class="mini-preview__swatch" :style="{ background: colors.accent }" />
      <div class="mini-preview__lines">
        <div class="mini-preview__line" :style="{ background: colors.text, width: '70%' }" />
        <div class="mini-preview__line" :style="{ background: colors.muted, width: '90%' }" />
        <div class="mini-preview__line" :style="{ background: colors.muted, width: '55%' }" />
      </div>
    </div>
    <div v-else class="mini-preview__section" :data-variant="variant">
      <div class="mini-preview__hero-block" v-if="sectionType === 'hero'" />
      <div class="mini-preview__grid" v-else-if="sectionType === 'features' || sectionType === 'vehicle_grid' || sectionType === 'testimonials' || sectionType === 'stats'">
        <span /><span /><span />
      </div>
      <div class="mini-preview__text" v-else-if="sectionType === 'richtext' || sectionType === 'faq' || sectionType === 'pull_quote' || sectionType === 'toc'">
        <i /><i /><i />
      </div>
      <div class="mini-preview__cta" v-else-if="sectionType === 'cta' || sectionType === 'cta_inline'">
        <i /><b />
      </div>
      <div class="mini-preview__split" v-else>
        <span /><i />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getStyle } from '@/constants/cms'

const props = withDefaults(
  defineProps<{
    kind: 'layout' | 'section' | 'style'
    layoutId?: string
    sectionType?: string
    variant?: string
    styleId?: string
  }>(),
  { styleId: 'brand' },
)

const colors = computed(() => getStyle(props.styleId ?? 'brand').preview)

const rootStyle = computed(() => ({
  background: colors.value.bg,
  color: colors.value.text,
  '--accent': colors.value.accent,
  '--muted': colors.value.muted,
  '--text': colors.value.text,
}))

const layoutBars = computed(() => {
  const accent = colors.value.accent
  const muted = colors.value.muted
  const maps: Record<string, Array<Record<string, string>>> = {
    funnel: [
      { height: '28%', background: accent, opacity: '0.9' },
      { height: '14%', background: muted, opacity: '0.25' },
      { height: '18%', background: muted, opacity: '0.35' },
      { height: '14%', background: muted, opacity: '0.25' },
      { height: '12%', background: accent, opacity: '0.55' },
    ],
    guide: [
      { height: '22%', background: muted, opacity: '0.2' },
      { height: '36%', background: muted, opacity: '0.3' },
      { height: '18%', background: muted, opacity: '0.25' },
      { height: '12%', background: accent, opacity: '0.4' },
    ],
    spotlight: [
      { height: '40%', background: accent, opacity: '0.85' },
      { height: '28%', background: muted, opacity: '0.3' },
      { height: '14%', background: accent, opacity: '0.5' },
    ],
    minimal: [
      { height: '28%', background: muted, opacity: '0.2' },
      { height: '48%', background: muted, opacity: '0.3' },
    ],
    conversion: [
      { height: '26%', background: accent, opacity: '0.7' },
      { height: '16%', background: muted, opacity: '0.25' },
      { height: '16%', background: muted, opacity: '0.3' },
      { height: '12%', background: accent, opacity: '0.55' },
      { height: '14%', background: muted, opacity: '0.25' },
    ],
    classic: [
      { height: '24%', background: muted, opacity: '0.2' },
      { height: '18%', background: muted, opacity: '0.35' },
      { height: '40%', background: muted, opacity: '0.25' },
    ],
    hero: [
      { height: '48%', background: accent, opacity: '0.8' },
      { height: '36%', background: muted, opacity: '0.25' },
    ],
    magazine: [
      { height: '20%', background: muted, opacity: '0.2' },
      { height: '55%', background: muted, opacity: '0.3', width: '70%', marginLeft: 'auto' },
    ],
    feature: [
      { height: '30%', background: muted, opacity: '0.2' },
      { height: '16%', background: accent, opacity: '0.35' },
      { height: '36%', background: muted, opacity: '0.25' },
    ],
  }
  return maps[props.layoutId ?? ''] ?? maps.guide
})
</script>

<style scoped>
.mini-preview {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border, #e5e7eb);
  padding: 8px;
  box-sizing: border-box;
}
.mini-preview__layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mini-preview__bar {
  border-radius: 3px;
  width: 100%;
}
.mini-preview__style {
  height: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 6px;
}
.mini-preview__swatch {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
}
.mini-preview__lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mini-preview__line {
  height: 6px;
  border-radius: 3px;
  opacity: 0.7;
}
.mini-preview__section {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mini-preview__hero-block {
  width: 100%;
  height: 70%;
  border-radius: 4px;
  background: var(--accent);
  opacity: 0.75;
}
.mini-preview__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 100%;
}
.mini-preview__grid span {
  height: 42px;
  border-radius: 4px;
  background: var(--muted);
  opacity: 0.35;
}
.mini-preview__text {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mini-preview__text i {
  display: block;
  height: 6px;
  border-radius: 3px;
  background: var(--muted);
  opacity: 0.4;
}
.mini-preview__text i:nth-child(1) { width: 60%; }
.mini-preview__text i:nth-child(2) { width: 90%; }
.mini-preview__text i:nth-child(3) { width: 75%; }
.mini-preview__cta {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.mini-preview__cta i {
  display: block;
  width: 50%;
  height: 8px;
  border-radius: 3px;
  background: var(--text);
  opacity: 0.5;
}
.mini-preview__cta b {
  display: block;
  width: 36%;
  height: 18px;
  border-radius: 4px;
  background: var(--accent);
}
.mini-preview__split {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.mini-preview__split span {
  height: 56px;
  border-radius: 4px;
  background: var(--muted);
  opacity: 0.35;
}
.mini-preview__split i {
  display: block;
  height: 8px;
  margin-top: 12px;
  border-radius: 3px;
  background: var(--muted);
  opacity: 0.4;
}
</style>
