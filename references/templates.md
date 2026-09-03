# Templates

The exact shape of the three files every run produces. Copy the structure; do not improvise section names, because `scripts/verify.mjs` checks for them.

## Pattern README

Path: `patterns/NN-pattern-name/README.md`. Fill every section; delete none.

````markdown
# Masked page transition

Source:
https://example.com/work

## What is interesting

One short paragraph on why this deserves attention — the specific craft, not a description of the effect.

## Behavior

What the user sees, in sequence, with rough timings.

## Trigger

click on an internal link (and browser back)

## Implementation

How the original appears to do it: mechanism, libraries, DOM layers, evidence you based this on.

## Distilled implementation

How this standalone demo works, and where it deliberately differs from the original.

## Key techniques

- clip-path inset animation on a fixed overlay
- asymmetric in/out timing (600ms cover, 480ms uncover)
- content swap at the covered midpoint

## Parameters worth tuning

- `--cover-duration` — 600ms
- `--uncover-duration` — 480ms
- `--ease` — cubic-bezier(.76, 0, .24, 1)
- `--stagger` — 60ms per incoming line

## Fidelity

high

## Difficulty

Medium

## Tags

page-transition, navigation, motion
````

Rules: source is the exact page URL, not the domain. Fidelity is `high` or `approximate`; if approximate, add one sentence naming the gap. Difficulty is `Easy` / `Medium` / `Hard`. Parameters must match real names in the demo.

## REPORT.md

Path: `<root>/REPORT.md`.

````markdown
# UI Distillation Report

URL:
https://example.com

Analyzed:
2026-09-03 · 7 pages · 21 candidates · 9 distilled

Pages: /, /work, /work/case-one, /studio, /contact, /journal, /journal/post

## Design language

The site's visual concept in 3–6 concrete points — restrained brutalism, editorial typography, oversized type, monochrome palette, layered navigation, generous negative space, hairline rules. Name what is actually there; avoid mood-board adjectives with no referent.

## Motion language

Which motion principles repeat across the site: shared easing, entrance/exit asymmetry, stagger rhythm, layered depth, velocity coupling, transition durations. Quote real numbers where measured.

## Interaction philosophy

How the site answers the user: does it acknowledge the pointer, reward scrolling, make navigation feel spatial, keep state during route changes, prefer restraint or spectacle.

## Technology observations

Detected or probable: frameworks, animation libraries, smooth-scroll, WebGL, fonts, image pipeline. Separate confirmed evidence from inference.

## Best patterns

| # | Pattern | Category | Distill score | Difficulty |
|---|---------|----------|---------------|------------|
| 01 | Masked page transition | page-transition | 4.6 | Medium |
| 02 | Cursor-masked layer | cursor | 4.6 | Hard |

## Patterns

### 01 — Masked page transition
Two-sentence description and why it made the cut.

### 02 — Cursor-masked layer
Two-sentence description and why it made the cut.

## What makes this site special

5–10 sharp points about the strongest design and frontend-engineering decisions. Specific and technical; no marketing language.

## Notes and limits

Pages skipped and why; patterns marked approximate; anything the tooling could not observe.
````

## patterns.json

Path: `<root>/patterns.json`. Drives `scripts/gallery.mjs`.

```json
{
  "site": "https://example.com",
  "host": "example.com",
  "analyzedAt": "2026-09-03",
  "stats": { "pages": 7, "candidates": 21, "distilled": 9 },
  "patterns": [
    {
      "slug": "01-masked-page-transition",
      "number": "01",
      "name": "Masked page transition",
      "categories": ["page-transition", "motion"],
      "description": "A fixed overlay clips up over the page, content swaps under cover, then it clips away.",
      "trigger": "click",
      "difficulty": "Medium",
      "fidelity": "high",
      "score": 4.6,
      "scores": { "visual": 5, "originality": 4, "reusability": 4, "interest": 5, "difficulty": 4 },
      "source": "https://example.com/work",
      "needsNetwork": false
    }
  ]
}
```

Field notes: `slug` must equal the directory name under `patterns/`. `number` is a zero-padded string. `difficulty` is `Easy`/`Medium`/`Hard`. `fidelity` is `high`/`approximate`. `score` is one decimal. `needsNetwork` true only when the demo loads a CDN library or remote image. Order the array by score, descending — the numbering follows that order.

## Candidate log

Path: `<root>/.work/candidates.md`. Format shown at the end of `references/detect.md`. Keep rejected candidates in it with a one-line reason and their scores; the report's candidate count comes from this file.

It sits alongside the two capture artefacts, which stay in `.work/` and are not part of the deliverable:

| File | Written by | Holds |
|---|---|---|
| `probe.json` | `scripts/probe.mjs` | library fingerprints, CSS feature census, keyframes, fonts, routes, asset index |
| `inspect.json` | `scripts/inspect.mjs` | live styles and animations, hover-diff sweep, scroll sweep, network, console errors |
| `shots/` | `scripts/inspect.mjs --shots` | baseline, scroll steps, hover states |
