<template>
  <div class="rich-text-editor">
    <div v-if="editor" class="editor-toolbar">
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
        icon="mdi-format-bold"
      />
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
        icon="mdi-format-italic"
      />
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
        icon="mdi-format-strikethrough"
      />
      <v-divider vertical class="mx-1" />
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('heading', { level: 1 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        icon="mdi-format-header-1"
      />
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        icon="mdi-format-header-2"
      />
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        icon="mdi-format-header-3"
      />
      <v-divider vertical class="mx-1" />
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
        icon="mdi-format-list-bulleted"
      />
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
        icon="mdi-format-list-numbered"
      />
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
        icon="mdi-format-quote-close"
      />
      <v-divider vertical class="mx-1" />
      <v-btn
        size="small"
        variant="text"
        :class="{ 'v-btn--active': editor.isActive('link') }"
        @click="setLink"
        icon="mdi-link"
      />
    </div>
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { watch, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Write your content here…',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue || '<p></p>',
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
    }),
  ],
  editorProps: {
    attributes: {
      'data-placeholder': props.placeholder,
    },
  },
  onUpdate: ({ editor: e }) => {
    const html = e.getHTML()
    emit('update:modelValue', html === '<p></p>' ? '' : html)
  },
})

watch(
  () => props.modelValue,
  (val) => {
    if (!editor.value) return
    const current = editor.value.getHTML()
    const next = val || '<p></p>'
    if (current !== next) {
      editor.value.commands.setContent(next, false)
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function setLink() {
  if (!editor.value) return
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl || 'https://')
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #fafafa;
}

.editor-content {
  min-height: 280px;
}

.editor-content :deep(.tiptap) {
  min-height: 280px;
  padding: 12px 16px;
  outline: none;
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: rgba(0, 0, 0, 0.38);
  pointer-events: none;
  height: 0;
}

.editor-content :deep(.tiptap h1) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1em 0 0.5em;
}

.editor-content :deep(.tiptap h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1em 0 0.5em;
}

.editor-content :deep(.tiptap h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.75em 0 0.5em;
}

.editor-content :deep(.tiptap ul),
.editor-content :deep(.tiptap ol) {
  padding-left: 1.5rem;
  margin: 0.5em 0;
}

.editor-content :deep(.tiptap a) {
  color: rgb(25, 118, 210);
  text-decoration: underline;
}

.editor-content :deep(.tiptap blockquote) {
  border-left: 3px solid rgba(0, 0, 0, 0.2);
  padding-left: 1rem;
  margin: 0.5em 0;
  color: rgba(0, 0, 0, 0.7);
}
</style>
