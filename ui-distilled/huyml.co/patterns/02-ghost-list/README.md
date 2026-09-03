# Ghost list

Source:
https://huyml.co/

## What is interesting

A column of project entries where every line sits at 24% opacity and only the one crossing an invisible reading line comes to full. Nothing is selected and no active class is managed by a click — legibility is purely a function of position, so the list stays readable one item at a time while the whole column drifts. It gives a long index a single focus without a scrollbar, a highlight bar or a hover state, and it costs one opacity transition.

## Behavior

The column moves continuously upward alongside the imagery. As an entry reaches the middle of the viewport it lights to full opacity and its picture crossfades in on the left; as it leaves, it returns to ghost. Wheeling scrubs the column faster; the behaviour is identical, just quicker.

## Trigger

the shared virtual scroll — no click, no hover

## Implementation

Measured on the live site: inactive entries compute to `opacity: 0.24`, the current one to `1`. Entries are spaced roughly 160–173px apart and all carry `translateX(-125px)`, with the column translated as a block by the same virtual scroll value that drives the WebGL card belt. The entries themselves are ordinary DOM — this is the readable half of a canvas-driven page.

## Distilled implementation

One track translated by `translate3d(0, -wrapped, 0)`, where `wrapped` is the shared scroll value modulo the column length so the list is endless. Each frame, every entry's centre is compared with the reading line at the middle of the column; the nearest one within a tunable window gets the `on` class, everything else falls back to the ghost value. The left-hand plate crossfades to the matching image from the same index, which shows the pattern's real value: one position drives two very different presentations.

The reading line can be made visible, and the window, ghost opacity, spacing, fade and drift are all live.

## Key techniques

- opacity as a function of distance from a line, not of a stored selection
- one wrapped translate on a track, entries laid out statically inside it
- a tunable activation window rather than a single exact position
- a second view (the image plate) fed by the same resolved index
- the ghost value in a custom property, so the whole column re-tunes at once

## Parameters worth tuning

- `--ghost` — 0.24, measured from the original
- `window` — 0.5 of an item's spacing counts as "at the line"
- `--spacing` — 172px between entries
- `--fade` — 450ms to light up
- `drift` — 24px/second

## Fidelity

high

## Difficulty

Easy

## Tags

scroll, typography, layout, microinteraction
