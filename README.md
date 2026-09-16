# DropMyStress

Type out what's weighing on you, watch it burn away, get a calm AI-written reply, and breathe.

## Run it

```bash
pnpm install
cp .env.example .env.local   # optional: add an OpenAI or Gemini key
pnpm dev                     # http://localhost:3000
```

Without an API key the app still works and uses curated fallback messages.

## Voice guide

Every tool can read its guidance aloud (steps, questions, breathing cues, the AI message on the
home page). Users can switch it off with **Voice guide**, and every tool has a **Listen** button.

- **With `OPENAI_API_KEY`**: natural, human-sounding voice from `gpt-4o-mini-tts` (voice `marin`,
  calm "meditation guide" delivery). Each line is generated once, then cached in memory and in
  `.voice-cache/`, so repeat plays cost nothing.
- **Without a key**: the browser's built-in voice, picking the most natural one available.

Voice code: `src/lib/voice.ts` (client engine), `src/app/api/voice/route.ts` (TTS + cache).

## SEO

- `sitemap.xml`, `robots.txt` and `manifest.webmanifest` are generated from `src/app/sitemap.ts`,
  `robots.ts` and `manifest.ts`. The sitemap lists every page and tool automatically.
- Every page has a title, description, canonical URL, Open Graph and Twitter card tags
  (`pageMetadata()` in `src/lib/site.ts`).
- Social share images are generated at build time: `src/app/opengraph-image.tsx` for the site and
  `src/app/tools/[slug]/opengraph-image.tsx` for each tool.
- JSON-LD structured data: Organization + WebSite (all pages), FAQPage (home), CollectionPage +
  ItemList (tools), WebPage + BreadcrumbList (tool and help pages).
- Set these **build-time** variables on your host:
  - `NEXT_PUBLIC_SITE_URL` — your real domain (defaults to `https://dropmystress.com`)
  - `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` — optional search console tokens

## Pages

- `/` — vent box → burn animation → AI message → box breathing
- `/tools` — searchable directory of 20 tools
- `/tools/[slug]` — one page per tool (statically generated)
- `/help` — crisis helplines and emergency numbers

## The 20 tools

| Category | Tools |
| --- | --- |
| Breathe & body | Breathing patterns, Muscle relaxation, Body scan, Desk stretch break, Meditation timer |
| Calm the mind | 5-4-3-2-1 grounding, Thought reframe, Worry sorter, Brain dump, Self-compassion break |
| Write & release | Unsent letter, Gratitude jar, Journal prompts, Affirmation cards |
| Play it out | Bubble wrap, Stress ball, Zen sand garden |
| Check in | Mood tracker, Stress check (PSS-4), Soundscape mixer |

## Structure

```
src/
  app/
    page.tsx                  home: vent → release → breathe
    tools/page.tsx            tools directory
    tools/[slug]/page.tsx     individual tool page
    help/page.tsx             crisis resources
    api/empathy/route.ts      POST { text } → { message, source }
    api/voice/route.ts        GET ?text= → mp3 (OpenAI TTS, cached)
  components/
    tools/                    one component per tool + index.ts (slug → component)
    tools/GuidedSession.tsx   shared player for timed, step-by-step exercises
    BreathingBubble.tsx       animated bubble; takes any breathing pattern
    ReleaseAnimation.tsx      words ignite and drift away as embers
    ui.tsx                    Button, Panel, Chip, ProgressBar, input styles
  hooks/
    useLocalStorage.ts        per-browser persistence (SSR/hydration safe)
    useStepTimer.ts           wall-clock step timer
    useAmbientSound.ts        home page ocean toggle
  lib/
    tools.ts                  tool registry: names, categories, icons, keywords
    audio.ts                  Web Audio bells, pops, and ambient channels
```

To add a tool: add an entry to `src/lib/tools.ts`, create its component in
`src/components/tools/`, and register it in `src/components/tools/index.ts`.

## Privacy

Vent text is never stored or logged by this app. Tools that remember things (journal, mood
tracker, gratitude jar, brain dump, worry actions, favourites) use `localStorage` only — nothing
is sent to a server. When an AI key is set, it is sent to that
provider to generate the reply, subject to their data policy.
