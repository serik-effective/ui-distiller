# UI Distillation Report

URL:
https://illoca.unseen.co/

Analyzed:
2026-09-04 · 4 routes (`/`, `/legal`, `/legal/terms`, `/legal/privacy`, plus the `?section=` anchors) · 8 candidates · 6 distilled

## Design language

- The page is a drawing sheet. A 16px graph-paper grid rules the whole viewport, and everything else is placed against it rather than against a container.
- Warm paper ground, near-black ink, one navy accent (`#283f7d`) and one orange (`#ec633d`) used sparingly; body text at `#636363`, borders at `#424242`.
- Four faces doing four jobs, which is unusually disciplined: Graphik for UI text, F37 Analog for display, Geist Mono for data, and Architect Pro — a marker-cap face, with a companion symbols font — for anything that is meant to look written on the sheet by hand.
- Chrome is instrument-like and tiny: a coordinate readout top-left, an email address top-right, both at 12–18px, both flipping to white when dark artwork passes behind them.
- A grain layer sits over everything at `mix-blend-mode: overlay`, opacity 0.2, z-index 100 — a single declaration doing a lot of work.

## The main act

The site's defining behaviour is a WebGL scene that the page scrolls a camera through: an architect's desk becomes an over-the-shoulder view of a blueprint, then a top-down of a massing model, with no cuts. It is worth stating exactly how it is wired, because the wiring is the idea.

One camera animation is baked in the GLTF. The page reads that animation's **keyframes** and builds one GSAP tween per consecutive pair, each tween scrubbing the Theatre.js playhead between those two keyframe times, and subscribes tween *i* to `scrollProgress:i` — the progress of section *i*'s own ScrollTrigger. The animation is never played; it is addressed. The sections do not own animations, they own segments of one, and the cut points come from the animation data rather than from the page.

The material is the second half of the effect: a two-step diffuse with no gradient, a shadow terminator broken up by a voronoi spray mask, drawn outlines as real line geometry, and paper grain ramped by world height.

## Motion language

- Nearly every transition in the shell is one animatable value: `clip-path` for the frame, `clip-path` for the loader wipe, `scaleX` for the drawn rules, `transform` for the quadrants. Very little is animated by size or position.
- Quantities are quantised. Frame thickness is a cell count, not a length; the conversion to a percentage happens at run time against the measured cell — and the cell itself is fluid, because the rem is `0.833333vw` above 1080px (12px at a 1440 design width).
- The frame's named states are scrubbed by scroll, not switched by clicks: `openToNav → open` across the intro, `toLeft ↔ openToNav` and `fullyOpen → toLeft` further down. The page is almost always between two states rather than in one.
- One custom ease (`joe.inOut` in the source) is used almost everywhere, which is why the whole site moves with a single accent.
- Sequences overlap rather than queue: the loader tells the frame to open at 1.1s while its own wipe still has 1.7s to run.
- Text arrives per character on a 40ms stagger with a long 1.2s fade — slow enough to read as writing rather than as a reveal effect.

## Interaction philosophy

The interface presents itself as a drafting instrument: a ruled sheet, a coordinate readout, dimension lines, marker annotations. That framing does real work — because the grid is the reference, every state of the frame is expressible as a number of squares, and the site can move between "opened for reading", "opened for the nav" and "pushed aside for a drawer" without any of them being a special case. The decorative layer and the layout layer are the same layer.

## Canvas and scroll census

| Canvas | Context | Backing | Coverage | Scroll-driven | Verdict |
|---|---|---|---|---|---|
| #0 | webgl2 | 2160×1350 | 100% | yes (5/5 distinct frames across a stepped sweep) | distilled as patterns 01 and 02 |

What scrolls: **not `window`**. `document.documentElement.scrollHeight` is 900px and `body` never
scrolls; the page scrolls `div.lenis` (`overflow: hidden auto`, 35 295px). Scroll drives the WebGL
camera through a per-section chain: section *i*'s ScrollTrigger (`scrub: true`, `top bottom` →
`bottom bottom`) emits `scrollProgress:i`, which advances a paused GSAP tween of the Theatre.js
sequence playhead between keyframes *i* and *i+1* of the baked `main_camera` animation. The same
scroll positions choreograph the clip-path frame between its named states.

## Technology observations

Confirmed:

- Nuxt 3 with Vue and Tailwind v4 (271 custom properties, `@layer`, arbitrary-value utilities), Lenis for scroll, GSAP for the timelines with a custom named ease, and a character-splitting helper for the annotations.
- The frame is four fixed elements (`.js-hole-left/right/top/bottom`) sharing one `background-attachment: fixed` gradient; the cell is measured from a `.js-grid-width` probe element.
- A `webgl2` canvas at 2160×1350 sits behind the hero. Its role could not be established — see below.
- CSS in production: `clip-path` (5 uses), `backdrop-filter` (2), `mix-blend-mode` (1), SVG filters (4), `background-clip: text` (4), `@supports` (15).
- Platform features available in the test browser and unused by the site: `:has()`, `@starting-style`, `allow-discrete`, scroll-driven animations, view transitions.
- The light/dark swap of the corner chrome is broadcast on an event bus (`header:white` / `header:dark`) from the sections, not computed from what is on screen.

Established on a second pass:

- The WebGL2 canvas (2160×1350) renders the whole hero and feature sequence, not a decorative layer. Three.js with a custom `ShaderMaterial`, `Line2` fat-line outlines, **Theatre.js** for the animation state, and GSAP ScrollTrigger for the transport.
- The first pass recorded this canvas as unassessed because the in-app browser never completed the intro and instant `scrollTop` jumps left the camera parked. Stepping the scroll in small increments over `requestAnimationFrame`, in a headless browser, shows the camera flight immediately — the frames are in `.work/refs/sw-*.png`.

## Best patterns

| # | Pattern | Category | Distill score | Difficulty |
|---|---------|----------|---------------|------------|
| 01 | Scroll-scrubbed camera sequence | scroll · 3d | 4.8 | Hard |
| 02 | Blueprint cel shading | webgl | 4.5 | Hard |
| 03 | Grid-quantised clip-path frame | layout | 4.8 | Medium |
| 04 | Blueprint loader | loading | 4.1 | Medium |
| 05 | Hand-annotation callouts | typography | 4.1 | Easy |
| 06 | Blueprint coordinate readout | microinteraction | 3.8 | Easy |

Patterns 01 and 03 score the same. 01 leads because it is the site's principal act — the thing the whole page is built to carry.

## Patterns

### 01 — Scroll-scrubbed camera sequence

One baked camera animation, cut at its own keyframes; section *i* scrubs segment *i* through a paused GSAP tween on a Theatre.js playhead, over ScrollTrigger's `top bottom` → `bottom bottom` window. An `AnimationMixer` is used as a pose evaluator — every action paused at weight 0, addressed by normalised time — and a lerped pointer pivot with roll is applied after the track pose so it can never fight the scroll. Desktop and mobile run different baked actions through the same machinery.

### 02 — Blueprint cel shading

`smoothstep(uDiffuseThreshold, +uDiffuseSmoothness, N·L)` between exactly two tones; a voronoi mask (`uSprayRamp`, `uSprayScale`) multiplied into the shadow so the terminator breaks into stipple; overlay grain ramped by `vWorldPosition.y / uSize.y`; a pointer window (`uMouseHitPos`, `uRadius`, `uRadiusReveal`) that swaps the surface for its blueprint; and a UV wipe whose two smoothstep edges are pushed apart by the same noise. Outlines are fat-line geometry, not a screen-space filter.

### 03 — Grid-quantised clip-path frame

Four fixed full-viewport layers paint the same graph paper and clip themselves from four different sides, leaving a hole. The shared `background-attachment: fixed` keeps the ruling continuous while the opening changes, and every inset is a whole number of cells converted to a percentage at run time. A named state table (`open`, `openToNav`, `toLeft`, `toRight`, `closed`, `fullyOpen`) is what lets one mechanism serve the intro, the navigation and the drawer — and ScrollTrigger scrubs between two of those names rather than firing them, so the frame reads as continuous.

### 04 — Blueprint loader

A looping technical sketch — sliding dimension lines, travelling arrows, growing circles, a swinging arc — whose four quadrants separate on asymmetric offsets and whose icon group is wiped out by `clip-path: inset(0% 100%)`. The handover is the interesting part: the loader calls the frame's `open()` 1.1s in, well before its own exit finishes, so the two mechanisms overlap into one gesture.

### 05 — Hand-annotation callouts

Marker lettering at −4°, absolutely positioned against the sheet so the sentence never reflows, with characters fading in on a 40ms stagger and a hand-drawn SVG rule revealed by `scaleX` from its own origin — left for one callout, centre for the other. The distilled version generates the rule for the measured width of its label, so the line always fits the words.

### 06 — Blueprint coordinate readout

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
8. The 3D is addressed, not played: the page holds a playhead, and scroll positions it. Nothing about the animation lives in the scroll code.
9. The renderer is doing an illustration, not a render — two tones, drawn edges, sprayed shadow, paper grain — which is why the scene reads as the same drawing as the rest of the page.
10. The rem is viewport-relative, so the grid, the type and every cell-quantised inset scale together with the window — the sheet is the same drawing at any size.
11. State is named, not numeric. `openToNav` and `toLeft` are states of one mechanism, which is why nothing about the interface feels bolted on.

## Method notes

- Routes were established from the headless pass (menu toggles opened, DOM re-read) plus the `?section=` anchors the nav uses; `/legal`, `/legal/terms` and `/legal/privacy` are real routes.
- Measurement came from the site's CSS and its Nuxt chunks, plus a live headless session for the WebGL work. Scroll had to be stepped over animation frames on the `.lenis` container (`overflow: hidden auto`, 34399px): an instant `scrollTop` jump moves the DOM sections but leaves the camera where it was, which is what made the first pass miss the scene entirely.
- The consent dialog was hidden locally to capture the reference frame. It was not accepted.
