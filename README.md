# NASA Explorer

An editorial experience exploring NASA's imagery and data — built as a cinematic, opinionated website, not a dashboard.

**[nasa-explorer-beta.vercel.app](https://nasa-explorer-beta.vercel.app/)**

---

## Pages

- **Home** — Astronomy Picture of the Day as a full-bleed hero with parallax
- **Gallery** — APOD archive browser with date range selection
- **Mars** — Curiosity & Perseverance rover photos, filterable by camera and sol
- **Asteroids** — Near Earth Objects feed with approach data visualization

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Data | TanStack React Query + NASA Open API |
| Animation | Framer Motion |
| Dates | date-fns |
| Package manager | pnpm |

## Getting started

```bash
# Install dependencies
pnpm install

# Add your NASA API key (get one at https://api.nasa.gov)
cp .env.example .env.local
# Then edit .env.local and set NASA_API_KEY

# Run dev server
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
```

## Project structure

```
src/
├── app/              # Pages & API routes
│   ├── page.tsx      # Home (APOD hero)
│   ├── gallery/      # APOD archive
│   ├── mars/         # Rover photos
│   └── asteroids/    # NEO feed
├── components/
│   ├── ui/           # shadcn primitives
│   ├── layout/       # Navigation, QueryProvider
│   └── sections/     # Page-specific sections
├── hooks/
├── lib/
│   ├── api/          # NASA API client & query fns
│   ├── utils/        # Date helpers
│   ├── motion.ts     # Framer Motion variants & easing
│   └── constants.ts
├── types/
│   └── nasa.ts
└── styles/
    └── globals.css   # CSS variables, fonts
```

## License

MIT
