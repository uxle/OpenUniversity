# OpenKnowledge — Brand Book

Everything you need to write about, remix, or advertise OpenKnowledge —
the logo, the palette, the voice, and ready-to-post media. Everything in
[`assets/branding/`](assets/branding/) may be reused freely (MIT).

---

## 1. Brand in one sentence

> **A calm, black-and-white place to learn — with a little pastel joy.**

The identity is **ink & paper** (near-black on white). Color is a guest,
never the host: one soft pastel per subject, a gentle highlight under
matches, functional green/red on quizzes. If a design decision adds hue
to a large surface, it's wrong.

## 2. Logo

| File | Use |
|---|---|
| `logo-mark.svg` | App icon, avatar, favicon (tile with book + sparks) |
| `logo-mark-dark.svg` | Same, for dark backgrounds |
| `logo-horizontal.svg` | Lockup with wordmark — headers, posters |
| `logo-horizontal-dark.svg` | Lockup for dark backgrounds |
| `mascot-owl.png` | The owl ("Libby") — illustrations, posters, social |
| `social-preview.png` | GitHub social card (1280×640) — also in `.github/` |

The mark is a **rounded ink tile** with an open white book and **three
pastel sparks** (blue · pink · green) — knowledge opening up, color as a
small delight. The sparks are the only color allowed on the logo.

**Do**

- Keep clear space around the mark of at least 25% of its width
- Use the dark variant on dark/photographic backgrounds
- Render at any size from 16 px (favicon) to poster scale — it's vector

**Don't**

- Don't recolor the tile or the book (no gradients, no brand-blue tile)
- Don't add a fourth spark, rotate the mark, or put it in a pill
- Don't set the wordmark in another typeface or add a tagline inside the lockup

## 3. Palette

### Identity (use for ~95% of the surface)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ou-bg` Paper | `#ffffff` | `#000000` | Background |
| `--ou-surface` | `#ffffff` | `#1c1c1e` | Cards |
| `--ou-surface-subtle` | `#f5f5f7` | `#2c2c2e` | Chips, wells, code blocks |
| `--ou-text` Ink | `#1d1d1f` | `#f5f5f7` | Headings, body, primary buttons |
| `--ou-text-secondary` | `#6e6e73` | `#98989d` | Secondary copy |
| `--ou-border` | `rgba(0,0,0,.06)` | `rgba(255,255,255,.09)` | Hairlines |

### Optional accents (small doses only)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ou-hue` Brand blue | `#4d9df8` | `#8db9ff` | Text selection, tiny highlights |
| `--ou-highlight` | `#fff3bf` | `rgba(255,214,10,.20)` | Search & lesson marks |
| `--ou-highlight-ink` | `#6b5900` | `#ffe68a` | Text on highlights |
| Success | `#22a05c` | `#6fd08c` | Correct answers, toasts |
| Warning | `#d97706` | `#e8a04c` | Admonitions |
| Danger | `#e0564f` | `#ef6b62` | Wrong answers, destructive |

### Subject pastels — one hue per subject, nowhere else

| Subject | Light | Dark | | Subject | Light | Dark |
|---|---|---|---|---|---|---|
| Mathematics | `#4d9df8` | `#8db9ff` | | History | `#ec8a4c` | `#ffb183` |
| Computer Science | `#7a70f2` | `#b0a8ff` | | Economics | `#d9a527` | `#ecc96a` |
| Philosophy | `#a06ce8` | `#c9a3f5` | | Science | `#35b37e` | `#7fdfae` |
| Languages | `#ee6fa4` | `#ff9cc4` | | Geography | `#2db5ae` | `#7fdfd8` |
| Civics | `#e75d6f` | `#ff8f9c` | | Reasoning | `#38b6e0` | `#7fd4f2` |

In the app these live in `src/styles/components/accents.css` as
`.ou-hue-<subject>` classes — add a subject there and in
`src/components/subject/subject-identity.js`. The high-contrast theme
strips all decoration automatically.

## 4. Typography

- **UI & content:** the system stack (`-apple-system, …, Segoe UI, Helvetica, Arial`) —
  native on every platform, zero webfont cost, works offline.
- **Mono:** `SF Mono / Menlo / Consolas` for code tokens.
- Headlines: **-1 to -4 px letter-spacing**, weight 700, tight line-height (1.0–1.05).
- Never introduce a display webfont; the brand's calm comes from restraint.

## 5. Motion

Springs, not spins: `cubic-bezier(0.16, 1, 0.3, 1)` for everything,
`cubic-bezier(0.34, 1.56, 0.64, 1)` for playful pops (icon badges on hover,
150–400 ms). Respect `prefers-reduced-motion`.

## 6. Voice & tone

- **Plain, warm, precise.** Short sentences. No jargon, no exclamation marks.
- Say what it *does*: "Works offline", not "Leverages service-worker technology".
- The mascot may be cute; the copy stays quiet. One friendly line per page is enough.
- Taglines you may reuse:
  - **Knowledge is everyone's right.** (primary)
  - Learn anything. Anywhere.
  - Read it. Quiz it. Keep it.
  - Study everything. Pay nothing.

## 7. Media kit (ready to post)

| File | Size | For |
|---|---|---|
| `poster-portrait.png` | 1080×1350 | Instagram / Facebook feed |
| `poster-square.png` | 1080×1080 | X/Twitter, LinkedIn, avatars' albums |
| `poster-story.png` | 1080×1920 | Instagram / WhatsApp stories (dark "Ink" edition) |
| `banner-readme.png` | 1600×512 | Repo hero, blog headers |
| `social-preview.png` | 1280×640 | Link previews (og:image) |
| `screens/*.png` | 2× DPI | App store–style screenshots, articles |

All posters were generated from HTML templates (see the repo history) —
tweak the text, re-render, and keep the pastel-dot row: it's the campaign's
visual signature.

## 8. Naming

Project: **OpenKnowledge** (one word, K capital). Repo/package history may
still say **OpenUniversity** — same project, rename welcomed.
The mascot's name is **Libby** (the library owl). Use it sparingly; she's shy.
