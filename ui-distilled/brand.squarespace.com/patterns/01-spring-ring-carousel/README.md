# Spring ring carousel

Source:
https://brand.squarespace.com/

## What is interesting

Three ideas stacked on one component. The items sit on a horizontal ring in real 3D, on a platter tilted back on X and pushed away from the camera. The ring's position is not tweened between indices but held by a **spring**, so the direction of travel is read from the spring's own velocity rather than tracked separately — and a keypress temporarily raises the stiffness, so keyboard navigation feels sharp while a drag still settles softly. Best of all, each "card" is not a card: it is a **full-viewport panel cropped by `clip-path`**. Activating one animates the inset to zero, so the panel does not grow into a page — it simply stops being cropped, and the layout it always had is revealed in place.

## Behavior

Six panels orbit a tilted ring. Drag horizontally and the ring follows the hand; release and it springs to the nearest panel, overshooting slightly. The wheel and the arrow keys move it too. Once the ring settles, the front panel scales up and its crop opens out to full screen, while the caption underneath rolls up and is replaced.

## Trigger

drag · wheel · ArrowLeft / ArrowRight · click a panel

## Implementation

Placement is three lines per item: `angle = base + index / count × -360`, `x = cos(angle) × radius`, `z = sin(angle) × radius`, written as `translate3d(x, 0, z) rotateX(0) rotateY(faceY) rotateZ(0)`. The ring parent takes `translateZ(depth) rotateX(tiltX) rotateZ(tiltZ)`, where the tilts are themselves lerped by an intro progress value and by the spin direction. `faceY` is `0` when items billboard, otherwise `-angle + 90` so each panel keeps the tangent of the circle. Radius lerps between a resting and a "spinning" value driven by a zoom progress.

The index lives in a spring store: `spring.set({ pr })`, with `config.stiffness` and `config.damping` mutated at runtime; `spinDir = Math.sign(spring.state.properties.pr.velocity)` feeds the ring's roll. Arrow keys bump the index, set stiffness to 80, and restore 100 after a second.

Each item's inner element is `width: 100vw; height: 100dvh; margin: -50dvh -50vw`, centred on the item origin. A `clipScale` (0.8) of a contain-fitted 500×385 box produces inset percentages; the applied inset is those values times `1 − activePr`, and `activePr` is a `gsap.to(…, { duration: .8, ease: 'power2.out' })` toggled by the active flag. Scale lerps `scaleDown → 1` over the same progress.

## Distilled implementation

Same geometry, same spring, no GSAP: a delta-time integrator (`v += (force − v·damping)·dt`) drives `pr`, and the same `Math.sign(velocity)` gives the spin direction. Drag sets `pr` directly and releases to the nearest index by the short way round the ring; the arrow keys apply the same temporary stiffness boost. Panels are CSS-gradient compositions with an oversized numeral, so nothing is loaded. `advance(dt)` is exposed on `window.RING` so the spring can be stepped by hand from the console — useful for tuning, and the only way to inspect the motion in an environment where `requestAnimationFrame` is throttled.

The site's typography inside each panel is a Rive state machine; that is a proprietary runtime plus a binary asset, so the demo replaces it with plain type and the ring itself is the subject.

## Key techniques

- ring placement by `cos`/`sin` into `translate3d(x, 0, z)`, one item per angle slot
- tilted parent (`rotateX` + `translateZ`) with `transform-style: preserve-3d` on both levels
- billboarding as `rotateY(0)` versus tangent-following `rotateY(-angle + 90)`
- spring integration on a fractional index, with velocity reused as the spin direction
- transient stiffness boost on keypress, restored on a timer
- panels as full-viewport layouts cropped by `clip-path: inset()`, opened by animating the inset to 0
- z-index derived from the item's own `z` so overlap order tracks the geometry
- shortest-path index wrapping so the ring never takes the long way round

## Parameters worth tuning

- `radius` — 420px
- `tilt` — 24° platter angle
- `depth` — 520px push-back (with `perspective: 1600px` on the stage)
- `stiffness` / `damping` — 100 / 16, with a 190 boost for 700ms on keypress
- `crop` — 26% inset for an inactive panel
- `scaleDown` — 0.8
- `billboard` — on/off

## Fidelity

high

## Difficulty

Hard

## Tags

3d, motion, cards, microinteraction
