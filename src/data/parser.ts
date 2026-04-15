export function parseSectionMarkdown(rawContent: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = rawContent.split('\n');
  let currentSection: string | null = null;
  let currentBody: string[] = [];

  for (const line of lines) {
    const headerMatch = /^## (.+)$/.exec(line);
    if (headerMatch) {
      if (currentSection !== null) {
        sections.set(currentSection.toLowerCase().trim(), currentBody.join('\n').trim());
      }
      currentSection = headerMatch[1];
      currentBody = [];
    } else if (currentSection !== null) {
      currentBody.push(line);
    }
  }

  if (currentSection !== null) {
    sections.set(currentSection.toLowerCase().trim(), currentBody.join('\n').trim());
  }

  return sections;
}

export function extractTitle(rawContent: string): string {
  const match = /^# (.+)$/m.exec(rawContent);
  return match ? match[1].trim() : 'Untitled';
}

export function parseSingleLine(sections: Map<string, string>, key: string): string {
  const body = sections.get(key.toLowerCase());
  if (!body) return '';
  return body.split('\n')[0].trim();
}

export function parseCommaList(sections: Map<string, string>, key: string): string[] {
  const body = sections.get(key.toLowerCase());
  if (!body) return [];
  return body
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseBulletList(sections: Map<string, string>, key: string): string[] {
  const body = sections.get(key.toLowerCase());
  if (!body) return [];
  return body
    .split('\n')
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

export function parseTextBlock(sections: Map<string, string>, key: string): string | null {
  const body = sections.get(key.toLowerCase());
  if (!body) return null;
  const trimmed = body.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseProbability(raw: string): { yes: number; no: number } | null {
  const match = /Yes:\s*([\d.]+)%\s*\|\s*No:\s*([\d.]+)%/.exec(raw);
  if (!match) return null;
  return { yes: parseFloat(match[1]), no: parseFloat(match[2]) };
}

export function parseHistoryEntry(entry: string): { timestamp: string; yes: number } | null {
  const match = /\[(.+?)\]\s*Yes:\s*([\d.]+)%/.exec(entry);
  if (!match) return null;
  return { timestamp: match[1], yes: parseFloat(match[2]) };
}

export function parseVolume(raw: string): { display: string; numeric: number } {
  const cleaned = raw.replace(/[$,]/g, '');
  const numeric = parseFloat(cleaned);
  return { display: raw.trim(), numeric: isNaN(numeric) ? 0 : numeric };
}

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

export function parseEndDateFromTitle(title: string): Date | null {
  const lower = title.toLowerCase();

  let m: RegExpExecArray | null;

  m = /(?:by|before)\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i.exec(lower);
  if (m) {
    const month = MONTHS[m[1]];
    if (month) return new Date(Date.UTC(+m[3], month - 1, +m[2], 23, 59, 59));
  }

  m = /(?:by|before)\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i.exec(lower);
  if (m) {
    const month = MONTHS[m[1]];
    if (month) return new Date(Date.UTC(+m[2], month - 1, 28, 23, 59, 59));
  }

  m = /(?:by|before|in)\s+(?:the\s+end\s+(?:of\s+)?)?(\d{4})/i.exec(lower);
  if (m) return new Date(Date.UTC(+m[1], 11, 31, 23, 59, 59));

  m = /(?:by|before|in)\s+(\d{4})/i.exec(lower);
  if (m) return new Date(Date.UTC(+m[1], 11, 31, 23, 59, 59));

  return null;
}
