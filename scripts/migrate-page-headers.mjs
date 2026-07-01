#!/usr/bin/env node
/**
 * Migrates header-section / dashboard-header blocks to PageHeader component.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const viewsDir = path.join(__dirname, '../src/views')

const IMPORT_LINE = "import PageHeader from '@/components/panel/PageHeader.vue'"

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name.endsWith('.vue')) files.push(full)
  }
  return files
}

function ensureImport(content) {
  if (content.includes(IMPORT_LINE) || content.includes("from '@/components/panel/PageHeader.vue'")) {
    return content
  }
  const scriptMatch = content.match(/<script setup[^>]*>\n/)
  if (!scriptMatch) return content
  const insertAt = scriptMatch.index + scriptMatch[0].length
  // After existing imports block
  const afterImports = content.slice(insertAt)
  const importBlockEnd = afterImports.search(/\n(const|function|interface|type|let|var|defineProps|defineEmits|useI18n|useRouter)/)
  if (importBlockEnd === -1) {
    return content.slice(0, insertAt) + IMPORT_LINE + '\n' + content.slice(insertAt)
  }
  const lineBefore = afterImports.lastIndexOf('\n', importBlockEnd - 1)
  const pos = insertAt + (lineBefore >= 0 ? lineBefore + 1 : 0)
  return content.slice(0, pos) + IMPORT_LINE + '\n' + content.slice(pos)
}

function migrate(content) {
  let updated = content
  let changed = false

  // dashboard-header with title + subtitle + optional refresh in actions area
  const dashboardHeaderRe =
    /<div class="dashboard-header mb-6">\s*<div>\s*<h1 class="text-h4 font-weight-bold mb-2">([\s\S]*?)<\/h1>\s*<p class="text-body-1 text-medium-emphasis">\s*([\s\S]*?)\s*<\/p>\s*<\/div>\s*(?:<v-btn[\s\S]*?<\/v-btn>\s*)?<\/div>/m
  if (dashboardHeaderRe.test(updated)) {
    updated = updated.replace(dashboardHeaderRe, (_, title, subtitle) => {
      return `<PageHeader :title="${title.trim()}" :subtitle="${subtitle.trim()}" />`
    })
    changed = true
  }

  // Simple header-section: only title + subtitle (no action buttons)
  const simpleHeaderRe =
    /<div class="header-section mb-[46]">\s*(?:<div>\s*)?<h1 class="text-h4 font-weight-bold mb-1">([\s\S]*?)<\/h1>\s*<p class="text-body-2 text-medium-emphasis(?: mb-0)?">\s*([\s\S]*?)\s*<\/p>\s*(?:<\/div>\s*)?<\/div>/gm
  updated = updated.replace(simpleHeaderRe, (match, title, subtitle) => {
    // Skip if contains v-btn in the block (has actions)
    if (/<v-btn/.test(match)) return match
    changed = true
    return `<PageHeader :title="${title.trim()}" :subtitle="${subtitle.trim()}" />`
  })

  // Detail header with back button - h5 variant
  const detailBackH5Re =
    /<div class="header-section mb-[46]">\s*<div class="d-flex align-center gap-3 mb-[23]">\s*<v-btn[\s\S]*?mdi-arrow-left[\s\S]*?<\/v-btn>\s*<div class="flex-grow-1">\s*<h1 class="text-h5 font-weight-bold mb-1">([\s\S]*?)<\/h1>\s*<p class="text-caption text-medium-emphasis mb-0">\s*([\s\S]*?)\s*<\/p>\s*<\/div>[\s\S]*?<\/div>\s*<\/div>/m
  if (detailBackH5Re.test(updated)) {
    updated = updated.replace(detailBackH5Re, (_, title, subtitle) => {
      changed = true
      return `<PageHeader :title="${title.trim()}" :subtitle="${subtitle.trim()}" show-back />`
    })
  }

  // Detail header with back - h4 variant
  const detailBackH4Re =
    /<div class="header-section mb-[46]">\s*<div class="d-flex align-center gap-3 mb-[23]">\s*<v-btn[\s\S]*?mdi-arrow-left[\s\S]*?<\/v-btn>\s*<div class="flex-grow-1">\s*<h1 class="text-h4 font-weight-bold mb-1">([\s\S]*?)<\/h1>\s*<p class="text-body-2 text-medium-emphasis mb-0">\s*([\s\S]*?)\s*<\/p>\s*<\/div>[\s\S]*?<\/div>\s*<\/div>/m
  if (detailBackH4Re.test(updated)) {
    updated = updated.replace(detailBackH4Re, (_, title, subtitle) => {
      changed = true
      return `<PageHeader :title="${title.trim()}" :subtitle="${subtitle.trim()}" show-back />`
    })
  }

  // User detail style back with size large
  const userDetailBackRe =
    /<div class="header-section mb-6">\s*<div class="d-flex align-center gap-4 mb-4">\s*<v-btn[\s\S]*?mdi-arrow-left[\s\S]*?<\/v-btn>\s*<div class="flex-grow-1">\s*<h1 class="text-h4 font-weight-bold mb-1">([\s\S]*?)<\/h1>\s*<p class="text-body-2 text-medium-emphasis mb-0">\s*([\s\S]*?)\s*<\/p>\s*<\/div>\s*<\/div>/m
  if (userDetailBackRe.test(updated)) {
    updated = updated.replace(userDetailBackRe, (_, title, subtitle) => {
      changed = true
      return `<PageHeader :title="${title.trim()}" :subtitle="${subtitle.trim()}" show-back />`
    })
  }

  if (changed) {
    updated = ensureImport(updated)
  }
  return { content: updated, changed }
}

const files = walk(viewsDir)
let count = 0
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8')
  const { content, changed } = migrate(original)
  if (changed && content !== original) {
    fs.writeFileSync(file, content)
    count++
    console.log('migrated:', path.relative(viewsDir, file))
  }
}
console.log(`\nMigrated ${count} files.`)
