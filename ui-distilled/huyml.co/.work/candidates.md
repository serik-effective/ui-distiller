# Candidates — huyml.co

Scores: visual / originality / reusability / interest / difficulty → distill score

## C01 — auto-drifting perspective conveyor → DISTILLED 01
Full-screen WebGL2 canvas (2560×1600) renders a vertical belt of project cards on a curved path:
the centred card is flat and sharp, the ones above and below fold away and recede. Measured: the
belt advances continuously with no input (the synced DOM list drifted ~13–19px between idle
samples) and the wheel adds to it; the index counter wraps 01→19 and back around.
5 / 5 / 3 / 4 / 4 → 4.38

## C02 — ghost list synced to the belt → DISTILLED 02
Right-hand column of project entries, all DOM. Inactive entries measured at opacity 0.24, the one
at the reading line at 1. The column shares the belt's virtual scroll; entries sit ~160–173px apart
and all carry translateX(-125). No active class is toggled by a click — legibility is a function of
position.
4 / 4 / 5 / 3 / 2 → 4.08

## C03 — synced peripheral readouts → DISTILLED 03
One index feeds five independent readouts: a large wrapping counter (nn /19), a kind + name pair,
a left meta panel (Role / Launch / Recognition), and a three-swatch palette that changes per
project (measured: rgb(255,101,66) / rgb(244,242,237) / rgb(250,237,188) on one project,
black/white/grey on another). Values roll rather than cross-fade.
3 / 4 / 5 / 4 / 2 → 3.92

## C04 — project-page thumbnail rail → REJECTED (3.23)
Six thumbnails pinned to the right edge of a project page, drifting upward more slowly than the
content (tops 294 → 267 → 237 → 235 across a wheel burst). No highlight, no filter, opacity 1
throughout — a slow parallax column rather than a minimap.
3 / 3 / 4 / 3 / 2 → 3.23

## C05 — oversized project title over media → REJECTED (3.2)
Giant type ("BY 'KIN") layered above the screenshots on a project page, moving with the scroll.
Striking, but it is layout and z-order rather than a mechanism worth isolating.
4 / 2 / 4 / 2 / 1 → 3.2

## C06 — audio toggle → NOT ASSESSED
Present in the chrome ("Audio Off —"); no audible behaviour could be evaluated headlessly and it
is a control, not a pattern.

## Environment notes
- The cards are WebGL: `document.elementFromPoint` over the card column returns the canvas, and
  `document.images` holds no element wider than 100px. The distilled conveyor is therefore a
  CSS-3D reconstruction of the principle, marked `approximate`.
- The in-app browser rendered the WebGL layer black; headless Chromium rendered the site correctly.
  All measurement was done through scripted Playwright sessions.
- The site is Framer-built (framer-* class names), so there is no readable component source to
  cross-check against — unlike the Nuxt sites in earlier runs, every number here is measured.
- `document.documentElement.scrollHeight === innerHeight`: there is no native scroll at all, so the
  scroll sweep in `inspect.mjs` reported almost nothing. Wheel events had to be dispatched instead.
