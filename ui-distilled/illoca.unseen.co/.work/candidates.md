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

## C06 — scroll-scrubbed camera sequence → DISTILLED 01  (second pass)
The `webgl2` canvas at 2160×1350 is not decoration: it renders the hero and the whole feature
sequence, and scroll flies a camera through it. One camera animation is baked in the GLTF
(`main_camera*`), loaded into a `THREE.AnimationMixer` whose actions are all played but paused
at weight 0 — a pose evaluator, not a player. Its normalised time is a Theatre.js number prop.
The page then reads that prop's keyframes and builds one paused GSAP tween per consecutive pair,
subscribing tween *i* to `scrollProgress:i`, which is emitted by section *i*'s own ScrollTrigger
(`scrub: true`, `start: "top bottom"`, `end: "bottom bottom"`). A second identical loop uses
`main_camera_action_mobile` behind the opposite breakpoint. Per frame the mixer's dummy pose is
copied onto the camera, then a lerped pointer pivot with roll is applied on top.
5 / 5 / 4 / 5 / 5 → 4.77

**Why the first pass missed it.** Two compounding mistakes. The in-app browser never completed
the intro, and instead of switching tools I recorded the canvas as "not assessed". Then the
headless capture set `.lenis` `scrollTop` in single jumps: the DOM ScrollTriggers fired, so the
section text changed and the page looked like it had scrolled, while the scrubbed camera stayed
exactly where it was. Stepping the same scroll in ~24 increments across animation frames shows
the flight immediately (`.work/refs/sw-*.png`). A jump is not a scroll.

## C07 — blueprint cel shading → DISTILLED 02  (second pass)
The material behind the whole scene: `smoothstep(uDiffuseThreshold, +uDiffuseSmoothness, N·L)`
between two tones, a voronoi mask (`tVoronoi`, `uSprayRamp`, `uSprayScale`) multiplied into the
shadow so the terminator breaks into spray, `blendOverlay` grain ramped by
`vWorldPosition.y / uSize.y`, a pointer window (`uMouseHitPos`, `uRadius`, `uRadiusReveal`)
swapping the surface for its blueprint texture, and a UV wipe whose smoothstep edges are pushed
apart by the same noise. Outlines are `Line2` fat-line geometry, not a screen-space filter.
5 / 4 / 4 / 5 / 5 → 4.46

## Environment notes
- The page has no native scroll: `body { overflow: hidden }` with a `.lenis` container of
  31286px. `window.lenis` is the module namespace, not the instance, so it exposes no `scrollTo`.
- In the in-app browser the intro never completed — `.lenis-stopped` persisted and the loader
  stayed at opacity 1 — so measurement came from the CSS and the Nuxt chunk plus headless shots.
- The consent dialog was hidden locally for the reference frame. It was not accepted.
