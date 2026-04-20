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
 */

// ── Entity Types ──────────────────────────────────────────────────────

const ENTITY_TYPE_MAP: Record<string, string> = {
  // Direct matches
  'leader': 'Leader',
  'country': 'Country',
  'media outlet': 'Media Outlet',
  'international org': 'International Org',
  'institution': 'Institution',
  'government official': 'Government Official',
  'think tank': 'Think Tank',
  'nation-state': 'Country',
  'nation': 'Country',
  'political party': 'Political Party',
  'armed group': 'Armed Group',
  'academic institution': 'Academic Institution',
  'journalist': 'Media Outlet',
  'corporation': 'Corporation',
  'company': 'Corporation',

  // Normalize subtypes to parent categories
  'head of state': 'Leader',
  'militant leader': 'Leader',
  'military officer — pla rocket force': 'Government Official',
  'intelligence chief': 'Government Official',
  'uk foreign office official': 'Government Official',
  'person (ukrainian official)': 'Government Official',
  'person (us envoy)': 'Government Official',
  'individual — iranian foreign ministry': 'Government Official',
  'individual (spain)': 'Leader',
  'individual (south africa)': 'Leader',
  'government/military': 'Government Official',
  'political party (hungary)': 'Political Party',
  'political crisis': 'Event',
  'non-state armed groups / iran-aligned paramilitaries': 'Armed Group',
  'non-state armed group / regional proxy': 'Armed Group',
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
  'diplomatic mission': 'International Org',
  'geographic/strategic': 'Location',
  'location (city — russia / black sea coast)': 'Location',
  'location (city — northern israel)': 'Location',
  'country / location': 'Country',
};

export function normalizeEntityType(raw: string): string {
  if (!raw || raw.trim() === '') return 'Uncategorized';
  const key = raw.trim().toLowerCase();
  return ENTITY_TYPE_MAP[key] || raw.trim();
}


// ── Event Statuses ────────────────────────────────────────────────────

/**
 * Normalize event status to one of: Active, Escalating, Ongoing, Resolved, Stalled, Expired
 *
 * Many pipeline statuses contain prose or markdown like:
 * - "Active (200+ feared dead; Amnesty International confirms...)"
 * - "**FRAGILE** — Violated within 34 minutes..."
 * - "Resolved (Péter Magyar wins; Orbán's 16-year rule ends...)"
 * - "- Ceasefire expires April 22 — **no renewal agreed**"
 */
export function normalizeEventStatus(raw: string): string {
  if (!raw || raw.trim() === '') return 'Unknown';
  const s = raw.trim();

  // Strip leading markdown bullets and artifacts
  const cleaned = s
    .replace(/^[-–—]\s*/, '')  // leading bullet
    .replace(/\*\*/g, '')       // bold markdown
    .replace(/[🔥🔴⚠️🟡🟢]/g, '')  // emoji
    .trim();

  const lower = cleaned.toLowerCase();

  // Check for escalation signals first (before active)
  if (
    lower.includes('escalat') ||
    lower.includes('critical') ||
    lower.includes('warning') ||
    lower === 'escalation warning' ||
    lower.startsWith('active — major escalation') ||
    lower.startsWith('active (escalating') ||
    lower === 'active escalation'
  ) {
    return 'Escalating';
  }

  if (
    lower.includes('resolved') ||
    lower.includes('confirmed —') ||
    lower === 'confirmed' ||
    lower === 'occurred' ||
    lower === 'deceased' ||
    lower === 'reported'
  ) {
    return 'Resolved';
  }

  if (lower.includes('expired') || lower.includes('fragile') || lower.includes('undermined')) {
    return 'Expired';
  }

  if (lower.includes('stalled')) {
    return 'Stalled';
  }

  if (lower === 'ongoing' || lower === 'announced' || lower === 'announced / active') {
    return 'Ongoing';
  }

  // "Active" with sub-statuses → just "Active"
  if (lower.startsWith('active') || lower === 'active') {
    return 'Active';
  }

  // If the cleaned text is short and reasonable, use it
  if (cleaned.length <= 30 && !cleaned.includes('(') && !cleaned.includes('—')) {
    return cleaned;
  }

  // Fallback: if it's long prose, treat as Active (most events are)
  return 'Active';
}


// ── Theatres ──────────────────────────────────────────────────────────

const THEATRE_MAP: Record<string, string> = {
  'middle east': 'Middle East',
  'indo-pacific': 'Indo-Pacific',
  'europe/nato': 'Europe / NATO',
  'africa': 'Africa',
  'cross-regional': 'Cross-Regional',
  'latin america': 'Latin America',
  'persian gulf': 'Persian Gulf',
  'south asia': 'South Asia',
  'east asia': 'East Asia',
  'korean peninsula': 'Korean Peninsula',
  'eurasia': 'Eurasia',
  'china': 'East Asia',
  'europe': 'Europe / NATO',
};

/**
 * Normalize theatre tags by:
 * 1. Splitting compound theatres on " / " or ","
 * 2. Mapping each part to a canonical theatre
 * 3. Returning the most specific (non-Cross-Regional) one, or the first
 */
export function normalizeTheatre(raw: string): string {
  if (!raw || raw.trim() === '') return 'Uncategorized';

  const parts = raw
    .split(/[/,]/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  if (parts.length === 0) return 'Uncategorized';

  const mapped = parts.map((p) => {
    // Try direct match
    if (THEATRE_MAP[p]) return THEATRE_MAP[p];
    // Try partial match
    for (const [key, val] of Object.entries(THEATRE_MAP)) {
      if (p.includes(key) || key.includes(p)) return val;
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
 * - Lowercase for consistency
 * - Strip markdown formatting
 * - Trim whitespace
 */
export function normalizeTheme(raw: string): string {
  if (!raw || raw.trim() === '') return '';
  return raw
    .replace(/\*\*/g, '')       // bold
    .replace(/\*/g, '')         // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links → text
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
