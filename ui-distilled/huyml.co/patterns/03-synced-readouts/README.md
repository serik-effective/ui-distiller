# Synced readouts

Source:
https://huyml.co/

## What is interesting

Around the edges of the screen sit five separate readouts — a large wrapping counter, a category, a project name, a three-row meta panel and a colour palette — and all of them are fed by one index. None knows about the others. What makes the change feel authored rather than mechanical is that they do not update together: each is offset by a small stagger, so a single index change reads as a short sequence across the screen. Values roll (out upward, in from below) instead of cross-fading, which keeps the type crisp at every frame.

## Behavior

Advance the index and the counter rolls to the next number, then the category, the name, the role, the launch date and the award follow one after another about 60ms apart, while the palette swatches change colour and the image crossfades underneath. Going backwards behaves identically.

## Trigger

index change — autoplay, arrow keys, or the previous/next controls

## Implementation

Measured on the live site: the counter reads `nn /19` and wraps in both directions; the palette is three swatches whose colours change per project (one project measured `rgb(255,101,66)`, `rgb(244,242,237)`, `rgb(250,237,188)`; another black, white and grey); the left meta panel swaps Role, Launch and Recognition together with the project. Text swaps roll rather than fade.

## Distilled implementation

`setIndex(i)` is the only entry point. It wraps the index, then calls a list of subscriber functions — one per readout — each with its own stagger multiple. A shared `roll()` helper animates any element the same way: add `leaving` (out upward), swap the text after the exit duration, add `entering` to park the new value below with transitions off, force a reflow, then release it. Because every readout goes through that one helper, adding a sixth costs one line.

One bug worth keeping in mind is baked into a comment here: the exit duration is read from a custom property, and the controls write it in `ms` while a stylesheet might write `s`. Parsing it without checking the unit turned a 0.18s swap into a 180-second one.

## Key techniques

- a single `setIndex` with a list of subscribers, one per readout
- per-subscriber stagger, so one change reads as a sequence
- one `roll()` helper reused by every text readout
- `entering` class with transitions disabled to park the incoming value, then a forced reflow
- non-text readouts (palette, image) driven from the same index without special-casing
- unit-aware parsing of CSS time values

## Parameters worth tuning

- `--swap-out` — 180ms for the value to leave
- `--swap-in` — 420ms for the replacement to arrive
- `stagger` — 60ms between readouts
- `every` — 3200ms of autoplay dwell
- the subscriber order — it is the order the eye travels

## Fidelity

high

## Difficulty

Easy

## Tags

microinteraction, typography, motion
