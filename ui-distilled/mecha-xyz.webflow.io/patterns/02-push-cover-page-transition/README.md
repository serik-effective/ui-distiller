# Push-and-cover page transition

Source:
https://mecha-xyz.webflow.io/

## What is interesting

Most cover transitions hide a cut. This one moves the outgoing page as well: the whole wrapper is pushed 200px upward on a long steep curve while a coloured panel rises over it from below, and the panel is already the colour of the destination route. By the time the swap happens the viewer has seen the next page's ground tone and the current page visibly leaving. The incoming page then arrives from the same 200px offset, so departure and arrival are one continuous gesture rather than two effects.

## Behavior

Click an internal link: a tint fades over the page, the page slides up by the push distance, and 150ms later a full-bleed panel in the destination's colour rises from the bottom over 900ms. It holds for 300ms, the content is exchanged underneath, the panel continues off the top, and the new content settles down from the push offset. Going back resets every layer and replays the entrance.

## Trigger

click on a same-origin link (and browser back)

## Implementation

A delegated document click handler intercepts anchors, skipping cross-origin, hash, `mailto:`, `tel:` and `target="_blank"`. Smooth scrolling is stopped and reset to 0 immediately. The destination pathname selects an overlay colour from a small map (`/` → `#e9edef`, `/blog` → `#E9E7DB`, everything else white). Three tweens run against a shared CustomEase — `M0,0 C0.82,0 0.18,1 1,1`: the tint to opacity 1, the overlay from `y: 100%` to 0 with a 0.15s delay, and the page wrapper plus any fixed elements to `y: -200` over 1.2s. Navigation fires 0.3s after the overlay lands. On return, a `pageshow` handler checks `event.persisted` and resets the overlay, tint, wrapper and sticky elements before replaying the entrance timeline — without that, a bfcache restore leaves the page frozen under a covered overlay.

## Distilled implementation

Real navigation is replaced with hash routes and a content swap so the whole transition is observable in one file, but every layer, delay and ordering is preserved. GSAP is replaced with CSS transitions driven from JS; the CustomEase control points map directly to `cubic-bezier(.82, 0, .18, 1)`. Fixed chrome is animated separately from the wrapper, exactly as the original does, because fixed elements do not inherit the wrapper's transform. The Back button runs the same reset-then-replay path as the original's `pageshow` handler.

## Key techniques

- outgoing page pushed while the cover rises — departure is animated, not hidden
- overlay colour selected from the destination route before the destination exists
- staged offsets: tint immediately, cover at +150ms, navigate at cover end +300ms
- fixed elements tweened in parallel with the transformed wrapper
- explicit reset on back/bfcache restore, then the entrance replayed

## Parameters worth tuning

- `--push` — 200px departure distance
- `--dur-cover` — 900ms panel travel
- `--cover-delay` — 150ms offset behind the push
- `--hold` — 300ms covered dwell before the swap
- `--ease` — cubic-bezier(.82, 0, .18, 1)

## Fidelity

high

## Difficulty

Medium

## Tags

page-transition, navigation, motion
