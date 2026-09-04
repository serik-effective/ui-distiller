# Blueprint loader

Source:
https://illoca.unseen.co/

## What is interesting

Most loaders mark time. This one draws. Four quadrants of a technical sketch — sliding dimension lines, travelling arrows, concentric circles, a swinging arc — loop on half-second cycles while the page boots, then the four quadrants separate outward and the whole icon group is wiped away by a `clip-path` that closes to zero width. The important part is the ending: the loader does not fade out and let the page appear. Part-way through its own exit it calls the frame's `open()`, so the graph-paper frame is already opening while the sketch is still leaving. Two separate mechanisms overlap, and the handover reads as one gesture.

## Behavior

A looping drawing for as long as the boot takes. On load the quadrants push apart on asymmetric offsets, the icon group wipes out over 2.8s, and 1.1s into the sequence the frame is told to open.

## Trigger

page load

## Implementation in the original

A GSAP timeline on a custom `joe.inOut` ease at 0.5s per loop: three line pairs slide across at `x: 110%` and `130%`, staggered 0.1s; two arrows travel on Y; two circles scale to 2.4 and 3.4 while two more pop in from 0; a second loop rotates an arc from −90° to 90° over 2.4s. On load the four SVG quadrants translate by `65%/65%`, `−42%/65%`, `65%/−46%` and `−42%/−46%` over 1s, the icon group animates `clip-path: inset(0% 100%)` over 2.8s, and at 1.1s the loader calls the frame's `open()`.

## Distilled implementation

The loop is pure CSS: six keyframe animations with `alternate` direction and per-element delays reproduce the slide, travel, scale-in and swing without a timeline. The exit is three class flips on `<body>` — `is-split`, `is-wiped`, `is-handed` — each mapping to one transition, driven by `setTimeout` rather than `requestAnimationFrame` so a background tab still completes the sequence. A stand-in "frame" underneath receives the handover with the same 6-cell/2-cell inset used by pattern 01, and a live timeline in the corner prints when each stage fired.

## Key techniques

- asymmetric quadrant offsets (`65%` out, `−42%` / `−46%` back) — the sketch pulls apart off-centre, which reads as drawn rather than exploded
- `clip-path: inset(0% 100%)` as a wipe: the group leaves through a single animatable value, with no mask image and no extra layer
- the loop is `alternate`-direction keyframes, so one declaration gives both the outward and return stroke
- the exit overlaps the arrival — the handover fires at 1.1s, well before the wipe finishes at 2.8s
- percentage translates resolve against each quadrant's own box, so the split scales with the sketch

## Parameters worth tuning

- `--loop` — 500ms per drawing cycle
- `--split` — 1000ms for the quadrants to separate
- `--wipe` — 2800ms for the icon group
- handoff — 1100ms, when the frame is told to open
- `--ease` — `cubic-bezier(.62,.01,.21,1)`

## Verification

Measured with transitions forced off at a 160px quadrant: `br` translate 104px/104px (65%), `tl` −67.2px/−73.6px (−42% / −46%), icon clip `inset(0% 100%)`, cover clip `inset(96px 32px)` = 6 and 2 cells at 16px, 13 loop animations running, Replay re-runs the whole sequence. No console errors.

## Fidelity

high

## Difficulty

Medium

## Tags

loading, motion, page-transition
