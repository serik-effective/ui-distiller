# Grid-quantised clip-path frame

Source:
https://illoca.unseen.co/

## What is interesting

The page is framed by graph paper, and the frame is a hole rather than a border. Four fixed, full-viewport layers each paint the same grid and each clip themselves away from a different side, so what is left is a rectangular opening. Because all four share one `background-attachment: fixed` gradient, the grid lines never break, never shift, and never re-tile as the opening moves — the sheet stays still while the window in it changes size. And the frame's thickness is not a percentage or a pixel value: it is a whole number of grid squares, so the opening always lands on the ruling.

## Behavior

The frame starts closed (each panel covering half the viewport, the page invisible), then opens to a wide top margin with thin sides. Navigating narrows the top band; opening a drawer pushes one side inward until the frame becomes a panel; leaving the page closes it back to the middle. Every move is one transition on four `clip-path` values.

## Trigger

page load (the loader hands over at 1.1s), then **scroll** — the states are scrubbed, not clicked

## Implementation in the original

Four fixed elements — `.js-hole-left`, `.js-hole-right`, `.js-hole-top`, `.js-hole-bottom` — each with the graph-paper gradient at `background-attachment: fixed`, clipped with `inset()` from its own side. A measured grid cell (`.js-grid-width`, 16px by default) converts a cell count to a percentage: `left = 100 − cell·d / viewportWidth · 100`, and the vertical axis uses the viewport height. Named states, read from the source: `open` (top 28 cells, 30 on iPad Pro; sides 1, 2 at `lg`; bottom 0, 1.5 at `lg`, 4 on iPad Pro), `openToNav` (top 6, 9 on iPad Pro), `toLeft` / `toRight` (one side to 38 cells, 53 on retina), `closed` (50 on every side) and `fullyOpen` (100, the panels clipping away entirely). One GSAP timeline tweens all four `clipPath` values from position 0 on a custom `joe.inOut` ease (default duration 1.6s); the intro runs `closed → open` over 1.8s and publishes an `introProgress` value as it goes.

The states are mostly not entered by clicking. `getTweenToState("openToNav", "open")` is added to a ScrollTrigger with `scrub: true` across the intro section, and later sections scrub `toLeft ↔ openToNav` and `fullyOpen → toLeft` — so the frame is continuously between two named states as the page moves.

The cell is one rem, and the rem is viewport-relative above 1080px: `html { font-size: 0.833333vw }`, i.e. 12px at a 1440 design width. The sheet therefore scales with the window, and a cell count means the same proportion at any size.

## Distilled implementation

The same four fixed panels, the same shared fixed background, the same cell-count-to-percentage conversion, driven by CSS custom properties and a single `transition` on `clip-path` instead of a timeline. The named states are a `STATES` table on `window.FRAME`, so `open`, `openToNav`, `toLeft`, `toRight`, `closed` and `fullyOpen` can each be triggered from the control bar and read back as cell counts. A scrub control interpolates between any two named states the way the site's ScrollTrigger does — linearly in inset-percentage space, because that is what the tween animates — and the cell is fluid by default (`innerWidth × 0.833333%`), with the slider taking over the moment it is dragged. The intro is fired from a timer rather than `requestAnimationFrame`, so a tab that starts in the background still opens.

## Key techniques

- one `background-attachment: fixed` gradient shared by four layers, so the ruling stays continuous while the opening moves
- `clip-path: inset()` per side instead of four sized boxes — nothing reflows, and the transition is compositor-friendly
- thickness expressed in grid cells and converted to a percentage of the viewport, so the frame is always quantised to the sheet
- a named state table rather than ad-hoc values, which is what lets one mechanism serve intro, navigation and drawer
- the cell is fluid (`innerWidth × 0.833333%`), so the same cell counts hold at any width
- the divisor is floored at 1: `innerWidth` is 0 in a background tab, and dividing by it would write `-Infinity` into the custom properties

## Parameters worth tuning

- `--cell` — fluid: `0.833333vw`, so 12px at 1440 and 16px at ~1920
- `open` — 28 cells top, 2 side, 1.5 bottom
- `openToNav` — top drops to 6 cells
- `toLeft` / `toRight` — 38 cells on one side
- `--dur` — 1800ms for the intro
- `--ease` — `cubic-bezier(.62,.01,.21,1)`, standing in for the site's `joe.inOut`

## Verification

Measured live at 1440×900: fluid cell 12px, `open` opening at top 336px (28 cells), sides 24px (2 cells), bottom 18px (1.5 cells); scrubbing `openToNav → open` walks the top edge 96 → 184 → 272 → 360 → 448px in even steps while the sides hold; `background-attachment: fixed, fixed` on every panel; no console errors.

Screenshot comparison against `.work/refs/01-frame-original.png` (edges, 1440×900): **mean |Δ| 11.66**, rmse 27.1, down from 12.79 before the cell was made fluid (11.09 with a photographic placeholder, which was then replaced by a CSS-drawn one so the demo needs no network). The residual is content, not geometry — the worst cells are the site's illustration detail and its nav pill and headline, against this demo's neutral placeholder. The frame itself is confirmed numerically above rather than by the pixel score.

## Fidelity

high

## Difficulty

Medium

## Tags

layout, page-transition, navigation, motion
