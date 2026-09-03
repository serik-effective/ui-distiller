# Candidates — www.sashamartynchuk.com

Scores: visual / originality / reusability / interest / difficulty → distill score

The site ships hand-written, descriptively named modules (`page-bend`, `title-warp`,
`elastic-pulse`, `fold-mode`, `viewport`), so mechanisms could be read rather than guessed,
and the tuning values live in CSS custom properties.

## C01 — cylindrical page fold (page-bend.js) → DISTILLED 01
Content approaching the bottom of the viewport wraps onto a cylinder: while the distance is
inside the arc, `d = r/round`, `Y = round·sin(d) − r`, `Z = −round·(1 − cos(d))`; past the
tangent point it continues along the straight tangent. Transform is
`translate3d(0, Y, Z·dir) rotateX(−dir·d)`, opacity falls by a smoothstep of depth. The
container's `perspective-origin` tracks the scroll so the vanishing point stays with the reader.
Measured properties: `--fold-angle` 64 / 36 (0 under reduced motion), `--fold-round` 132 / 300,
`--fold-zone` 150 / 340 clamped to 36% of the viewport, `--fold-persp` 1100px, `--fold-dir` ±1.
Driven by the GSAP ticker, gated by an IntersectionObserver, remeasured on viewport change.
5 / 5 / 4 / 5 / 4 → 4.77

## C02 — focus burst (CSS) → DISTILLED 02
A sticky stage layering: `repeating-conic-gradient` rays (4.2°/5°/9° stops) under a radial
mask and 6px blur; glow, ring, flash and charge discs as radial gradients at 26–62vmax with
blur 16–48px, `saturate(1.45–1.6)`, `brightness(1.15–1.3)`, all `mix-blend-mode: screen`;
a wash layer and positioned motes. Everything is centred on 50%/56% — the optical centre, not
the geometric one.
5 / 4 / 5 / 4 / 2 → 4.54

## C03 — warped display type (title-warp.js) → DISTILLED 03
Headline drawn into a 2D canvas per character, used as an alpha texture on a 6×320 mesh, then
bent in a WebGL2 vertex shader that integrates a curvature profile over 24 steps:
`th = A·pow(t, uEase)`, accumulating `cos(th)` into Y and `sin(th)` into Z. The bend angle
varies across the width — `A = angle·k·(1 + vary·cos((x−cx)/half·1.9 + 0.7))` — then a
perspective divide and the element's own CSS matrix are applied so the warp sits inside normal
layout. Measured: `--warp-angle` 78, `--warp-ease` 1.7, `--warp-persp` 420, `--warp-vary` 0.09,
`--warp-rise` 1.2 / 3.
5 / 5 / 3 / 5 / 5 → 4.54

## C04 — GPU tier probe (fold-mode.js) → DISTILLED 04
Creates a WebGL context with `failIfMajorPerformanceCaveat`, reads the unmasked renderer through
`WEBGL_debug_renderer_info`, and matches it against a software-rasteriser pattern
(swiftshader|llvmpipe|softpipe|software|basic render). Runs in an OffscreenCanvas Worker with a
5s timeout and a main-thread fallback, then picks a quality tier from renderer class,
`hardwareConcurrency` (>8), `deviceMemory` (≤4 disqualifies), pointer type and viewport width.
URL overrides: `?nogl`, `?lightgrid`, `?heavygrid`.
2 / 5 / 5 / 5 / 3 → 4.08

## C05 — elastic button pulse (elastic-pulse.js) → DISTILLED 05
On pointer enter the control squashes by an amount derived from its own type size:
`c = 0.75 × fontSize`, `scaleX = (w + c)/w`, `scaleY = (h − c·0.33)/h`, so the deformation is
constant in ems whatever the button's width. Out in 0.1s `power1.out`, back over 1s
`elastic.out(1, 0.3)`, with a 500ms re-trigger lock, a MutationObserver for new controls, and
opt-outs for coarse pointers and reduced motion.
3 / 4 / 5 / 4 / 1 → 3.92

## C06 — copy-to-clipboard with a confetti burst → REJECTED (3.5)
26 rects, launch angle −π/2 ± 1.1 rad, speed 180–440 px/s, gravity 900, per-particle spin,
alpha `1 − (t/T)²`, drawn on a self-removing full-screen canvas at the click point (or the icon
centre when triggered by keyboard). Clipboard write with a `mailto:` fallback and an aria-label
that reports the copy. Nicely made; confetti is common.
3 / 3 / 5 / 3 / 2 → 3.46

## C07 — infinite hero grid → HELD
`infinite-grid__card` tiles drifting behind the hero. Not measured in depth this run; the fold
and the warp were the better use of the budget.

## Not distilled
- The Approach particle field renders into a third-party canvas (`focus__unicorn`, Unicorn
  Studio) with a radial-gradient fallback behind it. The surrounding burst layers are CSS and
  are pattern 02; the field itself is someone else's runtime and is out of scope.
- `/admin` is disallowed in robots.txt and carries noindex — not visited.

## Environment notes
- The sitemap resolved the "1 route" warning from `inspect.mjs`: six case studies at /okx,
  /pangeam, /keyword, /globaltrack, /lumus-ai, /payhoa.
- Lenis is bundled inside `elastic-pulse.js` rather than exposed as `window.lenis`, so scroll
  had to be driven natively when measuring.
