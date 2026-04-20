export interface WikiEvent {
  slug: string;
  title: string;
  status: string;
  theatre: string;
  themes: string[];
  timeline: string[];
  narrativeDivergence: string | null;
  relatedEntities: string[];
  relatedMarkets: string[];
  lastUpdated: string | null; // Latest timeline entry date (event occurrence)
}

export interface WikiEntity {
  slug: string;
  title: string;
  type: string;
  affiliations: string | null;
  objectives: string | null;
  claimsAndTrackRecord: string | null;
  divergences: string | null;
  connections: string | null;
  lastUpdated: string | null; // Latest date found in entity file (if any)
}

export interface WikiMarket {
  slug: string;
  title: string;
  polymarketId: string;
  currentProbability: { yes: number; no: number };
  volume: string;
  volumeRaw: number;
  history: Array<{ timestamp: string; yes: number }>;
  context: string | null;
  relatedEvents: string[];
  endDate: string | null;
  expired: boolean;
  lastUpdated: string | null;
}

export interface WikiNarrative {
  slug: string;
  title: string;
  summary: string | null;
  firstObserved: string | null;
  pushedBy: string[];
  evolution: string[];
  counterNarratives: string[];
  relatedEvents: string[];
  lastUpdated: string | null;
}

export interface IntelligenceBrief {
  date: string;
  time: string;
  title: string;
  summary: string | null;
  topDevelopments: string;
  marketSignals: string | null;
  rawContent: string;
  filePath: string;
}

export interface MarketMover {
  marketId: string;
  question: string;
  yesProbability: number;
  volume: number;
  endDate: string;
  active: boolean;
}

export interface MarketMovers {
  generatedAt: string;
  topGeoMarkets: MarketMover[];
  commodities: {
    gold_usd?: number;
    forex_usd?: Record<string, number>;
  };
  treasury: Record<string, { rate: number; date: string }>;
}

export type DataCategory = 'event' | 'entity' | 'market' | 'narrative';

export interface SlugIndexEntry {
  category: DataCategory;
  slug: string;
}

export interface DailyBrief {
  date: string;
  generated: string;
  eventsAnalysed: string[];
  entitiesReferenced: string[];
  marketsReferenced: string[];
  confidenceFlag: string;
  title: string;
  topDevelopments: string;
  narrativeMap: string;
  divergenceAlerts: string;
  marketSignals: string;
  scenarioSpotlight: string;
  methodology: string;
  rawContent: string;
}
