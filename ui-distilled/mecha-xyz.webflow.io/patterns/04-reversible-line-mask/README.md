# Reversible line mask reveal

Source:
https://mecha-xyz.webflow.io/

## What is interesting

Two details lift this above the usual split-text reveal. First, the mask is a `clip-path: inset(0 0 -0.3em 0)` rather than `overflow: hidden` — the bottom edge is deliberately opened by a third of an em so descenders are never sliced at rest, while the top and sides still clip hard. Second, the exit is authored, not a rewind: leaving a section upward plays at roughly six tenths of the entrance duration, on a symmetric curve instead of an expo one, and staggers from the last line to the first. Scrolling back up therefore feels composed rather than reversed.

## Behavior

Lines rise from 150% below their masks, 100ms apart, over 2s on an expo-out curve. A hairline rule above the block draws from the left first and hands over to the text. Scrolling back up sends the lines down again — faster, evenly eased, last line first.

## Trigger

scroll into view; the exit fires only on leave-back

## Implementation

`SplitText` splits each `[scroll-name]` into lines. Each line is rebuilt as a mask span (`display:block; clip-path: inset(0 0 -0.3em 0)`) wrapping an inner span carrying the original HTML; only the inner span is animated. Lines are set to `yPercent: 150`. A ScrollTrigger with `start: 'top bottom'`, `end: 'bottom top'` plays `yPercent: 0`, `duration: 2.0`, `ease: 'expo.out'`, `stagger: 0.1` on enter, and on `onLeaveBack` plays `yPercent: 150`, `duration: 2.0 × 0.6`, `ease: 'power2.inOut'`, `stagger: { each: 0.1, from: 'end' }`. Every tween is preceded by `killTweensOf` so direction changes cannot stack. Rules use a separate CustomEase, `lineEase = 0.9, 0.01, 0.19, 1`, scaling X from 0 over 1.2s, with the text staggering in behind them at a tighter 0.06.

## Distilled implementation

Lines are found without SplitText: words are wrapped in spans, their measured `top` values bucket them into rows, and the markup is rewritten as one mask per row. Each mask carries `--i` and `--ri` (forward and reversed index) so a single CSS rule can express both stagger directions. An IntersectionObserver adds `is-in`; the exit class `is-out` is applied only when the scroll direction is upward, matching `onLeaveBack` rather than a generic "out of view". Splitting re-runs on resize, preserving each block's current state. A Show masks control outlines the clip boxes so the descender bleed is visible.

## Key techniques

- `clip-path: inset(0 0 -0.3em 0)` mask — hard top edge, open bottom for descenders
- asymmetric exit: ~0.6× duration, different easing, reversed stagger
- forward and reverse indices as custom properties, one rule for both directions
- direction-aware leave (up only), so scrolling past does not thrash
- rule draws first on a steeper curve, then releases the text beneath it
- re-split on resize with state preserved

## Parameters worth tuning

- `--in-dur` — 2000ms entrance
- `--out-ratio` — 0.6 of the entrance for the exit
- `--stagger` — 100ms per line (60ms in the rule-led variant)
- `--start` — 150% start offset
- `--descender` — 0.3em mask bleed
- `--ease-in` / `--ease-out` — expo-out vs symmetric in-out

## Fidelity

high

## Difficulty

Medium

## Tags

typography, scroll, motion
