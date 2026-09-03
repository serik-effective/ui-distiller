# Native dialog slide-over

Source:
https://www.ceragres.ca/

## What is interesting

The cart and favourites panels are real `<dialog>` elements opened with `showModal()`, and every frame of their motion is CSS. That is only possible because of two recent additions: `transition-behavior: allow-discrete`, which makes `display` and `overlay` transitionable so the panel can animate *out* instead of vanishing when it leaves the top layer, and `@starting-style`, which supplies the values to animate *from* for an element that did not exist a frame earlier. The direction is an attribute rather than four components, and every duration, easing and blur value is a custom property, so the whole family retunes from one place. Focus trapping, Escape, inertness of the page behind and the backdrop all come from the platform.

## Behavior

A panel slides in from the chosen edge over 600ms while the backdrop fades (and optionally blurs) over 400ms. Escape or a click on the backdrop reverses both, and the panel stays visible for the whole exit rather than disappearing on the first frame. Content inside scrolls on its own, with `overscroll-behavior: contain` stopping the scroll from chaining to the page.

## Trigger

click to open; Escape, close button, or backdrop click to dismiss

## Implementation

`dialog[data-v-…]` sets `--duration-modal: .6s`, `--duration-backdrop: .4s`, `--backdrop-blur`, and in/out easings as custom properties, then transitions `transform`, plus `display` and `overlay` with `allow-discrete`, and delays `opacity`/`visibility` by `--visibility-delay` so the panel is not hidden during its exit. `dialog[data-direction="left|right|top|bottom"]` sets both the margin that pins it to an edge and the closed transform. `dialog[open]` resets the transform to zero. `::backdrop` transitions opacity and `backdrop-filter` on its own shorter duration, with `@starting-style` giving it an opacity of 0 and no blur on entry. Sizing comes from `--viewport-width` / `--viewport-height` custom properties rather than hard-coded values.

## Distilled implementation

Same structure, reduced to one dialog whose `data-direction` the buttons rewrite. `@starting-style` blocks are declared per direction so the entry transform matches the exit one. The backdrop click test compares the pointer coordinates against the dialog's own box — the dialog element *is* the panel, so anything outside that rectangle was the backdrop. A `CSS.supports('transition-behavior: allow-discrete')` check surfaces a note in browsers without the feature instead of pretending the animation ran. No JavaScript touches any style during the transition.

## Key techniques

- `transition-behavior: allow-discrete` on `display` and `overlay` — the reason the exit animates at all
- `@starting-style` for entry values on a top-layer element
- direction as `[data-direction]` data, one component instead of four
- timing and blur as custom properties on the dialog itself
- `overscroll-behavior: contain` and independent panel scrolling
- backdrop hit-testing against the dialog's own rectangle
- platform focus trap, Escape handling and background inertness for free

## Parameters worth tuning

- `--duration-modal` — 600ms
- `--duration-backdrop` — 400ms
- `--backdrop-blur` — 0px (the site ships 0 and exposes the hook)
- `--panel-width` — 42vw
- `--ease-in` / `--ease-out` — cubic-bezier(.4, .64, .68, 1)

## Fidelity

high

## Difficulty

Easy

## Tags

modal, motion, microinteraction
