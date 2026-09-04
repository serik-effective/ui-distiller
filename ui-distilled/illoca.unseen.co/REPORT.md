# UI Distillation Report

URL:
https://illoca.unseen.co/

Analyzed:
2026-09-04 · 4 routes (`/`, `/legal`, `/legal/terms`, `/legal/privacy`, plus the `?section=` anchors) · 6 candidates · 4 distilled

## Design language

- The page is a drawing sheet. A 16px graph-paper grid rules the whole viewport, and everything else is placed against it rather than against a container.
- Warm paper ground, near-black ink, one navy accent (`#283f7d`) and one orange (`#ec633d`) used sparingly; body text at `#636363`, borders at `#424242`.
- Four faces doing four jobs, which is unusually disciplined: Graphik for UI text, F37 Analog for display, Geist Mono for data, and Architect Pro — a marker-cap face, with a companion symbols font — for anything that is meant to look written on the sheet by hand.
- Chrome is instrument-like and tiny: a coordinate readout top-left, an email address top-right, both at 12–18px, both flipping to white when dark artwork passes behind them.
- A grain layer sits over everything at `mix-blend-mode: overlay`, opacity 0.2, z-index 100 — a single declaration doing a lot of work.

## Motion language

- Nearly every transition in the shell is one animatable value: `clip-path` for the frame, `clip-path` for the loader wipe, `scaleX` for the drawn rules, `transform` for the quadrants. Very little is animated by size or position.
- Quantities are quantised. Frame thickness is a cell count, not a length; the conversion to a percentage happens at run time against the measured cell — and the cell itself is fluid, because the rem is `0.833333vw` above 1080px (12px at a 1440 design width).
- The frame's named states are scrubbed by scroll, not switched by clicks: `openToNav → open` across the intro, `toLeft ↔ openToNav` and `fullyOpen → toLeft` further down. The page is almost always between two states rather than in one.
- One custom ease (`joe.inOut` in the source) is used almost everywhere, which is why the whole site moves with a single accent.
- Sequences overlap rather than queue: the loader tells the frame to open at 1.1s while its own wipe still has 1.7s to run.
- Text arrives per character on a 40ms stagger with a long 1.2s fade — slow enough to read as writing rather than as a reveal effect.

## Interaction philosophy

The interface presents itself as a drafting instrument: a ruled sheet, a coordinate readout, dimension lines, marker annotations. That framing does real work — because the grid is the reference, every state of the frame is expressible as a number of squares, and the site can move between "opened for reading", "opened for the nav" and "pushed aside for a drawer" without any of them being a special case. The decorative layer and the layout layer are the same layer.

## Technology observations

Confirmed:

- Nuxt 3 with Vue and Tailwind v4 (271 custom properties, `@layer`, arbitrary-value utilities), Lenis for scroll, GSAP for the timelines with a custom named ease, and a character-splitting helper for the annotations.
- The frame is four fixed elements (`.js-hole-left/right/top/bottom`) sharing one `background-attachment: fixed` gradient; the cell is measured from a `.js-grid-width` probe element.
- A `webgl2` canvas at 2160×1350 sits behind the hero. Its role could not be established — see below.
- CSS in production: `clip-path` (5 uses), `backdrop-filter` (2), `mix-blend-mode` (1), SVG filters (4), `background-clip: text` (4), `@supports` (15).
- Platform features available in the test browser and unused by the site: `:has()`, `@starting-style`, `allow-discrete`, scroll-driven animations, view transitions.
- The light/dark swap of the corner chrome is broadcast on an event bus (`header:white` / `header:dark`) from the sections, not computed from what is on screen.

Not established:

- The role of the WebGL2 canvas. In the in-app browser the intro never completed — `.lenis-stopped` persisted, the loader stayed at opacity 1 and the canvas never sized past 0×0 — and the headless render shows the illustration without revealing whether the canvas draws it or only treats it. It is recorded as unassessed rather than guessed at.

## Best patterns

| # | Pattern | Category | Distill score | Difficulty |
|---|---------|----------|---------------|------------|
| 01 | Grid-quantised clip-path frame | layout | 4.8 | Medium |
| 02 | Blueprint loader | loading | 4.1 | Medium |
| 03 | Hand-annotation callouts | typography | 4.1 | Easy |
| 04 | Blueprint coordinate readout | microinteraction | 3.8 | Easy |

## Patterns

### 01 — Grid-quantised clip-path frame

Four fixed full-viewport layers paint the same graph paper and clip themselves from four different sides, leaving a hole. The shared `background-attachment: fixed` keeps the ruling continuous while the opening changes, and every inset is a whole number of cells converted to a percentage at run time. A named state table (`open`, `openToNav`, `toLeft`, `toRight`, `closed`, `fullyOpen`) is what lets one mechanism serve the intro, the navigation and the drawer — and ScrollTrigger scrubs between two of those names rather than firing them, so the frame reads as continuous.

### 02 — Blueprint loader

A looping technical sketch — sliding dimension lines, travelling arrows, growing circles, a swinging arc — whose four quadrants separate on asymmetric offsets and whose icon group is wiped out by `clip-path: inset(0% 100%)`. The handover is the interesting part: the loader calls the frame's `open()` 1.1s in, well before its own exit finishes, so the two mechanisms overlap into one gesture.

### 03 — Hand-annotation callouts

Marker lettering at −4°, absolutely positioned against the sheet so the sentence never reflows, with characters fading in on a 40ms stagger and a hand-drawn SVG rule revealed by `scaleX` from its own origin — left for one callout, centre for the other. The distilled version generates the rule for the measured width of its label, so the line always fits the words.

### 04 — Blueprint coordinate readout

`X / Y` in the corner, raw client pixels at two decimals, zero-padded so the block can never change width, in a marker face with tabular numerals. The label is darker than the value — the reverse of the usual arrangement, and correct here. It flips to white over dark artwork on a 200ms colour transition.

### Rejected

- **Grain overlay** (2.7) — `mix-blend-mode: overlay` at 0.2 opacity, fixed at z-index 100. Well judged and one declaration; a grain layer is not a pattern.
- **WebGL2 hero canvas** — not assessed, for the reasons above.

## What makes this site special

1. The decoration is the coordinate system. Because the grid rules the viewport, "how open is the frame" has a unit, and every layout state is a small integer.
2. The frame is a hole made of four clipped copies of one background, not a border — so it can change shape without a single reflow and without the ruling ever breaking.
3. A shared `background-attachment: fixed` is the whole trick, and it is one line.
4. Sequences overlap on purpose. The loader hands off mid-exit, which is why the boot reads as one continuous move rather than two.
5. Four typefaces with four jobs, and the hand-drawn one is a real face with its own symbols companion — the arrows in the annotations are glyphs, rotated by arbitrary amounts.
6. The corner chrome is styled against the reader's eye, not the designer's convention: the label darker than the number, tabular and zero-padded so nothing twitches.
7. Almost everything animates one property. The site's motion budget is spent on timing and easing, not on quantity.
8. The rem is viewport-relative, so the grid, the type and every cell-quantised inset scale together with the window — the sheet is the same drawing at any size.
9. State is named, not numeric. `openToNav` and `toLeft` are states of one mechanism, which is why nothing about the interface feels bolted on.

## Method notes

- Routes were established from the headless pass (menu toggles opened, DOM re-read) plus the `?section=` anchors the nav uses; `/legal`, `/legal/terms` and `/legal/privacy` are real routes.
- Measurement came from the site's CSS and its Nuxt chunks rather than from live instrumentation, because the intro never completed in the in-app browser.
- The consent dialog was hidden locally to capture the reference frame. It was not accepted.
