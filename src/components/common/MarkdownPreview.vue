<template>
  <div v-if="source" class="markdown-content" :class="containerClass" v-html="rendered" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = withDefaults(
  defineProps<{
    source: string | null | undefined
    containerClass?: string
  }>(),
  {
    containerClass: ''
  }
)

const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'b',
    'i',
    'em',
    'strong',
    'a',
    'ul',
    'ol',
    'li',
    'code',
    'pre',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'br',
    'hr',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'img',
    'span'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class']
}

const rendered = computed(() => {
  if (!props.source) return ''
  return DOMPurify.sanitize(marked.parse(props.source) as string, DOMPURIFY_CONFIG)
})
</script>

<style scoped>
.markdown-content {
  text-align: left;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  color: var(--text-color);
  font-weight: 700;
  margin-top: 1.25em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(h1) {
  font-size: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 0.4em;
}

.markdown-content :deep(h2) {
  font-size: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.1rem;
}

.markdown-content :deep(p) {
  color: var(--text-color);
  line-height: 1.75;
  margin-bottom: 0.75em;
}

.markdown-content :deep(a) {
  color: var(--secondary-color);
  text-decoration: none;
  transition: all 0.2s ease;
}

.markdown-content :deep(a:hover) {
  color: white;
  text-shadow: 0 0 8px rgba(1, 138, 190, 0.5);
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-content :deep(pre code) {
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--text-color);
  background: transparent;
  padding: 0;
  border-radius: 0;
}

.markdown-content :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary-color);
  padding: 0.1em 0.4em;
  border-radius: 0.25rem;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 0.875rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0.75em 0;
  color: var(--text-color);
}

.markdown-content :deep(ul) {
  list-style: none;
}

.markdown-content :deep(ul > li) {
  position: relative;
  padding-left: 0.5em;
  margin-bottom: 0.35em;
  line-height: 1.7;
}

.markdown-content :deep(ul > li::before) {
  content: '\2022';
  color: var(--primary-color);
  position: absolute;
  left: -0.8em;
  font-weight: bold;
}

.markdown-content :deep(ol > li) {
  margin-bottom: 0.35em;
  line-height: 1.7;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--primary-color);
  margin: 1em 0;
  padding: 0.5em 1em;
  background: var(--primary-color-5);
  border-radius: 0 0.5rem 0.5rem 0;
  color: var(--text-color-light);
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin: 1.5em 0;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.markdown-content :deep(th) {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 0.6em 0.8em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.markdown-content :deep(td) {
  padding: 0.5em 0.8em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: var(--text-color);
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.5em 0;
}

.markdown-content :deep(strong) {
  color: var(--text-color);
  font-weight: 600;
}

.markdown-content :deep(em) {
  color: var(--text-color-light);
}
</style>
