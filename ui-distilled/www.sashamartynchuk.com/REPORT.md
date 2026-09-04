# UI Distillation Report

URL:
https://www.sashamartynchuk.com/

Analyzed:
2026-09-04 · 2 pages (`/`, `/project/by-kin`-equivalent case study) · 8 candidates · 6 distilled

## Design language

- Pure black ground, white type, and one violet accent used sparingly — the work thumbnails supply all the other colour.
- Two type registers and nothing between them: an ultra-condensed display face at 100px+ for section words (STAFF PRODUCT DESIGNER, LISTENING), and 14px UI text. A handwritten script signs the name and the location.
- Chrome is minimal and floating: a pill nav with the active item filled, a wordmark, an email address. No footer furniture until the end.
- Sections are staged rather than stacked — each takes a full sticky viewport and hands over to the next.
- Every effect is centred slightly below the geometric middle (56%), which is where the eye actually sits.

## Motion language

- Scroll is the only real input, and it drives geometry rather than opacity: rows fold onto a cylinder, type bends along an integrated curve, sections stick and hand over.
- Values are declared in CSS custom properties and read by JS — `--fold-angle`, `--fold-round`, `--fold-zone`, `--warp-angle`, `--warp-ease` — so the same implementation serves two differently tuned folds.
- The site respects `prefers-reduced-motion` at the parameter level, not by disabling code paths: the fold angle becomes 0 and the transform is simply never non-identity.
- Hover motion is elastic and typographic: controls squash by a share of their own font size and spring back over a full second.
- Nothing is instant, and nothing loops aggressively; the ray fan takes 140 seconds for one revolution.

## Interaction philosophy

The page behaves like a single continuous surface that the reader is travelling along, not a stack of panels. Because the fold's vanishing point follows the scroll position, the geometry is always addressed to wherever the reader currently is — a detail almost nobody would notice consciously and everybody would notice if it were missing. The interface spends its effort on the transitions between states rather than on the states themselves, and it is careful about who gets the expensive version: a GPU probe decides, before anything heavy loads, whether the machine can afford it.

## Technology observations

Confirmed:

- GSAP with ScrollTrigger, Lenis (bundled inside `elastic-pulse.js` rather than exposed globally), and SplitType.
- Hand-written, descriptively named modules — `page-bend`, `title-warp`, `elastic-pulse`, `fold-mode`, `viewport`, `gallery-data` — with the tuning values in CSS custom properties. The mechanisms could be read rather than inferred.
- WebGL2 with a custom vertex shader for the display type.
- A full-screen 2D canvas (`.listening__canvas`) drawn by the site's **own** code in `main-DvstoWIA.js`: a scroll-phased node graph, distilled as pattern 06. An earlier version of this report described it as a third-party particle canvas — that was wrong. The third-party runtime (Unicorn Studio, with a CSS radial-gradient fallback) drives the separate `FOCUS` field further down the same section.
- Modern CSS in production: `mask-image`, `repeating-conic-gradient`, `mix-blend-mode: screen`, `perspective-origin` animated per frame, `position: sticky`, SVG filters, `prefers-reduced-motion` branches.
- Platform CSS available and unused: `:has()`, `@starting-style`, `allow-discrete`, scroll-driven animations, view transitions.
- Six case-study routes exist and are only discoverable through the sitemap: /okx, /pangeam, /keyword, /globaltrack, /lumus-ai, /payhoa.

## Canvas and scroll census

| Canvas | Context | Backing | Coverage | Scroll-driven | Verdict |
|---|---|---|---|---|---|
| `.stage-gl` | webgl2 | sized on demand | hero band | yes (scrubbed warp progress) | distilled as pattern 03 |
| `.listening__canvas` | 2d | 1440×900 | 100% | yes (5/5 distinct frames across a stepped sweep) | distilled as pattern 06 |
| `focus-boom` | third-party (Unicorn Studio) | — | full section | ambient | not distilled: a hosted scene, not the site's own code. Its CSS radial-gradient fallback is what pattern 02 recreates. |

What scrolls: `window`, smoothed by Lenis. Scroll drives geometry directly — the fold's per-row
transforms, the warp's integrated curvature, and the node graph's phase table — rather than
triggering play-once animations.

## Best patterns

| # | Pattern | Category | Distill score | Difficulty |
|---|---------|----------|---------------|------------|
| 01 | Cylindrical page fold | scroll | 4.8 | Medium |
| 02 | Focus burst | background | 4.5 | Easy |
| 03 | Warped display type | typography | 4.5 | Hard |
| 04 | GPU tier probe | loading | 4.1 | Medium |
| 05 | Elastic pulse | buttons | 3.9 | Easy |

## Patterns

### 01 — Cylindrical page fold
Rows approaching the bottom of the viewport wrap onto a cylinder of radius `--fold-round`, curving through the arc and then continuing along the tangent, with opacity driven by depth and the container's vanishing point tracking the scroll.

### 02 — Focus burst
A full-screen light burst made only of gradients — conic rays under a radial mask, blurred and saturated glow discs, all `mix-blend-mode: screen`, sized in `vmax` and centred on the optical middle.

### 03 — Warped display type
Canvas-rendered text as an alpha texture on a 6×320 mesh, bent by a vertex shader that integrates a curvature profile over 24 steps, with the bend angle varying across the width.

### 04 — GPU tier probe
A worker-side WebGL context that refuses to exist under a performance caveat, an unmasked renderer string matched against the software rasterisers, and a quality tier chosen before any heavy effect loads.

### 05 — Elastic pulse
A hover squash of `0.75em` wide and a third of that in height, so every control deforms by the same typographic amount regardless of size, springing back over a second.

## What makes this site special

- The fold is a genuine cylindrical wrap with two regimes — arc, then tangent — where almost every site in this position would have used a single `rotateX`.
- `perspective-origin` is recomputed every frame from the scroll position, so the 3D is always addressed to the reader rather than to the page.
- Effects are parameterised in CSS and read by JS, which is how one fold implementation serves a 64° version and a 36° version without a second code path.
- Reduced motion is handled by setting the angle to zero rather than by branching around the feature — the same code runs, it just does nothing.
- The display warp integrates a curve instead of rotating a plane, and varies the bend across the width so it never reads as a cylinder.
- The expensive work is gated by an actual capability probe, run in a worker, with a timeout and a fallback — not by a user-agent sniff or a core count.
- The button squash is expressed in ems, which is the difference between an effect you can apply site-wide and one you have to tune per component.
- The whole burst behind the Approach section is gradients: no image, no sprite, no particle library for the part that carries the look.
- Module names describe behaviour (`page-bend`, `title-warp`), which is a small thing that says a lot about how the site was built.

## Verification

Every demo was exercised in a browser over a local server:

- 01 — stepping the fold across scroll positions gives bend 1.8° → 13.1° with Z receding to −8 and `perspective-origin` tracking to `50% 1397.5px`; rows outside the zone are left untouched and the write cache suppresses unchanged frames.
- 02 — computed styles confirm the conic gradient, the radial `mask-image`, `mix-blend-mode: screen`, `blur(6px)`, a 140s spin and 26 motes; the screenshot matches the original's character.
- 03 — WebGL2 context acquired, `glError 0`, ink metrics measured (height 407px, half-width 878px), type visibly bent; the fallback stays hidden.
- 04 — the worker path succeeded on this machine: renderer `ANGLE (Apple, ANGLE Metal Renderer: Apple M2 Pro)`, not software, 12 cores → heavy tier, all five probe steps pass.
- 05 — squash factors computed per control from its own font size; the percentage-mode toggle shows the difference the em-based approach makes.

### Comparison against the reference (Stage 8b)

Pattern 02 was shot against a reference frame of the original section at 1440×900 and scored `meanAbs 7.1` in edge mode. A sweep over the optical centre, ray period, glow size and intensity moved the number by less than ±0.1 in either direction, which places the residual outside the layer geometry: it is the third-party particle field the demo deliberately omits, plus the site's headline and chrome. The measured CSS values were therefore kept rather than tuned toward a score the demo cannot honestly reach.

## Notes and limits

- `inspect.mjs` reported one route and flagged it; `/sitemap.xml` resolved it to six case studies. The Stage 2 rule did its job here.
- `/admin` is disallowed in `robots.txt` and marked noindex — not visited.
- The Approach particle field renders into a third-party canvas. Pattern 02 distils the CSS burst that surrounds it; the field itself is someone else's runtime and is out of scope.
- Two candidates were rejected: the copy-to-clipboard confetti burst (3.5 — 26 rects, gravity 900, alpha `1 − (t/T)²`; well made, but confetti is common) and the infinite hero grid, which was left unmeasured this run.
- Lenis is bundled rather than exposed, so scroll had to be driven natively when measuring.

### 06 — Scroll-phased node graph

Added on a second pass, after a re-audit found the site's own full-screen 2D canvas had been
mis-attributed to a third-party runtime and left undistilled. Its whole life is nine named windows
on one scroll progress (`riseStart .011 → riseEnd .216`, `connectStart .228 → connectEnd .569`,
`exitStart .58`, `detach .86`), with every node staggered inside its phase by its own hashed delay,
frame-rate-independent smoothing scaled by node size, links as Béziers whose control points migrate
on the detach progress, and a canvas that fades, clears and stops drawing at either extreme.
