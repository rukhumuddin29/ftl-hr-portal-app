<template>
  <div class="rich-text-editor border-thin rounded-lg overflow-hidden">
    <!-- Toolbar -->
    <div v-if="editor" class="editor-toolbar d-flex flex-wrap pa-1 ga-1 border-b">
      <v-btn
        v-for="btn in toolbar"
        :key="btn.action"
        icon
        variant="text"
        size="small"
        :color="btn.activeState && editor.isActive(btn.activeState, btn.activeOptions || {}) ? 'primary' : 'default'"
        @click="btn.run"
      >
        <v-icon size="18">{{ btn.icon }}</v-icon>
        <v-tooltip activator="parent" location="top">{{ btn.title }}</v-tooltip>
      </v-btn>
    </div>

    <!-- Content Area -->
    <editor-content :editor="editor" class="editor-content-area" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'] )

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Link.configure({
      openOnClick: false,
    }),
    TextStyle,
    Color,
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Watch for external content changes
watch(() => props.modelValue, (value) => {
  const isSame = editor.value?.getHTML() === value
  if (isSame) return
  editor.value?.commands.setContent(value, { emitUpdate: false })
})

interface ToolbarButton {
  title: string
  icon: string
  action: string
  activeState?: string
  activeOptions?: any
  run: () => void
}

const toolbar = computed<ToolbarButton[]>(() => [
  { title: 'Bold', icon: 'mdi-format-bold', action: 'bold', activeState: 'bold', run: () => editor.value?.chain().focus().toggleBold().run() },
  { title: 'Italic', icon: 'mdi-format-italic', action: 'italic', activeState: 'italic', run: () => editor.value?.chain().focus().toggleItalic().run() },
  { title: 'Underline', icon: 'mdi-format-underline', action: 'underline', activeState: 'underline', run: () => editor.value?.chain().focus().toggleUnderline().run() },
  { title: 'Strike', icon: 'mdi-format-strikethrough', action: 'strike', activeState: 'strike', run: () => editor.value?.chain().focus().toggleStrike().run() },
  { title: 'Bullet List', icon: 'mdi-format-list-bulleted', action: 'bulletList', activeState: 'bulletList', run: () => editor.value?.chain().focus().toggleBulletList().run() },
  { title: 'Ordered List', icon: 'mdi-format-list-numbered', action: 'orderedList', activeState: 'orderedList', run: () => editor.value?.chain().focus().toggleOrderedList().run() },
  { title: 'Blockquote', icon: 'mdi-format-quote-close', action: 'blockquote', activeState: 'blockquote', run: () => editor.value?.chain().focus().toggleBlockquote().run() },
  { title: 'Code', icon: 'mdi-code-tags', action: 'code', activeState: 'code', run: () => editor.value?.chain().focus().toggleCode().run() },
  { title: 'Undo', icon: 'mdi-undo', action: 'undo', run: () => editor.value?.chain().focus().undo().run() },
  { title: 'Redo', icon: 'mdi-redo', action: 'redo', run: () => editor.value?.chain().focus().redo().run() },
])

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.rich-text-editor {
  background: var(--v-theme-surface);
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  background: rgba(255, 255, 255, 0.02);
}

.editor-content-area {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: 500px;
}

:deep(.tiptap) {
  outline: none;
  min-height: 250px;
}

:deep(.tiptap p) {
  margin-bottom: 0.5rem;
}

:deep(.tiptap ul), :deep(.tiptap ol) {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

:deep(.tiptap blockquote) {
  border-left: 3px solid var(--v-theme-primary);
  padding-left: 1rem;
  font-style: italic;
  margin-bottom: 1rem;
}

:deep(.tiptap code) {
  background: rgba(var(--v-theme-primary), 0.1);
  color: var(--v-theme-primary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}
</style>
