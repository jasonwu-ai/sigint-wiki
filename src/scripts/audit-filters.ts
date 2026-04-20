/**
 * Audit script: verify filter taxonomy normalization (Issue #41)
 *
 * Usage: npx tsx src/scripts/audit-filters.ts
 *
 * Prints a report of normalized filter values and flags any that
 * don't map to canonical categories.
 */

import { loadAllEvents, loadAllEntities } from '../data/loader';
import {
  CANONICAL_ENTITY_TYPES,
  CANONICAL_EVENT_STATUSES,
  CANONICAL_THEATRES,
} from '../data/normalizers';

const entities = loadAllEntities();
const events = loadAllEvents();

console.log('=== Filter Taxonomy Audit ===\n');

// ── Entity Types ──
const typeCounts = new Map<string, number>();
for (const e of entities) {
  typeCounts.set(e.type, (typeCounts.get(e.type) || 0) + 1);
}

const canonicalTypes = new Set<string>([...CANONICAL_ENTITY_TYPES, 'Uncategorized']);
const nonCanonicalTypes = [...typeCounts.keys()].filter((t) => !canonicalTypes.has(t));

console.log('Entity Types:');
for (const [type, count] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) {
  const flag = canonicalTypes.has(type) ? '' : ' ⚠️ NOT CANONICAL';
  console.log(`  ${type}: ${count}${flag}`);
}
if (nonCanonicalTypes.length > 0) {
  console.log(`\n⚠️  ${nonCanonicalTypes.length} non-canonical entity type(s) found!`);
} else {
  console.log('\n✅ All entity types map to canonical categories');
}

// ── Event Statuses ──
const statusCounts = new Map<string, number>();
for (const e of events) {
  statusCounts.set(e.status, (statusCounts.get(e.status) || 0) + 1);
}

const canonicalStatuses = new Set(CANONICAL_EVENT_STATUSES);
canonicalStatuses.add('Unknown');
const nonCanonicalStatuses = [...statusCounts.keys()].filter((s) => !canonicalStatuses.has(s));

console.log('\nEvent Statuses:');
for (const [status, count] of [...statusCounts.entries()].sort((a, b) => b[1] - a[1])) {
  const flag = canonicalStatuses.has(status) ? '' : ' ⚠️ NOT CANONICAL';
  console.log(`  ${status}: ${count}${flag}`);
}
if (nonCanonicalStatuses.length > 0) {
  console.log(`\n⚠️  ${nonCanonicalStatuses.length} non-canonical status(es) found!`);
} else {
  console.log('\n✅ All event statuses map to canonical categories');
}

// ── Theatres ──
const theatreCounts = new Map<string, number>();
for (const e of events) {
  theatreCounts.set(e.theatre, (theatreCounts.get(e.theatre) || 0) + 1);
}

const canonicalTheatres = new Set(CANONICAL_THEATRES);
canonicalTheatres.add('Uncategorized');
const nonCanonicalTheatres = [...theatreCounts.keys()].filter((t) => !canonicalTheatres.has(t));

console.log('\nTheatres:');
for (const [theatre, count] of [...theatreCounts.entries()].sort((a, b) => b[1] - a[1])) {
  const flag = canonicalTheatres.has(theatre) ? '' : ' ⚠️ NOT CANONICAL';
  console.log(`  ${theatre}: ${count}${flag}`);
}
if (nonCanonicalTheatres.length > 0) {
  console.log(`\n⚠️  ${nonCanonicalTheatres.length} non-canonical theatre(s) found!`);
} else {
  console.log('\n✅ All theatres map to canonical categories');
}

// ── Themes ──
const themeCounts = new Map<string, number>();
for (const e of events) {
  for (const theme of e.themes) {
    themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
  }
}

// Check for case duplicates (should be none after normalization)
const lowerThemes = new Map<string, string[]>();
for (const theme of themeCounts.keys()) {
  const lower = theme.toLowerCase();
  if (!lowerThemes.has(lower)) lowerThemes.set(lower, []);
  lowerThemes.get(lower)!.push(theme);
}
const caseDuplicates = [...lowerThemes.entries()].filter(([, v]) => v.length > 1);

// Check for themes containing markdown or prose
const suspiciousThemes = [...themeCounts.keys()].filter(
  (t) => t.includes('**') || t.includes('*') || t.includes('[') || t.includes('\n')
);

console.log('\nThemes (top 30):');
for (const [theme, count] of [...themeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)) {
  console.log(`  ${theme}: ${count}`);
}
console.log(`  ... ${themeCounts.size} total unique themes`);

if (caseDuplicates.length > 0) {
  console.log(`\n⚠️  ${caseDuplicates.length} case-duplicate theme(s):`);
  for (const [lower, variants] of caseDuplicates) {
    console.log(`  "${lower}": ${variants.join(', ')}`);
  }
} else {
  console.log('\n✅ No case-duplicate themes');
}

if (suspiciousThemes.length > 0) {
  console.log(`\n⚠️  ${suspiciousThemes.length} theme(s) with markdown/prose:`);
  for (const t of suspiciousThemes) {
    console.log(`  "${t}"`);
  }
} else {
  console.log('✅ No themes with markdown/prose artifacts');
}

// ── Summary ──
const totalIssues = nonCanonicalTypes.length + nonCanonicalStatuses.length + nonCanonicalTheatres.length + caseDuplicates.length + suspiciousThemes.length;
console.log(`\n=== Summary: ${totalIssues === 0 ? '✅ All checks pass' : `⚠️  ${totalIssues} issue(s) found`} ===`);
