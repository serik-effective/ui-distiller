# UI Distillation Report

URL:
https://brand.squarespace.com/

Analyzed:
2026-09-04 · 3 pages (`/`, `/color`, and the 404) · 9 candidates · 4 distilled

> **Correction.** The first pass of this report claimed the site was effectively a single
> route. That was wrong. The menu items carry click handlers and no `href`, the server
> HTML links only `/`, the Nuxt manifest prerenders only `/`, and a guessed `/index`
> 404s — so link scraping found nothing and the conclusion went unchallenged. The site
> actually has at least six sections (`/logo`, `/typography`, `/color`, `/photography`,
> `/campaign`, `/motion`), recovered by scanning the loaded JavaScript for route
> literals. Pattern 04 comes from `/color`, and `scripts/inspect.mjs` now performs that
> route discovery automatically and warns whenever it finds one route or fewer.

## Design language

- One screen, black ground, one enormous serif numeral per panel, everything else set in a tight neutral grotesque at 11–14px.
- Full-bleed campaign photography that is never shown whole: each image is a window onto a larger composition, cropped by `clip-path` until it becomes the active panel.
- Chrome is reduced to four fixed labels — brand, index, section number, caption — sitting in a difference blend so they belong to no particular background.
- The site is a single route. There is no scrolling page; the carousel *is* the navigation, and the menu is an overlay rather than a destination.

## Motion language

- Motion is spring-driven, not tweened. The carousel's index lives in a spring whose velocity is reused as a signal (spin direction), and stiffness is modulated live — raised to 80 on a keypress, restored to 100 a second later.
- Two easing families: `cubic-bezier(.215, .61, .355, 1)` for UI (masks, menu links) and `power2.out` for state changes on the carousel; the intro logo uses `cubic-bezier(.645, .045, .355, 1)` over 2s.
- Text never cross-fades. It rolls: out at 0.2s `power2.in`, reset below, in at 0.5s `power2.out`.
- Reveals are directional. Masked lines enter from `100%` and leave at `-110%`, continuing rather than retreating.
- Progress values (`introProgress`, `introProgress2`, `zoomPr`, `activePr`) are lerped between named states rather than animated per property — one number drives radius, tilt, scale and crop together.

## Interaction philosophy

The whole page is one instrument. There is no scrollbar to fall back on: dragging, the wheel and the arrow keys all move the same spring, and clicking a panel is just another way to set its target. Because the active panel is a crop opening rather than a card expanding, selection feels like focus rather than navigation — nothing arrives, something stops being hidden. The chrome deliberately does not react: it inverts, and otherwise stays exactly where it is.

## Technology observations

Confirmed:

- Nuxt 3 / Vue 3 with Lenis; GSAP with ScrollTrigger, ScrollSmoother and Flip in the bundle.
- A spring store drives the carousel index; `stiffness`/`damping` are mutated at runtime and velocity is read back out.
- Rive (`riveStateMachine`, `homeCarouselTypography__rive`) renders the panel typography into a canvas via a state machine.
- Modern CSS in production: `text-box: trim-end text`, `overflow: clip`, `dvh` units, `backdrop-filter: blur(40px)`, `color-mix()`, `mix-blend-mode: difference` gated by a body class.
- Platform support detected but unused: View Transitions, scroll-driven animations, `@starting-style`.
- Rendering-engine branches (`isApple`, `isCoreTextRendering`, `isFirefox`) adjust text-box trimming and padding per platform — an unusually careful detail.

## Canvas and scroll census

| Canvas | Context | Backing | Coverage | Scroll-driven | Verdict |
|---|---|---|---|---|---|
| #0 | 2d | 1440×900 | 9% | yes (6/6 distinct frames across a stepped sweep) | not distilled: a Rive state machine renders the panel typography. The interesting part is the state machine's authored content, which is not ours to take, and the runtime is a dependency rather than a technique. Its scroll response is the same ScrollTrigger progress that drives pattern 04. |

What scrolls: `window`, smoothed by Lenis with GSAP ScrollTrigger and ScrollSmoother in the bundle.
Scroll drives the pinned poster sequence (pattern 04) and the section reveals; the carousel is
driven by a spring store, not by scroll.

## Best patterns

| # | Pattern | Category | Distill score | Difficulty |
|---|---------|----------|---------------|------------|
| 01 | Spring ring carousel | 3d | 4.5 | Hard |
| 02 | Directional line mask | typography | 4.2 | Easy |
| 03 | Conditional difference header | navigation | 4.0 | Easy |
| 04 | Pinned poster sequence | scroll | 4.3 | Medium |

## Patterns

### 01 — Spring ring carousel
Panels placed on a tilted 3D ring by `cos`/`sin`, held by a spring whose velocity doubles as the spin direction, with each panel a full-viewport layout cropped by `clip-path` that opens by animating its inset to zero.

### 02 — Directional line mask
A shared masked-text transition that clips vertically but not horizontally and leaves upward past the edge, so replacing text is one continuous movement; stagger travels with the element as a custom property.

### 03 — Conditional difference header
White chrome in `mix-blend-mode: difference`, gated by a body class and deliberately withdrawn over the blurred menu, where the blend would be unreadable.

### 04 — Pinned poster sequence
On `/color`: a sticky stage where one scroll progress value drives two staged animations — a caption converging from both edges, a deliberate hold, then a 3D rotation of the poster away from the viewer.

## What makes this site special

- The carousel card is a lie in the best way: it is a whole page-sized composition wearing a crop, so activation costs no layout change at all.
- Physics replaces choreography. There is no timeline to keep in sync because the ring's position, direction and settle are all consequences of one spring.
- Reusing the spring's velocity as a UI signal — spin direction, roll — rather than tracking gesture state separately.
- Modulating stiffness per input type, so keys feel decisive and drags feel heavy without two code paths.
- The chrome opts out of the design system: it has no colour of its own and inherits inversion from whatever is beneath it.
- Knowing when the trick fails. Dropping the difference blend for the blurred menu is a small rule that saves the whole idea.
- `text-box: trim-end text` on masked lines, with per-engine branches — the mask fits the glyphs rather than the line box.
- Directional exits: text leaves the way it was travelling, never the way it came.
- One route, no scroll, no page transitions to design — the interaction budget is spent entirely on a single instrument.

## Verification

Each demo was exercised in a browser, not merely parsed:

- 01 — stepping the exposed integrator 90 frames from index 0 to 2 shows the spring accelerating to v≈3.5, overshooting and settling at `pr = 2.0000` with `v → 0`; the index readout follows to `03 / 06`, the active panel's crop opens from `inset(26% 40.3%)` to `inset(0.03% 0.04%)` while its neighbours hold, and the ring resolves to `translateZ(-520px) rotateX(24deg)`. No console errors.
- 02 — line splitting, mask geometry and the three states measured directly; the `text-box` support probe reports correctly in this engine.
- 03 — computed `mix-blend-mode` tracks the gate: `difference` by default, `normal` once the menu-open class is set, restored when it clears.
- 04 — stepped through the range at seven points: the caption converges to `--conv: 0` and `--textOp: 1` by p=0.42, holds, and the poster's matrix reaches `m11 = 0.4226 = cos(65°)` at p=1 — the same end state measured on the live page (`0.423`). Stage labels fire in order, no console errors.

## Notes and limits

- Route discovery on this site is genuinely hard: no sitemap, a Nuxt manifest that prerenders only `/`, menu items without `href`, and `/index` returning 404. The section routes exist only as string literals in the JavaScript. Sections beyond `/` and `/color` were not explored, so more patterns almost certainly remain.
- Panel typography is a Rive state machine (binary asset plus proprietary runtime); it is deliberately out of scope and is replaced with plain type in demo 01.
- On `/color`, the pointer-driven colour slider was also assessed — a canvas of vertical bands whose widths are damped springs weighted by pointer proximity (`falloff = 1 − (d/r)²`, influence radius 0.3 of the canvas width), with a cursor label naming the nearest band. It scored 4.1 and is a strong candidate for a future pass; it was left out of this round only because the run was already closed when the page was found.
- Four candidates were assessed and rejected: the rolling caption swap (3.46 — good, but a small variation on a pattern already common), the overlay menu's sibling dimming with masked items (3.0 — the same idea as patterns already distilled from other sites), the percentage page loader (3.2), and the arrow-button icon swap (3.1).
- Image assets did not load in the headless pass (blocked CDN), so the visual reading of the carousel came from the in-app browser session; geometry and timing came from the site's own unminified component source.
