# Drag-spring 3D object

Source:
https://mecha-xyz.webflow.io/

## What is interesting

The hero object answers two inputs at once without either fighting the other: scroll scrubs a base rotation, and dragging adds a tilt that is integrated by a real spring — force proportional to error, velocity damped, stepped by delta time — and clamped to ±25°. Release and the target snaps to zero while the velocity carries it past and settles. The camera is orthographic with a frustum rebuilt from the container's aspect ratio, so the object holds its size in any slot and never picks up perspective distortion; the renderer is even re-parented between desktop and mobile containers on resize instead of being rebuilt.

## Behavior

Drag the object: it tilts with weight, resisting near the clamp. Let go: it springs back, slightly past centre, and settles. Scroll: the base Y rotation turns through half a revolution across the hero's range, independent of whatever the tilt is doing.

## Trigger

drag (pointer) for the tilt, scroll for the base rotation

## Implementation

Three.js with an `OrthographicCamera` at `(5, 5, 5)` looking at the origin and a frustum size of 3. `updateFrustum()` branches on `aspect < 1` to widen either the vertical or horizontal extent, then calls `renderer.setSize` from the container's client box. A scrubbed tween (`scrub: 2`) animates a plain `{ y: 0 }` object to `Math.PI` across the hero section — the render loop reads that value rather than the tween touching the model. Pointer handlers are bound to `window`, not the canvas, so a drag that leaves the element is not lost; they write a clamped `targetTilt`, and `mouseup`/`touchend` set it back to zero. Each frame integrates per axis: `force = (target - current) × STIFFNESS`, `velocity += (force - velocity × DAMPING) × dt`, `current += velocity × dt`, with `dt` capped at 0.1s. `rotation.order = 'YXZ'` keeps the scroll spin and the tilt from interfering.

## Distilled implementation

Same camera, same frustum logic, same integrator, same rotation order; the loaded model is replaced with a small composed group so the demo needs no asset. Scroll progress is read from `scrollY` over the document range instead of a ScrollTrigger scrub. Pointer capture replaces the window-bound mouse and touch pairs — one code path, same "never lose the drag" property. Stiffness, damping, clamp and sensitivity are exposed, which is the fastest way to feel what a spring integrator actually does.

Needs network: Three.js 0.160.0 is loaded from a pinned CDN. Without it the demo shows an explanatory fallback instead of failing silently.

## Key techniques

- spring integrator with delta-time stepping and a capped `dt`
- clamped drag target with a zero target on release — no separate return animation
- summed rotation sources with `rotation.order = 'YXZ'`
- orthographic frustum rebuilt from container aspect, portrait and landscape branches
- pointer capture so the gesture survives leaving the element
- scroll drives a plain number that the render loop reads, not the object directly

## Parameters worth tuning

- `stiffness` — 80
- `damping` — 14 (the original uses a stiffer pair)
- `maxTilt` — 25°
- `sensitivity` — 0.006 rad per pixel
- `frustum` — 3.2 world units of view height
- `spin` — π across the scroll range

## Fidelity

approximate

The mechanism, timing model and camera setup are reproduced faithfully; the original's loaded model, materials and exact spring constants are not recoverable, so the object and its finish are stand-ins.

## Difficulty

Hard

## Tags

3d, webgl, scroll, motion
