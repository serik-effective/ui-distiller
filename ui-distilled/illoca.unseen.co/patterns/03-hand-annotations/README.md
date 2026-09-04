# Hand-annotation callouts

Source:
https://illoca.unseen.co/

## What is interesting

The headline is set in a clean grotesque; beside it, in marker lettering at a few degrees off-square, someone has written *architectural* and *not software*, each with a wobbly rule under it and an arrow pointing back at the type. The callouts are absolutely positioned against the sheet, not inserted into the sentence, so the paragraph never reflows around them. Two details lift it above a decorative flourish: the characters fade in one at a time rather than the label appearing whole, and the rule is not a border — it is a drawn SVG line revealed by scaling along one axis from its own end, so it reads as a stroke being pulled rather than a bar growing.

## Behavior

On load the left callout's characters fade in from 0.2s at 40ms apart, its rule sweeps out from the left at 0.6s, and the right callout follows a full second later with its own rule expanding from the centre.

## Trigger

page load

## Implementation in the original

`.pagetitle-left` and `.pagetitle-right` are absolutely positioned spans, `-rotate-4`, `font-architect` (Architect Pro, a marker-cap face) at `text-24`, `#8B8B8B`. Both are split into characters and animated on one GSAP timeline: `from(chars, {opacity: 0, stagger: .04, duration: 1.2}, .2)` for the left, the same at position 1.3 for the right. `.pagetitle-line` is an inline SVG of a hand-drawn wobble (`viewBox="0 0 325 5"`) with `origin-left`, animated `fromTo({scaleX: 0, opacity: 0}, {scaleX: 1, opacity: 1, stagger: .05, duration: .6}, .6)`; `.pagetitle-right-line` is a plain `w-full h-px bg-[#5b5b5b]` div with `origin-center`, `scaleX: 0 → 1` over 0.4s on a custom `joe` ease. The arrows elsewhere on the page are glyphs from an Architect Pro Symbols font, rotated by arbitrary amounts (`rotate-210`, `-rotate-143`).

## Distilled implementation

The same structure without the libraries. A small splitter wraps each character in its own `.ch` span and writes `transition-delay` per index, so the stagger is CSS with no timeline. The rule is generated per callout: its width is measured after layout, and a deterministic wobble path is built for that width, so a longer label gets a longer line with a different waver rather than a stretched copy of one asset. `transform-origin` comes from `data-rule`, matching the original's left-origin and centre-origin variants. The arrow is a path rather than a font glyph, because the face is not ours to ship; the marker font degrades through a handwriting fallback stack.

## Key techniques

- absolute callouts anchored to the headline block, offset in whole grid cells — nothing in the text flow moves
- per-character `transition-delay` written from JS: a stagger with no animation library
- an SVG rule revealed by `scaleX` from its own origin (left for one, centre for the other) rather than by drawing a dash offset
- the rule is generated for the measured width of its own label, with a deterministic wobble so it looks drawn but never changes between reloads
- `preserveAspectRatio: none` so one path fits any label width; `vector-effect: non-scaling-stroke` so the scaling never thins the line
- a valueless HTML attribute reads as `''` in `dataset` — the arrow test uses `hasAttribute`

## Parameters worth tuning

- `--char-stagger` — 40ms
- `--char-dur` — 1200ms
- `--line-dur` / `--line-dur-2` — 600ms from the left, 400ms from the centre
- `--t-left` / `--t-right` — 200ms and 1300ms
- `--tilt` — −4deg
- `--cell` — 16px, the unit every offset is a multiple of

## Verification

Measured with transitions forced off: three callouts split into 13, 12 and 21 characters with delays 200/240/280ms and 1300/1340/1380ms, rules ending at `scaleX(1)` with origins `0px` (left) and `64.7px` (centre), three distinct generated paths at viewBox widths 135, 131 and 170, arrow present at opacity 1. No console errors.

## Fidelity

high — the mechanism and timings are taken from the source timeline; the marker face and the symbol-font arrows are substituted.

## Difficulty

Easy

## Tags

typography, layout, motion, microinteraction
