# UI Distillation Report

URL:
https://mecha-xyz.webflow.io/

Analyzed:
2026-09-03 · 2 pages reachable (`/`, `/blog`) · 9 candidates · 7 distilled

## Design language

- Near-white ground (`#e9edef`) with near-black type; the blog route swaps to a warm off-white (`#E9E7DB`) and the transition overlay carries that colour ahead of the page.
- Wide-tracked geometric wordmark against tightly-tracked editorial headlines — one loud element per screen, everything else quiet.
- Hairline rules as the only structural decoration: 1px lines that draw themselves in rather than being present at rest.
- Generous vertical rhythm; sections run 1700–3100px tall, so each holds a single idea and the scroll never feels dense.
- Chrome is minimal and mostly fixed: a section navigator on one side, a cursor layer above everything, a contact modal that reuses the page-transition language rather than inventing a modal language.

## Motion language

- One easing family throughout. A single CustomEase, `M0,0 C0.82,0 0.18,1 1,1` (a steep symmetric in-out), is registered three separate times in different modules and used for menus, the page transition and the modal. Reveals use `expo.out`; exits use `power2.inOut`.
- Entrances are long, exits are short. Text enters over 2.0s and leaves over 1.2s. The page transition pushes over 1.2s and covers over ~0.9s. Nothing exits at its entrance speed.
- Stagger is 0.1s for headline lines, 0.06s for text following a drawn rule, and reverses direction on exit (`from: 'end'`).
- Reverse motion is authored, not replayed. Every scroll reveal has an explicit `onLeaveBack` with its own duration and easing.
- Scroll is smoothed by Lenis and read at the viewport centre: the site's own `getTop`/`getBottom` helpers offset every trigger by `innerHeight / 2`.
- Heavy scrub values (`scrub: 2` and `scrub: 5`) deliberately let scroll-linked elements lag behind the scroll position — the hero's 3D rotation trails by a noticeable amount.
- `gsap.ticker.lagSmoothing(0)` is disabled globally so a dropped frame does not fast-forward the timelines.

## Interaction philosophy

The site answers the pointer everywhere and rewards pushing past the edges. The cursor is replaced by a three-state marker that reports what a target will do before it is clicked. Overscrolling at the bottom of the page is treated as an intentional gesture rather than a dead zone. Navigation is spatial: clicking a section travels for 1.8s rather than jumping, and leaving a page pushes it visibly out of the way before covering it. Nothing is instant, and nothing is left in a half-state — a preloader that finishes its animation cycle, a transition that resets itself after a back-navigation, reveals that play backwards when you scroll back up.

## Technology observations

Confirmed from the page and its assets:

- Webflow-hosted, with jQuery 3.5.1 and the Webflow interactions runtime present.
- GSAP 3.15.0 with ScrollTrigger, CustomEase, ScrollToPlugin, SplitText and DrawSVGPlugin.
- Lenis 1.3.23 for smooth scroll, exposed as `window.lenis`.
- Three.js for the hero object, orthographic camera, re-parented between desktop and mobile containers on resize.
- Lottie (via `Webflow.require('lottie')`) for the preloader mark; Rive referenced in the bundle.
- 102 live ScrollTrigger instances on the home page.
- View Transitions API is available in the browser but not used; the site implements its own transition.
- ~73KB of unminified, commented custom JavaScript inline in the document — the site's own engineering, not a template.

## Canvas and scroll census

| Canvas | Context | Backing | Coverage | Scroll-driven | Verdict |
|---|---|---|---|---|---|
| #0 | webgl2 | 430×306 | 10% | yes (5/6 distinct frames across a stepped sweep) | distilled as pattern 05 — the Three.js hero object, an orthographic scene re-parented between desktop and mobile containers on resize |

What scrolls: `window`, smoothed by Lenis, with GSAP ScrollTrigger driving the section reveals
(pattern 04) and the progress navigation (pattern 03). The overscroll footer (pattern 01) reads
wheel deltas past the scroll limit rather than scroll position.

## Best patterns

| # | Pattern | Category | Distill score | Difficulty |
|---|---------|----------|---------------|------------|
| 01 | Overscroll footer reveal | scroll | 4.8 | Medium |
| 02 | Push-and-cover page transition | page-transition | 4.5 | Medium |
| 03 | Section progress navigation | navigation | 4.4 | Medium |
| 04 | Reversible line mask reveal | typography | 4.2 | Medium |
| 05 | Drag-spring 3D object | 3d | 4.2 | Hard |
| 06 | Three-state spring cursor | cursor | 4.0 | Easy |
| 07 | Gated preloader | loading | 3.7 | Medium |

## Patterns

### 01 — Overscroll footer reveal
Wheel deltas past the scroll limit accumulate into a clamped pressure value that lifts the entire page off a fixed footer. Two motion regimes in one loop — lerp on the way out, a hand-rolled cubic-bezier on the way back — and a 200ms idle timer as the release. The most original thing on the site.

### 02 — Push-and-cover page transition
The outgoing page is pushed 200px upward while a panel in the destination route's colour rises over it; the swap happens under cover and the incoming page arrives from the same offset. Includes the reset-and-replay path for bfcache restores that most implementations omit.

### 03 — Section progress navigation
A side nav cloned from the page's own section markup, each item wired to its own scroll range with a scrubbed progress line, all ranges anchored to the viewport centre. The most directly reusable pattern here.

### 04 — Reversible line mask reveal
Per-line `clip-path` masks opened at the bottom by 0.3em so descenders survive, with an exit that is authored rather than reversed: 0.6× duration, different curve, stagger from the end.

### 05 — Drag-spring 3D object
Scroll scrubs a base rotation while dragging adds a clamped tilt integrated by a genuine spring with delta-time stepping. The orthographic frustum is rebuilt from container aspect, so the object is layout-portable.

### 06 — Three-state spring cursor
Three cursor heads sharing exactly one lerped position, transformed from the viewport centre so no head needs offset maths, with state resolved by delegation and an attribute contract.

### 07 — Gated preloader
Three independent readiness gates — counter, animation cycle, page load — converging on one exit check, plus a session flag that shortens the intro for returning visitors.

## What makes this site special

- Overscroll is treated as a first-class input. The footer reveal turns the most-ignored region of a page into a deliberate interaction.
- Exits are designed. Nearly every reveal has an explicit reverse with its own duration, curve and stagger direction — an unusual amount of work for motion most visitors see only when scrolling back.
- One easing curve carries menus, page transitions and the modal, which is why unrelated components feel like a single system.
- Trigger geometry is centred, not top-anchored: every range is offset by half the viewport, so state changes land when a section feels current rather than when its edge touches the top.
- The 0.3em descender bleed in the text masks is a two-character detail that separates careful typography from generic split-text.
- The preloader coordinates three independent gates instead of guessing at a duration, and refuses to cut an animation cycle short.
- The modal reuses the page transition's exact language — push, cover, colour — so opening detail content and changing page feel like the same act.
- Back-navigation is explicitly handled via `pageshow` with `event.persisted`, resetting every layer before replaying the entrance; skipping this is the classic way custom transitions strand a page.
- The hero's 3D object sums two independent rotation sources through a delta-time spring and clamps only the drag, so scroll and pointer never fight.
- `lagSmoothing(0)` and heavy `scrub` values show a deliberate stance on frame drops and scroll lag rather than defaults left in place.

## Verification

Every demo was checked in a browser, not just parsed:

- 01 — wheel deltas at the limit lifted the wrapper to −210px (100% of the footer), then the snap-back returned it to `none`.
- 02 — sampled the whole transition: wrapper 0 → −200px over ~1.2s, overlay 885 → 0, content swapped at ~1.35s, overlay to −883 and wrapper 200 → 0 by ~2.6s.
- 03 — progress fills and active handoff measured at five scroll positions; the anchor control changes which section is active at the same position; a scroll event was proven to request a frame, and a second scroll re-requests with no frame in between.
- 04 — 6 lines split, mask resolves to `inset(0px 0px -17.82px)` (the 0.3em descender bleed), entrance and exit both interpolate, exit visibly shorter.
- 05 — Three.js 0.160.0 loaded from the pinned CDN, canvas at 992×992, `readPixels` at the centre returns the rendered object rather than an empty buffer.
- 06 — state machine returns arrow / hand / idle for the three target types; opacity mapping exact per state; the centre-relative transform places the dot at exactly the pointer coordinate.
- 07 — session branch verified: first visit → full intro, replay → short intro, forget → full intro again; the load gate opens on schedule.
- Gallery — all 14 pattern links plus `REPORT.md` and `patterns.json` return 200 over a local server.

Two defects were found and fixed during verification: a global `const top` that silently killed one demo's script before it ran, and a boolean rAF latch that could freeze two demos permanently if a frame was dropped while the tab was hidden.

## Notes and limits

- `/blog` was reachable and shares the same transition and reveal system; no additional distinct patterns were found there beyond what the home page already demonstrates.
- Image and video assets from the site's CDN were blocked in this environment, so purely image-based effects (media crossfades, poster-to-play video swaps) could be read from source but not seen. The custom video poster→play swap was assessed at 3.2 and rejected below the cut, partly for that reason.
- The duplicate-text roll hover (cloned `[reveal-hover-text]` elements, `yPercent: -100`, stagger reversed on leave) scored 3.5 and was left out as a well-executed but common pattern.
- Analysis rests on the site's own unminified inline JavaScript plus live DOM and ScrollTrigger introspection; the preloader could not be observed running to completion because it waits on assets that were blocked here.
