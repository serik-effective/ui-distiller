# Candidates — mecha-xyz.webflow.io

Scores: visual / originality / reusability / interest / difficulty → distill score

## C01 — overscroll footer reveal → DISTILLED 01
Trigger: wheel at scroll limit. Accumulator clamp 600, gain 0.0012, lerp 0.12, close 450ms on cubic-bezier(0.86,0,0.27,0.98).
5 / 5 / 4 / 5 / 3 → 4.8

## C02 — push-and-cover page transition → DISTILLED 02
Push wrapper -200px 1.2s, overlay y100%→0 0.9s delay 0.15s, colour per destination route, navigate at +0.3s, pageshow/persisted reset.
5 / 4 / 4 / 5 / 3 → 4.5

## C03 — section progress navigation → DISTILLED 03
Nav cloned from [section-navi] markup, scrubbed width 0→100% per section, ranges offset by innerHeight/2, click → lenis.scrollTo 1.8s.
4 / 4 / 5 / 5 / 3 → 4.4

## C04 — reversible line mask reveal → DISTILLED 04
SplitText lines, clip-path inset(0 0 -0.3em 0), yPercent 150→0 2.0s expo.out stagger 0.1; leaveBack 0.6x power2.inOut stagger from end.
4 / 4 / 5 / 4 / 2 → 4.2

## C05 — drag-spring 3D hero → DISTILLED 05
Ortho camera frustum 3 rebuilt on aspect, scroll scrub 2 → rotation.y π, drag → clamped ±25° tilt via spring (stiffness 80, dt-stepped), YXZ order.
5 / 4 / 3 / 5 / 5 → 4.2

## C06 — three-state spring cursor → DISTILLED 06
Dot / hand / arrow, one lerp 0.14 position, transform from viewport centre, delegated mouseover with closest() and [hover-arrow].
4 / 4 / 4 / 4 / 2 → 4.0

## C07 — gated preloader → DISTILLED 07
Bar 3.8s power2.inOut + lottie forward/reverse loop until load + finish-current-cycle rule; sessionStorage lastPage decides full vs short.
4 / 3 / 4 / 4 / 3 → 3.7

## C08 — duplicate-text roll hover → REJECTED (3.5, below cut)
[reveal-hover-text] cloned into its parent, yPercent -100 0.45s power2.inOut stagger 0.1, reversed (from:'end') on leave. Well executed, very common.
3 / 3 / 5 / 3 / 1 → 3.5

## C09 — custom video poster→play swap → REJECTED (3.2)
data-poster-src loops muted in viewport; play button swaps to data-play-src unmuted with controls, reverts on ended or leaving viewport. Useful, not distinctive; also unverifiable here since media was blocked.
3 / 3 / 4 / 3 / 2 → 3.2

## Environment notes
- Site CDN images/video blocked in this environment: 78 of 93 images failed to load, and the preloader consequently never completed on screen.
- Analysis based on the site's ~73KB unminified inline custom JS, live DOM/computed styles, and ScrollTrigger introspection (102 instances).
