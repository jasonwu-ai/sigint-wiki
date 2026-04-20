/**
 * Data normalizers for filter taxonomy (Issue #41)
 *
 * The pipeline produces raw filter values with inconsistencies:
 * - Entity types: 46 one-off labels, 224/364 entities with no type
 * - Event statuses: Markdown/prose in filter values, 30+ unique statuses
 * - Theatres: Inconsistent separators, casing, and specificity
 * - Themes: Case duplicates, markdown in values
 *
 * These normalizers transform raw values into clean, consistent filter options
 * at load time — without modifying the source markdown files.
 *
 * Updated: 2026-04-21 — comprehensive coverage of all raw values found in data
 */

// ── Entity Types ──────────────────────────────────────────────────────

const ENTITY_TYPE_MAP: Record<string, string> = {
  // ── Canonical types (already clean) ──
  'leader': 'Leader',
  'country': 'Country',
  'media outlet': 'Media Outlet',
  'international org': 'International Org',
  'institution': 'Institution',
  'government official': 'Government Official',
  'think tank': 'Think Tank',
  'armed group': 'Armed Group',
  'academic institution': 'Academic Institution',
  'corporation': 'Corporation',
  'political party': 'Political Party',

  // ── Synonyms / alternate forms → canonical ──
  'nation-state': 'Country',
  'nation': 'Country',
  'company': 'Corporation',
  'journalist': 'Media Outlet',
  'head of state': 'Leader',
  'militant leader': 'Leader',
  'political party (hungary)': 'Political Party',
  'political crisis': 'Event',

  // ── Government officials (subtypes) ──
  'military officer — pla rocket force': 'Government Official',
  'intelligence chief': 'Government Official',
  'uk foreign office official': 'Government Official',
  'person (ukrainian official)': 'Government Official',
  'person (us envoy)': 'Government Official',
  'individual — iranian foreign ministry': 'Government Official',
  'government/military': 'Government Official',
  'individual (spain)': 'Leader',
  'individual (south africa)': 'Leader',

  // ── Armed groups (subtypes) ──
  'non-state armed groups / iran-aligned paramilitaries': 'Armed Group',
  'non-state armed group / regional proxy': 'Armed Group',

  // ── Corporations (subtypes) ──
  'corporate leader': 'Corporation',
  'corporate entity': 'Corporation',
  'corporate / personal security': 'Corporation',
  'corporate / legal': 'Corporation',
  'corporate / infrastructure': 'Corporation',
  'corporation (cement manufacturer)': 'Corporation',
  'businessman, trump organization executive': 'Corporation',
  'cryptocurrency / sanctions arbitrage mechanism': 'Corporation',
  'us investment bank / financial institution': 'Corporation',
  'hedge fund founder': 'Corporation',

  // ── International / diplomatic ──
  'diplomatic mission': 'International Org',

  // ── Locations ──
  'geographic/strategic': 'Location',
  'location (city — russia / black sea coast)': 'Location',
  'location (city — northern israel)': 'Location',
  'country / location': 'Country',
};

/** Canonical entity types for filter dropdown (stable set of ~12 categories) */
export const CANONICAL_ENTITY_TYPES = [
  'Leader',
  'Country',
  'Government Official',
  'Armed Group',
  'Corporation',
  'Media Outlet',
  'International Org',
  'Institution',
  'Think Tank',
  'Academic Institution',
  'Political Party',
  'Location',
  'Event',
] as const;

export function normalizeEntityType(raw: string): string {
  if (!raw || raw.trim() === '') return 'Uncategorized';
  const key = raw.trim().toLowerCase();
  return ENTITY_TYPE_MAP[key] || 'Uncategorized';
}


// ── Event Statuses ────────────────────────────────────────────────────

/**
 * Normalize event status to one of: Active, Escalating, Ongoing, Resolved, Stalled, Expired
 *
 * Many pipeline statuses contain prose or markdown like:
 * - "Active (200+ feared dead; Amnesty International confirms...)"
 * - "**FRAGILE** — Violated within 34 minutes..."
 * - "Resolved (Péter Magyar wins; Orbán's 16-year rule ends...)"
 * - "🔴 CRITICAL REVERSAL"
 * - "**Hormuz OPEN** — Trump confirms; Iran says..."
 * - "Novelty / Technology"
 */
export function normalizeEventStatus(raw: string): string {
  if (!raw || raw.trim() === '') return 'Unknown';

  const s = raw.trim();

  // Strip leading markdown bullets and artifacts
  const cleaned = s
    .replace(/^[-–—]\s*/, '')  // leading bullet
    .replace(/\*\*/g, '')       // bold markdown
    .replace(/[🔥🔴⚠️🟡🟢]/gu, '')  // emoji (with unicode flag)
    .trim();

  const lower = cleaned.toLowerCase();

  // ── Escalating ──
  if (
    lower.includes('escalat') ||
    lower.includes('critical reversal') ||
    lower.includes('critical') ||
    lower.includes('warning') ||
    lower === 'escalation warning' ||
    lower.startsWith('active — major escalation') ||
    lower.startsWith('active (escalating') ||
    lower === 'active escalation' ||
    lower.includes('blockade in effect') ||
    lower.includes('kinetic escalation')
  ) {
    return 'Escalating';
  }

  // ── Resolved ──
  if (
    lower.includes('resolved') ||
    lower.includes('confirmed —') ||
    lower === 'confirmed' ||
    lower === 'occurred' ||
    lower === 'deceased' ||
    lower === 'reported' ||
    lower.includes('russian territorial gain') ||
    lower.includes('magyar wins')
  ) {
    return 'Resolved';
  }

  // ── Expired ──
  if (
    lower.includes('expired') ||
    lower.includes('fragile') ||
    lower.includes('undermined') ||
    lower.includes('violated') ||
    lower.includes('hormuz open') ||
    lower.includes('ceasefire lasted') ||
    lower.includes('no renewal')
  ) {
    return 'Expired';
  }

  // ── Stalled ──
  if (lower.includes('stalled')) {
    return 'Stalled';
  }

  // ── Ongoing ──
  if (
    lower === 'ongoing' ||
    lower === 'announced' ||
    lower === 'announced / active'
  ) {
    return 'Ongoing';
  }

  // ── Active (catch-all for "Active *" variants) ──
  if (
    lower.startsWith('active') ||
    lower === 'active' ||
    lower.includes('deployment') ||
    lower.includes('diplomatic tension') ||
    lower.includes('de-escalation') ||
    lower.includes('monitoring') ||
    lower.includes('result pending') ||
    lower.includes('election confirmed')
  ) {
    return 'Active';
  }

  // ── Novelty / Technology → Ongoing ──
  if (lower.includes('novelty') || lower.includes('technology')) {
    return 'Ongoing';
  }

  // If the cleaned text is short and reasonable, use it
  if (cleaned.length <= 30 && !cleaned.includes('(') && !cleaned.includes('—') && !cleaned.includes('"')) {
    return cleaned;
  }

  // Fallback: if it's long prose, treat as Active (most events are)
  return 'Active';
}

/** Canonical event statuses for filter dropdown */
export const CANONICAL_EVENT_STATUSES = [
  'Active',
  'Escalating',
  'Ongoing',
  'Resolved',
  'Stalled',
  'Expired',
] as const;


// ── Theatres ──────────────────────────────────────────────────────────

/**
 * Comprehensive theatre mapping.
 * All raw theatre values map to one of the canonical theatres.
 * Compound theatres (e.g. "Middle East / South Asia") are mapped to the
 * most specific/relevant canonical theatre.
 */
const THEATRE_MAP: Record<string, string> = {
  // ── Core canonical ──
  'middle east': 'Middle East',
  'indo-pacific': 'Indo-Pacific',
  'europe/nato': 'Europe / NATO',
  'europe': 'Europe / NATO',
  'africa': 'Africa',
  'cross-regional': 'Cross-Regional',
  'latin america': 'Latin America',
  'persian gulf': 'Persian Gulf',
  'south asia': 'South Asia',
  'east asia': 'East Asia',
  'korean peninsula': 'Korean Peninsula',
  'eurasia': 'Eurasia',

  // ── Sub-regions → parent ──
  'china': 'East Asia',
  'us-china': 'East Asia',
  'china-southeast asia': 'East Asia',
  'taiwan strait / indo-pacific': 'Indo-Pacific',
  'levant / israel-lebanon border': 'Middle East',
  'kharkiv region / northeastern ukraine': 'Europe / NATO',
  'iran / nuclear': 'Middle East',
  'strait of hormuz / persian gulf': 'Persian Gulf',
  'persian gulf / strait of hormuz': 'Persian Gulf',
  'persian gulf / red sea': 'Persian Gulf',
  'pakistan / iran': 'South Asia',
  'atlantic / latin america': 'Latin America',
  'mediterranean / middle east': 'Middle East',
  'korean peninsula / indo-pacific': 'Korean Peninsula',

  // ── Compound theatres → primary ──
  'middle east / persian gulf': 'Middle East',
  'middle east / gaza': 'Middle East',
  'middle east / south asia': 'Middle East',
  'middle east, south asia': 'Middle East',
  'middle east / indo-pacific': 'Middle East',
  'middle east / europe': 'Middle East',
  'middle east / europe/nato (cross-regional)': 'Middle East',
  'europe/nato / middle east': 'Europe / NATO',
  'europe/nato / cross-regional': 'Europe / NATO',
  'europe / eastern front': 'Europe / NATO',
  'europe / transatlantic': 'Europe / NATO',
  'europe, middle east': 'Europe / NATO',
  'indo-pacific / middle east': 'Indo-Pacific',
  'indo-pacific / middle east / cross-regional': 'Indo-Pacific',
  'indo-pacific / cross-regional': 'Indo-Pacific',
  'indo-pacific / europe/nato': 'Indo-Pacific',
  'indo-pacific / korean peninsula': 'Indo-Pacific',
  'indo-pacific / global commons': 'Indo-Pacific',
  'east asia / europe': 'East Asia',
  'south asia / middle east': 'South Asia',
  'africa / cross-regional': 'Africa',
  'cross-regional (energy/economic impact)': 'Cross-Regional',
  'middle east / cross-regional': 'Middle East',
};

/** Canonical theatres for filter dropdown */
export const CANONICAL_THEATRES = [
  'Middle East',
  'Indo-Pacific',
  'Europe / NATO',
  'Africa',
  'Latin America',
  'Persian Gulf',
  'South Asia',
  'East Asia',
  'Korean Peninsula',
  'Eurasia',
  'Cross-Regional',
] as const;

/**
 * Normalize theatre tags:
 * 1. Try direct lookup in THEATRE_MAP (after lowercasing)
 * 2. If not found, try splitting on " / " or "," and matching parts
 * 3. Fallback: Title Case the input
 */
export function normalizeTheatre(raw: string): string {
  if (!raw || raw.trim() === '') return 'Uncategorized';

  const trimmed = raw.trim();
  const key = trimmed.toLowerCase();

  // Direct map lookup
  if (THEATRE_MAP[key]) return THEATRE_MAP[key];

  // Try splitting compound theatres
  const parts = trimmed
    .split(/[/,]/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  if (parts.length === 0) return 'Uncategorized';

  // Try to map each part
  const mapped = parts.map((p) => {
    if (THEATRE_MAP[p]) return THEATRE_MAP[p];
    // Try partial match
    for (const [mapKey, mapVal] of Object.entries(THEATRE_MAP)) {
      if (p.includes(mapKey) || mapKey.includes(p)) return mapVal;
    }
    // Title-case fallback
    return p.replace(/\b\w/g, (c) => c.toUpperCase());
  });

  // Deduplicate
  const unique = [...new Set(mapped)];

  // Prefer non-Cross-Regional if possible
  const nonGeneric = unique.filter((t) => t !== 'Cross-Regional');
  if (nonGeneric.length > 0) return nonGeneric[0];
  return unique[0];
}


// ── Themes ────────────────────────────────────────────────────────────

/**
 * Normalize a single theme tag:
 * - Strip markdown formatting (bold, italic, links)
 * - Lowercase for consistency (prevents case-duplicates)
 * - Trim whitespace
 * - Remove multi-line prose (if the tag contains newlines, take first line only)
 */
export function normalizeTheme(raw: string): string {
  if (!raw || raw.trim() === '') return '';
  return raw
    .split('\n')[0]               // take only first line (strip multi-line prose)
    .replace(/\*\*/g, '')         // bold
    .replace(/\*/g, '')           // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links → text
    .replace(/^[-–—]\s*/, '')     // leading bullet
    .trim()
    .toLowerCase();
}

/**
 * Normalize a themes array: clean each tag, deduplicate, filter empty
 */
export function normalizeThemes(themes: string[]): string[] {
  const normalized = themes.map(normalizeTheme).filter(Boolean);
  return [...new Set(normalized)].sort();
}
