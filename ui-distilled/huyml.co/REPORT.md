# UI Distillation Report

URL:
https://huyml.co/

Analyzed:
2026-09-04 · 2 pages (`/`, `/project/by-kin`) · 6 candidates · 3 distilled

## Design language

- Warm paper ground (`#efeeea`), near-black type, and a single hot orange used only for accents and inside the work itself.
- Editorial chrome pinned to the four corners — logo and locale top-left, menu and audio toggle along the top, contact top-right, counter and showreel along the bottom — leaving the centre entirely to the work.
- One oversized numeral per project, set behind the imagery rather than beside it, so the index reads as a watermark.
- Micro-labels at 11–12px in wide tracking against display type at 180–220px. There is almost nothing in between.
- The project pages invert the idea: a quiet meta column on the left, full-bleed screenshots down the middle, a thumbnail rail on the right, and the project's name in giant type layered over the media.

## Motion language

- Motion is ambient rather than triggered. The work belt advances continuously with no input at all; the wheel adds to a value that was already moving, and nothing ever snaps to rest.
- Values roll rather than cross-fade — text leaves upward and the replacement arrives from below.
- State is expressed by opacity rather than by colour or weight: the index list sits at 0.24 and only the current entry reaches 1.
- Nothing announces itself on hover. The chrome is static; the interest is all in the centre.
- Depth is real: the cards sit on a curved path in 3D, folding away at the top and bottom of the screen.

## Interaction philosophy

The homepage behaves like a machine that is already running when you arrive. There is no scrollbar — `scrollHeight` equals the viewport — so wheeling is an input to a simulation rather than a way to move a document. Because the belt drifts on its own, doing nothing still shows you the work, and because every peripheral readout is fed from the same index, the whole screen agrees at all times without any of the parts knowing about each other. Clicking is reserved for committing to a project; everything short of that is browsing by inertia.

## Technology observations

Confirmed:

- Framer-built (`framer-*` class names throughout, Framer's image CDN with `?width=…&height=…` query resizing).
- The card belt is WebGL2 on a full-screen canvas measured at 2560×1600; `elementFromPoint` over the cards returns that canvas and no DOM image is wider than 100px.
- A second, small 2D canvas (216×186) sits in the chrome.
- GSAP and Rive appear in the static asset scan; a React runtime is present via Framer.
- 19 project routes, all `/project/<slug>`, discovered from the page source rather than from a sitemap.
- No native scrolling anywhere: `document.documentElement.scrollHeight === innerHeight` on the homepage.
- Platform CSS available and unused: `:has()`, `@starting-style`, `allow-discrete`, scroll-driven animations, view transitions.

## Canvas and scroll census

| Canvas | Context | Backing | Coverage | Scroll-driven | Verdict |
|---|---|---|---|---|---|
| #0 | webgl2 | 2560×1600 (DPR 2) | 100% | yes (6/6 distinct frames across a stepped sweep) | distilled as pattern 01 — the work belt is drawn here, not in the DOM |
| #1 | 2d | 216×186 | 1% | no | not distilled: a small chrome readout, one declaration's worth of idea |

What scrolls: `window` — but there is nothing to scroll. `document.documentElement.scrollHeight`
equals `innerHeight` on the homepage: the wheel is an input to a simulation, not a way to move a
document, which is why the belt keeps drifting with no input at all.

## Best patterns

| # | Pattern | Category | Distill score | Difficulty |
|---|---------|----------|---------------|------------|
| 01 | Perspective conveyor | scroll | 4.4 | Medium |
| 02 | Ghost list | scroll | 4.1 | Easy |
| 03 | Synced readouts | microinteraction | 3.9 | Easy |

## Patterns

### 01 — Perspective conveyor
A belt of cards that is never at rest: a drift term advances it every frame and the wheel adds to the same value, while distance from the centre of the arc drives `rotateX` and `translateZ` so the middle card stays flat and the ends fold away.

### 02 — Ghost list
A drifting column where every entry sits at 24% opacity and only the one crossing an invisible reading line comes to full, with the image beside it following the same resolved index. No selection state is stored.

### 03 — Synced readouts
One index feeding five independent readouts — counter, category, name, meta rows, palette — each offset by about 60ms, so a single change reads as a short sequence rather than a simultaneous flip.

## What makes this site special

- The interface is already running when you arrive. Ambient drift means the work is showing itself before any input, and the wheel joins a motion rather than starting one.
- There is no document scroll at all; the wheel is an input to a simulation, which is why nothing about the page feels like a page.
- One index quietly governs a canvas, a text column, a counter, a meta panel and a palette, and they never disagree.
- State is carried by opacity alone — 0.24 versus 1 — so a long index reads one item at a time without a highlight, a hover or a scrollbar.
- Depth is used for legibility, not spectacle: cards fold away precisely so the centre one can be flat and sharp.
- The oversized index numeral sits behind the work rather than beside it, which makes the counter part of the composition instead of chrome.
- Values roll instead of fading, so type is never caught mid-opacity.
- The project pages answer the homepage: everything ambient becomes still, and everything canvas becomes DOM.

## Verification

Every demo was exercised in a browser over a local server:

- 01 — stepping the belt 120 frames shows velocity settling at exactly 26px/s (the configured drift), with cards folding `1.8° → −9.7° → −21.2° → −32.7°`, receding `−18px → −327px` and fading `0.947 → 0.041` with distance. 8 images, none broken, no console errors.
- 02 — after 180 frames exactly one entry carries the active class, computed opacities are the measured pair `0.24` and `1`, the matching image plate is the only one lit, and the track translates as expected.
- 03 — `setIndex` propagates to all five readouts, the palette swatch changes colour and the image plate follows; the settled screen shows counter, category, name and imagery agreeing on one project.

One defect was found and fixed this way: the swap duration was read from a custom property without checking its unit, and because the controls write `ms` where the stylesheet had written `s`, the text swap was being deferred by 180 seconds instead of 180 milliseconds.

## Notes and limits

- The card belt is WebGL. Demo 01 is therefore an honest `approximate`: the behaviour, timing and layering are reproduced in CSS 3D, the shader's per-pixel warp is not.
- The site is Framer-built, so unlike the Nuxt sites in earlier runs there is no readable component source to check measurements against. Every number in this report was measured from the running page.
- The in-app browser rendered the WebGL layer black; all measurement was done through scripted headless sessions.
- Only one of the 19 project pages was explored. They share a template, but pattern hunting across more of them would likely turn up media-transition work this run did not see.
- Three candidates were rejected: the project-page thumbnail rail (3.2 — slow parallax rather than a minimap), the oversized title layered over media (3.2 — layout and z-order rather than a mechanism), and the audio toggle (a control, not a pattern, and not assessable headlessly).
