# Perspective conveyor

Source:
https://huyml.co/

## What is interesting

The work index is not a list you scroll — it is a belt that is always moving. With no input at all the strip advances; the wheel only adds to a value that was already travelling. Cards ride a curved path so the one at the centre is flat, sharp and readable while those above and below fold away on X and recede in Z, which turns a plain vertical carousel into something with a physical middle. Because positions wrap modulo the belt length, a fixed handful of nodes produces an endless strip.

## Behavior

Cards travel upward continuously. The centre card faces you square-on; its neighbours tilt progressively and fade as they approach the top and bottom edges. Wheeling accelerates the belt and it eases back to its drift; nothing snaps and nothing stops.

## Trigger

none required — it drifts on its own; wheel and drag add to it

## Implementation

The strip is drawn into a full-screen WebGL2 canvas (measured 2560×1600 at DPR 2): `elementFromPoint` over the card column returns the canvas, and no `<img>` in the DOM is wider than 100px, so the tilting cards are textured planes rather than elements. The site is Framer-built, so there is no readable component source; the behaviour was measured instead. The belt's motion is visible in the DOM through the list that shares its scroll value — that column advanced roughly 13–19px between idle samples with no input, which is how the constant drift was established, and the index counter was observed wrapping 01 → 08 → 12 → 03 → 15 across wheel bursts.

## Distilled implementation

A CSS-3D reconstruction of the principle: a `perspective` stage, a `preserve-3d` belt, and one node per card. Each frame computes `d = (i × gap − pos) mod length`, wrapped into ±half a belt, then maps the normalised distance `n = d / half` to `rotateX(−n × bend)`, `translateZ(−|n| × depth)` and an opacity falloff. `pos` eases toward a `target` that the drift increments every frame and the wheel adds to, so the two inputs share one value. Cards recycle by the modulo alone — there is no DOM insertion or removal.

Spacing, drift, bend, depth and catch-up are all live controls, and a centre line can be switched on to see where the arc is flat.

## Key techniques

- one virtual scroll value that is never zero: drift adds, wheel adds, easing follows
- modulo wrapping into ±half the belt so a fixed node count is endless
- distance from centre mapped to `rotateX` + `translateZ` — the arc is arithmetic, not a path
- `z-index` derived from distance so overlap matches the geometry
- opacity falloff at the extremes instead of a hard clip
- delta-time integration, so the drift rate is in px/second rather than px/frame

## Parameters worth tuning

- `gap` — 320px of belt per card
- `drift` — 26px/second with no input
- `lerp` — 0.09 catch-up toward the wheel target
- `bend` — 46° at the extremes
- `depth` — 460px of recession
- `perspective` — 1200px on the stage

## Fidelity

approximate — edges `meanAbs 8.9` against the reference frame

The original renders its cards in WebGL, so the exact warp is a shader on a curved mesh. This demo reproduces the behaviour — continuous drift, wheel-added velocity, flat centre, folding ends — with CSS 3D transforms. Motion, timing and layering match; the per-pixel bend of the original does not.

Measured rather than asserted. `.work/refs/` holds the reference frame (the original at 1440×900, clipped to the card column at `400,0,660,900`) and the candidate shot from this demo in the same state. The first build scored `meanAbs 10.1`; adding the in-plane `twist` and horizontal `sway` the original clearly had, and narrowing the cards from 34vw to 28vw with wider spacing, brought it to **8.9** at the same on-screen density.

A note on the number: wider spacing alone reached 6.7, but only by pushing cards off-screen — an emptier canvas matches an emptier canvas. That variant was rejected, and the honest 8.9 kept. Reproduce with:

```bash
node scripts/compare.mjs diff .work/refs/col-original.png .work/refs/col-v2.png --mode edges
```

## Difficulty

Medium

## Tags

scroll, 3d, cards, motion
