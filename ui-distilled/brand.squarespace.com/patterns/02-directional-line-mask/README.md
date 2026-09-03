# Directional line mask

Source:
https://brand.squarespace.com/

## What is interesting

The site's shared masked-text component makes two decisions that most implementations get wrong. First, the mask clips vertically but **not** horizontally — `overflow-y: clip; overflow-x: visible` — so italics, accents and swashes can still overflow sideways while the top and bottom edges stay hard. Second, the exit does not retreat: a line entering from `translateY(100%)` leaves at `translateY(-110%)`, continuing in the same direction and past the edge. Replacing one block of text with another therefore reads as a single upward movement handed from the old line to the new, rather than a rewind followed by a fresh start. The stagger is carried by the element as a `--trs-index`, so one transition rule serves any number of lines.

## Behavior

Lines rise into place from below, 80ms apart, over half a second on a soft ease-out. When the text changes, the current lines continue upward and out; the replacements come up from below into the space they left.

## Trigger

mount / unmount of the text (here: a swap button), plus a replay control

## Implementation

A Vue `<Transition name="mask">` on a wrapper with `.mask { overflow-x: visible; overflow-y: clip; position: relative }`. The transition classes set `--trs-index: 0; --stagger: .08s` and `transition: transform .5s cubic-bezier(.215, .61, .355, 1)` with `transition-delay: calc(var(--trs-index) * var(--stagger))`. `mask-enter-from` is `translateY(100%)`, `mask-enter-to` and `mask-leave-from` are `translateY(0)`, and `mask-leave-to` is `translateY(-110%)` — the asymmetry that gives the pattern its name. The inner line elements carry `text-box: trim-end text`, which removes the half-leading so the mask hugs the glyphs instead of the line box; a `.isCoreTextRendering` branch resets that where the platform's text metrics differ.

## Distilled implementation

No framework: lines are found by measuring word positions and re-wrapped one mask per visual line, each with its `--i`. Three states — `is-out` (below), `is-in` (resting), `is-leaving` (above) — replace the enter/leave classes, and the swap sets `is-leaving`, waits 60% of the duration, then re-splits and plays the entrance. A side-by-side comparison runs the identical entrance against a retreating exit so the difference is visible rather than described. A `CSS.supports('text-box: trim-end text')` check reports whether the trimming is active in this browser instead of silently doing nothing.

## Key techniques

- `overflow-y: clip` with `overflow-x: visible` — hard horizontal edges, free sideways bleed
- asymmetric direction: enter from `100%`, leave to `-110%`
- `--i` / `--stagger` on the element, one transition rule for all lines
- `text-box: trim-end text` so the mask fits the glyphs, not the line box
- re-split on resize with the current state preserved
- exit timed at 60% of the entrance so the handover overlaps

## Parameters worth tuning

- `--dur` — 500ms
- `--stagger` — 80ms per line
- `--enter-from` — 100%
- `--leave-to` — −110% (0% turns it back into a retreat)
- `--ease` — cubic-bezier(.215, .61, .355, 1)

## Fidelity

high

## Difficulty

Easy

## Tags

typography, motion, microinteraction
