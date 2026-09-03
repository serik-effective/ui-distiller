# Cylindrical page fold

Source:
https://www.sashamartynchuk.com/

## What is interesting

Content approaching the bottom of the window does not slide under it — it wraps over an edge, like paper rolling onto a cylinder. The distinction matters: a naive `rotateX` pivots the whole row at once, so the top of it tilts even though it is still in flat space. Here the row is mapped onto an arc of radius `--fold-round`, curving through the arc and then continuing along the tangent once it has turned the full `--fold-angle`. And because the container's `perspective-origin` tracks the scroll position, the vanishing point stays directly in front of the reader instead of skewing toward a fixed page centre.

## Behavior

Rows entering the bottom band of the viewport begin to turn away, curving faster as they descend, and fade out as they recede. Scrolling back up unwraps them exactly. The effect is confined to a band — measured at `min(--fold-zone, 36% of the viewport height)` — so it never eats the readable area.

## Trigger

scroll, continuously (no thresholds, no play-once)

## Implementation

`page-bend.js` measures each target's document position through an `offsetTop` chain, then per frame computes `past = mid − scrollY − (viewportHeight − zone)`. While `past < round × angle` the row is still on the arc: `d = past/round`, `Y = round·sin(d) − past`, `Z = −round·(1 − cos(d))`. Past that point it leaves the arc and continues straight: `Y = round·sin(angle) + L·cos(angle) − past`, `Z = −round·(1 − cos(angle)) − L·sin(angle)`, with `L` the distance beyond the tangent. The applied transform is `translate3d(0, Y, Z·dir) rotateX(−dir·d)`. Opacity comes from depth rather than position: `t = clamp((−Z − fadeIn)/(fadeOut − fadeIn))`, `opacity = 1 − t²(3 − 2t)` — a smoothstep. The container gets `perspective-origin: 50% (scrollY + vh/2 − containerTop)px`.

Measured properties on the live site: `--fold-angle` 64 and 36 in different sections (0 under reduced motion), `--fold-round` 132 and 300, `--fold-zone` 150 and 340, `--fold-persp` 1100px, `--fold-dir` ±1 so one section folds away and another folds toward. The loop runs on the GSAP ticker, an `IntersectionObserver` with `rootMargin: 20%` clears every transform when the section leaves, and each row caches its last transform string so an unchanged frame writes nothing.

## Distilled implementation

The same two-regime formula, the same smoothstep fade, the same scroll-tracked `perspective-origin`, driven by a cancel-and-rerequest rAF instead of the GSAP ticker. The per-row write cache is kept because it is part of why the original stays cheap. A live readout prints the fold line, the zone, and the front row's bend, depth and opacity, and a toggle draws the fold line so the band is visible rather than inferred. Direction is a switch, so both of the original's configurations can be felt from one page.

## Key techniques

- wrapping onto a cylinder, not rotating: sine and cosine of the travelled angle
- a second regime past the tangent point, so the row leaves the arc in a straight line
- `perspective-origin` tracking the scroll, keeping the vanishing point ahead of the reader
- radius clamped to `zone / angle`, so the arc can never exceed the band it is given
- opacity from depth (smoothstep), not from position on the page
- per-row transform caching; an `IntersectionObserver` that clears everything when idle
- every tunable exposed as a custom property — the site runs two different folds from one implementation

## Parameters worth tuning

- `--fold-angle` — 36° here, 64° in the original's other section
- `--fold-round` — 300 (132 for the tighter fold)
- `--fold-zone` — 340px, clamped to 36% of the viewport
- `--fold-persp` — 1100px
- `--fold-dir` — 1 away from the reader, −1 toward
- `--fold-fade-in` / `--fold-fade-out` — 240 / 760 depth units

## Fidelity

high

## Difficulty

Medium

## Tags

scroll, 3d, layout, motion
