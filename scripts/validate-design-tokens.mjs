/**
 * Validation script for Slice 2a: Tailwind config + global CSS design tokens
 * Run: node scripts/validate-design-tokens.mjs
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ROOT = resolve(import.meta.dirname, '..');

// ---- Helpers ----
function getFile(path) {
  return readFileSync(path, 'utf-8');
}

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  PASS: ${message}`);
}

// ---- Tailwind config checks ----
console.log('\n=== Tailwind Config ===');
const twPath = `${PROJECT_ROOT}/tailwind.config.mjs`;
const twContent = getFile(twPath);

// 1. Canvas/panel/surface/elevated colors
assert(twContent.includes("canvas:  '#08090a'"), 'canvas color #08090a');
assert(twContent.includes("panel:   '#0f1011'"), 'panel color #0f1011');
assert(twContent.includes("surface: '#191a1b'"), 'surface color #191a1b');
assert(twContent.includes("elevated:'#28282c'"), 'elevated color #28282c');

// 2. Accent colors
assert(twContent.includes("DEFAULT: '#14b8a6'"), 'accent.DEFAULT #14b8a6');
assert(twContent.includes("hover:  '#2dd4bf'"), 'accent.hover #2dd4bf');
assert(twContent.includes("muted:  'rgba(20, 184, 166, 0.15)'"), 'accent.muted rgba(...)');

// 3. Status colors
assert(twContent.includes("fresh:   '#10b981'"), 'fresh #10b981');
assert(twContent.includes("recent:  '#f59e0b'"), 'recent #f59e0b');
assert(twContent.includes("stale:   '#62666d'"), 'stale #62666d');

// 4. Type colors
assert(twContent.includes("event:     '#f59e0b'"), 'type.event #f59e0b');
assert(twContent.includes("entity:    '#3b82f6'"), 'type.entity #3b82f6');
assert(twContent.includes("market:    '#10b981'"), 'type.market #10b981');
assert(twContent.includes("narrative: '#a855f7'"), 'type.narrative #a855f7');

// 5. Fonts
assert(twContent.includes("sans: ['Inter'"), 'fontFamily.sans Inter');
assert(twContent.includes("mono: ['JetBrains Mono'"), 'fontFamily.mono JetBrains Mono');

// ---- Global CSS checks ----
console.log('\n=== Global CSS ===');
const cssPath = `${PROJECT_ROOT}/src/styles/global.css`;
const cssContent = getFile(cssPath);

// 6. CSS custom properties
assert(cssContent.includes('--bg-canvas:     #08090a'), '--bg-canvas token');
assert(cssContent.includes('--bg-panel:      #0f1011'), '--bg-panel token');
assert(cssContent.includes('--bg-surface:    #191a1b'), '--bg-surface token');
assert(cssContent.includes('--bg-elevated:   #28282c'), '--bg-elevated token');
assert(cssContent.includes('--accent:        #14b8a6'), '--accent token');
assert(cssContent.includes('--accent-hover:  #2dd4bf'), '--accent-hover token');
assert(cssContent.includes('--accent-muted:  rgba(20, 184, 166, 0.15)'), '--accent-muted token');
assert(cssContent.includes('--fresh:         #10b981'), '--fresh token');
assert(cssContent.includes('--recent:        #f59e0b'), '--recent token');
assert(cssContent.includes('--stale:         #62666d'), '--stale token');
assert(cssContent.includes('--type-event:    #f59e0b'), '--type-event token');
assert(cssContent.includes('--type-entity:   #3b82f6'), '--type-entity token');
assert(cssContent.includes('--type-market:    #10b981'), '--type-market token');
assert(cssContent.includes('--type-narrative: #a855f7'), '--type-narrative token');

// 7. Google Fonts import
assert(cssContent.includes('fonts.googleapis.com/css2?family=Inter'), 'Inter font import');
assert(cssContent.includes('&family=JetBrains+Mono'), 'JetBrains Mono font import');

// 8. Tailwind directives present
assert(cssContent.includes('@tailwind base'), '@tailwind base');
assert(cssContent.includes('@tailwind components'), '@tailwind components');
assert(cssContent.includes('@tailwind utilities'), '@tailwind utilities');

console.log('\n✅ All design token checks passed!');
