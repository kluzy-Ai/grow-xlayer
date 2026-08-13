# Design System — [Product Name] Website

> Working name used throughout this doc: **Grow**. Swap every instance once you lock the real name — nothing else in the system depends on it.

Derived from the two app mockups (onboarding screen + dashboard screen). The mockups are a mobile app; this doc translates that visual language into a **marketing website** that sells the app, not a rebuild of the app screens themselves.

---

## 1. Brand personality

A crypto earn-app that doesn't feel like crypto. No dark trading-terminal aesthetic, no neon, no chart-heavy dashboards up front. It feels like a casual mobile game that happens to pay out in BTC — closer to Duolingo or a claim-your-coins clicker than to a wallet app. The mascot (a smiling gold coin with arms and legs, mid-flex, holding an arrow) is doing the emotional work: crypto growth as something friendly and a little silly, not intimidating.

The website's one job: make a first-time visitor feel "I understand this in 5 seconds and I want to tap Start," the same feeling the onboarding screen produces.

---

## 2. Color system

| Token | Hex | Usage |
|---|---|---|
| `--grow-bg` | `#B4E23F` | Primary lime-green background — hero, section backgrounds |
| `--grow-bg-deep` | `#8FCB1F` | Darker green for depth/shadow layering on top of primary bg |
| `--grow-primary` | `#1FAE52` | "Start" actions — main CTA buttons |
| `--grow-gold` | `#F6C61A` | "Withdraw" / earnings / coin accents |
| `--grow-violet` | `#7C5CFA` | "Friends" / referral / the arrow motif — secondary accent, used sparingly as a pop |
| `--btc-orange` | `#F7931A` | Bitcoin-specific numbers, "received" activity icons — reserve for actual BTC amounts so it stays meaningful |
| `--ink` | `#15121F` | Near-black text, and the dark progress/streak bar |
| `--paper` | `#FFFFFF` | Card backgrounds |
| `--paper-muted` | `#F4F6F0` | Off-white section backgrounds when you need a break from full green |

**Rule of three:** on any given screen, green is the stage, white cards are the content, and gold/violet/orange are used one at a time as a pointer to a specific action or number — never all three competing at once. The mockups already do this correctly (buttons are the only place all three accents appear together, and they're differentiated by shape + label, not just color).

---

## 3. Typography

| Role | Typeface | Notes |
|---|---|---|
| Display / headline | **Baloo 2** (ExtraBold/800) | The rounded, slightly squashed letterforms match the mascot's chunky style. Use for hero headline, big stat numbers ("0.612 BTC"), section titles. |
| Body / UI | **DM Sans** (Regular/Medium) | Clean geometric sans for paragraph copy, nav, labels — keeps Baloo 2 special by not overusing it. |
| Numeric / data | **DM Mono** (Medium) | For wallet addresses, transaction hashes, countdown timers (`5:55:52 Left`) — anything that needs fixed-width legibility. |

Type scale (desktop):
- Hero H1: 64px / Baloo 2 800 / -1% tracking
- Section H2: 40px / Baloo 2 700
- Card stat number: 32px / Baloo 2 700
- Body: 17px / DM Sans 400 / 1.6 line-height
- Caption/meta: 14px / DM Sans 500 / `--ink` at 60% opacity

---

## 4. Page inventory — keep this short

This is a **responsive website** — one codebase, fluid across breakpoints, not separate native builds. "Screen" in this doc means a distinct page/route + its behavior at each breakpoint, never a platform-specific build. **Five pages, no more.** Every extra page is a place a visitor can leave instead of tapping "Start." If a future request adds a sixth, cut one first rather than growing the list.

| # | Page | Job |
|---|---|---|
| 1 | **Home** (`/`) | Hero + how it works + dashboard preview + social proof + footer CTA (sections 4-5 below, all on one scroll — this is 90% of the site) |
| 2 | **How it works** (`/how-it-works`) | Only split out from Home if the 3-step section needs more room to breathe than a homepage section allows. Default: fold into Home, don't build separately unless content demands it. |
| 3 | **FAQ** (`/faq`) | Flat list, accordion, no illustration budget spent here — utility page |
| 4 | **Legal** (`/terms`, `/privacy` — one template, two content variants) | Required, not a design opportunity — plain DM Sans, no mascot |
| 5 | **Download / Get the app** (`/download`) | QR code + store badges, the page every CTA ultimately points to |

Do not build: a blog, a team/about page, a pricing page, or a changelog unless explicitly requested later. None of them serve the single job of getting a visitor to tap Start.

### Breakpoints

Build mobile-first, then verify up through these — the same markup and components reflow, nothing platform-specific:

| Breakpoint | Width | Notes |
|---|---|---|
| `sm` (mobile) | 0–639px | Primary target — single column, bottom CTA pill, hamburger→sheet nav |
| `md` (tablet) | 640–1023px | Two-phone hero mockup can shrink to a single angled phone or stack; nav still condensed |
| `lg` (desktop) | 1024–1439px | Full top nav with text links, two-phone hero as designed |
| `xl` (wide desktop) | 1440px+ | Cap content max-width (~1280-1440px), don't let line-lengths or the hero stretch edge-to-edge on ultra-wide monitors |

Every component in Section 7 needs an explicit mobile spec, not just a desktop one that "should probably reflow." Where a component's mobile behavior isn't obvious from its desktop spec, it's called out inline below.

## 5. Navigation — iOS-grade, not web-template

Navigation is judged on restraint and precision, not on how many things it can hold. Model it on iOS's own discipline: one primary action always obvious, secondary items demoted or hidden until needed, transitions that never make the visitor wonder what just happened. This is a website, so "iOS-grade" means borrowing the *feel* — spring-physics sheets, large-title-to-compact-bar collapse, calm momentum scrolling — not literal native nav components.

**Desktop nav (`lg`+)**
- Fixed, minimal: logo · 2-3 text links max (How it works, FAQ) · one filled pill CTA (`Get the app`) — that's the entire bar
- Goes transparent over the hero, crossfades to a solid white/blurred bar (`backdrop-filter: blur(20px)`, ~90% opacity) the instant the hero scrolls past — the iOS "large title collapses to compact bar" pattern, translated to a website
- No dropdown megamenus. If a link needs a submenu, that's a sign the site has grown past its 5-page budget — cut content instead

**Tablet nav (`md`)**
- Same structure as desktop but text links can drop to icon+label or collapse into the mobile menu pattern if horizontal space gets tight — test at 640px and 900px both, don't assume it just scales linearly from desktop

**Mobile nav (`sm`)**
- Logo + a single hamburger/menu icon, nothing else in the bar — protect the CTA by keeping it as a persistent bottom-sheet or sticky bottom pill instead of cramming it into a shrinking top bar
- Menu opens as a full-screen sheet sliding up (spring physics, drag-to-dismiss from the top edge), not a cramped dropdown
- A persistent bottom "Get the app" pill bar (matches the mockup's floating dark bottom nav aesthetic) can double as the mobile site's one fixed anchor — always present, never competing with content
- Respect the device safe area (`env(safe-area-inset-bottom)`) so the fixed bottom pill never sits under a phone's home indicator

**Scroll & transitions (all breakpoints)**
- Section-to-section scroll should feel calm, not scroll-jacked — native momentum scrolling, no forced full-page-snap unless a specific section (e.g. the phone hero) benefits from settling into place
- Any in-page jump (nav link → section) eases with the same duration/curve everywhere (~400ms, ease-out) — one motion signature, not a different easing per link, and not a different one per breakpoint either
- Active nav state updates via scroll position, subtle underline or pill highlight — never a hard color swap that feels like a page reload

**The test:** at every breakpoint, a visitor should always know exactly where the one thing to tap is, and never see more than 3-4 nav-level choices at once. If the nav ever needs a second row, second thoughts, or a "more" catch-all at any screen width, the site has clogged — go back to the 5-page budget and cut.

## 6. Layout concept

The mockup photography style — phones floating on a green background, shot at a slight angle, on a real textured surface (grass + daisies in image 1, a clean desk with a charging cable in image 2) — **is** the website's hero device. Don't flatten it into plain screenshot rectangles; keep that "product in the wild, mid-use" photographic energy.

```
┌─────────────────────────────────────────┐
│  NAV: logo · How it works · FAQ · [Get the app] │
├─────────────────────────────────────────┤
│                                           │
│   HERO — full-bleed green (#B4E23F)      │
│   H1: "Grow Your Crypto Every Day"       │
│   Sub: "Play, earn, withdraw —           │
│         easy as that."                   │
│   [Start Now →] pill CTA                 │
│                                           │
│   Two floating phone mockups, angled,    │
│   photographed on a real surface —       │
│   left = onboarding, right = dashboard   │
│                                           │
├─────────────────────────────────────────┤
│  WHITE SECTION — "How it works"          │
│  3 steps, mascot coin illustrating each: │
│  Play → Earn → Withdraw                  │
│  (numbered only because it's a literal   │
│   sequence — same order as the tagline)  │
├─────────────────────────────────────────┤
│  DASHBOARD PREVIEW — live-feeling        │
│  Recreate the actual card components     │
│  (Total Earnings, activity feed) as      │
│  real HTML/CSS, animated with sample     │
│  numbers ticking up — not a screenshot   │
├─────────────────────────────────────────┤
│  SOCIAL PROOF — stat strip on --ink bg   │
│  "$2.4M paid out · 180K players"         │
├─────────────────────────────────────────┤
│  FOOTER CTA — green, mascot again,       │
│  QR code to download                     │
└─────────────────────────────────────────┘
```

---

## 7. Component library

Build these as real reusable components — they're the same pieces the app uses, so the website should feel like a preview of the product, not a separate brand.

**Pill button** (`Start`, `Withdraw`, `Friends`, hero CTA)
- Fully rounded (`border-radius: 999px`), solid fill, no border
- Bold DM Sans label, generous horizontal padding (24px+)
- Subtle drop shadow in the button's own color at 25% opacity, not a generic gray shadow — this is what makes them feel tactile/game-like in the source mockup

**Stat card** (`Total Earnings`)
- White, `border-radius: 20px`, soft ambient shadow
- Small uppercase label (DM Sans 500, `--ink` 60%) → big Baloo 2 number below
- Optional trend pill in top-right corner (green up-arrow + %), same pill shape as buttons but tiny

**Streak / progress bar**
- Full-width, `--ink` background, `border-radius: 16px`
- Gold-to-violet gradient fill for progress, sparkle icon at the leading edge
- Countdown in DM Mono, right-aligned

**Activity list item**
- Circular colored icon badge (color = transaction type: gold=received, orange=sent, green=referral, violet=offer) + two-line text (action / amount) + right-aligned relative timestamp
- No card border between items — just consistent vertical rhythm, a card only wraps the whole list

**Bottom nav** (only if a future logged-in/app-shell area is added — not part of this marketing site's 5 pages)
- Floating dark pill, not a full-width bar — matches the mockup's dark rounded nav, icons only, center icon emphasized (larger, filled)

---

## 8. Illustration & imagery style

- **Mascot**: a smiling gold coin, flat vector cartoon style, thick black outline, simple dot eyes + wide grin, always doing something physical (flexing, holding the arrow, standing on a coin stack). Commission or generate 4-6 poses (idle, celebrating, thinking, waving) to reuse across empty states, the "how it works" steps, and error/404 pages.
- **Photography**: floating-phone product shots on real, slightly textured backdrops (the daisy field and the desk-with-cable both work) — keeps the crypto product from feeling sterile. Avoid generic gradient-blob app-store screenshots.
- **Iconography**: rounded, filled icons (not thin-line) to match the chunky mascot style — thin outlined icons will visually fight the rest of the system.

---

## 9. Motion

- Hero stat numbers count up on scroll-into-view (0 → 0.612 BTC) — cheap to build, reinforces "growing."
- Buttons: slight scale-down (0.97) + shadow compression on press, not just a color darken — makes them feel like the tactile app buttons.
- Mascot: one small idle animation (gentle bob or blink loop) in the hero — a single orchestrated moment, not animation scattered across every element.
- Respect `prefers-reduced-motion`: disable the count-up and idle bob, keep instant state changes.

---

## 10. Signature element

**The mascot coin is the signature — lean into it harder on the website than the app does.** The app mostly confines it to the onboarding screen; the website can use it as a recurring guide across every section (waving in the nav on hover, flexing next to the "how it works" steps, holding a "you're offline" sign on an error page). This is the one place to spend the "take one real risk" budget: most crypto-earn-app landing pages default to abstract coin/chart imagery, and a consistent illustrated character carried through the whole page is what will make this one memorable and distinct from that default.

---

## 11. Accessibility floor

- Text on `--grow-bg` (lime green): use `--ink` only, never white — contrast ratio on white-on-green fails WCAG AA at these values. Test with a contrast checker before shipping any green-background text.
- All interactive pills need a visible focus ring (`--ink` outline, 2px, offset 2px) — the pill shape makes default browser focus states easy to lose.
- Icon-only bottom nav needs `aria-label`s; colored activity badges need the transaction type in the text, not just conveyed by color.

---

## 12. Build order for Antigravity

Same rule as any Antigravity build: feed it one step at a time, review, commit, move on. Don't paste this whole file as one build instruction — it'll try to generate all 5 pages, the mascot animation, and the nav scroll-behavior in one pass and something will drift.

1. **Foundation** — Next.js + TypeScript + Tailwind scaffold, load Baloo 2 / DM Sans / DM Mono via `next/font`, set the color tokens from Section 2 as Tailwind theme extensions (not hardcoded hex in components). Push to GitHub, deploy blank shell to Vercel.
2. **Nav shell only** — build the desktop transparent→blurred top nav and the mobile menu sheet from Section 5, with placeholder links and no page content yet. Verify the scroll-collapse behavior in isolation before building anything it sits above.
3. **Home — hero** — headline, subhead, CTA pill, and a hero visual built to match the floating-phone mockup style (Section 6/8) — this needs new photography or a composited illustration, not the reference mockups themselves, since those weren't supplied as usable assets. A placeholder block is fine here until that asset exists; don't block the build on it. Get everything else in this section pixel-right first.
4. **Home — how it works** — 3-step mascot section.
5. **Home — dashboard preview** — rebuild the stat card, streak bar, and activity list as real components (Section 7), not a screenshot.
6. **Home — social proof + footer CTA**.
7. **FAQ, Legal, Download** — the three utility pages, in that order, last — they're template-driven and shouldn't consume early build time.

At each step, check against Section 4's page budget and Section 5's nav test before telling Antigravity to continue — if either check fails, fix it before adding new scope.

## 13. Assets to produce before building

- [ ] Mascot coin: 4-6 vector poses (SVG)
- [ ] Baloo 2 + DM Sans + DM Mono loaded via `next/font` (Google Fonts, all three are free/open)
- [ ] 2-3 real or composited phone-mockup photos matching the hero style — net new, to be produced/commissioned; the two mockups shared earlier were style reference only, not supplied as final assets
- [ ] Icon set: rounded/filled style, minimum set = home, friends, lightning/earn, profile, menu (matches bottom nav in mockup)
