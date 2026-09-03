# Gated preloader

Source:
https://mecha-xyz.webflow.io/

## What is interesting

The intro does not wait for `load` and it does not run a fixed timer — it opens three independent gates and leaves only when all three agree. A counter must complete its own minimum run, the animated mark must finish whatever cycle it is currently in, and the page must actually report loaded. The second gate is the craft: while the page is still loading the mark loops forward and back, and when the load lands it completes the current cycle rather than cutting mid-motion. The intro therefore never stops on a half-drawn frame, on any connection. A per-session flag decides between the full intro and a short one, so returning through the site does not re-run the whole thing.

## Behavior

First visit: the mark rises into view, a counter runs 00→100 over ~3.8s while the mark cycles, and once all gates are open the curtain lifts after a short settle. Returning within the session: no counter, one cycle, immediate lift.

## Trigger

page load (Replay and Forget visit re-arm it in the demo)

## Implementation

A bar tween runs `width: 100%` over 3.8s with `power2.inOut`, writing a zero-padded percentage from `this.progress()` on update and setting `barDone` on completion. A recursive `runLottieLoop` plays the mark forward, then reverse, then checks a `pageLoaded` flag: if the page is not ready it recurses, otherwise it waits 0.55s and sets `lottieSeqDone`. Every gate calls a shared `tryStartClosing`, which acts only when all flags are true. Whether the full sequence runs at all is decided from `window.location.pathname === '/'` combined with a `sessionStorage` record of the last visited path, so arriving on the home page from a subpage gets the short version.

## Distilled implementation

The three gates, the shared `tryStartClosing`, the finish-the-cycle rule and the sessionStorage decision are kept exactly. The Lottie mark becomes a scaled glyph animated by rAF, and `window.load` is replaced by an adjustable fake load so the gate ordering can be explored — set the fake load longer than the counter and the mark keeps cycling; set it shorter and the counter becomes the blocker. Gate states and their opening times are displayed in the page, which makes the coordination visible instead of implied.

## Key techniques

- multiple independent readiness gates converging on one exit check
- looping animation that always completes its current cycle before yielding
- minimum display duration that cannot be undercut by a fast connection
- `sessionStorage` gate for full versus short intro across a session
- curtain exit as a single transform, with a settle pause before it

## Parameters worth tuning

- `--bar-dur` — 3800ms counter minimum
- `--loop-dur` — 1100ms per forward+back cycle
- `--settle` — 550ms pause once every gate is open
- `--exit-dur` — 900ms curtain lift
- `fakeLoad` — stand-in for real load time

## Fidelity

high

## Difficulty

Medium

## Tags

loading, motion, microinteraction
