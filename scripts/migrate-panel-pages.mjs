#!/usr/bin/env node
/**
 * Adds `panel-page` class to view root elements inside panel routes.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const viewsDir = path.join(__dirname, '../src/views')

const SKIP_DIRS = new Set(['auth'])
const SKIP_FILES = new Set(['HomeView.vue', 'AboutView.vue', 'Terms.vue', 'Privacy.vue'])

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(full, files)
    } else if (entry.name.endsWith('.vue') && !SKIP_FILES.has(entry.name)) {
      files.push(full)
    }
  }
  return files
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content

  // Root <div> without panel-page
  content = content.replace(
    /<template>\s*\n(\s*)<div(?!\s+class="[^"]*panel-page)([^>]*)>/,
    (match, indent, rest) => {
      const classMatch = rest.match(/\sclass="([^"]*)"/)
      if (classMatch) {
        const classes = classMatch[1]
        if (classes.includes('panel-page')) return match
        const newClasses = `panel-page ${classes}`.trim()
        return `<template>\n${indent}<div class="${newClasses}"${rest.replace(/\sclass="[^"]*"/, '')}>`
      }
      return `<template>\n${indent}<div class="panel-page"${rest}>`
    },
  )

  if (content !== original) {
    fs.writeFileSync(filePath, content)
    return true
  }
  return false
}

const files = walk(viewsDir)
let updated = 0
for (const file of files) {
  if (migrateFile(file)) {
    updated++
    console.log('updated:', path.relative(viewsDir, file))
  }
}
console.log(`\nDone. Updated ${updated} of ${files.length} view files.`)
