# Three-state spring cursor

Source:
https://mecha-xyz.webflow.io/

## What is interesting

Three cursor heads — a dot, a hand, an arrow — share exactly one lerped position, written once per frame to a single wrapper. Because the wrapper is a full-viewport flex box, each head only has to be centred inside it and the transform is expressed as an offset from the viewport centre, so no head needs its own size-dependent offset maths. State is decided by event delegation asking `closest()` what the pointer is over, and the heads crossfade in place. Adding a fourth state costs one element and one selector, and the heads can never desynchronise because none of them owns a follow loop.

## Behavior

A small dot tracks the pointer with a soft lag. Over links, buttons and `.hoverable` elements it crossfades to an outlined hand marker; over anything carrying `[hover-arrow]` it becomes a filled arrow disc. The position never jumps between states, and the first pointer sighting snaps rather than gliding in from off-screen.

## Trigger

pointer move, plus mouseover/mouseout delegation

## Implementation

One `mousemove` listener stores raw coordinates; a rAF loop advances a spring point by `0.14` of the remaining distance and writes `translate3d(x - innerWidth/2, y - innerHeight/2, 0)` to every cursor element. A first-move guard sets both mouse and spring to the same point so the cursor does not fly in from `-200,-200`; `mouseleave`/`mouseenter` on the document reset that guard. State is handled by two delegated listeners that test `closest('[hover-arrow]')` and then `closest('a, button, [href], .hoverable')`, tweening opacity between the three heads over 0.2s.

## Distilled implementation

Same loop, same lerp factor, same centre-relative transform. GSAP opacity tweens become a CSS transition driven by a `data-state` attribute on the wrapper, which collapses the three tween pairs into one declarative rule and makes the state machine legible. The heads are stacked with `grid-area: 1 / 1` so they occupy the same cell regardless of size. The native cursor is hidden only over the demo surface, and the whole layer is disabled under `pointer: coarse`.

## Key techniques

- one shared spring position for every cursor head
- transform expressed from the viewport centre, so heads need no offset maths
- `data-state` on the wrapper plus stacked grid cells for a declarative crossfade
- event delegation with `closest()` and an attribute contract (`[hover-arrow]`)
- first-move snap to avoid the fly-in from nowhere
- `pointer-events: none`, maximum z-index, `aria-hidden`, disabled on touch

## Parameters worth tuning

- `follow` — 0.14 lerp factor
- `--fade` — 200ms crossfade
- head sizes — `--dot` 10px, `--hand` 34px, `--arrow` 40px
- the hoverable selector list, and the attribute name for the arrow state

## Fidelity

high

## Difficulty

Easy

## Tags

cursor, microinteraction, motion
