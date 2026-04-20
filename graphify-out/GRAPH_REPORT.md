# Graph Report - /home/hermes/sigint-wiki  (2026-04-20)

## Corpus Check
- 8 files · ~12,535 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 48 nodes · 69 edges · 11 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]

## God Nodes (most connected - your core abstractions)
1. `readDir()` - 7 edges
2. `parseDailyBriefFile()` - 7 edges
3. `parseBriefFile()` - 6 edges
4. `buildCrossReferences()` - 5 edges
5. `readFile()` - 5 edges
6. `resolveSlug()` - 4 edges
7. `loadAllMarkets()` - 4 edges
8. `parseSectionMarkdown()` - 3 edges
9. `extractTitle()` - 3 edges
10. `loadAllEvents()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `parseSectionMarkdown()` --calls--> `parseBriefFile()`  [INFERRED]
  /home/hermes/sigint-wiki/src/data/parser.ts → /home/hermes/sigint-wiki/src/data/loader.ts
- `extractTitle()` --calls--> `parseDailyBriefFile()`  [INFERRED]
  /home/hermes/sigint-wiki/src/data/parser.ts → /home/hermes/sigint-wiki/src/data/loader.ts
- `parseTextBlock()` --calls--> `parseBriefFile()`  [INFERRED]
  /home/hermes/sigint-wiki/src/data/parser.ts → /home/hermes/sigint-wiki/src/data/loader.ts
- `buildCrossReferences()` --calls--> `loadAllEvents()`  [INFERRED]
  /home/hermes/sigint-wiki/src/data/resolvers.ts → /home/hermes/sigint-wiki/src/data/loader.ts
- `buildCrossReferences()` --calls--> `loadAllEntities()`  [INFERRED]
  /home/hermes/sigint-wiki/src/data/resolvers.ts → /home/hermes/sigint-wiki/src/data/loader.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (4): loadLatestBrief(), parseBriefFile(), extractTitle(), parseTextBlock()

### Community 1 - "Community 1"
Cohesion: 0.36
Nodes (8): loadAllEntities(), loadAllEvents(), loadAllMarkets(), loadAllNarratives(), loadBriefsByDate(), loadEndDateLookup(), readDir(), buildCrossReferences()

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.7
Nodes (4): humanize(), resolveSlug(), toSlugForm(), tryResolve()

### Community 4 - "Community 4"
Cohesion: 0.4
Nodes (5): loadDailyBriefByDate(), loadLatestDailyBrief(), parseDailyBriefFile(), parseYamlFrontmatter(), parseSectionMarkdown()

### Community 5 - "Community 5"
Cohesion: 0.67
Nodes (2): formatMarketMoverVolume(), formatVolume()

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (2): drag(), initRelationshipGraph()

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (2): loadMarketMovers(), readFile()

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 7`** (2 nodes): `loadMarketMovers()`, `readFile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (1 nodes): `tailwind.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `astro.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildCrossReferences()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `parseBriefFile()` connect `Community 0` to `Community 2`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `parseDailyBriefFile()` connect `Community 4` to `Community 0`, `Community 2`, `Community 7`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `parseDailyBriefFile()` (e.g. with `parseSectionMarkdown()` and `extractTitle()`) actually correct?**
  _`parseDailyBriefFile()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `parseBriefFile()` (e.g. with `extractTitle()` and `parseSectionMarkdown()`) actually correct?**
  _`parseBriefFile()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `buildCrossReferences()` (e.g. with `loadAllEvents()` and `loadAllEntities()`) actually correct?**
  _`buildCrossReferences()` has 4 INFERRED edges - model-reasoned connections that need verification._