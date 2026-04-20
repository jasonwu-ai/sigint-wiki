import type { WikiEvent, WikiEntity, WikiMarket, WikiNarrative, DataCategory } from './types';
import { loadAllEvents, loadAllEntities, loadAllMarkets, loadAllNarratives } from './loader';
import { resolveCanonicalSlug } from './normalizers';

export interface SlugIndex {
  get(slug: string): { category: DataCategory; slug: string } | undefined;
  has(slug: string): boolean;
}

export interface CrossReferences {
  eventsMentioningEntity(entitySlug: string): WikiEvent[];
  eventsMentioningMarket(marketSlug: string): WikiEvent[];
  eventsMentioningNarrative(narrativeSlug: string): WikiEvent[];
  entityBySlug(slug: string): WikiEntity | undefined;
  eventBySlug(slug: string): WikiEvent | undefined;
  marketBySlug(slug: string): WikiMarket | undefined;
  narrativeBySlug(slug: string): WikiNarrative | undefined;
}

export function buildCrossReferences(): CrossReferences {
  const events = loadAllEvents();
  const entities = loadAllEntities();
  const markets = loadAllMarkets();
  const narratives = loadAllNarratives();

  const entityMap = new Map<string, WikiEntity>();
  for (const e of entities) entityMap.set(e.slug.toLowerCase(), e);

  const eventMap = new Map<string, WikiEvent>();
  for (const e of events) eventMap.set(e.slug.toLowerCase(), e);

  const marketMap = new Map<string, WikiMarket>();
  for (const m of markets) marketMap.set(m.slug.toLowerCase(), m);

  const narrativeMap = new Map<string, WikiNarrative>();
  for (const n of narratives) narrativeMap.set(n.slug.toLowerCase(), n);

  return {
    eventsMentioningEntity(entitySlug: string): WikiEvent[] {
      const slug = resolveCanonicalSlug(entitySlug).toLowerCase();
      return events.filter((e) =>
        e.relatedEntities.some((re) => resolveCanonicalSlug(re).toLowerCase() === slug)
      );
    },
    eventsMentioningMarket(marketSlug: string): WikiEvent[] {
      const slug = marketSlug.toLowerCase();
      return events.filter((e) =>
        e.relatedMarkets.some((rm) => rm.toLowerCase() === slug)
      );
    },
    eventsMentioningNarrative(narrativeSlug: string): WikiEvent[] {
      const slug = narrativeSlug.toLowerCase();
      return events.filter((e) => {
        const narrativesRef = narratives.filter(
          (n) =>
            n.relatedEvents.some((re) => re.toLowerCase() === e.slug.toLowerCase())
        );
        return narrativesRef.some((n) => n.slug.toLowerCase() === slug);
      });
    },
    entityBySlug(slug: string): WikiEntity | undefined {
      return entityMap.get(slug.toLowerCase());
    },
    eventBySlug(slug: string): WikiEvent | undefined {
      return eventMap.get(slug.toLowerCase());
    },
    marketBySlug(slug: string): WikiMarket | undefined {
      return marketMap.get(slug.toLowerCase());
    },
    narrativeBySlug(slug: string): WikiNarrative | undefined {
      return narrativeMap.get(slug.toLowerCase());
    },
  };
}

function toSlugForm(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function humanize(input: string): string {
  const noDashes = input.replace(/[-_]/g, ' ');
  return noDashes.replace(/\b\w/g, (c) => c.toUpperCase());
}

function tryResolve(
  candidate: string,
  xref: CrossReferences
): { href: string; label: string; exists: boolean } | null {
  const entity = xref.entityBySlug(candidate);
  if (entity) return { href: `/entities/${entity.slug}`, label: entity.title, exists: true };

  const event = xref.eventBySlug(candidate);
  if (event) return { href: `/events/${event.slug}`, label: event.title, exists: true };

  const market = xref.marketBySlug(candidate);
  if (market) return { href: `/markets/${market.slug}`, label: market.title, exists: true };

  const narrative = xref.narrativeBySlug(candidate);
  if (narrative)
    return { href: `/narratives/${narrative.slug}`, label: narrative.title, exists: true };

  return null;
}

export function resolveSlug(
  slug: string,
  xref: CrossReferences
): { href: string; label: string; exists: boolean } {
  const normalized = slug.toLowerCase();

  const exact = tryResolve(normalized, xref);
  if (exact) return exact;

  const slugForm = toSlugForm(slug);
  if (slugForm !== normalized) {
    const viaSlug = tryResolve(slugForm, xref);
    if (viaSlug) return viaSlug;
  }

  const parenMatch = slug.match(/^(.+?)\s*\((.+?)\)\s*$/);
  if (parenMatch) {
    const name = toSlugForm(parenMatch[1]);
    const detail = toSlugForm(parenMatch[2]);

    const stripped = tryResolve(name, xref);
    if (stripped) return stripped;

    const combined1 = tryResolve(`${name}-${detail}`, xref);
    if (combined1) return combined1;

    const combined2 = tryResolve(`${detail}-${name}`, xref);
    if (combined2) return combined2;
  }

  return { href: '', label: humanize(slug), exists: false };
}
