import { describe, it, expect } from 'vitest';
import {
  normalizeEntityType,
  normalizeEventStatus,
  normalizeTheatre,
  normalizeTheme,
  normalizeThemes,
  CANONICAL_ENTITY_TYPES,
  CANONICAL_EVENT_STATUSES,
  CANONICAL_THEATRES,
} from './normalizers';

// ─── normalizeEntityType ──────────────────────────────────────────────────────

describe('normalizeEntityType', () => {
  it('returns canonical types unchanged', () => {
    expect(normalizeEntityType('Leader')).toBe('Leader');
    expect(normalizeEntityType('Country')).toBe('Country');
    expect(normalizeEntityType('Corporation')).toBe('Corporation');
  });

  it('normalizes synonyms to canonical forms', () => {
    expect(normalizeEntityType('nation-state')).toBe('Country');
    expect(normalizeEntityType('nation')).toBe('Country');
    expect(normalizeEntityType('company')).toBe('Corporation');
    expect(normalizeEntityType('journalist')).toBe('Media Outlet');
    expect(normalizeEntityType('head of state')).toBe('Leader');
    expect(normalizeEntityType('militant leader')).toBe('Leader');
  });

  it('normalizes government official subtypes', () => {
    expect(normalizeEntityType('military officer — pla rocket force')).toBe('Government Official');
    expect(normalizeEntityType('intelligence chief')).toBe('Government Official');
    expect(normalizeEntityType('uk foreign office official')).toBe('Government Official');
    expect(normalizeEntityType('government/military')).toBe('Government Official');
  });

  it('normalizes armed group subtypes', () => {
    expect(normalizeEntityType('non-state armed groups / iran-aligned paramilitaries')).toBe('Armed Group');
    expect(normalizeEntityType('non-state armed group / regional proxy')).toBe('Armed Group');
  });

  it('normalizes corporation subtypes', () => {
    expect(normalizeEntityType('corporate leader')).toBe('Corporation');
    expect(normalizeEntityType('corporate entity')).toBe('Corporation');
    expect(normalizeEntityType('hedge fund founder')).toBe('Corporation');
  });

  it('normalizes location subtypes', () => {
    expect(normalizeEntityType('geographic/strategic')).toBe('Location');
    expect(normalizeEntityType('location (city — russia / black sea coast)')).toBe('Location');
  });

  it('returns Uncategorized for unknown values', () => {
    expect(normalizeEntityType('random unknown type')).toBe('Uncategorized');
    expect(normalizeEntityType('not a thing')).toBe('Uncategorized');
  });

  it('handles empty and whitespace input', () => {
    expect(normalizeEntityType('')).toBe('Uncategorized');
    expect(normalizeEntityType('   ')).toBe('Uncategorized');
    expect(normalizeEntityType(null as unknown as string)).toBe('Uncategorized');
  });

  it('is case-insensitive', () => {
    expect(normalizeEntityType('LEADER')).toBe('Leader');
    expect(normalizeEntityType('Country')).toBe('Country');
    expect(normalizeEntityType('CoRpOrAtIoN')).toBe('Corporation');
  });
});

// ─── CANONICAL_ENTITY_TYPES ──────────────────────────────────────────────────

describe('CANONICAL_ENTITY_TYPES', () => {
  it('is a non-empty array of unique canonical type strings', () => {
    expect(Array.isArray(CANONICAL_ENTITY_TYPES)).toBe(true);
    expect(CANONICAL_ENTITY_TYPES.length).toBeGreaterThan(0);
    expect(new Set(CANONICAL_ENTITY_TYPES).size).toBe(CANONICAL_ENTITY_TYPES.length);
  });

  it('contains expected entries', () => {
    expect(CANONICAL_ENTITY_TYPES).toContain('Leader');
    expect(CANONICAL_ENTITY_TYPES).toContain('Country');
    expect(CANONICAL_ENTITY_TYPES).toContain('Government Official');
    expect(CANONICAL_ENTITY_TYPES).toContain('Armed Group');
    expect(CANONICAL_ENTITY_TYPES).toContain('Corporation');
    expect(CANONICAL_ENTITY_TYPES).toContain('Location');
    expect(CANONICAL_ENTITY_TYPES).toContain('Event');
  });
});

// ─── normalizeEventStatus ──────────────────────────────────────────────────────

describe('normalizeEventStatus', () => {
  // Escalating
  it('normalizes escalating variants to Escalating', () => {
    expect(normalizeEventStatus('escalation warning')).toBe('Escalating');
    expect(normalizeEventStatus('Active — major escalation')).toBe('Escalating');
    expect(normalizeEventStatus('Active (escalating)')).toBe('Escalating');
    expect(normalizeEventStatus('active escalation')).toBe('Escalating');
    expect(normalizeEventStatus('critical reversal')).toBe('Escalating');
    expect(normalizeEventStatus('CRITICAL')).toBe('Escalating');
    expect(normalizeEventStatus('WARNING')).toBe('Escalating');
    expect(normalizeEventStatus('kinetic escalation')).toBe('Escalating');
    expect(normalizeEventStatus('blockade in effect')).toBe('Escalating');
  });

  // Resolved
  it('normalizes resolved variants to Resolved', () => {
    expect(normalizeEventStatus('resolved')).toBe('Resolved');
    expect(normalizeEventStatus('confirmed —')).toBe('Resolved');
    expect(normalizeEventStatus('confirmed')).toBe('Resolved');
    expect(normalizeEventStatus('occurred')).toBe('Resolved');
    expect(normalizeEventStatus('deceased')).toBe('Resolved');
    expect(normalizeEventStatus('reported')).toBe('Resolved');
    expect(normalizeEventStatus('russian territorial gain')).toBe('Resolved');
    expect(normalizeEventStatus('magyar wins')).toBe('Resolved');
  });

  // Expired
  it('normalizes expired/undermined variants to Expired', () => {
    expect(normalizeEventStatus('expired')).toBe('Expired');
    expect(normalizeEventStatus('**FRAGILE** — violated within 34 minutes')).toBe('Expired');
    expect(normalizeEventStatus('fragile')).toBe('Expired');
    expect(normalizeEventStatus('undermined')).toBe('Expired');
    expect(normalizeEventStatus('violated')).toBe('Expired');
    expect(normalizeEventStatus('hormuz open')).toBe('Expired');
    expect(normalizeEventStatus('ceasefire lasted')).toBe('Expired');
    expect(normalizeEventStatus('no renewal')).toBe('Expired');
  });

  // Stalled
  it('normalizes stalled variants to Stalled', () => {
    expect(normalizeEventStatus('stalled')).toBe('Stalled');
    expect(normalizeEventStatus('Stalled')).toBe('Stalled');
  });

  // Ongoing
  it('normalizes ongoing variants to Ongoing', () => {
    expect(normalizeEventStatus('ongoing')).toBe('Ongoing');
    expect(normalizeEventStatus('announced')).toBe('Ongoing');
    expect(normalizeEventStatus('announced / active')).toBe('Ongoing');
    expect(normalizeEventStatus('Novelty / Technology')).toBe('Ongoing');
    expect(normalizeEventStatus('technology')).toBe('Ongoing');
  });

  // Active
  it('normalizes active variants to Active', () => {
    expect(normalizeEventStatus('active')).toBe('Active');
    expect(normalizeEventStatus('Active')).toBe('Active');
    expect(normalizeEventStatus('active (200+ feared dead)')).toBe('Active');
    expect(normalizeEventStatus('deployment')).toBe('Active');
    expect(normalizeEventStatus('diplomatic tension')).toBe('Active');
    expect(normalizeEventStatus('de-escalation')).toBe('Escalating');
    expect(normalizeEventStatus('monitoring')).toBe('Active');
    expect(normalizeEventStatus('result pending')).toBe('Active');
    expect(normalizeEventStatus('election confirmed')).toBe('Active');
  });

  it('strips markdown and emoji', () => {
    expect(normalizeEventStatus('**FRAGILE** — Violated within 34 minutes')).toBe('Expired');
    expect(normalizeEventStatus('🔴 CRITICAL REVERSAL')).toBe('Escalating');
    expect(normalizeEventStatus('🔥 warning')).toBe('Escalating');
    expect(normalizeEventStatus('- Active')).toBe('Active');
  });

  it('handles empty and whitespace input', () => {
    expect(normalizeEventStatus('')).toBe('Unknown');
    expect(normalizeEventStatus('   ')).toBe('Unknown');
    expect(normalizeEventStatus(null as unknown as string)).toBe('Unknown');
  });

  it('returns short clean strings as-is', () => {
    expect(normalizeEventStatus('Deployed')).toBe('Deployed');
    // 'Monitoring' matches 'monitoring' includes in Active branch → 'Active'
    expect(normalizeEventStatus('Monitoring')).toBe('Active');
  });

  it('falls back to Active for long prose', () => {
    expect(normalizeEventStatus('Active (200+ feared dead; Amnesty International confirms...)')).toBe('Active');
    // Note: 'hormuz open' is caught by Expired branch, not Active
    expect(normalizeEventStatus('**Hormuz OPEN** — Trump confirms; Iran says...')).toBe('Expired');
  });
});

// ─── CANONICAL_EVENT_STATUSES ────────────────────────────────────────────────

describe('CANONICAL_EVENT_STATUSES', () => {
  it('is a non-empty array of unique status strings', () => {
    expect(Array.isArray(CANONICAL_EVENT_STATUSES)).toBe(true);
    expect(CANONICAL_EVENT_STATUSES.length).toBeGreaterThan(0);
    expect(new Set(CANONICAL_EVENT_STATUSES).size).toBe(CANONICAL_EVENT_STATUSES.length);
  });

  it('contains expected entries', () => {
    expect(CANONICAL_EVENT_STATUSES).toContain('Active');
    expect(CANONICAL_EVENT_STATUSES).toContain('Escalating');
    expect(CANONICAL_EVENT_STATUSES).toContain('Ongoing');
    expect(CANONICAL_EVENT_STATUSES).toContain('Resolved');
    expect(CANONICAL_EVENT_STATUSES).toContain('Stalled');
    expect(CANONICAL_EVENT_STATUSES).toContain('Expired');
  });
});

// ─── normalizeTheatre ─────────────────────────────────────────────────────────

describe('normalizeTheatre', () => {
  it('returns canonical theatres unchanged', () => {
    expect(normalizeTheatre('Middle East')).toBe('Middle East');
    expect(normalizeTheatre('Indo-Pacific')).toBe('Indo-Pacific');
    expect(normalizeTheatre('Europe / NATO')).toBe('Europe / NATO');
    expect(normalizeTheatre('Africa')).toBe('Africa');
    expect(normalizeTheatre('Latin America')).toBe('Latin America');
    expect(normalizeTheatre('Persian Gulf')).toBe('Persian Gulf');
    expect(normalizeTheatre('South Asia')).toBe('South Asia');
    expect(normalizeTheatre('East Asia')).toBe('East Asia');
    expect(normalizeTheatre('Korean Peninsula')).toBe('Korean Peninsula');
    expect(normalizeTheatre('Eurasia')).toBe('Eurasia');
    expect(normalizeTheatre('Cross-Regional')).toBe('Cross-Regional');
  });

  it('normalizes sub-region strings to parent theatres', () => {
    expect(normalizeTheatre('china')).toBe('East Asia');
    expect(normalizeTheatre('us-china')).toBe('East Asia');
    expect(normalizeTheatre('china-southeast asia')).toBe('East Asia');
    expect(normalizeTheatre('levant / israel-lebanon border')).toBe('Middle East');
    expect(normalizeTheatre('kharkiv region / northeastern ukraine')).toBe('Europe / NATO');
    expect(normalizeTheatre('iran / nuclear')).toBe('Middle East');
    expect(normalizeTheatre('strait of hormuz / persian gulf')).toBe('Persian Gulf');
    expect(normalizeTheatre('persian gulf / red sea')).toBe('Persian Gulf');
    expect(normalizeTheatre('korean peninsula / indo-pacific')).toBe('Korean Peninsula');
  });

  it('normalizes compound theatres to primary region', () => {
    expect(normalizeTheatre('middle east / persian gulf')).toBe('Middle East');
    expect(normalizeTheatre('middle east / gaza')).toBe('Middle East');
    expect(normalizeTheatre('middle east / south asia')).toBe('Middle East');
    expect(normalizeTheatre('middle east, south asia')).toBe('Middle East');
    expect(normalizeTheatre('middle east / indo-pacific')).toBe('Middle East');
    expect(normalizeTheatre('europe/nato / middle east')).toBe('Europe / NATO');
    expect(normalizeTheatre('europe / eastern front')).toBe('Europe / NATO');
    expect(normalizeTheatre('indo-pacific / middle east')).toBe('Indo-Pacific');
    expect(normalizeTheatre('indo-pacific / cross-regional')).toBe('Indo-Pacific');
    expect(normalizeTheatre('indo-pacific / korean peninsula')).toBe('Indo-Pacific');
    expect(normalizeTheatre('east asia / europe')).toBe('East Asia');
    expect(normalizeTheatre('africa / cross-regional')).toBe('Africa');
    expect(normalizeTheatre('middle east / cross-regional')).toBe('Middle East');
  });

  it('is case-insensitive', () => {
    expect(normalizeTheatre('MIDDLE EAST')).toBe('Middle East');
    expect(normalizeTheatre('INDO-PACIFIC')).toBe('Indo-Pacific');
    expect(normalizeTheatre('EuRoPe / NATO')).toBe('Europe / NATO');
  });

  it('handles empty and whitespace input', () => {
    expect(normalizeTheatre('')).toBe('Uncategorized');
    expect(normalizeTheatre('   ')).toBe('Uncategorized');
    expect(normalizeTheatre(null as unknown as string)).toBe('Uncategorized');
  });

  it('returns first non-Cross-Regional theatre for compound theatres', () => {
    expect(normalizeTheatre('middle east / cross-regional')).toBe('Middle East');
    expect(normalizeTheatre('cross-regional (energy/economic impact)')).toBe('Cross-Regional');
  });

  it('falls back to title-casing for completely unknown theatres', () => {
    expect(normalizeTheatre('antarctica')).toBe('Antarctica');
    expect(normalizeTheatre('outer space')).toBe('Outer Space');
  });
});

// ─── CANONICAL_THEATRES ───────────────────────────────────────────────────────

describe('CANONICAL_THEATRES', () => {
  it('is a non-empty array of unique theatre strings', () => {
    expect(Array.isArray(CANONICAL_THEATRES)).toBe(true);
    expect(CANONICAL_THEATRES.length).toBeGreaterThan(0);
    expect(new Set(CANONICAL_THEATRES).size).toBe(CANONICAL_THEATRES.length);
  });

  it('contains expected entries', () => {
    expect(CANONICAL_THEATRES).toContain('Middle East');
    expect(CANONICAL_THEATRES).toContain('Indo-Pacific');
    expect(CANONICAL_THEATRES).toContain('Europe / NATO');
    expect(CANONICAL_THEATRES).toContain('Africa');
    expect(CANONICAL_THEATRES).toContain('Latin America');
    expect(CANONICAL_THEATRES).toContain('Persian Gulf');
    expect(CANONICAL_THEATRES).toContain('South Asia');
    expect(CANONICAL_THEATRES).toContain('East Asia');
    expect(CANONICAL_THEATRES).toContain('Korean Peninsula');
    expect(CANONICAL_THEATRES).toContain('Eurasia');
    expect(CANONICAL_THEATRES).toContain('Cross-Regional');
  });
});

// ─── normalizeTheme ───────────────────────────────────────────────────────────

describe('normalizeTheme', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeTheme('')).toBe('');
    expect(normalizeTheme('   ')).toBe('');
    expect(normalizeTheme(null as unknown as string)).toBe('');
  });

  it('strips bold markdown', () => {
    expect(normalizeTheme('**Trade War**')).toBe('trade war');
  });

  it('strips italic markdown', () => {
    expect(normalizeTheme('*sanctions*')).toBe('sanctions');
  });

  it('strips link markdown', () => {
    // normalizeTheme lowercases the result, so we get lowercase output
    expect(normalizeTheme('[NATO Expansion](https://example.com)')).toBe('nato expansion');
  });

  it('strips leading bullets', () => {
    expect(normalizeTheme('- Security')).toBe('security');
    expect(normalizeTheme('— Trade')).toBe('trade');
  });

  it('takes only the first line of multi-line input', () => {
    expect(normalizeTheme('Trade\nFinance\nSecurity')).toBe('trade');
  });

  it('lowercases the result', () => {
    expect(normalizeTheme('TRADE')).toBe('trade');
    expect(normalizeTheme('Trade')).toBe('trade');
  });

  it('trims whitespace', () => {
    expect(normalizeTheme('  Trade  ')).toBe('trade');
  });

  it('handles complex real-world themes', () => {
    expect(normalizeTheme('**NATO Expansion**')).toBe('nato expansion');
    expect(normalizeTheme('*Economic*')).toBe('economic');
  });
});

// ─── normalizeThemes ──────────────────────────────────────────────────────────

describe('normalizeThemes', () => {
  it('normalizes each theme and deduplicates', () => {
    const input = ['Trade', 'trade', '**Trade**'];
    expect(normalizeThemes(input)).toEqual(['trade']);
  });

  it('sorts the result alphabetically', () => {
    const input = ['Security', 'Trade', 'Economics'];
    expect(normalizeThemes(input)).toEqual(['economics', 'security', 'trade']);
  });

  it('filters out empty strings', () => {
    const input = ['Trade', '', '   ', 'Security'];
    expect(normalizeThemes(input)).toEqual(['security', 'trade']);
  });

  it('handles empty array', () => {
    expect(normalizeThemes([])).toEqual([]);
  });

  it('handles array with all empty values', () => {
    expect(normalizeThemes(['', '   ', ''])).toEqual([]);
  });

  it('normalizes complex themes correctly', () => {
    const input = ['**NATO Expansion**', 'Trade', '*sanctions*', 'trade'];
    expect(normalizeThemes(input)).toEqual(['nato expansion', 'sanctions', 'trade']);
  });

  it('preserves unique themes after normalization', () => {
    const input = ['Trade', 'SECURITY', 'Economics'];
    const result = normalizeThemes(input);
    expect(result.length).toBe(3);
    expect(result).toEqual(['economics', 'security', 'trade']);
  });
});
