# Conditional difference header

Source:
https://brand.squarespace.com/

## What is interesting

The fixed header is a single layer of white text in `mix-blend-mode: difference`, so it inverts against whatever passes beneath it — white artwork, black panels, saturated photography — with no per-section colour classes and no observer flipping a light/dark modifier. The interesting part is not the blend; it is the discipline around it. The blend is gated behind a class on the body, and the site drops it to `normal !important` the moment the menu opens or a section opts out, because difference over a blurred translucent overlay turns muddy and unreadable. A one-line effect plus two deliberate exceptions.

## Behavior

Scroll and the header flips between black and white in step with the surface behind it, per pixel, including across a gradient. Open the menu and the blend is abandoned: the header switches to the theme's own text colour over the blurred panel.

## Trigger

scroll (continuous, no state changes) · menu open/close · a section-level override

## Implementation

`.header__top { color: var(--uiColor, var(--color-white)); position: fixed; z-index: 10; pointer-events: none }`, with `.useBlendMode .header__top { mix-blend-mode: difference }` applied from a class on the body. The exceptions are one rule: `.header__top.menuOpen, [theme=override] .header__top { color: var(--textColor, var(--uiColor)); mix-blend-mode: normal !important }`. The menu itself is `backdrop-filter: blur(40px)` over a background at 80% opacity — exactly the surface difference blending handles worst.

## Distilled implementation

The same layer and the same gate, with the strips underneath chosen to include the failure case: white, near-black, saturated artwork, a mid-grey band where difference against 50% grey is genuinely unreadable, and a busy texture where it still works because only luminance matters. The menu reproduces the blurred overlay so the exception can be felt: open it, then re-enable the blend from the panel and watch the header become unreadable. A live readout prints the computed `mix-blend-mode` and the body's classes, so the state machine is visible rather than implied.

## Key techniques

- `mix-blend-mode: difference` on white text as a self-inverting overlay
- the blend gated by a body class, so it can be withdrawn globally
- explicit exceptions for the menu and for opt-out sections, with `!important` to beat the gate
- `pointer-events: none` on the bar, restored on the interactive children
- white as the only base colour that inverts predictably

## Parameters worth tuning

- `--menu-blur` — 40px
- `--menu-dim` — 0.8 overlay opacity
- `--swap-dur` — 300ms colour transition when the blend is dropped
- which surfaces get the override — this is a content decision, not a styling one

## Fidelity

high

## Difficulty

Easy

## Tags

navigation, background, microinteraction, layout
