# Candidates — illoca.unseen.co

Scores: visual / originality / reusability / interest / difficulty → distill score

## C01 — grid-quantised clip-path frame → DISTILLED 01
Four fixed, full-viewport layers all painted with the same `background-attachment: fixed`
graph-paper gradient, each clipped from a different side: left `inset(0 Nvw 0 0)`, right
`inset(0 0 0 Nvw)`, top `inset(0 0 Nvh 0)`, bottom `inset(Nvh 0 0 0)`. Because every panel
shares one fixed background, the grid lines stay continuous while the opening moves.

The inset values are computed from a measured grid cell (`.js-grid-width`, 16px default):
`left = 100 − cell·d / viewportWidth · 100`, so the frame is always a whole number of squares
thick. Named states, measured from source: `open` (top 28 cells, 30 on ipadpro; sides 1, 2 on
lg; bottom 0, 1.5 lg, 4 ipadpro), `openToNav` (top 6, 9 ipadpro), `toLeft`/`toRight` (one side
to 38 cells, 53 on retina — the frame becomes a drawer), `closed` (50 everywhere) and
`fullyOpen` (100 everywhere). One GSAP timeline tweens all four `clipPath` values from position
0 with a custom `joe.inOut` ease; the intro runs `closed → open` over 1.8s and publishes
`introProgress` on update.
5 / 5 / 4 / 5 / 3 → 4.77

## C02 — blueprint loader → DISTILLED 02
A looping technical-drawing animation on `joe.inOut` at 0.5s: three line pairs slide across at
`x: 110%` and `130%`, staggered 0.1s; two arrows travel on Y; two circles scale to 2.4 and 3.4
while two more pop in from 0; a second loop rotates an arc −90° → 0° → 90° over 2.4s. On load
four SVG quadrants separate (`65%/65%`, `−42%/65%`, `65%/−46%`, `−42%/−46%`) over 1s, the icon
group wipes out with `clip-path: inset(0% 100%)` over 2.8s, and at 1.1s the loader calls the
frame's `open()` — so the loader hands directly to pattern 01 rather than fading out.
4 / 5 / 3 / 4 / 3 → 4.08

## C03 — hand-annotation callouts → DISTILLED 03
Marker-style labels in Caveat set beside the headline with drawn underlines and a small arrow
("ARCHITECTURAL", "→ NOT SOFTWARE"), positioned as absolute callouts against the grid rather
than in the text flow.
4 / 4 / 5 / 3 / 2 → 4.08

## C04 — blueprint coordinate readout → DISTILLED 04
A fixed `X 0.00 / Y 0.00` readout in Space Mono tracking the pointer, greyed at `gray` with
`#414141` values, and an `.is-white` variant for when it sits over dark artwork.
3 / 4 / 5 / 3 / 1 → 3.77

## C05 — grain overlay → REJECTED (2.7)
`grain-400.jpg` repeated, `mix-blend-mode: overlay`, opacity 0.2, fixed at z-index 100. Well
judged, but a grain layer is one declaration and is everywhere.
2 / 2 / 5 / 2 / 1 → 2.69

## C06 — WebGL canvas → NOT ASSESSED
A `webgl2` canvas at 2160×1350 sits behind the hero. Its role could not be established: in the
in-app browser it never sized (0×0) and the intro stayed locked, and the headless render shows
the illustration without revealing whether the canvas draws it or only treats it. Left alone
rather than guessed at.

## Environment notes
- The page has no native scroll: `body { overflow: hidden }` with a `.lenis` container of
  31286px. `window.lenis` is the module namespace, not the instance, so it exposes no `scrollTo`.
- In the in-app browser the intro never completed — `.lenis-stopped` persisted and the loader
  stayed at opacity 1 — so measurement came from the CSS and the Nuxt chunk plus headless shots.
- The consent dialog was hidden locally for the reference frame. It was not accepted.
