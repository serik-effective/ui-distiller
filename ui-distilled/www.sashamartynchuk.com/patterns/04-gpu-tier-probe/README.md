# GPU tier probe

Source:
https://www.sashamartynchuk.com/

## What is interesting

Most quality-tiering asks `navigator.hardwareConcurrency` and stops. That number cannot tell you the one thing that matters: whether WebGL is being rasterised in software, where an eight-core machine will still crawl. This probe asks the browser for a context that *refuses to exist* under a major performance caveat, reads the unmasked renderer string, and matches it against the known software rasterisers — and it does all of that inside a worker with an `OffscreenCanvas`, with a five-second timeout and a main-thread fallback, so the decision never blocks first paint. Then it releases the context it just made. It is a small piece of engineering that decides whether the site's most expensive effects are allowed to exist at all.

## Behavior

On load the page picks a tier and renders accordingly. Nothing is visible about the probe itself except that heavy effects either appear or do not.

## Trigger

page load, once

## Implementation

`fold-mode.js` posts a worker whose body creates `new OffscreenCanvas(1,1)`, requests `webgl2` then `webgl` with `{ failIfMajorPerformanceCaveat: true }`, reads `WEBGL_debug_renderer_info`'s `UNMASKED_RENDERER_WEBGL`, calls `WEBGL_lose_context.loseContext()` and posts the string back. `'NO-GL'` and `'CAVEAT'` fall through to an identical synchronous probe on the main thread, as does a worker error or the 5s timeout. The renderer is matched against `/swiftshader|llvmpipe|softpipe|software|basic render/i`.

The tier decision then combines: the software verdict; a known-fast pattern (Apple silicon, NVIDIA, Radeon RX/Pro, Intel Arc); a known-slow pattern (Intel HD/UHD/Iris, Radeon Vega integrated, Microsoft Basic, GDI Generic); `deviceMemory ≤ 4` as a disqualifier; `hardwareConcurrency > 8` as the fallback test; and `(pointer: coarse)` or a viewport under 64rem to rule out the heavy path entirely. Query-string overrides — `?nogl`, `?lightgrid`, `?heavygrid` — make the decision debuggable in the field.

## Distilled implementation

The same worker source, the same regexes, the same thresholds and the same fallback chain, with the decision surfaced instead of hidden: each probe step reports pass, fail or skipped, the renderer string and every input to the decision are printed, and the reason for the verdict is stated in words. Buttons replace the query-string overrides, and a small particle canvas renders at whatever tier was chosen — 220 particles or 26 — so the consequence is visible on the same page as the cause.

## Key techniques

- `{ failIfMajorPerformanceCaveat: true }` — let the browser refuse rather than guess
- `WEBGL_debug_renderer_info` for the unmasked renderer string
- the probe inside a worker with `OffscreenCanvas`, so first paint is never blocked
- a timeout and a synchronous fallback for every failure path
- `WEBGL_lose_context` immediately after, so the probe leaves nothing behind
- renderer allow/deny patterns *before* falling back to core counts
- overrides that make the decision reproducible on someone else's machine

## Parameters worth tuning

- the software pattern — `swiftshader|llvmpipe|softpipe|software|basic render`
- the fast and slow renderer patterns
- the core threshold — 8
- the memory floor — `deviceMemory ≤ 4`
- the worker timeout — 5s

## Fidelity

high

## Difficulty

Medium

## Tags

loading, responsive, canvas, microinteraction
