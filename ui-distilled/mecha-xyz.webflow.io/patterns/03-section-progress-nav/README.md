# Section progress navigation

Source:
https://mecha-xyz.webflow.io/

## What is interesting

The side navigation is generated from the page rather than maintained beside it: sections declare themselves with attributes, one template item is cloned per section, numbering is derived, and each clone is wired to its own scroll range. Each item then carries its own progress line that fills across that section only — so the nav reads as a set of local timelines instead of one global scrollbar. The ranges are anchored to the middle of the viewport, not the top, which is why the active item changes exactly when the section feels current.

## Behavior

Scrolling fills the active item's hairline from 0 to 100% and dims the others. Crossing the viewport centre hands the active state to the next item; scrolling back hands it cleanly to the previous one. Clicking an item travels there over a long eased scroll rather than jumping.

## Trigger

scroll (active state and progress), click (travel to section)

## Implementation

`initDynamicNav` clears a container, clones a wrapper template, and for each `[section-navi="section"]` clones a menu item, writes a zero-padded index and the section's name, and calls `setupItemLogic`. That function creates a scrubbed tween of the progress line's width from 0% to 100% with `start: () => getTop(section) - innerHeight/2` and `end: () => getBottom(section) - innerHeight/2`, plus a second ScrollTrigger whose `onEnter`/`onEnterBack` set the active class. `getTop`/`getBottom` add `scrollY` to `getBoundingClientRect()`, and both triggers use `invalidateOnRefresh` so the ranges are recomputed on resize. Clicking calls the smooth-scroll instance's `scrollTo(section, { duration: 1.8 })`.

## Distilled implementation

No GSAP or ScrollTrigger: one throttled scroll handler recomputes, per section, `progress = (scrollY - start) / (end - start)` clamped to 0..1 using the same centre-anchored offsets, writes the width, and derives the active item from the same range test. Because progress is recomputed from geometry every frame rather than accumulated, reversing direction is exact and no state can drift. The anchor is exposed as a control, with an optional line drawn at the trigger height so the offset can be seen rather than guessed. Click travel uses a quart-out rAF scroll.

## Key techniques

- navigation generated from `[data-section]` markup, numbering derived from order
- per-item scrubbed progress line scoped to that section's range
- ranges anchored at `viewport height × 0.5` instead of the top edge
- geometry recomputed each frame — no accumulated state to desynchronise
- rAF-throttled scroll handler, recomputation on resize
- eased programmatic travel instead of an instant jump

## Parameters worth tuning

- `anchor` — 0.5 of the viewport height
- `scrollDuration` — 1200ms click travel
- the easing of that travel — quart-out here, 1.8s smooth-scroll in the original
- the progress line's own transition (none: it is scrubbed, deliberately)

## Fidelity

high

## Difficulty

Medium

## Tags

navigation, scroll, motion
