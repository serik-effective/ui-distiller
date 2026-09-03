# Bracket hover marks

Source:
https://www.ceragres.ca/

## What is interesting

The top navigation does not underline, embolden or shift anything on hover. Two pseudo-elements — 4px wide, 14px tall, with one of their four borders dropped so each reads as a bracket — slide in from twenty pixels out and fade in as they arrive. The label itself is never touched, so a dense uppercase nav bar stays completely still while the pointer travels across it, and the same marks double as the current-page indicator by staying closed on `[aria-current]`. It is a very small idea, executed with unusual restraint.

## Behavior

Hover a nav link: a `[` slides in from the right and a `]` from the left, both fading up over 400ms on a steep in-out curve, framing the label without moving it. Leaving reverses. The active page keeps its brackets permanently.

## Trigger

hover, `:focus-visible`, and `[aria-current="page"]` as a persistent state

## Implementation

`.c-menu-d__top-link::before` and `::after` are absolutely positioned at `left: -5px` / `right: -5px`, `width: 4px`, `height: 14px`, `border-width: 1px 0 1px 1px` (top, bottom and left only), `opacity: 0`, `color: inherit` so they take the nav's current colour. The `::before` sits at `transform: translate(20px)`; the `::after` is the same sliver at `transform: rotate(180deg) translate(20px)`, which is how one border definition produces both a `[` and a `]`. Hover and `:focus-visible` set `opacity: 1` and remove the translate; `[aria-current]` and `[aria-expanded="true"]` apply the same open state. The transition is `.4s cubic-bezier(.54, 0, .06, .87)`.

## Distilled implementation

Identical geometry and easing, with the sliver size, gap and travel lifted into custom properties so the mark can be re-proportioned for a 14px nav label or a 44px headline without touching the rules. Because the arms are sized in absolute units, scaling them for larger type is a deliberate choice rather than an automatic one — the demo shows both, and the panel makes the trade-off adjustable.

## Key techniques

- one pseudo-element definition rotated 180° to make its own mirror
- three-sided border on a 4px box as a bracket glyph
- `color: inherit` so the marks follow the nav's light/dark state
- transform + opacity only — no layout property changes, so no reflow in a nav bar
- the same open state reused for hover, focus and current page

## Parameters worth tuning

- `--bracket-w` — 4px arm width
- `--bracket-h` — 14px arm height (match it to the cap height of the label)
- `--bracket-gap` — 5px outside the label box
- `--travel` — 20px slide-in distance
- `--dur` — 400ms

## Fidelity

high

## Difficulty

Easy

## Tags

microinteraction, navigation, hover, typography
