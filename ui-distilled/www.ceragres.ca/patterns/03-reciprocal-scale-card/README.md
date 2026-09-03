# Reciprocal-scale card hover

Source:
https://www.ceragres.ca/projets/

## What is interesting

On hover the image frame scales to `0.913 × 0.861` while the picture inside scales to `1.0952902519 × 1.1614401858`. Those pairs multiply to exactly 1.0000 — measured, not approximately — so the photograph is not touched at all: it stays the same size, in the same place, at the same crop centre, while the window onto it contracts. The result reads as a frame closing in rather than the usual image-zooms-inside-a-static-frame, and it costs two transforms. The caption then rises by `4.624cqw`, a container-relative unit, so the same gesture holds its proportions whether the card is 320px or 700px wide.

## Behavior

Hovering a card pulls its image frame in — slightly more vertically than horizontally, which reads as a letterbox tightening — while the photograph stays perfectly still. At the same time the meta row lifts and both text rows gain 3rem of horizontal padding, so the type visually follows the narrowing frame. An arrow fades in. Everything runs 400ms on a steep in-out curve.

## Trigger

hover (and `:focus-visible`, with the same rules)

## Implementation

`.b-project-card` is a `container-type: inline-size` element. Under `@media (hover:hover)`, `:hover` sets `.b-project-card__image { transform: scale(.913, .861) }` and `.b-project-card__image img { transform: scale(1.0952902519, 1.1614401858) }`; `.b-project-card__info` gets `transform: translateY(-4.624cqw)` plus `padding-left/right: 3rem`; the title wrapper takes the same padding; the icon goes to `opacity: 1`. All of it transitions on `.4s cubic-bezier(.54, 0, .06, .87)`. The frame carries `overflow: hidden` and a fixed `aspect-ratio: 692/460`, which is what turns the frame's shrink into a crop.

## Distilled implementation

The same rules with the scale pairs lifted into custom properties, and the reciprocal computed rather than hard-coded so the relationship is visible while tuning. A "keep image locked" checkbox switches the inner scale between `1/frame` and `1`, which turns the effect into an ordinary frame shrink and makes the difference obvious in one click. A live readout prints both scales, their product, the current card width, the resolved value of 1cqw, and the pixel distance the caption travels — the point being that the travel is derived from the card, not from the viewport. Photographs are CSS gradients, so no site imagery is used.

## Key techniques

- reciprocal transform pair: `frame × image = 1`, so the picture is provably static
- non-uniform scaling (more vertical than horizontal) for a letterbox feel
- `overflow: hidden` plus a fixed `aspect-ratio` to turn a scale into a crop
- container query units (`cqw`) so the caption travel is proportional to the card
- `padding-inline` animated alongside the transform, so type tracks the frame
- `@media (hover:hover)` guard plus a `:focus-visible` duplicate for keyboards

## Parameters worth tuning

- frame scale — 0.913 × 0.861 (the image scale must follow as its reciprocal)
- `--lift` — 4.624cqw
- `--inset` — 3rem of padding gained on hover
- `--dur` — 400ms
- `--ease` — cubic-bezier(.54, 0, .06, .87)

## Fidelity

high

## Difficulty

Easy

## Tags

cards, hover, layout, motion
