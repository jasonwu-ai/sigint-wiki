# Slice 1 — #39 Remove dead link to intel.zyoulabs.ai (CRITICAL)

**Project:** `/home/hermes/sigint-wiki`
**Issue:** [#39](https://github.com/jasonwu-ai/sigint-wiki/issues/39)
**Branch:** `fix/39-remove-dead-intel-link`
**Deadline:** EOD April 18 UTC

## What

The homepage CTA "Today's Brief →" links to `https://intel.zyoulabs.ai` which shows only "Coming soon." This is a dead link and must be removed or replaced before Jason's demo.

**File:** `src/pages/index.astro` (line 84)

**Current code:**
```astro
<a href="https://intel.zyoulabs.ai" target="_blank" rel="noopener"
   class="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium transition-colors">
  Today's Brief →
</a>
```

## Fix

Replace the dead link with one of these working CTAs (choose the one that makes most sense for the design):

**Option A (recommended):** Change to `/events` — browse the latest events feed:
```astro
<a href="/events"
   class="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium transition-colors">
  Browse Events →
</a>
```

**Option B:** Change to `/entities` — browse the entity list:
```astro
<a href="/entities"
   class="px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium transition-colors">
  Browse Entities →
</a>
```

Also update the DESIGN-BRIEF.md reference at line 147 that mentions the intel.zyoulabs.ai link.

## Done When

- `https://intel.zyoulabs.ai` is no longer linked from any wiki page
- The homepage has a working, meaningful CTA in place
- `/events` or `/entities` (or another valid page) loads correctly when clicked
- DESIGN-BRIEF.md updated to remove intel.zyoulabs.ai reference
- Run a quick grep for "intel.zyoulabs" across the repo to confirm zero occurrences
