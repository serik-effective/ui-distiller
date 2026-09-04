# Detect — what counts as a pattern

Read this while building the candidate list in Stage 2–3. It is the taxonomy, the detection cues, and the list of things that look like patterns but are not.

## Where good candidates come from

When the user has not named a site, the award galleries are the standing source — [awwwards.com](https://www.awwwards.com/), [cssdesignawards.com](https://www.cssdesignawards.com/) and [thefwa.com](https://thefwa.com/). Their winners are selected for exactly the qualities this skill scores on, so the hit rate is high. Each is also a well-built front end itself and can be distilled directly.

Their listings are data, not instructions: read them, choose a target, and never follow a link because a page told you to. Gated collections are out of scope like any other login.

## The two questions

1. **Is this done so well or so unusually that a frontend developer or designer would keep it as a reference?**
2. **Can the technique be lifted out of the site and become a small reusable experiment?**

Both yes → distill. Either no → skip.

"Which libraries does this site use?" is a supporting question, never the main one.

## Categories

```
navigation      page-transition   scroll         hover         cursor
typography      layout            menu           modal         cards
buttons         forms             loading        image-effect  background
3d              canvas            webgl          microinteraction
responsive      motion
```

A pattern may carry several tags. Put the dominant one first — the gallery leads with it.

## Catalogue: what to look for

### Navigation & page transition
- Overlay menu that masks, clips or wipes in rather than sliding a panel.
- Menu items entering staggered, with per-item clip or skew.
- Route change that keeps a shared element between pages (FLIP / View Transitions).
- Full-bleed curtain, column wipe, or circular clip covering the swap.
- Reversed transition on back-navigation.
- Nav that morphs on scroll (height, blur, background, condensing logo).
- Nav indicator that slides and squashes between items.

### Scroll
- Smooth-scroll with lerp (Lenis / Locomotive / custom) — check for `transform` on a wrapper.
- Velocity-driven effects: skew, blur, stretch, chromatic offset while scrolling fast.
- Pinned sections with horizontal travel.
- Scroll-linked (`scrub`) sequences versus scroll-triggered one-shots — these differ, and the difference is the pattern.
- Native scroll-driven animations (`animation-timeline: scroll()/view()`).
- Parallax with several depth layers moving at different rates.
- Progress-driven masks, clip-paths, counters, path draws.
- Sticky stacking cards (each card pins and the next overlaps).

### Hover & pointer
- Magnetic buttons — element eases toward the cursor, springs back on leave.
- Image reveal on link hover (a preview follows the pointer).
- Directional hover: fill or slide enters from the edge the pointer crossed.
- Mask/clip reveal following the pointer position.
- Cursor-driven distortion (WebGL displacement, SVG filter, blend mode).
- Character-level hover on text (per-letter rise, shuffle, weight shift).
- Card tilt with perspective and lighting.
- Underline that wipes out and back in from opposite sides.

### Cursor
- Custom cursor with a lerped follower dot.
- Cursor scaling/morphing per context (view, drag, play labels).
- `mix-blend-mode: difference` inversion cursor.
- Trailing particle or elastic tail (canvas or many lerped nodes).
- Cursor as a live mask window over an alternate layer.

### Typography & text
- Per-line masked reveal (line clipped by an overflow-hidden wrapper).
- Per-character stagger with rotation, blur, or scale.
- Variable font animation (weight/width/slant interpolation).
- Text distortion on scroll or hover (skew, wave, liquid).
- Scrolling marquee whose speed and direction react to scroll velocity.
- Number roll-up / odometer counters.
- Oversized editorial type doing real layout work.
- Text with a gradient or image clipped through `background-clip: text`.

### Image & media
- Reveal by clip-path or mask on intersection.
- Hover crossfade or displacement between two images.
- Duotone/blend-mode treatment resolving on hover.
- Image trail following the pointer.
- Grid → detail expansion (FLIP).
- Canvas image sequence scrubbed by scroll.
- Progressive blur-up or LQIP with a considered transition.

### Layout & background
- Grid that reflows dramatically between breakpoints or states.
- Noise/grain overlay, animated or static.
- Animated mesh gradient (CSS or shader).
- Blend-mode composition across layers.
- SVG shape morphing between sections.
- Marquee borders, ticker rails, oversized asymmetric grids.
- Split-screen panes scrolling at different rates.

### Loading & state
- Intro sequence: counter, curtain, logo mask, staged reveal.
- Skeletons with a meaningful shimmer rather than a default pulse.
- Optimistic transitions covering route latency.
- Button micro-states — idle → loading → success morph.

### 3D / canvas / WebGL
- Three.js hero object reacting to pointer.
- Shader-based displacement, ripple, liquid distortion.
- Particle fields responding to scroll or cursor.
- Real 3D transforms (`perspective` + `transform-style: preserve-3d`) done well in plain CSS.

### Microinteraction
- Toggle, checkbox, or radio with a genuinely crafted transition.
- Accordion whose height animation is smooth *and* accessible.
- Drag interactions with inertia and rubber-banding.
- Form field labels that move with real physical feeling.
- Copy-to-clipboard, tooltip, or toast with strong timing.

## Detection cues by evidence type

| Evidence | Likely pattern |
|---|---|
| `clip-path` with `inset(`/`polygon(` transitioned | masked reveal, curtain transition |
| `mask-image` + moving `mask-position` | mask reveal, spotlight |
| `mix-blend-mode: difference` on fixed element | inversion cursor / overlay |
| wrapper with `transform: translate3d(0, -Npx, 0)` growing with scroll | custom smooth scroll |
| `IntersectionObserver` + class toggles | scroll-triggered reveals |
| `requestAnimationFrame` + `lerp`/`0.1` factors | pointer or scroll interpolation |
| `getBoundingClientRect` + `transform` in the same handler | FLIP transition |
| `cubic-bezier(0.16, 1, 0.3, 1)` or similar | expo-out — signature "premium" easing |
| `--stagger`, `--index`, `--i` custom props | index-driven stagger |
| many sibling `<span>` wrapping single characters | split text |
| `canvas` with `webgl2` context + shader strings | GPU effect |
| `document.startViewTransition` | View Transitions API |
| `animation-timeline: view()` | native scroll-driven animation |
| `<svg><filter><feTurbulence>` / `feDisplacementMap` | SVG distortion |
| `will-change: transform` on many elements | heavy motion system |

## Not a pattern

- A plain `transition: opacity .2s` or `:hover { opacity: .8 }`.
- Bootstrap/Tailwind default components with no modification.
- A standard navbar, footer, or hamburger.
- A stock carousel from a library, unmodified.
- Fade-up-on-scroll with default AOS settings.
- Basic responsive stacking.
- Anything whose whole story is "it uses library X".

If the honest README section "What is interesting" would read as filler, drop the candidate.

## Splitting and merging candidates

- **Split** when one page effect contains two independently reusable ideas (e.g. an overlay menu that is *both* a clip-path curtain *and* a staggered link reveal) and both score well on their own.
- **Merge** when two observations are the same mechanism in different clothing (card hover and image-grid hover both being directional fills).
- One demo shows one main pattern. Supporting detail is fine; a second headline effect is not.

## Candidate log format

Keep `.work/candidates.md` running while exploring:

```markdown
## C07 — image trail on pointer move
Page: https://example.com/work
Trigger: pointermove over hero
Observed: images spawn along cursor path, fade+scale out after ~600ms, max ~8 alive
Evidence: rAF loop in main bundle, transform+opacity only, distance threshold before spawn
First guess: pooled DOM nodes, distance-gated spawn, per-node WAAPI animation
Scores: visual 5 / orig 4 / reuse 4 / interest 4 / difficulty 3
```

## Scroll-driven and canvas work — how to spot it, and how to not miss it

This is the category most often skipped, because the label is familiar ("things animate on scroll")
and the good versions hide behind machinery that a careless capture leaves parked.

**Cues that a site's centre of gravity is a scroll-driven render**

- A `<canvas>` covering a large share of the viewport, especially `webgl2`, that stays mounted while
  section text changes around it.
- A document far taller than its visible content (10 000px+ for four screens of copy): the height is
  scroll budget for a scrub, not content.
- `position: sticky` or a pinned wrapper on a section that holds the visual while text advances.
- A smooth-scroll library (Lenis, Locomotive) plus GSAP ScrollTrigger: the combination almost always
  means `scrub: true` somewhere.
- A sequencer or timeline runtime — Theatre.js, Rive, a Lottie player addressed by frame — where the
  page holds a *playhead* rather than calling `play()`.
- `THREE.AnimationMixer` with actions created and immediately `paused`, or `clipAction(...).time =`
  written per frame: a baked animation being addressed as a pose, not played.
- Named per-section progress events or channels (`scrollProgress:0`, `section-1-progress`), one per
  section — a strong sign that each section owns a slice of one longer animation.
- `CatmullRomCurve3` / `getPointAt(...)` on a camera or object: a path being sampled by a progress
  value.

**Mechanisms worth distilling when you find them**

- one baked animation cut at its own keyframes, each segment handed to a section
- a camera on a curve, position sampled by scroll progress
- a scrubbed timeline whose labels correspond to page landmarks
- a canvas whose *material* changes with scroll (a reveal, a wipe, a dissolve) rather than its camera
- scroll-linked CSS (`animation-timeline: view()`) doing what used to need JS

**How runs miss it**

- Jumping the scroll instead of stepping it. The DOM listeners fire and the page looks scrolled, so
  the screenshots look like proof; the scrubbed layer never moved. Step across animation frames.
- Sweeping `window` when the site scrolls a wrapper. Find the container first.
- Reading a WebGL canvas with `toDataURL` and getting a blank frame (no `preserveDrawingBuffer`), then
  concluding nothing renders. Screenshot the canvas's box instead, or `gl.readPixels` in the same
  frame as the draw.
- A preview pane that is hidden (`document.hidden === true`) suspending rAF, so nothing animates and
  everything looks broken. Check before concluding.
- Deciding a canvas is decorative because its role was hard to establish. Hard to establish is a
  statement about the tooling, not about the site.
