# UI Distillation Report

URL:
https://www.ceragres.ca/

Analyzed:
2026-09-03 · 3 pages · 7 candidates · 5 distilled

Pages: `/`, `/projets/`, `/produits/…` (category listing)

## Design language

- Off-white ground (`#fafafa`), near-black type, no accent colour anywhere — the material photography is the only colour in the interface.
- One typeface (PP Neue Montreal) in five cuts including a mono, with uppercase micro-labels at 11–14px against a display size that runs to `clamp(4.6rem, -1.39rem + 14.27vw, 26rem)`. The gap between those two scales is the whole hierarchy.
- Hairline rules at ~28–45% black separate list rows; borders, not boxes, do the structural work.
- Every image carries a 4% black `mix-blend-mode: multiply` overlay (`x-image-contrast`), so photography from many suppliers reads at one contrast level. It is invisible individually and obvious when you turn it off.
- Layout is grid with `container-type: inline-size` on cards, so components carry their own proportions rather than depending on breakpoints.

## Motion language

- One easing dominates: `cubic-bezier(.54, 0, .06, .87)` — a steep symmetric curve that holds still, moves fast, and settles hard. It is on card hovers, list rules, button fills and nav marks.
- Hover durations cluster at 400–460ms, which is slow for hover and gives the site its deliberate feel.
- Content entrances are long and soft by comparison: 1.2s `power4.out` for cards, 2.2s `power3.inOut` for the pixel reveal.
- Motion is almost entirely transform and opacity; the one exception is the animated `padding-inline` on card hover, which is doing real layout work on purpose.
- Reveals fire once (`once: true`, self-disconnecting observers) — nothing replays on scroll-back.
- `prefers-reduced-motion` is respected in the components that matter: the pixel reveal starts resolved and skips its observer entirely.

## Interaction philosophy

The interface answers by re-framing rather than by moving. Hovering a project card tightens the crop without touching the photograph; hovering a menu row pushes its siblings back instead of highlighting itself; hovering a nav link closes brackets around it without shifting a pixel of type. Nothing bounces, nothing follows the cursor, and no element grows. For a materials retailer that is the correct posture: the product stays still and the interface gets out of its way.

## Technology observations

Confirmed:

- Nuxt 3 / Vue 3, Shopify-backed commerce (GraphQL fragments in the chunks), Tailwind for utilities with BEM-ish component classes on top.
- GSAP with ScrollTrigger, loaded as app chunks rather than from a CDN.
- Lenis is present in the CSS layer.
- Swiper is bundled (its 3D module ships but is not used on the pages examined).
- Canvas 2D for the pixel reveal; no WebGL anywhere.
- Modern CSS in production: `:has()`, `@starting-style`, `transition-behavior: allow-discrete`, container queries and `cqw` units, `color-mix()`, `overscroll-behavior`, native `<dialog>` with `::backdrop`.
- The View Transitions API is available in the browser but unused — the route transition is a plain GSAP white fade (0.45s in, 0.35s out).

Inferred: images come from a CDN with responsive `sizes`; the consent layer is CookieYes (`cky-*`).

## Canvas and scroll census

| Canvas | Context | Backing | Coverage | Scroll-driven | Verdict |
|---|---|---|---|---|---|
| #0 | 2d | 1440×1728 | 192% (taller than the viewport, by design) | yes (4/4 distinct frames across a stepped sweep) | distilled as pattern 01 — the pixel reveal, plus the parallax that the extra 20% of height exists for |

What scrolls: `window`, natively — no smooth-scroll library anywhere. The reveal is one-shot on
intersection; the parallax is the only continuously scroll-linked thing on the page.

## Best patterns

| # | Pattern | Category | Distill score | Difficulty |
|---|---------|----------|---------------|------------|
| 01 | Pixel image reveal | image-effect | 4.8 | Medium |
| 02 | Native dialog slide-over | modal | 4.7 | Easy |
| 03 | Reciprocal-scale card hover | cards | 4.3 | Easy |
| 04 | :has() dimming mega menu | menu | 4.1 | Easy |
| 05 | Bracket hover marks | microinteraction | 3.8 | Easy |

## Patterns

### 01 — Pixel image reveal
A canvas round trip — downscale with smoothing on, upscale with it off — animates block size from 80 to 1 with a blur that fades alongside. One-shot on intersection, DPR-correct, with an optional scrub parallax on a canvas 20% taller than its frame.

### 02 — Native dialog slide-over
A `<dialog>` panel whose entire motion is CSS, made possible by `allow-discrete` on `display`/`overlay` and `@starting-style` for the entry values. Direction is a data attribute; timing lives in custom properties.

### 03 — Reciprocal-scale card hover
Frame and picture scale by exact reciprocals, so the crop closes while the photograph is provably untouched. The caption travel is measured in `cqw`, so the gesture is identical at every card width.

### 04 — :has() dimming mega menu
One selector expresses "dim every row while any row is hovered". The hovered row draws its own hairline and staggers its sub-list through a `--delay` custom property, with every state mirrored on `aria-expanded`.

### 05 — Bracket hover marks
Two 4px pseudo-elements slide in as `[` and `]` around a nav label — the same border definition rotated 180° to produce its own mirror — with zero layout change and the active page keeping its marks.

## What makes this site special

- The pixel reveal is a genuine idea rather than a filter: resolution is the animated quantity, which is exactly the right metaphor for a company selling surfaces.
- Reciprocal scaling on card hover is a precise piece of work — `0.913 × 1.0952902519 = 1.0000` — for an effect most visitors will never consciously notice.
- Modern CSS is used where it removes JavaScript, not for novelty: `:has()` replaces an active-item tracker, `@starting-style` and `allow-discrete` replace an animation library around the dialog.
- Accessibility states are the same rules, not a second implementation: every hover rule has an `aria-expanded` or `:focus-visible` twin.
- Container query units make components carry their own proportions, so a card behaves identically in a 2-up and a 4-up grid.
- The 4% multiply overlay on every image is an invisible decision that makes third-party product photography look like one catalogue.
- Hover timings are unusually slow (400–460ms) and uniformly eased, which is most of why the site feels calm rather than reactive.
- Nothing chases the pointer and nothing replays on scroll-back — the motion budget is spent on arrival and on framing.
- The route transition is deliberately plain, which reads as a decision to keep the spectacle in the content.

## Verification

Every demo was exercised in a browser over a local server, not merely parsed:

- 01 — canvas comes up at 2064×1376 (DPR 2), centre pixels are non-empty and differ before and after; the tween runs 80 → 1 blocks and 6 → 0 blur, sampled mid-flight at 70.7 / 5.29 (the slow start of a symmetric curve).
- 02 — the dialog opens to 538px from the right and to 426px tall from the bottom, `data-direction` drives both, and the closed transform returns to a full off-screen translate; `transition-behavior: allow-discrete` and `@starting-style` both report as supported.
- 03 — the frame/image scales resolve to a product of exactly 1.0000 × 1.0000, `container-type: inline-size` is active, and 1cqw resolves against the live card width (359px → 3.59px → a 16.6px caption lift).
- 04 — with the active row expanded, siblings compute to 0.54 and the active row to 1, its hairline draws while the others stay at scaleX(0), and the sub-list becomes visible with its items at opacity 1.
- 05 — arms measure 4×14px with the right border dropped, rest at translateX(±20px) opacity 0, and the `[aria-current]` link holds them at translateX(0) opacity 1 with the second arm rotated 180°.
- Gallery — all 10 pattern links plus `REPORT.md` and `patterns.json` return 200.

One defect was found and fixed this way: in the mega menu, the `:has()` dimming rule carries the specificity of its argument and therefore out-ranked the rule restoring the active row, leaving every row dimmed. The source site resolves the same clash with `!important`; the demo now does too. Static verification (`scripts/verify.mjs`) passes with no errors.

## Notes and limits

- The consent overlay was **not** accepted. It was hidden locally in the analysis session so the page beneath could be read; no consent was given and no preference was saved.
- Product detail pages, the search overlay and the cart panel with real items were not opened, so patterns unique to those flows may exist beyond this set.
- Two candidates were rejected below the 3.5 cut: the primary button's icon pass-through (label slides 4rem while the resting icon exits right and a duplicate enters from the left, 3.46) and the link-list row's top-rule wipe with icon inversion (3.0). Both are well made and both are common.
- `node`'s `fetch` could not reach this host from the analysis machine while `curl` could; the probe now falls back to `curl` automatically.
