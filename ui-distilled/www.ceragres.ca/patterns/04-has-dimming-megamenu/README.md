# :has() dimming mega menu

Source:
https://www.ceragres.ca/

## What is interesting

Hovering one row of the mega menu drops every row to 54% and returns the hovered one to full — a "dim the siblings" relationship that used to require a script tracking the active item, expressed here as one selector: `ul:has(li:hover) > li a { opacity: .54 }`. The hovered row also draws a hairline across its own top edge and releases its second-level list, whose items each carry a `--delay` custom property so the stagger is data on the element rather than a set of nth-child rules. Every one of those states is duplicated for `[aria-expanded="true"]`, so a keyboard user gets exactly what a pointer user gets — the accessibility path is the same CSS, not a reduced version of it.

## Behavior

Move onto any row: the whole list steps back, that row stays lit, a black hairline draws across its top edge from the left, and its sub-items fade in from 10% to the left, one after another. Move to the next row and the states hand over without anything resetting to a neutral frame. Tab through the rows and the same thing happens.

## Trigger

hover on a row; focus (via `aria-expanded`) for keyboards

## Implementation

`.c-menu-d__submenu-lvl1-list:has(li.h6:hover) > li .c-menu-d__submenu-link { opacity: 54% }` dims the set; `> li:hover .c-menu-d__submenu-link { opacity: 1 !important }` restores the hovered one. The row's `::before` is a 1px full-width bar with `transform-origin: top left`, `scaleX(0)`, transitioning `transform .4s ease-out` to `scaleX(1)` on hover. The second level is absolutely positioned to the right with `visibility: hidden`, and its `li`s sit at `opacity: 0; transform: translate(-10%)` with `transition: transform .4s ease-out var(--delay), opacity .25s linear var(--delay)`; hovering the parent sets `visibility: visible` and returns the items to `opacity: 1; transform: none`. Each of these three rule groups is repeated for `li:has(.c-menu-d__submenu-link[aria-expanded="true"])`.

## Distilled implementation

Same selectors and same timings, rebuilt around a neutral product menu. The `--delay` values are written per item and re-written by the stagger control, which is the honest version of what a template does when it prints `style="--delay: …"`. The only JavaScript is the keyboard bridge that sets `aria-expanded` on focus and clears it on blur outside the row — the visuals never touch JS. A `CSS.supports('selector(:has(a))')` check surfaces a note rather than silently degrading, and the layout collapses to a single column under 820px.

## Key techniques

- `:has()` on the list to express "any child hovered" without script
- `!important` on the hovered row because the dimming rule targets the same elements — the site's own resolution of the specificity clash
- `--delay` per item for a stagger that lives in the markup
- `visibility` (not `display`) so the sub-list can transition and still be inert when closed
- `transform-origin: top left` + `scaleX` for a rule that draws rather than appears
- every hover rule mirrored on `[aria-expanded="true"]` for keyboard parity

## Parameters worth tuning

- `--dim` — 0.54
- `--stagger` — 40ms per sub-item
- `--slide` — 10% entry offset
- `--rule-dur` — 400ms for the hairline
- `--item-dur` — 400ms transform, 60% of it for opacity

## Fidelity

high

## Difficulty

Easy

## Tags

menu, navigation, hover, microinteraction
