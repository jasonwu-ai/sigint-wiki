import fs from 'node:fs';
import path from 'node:path';
import {
  parseSectionMarkdown,
  extractTitle,
  parseSingleLine,
  parseCommaList,
  parseBulletList,
  parseTextBlock,
  parseProbability,
  parseHistoryEntry,
  parseVolume,
  parseEndDateFromTitle,
} from './parser';
import type {
  WikiEvent,
  WikiEntity,
  WikiMarket,
  WikiNarrative,
  IntelligenceBrief,
  MarketMovers,
  MarketMover,
  DailyBrief,
} from './types';

// SigInt pipeline writes data to /home/paperclip/signal-intelligence/
const DATA_ROOT = process.env.WIKI_DATA_ROOT || '/home/paperclip/signal-intelligence';

function readDir(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
}

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, '');
}

function cleanBulletList(list: string[]): string[] {
  return list.filter(
    (item) =>
      item !== '(none linked yet)' &&
      item !== '(none)' &&
      item !== '(none yet)' &&
      item.trim() !== ''
  );
}

function extractLatestDateFromTimeline(timeline: string[]): string | null {
  let latest: string | null = null;
  for (const entry of timeline) {
    const m = entry.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m && (!latest || m[1] > latest)) latest = m[1];
  }
  return latest;
}

function extractLatestDateFromRaw(raw: string): string | null {
  const matches = raw.match(/\d{4}-\d{2}-\d{2}/g);
  if (!matches || matches.length === 0) return null;
  return matches.reduce((a, b) => (a > b ? a : b));
}

export function loadAllEvents(): WikiEvent[] {
  const dir = path.join(DATA_ROOT, 'wiki', 'events');
  const files = readDir(dir);

  return files.map((file) => {
    const filePath = path.join(dir, file);
    const raw = readFile(filePath);
    const slug = slugFromFilename(file);
    const title = extractTitle(raw);
    const sections = parseSectionMarkdown(raw);
    const timeline = parseBulletList(sections, 'timeline');

    return {
      slug,
      title,
      status: parseSingleLine(sections, 'status'),
      theatre: parseSingleLine(sections, 'theatre'),
      themes: parseCommaList(sections, 'themes'),
      timeline,
      narrativeDivergence: parseTextBlock(sections, 'narrative divergence'),
      relatedEntities: cleanBulletList(parseBulletList(sections, 'related entities')),
      relatedMarkets: cleanBulletList(parseBulletList(sections, 'related markets')),
      lastUpdated: extractLatestDateFromTimeline(timeline),
      pageUpdated: fs.statSync(filePath).mtime.toISOString().split('T')[0],
    };
  }).sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
}

export function loadAllEntities(): WikiEntity[] {
  const dir = path.join(DATA_ROOT, 'wiki', 'entities');
  const files = readDir(dir);

  return files.map((file) => {
    const filePath = path.join(dir, file);
    const raw = readFile(filePath);
    const slug = slugFromFilename(file);
    const title = extractTitle(raw);
    const sections = parseSectionMarkdown(raw);

    return {
      slug,
      title,
      type: parseSingleLine(sections, 'type'),
      affiliations: parseTextBlock(sections, 'affiliations'),
      objectives: parseTextBlock(sections, 'objectives'),
      claimsAndTrackRecord: parseTextBlock(sections, 'claims & track record'),
      divergences: parseTextBlock(sections, 'divergences'),
      connections: parseTextBlock(sections, 'connections'),
      lastUpdated: extractLatestDateFromRaw(raw),
      pageUpdated: fs.statSync(filePath).mtime.toISOString().split('T')[0],
    };
  }).sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
}

export function loadAllMarkets(): WikiMarket[] {
  const dir = path.join(DATA_ROOT, 'wiki', 'markets');
  const files = readDir(dir);

  const moversEndDate = loadEndDateLookup();

  return files.map((file) => {
    const filePath = path.join(dir, file);
    const raw = readFile(filePath);
    const slug = slugFromFilename(file);
    const title = extractTitle(raw);
    const sections = parseSectionMarkdown(raw);

    const probRaw = parseSingleLine(sections, 'current probability');
    const prob = parseProbability(probRaw);

    const volRaw = parseSingleLine(sections, 'volume');
    const vol = parseVolume(volRaw);

    const historyRaw = parseBulletList(sections, 'history');
    const history = historyRaw
      .map((entry) => parseHistoryEntry(entry))
      .filter((h): h is { timestamp: string; yes: number } => h !== null);

    const polymarketId = parseSingleLine(sections, 'polymarket id');
    const titleEndDate = parseEndDateFromTitle(title);
    const moverEndDate = moversEndDate.get(polymarketId);
    const endDate = moverEndDate ?? titleEndDate;
    const now = new Date();

    return {
      slug,
      title,
      polymarketId,
      currentProbability: prob || { yes: 0, no: 0 },
      volume: vol.display,
      volumeRaw: vol.numeric,
      history,
      context: parseTextBlock(sections, 'context'),
      relatedEvents: cleanBulletList(parseBulletList(sections, 'related events')),
      endDate: endDate ? endDate.toISOString() : null,
      expired: endDate !== null && endDate < now,
      lastUpdated: extractLatestDateFromRaw(raw),
      pageUpdated: fs.statSync(filePath).mtime.toISOString().split('T')[0],
    };
  });
}

function loadEndDateLookup(): Map<string, Date> {
  const lookup = new Map<string, Date>();
  const filePath = path.join(DATA_ROOT, 'raw', 'market-movers.json');
  try {
    const raw = readFile(filePath);
    const data = JSON.parse(raw);
    for (const m of data.top_geo_markets || []) {
      const mid = m.market_id;
      const ed = m.end_date;
      if (mid && ed) {
        lookup.set(String(mid), new Date(ed));
      }
    }
  } catch {
    // market-movers.json may not exist yet
  }
  return lookup;
}

export function loadAllNarratives(): WikiNarrative[] {
  const dir = path.join(DATA_ROOT, 'wiki', 'narratives');
  const files = readDir(dir);

  return files.map((file) => {
    const filePath = path.join(dir, file);
    const raw = readFile(filePath);
    const slug = slugFromFilename(file);
    const title = extractTitle(raw);
    const sections = parseSectionMarkdown(raw);

    return {
      slug,
      title,
      summary: parseTextBlock(sections, 'summary'),
      firstObserved: parseSingleLine(sections, 'first observed') || null,
      pushedBy: parseBulletList(sections, 'pushed by'),
      evolution: parseBulletList(sections, 'evolution'),
      counterNarratives: parseBulletList(sections, 'counter-narratives'),
      relatedEvents: cleanBulletList(parseBulletList(sections, 'related events')),
      lastUpdated: extractLatestDateFromRaw(raw),
      pageUpdated: fs.statSync(filePath).mtime.toISOString().split('T')[0],
    };
  });
}

export function loadLatestBrief(): IntelligenceBrief | null {
  const briefsDir = path.join(DATA_ROOT, 'raw', 'briefs');
  try {
    const dates = fs
      .readdirSync(briefsDir)
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse();

    if (dates.length === 0) return null;

    for (const date of dates) {
      const dateDir = path.join(briefsDir, date);
      const files = readDir(dateDir).sort().reverse();
      if (files.length === 0) continue;

      const file = files[0];
      return parseBriefFile(path.join(dateDir, file), date);
    }

    return null;
  } catch {
    return null;
  }
}

export function loadBriefsByDate(date: string): IntelligenceBrief[] {
  const dateDir = path.join(DATA_ROOT, 'raw', 'briefs', date);
  const files = readDir(dateDir).sort().reverse();

  return files.map((file) => parseBriefFile(path.join(dateDir, file), date));
}

function parseBriefFile(filePath: string, date: string): IntelligenceBrief {
  const raw = readFile(filePath);
  const filename = path.basename(filePath);
  const timeMatch = /^brief-(\d+)\.md$/.exec(filename);
  const time = timeMatch ? timeMatch[1] : '0000';

  const title = extractTitle(raw);
  const sections = parseSectionMarkdown(raw);

  return {
    date,
    time,
    title: title || `Intelligence Brief — ${date} ${time}`,
    summary: parseTextBlock(sections, 'summary'),
    topDevelopments: sections.get('top developments') || '',
    marketSignals: parseTextBlock(sections, 'market signals'),
    rawContent: raw,
    filePath,
  };
}

export function loadMarketMovers(): MarketMovers {
  const filePath = path.join(DATA_ROOT, 'raw', 'market-movers.json');
  const raw = readFile(filePath);
  const data = JSON.parse(raw);
  const now = new Date();

  const allMarkets: MarketMover[] = (data.top_geo_markets || []).map(
    (m: Record<string, unknown>): MarketMover => ({
      marketId: m.market_id as string,
      question: m.question as string,
      yesProbability: m.yes_probability as number,
      volume: m.volume as number,
      endDate: m.end_date as string,
      active: m.active as boolean,
    })
  );

  const activeMarkets = allMarkets.filter((m) => {
    if (!m.endDate) return true;
    return new Date(m.endDate) >= now;
  });

  return {
    generatedAt: data.generated_at,
    topGeoMarkets: activeMarkets,
    commodities: data.commodities || {},
    treasury: data.treasury || {},
  };
}


function parseYamlFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };
  const fm: Record<string, unknown> = {};
  let currentKey = '';
  let currentList: string[] | null = null;
  for (const line of match[1].split('\n')) {
    const kvMatch = line.match(/^(\w[\w_]+):\s*(.*)$/);
    if (kvMatch) {
      if (currentKey && currentList) fm[currentKey] = currentList;
      currentKey = kvMatch[1];
      currentList = null;
      const val = kvMatch[2].trim();
      if (val === '') {
        currentList = [];
      } else {
        fm[currentKey] = val;
        currentKey = '';
      }
    } else if (currentList !== null && line.match(/^\s+-\s+/)) {
      currentList.push(line.replace(/^\s+-\s+/, '').trim());
    }
  }
  if (currentKey && currentList) fm[currentKey] = currentList;
  return { frontmatter: fm, body: match[2] };
}

export function loadLatestDailyBrief(): DailyBrief | null {
  const dir = path.join(DATA_ROOT, 'daily-brief');
  try {
    const files = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .reverse();
    if (files.length === 0) return null;
    return parseDailyBriefFile(path.join(dir, files[0]));
  } catch {
    return null;
  }
}

export function loadDailyBriefByDate(date: string): DailyBrief | null {
  const filePath = path.join(DATA_ROOT, 'daily-brief', `${date}.md`);
  try {
    return parseDailyBriefFile(filePath);
  } catch {
    return null;
  }
}

export function loadAllDailyBriefs(): DailyBrief[] {
  const dir = path.join(DATA_ROOT, 'daily-brief');
  try {
    const files = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .reverse();
    return files.map((f) => parseDailyBriefFile(path.join(dir, f)));
  } catch {
    return [];
  }
}

function parseDailyBriefFile(filePath: string): DailyBrief {
  const raw = readFile(filePath);
  const { frontmatter, body } = parseYamlFrontmatter(raw);
  const sections = parseSectionMarkdown(body);

  return {
    date: (frontmatter.date as string) || '',
    generated: (frontmatter.generated as string) || '',
    eventsAnalysed: Array.isArray(frontmatter.events_analysed) ? (frontmatter.events_analysed as string[]) : [],
    entitiesReferenced: Array.isArray(frontmatter.entities_referenced) ? (frontmatter.entities_referenced as string[]) : [],
    marketsReferenced: Array.isArray(frontmatter.markets_referenced) ? (frontmatter.markets_referenced as string[]) : [],
    confidenceFlag: (frontmatter.confidence_flag as string) || 'normal',
    title: extractTitle(body),
    topDevelopments: sections.get('top developments') || '',
    narrativeMap: sections.get('narrative map') || '',
    divergenceAlerts: sections.get('divergence alerts') || '',
    marketSignals: sections.get('market signals') || '',
    scenarioSpotlight: sections.get('scenario spotlight') || '',
    methodology: sections.get('methodology') || '',
    rawContent: raw,
  };
}
