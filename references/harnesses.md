# Harnesses — what to use where

The workflow in `SKILL.md` is harness-neutral. Only Stage 1 differs between
harnesses, because that is the stage that needs a browser. Everything else is
files and shell commands, which every agent CLI can do.

## Capability check, in order

1. **Does the harness expose browser tools?** Drive them — they can do things a
   script cannot: watch a route change mid-flight, follow a drag, read a canvas
   after a gesture, screenshot an arbitrary state.
2. **Can it run a shell?** Then `scripts/inspect.mjs` gives you the behavioural
   pass headlessly, including a hover-diff sweep that names the exact computed
   properties each hover changes.
3. **Neither?** Run `scripts/probe.mjs` output only, say plainly in the report
   that behavioural analysis was unavailable, and distil only what static
   evidence supports.

Never skip Stage 1 and guess. A pattern list assembled from CSS text alone will
miss most of what is interesting and will invent things that are not there.

## Tool names by harness

| Capability | Claude Code (in-app browser) | Playwright MCP | Chrome MCP | No browser tools |
|---|---|---|---|---|
| open a page | `navigate` / `preview_start` | `browser_navigate` | `navigate` | `inspect.mjs` |
| read structure | `read_page` | `browser_snapshot` | `read_page` | `inspect.json` → `static` |
| run JS in page | `javascript_tool` | `browser_evaluate` | `javascript_tool` | probes inside `inspect.mjs` |
| hover | `computer{action:"hover"}` | `browser_hover` | `computer` | hover sweep (`--hover`) |
| click | `computer{action:"left_click"}` | `browser_click` | `computer` | not covered — use a real browser |
| scroll | `computer{action:"scroll"}` | `browser_evaluate` | `computer` | scroll sweep (`--scroll`) |
| screenshot | `computer{action:"screenshot"}` | `browser_take_screenshot` | `computer` | `--shots` |
| console | `read_console_messages` | `browser_console_messages` | `read_console_messages` | `inspect.json` → `consoleErrors` |
| network | `read_network_requests` | `browser_network_requests` | `read_network_requests` | `inspect.json` → `network` |
| viewport | `resize_window` | `browser_resize` | `resize_window` | `--viewport 390x844` |

## Claude Code

Installed as a skill (`~/.claude/skills/ui-distiller`) plus a `/ui-distiller`
command. The in-app browser is the default; a Playwright MCP works identically.

One trap specific to a preview pane: when the pane is hidden, `document.hidden`
is `true`, and the tab suspends `requestAnimationFrame`, scroll events and CSS
transitions. Demos then look broken when they are fine. Check `document.hidden`
before concluding anything, and verify without frames — see the Stage 8 notes in
`SKILL.md`.

## Codex

Same skill format (`~/.codex/skills/ui-distiller`), plus `~/.codex/prompts/ui-distiller.md`
so `/ui-distiller <url>` works. Codex has a shell, so `inspect.mjs` covers the
behavioural pass; use its browser tooling instead when one is configured.

## OpenCode (including DeepSeek-backed setups)

Installed as a command: `~/.config/opencode/command/ui-distiller.md`, invoked as
`/ui-distiller <url>`. OpenCode also reads `AGENTS.md`, so pointing it at this
checkout is enough on its own.

DeepSeek has no first-party agent CLI; it is used here as a model *inside*
OpenCode (or any OpenAI-compatible harness). Two adjustments are worth making
with a smaller or cheaper model:

- Work one stage at a time and write the intermediate result to `.work/` before
  moving on, rather than holding the whole run in context.
- Read one reference file per stage — `detect.md` while listing candidates,
  `scoring.md` while ranking, `recreate.md` while building — not all of them up
  front.

## Any other harness

Paste `prompts/ui-distiller.md` with `{{TOOLKIT}}` replaced by the absolute path
of this checkout, or simply tell the agent to read `SKILL.md` there. Everything
the workflow needs is a shell, a filesystem and (ideally) a browser.

## The headless pass

```bash
node scripts/inspect.mjs <url> --out <root>/.work --shots --hover 24 --scroll 8
```

Writes `inspect.json`:

- `static` — title, library globals, framework fingerprints, platform CSS support
  (`:has()`, `@starting-style`, `allow-discrete`, scroll timelines, view transitions),
  running animations with their timing, custom properties, easings, fixed layers,
  cursor layers, canvases and their contexts, same-origin routes, fonts
- `hover` — per candidate, the computed properties that changed on hover, ranked
  by how much changed. This is the fastest route to the interesting hovers on a site.
- `scroll` / `scrollMovers` — what actually moves during a scroll sweep
- `network`, `consoleErrors`, `overlaysHidden`

Requires Playwright or Puppeteer. It resolves them from the project, the global
root, or the npx cache, so a machine that has ever run `npx playwright` needs no
install. Otherwise:

```bash
npm i -D playwright && npx playwright install chromium
```

Exit codes: `0` fine · `2` the page failed to load · `3` no browser engine — fall
back to the harness's own tools or to the static pass.

Runtimes: `probe.mjs`, `gallery.mjs` and `verify.mjs` run under Node 18+ and Deno 2
alike. `inspect.mjs` should be run under Node — it loads Playwright, whose CommonJS
entry and native browser launch are Node-shaped.

Flags worth knowing: `--verbose` reports why individual hover probes were
unreachable; `--keep-overlays` leaves consent walls in place (they are hidden by
default because they intercept every hover, and hiding is local — nothing is
clicked, accepted or stored); `--viewport 390x844` for the mobile pass.
