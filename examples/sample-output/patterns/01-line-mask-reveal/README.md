# Line mask reveal

Source:
https://example.com/

## What is interesting

The reveal is per *visual line*, not per element or per character — so it survives any wrapping, at any viewport width, without hard-coded line breaks. The clipped edge stays razor-sharp while the line travels, which reads as far more deliberate than a fade-up, and costs one transform and one opacity per line.

## Behavior

On load, each headline line slides up from beneath its own clipping edge, 70ms apart, over 900ms on an expo-out curve. Opacity resolves in the first 60% of the travel, so the line is fully opaque before it settles. The supporting paragraph follows as the last item in the stagger sequence.

## Trigger

page-load (and the demo's Replay button; re-runs on resize)

## Implementation

The original wraps each rendered line in an `overflow: hidden` block and translates an inner span from `translateY(110%)` to zero, with a `--i` custom property driving `transition-delay`. Line grouping is computed at runtime after fonts load — words are measured with `getBoundingClientRect().top` and bucketed by row — so the effect stays correct through re-wrapping.

## Distilled implementation

Same mechanism, no library. `split()` renders one span per word, buckets words by their measured `top`, then rewrites the markup as one `.line` wrapper per row. A class on the stage flips every line to its resting transform; `--i` on each line spaces the stagger. A forced reflow between removing and adding the class restarts the transition so Replay works repeatedly. Resize re-splits after a 200ms debounce.

## Key techniques

- overflow-hidden wrapper per visual line (clip, not fade)
- runtime line detection by measuring word `top` positions
- `--i` custom property driving `calc(var(--i) * var(--stagger))` delay
- expo-out `cubic-bezier(.16, 1, .3, 1)` with opacity resolving early
- `document.fonts.ready` before measuring, resize re-split

## Parameters worth tuning

- `--duration` — 900ms
- `--stagger` — 70ms per line
- `--distance` — 110% (over 100% guarantees a fully hidden start)
- `--ease` — cubic-bezier(.16, 1, .3, 1)

## Fidelity

high

## Difficulty

Medium

## Tags

typography, motion, loading
