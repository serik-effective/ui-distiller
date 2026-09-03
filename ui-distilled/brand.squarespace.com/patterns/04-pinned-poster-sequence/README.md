# Pinned poster sequence

Source:
https://brand.squarespace.com/color

## What is interesting

A five-viewport section whose stage is `position: sticky`, so scrolling advances a progress value instead of the page. That single value is split into stages: the caption arrives from both edges and meets in the middle, the composition holds still for a beat, and only then does the poster rotate away in 3D. Nothing is tweened and no timeline is kept in sync — every animated property is a pure function of progress, which is why scrolling back up is exact rather than approximately reversed. The hold between the two stages is a single number, so the two halves can be separated or overlapped without re-timing anything.

## Behavior

Entering the section, the title slides in from the left and the description from the right, both fading up, converging over roughly the first 40% of the range. They then sit still. Past about 60%, the poster begins rotating on its Y axis and darkens as it turns away, reaching about 65° at the end of the range.

## Trigger

scroll, scrubbed continuously (no thresholds, no play-once)

## Implementation

The section is a tall block containing one sticky child at `top: 0; height: 100vh`. Progress comes from the section's own rect: `-top / (height − innerHeight)`, clamped. Measured on the live page: `posterFinal__title` moves `translateX(-81px) → 0` and `posterFinal__desc` `+77px → 0` with opacity `0 → 1` across roughly 800px of scroll, after which `posterFinal__main` goes from the identity matrix to a `matrix3d` whose `m11` falls `1 → 0.637 → 0.423` — a `rotateY` of `0° → 50° → 65°` — over the remaining range. GSAP's ScrollTrigger drives it with `scrub`, and Lenis smooths the scroll feeding it.

## Distilled implementation

Same geometry, no library: one `scroll` listener with a cancel-and-rerequest rAF guard recomputes progress and writes four custom properties (`--conv`, `--textOp`, `--rot`, `--shade`); CSS consumes them. The two stages are expressed as sub-ranges of progress — `t = ease(p / textEnd)` and `r = ease((p − textEnd − hold) / (1 − …))` — which is the honest version of what a scrubbed timeline with two tweens does, and makes the hold visible as a number rather than a gap between tween start times. Progress, current stage and the resolved rotation are printed on screen. `window.SEQ.apply()` lets the sequence be stepped without scrolling, which is also how it was verified.

## Key techniques

- tall section + one sticky child as the scroll range, no pinning library
- progress from `getBoundingClientRect()` each frame — no accumulated state to drift
- staged sub-ranges of one progress value, with an explicit hold between them
- animated values passed to CSS as custom properties; the transforms stay declarative
- `perspective` on the sticky stage, `transform-style: preserve-3d` on the poster
- a darkening overlay tied to the same rotation value, so the turn reads as depth
- reduced-motion collapses the range and drops both transforms

## Parameters worth tuning

- `--stage-vh` — 520vh of scroll range
- `--converge` — 84px starting separation (measured: 81 left, 77 right)
- `textEnd` — 0.42 of the range for the convergence
- `hold` — 0.18 of the range with nothing moving
- `--rotate` — 65° final Y rotation
- `--perspective` — 1400px

## Fidelity

high

## Difficulty

Medium

## Tags

scroll, motion, 3d, typography
