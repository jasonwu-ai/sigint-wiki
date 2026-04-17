# Design Brief: Signal Intelligence Wiki Refresh v2

## Product Identity

**What we are:** A living, AI-maintained knowledge base for geopolitical intelligence. Not a dashboard. Not a news site. A wiki — deep, structured, interconnected, evolving.

**The showcase story:** "AI agents autonomously built and maintain a 400+ page intelligence wiki — every entity profiled, every event tracked, every market monitored, continuously updated."

**Audience:** Potential clients who need to see what LLM-powered knowledge bases can do. They need to feel the *depth* and *liveness* immediately.

---

## Visual Direction: "Linear meets Bloomberg Terminal"

Our product sits at an intersection — it needs the **precision and restraint of a developer tool** (like Linear) but the **data density of a financial terminal** (like Bloomberg). The current dark theme is right, but it needs to evolve from "generic dashboard" to "engineered knowledge system."

### Primary Reference: Linear
- Near-black canvas with content emerging from darkness
- Semi-transparent borders that create structure without visual noise
- Inter font with precise weight hierarchy
- One accent color, used sparingly
- Extreme typographic precision

### Secondary Reference: Notion
- Cross-reference navigation that feels natural (clicking between linked pages)
- Clean card-based content layout
- Warm undertones that prevent coldness

### Anti-reference: ElevenLabs, SpaceX
- NOT cinematic/photographic — we're a data product, not a media product
- NOT light theme — dark conveys "intelligence" and "analysis"
- NOT minimal to the point of losing information density

---

## Design System

### Color Palette

```
Backgrounds:
  --bg-canvas:     #08090a    /* Page background — near-black */
  --bg-panel:      #0f1011    /* Sidebar, nav */
  --bg-surface:    #191a1b    /* Cards, containers */
  --bg-elevated:   #28282c    /* Hover states, raised elements */

Text:
  --text-primary:  #f7f8f8    /* Headings — near-white, not pure */
  --text-body:     #d0d6e0    /* Body text — cool silver */
  --text-muted:    #8a8f98    /* Metadata, timestamps */
  --text-faint:    #62666d    /* Disabled, deep background */

Accent (intelligence teal — distinct from generic blue):
  --accent:        #14b8a6    /* Primary interactive — teal/emerald */
  --accent-hover:  #2dd4bf    /* Hover state */
  --accent-muted:  rgba(20, 184, 166, 0.15)  /* Tinted backgrounds */

Status Colors:
  --fresh:         #10b981    /* Green — updated today */
  --recent:        #f59e0b    /* Amber — this week */
  --stale:         #62666d    /* Grey — >1 week */
  --active:        #f59e0b    /* Amber — active event */
  --resolved:      #10b981    /* Green — resolved */

Content Type Colors:
  --type-event:    #f59e0b    /* Amber — events */
  --type-entity:   #3b82f6    /* Blue — entities */
  --type-market:   #10b981    /* Green — markets */
  --type-narrative:#a855f7    /* Purple — narratives */

Borders:
  --border:        rgba(255, 255, 255, 0.08)
  --border-subtle: rgba(255, 255, 255, 0.05)
```

### Typography

```
Font: Inter (via Google Fonts CDN)
Monospace: JetBrains Mono (for dates, IDs, confidence scores)

Hierarchy:
  Display (hero):     48px, weight 510, -1.056px tracking
  Section heading:    32px, weight 510, -0.704px tracking
  Card title:         20px, weight 590, -0.24px tracking
  Body:               16px, weight 400, normal tracking
  Metadata:           14px, weight 510, -0.182px tracking
  Badge/tag:          12px, weight 510, normal tracking
  Mono (dates/IDs):   13px, weight 400, JetBrains Mono
```

### Spacing & Layout

```
Grid: 8px base unit
Container max-width: 1200px
Section padding: 80px vertical (desktop), 48px (mobile)
Card radius: 12px
Button radius: 6px (standard), 9999px (pills)
```

---

## Page Designs

### 1. Homepage (wiki.zyoulabs.ai)

**Purpose:** Showcase landing — make visitors feel the depth and liveness in 5 seconds.

```
┌──────────────────────────────────────────────────┐
│  NAV: Logo "Signal Intelligence Wiki"  [Search]  │
│        Events Entities Markets Narratives  [→Intel]│
├──────────────────────────────────────────────────┤
│                                                  │
│  A living knowledge base,                       │
│  maintained by AI agents.                       │
│                                                  │
│  174 events · 144 entities · 54 markets         │
│  Last updated 2 hours ago                       │
│                                                  │
│  [Explore the Wiki]  [Today's Brief →]          │
│                                                  │
├──────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │ ● LIVE      │ │ SAMPLE      │ │ SAMPLE     │ │
│  │ Event Card  │ │ Entity Card │ │ Market Card│ │
│  │ Freshness ● │ │ with tags   │ │ with bar   │ │
│  │ Updated 2h  │ │ and type    │ │ and volume │ │
│  └─────────────┘ └─────────────┘ └────────────┘ │
│                                                  │
│  [View all events →] [Browse entities →] [...]   │
├──────────────────────────────────────────────────┤
│  HOW IT WORKS                                   │
│  Collector → Compiler → Analyst → Wiki          │
│  Every page is generated and maintained by...    │
│  [Methodology →]                                │
├──────────────────────────────────────────────────┤
│  FOOTER: Generated by AI agents · Built with... │
└──────────────────────────────────────────────────┘
```

Key design elements:
- **Hero**: Tight, compressed headline at 48px Inter 510 with negative tracking. Not big and shouty — precise and confident.
- **Live stats**: Monospace counter with teal accent dots. Feels like a terminal readout.
- **Sample cards**: 3 cards showing the depth of each content type. Freshness indicators visible.
- **"Browse Events →"**: Links to /events. Subtle but present.
- **How it works**: Brief methodology section. Shows the AI pipeline as a feature.

### 2. Entity Detail Page

**Purpose:** The showcase page. When someone clicks an entity, they need to see structured, deep knowledge — not a text dump.

```
┌──────────────────────────────────────────────────┐
│  ← Back to Entities     [Search]                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  🟢 IRAN                                         │
│  ┌────────────────────────────────────────────┐  │
│  │ Type: Nation-State  |  Region: Middle East  │  │
│  │ Tags: [Nuclear] [Oil] [IRGC] [Hormuz]      │  │
│  │ Last updated: 2 hours ago by Analyst        │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────┐  ┌─────────────────────┐  │
│  │ STATED OBJECTIVES │  │ INFERRED OBJECTIVES  │  │
│  │                  │  │                     │  │
│  │ • Nuclear...     │  │ • Regional...       │  │
│  │ • Economic...    │  │ • Regime...         │  │
│  └──────────────────┘  └─────────────────────┘  │
│                                                  │
│  CONNECTIONS (interactive graph)                 │
│  ┌────────────────────────────────────────────┐  │
│  │     [Event]──[Entity]──[Market]             │  │
│  │        \       |       /                    │  │
│  │      [Narrative]                             │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  TRACK RECORD                                    │
│  ┌────────────────────────────────────────────┐  │
│  │ 2026-04 │ Claimed X → Did Y (diverged)     │  │
│  │ 2026-03 │ Claimed Z → Did Z (aligned)      │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  RELATED EVENTS (card grid)                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │Event │ │Event │ │Event │ │Event │           │
│  └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                  │
│  AFFECTED MARKETS                                │
│  ┌──────────────────────────────────────────┐   │
│  │ Will China invade Taiwan?  ████░░  8.7% │   │
│  │ Russia-Ukraine ceasefire?  ██░░░░ 29.5% │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ─────────────────────────────────────────────── │
│  Generated by AI agents · Updated by Analyst     │
│  2026-04-15 · Sources: 23 events, 7 markets      │
└──────────────────────────────────────────────────┘
```

### 3. Freshness Indicator System

Visual system for data freshness — applied to all card components and detail pages:

```
🟢  Updated today     — bright green dot (#10b981)
🟡  This week         — amber dot (#f59e0b)  
⚪  >1 week ago       — grey dot (#62666d)

Card component:
┌─────────────────────────┐
│ 🟢 Iran Nuclear Talks   │  ← freshness dot + title
│ Active · Middle East    │  ← status badge + theatre
│ Updated 2h ago          │  ← relative timestamp
└─────────────────────────┘
```

### 4. Provenance Footer

Every page gets this:

```
───────────────────────────────────────────────
🤖 Generated by AI agents · Maintained by Analyst
   Last updated: 2026-04-15 08:17 UTC
   Sources: 23 events · 7 markets · 15 entities
   Pipeline: Collector → Compiler → Analyst
───────────────────────────────────────────────
```

### 5. Search (Cmd/Ctrl+K)

```
┌────────────────────────────────────────┐
│ 🔍  Search the wiki...                 │
│                                        │
│  [All] [Events] [Entities] [Markets]   │
│                                        │
│  📰 Iran Nuclear Enrichment 2026      │
│     Event · Updated 3h ago             │
│                                        │
│  🏛️ Iran                              │
│     Entity · Nation-State              │
│                                        │
│  📊 Will China invade Taiwan?         │
│     Market · 8.7% · Vol: $19.6M       │
│                                        │
│  Tab to navigate · Enter to open       │
└────────────────────────────────────────┘
```

### 6. Interactive Relationship Graph

D3.js force-directed graph on entity and event pages:

```
Node colors:
  ● Amber  = Events
  ● Blue   = Entities  
  ● Green  = Markets
  ● Purple = Narratives

Interactions:
  - Click node → navigate to page
  - Hover node → tooltip with title + last updated
  - Drag → rearrange layout
  - Graph animates in on page load
```



## Implementation Notes

- **Astro + Tailwind** — already in the stack, keep it
- **Tailwind custom colors** — map to the CSS variables above
- **D3.js** — loaded via `<script>` tag, not npm (keeps bundle small)
- **Pagefind** — added as build step, zero runtime cost
- **Fonts** — Google Fonts CDN for Inter + JetBrains Mono
- **No JavaScript frameworks** — Astro islands only where needed (graph, search)
- **Static-first** — every page pre-rendered at build time, client-side JS only for interactivity
