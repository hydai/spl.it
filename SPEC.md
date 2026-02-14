# SPEC: findthename

## 1. Intent

### 1.1 Purpose

findthename generates creative domain name suggestions from a user-provided project name or idea, with domain hacks as the primary feature.

### 1.2 Users

| User | Goal |
|------|------|
| Indie developer / founder | Find a memorable domain for a new project or startup |
| Side-project hobbyist | Explore domain name ideas before purchasing from a registrar |
| Brand creator | Discover clever domain hacks and word plays |

### 1.3 Impacts

| Behavior Change | Indicator |
|-----------------|-----------|
| Users discover domain names they wouldn't think of | Users generate suggestions and copy results |
| Users find domain hacks within their project names | Domain hack results appear for valid TLD splits |
| Users explore the full TLD space | Users filter/sort across 1500+ TLDs |

### 1.4 Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Suggestions appear in under 500ms | Client-side timing from debounce end to render |
| Domain hack algorithm finds all valid TLD splits | "notify" produces noti.fy; "fantastic" produces fantas.tic |
| At least 5 strategies produce results for common words | Verify with: "notify", "cloud", "fantastic", "delicious", "stream" |
| Works on mobile (360px+) | Visual verification |

### 1.5 Non-Goals

- Real-time domain availability checking (WHOIS/API)
- User accounts or server-side sessions
- Domain purchase or registrar integration
- AI/LLM-generated suggestions
- Internationalized domain names (IDN/punycode)

---

## 2. Design

### 2.1 System Boundary

| Type | Definition |
|------|-----------|
| Responsibility | Generates domain name suggestions from user input. Does not verify availability or register domains. |
| Interaction | Input: string (1-100 chars, alphanumeric + hyphens + spaces). Output: suggestions grouped by strategy. |
| Control | Controls: suggestion algorithms, TLD dataset, UI. Depends on: IANA TLD list (static, bundled at build time). |

### 2.2 TLD Data

| Decision | Detail |
|----------|--------|
| Source | IANA Root Zone Database (tlds-alpha-by-domain.txt) |
| Storage | Bundled as static JSON at build time |
| Update | Rebuild/redeploy to pick up new TLDs |
| Format | JSON array: `{ id: string, type: "ccTLD"\|"gTLD"\|"sTLD", length: number }` |
| Index | Secondary Map keyed by TLD length for domain hack algorithm |

A build-time script fetches from IANA, parses, enriches with type metadata, and writes `src/data/tlds.json`.

### 2.3 User Journey

```
Landing Page → User types input (debounce 300ms)
  → Suggestion engine runs client-side (all 6 strategies in parallel)
  → Results displayed (domain hacks first, then other strategies)
  → User copies, favorites, filters, or sorts results
```

URL query param `?q=notify` syncs with input, making results shareable.

### 2.4 Suggestion Strategies

All strategies are pure functions: `(input: string, tlds: TLDData) => Suggestion[]`

Normalized input: lowercase, trimmed, spaces → hyphens for multi-word.

#### Strategy A: Domain Hacks (Priority)

Split the input so its suffix matches a valid TLD: `prefix.tld`.

Algorithm: For each TLD length L (2 to min(inputLen-1, maxTLDLen)), check if the input's last L characters match a TLD. If the remaining prefix has >= 1 character, it's a valid domain hack.

Scoring factors:

| Factor | Weight | Logic |
|--------|--------|-------|
| Clean word boundary | 3 | Split falls on syllable/morpheme boundary |
| Prefix pronounceability | 2 | Prefix contains at least one vowel |
| TLD familiarity | 1 | Bonus for well-known TLDs (.com, .io, .ly, .co, .me, .us, .am, .to, .is) |
| Shorter prefix | 1 | More of the word captured in TLD |

Multi-level hacks: After finding a TLD match, recursively check if the prefix itself ends with another TLD (e.g., del.icio.us). Max recursion depth: 3.

For multi-word input, also run on the concatenated form ("cloud storage" → "cloudstorage").

#### Strategy B: Prefix Additions

Prepend: get, try, use, my, go, the, hey, just, oh, on, hello, hi, meet, join, with, be, do, re, make.

Pair each with 15-20 popular TLDs. Also run domain hack detection on prefixed forms.

#### Strategy C: Suffix Additions

Append: app, hq, hub, labs, dev, run, go, up, now, io, base, kit, box, pad, nest, ware, works, zone, spot, land.

Same TLD pairing and domain hack detection as Strategy B.

#### Strategy D: Abbreviations

| Technique | Example ("notification") |
|-----------|--------------------------|
| Drop vowels | ntfctn |
| First N chars (3-6) | not, noti, notif, notifi |
| Initials (multi-word) | "cloud storage" → cs |
| Consonant cluster | ntfy |

Pair with TLDs and run domain hack detection.

#### Strategy E: Alternative Spellings

| Technique | Example |
|-----------|---------|
| ph ↔ f | notiphy |
| y ↔ i | notifi |
| k for c, z for s, x for cks | Applied when substitution is valid |

Pair with TLDs and run domain hack detection.

#### Strategy F: Word Play

| Technique | Example ("cloud") |
|-----------|-------------------|
| Compound words | cloudcraft, cloudbird, cloudpeak |
| Rhyming suffix | clout, loud, shroud |
| Alliteration | clickcloud |

Uses ~200 built-in combining words (craft, bird, peak, wave, spark, bolt, flux, forge, pulse, etc.).

### 2.5 Result Presentation

**Result card elements**: domain string (TLD in accent color), strategy badge, TLD type indicator, copy button, favorite (star) button.

**Layout**:
- Hero section: Domain Hacks (prominent, larger cards)
- Below: Other strategies in collapsible accordion sections with count headers

**Filtering** (toolbar above results):

| Filter | Options |
|--------|---------|
| TLD Type | All, ccTLD, gTLD, sTLD |
| Strategy | All, or specific strategies |
| TLD Length | All, 2-letter, 3-letter, 4+ |
| Search within results | Text substring filter |

**Sorting**: Relevance (default), Alphabetical, TLD Popularity, Shortest first.

### 2.6 UI Screens

**Landing**: App name wordmark, tagline, large centered search input with placeholder, example chips below (notify, cloud storage, fantastic, delicious, stream).

**Results**: Appear below search (same page). Search input stays fixed at top. URL updates to `?q=input`.

| Viewport | Layout |
|----------|--------|
| Desktop (1024px+) | 2-3 column card grid, filter toolbar, favorites sidebar |
| Tablet (768-1023px) | 2-column grid, collapsible filter bar, favorites below |
| Mobile (<768px) | Single column, sticky search, filter bottom sheet, favorites via icon |

**Favorites**: Persisted in localStorage (`findthename_favorites`). Star to add, star again to remove. Clear all action. Accessible via header icon or bottom tab.

**Dark mode**: System preference via `prefers-color-scheme`. No manual toggle.

### 2.7 Behaviors

| State | Operation | Result |
|-------|-----------|--------|
| Empty input | Type first char | No action until 2+ chars |
| 2+ chars input | Debounce expires (300ms) | Run all strategies, show results, update URL |
| Only spaces/symbols | Debounce expires | "Enter a project name or keyword" |
| >100 chars | Keystroke | Truncate to 100, subtle warning |
| Results shown | Modify input | Clear results, loading skeleton, re-run |
| Results shown | Click copy | Copy to clipboard, "Copied!" toast 2s |
| Results shown | Click star | Add to favorites (localStorage) |
| Favorited | Click star again | Remove from favorites |
| Results shown | Apply filter | Filter client-side, show count |
| No results for strategy | Section | Show "(0)" count, collapsed |
| All strategies return 0 | Results area | "No suggestions found. Try a different word." |
| localStorage unavailable | Favorite action | Toast: "Unable to save favorites" |

### 2.8 Error Scenarios

| Error | Handling |
|-------|----------|
| Only special characters | Inline validation: "Enter letters or numbers" |
| Input >100 chars | Truncate silently |
| Clipboard API unsupported | Fallback to `document.execCommand('copy')`, toast "Press Ctrl+C to copy" |
| localStorage full/unavailable | Catch error, toast, disable favorites gracefully |
| TLD data corruption | Error boundary: "Something went wrong. Please refresh." |
| JavaScript disabled | `<noscript>` message |

### 2.9 Performance

| Metric | Target |
|--------|--------|
| Input to results rendered | < 500ms |
| TLD data bundle size | < 50KB gzipped |
| Lighthouse Performance | > 90 |
| Total suggestion cap per query | 500 max |

All generation runs client-side. Move to Web Worker if profiling shows jank.

---

## 3. Consistency

### 3.1 Terminology

| Term | Definition | Do NOT use |
|------|-----------|------------|
| Suggestion | A generated domain name (e.g., "noti.fy") | Recommendation, result |
| Domain hack | Suggestion where word splits across prefix and TLD | Domain split, TLD hack |
| Strategy | A named generation algorithm (A-F) | Method, technique |
| TLD | Top-Level Domain (e.g., "fy") | Extension, suffix |
| Input | User-provided project name or keyword | Query, search term |
| Favorite | A starred suggestion saved to localStorage | Bookmark, saved |
| Card | UI element displaying one suggestion | Tile, item |

### 3.2 Patterns

| Pattern | Convention |
|---------|-----------|
| Strategy interface | Pure function: `(input, tlds) => Suggestion[]` |
| Scoring | Each suggestion has `score: number` (0-100) |
| Deduplication | By full domain string; keep highest score, tag with all strategies |
| Filtering | Operates on generated result set (no re-generation) |
| Clipboard | Clipboard API with `execCommand` fallback, always show toast |
| Toasts | 2s, bottom-center, auto-dismiss, max 1 at a time |
| Responsive | Mobile <768px, Tablet 768-1023px, Desktop 1024px+ |

### 3.3 Data Contracts

**Suggestion**:

```typescript
{
  domain: string;
  prefix: string;
  tld: string;
  strategy: string;
  score: number;
  originalInput: string;
}
```

**TLD entry**:

```typescript
{
  id: string;
  type: "ccTLD" | "gTLD" | "sTLD";
  length: number;
}
```

**Favorites (localStorage)**: key `findthename_favorites`, value JSON array of domain strings.

---

## 4. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router, static export) |
| UI | React 18+ |
| Styling | Tailwind CSS |
| State | React useState/useReducer |
| Storage | localStorage |
| Deploy | GitHub Pages (static export via `next export`) |
| Build data | Node.js script to fetch IANA TLD list |

---

## 5. File Organization

| Path | Contents |
|------|----------|
| `src/app/` | Next.js App Router pages and layouts |
| `src/components/` | SearchInput, ResultCard, FilterToolbar, FavoritesPanel, etc. |
| `src/lib/strategies/` | domainHack.ts, prefix.ts, suffix.ts, abbreviation.ts, altSpelling.ts, wordPlay.ts, index.ts |
| `src/lib/scoring.ts` | Shared scoring utilities |
| `src/lib/tld.ts` | TLD data loading, indexing, lookup |
| `src/data/` | tlds.json, tld-types.json, prefixes.json, suffixes.json, combining-words.json |
| `scripts/` | fetch-tlds.ts |
