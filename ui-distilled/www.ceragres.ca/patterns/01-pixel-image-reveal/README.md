# Pixel image reveal

Source:
https://www.ceragres.ca/

## What is interesting

Instead of fading or wiping an image in, the site resolves it: every photograph enters as 80px blocks and de-pixelates over two seconds. The mechanism is a canvas round trip — draw the image into a tiny buffer with smoothing on, then blow that buffer back up with smoothing off — so the block size is the only animated number and the "resolution increasing" reading is exact rather than a filter approximation. A blur that fades out alongside the blocks softens the edges early and disappears as the picture sharpens, which is what keeps it from looking like a retro effect.

## Behavior

An image crosses 10% into the viewport and starts as coarse coloured blocks with a soft blur. Over 2.2s on a symmetric curve the blocks shrink to one pixel and the blur reaches zero, at which point the canvas switches to drawing the source directly. It plays once. On the parallax variant, the canvas is 20% taller than its frame and drifts through it as the page scrolls.

## Trigger

intersection (one shot, at 10% visibility); scroll for the optional parallax

## Implementation

A Vue component (`pixel-image`) holds a reactive `{ pixelSize: 80, blur: 6 }`. Its redraw does: if `pixelSize <= 1.05`, clear the filter, enable smoothing and cover-draw the source; otherwise compute `f = pixelSize × devicePixelRatio`, size an offscreen canvas to `width/f × height/f`, cover-draw into it with smoothing enabled, then on the visible canvas set `filter: blur(blur × dpr)`, disable `imageSmoothingEnabled`, `translate(w/2, h/2)`, `scale(f, f)` and draw the small canvas centred. An `IntersectionObserver` at `threshold: 0.1` fires `gsap.to(state, { pixelSize: 1, blur: 0, duration: 2.2, ease: 'power3.inOut', onUpdate: redraw })` and disconnects itself. A `ResizeObserver` re-sizes the canvas by DPR and redraws. Under `prefers-reduced-motion` the state starts resolved and no observer is created. The parallax variant renders the canvas at `h-[120%] -top-[10%]` and scrubs `yPercent: 0 → intensity` (clamped 0–40, default 20) with ScrollTrigger between `top center` and `bottom top`.

## Distilled implementation

The same two-canvas round trip, the same DPR handling, the same one-shot observer, with `gsap.to` replaced by a rAF tween on a cubic in-out curve. The source image is generated in a canvas at load time — gradients, slabs and a few discs — so the demo needs no network and no site photography. Parallax is computed from the wrapper's position in the viewport rather than a ScrollTrigger scrub. The panel exposes start block size, start blur, duration and parallax distance, and the first and last figures report their live values while animating.

## Key techniques

- downscale with `imageSmoothingEnabled = true`, upscale with it `false` — average on the way down, hard blocks on the way up
- `ctx.filter = blur(...)` applied only to the upscale pass
- `translate` + `scale(f, f)` so one `drawImage` covers the whole canvas
- device-pixel-ratio applied to both the buffer size and the blur radius
- cover-fit maths so the source keeps its aspect ratio at any frame size
- one-shot `IntersectionObserver` that disconnects itself; `ResizeObserver` for redraws
- canvas taller than its clipping frame, so the parallax drift never exposes an edge
- reduced-motion path starts fully resolved

## Parameters worth tuning

- `startPixelSize` — 80
- `startBlur` — 6px
- `duration` — 2200ms
- easing — power3.inOut (symmetric; an ease-out reads as "snapping" into focus)
- `threshold` — 0.1
- parallax — 20% of canvas height (site clamps 0–40)

## Fidelity

high

## Difficulty

Medium

## Tags

image-effect, canvas, scroll, motion
