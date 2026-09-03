# Candidates — brand.squarespace.com

Scores: visual / originality / reusability / interest / difficulty → distill score

## C01 — spring ring carousel → DISTILLED 01
Items placed by cos/sin on a ring (radius lerped by zoomPr), parent rotateX/translateZ, billboard rotateY(0) vs tangent rotateY(-angle+90); index held by a spring whose velocity gives spinDir; keypress raises stiffness 100→80 then restores after 1s; item inner is a 100vw/100dvh panel cropped by clip-path inset, opened by animating inset→0 with gsap power2.out 0.8s.
5 / 5 / 3 / 5 / 5 → 4.5

## C02 — directional line mask (MaskedElement) → DISTILLED 02
overflow-y: clip + overflow-x: visible; enter translateY(100%), leave translateY(-110%); .5s cubic-bezier(.215,.61,.355,1); stagger via --trs-index × --stagger (.08s); text-box: trim-end text with per-engine branches.
4 / 4 / 5 / 4 / 2 → 4.2

## C03 — conditional difference header → DISTILLED 03
.useBlendMode .header__top { mix-blend-mode: difference }; dropped to normal !important on .menuOpen and [theme=override]; menu is backdrop-filter: blur(40px) over 80% bg — the surface difference blending handles worst.
4 / 4 / 5 / 3 / 1 → 4.0

## C04 — pinned poster sequence (/color) → DISTILLED 04
Sticky stage in a ~5vh-tall section; scrubbed progress drives two stages: title translateX(-81→0) and desc (+77→0) with opacity 0→1, then after a hold posterFinal__main rotateY 0→50→65° (m11 1 → 0.637 → 0.423).
4 / 4 / 5 / 4 / 3 → 4.3

## C05 — colour slider (/color) → HELD FOR A LATER PASS (4.1)
Canvas of vertical colour bands; each band's width is a damped spring (lambda 8) weighted by pointer proximity: falloff = 1 − (d/r)², influence radius 0.3 of canvas width (0.1 on touch), peak weight 2 for the first two bands else 1.5, base 0.4. Widths normalised to the canvas; nearest band by centre feeds a cursor label with name and hex.
4 / 4 / 4 / 4 / 3 → 4.1
Not built: the /color page was found after the run had been closed. Strong candidate for the next pass.

## C06 — rolling caption swap → REJECTED (3.46)
Out to -100% alpha 0 (0.2s power2.in), set to 100%, in to 0 (0.5s power2.out), with a switchDelay. Good, but a small variation on a common pattern.
3 / 3 / 5 / 3 / 1 → 3.46

## C07 — overlay menu sibling dimming → REJECTED (3.0)
.menuItem.dimmed { opacity: .3 } with rollover/active back to 1, link translate on hover, index number fading in. The same idea as the :has() menu already distilled from www.ceragres.ca.
3 / 2 / 5 / 2 / 1 → 3.0

## C08 — percentage page loader → REJECTED (3.2)
Counter with masked digits over a bar; gated intro. Close to the gated preloader already distilled from mecha-xyz.webflow.io.
3 / 3 / 4 / 3 / 2 → 3.2

## C09 — arrow button icon swap → REJECTED (3.1)
main/secondary icons in an overflow: clip box with a hidden placeholder for sizing. Duplicate of the button icon pass-through already assessed on www.ceragres.ca.
3 / 3 / 4 / 2 / 1 → 3.1

## Route discovery note
The first pass concluded "single route" and missed every section page. Server HTML links only `/`,
the Nuxt manifest prerenders only `/`, there is no sitemap, menu items have click handlers and no
href, and `/index` 404s. The routes exist only as string literals in the JavaScript:
/logo, /typography, /color, /photography, /campaign, /motion. `scripts/inspect.mjs` now recovers
these automatically and warns when it finds one route or fewer.

## Environment notes
- Image CDN blocked in the headless pass; visual reading came from the in-app browser.
- Lenis suspends its rAF while the tab is hidden, which freezes scroll sampling. Measuring /color
  required `lenis.stop()` plus native scroll and `ScrollTrigger.update()`.
