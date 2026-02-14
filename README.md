# spl.it

Split words into clever domain names. A client-side tool that generates creative domain name suggestions using TLD hacks, prefixes, suffixes, abbreviations, alternative spellings, and word play.

**Try it:** type "genius" and get `geni.us`, or "delicious" and get `delicio.us`.

## Features

- **Domain Hacks** — Split words so the suffix matches a real TLD: `stre.am`, `foc.us`, `par.is`
- **Multi-level Hacks** — Recursive splitting: `del.icio.us`
- **Prefix/Suffix Additions** — Combine with common prefixes (get, try, my) and suffixes (app, hub, lab)
- **Abbreviations** — Drop vowels, truncate, extract initials
- **Alt Spellings** — ph/f swaps, y/i swaps, ck/k simplification
- **Word Play** — Compound words, alliteration, rhyming combinations
- **1285 real TLDs** from the IANA Root Zone Database
- **Filtering** — By TLD type (ccTLD/gTLD/sTLD), strategy, and text search
- **Sorting** — By score, alphabetical, or length
- **Favorites** — Star and save domains to localStorage
- **Dark mode** — Automatic via system preference
- **URL sharing** — `?q=genius` syncs with the search input
- **Fully static** — No server required, deploys anywhere

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

Produces a static export in `out/` — deploy to any static host (GitHub Pages, Netlify, Vercel, S3).

## Update TLD Data

```bash
npx tsx scripts/fetch-tlds.ts
```

Fetches the latest TLD list from IANA and writes `src/data/tlds.json`.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| State | React hooks (useState, useMemo) |
| Storage | localStorage |

## Project Structure

```
src/
  app/              Next.js pages and layout
  components/       React components (SearchInput, ResultCard, FilterToolbar, etc.)
  hooks/            Custom hooks (useDebounce, useSuggestions, useFavorites, etc.)
  lib/
    strategies/     6 suggestion strategies (domainHack, prefix, suffix, etc.)
    scoring.ts      Scoring utilities
    tld.ts          TLD data loader
    types.ts        Shared TypeScript types
  data/             Static JSON data (TLDs, prefixes, suffixes, combining words)
scripts/
  fetch-tlds.ts     IANA TLD fetcher
  validate.ts       Domain hack validation
```

## License

[MIT](LICENSE)
