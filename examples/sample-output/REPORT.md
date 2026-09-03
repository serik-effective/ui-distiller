# UI Distillation Report

URL:
https://example.com

Analyzed:
2026-09-03 · 1 page · 3 candidates · 1 distilled

> This is the shipped shape reference for a real run — one worked pattern, abbreviated prose. A real report covers every section at full depth.

## Design language

Single centred column, one typographic hierarchy, generous vertical rhythm, no imagery. Type does all the structural work; rules and spacing carry the rest.

## Motion language

One easing curve throughout (`cubic-bezier(.16, 1, .3, 1)`), entrances around 900ms, exits notably shorter, stagger near 70ms per element. Motion is vertical and clipped rather than faded.

## Interaction philosophy

The page reveals itself once and then stays quiet. Nothing chases the pointer; hover states are minimal and instant.

## Technology observations

No animation library detected. Plain CSS transitions with custom properties, a small amount of measurement JS, system font stack.

## Best patterns

| # | Pattern | Category | Distill score | Difficulty |
|---|---------|----------|---------------|------------|
| 01 | Line mask reveal | typography | 4.0 | Medium |

## Patterns

### 01 — Line mask reveal
Per-line clipped entrance with runtime line detection. Reusable in any typographic hero and independent of the site's content.

## What makes this site special

- One easing curve applied consistently, which makes unrelated elements feel like one system.
- Reveals are clipped, never faded — edges stay sharp during travel.
- Line grouping is measured at runtime, so the effect never breaks on re-wrap.
- Opacity resolves before travel ends, avoiding the "arriving ghost" look.
- Motion happens once; the resting state is completely still.

## Notes and limits

Single-page reference sample; no route transitions or pointer-driven behavior to analyze.
