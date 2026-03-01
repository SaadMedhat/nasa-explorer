# CLAUDE.md — NASA Explorer

## Identità del Progetto

Sito editoriale/cinematico che mostra contenuti NASA (APOD, Mars Rover Photos, Near Earth Objects).
NON è un dashboard, NON è un clone tutorial, NON è un progetto vibecodato.
L'obiettivo è creare un'esperienza visiva opinionata con un punto di vista chiaro sul design.

---

## Stack

- **Next.js 15 (App Router) + TypeScript**
- **shadcn/ui + Tailwind CSS**
- **TanStack React Query** per data fetching e caching
- **Framer Motion** per animazioni
- **date-fns** per date
- Package manager: **pnpm**
- API: NASA Open API (api.nasa.gov)

---

## Regole Dure (Ban)

- **No `let`**, **no `var`** → sempre `const`
- **No `else`** → early returns
- **No `switch`** → object maps o if/return chains
- **No loop imperativi**: `for`, `for...of`, `for...in`, `while`, `do...while` → `.map()`, `.filter()`, `.reduce()`, `.forEach()`
- **No `any`**, **no `unknown`**
- **No colori hex hardcoded** → tutto via CSS variables in `globals.css`
- **No colori Tailwind arbitrari** (es. `text-[#ff0000]`) → solo design tokens
- **No `console.log`** → logger utility se serve
- **No fetch in useEffect** → sempre TanStack Query
- **No default exports** (eccezione: Next.js pages/layouts)
- **No class components**

---

## Anti-Vibecodato — Regole di Design Obbligatorie

Queste regole esistono per evitare il look generico da AI-generated site.

### Tipografia
- Scegliere UN display font con personalità per titoli (Google Fonts: Syne, Space Grotesk, Instrument Serif, o simile — NO Inter per i titoli)
- Body text: un sans-serif pulito e leggibile (Geist, Inter, o simile)
- Gerarchie tipografiche forti: massimo 3-4 size, usarli con coerenza
- Letter-spacing e line-height personalizzati, non i default di Tailwind

### Layout
- NO al layout griglia simmetrica ovunque. Variare: full-bleed, asimmetrico, split-screen
- Spazi bianchi generosi e intenzionali — lo spazio vuoto è design
- Le immagini NASA sono il contenuto: dargli spazio, non comprimerle in card piccole
- NO card con rounded-xl + shadow-lg ovunque (il pattern più vibecodato che esista)

### Colori
- Palette scura e ridotta: 2-3 colori massimo + bianchi/grigi
- Niente gradienti viola-blu-rosa generici
- Un accent color unico e usato con parsimonia
- Tutto definito come CSS variables, mai valori inline

### Animazioni (Framer Motion)
- NO al fade-in-up su tutto. Ogni animazione deve avere un motivo
- Preferire animazioni sottili: opacity, leggero scale, blur-in
- Parallax leggero sull'APOD hero (scroll-linked)
- Transizioni pagina coerenti e non esagerate
- Timing realistici: ease curves custom, non linear o i default
- Stagger sulle griglie ma con delay contenuti (0.03-0.05s, non 0.1+)

### Micro-interazioni
- Hover states unici e pensati, non il solito scale-105
- Cursor custom dove ha senso
- Transizioni di colore smooth sugli stati interattivi
- Focus-visible con stile coerente col design

### Cosa NON fare mai
- Hero con titolo centrato + sottotitolo + CTA button centrato (troppo template)
- Sezioni alternate bianco/grigio con padding identico
- Icone Lucide decorative sparse ovunque
- Badge/chip colorati senza motivo
- "Built with ❤️" nel footer
- Gradient text su tutto

---

## Struttura Repository

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx            # Home (APOD hero)
│   ├── gallery/
│   │   └── page.tsx        # APOD archive
│   ├── mars/
│   │   └── page.tsx        # Mars Rover Photos
│   └── asteroids/
│       └── page.tsx        # Near Earth Objects
├── components/
│   ├── ui/                 # shadcn components
│   ├── layout/             # Header, Footer, Navigation
│   └── sections/           # Page-specific sections
├── hooks/
├── lib/
│   ├── api/                # NASA API client + query functions
│   │   ├── nasa-client.ts  # Base client con API key
│   │   ├── apod.ts         # APOD queries
│   │   ├── mars.ts         # Mars Rover queries
│   │   └── neo.ts          # Near Earth Objects queries
│   ├── utils/
│   │   └── date.ts         # date-fns utilities centralizzate
│   └── constants.ts
├── types/
│   └── nasa.ts             # Tipi per le response NASA
└── styles/
    └── globals.css         # CSS variables, font imports
```

Cartelle: **kebab-case**. Componenti/Tipi: **PascalCase**. Variabili/funzioni: **camelCase**. File shadcn: **kebab-case**. Costanti: **SCREAMING_SNAKE_CASE** con `as const`.

---

## TypeScript

- `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`
- Sempre `type` in favore di `interface`
- Sempre `readonly` per proprietà di primo livello
- Tipi espliciti per return di funzioni (tranne one-liner triviali)
- No prefisso `I` o `T`
- Boolean: prefisso `is` (es. `isLoading`, `isVideoMedia`)
- Path aliases: `@/components`, `@/lib`, `@/types`, `@/hooks`

---

## NASA API

- Base URL: `https://api.nasa.gov`
- API key in `.env.local` come `NASA_API_KEY` (NO `NEXT_PUBLIC_` — fetch server-side dove possibile)
- Per fetch client-side, creare un API route in `src/app/api/` come proxy

### Endpoints

```
GET /planetary/apod              # Astronomy Picture of the Day
    ?api_key, ?date, ?count, ?start_date, ?end_date

GET /mars-photos/api/v1/rovers/{rover}/photos
    ?api_key, ?sol, ?earth_date, ?camera

GET /neo/rest/v1/feed
    ?api_key, ?start_date, ?end_date
```

### Attenzione
- APOD: il campo `media_type` può essere `"image"` o `"video"` (YouTube embed) — gestire entrambi
- Mars: non tutti i sol hanno foto — gestire empty state
- Mars: rover disponibili: Curiosity, Opportunity, Spirit
- Mars: camere: FHAZ, RHAZ, MAST, CHEMCAM, MAHLI, MARDI, NAVCAM
- NEO: response raggruppata per data (oggetto con chiavi = date string)

---

## Data Fetching

- **APOD homepage**: fetch in Server Component con `revalidate: 3600`
- **Gallery, Mars, Asteroids**: client-side con TanStack Query
- Mai fetch manuale in `useEffect`
- Mai salvare dati fetched in useState (la cache di React Query è source of truth)
- `staleTime` esplicito per dati che cambiano raramente (APOD: 1h)
- `enabled` per query dipendenti (es. Mars photos dipende da rover selezionato)

---

## Componenti & React

### Ordine nel Componente
1. Costanti/props
2. Custom hooks
3. Library hooks
4. useState/useRef
5. useMemo
6. useCallback
7. useEffect
8. Helper functions
9. Return JSX

### Pattern
- Solo functional components
- Props type sopra la definizione, destrutturare nella signature
- Preferire composition su prop drilling (>3 livelli)
- Un componente = una responsabilità
- Barrel file (`index.ts`) per ogni cartella di componenti

---

## Tailwind & shadcn

- Mobile-first: base = mobile, poi `sm:`, `md:`, `lg:`, `xl:`
- `cn()` per classi condizionali — mai concatenazione stringa
- Mai valori arbitrari per colori
- Customizzare shadcn via composition, estendere con `cva` per varianti
- Classi Tailwind leggibili e ordinate

---

## Immagini

- Usare `next/image` per APOD (ottimizzazione automatica)
- Mars rover thumbnails: lazy loading sulla griglia
- Attributo `alt` sempre presente e descrittivo
- `priority` su above-the-fold (APOD hero)
- Placeholder blur dove possibile

---

## Animazioni (Framer Motion)

- Definire variants riutilizzabili in un file dedicato (`lib/motion.ts`)
- AnimatePresence per transizioni pagina
- Scroll-triggered animations con `useScroll` + `useTransform`
- Performance: preferire `transform` e `opacity` (GPU-accelerated)
- `will-change` solo dove necessario
- Ridurre/disabilitare animazioni per `prefers-reduced-motion`

---

## Date (date-fns)

- `parseISO()` per stringhe ISO dalla NASA API
- `isValid()` prima di usare date parsate
- `format()` con pattern esplicito per display (`dd MMMM yyyy`)
- Centralizzare utility in `src/lib/utils/date.ts`
- Specificare `locale` nel root layout
- Mai `new Date()` senza validazione, mai metodi nativi come `getMonth()`

---

## Accessibilità

- WCAG AA contrast ratio (4.5:1 per testo)
- Keyboard: Tab, Enter, Space, Escape
- Focus indicators (`:focus-visible`)
- `aria-label` per pulsanti solo icona
- HTML semantico (`<nav>`, `<main>`, `<article>`, `<figure>`)
- Testare navigazione da tastiera

---

## Performance

- Tree-shakeable imports (mai importare librerie intere)
- `React.lazy()` + `<Suspense>` per code splitting a livello route
- No `useMemo`/`useCallback` senza misurare impatto reale
- Audit bundle size regolarmente

---

## Loading States

- GET: Skeleton per ogni parte della UI durante il caricamento
- Errori: feedback user-friendly con azioni chiare
- Error Boundary alla root + granulari per feature

---

## Git

- Conventional commits: `type(scope): description`
- Tipi: `feat`, `fix`, `refactor`, `chore`
- Subject < 72 char, imperativo

---

## Build

```bash
pnpm dev        # next dev
pnpm build      # next build
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
```
