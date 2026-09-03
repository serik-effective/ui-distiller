# Scoring — ranking candidates

Read this while ranking in Stage 3, once the candidate list exists. It decides what gets built and, more importantly, what does not.

Score every candidate on five axes, 1–5. Be strict; a 5 must be rare.

## Axes

### Visual impact — how strongly it lands
1. Barely noticeable.
2. Noticeable if you look for it.
3. Clearly felt, pleasant.
4. Makes you re-scroll to watch it again.
5. Memorable on first sight; the reason the site gets shared.

### Originality — how uncommon it is
1. Framework default.
2. Common on any agency site.
3. Familiar idea, above-average execution.
4. Uncommon combination or a fresh twist.
5. Rarely seen anywhere; new idea or new mechanism.

### Reusability — how easily it transplants
1. Only works inside this exact layout and content.
2. Needs heavy adaptation.
3. Portable with moderate rework.
4. Drops into another project with light theming.
5. Generic mechanism, useful across many interfaces.

### Implementation interest — what a developer learns from it
1. One CSS property.
2. Straightforward, nothing to learn.
3. Decent composition of a few techniques.
4. Non-obvious approach; the *how* is instructive.
5. Genuinely clever — reading the implementation teaches a technique.

### Difficulty — effort to recreate faithfully (planning only, not part of the score)
1. Pure CSS, minutes.
2. CSS + a few lines of JS.
3. Real JS logic (rAF, observers, FLIP).
4. Precise timing/physics or canvas work.
5. Shaders, 3D scenes, or heavy multi-system coordination.

## Formula

```
distill score = (2·Visual + 2·Originality + 1.5·Reusability + 1·Interest) / 6.5
```

Range 1.00–5.00. Report to one decimal.

Difficulty never raises or lowers the score. It decides build order and sets the README's `Difficulty` field:

```
1–2 → Easy      3 → Medium      4–5 → Hard
```

## Selection

- Sort by score. Take everything ≥ 3.5.
- If that yields fewer than 3, take the best available down to 3.0 and say in the report that the site offered little.
- If it yields more than 12, keep the top 12 with category diversity — do not ship six hover variants.
- Never manufacture candidates to hit a number. Three excellent demos are a better deliverable than ten forgettable ones.
- Prefer a spread across triggers (hover / scroll / click / route / pointer) and across mechanisms (CSS / JS / canvas).

## Tie-breaks, in order

1. Higher Reusability.
2. Lower Difficulty (ship the one that will actually be finished well).
3. Category not yet represented in the selection.

## Calibration examples

| Candidate | V | O | R | I | D | Score | Verdict |
|---|---|---|---|---|---|---|---|
| Buttons fade on hover | 1 | 1 | 3 | 1 | 1 | 1.5 | reject |
| AOS-style fade-up on scroll | 2 | 1 | 4 | 2 | 1 | 2.2 | reject |
| Nav indicator that slides and squashes | 3 | 3 | 5 | 3 | 2 | 3.5 | borderline — keep if slots remain |
| Magnetic button with spring return | 4 | 3 | 5 | 4 | 3 | 4.0 | keep |
| Per-line masked text reveal with stagger | 4 | 3 | 5 | 4 | 2 | 4.0 | keep |
| Clip-path curtain page transition, reversed on back | 5 | 4 | 4 | 5 | 4 | 4.5 | keep, headline |
| WebGL displacement on image hover | 5 | 5 | 3 | 5 | 5 | 4.6 | keep, headline |
| Cursor-masked alternate layer | 5 | 5 | 4 | 4 | 4 | 4.6 | keep, headline |

## Reality check before building

For each selected pattern answer yes to all:

- Can it be demonstrated without the site's content?
- Is there one clear trigger a visitor will find in the demo within five seconds?
- Can the interesting parameters be exposed as tunable values?
- Can it be built without importing the original's framework?

A no means either rescope the pattern (isolate the reusable part) or drop it.
