# Candidates — www.ceragres.ca

Scores: visual / originality / reusability / interest / difficulty → distill score

## C01 — pixel image reveal → DISTILLED 01
Canvas downscale (smoothing on) → upscale (smoothing off) + blur; pixelSize 80→1, blur 6→0, 2.2s power3.inOut, IntersectionObserver 0.1 one-shot, DPR-aware, ResizeObserver, reduce-motion path, optional ScrollTrigger parallax yPercent 0→20 on a 120%-tall canvas.
5 / 5 / 4 / 5 / 3 → 4.8

## C02 — native dialog slide-over → DISTILLED 02
transition-behavior: allow-discrete on display+overlay, @starting-style for entry, [data-direction] chooses edge + closed transform, --duration-modal .6s / --duration-backdrop .4s / --backdrop-blur, overscroll-behavior: contain.
4 / 5 / 5 / 5 / 2 → 4.7

## C03 — reciprocal-scale card hover → DISTILLED 03
frame scale(.913,.861) × img scale(1.0952902519,1.1614401858) = 1.0000 exactly; info translateY(-4.624cqw) + padding-inline 3rem; .4s cubic-bezier(.54,0,.06,.87); container-type: inline-size.
4 / 5 / 4 / 4 / 2 → 4.3

## C04 — :has() dimming mega menu → DISTILLED 04
ul:has(li:hover) > li a { opacity: 54% } + hovered row !important back to 1; ::before hairline scaleX from top left .4s; lvl2 items opacity 0 / translate(-10%) with transition delays from --delay; all states mirrored on [aria-expanded=true].
4 / 4 / 5 / 4 / 2 → 4.1

## C05 — bracket hover marks → DISTILLED 05
::before / ::after 4×14px, border-width 1px 0 1px 1px, translate(20px) → 0 with opacity, ::after rotated 180deg to mirror; persists on [aria-current].
3 / 4 / 5 / 3 / 1 → 3.8

## C06 — primary button icon pass-through → REJECTED (3.46, below cut)
:hover slides label translate(4rem), resting icon translate(100%) out, duplicate --hover icon translate(0) in. Well made, very common.
3 / 3 / 5 / 3 / 1 → 3.46

## C07 — link-list row rule + icon inversion → REJECTED (3.0)
::after 2px bar scaleX(0→1) from left over .4s cubic-bezier(.54,0,.06,.87), icon inverts to black-on-white on hover.
3 / 2 / 5 / 2 / 1 → 3.0

## Also noted, not patterns
- x-image-contrast: full-bleed 4% black mix-blend-mode: multiply overlay on every image — a global contrast unifier. Real craft, but one declaration.
- Route transition: GSAP white overlay, 0.45s power3.out in / 0.35s out. Deliberately plain.
- Project card entrance: ScrollTrigger once:true → scale .8→1 + autoAlpha, 1.2s power4.out. Ordinary.
- Hero type: clamp(4.6rem, -1.39rem + 14.27vw, 26rem), max-width 14ch.

## Environment notes
- node fetch times out against this host; curl succeeds. probe.mjs now falls back to curl.
- Consent overlay was hidden locally for analysis; not accepted, no preference saved.
- Nuxt lazy-loads its chunks, so the initial probe saw only the entry bundle; the rest were collected from the browser's network log and fetched separately.
