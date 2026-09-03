# Focus burst

Source:
https://www.sashamartynchuk.com/

## What is interesting

A full-screen light burst — rays, glow, ring, flash, wash and drifting motes — built entirely from gradients. The rays are one `repeating-conic-gradient` behind a radial mask, so they fade out before they reach the edge instead of being clipped; every layer is composited with `mix-blend-mode: screen`, so overlaps add light rather than stacking alpha and going muddy. Heavy blur plus `saturate()` and `brightness()` turn what would be flat gradients into something that reads as light. There is no canvas, no image, no particle system, and the whole thing scales to any viewport because the sizes are in `vmax`.

## Behavior

A slow rotation drives the ray fan; the glow layers sit still and bloom; motes drift on long, offset loops. It runs continuously and needs no interaction.

## Trigger

none — ambient

## Implementation

The stage is `position: sticky; height: 100vh; isolation: isolate`, and every layer is absolutely positioned at `left: 50%; top: 56%` — the optical centre, deliberately below the geometric one. Measured from the live stylesheet: rays are `repeating-conic-gradient(from 0deg, transparent 0 4.2deg, #dbe8ff8c 4.2deg 5deg, transparent 5deg 9deg)` at `96vmax`, masked with `radial-gradient(circle, #000 6%, rgba(0,0,0,.55) 26%, transparent 58%)` and blurred 6px. The glow is `62vmax` with `blur(48px) saturate(1.45) brightness(1.15)`; the ring `26vmax` with `blur(16px) saturate(1.6) brightness(1.3)`; the flash `46vmax` with `blur(22px) saturate(1.5) brightness(1.25)`. A `wash` layer covers the viewport at `blur(30px)`, and `.focus__mote` elements are small screen-blended discs.

Behind all of it the original runs a third-party particle canvas, with a radial-gradient background as the fallback when that fails to start.

## Distilled implementation

The same layer stack with the same measured sizes, filters and mask, rebuilt from scratch and driven by custom properties so the ray period, ray width, blur, spin, centre and overall intensity are all live. Motes are generated deterministically from their index — angle, radius, size, duration and a negative delay — so the field is spread out and already in motion on the first frame. A "rays only" switch strips the stack back to the single conic gradient, and the header button toggles `mix-blend-mode` between `screen` and `normal`, which makes the role of the blend mode obvious in one click.

The particle field is not reproduced: it is someone else's runtime, and the burst is the part worth keeping.

## Key techniques

- `repeating-conic-gradient` as a ray fan, with the lit slice narrower than the gap
- a radial `mask-image` so the rays dissolve outward instead of being cut off
- `mix-blend-mode: screen` throughout, so overlapping layers add light
- `blur() saturate() brightness()` turning flat gradients into apparent light
- sizes in `vmax`, so the burst fills any aspect ratio
- an optical centre at 56%, not 50%
- deterministic mote placement from the index, with negative animation delays

## Parameters worth tuning

- `--ray-gap` — 9deg period, with a 0.8deg lit slice
- `--ray-blur` — 6px
- `--ray-spin` — 140s per revolution
- `--cy` — 56% optical centre
- layer sizes — glow 62vmax, flash 46vmax, ring 26vmax
- `--intensity` — a single multiplier over every layer's opacity

## Fidelity

high — edges `meanAbs 7.1` against the reference frame

Measured with `scripts/compare.mjs` against a shot of the original section at 1440×900. A sweep over centre, ray period, glow size and intensity moved the score by less than ±0.1, which says the residual is not in the layer geometry: it is the particle field the demo deliberately omits, plus the site's own headline and chrome. The measured CSS values were kept rather than tuned toward a number the demo cannot honestly reach.

## Difficulty

Easy

## Tags

background, motion, canvas-free, layout
