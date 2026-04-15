interface HistoryPoint {
  timestamp: string;
  yes: number;
}

export function generateProbabilityChart(
  history: HistoryPoint[],
  width = 600,
  height = 200
): string | null {
  if (history.length < 2) return null;

  const allSame = history.every((h) => h.yes === history[0].yes);
  if (allSame) return null;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const sorted = [...history].reverse();

  const yesValues = sorted.map((h) => h.yes);
  const minYes = Math.min(...yesValues);
  const maxYes = Math.max(...yesValues);
  const rangeBuffer = Math.max((maxYes - minYes) * 0.1, 1);
  const yMin = Math.max(0, minYes - rangeBuffer);
  const yMax = Math.min(100, maxYes + rangeBuffer);

  function xPos(i: number): number {
    return padding.left + (i / (sorted.length - 1)) * chartWidth;
  }

  function yPos(val: number): number {
    return padding.top + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;
  }

  const points = sorted.map((h, i) => `${xPos(i)},${yPos(h.yes)}`).join(' ');

  const areaPoints = sorted
    .map((h, i) => `${xPos(i)},${yPos(h.yes)}`)
    .join(' ');
  const areaPath = `${padding.left},${yPos(yMin)} ${areaPoints} ${xPos(sorted.length - 1)},${yPos(yMin)}`;

  const yTicks = 5;
  const yTickLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = yMin + ((yMax - yMin) * i) / yTicks;
    const y = yPos(val);
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#1c1f2e" stroke-width="1"/>
            <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" fill="#6b7280" font-size="11">${val.toFixed(1)}%</text>`;
  }).join('\n');

  const xLabels = sorted.length > 10
    ? sorted.filter((_, i) => i % Math.ceil(sorted.length / 6) === 0 || i === sorted.length - 1)
    : sorted;

  const xTickLabels = xLabels
    .map((h) => {
      const i = sorted.indexOf(h);
      const dateOnly = h.timestamp.split(' ')[0];
      const dateParts = dateOnly.split('-');
      const label = `${dateParts[1]}/${dateParts[2]}`;
      return `<text x="${xPos(i)}" y="${height - 8}" text-anchor="middle" fill="#6b7280" font-size="10">${label}</text>`;
    })
    .join('\n');

  const currentVal = sorted[sorted.length - 1].yes;

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="w-full" style="max-width:${width}px">
  <defs>
    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5c7cfa" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#5c7cfa" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#0f1117" rx="4"/>
  ${yTickLines}
  <polygon points="${areaPath}" fill="url(#areaGrad)"/>
  <polyline points="${points}" fill="none" stroke="#5c7cfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${xPos(sorted.length - 1)}" cy="${yPos(currentVal)}" r="4" fill="#5c7cfa"/>
  <text x="${xPos(sorted.length - 1) + 8}" cy="${yPos(currentVal)}" y="${yPos(currentVal) + 4}" fill="#e2e8f0" font-size="11" font-weight="600">${currentVal}%</text>
  ${xTickLabels}
</svg>`;
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatMarketMoverVolume(value: number): string {
  return formatVolume(value);
}
