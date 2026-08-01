<template>
  <div>
    <template v-if="block.type === 'hero'">
      <v-text-field v-model="c.headline" label="Headline" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.subheadline" label="Subheadline" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.cta_text" label="CTA text" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.cta_url" label="CTA URL" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.image_url" label="Image URL" density="compact" variant="outlined" hide-details="auto" />
    </template>

    <template v-else-if="block.type === 'richtext'">
      <v-textarea v-model="c.html" label="HTML content" rows="5" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-textarea
        v-if="block.variant === 'two-column'"
        v-model="c.html_secondary"
        label="Second column HTML"
        rows="4"
        density="compact"
        variant="outlined"
        hide-details="auto"
      />
    </template>

    <template v-else-if="block.type === 'cta' || block.type === 'cta_inline'">
      <v-text-field v-model="c.title" label="Title" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-if="block.type === 'cta'" v-model="c.subtitle" label="Subtitle" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.button_text" label="Button text" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.button_url" label="Button URL" density="compact" variant="outlined" hide-details="auto" />
    </template>

    <template v-else-if="block.type === 'vehicle_grid'">
      <v-text-field v-model="c.title" label="Section title" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model.number="c.limit" label="Limit" type="number" density="compact" variant="outlined" hide-details="auto" />
    </template>

    <template v-else-if="block.type === 'faq'">
      <v-text-field v-model="c.title" label="Section title" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <div v-for="(item, fi) in (c.items as any[])" :key="fi" class="mb-2 pa-2 border rounded">
        <v-text-field v-model="item.question" label="Question" density="compact" variant="outlined" class="mb-1" hide-details="auto" />
        <v-textarea v-model="item.answer" label="Answer" rows="2" density="compact" variant="outlined" hide-details="auto" />
      </div>
      <v-btn size="small" variant="tonal" @click="(c.items as any[]).push({ question: '', answer: '' })">+ FAQ item</v-btn>
    </template>

    <template v-else-if="block.type === 'features'">
      <v-text-field v-model="c.title" label="Title" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.subtitle" label="Subtitle" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <div v-for="(item, fi) in (c.items as any[])" :key="fi" class="mb-2 pa-2 border rounded">
        <v-text-field v-model="item.title" label="Feature title" density="compact" variant="outlined" class="mb-1" hide-details="auto" />
        <v-textarea v-model="item.body" label="Body" rows="2" density="compact" variant="outlined" hide-details="auto" />
      </div>
      <v-btn size="small" variant="tonal" @click="(c.items as any[]).push({ title: '', body: '', icon: 'check' })">+ Feature</v-btn>
    </template>

    <template v-else-if="block.type === 'testimonials'">
      <v-text-field v-model="c.title" label="Title" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <div v-for="(item, fi) in (c.items as any[])" :key="fi" class="mb-2 pa-2 border rounded">
        <v-textarea v-model="item.quote" label="Quote" rows="2" density="compact" variant="outlined" class="mb-1" hide-details="auto" />
        <v-text-field v-model="item.author" label="Author" density="compact" variant="outlined" class="mb-1" hide-details="auto" />
        <v-text-field v-model="item.role" label="Role" density="compact" variant="outlined" hide-details="auto" />
      </div>
      <v-btn size="small" variant="tonal" @click="(c.items as any[]).push({ quote: '', author: '', role: '' })">+ Testimonial</v-btn>
    </template>

    <template v-else-if="block.type === 'stats'">
      <v-text-field v-model="c.title" label="Title" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <div v-for="(item, fi) in (c.items as any[])" :key="fi" class="mb-2 d-flex gap-2">
        <v-text-field v-model="item.value" label="Value" density="compact" variant="outlined" hide-details="auto" />
        <v-text-field v-model="item.label" label="Label" density="compact" variant="outlined" hide-details="auto" />
      </div>
    </template>

    <template v-else-if="block.type === 'image_text'">
      <v-text-field v-model="c.title" label="Title" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-textarea v-model="c.body" label="Body" rows="3" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.image_url" label="Image URL" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.cta_text" label="CTA text" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.cta_url" label="CTA URL" density="compact" variant="outlined" hide-details="auto" />
    </template>

    <template v-else-if="block.type === 'pull_quote'">
      <v-textarea v-model="c.quote" label="Quote" rows="3" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model="c.attribution" label="Attribution" density="compact" variant="outlined" hide-details="auto" />
    </template>

    <template v-else-if="block.type === 'related_posts'">
      <v-text-field v-model="c.title" label="Title" density="compact" variant="outlined" class="mb-2" hide-details="auto" />
      <v-text-field v-model.number="c.limit" label="Limit" type="number" density="compact" variant="outlined" hide-details="auto" />
    </template>

    <template v-else-if="block.type === 'toc'">
      <v-text-field v-model="c.title" label="Title" density="compact" variant="outlined" hide-details="auto" />
      <p class="text-caption text-medium-emphasis mt-2">Headings are generated automatically from the article body.</p>
    </template>

    <template v-else-if="block.type === 'author_box'">
      <v-switch v-model="c.show_bio" label="Show bio line" density="compact" hide-details color="primary" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CmsBlock } from '@/constants/cms'

const props = defineProps<{ block: CmsBlock }>()

const c = computed(() => props.block.content)
</script>
