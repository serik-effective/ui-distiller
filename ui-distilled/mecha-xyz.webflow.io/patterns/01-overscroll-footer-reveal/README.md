# Overscroll footer reveal

Source:
https://mecha-xyz.webflow.io/

## What is interesting

The footer is not scrolled to — it is pulled out. Once the page hits its scroll limit, further wheel deltas stop being scroll and become pressure: they accumulate into a clamped value that lifts the entire page off the bottom of the window. Stop pushing and the page drops back on a curve that is not the curve it rose with. It turns the dead zone at the end of a document into a deliberate gesture, and it costs one transform on one element.

## Behavior

Scroll to the bottom. Keep scrolling. The whole page slides upward, uncovering a fixed footer beneath it, quickly at first and then flattening out as the accumulator saturates. Pause for 200ms and the page falls back to zero over 450ms with a steep in-out curve — heavier than the rise, so the return reads as gravity rather than a reversal.

## Trigger

wheel, only while the scroll position is at its limit

## Implementation

A `wheel` listener (passive) checks the smooth-scroll instance's `scroll` against its `limit`. When at the bottom and `deltaY > 0`, the raw delta — normalised for `deltaMode`, line-mode deltas multiplied by 20 — is added to an accumulator clamped at 600. Target offset is `-min(accumulator × 0.0012, 1) × footerHeight`. A rAF loop eases the current offset toward the target at 0.12 per frame and writes `translate3d` to the page wrapper. A 200ms idle timer flips the loop into a closing mode which runs a hand-rolled `cubic-bezier(0.86, 0, 0.27, 0.98)` sampler over 450ms back to zero. Leaving the bottom resets everything.

## Distilled implementation

Same structure, no smooth-scroll library: `scrollY` against `scrollHeight - innerHeight` supplies the at-bottom test. The Newton-Raphson cubic-bezier sampler is reproduced as-is because the two-mode loop — lerp while pulling, time-based easing while closing — is the whole point. The footer is a fixed element behind a `z-index: 1` page wrapper. The panel reads back live accumulator and lift percentage so the clamp behaviour is visible while you tune it.

## Key techniques

- clamped wheel-delta accumulator as a pressure reading, not a position
- `deltaMode` normalisation so line-based wheels behave like pixel ones
- two motion regimes in one rAF loop: lerp on the way out, time-based bezier on the way back
- idle timer as the release trigger instead of `wheelend` (which does not exist)
- single `translate3d` on the page wrapper; the footer never moves

## Parameters worth tuning

- `threshold` — 600 accumulator ceiling; lower saturates sooner
- `gain` — 0.0012 accumulator → progress; raise for a twitchier pull
- `follow` — 0.12 lerp factor while pulling
- `closeDuration` — 450ms snap back
- `idle` — 200ms of stillness before the release
- the close curve itself — `cubic-bezier(0.86, 0, 0.27, 0.98)`

## Fidelity

high

## Difficulty

Medium

## Tags

scroll, motion, microinteraction
