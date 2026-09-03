# Elastic pulse

Source:
https://www.sashamartynchuk.com/

## What is interesting

The squash is measured in the control's own type size, not in pixels and not as a percentage. On hover the button widens by `0.75em` and loses a third of that in height — so a 12px pill and a 34px one deform by the same *typographic* amount. A percentage scale would make the large control look rubbery and the small one look inert; this keeps every size reading alike, which is why the effect can be applied blanket-wide to every button and link on a site without tuning each one.

## Behavior

Hovering a control snaps it wide and slightly flat in 0.1s, then lets it spring back over a second on an elastic curve with a couple of diminishing overshoots. Hovering again immediately does nothing — a lock keeps a shaky pointer from re-triggering the spring.

## Trigger

`mouseenter`, with a 500ms re-trigger lock

## Implementation

`elastic-pulse.js` computes, per control: `c = 0.75 × fontSize`, `scaleX = (w + c)/w`, `scaleY = (h − c × 0.33)/h`, then runs a GSAP timeline of `to(0.1s, power1.out)` into that scale and `to(1s, elastic.out(1, 0.3))` back to `1,1`, killing any timeline already on the element. A `data-elastic-pulse-target` attribute lets a wrapper delegate the deformation to an inner element. Attachment is by selector (`.btn, .work__link`) plus a `MutationObserver` that re-scans when nodes are added, so controls rendered later are covered. The whole thing is skipped when `(hover: none) and (pointer: coarse)` or `prefers-reduced-motion: reduce` match.

## Distilled implementation

Same numbers, no GSAP: `elastic.out(1, p)` is reimplemented as `amplitude · 2^(−10t) · sin((t − s)·2π/p) + 1` and driven by rAF, with the same 0.1s `power1.out` entry. The `MutationObserver` and the pointer/motion opt-outs are kept because they are part of what makes the pattern deployable. A live readout prints the control's font size, box, the resulting absolute squash in pixels and the two scale factors — and a toggle switches to a plain percentage scale so the difference between the two approaches can be compared directly at 12px and 34px, which is the whole argument for the em-based version.

## Key techniques

- deformation expressed in ems of the control's own type size
- anisotropic squash: widen by `c`, shorten by `c × 0.33`
- a fast ease-out into the squash, a long elastic return out of it
- a re-trigger lock, so the spring is never restarted mid-flight
- `MutationObserver` attachment for controls added after load
- explicit opt-outs for coarse pointers and reduced motion

## Parameters worth tuning

- `squash` — 0.75em
- `ratio` — 0.33 of the horizontal stretch, applied vertically
- `out` / `back` — 100ms in, 1000ms elastic return
- elasticity — period 0.3 in `elastic.out(1, 0.3)`
- `lock` — 500ms

## Fidelity

high

## Difficulty

Easy

## Tags

buttons, microinteraction, motion, hover
