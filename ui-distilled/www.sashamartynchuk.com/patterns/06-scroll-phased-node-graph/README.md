# Scroll-phased node graph

Source:
https://www.sashamartynchuk.com/

## What is interesting

A full-screen 2D canvas whose entire life — nodes arriving, linking to a hub, detaching, leaving — is expressed as **named windows on one scroll progress**. There is no timeline and nothing is played. Every frame samples a single number.

Two details make it more than a particle field. First, the stagger: inside each phase, every node gets its own sub-window derived from its own deterministic delay, so a scrubbed animation gets the staggered entrance that a timeline would normally provide — and it stays exact when you scroll backwards. Second, the links are not lines to a point; they are cubic Béziers whose control points migrate as a separate `detach` progress advances, so the graph visibly lets go of its hub rather than fading out.

## Behavior

Scrolling the pinned stage: a hub appears, nodes rise from below with overshoot, curved links grow from each node to the hub with pulses travelling along them, then the far ends detach and drift while the nodes exit upward. Hovering a node swells it; dragging one moves it on a leash whose length is its own distance from the hub. At either end of the progress the canvas fades over ~180ms, clears itself and releases the cursor.

## Trigger

scroll (a pinned section's own progress), plus pointer for parallax, hover and drag

## Implementation in the original

`main-DvstoWIA.js` builds `.listening__canvas` itself — this is the site's own code, not a third-party runtime. The phase table is shipped verbatim:

```js
const j = { titleIn:.056, hubStart:.005, hubEnd:.063, riseStart:.011, riseEnd:.216,
            connectStart:.228, connectEnd:.569, exitStart:.58, detach:.86 };
```

Nodes are generated from a hash, not authored: `Y(i, k) = fract(sin(i*127.1 + k*311.7) * 43758.5453)` supplies position, radius, every delay, drift, wobble frequency and phase, breathing rate and follow speed — 21 draws per node. Node count scales with area (`24…74` by `sqrt(w*h / (2084*1233))`), and radii by `pow(min(w,h)/1233, .6)` clamped to `0.5…1.1`.

The staggered window is one helper:

```js
const Ie = (p, start, end, delay, overlap) => {
  const a = start + (end - start) * delay * (1 - overlap);
  const b = a + (end - start) * overlap;
  return clamp01((p - a) / Math.max(1e-4, b - a));
};
```

The rise uses a custom overshoot ease `1 + 1.9(t-1)³ + 0.9(t-1)²`; the exit is a smootherstep on a second window. Smoothing is frame-rate independent — `s = 1 - Math.pow(1 - k, dt/16.667)` — and the follow constant is divided by node size, so heavy nodes lag. The pointer offset is multiplied by `(0.25 + min(r,50)/50)`, giving parallax by radius. Links are `bezierCurveTo` with a sag term from how close the node still is to the hub, and the pulse is the same Bézier evaluated directly at `u` rather than an object animated along a path. When progress hits either extreme the canvas fades its own `style.opacity` to 0 over 180ms, clears, and stops drawing.

The `FOCUS` field elsewhere in the same section *is* third-party (a Unicorn Studio scene, with a CSS radial-gradient fallback if it fails to load). An earlier version of this report attributed this canvas to that runtime; it does not belong to it.

## Distilled implementation

The same phase table, the same hash generator, the same window helper, the same overshoot and smootherstep eases, the same dt-corrected smoothing, the same Bézier links with sag and a directly-evaluated pulse, and the same fade-and-stop at the extremes. The controls expose what the mechanism is actually made of: node count, the stagger overlap (at 1 every node moves together, at 0 they queue), the follow constant, the parallax amount, and a phase-marker view that draws the nine phase boundaries onto the transport bar so the table is visible rather than described.

## Key techniques

- one scroll progress, nine named phases; nothing plays, everything samples
- a per-node stagger window inside a phase — the scrub equivalent of a timeline's stagger, and exact in reverse
- deterministic hash generation: the layout is regenerated identically every load and never stored
- frame-rate independent smoothing (`1 - (1-k)^(dt/16.667)`), with the constant scaled by node size
- pointer parallax weighted by radius, so depth comes from the same value that draws the node
- links as Béziers whose control points migrate on a second progress, so detaching is a shape change rather than a fade
- a pulse evaluated on the curve directly (de Casteljau), not an element tweened along a path
- self-suspending: at either extreme it fades, clears and stops drawing entirely

## Parameters worth tuning

- the phase table itself — the shipped values are above
- stagger overlap — 0.55 for the rise, 0.45 for the links
- follow — 0.045…0.1 per node, divided by size
- parallax — 26px at the pointer extremes, 0.62 of that vertically
- node count — 24…74, scaled by viewport area

## Verification

Measured live at 1440×900: the readout walks `progress` 0 → 1 across the pinned stage with the phase name changing `hub → rise → hold → connect → detach → exit`; 58 nodes all reach linked state during `connect`; dragging a node clamps at its own `_len`; past the stage the canvas clears and `canvas.style.opacity` returns to empty.

Screenshot comparison against `.work/refs/06-original-N0.16.png` (edges, 1440×900): **mean |Δ| 8.56**. An earlier variant with dimmer nodes scored 8.15, but the reference plainly shows near-white discs — the brighter version is the better recreation and the worse number, because sharper edges in slightly different places cost more than soft ones. The score is recorded as it stands rather than tuned toward.

## Fidelity

high — the phase table, the hash generator, the window helper and the smoothing are taken from the shipped source; the node artwork and the copy are the demo's own.

## Difficulty

Hard

## Tags

scroll, canvas, motion, background
