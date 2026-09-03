# Recreate — mechanism cookbook

Clean-room rules: read the original to understand the mechanism, then close it and write the demo yourself. No minified code, no framework runtime, no analytics, no API clients, no unrelated app logic in a demo.

Start from `assets/demo-template.html`. It supplies the neutral shell, theme, parameter panel, replay button, and reduced-motion handling — replace the stage and the pattern script.

## Demo contract

- One file when possible; inline `<style>` and `<script>`.
- Opens from `file://`, no build, no server, no backend.
- One main pattern per demo.
- The interesting numbers live at the top, either as CSS custom properties on `:root` or a `CONFIG` object.
- Placeholder content only — generic words, CSS-drawn or gradient/SVG imagery, no logos or site copy.
- `prefers-reduced-motion: reduce` collapses motion to instant state changes rather than breaking the demo.
- No console errors. No network requests except a pinned CDN library when one is essential.

## Placeholder assets without network

```css
/* gradient "photo" */
.ph { background: linear-gradient(135deg,#c8b6ff,#7a5cff 45%,#141420); }
/* inline SVG noise */
.grain::after { content:""; position:absolute; inset:0; opacity:.16; pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
```

Or `picsum.photos` / `placehold.co` when a real raster is needed — and note in the README that the demo then needs network.

## Easing vocabulary

```css
--e-out:      cubic-bezier(.16, 1, .3, 1);      /* expo-out, the "premium" default */
--e-in-out:   cubic-bezier(.76, 0, .24, 1);     /* symmetric, for curtains */
--e-back:     cubic-bezier(.34, 1.56, .64, 1);  /* overshoot */
--e-swift:    cubic-bezier(.22, 1, .36, 1);     /* quick settle */
```

Rules of thumb from measured sites: entrance 600–900ms expo-out; exit 300–450ms; hover response 150–300ms; page transitions 700–1200ms total with in/out split; stagger 40–90ms per item.

## Core mechanisms

### Lerp (the basis of most "expensive-feeling" motion)

```js
const lerp = (a, b, t) => a + (b - a) * t;
let cur = 0, target = 0;
(function raf() { cur = lerp(cur, target, 0.12); el.style.transform = `translate3d(${cur}px,0,0)`; requestAnimationFrame(raf); })();
```

Factor 0.06 = heavy glide, 0.12 = default, 0.25 = snappy. Make it frame-rate aware when precision matters: `1 - Math.pow(1 - k, dt * 60)`.

### Spring

```js
let v = 0;
function step(cur, target, stiff = 0.12, damp = 0.75) { v = (v + (target - cur) * stiff) * damp; return cur + v; }
```

### Masked reveal (line, image, block)

```html
<span class="mask"><span class="inner">Line of text</span></span>
```
```css
.mask { display:block; overflow:hidden; }
.inner { display:block; transform:translateY(110%); transition:transform .9s var(--e-out); }
.is-in .inner { transform:none; }
```

Stagger by index: `.inner { transition-delay: calc(var(--i) * 70ms); }`.

### Split text without a library

```js
el.innerHTML = el.textContent.split(/(\s+)/).map(w =>
  /^\s+$/.test(w) ? w : `<span class="w"><span class="wi">${w}</span></span>`).join('');
[...el.querySelectorAll('.w')].forEach((w, i) => w.style.setProperty('--i', i));
```

For per-line splitting, measure `getBoundingClientRect().top` of word spans and group by row — re-run on resize.

### IntersectionObserver reveal

```js
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))),
  { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
```

### Scroll-linked progress (scrub)

```js
const track = document.querySelector('.track');
addEventListener('scroll', () => {
  const r = track.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  document.documentElement.style.setProperty('--p', p.toFixed(4));
}, { passive: true });
```

Native alternative where support allows:

```css
@supports (animation-timeline: view()) {
  .item { animation: rise linear both; animation-timeline: view(); animation-range: entry 10% cover 40%; }
}
```

### Smooth scroll (lerped wrapper)

```js
const wrap = document.querySelector('.smooth');
document.body.style.height = wrap.scrollHeight + 'px';
let cur = 0;
(function raf() {
  cur = lerp(cur, scrollY, 0.1);
  wrap.style.transform = `translate3d(0,${-cur}px,0)`;
  requestAnimationFrame(raf);
})();
```
```css
.smooth { position:fixed; inset:0 0 auto 0; will-change:transform; }
```

Velocity for skew/blur: `const vel = scrollY - cur;` then `skewY(${clamp(vel*0.02,-6,6)}deg)`.

### Magnetic element

```js
btn.addEventListener('pointermove', e => {
  const r = btn.getBoundingClientRect();
  const x = (e.clientX - r.left - r.width / 2) * 0.35;
  const y = (e.clientY - r.top - r.height / 2) * 0.35;
  btn.style.transform = `translate(${x}px,${y}px)`;
});
btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
```
Return transition: `transition: transform .6s var(--e-back)` applied only on leave (toggle a class) so the follow stays instant.

### Custom cursor with follower

```js
let mx = 0, my = 0, fx = 0, fy = 0;
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
(function raf() {
  fx = lerp(fx, mx, 0.15); fy = lerp(fy, my, 0.15);
  dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
  ring.style.transform = `translate3d(${fx}px,${fy}px,0) translate(-50%,-50%) scale(${scale})`;
  requestAnimationFrame(raf);
})();
```
```css
.cursor { position:fixed; top:0; left:0; pointer-events:none; z-index:99; mix-blend-mode:difference; }
```
Hide the native cursor only inside the stage, never document-wide in a demo with controls.

### Directional hover fill

```js
function edge(e, el) {
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'bottom' : 'top');
}
el.addEventListener('pointerenter', e => el.dataset.from = edge(e, el));
el.addEventListener('pointerleave', e => el.dataset.to = edge(e, el));
```
Then translate the fill layer from `data-from` and out toward `data-to`.

### Clip-path curtain transition

```css
.curtain { position:fixed; inset:0; background:var(--fg); clip-path: inset(100% 0 0 0); }
.curtain.in  { transition: clip-path .6s var(--e-in-out); clip-path: inset(0 0 0 0); }
.curtain.out { transition: clip-path .6s var(--e-in-out) .1s; clip-path: inset(0 0 100% 0); }
```
Cover → swap content → uncover. In a demo, fake the "page" swap by replacing a content node.

### View Transitions API (with fallback)

```js
function go(render) {
  if (!document.startViewTransition) return render();
  document.startViewTransition(render);
}
```
```css
::view-transition-old(root) { animation: fade .35s both; }
::view-transition-new(root) { animation: rise .5s var(--e-out) both; }
.hero { view-transition-name: hero; }   /* shared element */
```

### FLIP (shared element / grid→detail)

```js
const first = el.getBoundingClientRect();
mutateDom();
const last = el.getBoundingClientRect();
const dx = first.left - last.left, dy = first.top - last.top, sx = first.width / last.width;
el.animate([{ transform: `translate(${dx}px,${dy}px) scale(${sx})` }, { transform: 'none' }],
  { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' });
```

### Slide-out menu done well

Panel translate + backdrop fade + link stagger + focus trap + `inert` on the background + Escape to close. The craft is in the staggered links and the asymmetric in/out timing (in 600ms expo-out, out 380ms), not in the panel slide.

### Image trail

Pool N nodes, spawn on pointer move only after the pointer has travelled a distance threshold (~60px), animate each with WAAPI (`scale(.85) → 1 → .95`, opacity `1 → 0`, ~700ms), recycle round-robin, z-index by spawn order.

### Card tilt

```js
const r = card.getBoundingClientRect();
const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 14}deg)`;
card.style.setProperty('--gx', px * 100 + '%');   // drives a glare gradient
```

### Canvas particles / grain

Size the canvas to `devicePixelRatio`, keep the loop out of layout, clear with `ctx.clearRect`, and stop the loop when the tab is hidden (`document.visibilityState`).

### WebGL displacement (only when it *is* the pattern)

Three.js from a pinned CDN, a plane with a fragment shader mixing two textures by a displacement map, `uProgress` eased toward the hover state. If a shader is out of proportion for the demo, approximate with an SVG `feDisplacementMap` or a CSS mask and mark `Fidelity: approximate`.

## Library policy

Vanilla by default. A CDN library is allowed only when it *is* the mechanism:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
```

Pin exact versions. Allowed hosts: `cdnjs.cloudflare.com`, `cdn.jsdelivr.net/npm/`. Justify the dependency in the README and state that the demo needs network.

Never port: React/Vue/Svelte runtimes, routers, state libraries, analytics, error trackers, cookie banners, i18n machinery.

## Traps that only bite in a browser

Node's syntax check cannot see either of these, and both fail silently.

**Global name collisions.** A top-level `const top`, `window`, `location` or `document` in a classic inline script throws a SyntaxError before a single line runs — no console error survives a page load, the script simply never executes. Name geometry helpers `topOf` / `bottomOf`. (`self`, `parent`, `name`, `status`, `history` are merely confusing, not fatal.)

**`:has()` out-specifies what it is meant to lose to.** A dimming rule like `ul:has(> li:hover) > li a { opacity: .54 }` takes the specificity of its `:has()` argument, so the obvious partner rule `ul > li:hover > a { opacity: 1 }` loses and the hovered item stays dimmed. Either add `!important` to the restore rule, or exclude the hovered item in the dimming selector itself (`ul:has(> li:hover) > li:not(:hover) > a`). Check computed opacity on the active element, not just on its siblings.

**rAF latch deadlock.** The common throttle

```js
let ticking = false;
const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
```

freezes permanently if the frame never arrives — a hidden or backgrounded tab suspends rAF, so `ticking` stays `true` and no later event can ever re-arm it. Use cancel-and-rerequest instead:

```js
let raf = 0;
const request = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
```

Same rule for any `if (!rafId)` guard around a loop that events restart.

## Performance hygiene

Animate `transform`, `opacity`, `filter`, `clip-path` only. Batch reads before writes. `will-change` sparingly and remove it after. `passive: true` on scroll listeners. Cancel rAF loops on cleanup. Debounce resize; recompute measured layout there.

## Accessibility floor

Reduced-motion path in every demo. Keyboard-operable triggers (buttons, not divs). Visible focus. Menus: Escape closes, focus returns to the toggle. Decorative layers `aria-hidden="true"` and `pointer-events: none`.

## Closing the gap against a reference

Building the mechanism gets you most of the way; the last stretch is measurement. The loop:

1. Shoot the original's state once, clipped to the component (`compare.mjs shoot … --clip`).
2. Shoot the demo in the same state, same viewport, same clip.
3. `compare.mjs diff … --mode edges` for a number and a map of where the difference sits.
4. Change **one** parameter, re-shoot, re-score. Keep what improves.
5. Stop when two rounds in a row fail to beat the best honest score.

Practical notes learned the hard way:

- **Freeze ambient motion first.** Anything that drifts, autoplays or springs must be pinned before shooting, or successive frames differ from each other more than the demo differs from the original.
- **Sweep through the demo's own seam.** Every demo here exposes its config on `window`; `--script` can set values and step the loop, so a sweep is a shell loop rather than a series of edits.
- **Guard the density.** A lower difference from a sparser screen is not a better recreation. If a variant reduces how much is visible, reject it however good the number looks.
- **Character before geometry.** In one run the metric barely moved for bend and depth, but adding an in-plane `rotateZ` and a small horizontal drift — which the original obviously had and the demo lacked — was what actually made it read correctly. The number is a check on your eye, not a replacement for it.
- **Record the residual.** Put the final score in the README next to the fidelity claim. "Fidelity: approximate, edges meanAbs 8.9 against the reference frame" is a far more useful statement than "close enough".

## Fidelity honesty

`Fidelity: high` — mechanism confidently identified and reproduced; timing measured, not guessed.
`Fidelity: approximate` — the idea and feel are reproduced by different means (shader replaced by CSS mask, physics approximated, timing estimated from screenshots).

Say which, and in the approximate case name the gap in one sentence.
