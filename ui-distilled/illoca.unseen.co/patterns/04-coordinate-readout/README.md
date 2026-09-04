# Blueprint coordinate readout

Source:
https://illoca.unseen.co/

## What is interesting

A tiny `X 000.00 / Y 000.00` sits in the top-left corner and follows the pointer. It is not a tooltip: it never moves, never covers what you are pointing at, and never has to decide which side of the cursor to sit on. It costs one fixed element and makes a page feel like an instrument. Two details carry it — the numbers are zero-padded tabular numerals, so the readout never changes width and never twitches, and it recolours itself to stay legible when dark artwork passes behind it.

## Behavior

The numbers track the pointer continuously. Over light ground the labels are near-black and the values grey; over dark artwork both flip to white across a 200ms colour transition.

## Trigger

pointer move; the light/dark swap on section change

## Implementation in the original

`.coords` is `fixed top-37 left-32 z-3`, `font-architect text-12 leading-1 tabular-nums transition-colors duration-200`. Two lines, each a `<span>` label plus a text node for the value. Colour comes from three rules: `.coords { color: gray }`, `.coords span { color: #414141 }` and `.coords.is-white, .coords.is-white span { color: #fff }` — so the *label* is the darker element and the number is the greyed one, which is the opposite of the usual arrangement. A pointer handler writes `clientX.toFixed(2).padStart(4, "0")` and the same for Y — raw client pixels, no easing, no normalisation. `is-white` is not computed from what is on screen: sections emit `header:white` / `header:dark` on an event bus and the readout (and the email link beside it) add or remove the class.

## Distilled implementation

The same element, the same three colour rules, the same `toFixed(2).padStart(4, '0')` on raw client pixels as the default. The distillation adds what makes it reusable: a unit switch (px, grid cells, normalised 0–1), an optional lerp so the readout can trail the pointer, cell snapping, and a crosshair drawn at the reported position so the number can be checked against something. The light/dark swap is derived rather than broadcast — the readout is `pointer-events: none`, so a hit test at its own centre returns whatever is behind it, and any element opts in by declaring `data-tone`. That keeps the demo self-contained and works for a fixed overlay over arbitrary content; the original's event bus is the better choice when the page already knows its own sections.

## Key techniques

- a fixed corner readout instead of a cursor-following tooltip: no occlusion, no flip logic, no z-index fights
- `padStart` plus `tabular-nums`: the string can never change width, so the block never shimmers
- label darker than value — the number is the thing being read, and it is the quieter of the two
- `transition-colors` on the container and the label, so the light/dark swap is a fade rather than a jump
- deriving the swap from `elementFromPoint` under the readout's own box, which needs no coordination with the page
- cancel-and-rerequest `requestAnimationFrame`, never a boolean latch, so a hidden tab cannot freeze it

## Parameters worth tuning

- unit — px (as the original), cells, or normalised
- `--cell` — 16px
- `--lerp` — 1 (instant, as the original); lower it to make the readout trail
- decimals and pad width — 2 and 4
- `--swap` — 200ms

## Verification

Measured live: pointer 63.4/7.25 prints `63.40` / `7.25`; in cell mode 320px reads `20.00` at a 16px cell; label `rgb(65,65,65)`, value `rgb(128,128,128)`, and with `is-white` both `rgb(255,255,255)`; the tone switch toggles the class in both directions. No console errors.

## Fidelity

high — colours, format and transition are taken from the source; the light/dark trigger is derived rather than broadcast, which is documented above.

## Difficulty

Easy

## Tags

microinteraction, cursor, typography
