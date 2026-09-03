#!/usr/bin/env node
/**
 * UI Distiller — headless behavioural pass.
 *
 * Does what a browser-tool session does, from a shell: loads the page, waits for
 * hydration, reads live styles and animations, hovers candidate elements and
 * diffs their computed styles, samples a scroll sweep, and captures screenshots.
 *
 * Use it when the harness has no browser tools of its own, or as a fast first
 * pass before driving a browser by hand.
 *
 * Usage:
 *   node scripts/inspect.mjs <url> --out <dir> [options]
 *
 *   --out <dir>          output directory (default ./.work)
 *   --viewport 1440x900  viewport size
 *   --hover <n>          hover-diff up to n candidates (default 24, 0 disables)
 *   --scroll <n>         scroll sweep samples (default 8, 0 disables)
 *   --shots              write screenshots (baseline, scroll steps, hover states)
 *   --keep-overlays      do NOT hide consent overlays (they usually block hover probing)
 *   --verbose            report why individual hover probes were skipped
 *   --timeout <ms>       navigation timeout (default 30000)
 *   --engine <name>      playwright | puppeteer | auto (default auto)
 *   --headed             run with a visible window (playwright only)
 *
 * Exit codes: 0 ok · 2 page failed · 3 no browser engine available.
 * Public pages only — no auth, no CAPTCHA, no paywall circumvention.
 */

import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
if (!argv.length || argv[0].startsWith('-')) {
  console.error('usage: node inspect.mjs <url> --out <dir> [--viewport 1440x900] [--hover 24] [--scroll 8] [--shots] [--engine auto]');
  process.exit(1);
}
const arg = (name, def) => { const i = argv.indexOf('--' + name); return i === -1 ? def : argv[i + 1]; };
const has = name => argv.includes('--' + name);

const url = argv[0];
const outDir = resolve(arg('out', '.work'));
const [vw, vh] = String(arg('viewport', '1440x900')).split('x').map(Number);
const hoverLimit = Number(arg('hover', 24));
const scrollSamples = Number(arg('scroll', 8));
const timeout = Number(arg('timeout', 30000));
const wantShots = has('shots');
const keepOverlays = has('keep-overlays');
const verbose = has('verbose');
const engineWanted = arg('engine', 'auto');

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/* ---------------------------------------------------------------- engine */

async function tryImport(spec) {
  try { return await import(spec); } catch { return null; }
}

/** Playwright and Puppeteer are optional. Look where they plausibly live,
 *  including the npx cache, so a machine that has ever run `npx playwright`
 *  can be used without installing anything. */
async function findPackage(name) {
  const direct = await tryImport(name);
  if (direct) return { mod: direct, from: name };

  const roots = [];
  try { roots.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()); } catch { /* npm may be absent */ }
  roots.push(join(process.cwd(), 'node_modules'));

  const npxCache = join(homedir(), '.npm', '_npx');
  if (existsSync(npxCache)) {
    try {
      for (const entry of await readdir(npxCache)) roots.push(join(npxCache, entry, 'node_modules'));
    } catch { /* ignore */ }
  }

  for (const root of roots) {
    const dir = join(root, name);
    if (!existsSync(join(dir, 'package.json'))) continue;

    // These packages are CommonJS. A bare file:// import of a .js entry fails on
    // runtimes that treat .js as ESM (Deno), so go through createRequire, which
    // both Node and Deno implement, before falling back to a URL import.
    try {
      const require = createRequire(join(dir, 'package.json'));
      const mod = require(name);
      if (mod) return { mod, from: dir };
    } catch { /* fall through */ }

    const entry = join(dir, 'index.js');
    const mod = existsSync(entry) ? await tryImport(pathToFileURL(entry).href) : null;
    if (mod) return { mod, from: dir };
  }

  // Deno can fetch and cache the package itself; only reached when nothing local matched.
  if (globalThis.Deno) {
    const viaNpm = await tryImport('npm:' + name);
    if (viaNpm) return { mod: viaNpm, from: 'npm:' + name };
  }
  return null;
}

async function getEngine() {
  const order = engineWanted === 'auto' ? ['playwright', 'playwright-core', 'puppeteer'] : [engineWanted];
  for (const name of order) {
    const found = await findPackage(name);
    if (!found) continue;
    const api = found.mod.default ?? found.mod;
    if (name.startsWith('playwright')) {
      const chromium = api.chromium ?? found.mod.chromium;
      if (chromium) return { kind: 'playwright', chromium, from: found.from };
    } else if (api.launch) {
      return { kind: 'puppeteer', puppeteer: api, from: found.from };
    }
  }
  return null;
}

/* ------------------------------------------------------- page-side probes */
/* These run inside the page. Keep them self-contained: they are serialised. */

const PROBE_STATIC = () => {
  const cn = e => String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || '');
  const label = e => e.tagName + (cn(e) ? '.' + cn(e).trim().split(/\s+/).slice(0, 3).join('.') : '');

  const libs = ['gsap', 'ScrollTrigger', 'ScrollSmoother', 'Flip', 'Draggable', 'Lenis', 'lenis',
    'LocomotiveScroll', 'THREE', 'PIXI', 'p5', 'Matter', 'lottie', 'Splitting', 'SplitType', 'SplitText',
    'Swiper', 'barba', 'Swup', 'anime', 'Rive', 'Alpine', 'jQuery', '$'].filter(k => k in window);

  const frameworks = {
    react: !!(window.React || document.querySelector('#__next,[data-reactroot],#root')),
    next: !!window.__NEXT_DATA__ || !!document.querySelector('script[src*="/_next/"]'),
    nuxt: !!window.__NUXT__ || !!document.querySelector('script[src*="/_nuxt/"]'),
    vue: !!(window.Vue || document.querySelector('[data-v-app],[data-v-]')),
    svelte: !!document.querySelector('[class*="svelte-"]'),
    astro: !!document.querySelector('astro-island'),
    webflow: !!window.Webflow,
    shopify: !!window.Shopify || /cdn\.shopify\.com/.test(document.documentElement.innerHTML.slice(0, 200000)),
  };

  const capabilities = {
    viewTransitions: 'startViewTransition' in document,
    scrollTimeline: CSS.supports('animation-timeline: scroll()'),
    hasSelector: CSS.supports('selector(:has(a))'),
    allowDiscrete: CSS.supports('transition-behavior: allow-discrete'),
    containerQueries: CSS.supports('container-type: inline-size'),
  };

  const customProps = {};
  const easings = new Set();
  let ruleCount = 0;
  let sheetsTotal = 0, sheetsReadable = 0;
  for (const sheet of document.styleSheets) {
    sheetsTotal++;
    let rules;
    // cross-origin stylesheets throw here; their text has to come from probe.mjs instead
    try { rules = sheet.cssRules; sheetsReadable++; } catch { continue; }
    const walk = list => {
      for (const r of list) {
        if (r.cssRules) { walk(r.cssRules); continue; }
        ruleCount++;
        if (!r.style) continue;
        for (const p of r.style) if (p.startsWith('--')) customProps[p] = r.style.getPropertyValue(p).trim().slice(0, 60);
        const t = r.style.transitionTimingFunction || r.style.animationTimingFunction;
        if (t && t !== 'ease') easings.add(t);
      }
    };
    walk(rules || []);
  }

  const animations = document.getAnimations().slice(0, 40).map(a => ({
    name: a.animationName || a.transitionProperty || 'js',
    target: a.effect?.target ? label(a.effect.target) : null,
    timing: a.effect?.getTiming ? a.effect.getTiming() : null,
    state: a.playState,
  }));

  const fixed = [...document.querySelectorAll('body *')].filter(e => {
    const s = getComputedStyle(e);
    return s.position === 'fixed' && e.getBoundingClientRect().width > 0;
  }).slice(0, 20).map(e => {
    const s = getComputedStyle(e);
    return { el: label(e), z: s.zIndex, blend: s.mixBlendMode, pointerEvents: s.pointerEvents };
  });

  const cursors = fixed.filter(f => f.pointerEvents === 'none' && (parseInt(f.z) > 50 || f.blend !== 'normal'));

  const canvases = [...document.querySelectorAll('canvas')].map(c => ({
    el: label(c), size: [c.width, c.height],
    ctx: ['webgl2', 'webgl', '2d'].find(t => { try { return !!c.getContext(t); } catch { return false; } }) || null,
  }));

  const routes = [...new Set([...document.querySelectorAll('a[href]')]
    .map(a => a.getAttribute('href'))
    .filter(h => h && !/^(#|mailto:|tel:|javascript:)/.test(h))
    .map(h => { try { return new URL(h, location.href); } catch { return null; } })
    .filter(u => u && u.hostname === location.hostname)
    .map(u => u.pathname))].slice(0, 60);

  const fonts = [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,button')]
    .map(e => getComputedStyle(e).fontFamily))].slice(0, 8);

  return {
    title: document.title,
    scrollHeight: document.documentElement.scrollHeight,
    libs, frameworks, capabilities, animations, fixed, cursors, canvases, routes, fonts,
    easings: [...easings].slice(0, 30),
    customProps: Object.fromEntries(Object.entries(customProps).slice(0, 80)),
    ruleCount,
    styleSheets: { total: sheetsTotal, readable: sheetsReadable,
      note: sheetsReadable < sheetsTotal ? 'some stylesheets are cross-origin: read their text from probe.mjs output instead' : null },
    reducedMotionRespected: /prefers-reduced-motion/.test([...document.styleSheets].map(s => {
      try { return [...s.cssRules].map(r => r.cssText).join(''); } catch { return ''; }
    }).join('').slice(0, 400000)),
  };
};

/** Candidate elements worth hovering, biased toward things that usually carry hover craft. */
const PROBE_CANDIDATES = (limit) => {
  const cn = e => String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || '');
  const seen = new Set();
  const out = [];
  const sel = 'a, button, [class*="card" i], [class*="item" i], [class*="tile" i], [class*="link" i], [class*="btn" i], li';
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 16) continue;
    if (r.top < 0 || r.top > innerHeight * 3) continue;
    const key = el.tagName + '|' + cn(el).trim().split(/\s+/).slice(0, 2).join('.');
    if (seen.has(key)) continue;                 // one per visual class, not one per instance
    seen.add(key);
    el.setAttribute('data-uid-probe', String(out.length));
    out.push({ id: out.length, el: key, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] });
    if (out.length >= limit) break;
  }
  return out;
};

const WATCHED = ['transform', 'opacity', 'filter', 'clip-path', 'mask-image', 'background-color', 'color',
  'letter-spacing', 'padding-left', 'padding-top', 'border-color', 'box-shadow', 'width', 'height',
  'mix-blend-mode', 'backdrop-filter', 'visibility', 'translate', 'scale', 'rotate', 'text-decoration-color'];

const PROBE_SNAPSHOT = (id, props) => {
  const root = document.querySelector(`[data-uid-probe="${id}"]`);
  if (!root) return null;
  const nodes = [root, ...root.querySelectorAll('*')].slice(0, 12);
  return nodes.map((n, i) => {
    const s = getComputedStyle(n);
    const o = {};
    for (const p of props) o[p] = s.getPropertyValue(p);
    const before = getComputedStyle(n, '::before'), after = getComputedStyle(n, '::after');
    o['::before'] = before.content !== 'none' ? before.transform + '|' + before.opacity : null;
    o['::after'] = after.content !== 'none' ? after.transform + '|' + after.opacity : null;
    o.__i = i;
    o.__tag = n.tagName;
    return o;
  });
};

const PROBE_SCROLL_SAMPLE = (props) => {
  const out = [];
  const cn = e => String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || '');
  for (const el of document.querySelectorAll('[data-uid-scroll]')) {
    const s = getComputedStyle(el);
    const o = { el: el.tagName + '.' + cn(el).trim().split(/\s+/)[0] };
    for (const p of props) o[p] = s.getPropertyValue(p);
    out.push(o);
  }
  return { y: Math.round(scrollY), items: out };
};

const PROBE_MARK_SCROLL = (limit) => {
  const cn = e => String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className || '');
  const cands = [...document.querySelectorAll('section, [class*="hero" i], [class*="section" i], canvas, img, h1, h2, [class*="parallax" i], [class*="sticky" i]')];
  let n = 0;
  const picked = [];
  for (const el of cands) {
    const r = el.getBoundingClientRect();
    if (r.width < 80 || r.height < 40) continue;
    el.setAttribute('data-uid-scroll', String(n));
    picked.push(el.tagName + '.' + cn(el).trim().split(/\s+/)[0]);
    if (++n >= limit) break;
  }
  return picked;
};

/** Consent walls intercept pointer events, so hover probing returns nothing while
 *  one is up. This hides the overlay locally in our own render of the page. It
 *  clicks nothing, accepts nothing and stores no preference — the site is left
 *  in exactly the state it would be in for a visitor who never answered. */
const PROBE_HIDE_OVERLAYS = () => {
  const SELECTORS = [
    '.cky-modal', '.cky-overlay', '.cky-consent-container',
    '#onetrust-consent-sdk', '.ot-sdk-container', '#onetrust-banner-sdk',
    '.cc-window', '.cookie-banner', '.cookie-consent', '#cookie-banner', '#cookieConsent',
    '[id*="cookiebanner" i]', '[class*="cookie-banner" i]', '[class*="consent-banner" i]',
    '#usercentrics-root', '#CybotCookiebotDialog', '#CybotCookiebotDialogBodyUnderlay',
    '[aria-label*="cookie" i][role="dialog"]',
  ];
  const hidden = [];
  for (const sel of SELECTORS) {
    for (const el of document.querySelectorAll(sel)) {
      if (!el.getClientRects().length && getComputedStyle(el).display === 'none') continue;
      el.style.setProperty('display', 'none', 'important');
      hidden.push(sel);
    }
  }
  // consent libraries commonly lock the scroll while their modal is up
  for (const el of [document.documentElement, document.body]) {
    if (getComputedStyle(el).overflow === 'hidden') el.style.setProperty('overflow', 'auto', 'important');
  }
  return [...new Set(hidden)];
};

/** Client-routed sites keep their links inside a closed menu, so the server HTML
 *  and the resting DOM can both report a single route. Open the obvious toggles
 *  first, then collect. Nothing is submitted and no link is followed. */
const PROBE_OPEN_MENUS = () => {
  const SELECTORS = [
    '[aria-label*="menu" i]', '[aria-controls*="menu" i]', '[class*="menuBtn" i]',
    '[class*="burger" i]', '[class*="hamburger" i]', '[class*="nav-toggle" i]',
    'button[aria-expanded="false"]', 'header button', '[data-menu-toggle]',
  ];
  const clicked = [];
  for (const sel of SELECTORS) {
    for (const el of Array.from(document.querySelectorAll(sel)).slice(0, 3)) {
      const label = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24);
      if (/close|search|cart|account|basket/i.test(label)) continue;
      try { el.click(); clicked.push(sel + ' → ' + (label || el.tagName)); } catch { /* ignore */ }
    }
    if (clicked.length >= 4) break;
  }
  return clicked;
};

const PROBE_ROUTES = () => {
  const same = new Set();
  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (!href || /^(#|mailto:|tel:|javascript:)/.test(href)) continue;
    try {
      const u = new URL(href, location.href);
      if (u.hostname === location.hostname) same.add(u.pathname + (u.search || ''));
    } catch { /* ignore */ }
  }
  // Nuxt / Next payloads often carry the route table even when no link is rendered
  const fromPayload = new Set();
  const scan = obj => {
    if (!obj || typeof obj !== 'object') return;
    for (const v of Object.values(obj)) {
      if (typeof v === 'string' && /^\/[a-z0-9][\w\-/]*$/i.test(v) && v.length < 60) fromPayload.add(v);
      else if (typeof v === 'object') scan(v);
    }
  };
  try { scan(window.__NUXT__?.state ?? window.__NUXT__); } catch { /* ignore */ }
  try { scan(window.__NEXT_DATA__?.props); } catch { /* ignore */ }

  // Menu items are often <div> or <button> with a click handler and no href at
  // all, so the labels are the only clue the DOM offers. Hand them back too.
  const menuLabels = [...document.querySelectorAll(
    '[class*="menuItem" i], [class*="menu__item" i], nav li, [role="menuitem"]')]
    .map(e => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40))
    .filter(t => t && t.length < 40);

  return {
    fromDom: [...same].slice(0, 80),
    fromPayload: [...fromPayload].slice(0, 40),
    menuLabels: [...new Set(menuLabels)].slice(0, 30),
  };
};

/** Last resort for client-routed sites: the route table is in the JavaScript.
 *  Fetch every loaded same-origin script and pull path-shaped literals out of it. */
const PROBE_ROUTES_FROM_SCRIPTS = async () => {
  const srcs = [...document.querySelectorAll('script[src]')]
    .map(s => s.src).filter(u => u.startsWith(location.origin)).slice(0, 40);
  const found = new Set();
  await Promise.all(srcs.map(async u => {
    try {
      const text = await (await fetch(u)).text();
      for (const m of text.matchAll(/["'`](\/[a-z][a-z0-9-]{2,30})["'`]/g)) found.add(m[1]);
    } catch { /* ignore */ }
  }));
  const noise = /^\/(api|_nuxt|_next|assets|static|images|img|fonts|css|js|media|favicon|null|true|false)\b/;
  return [...found].filter(p => !noise.test(p)).sort().slice(0, 60);
};

/* ------------------------------------------------------------------ main */

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Both Playwright and Puppeteer accept a string for evaluate, which keeps the
 *  page-side functions above readable instead of inlined as template soup. */
const ev = (page, fn, ...args) =>
  page.evaluate(`(${fn.toString()})(${args.map(a => JSON.stringify(a)).join(',')})`);

function diffSnapshots(a, b) {
  if (!a || !b) return null;
  const changes = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    for (const k of Object.keys(a[i])) {
      if (k.startsWith('__')) continue;
      const from = a[i][k], to = b[i][k];
      if (from === to || from == null || to == null) continue;
      changes.push({ node: i === 0 ? 'self' : `${a[i].__tag}[${i}]`, prop: k, from: String(from).slice(0, 90), to: String(to).slice(0, 90) });
    }
  }
  return changes;
}

async function main() {
  const engine = await getEngine();
  if (!engine) {
    console.error(
      'No browser engine found.\n' +
      'Install one of these, then re-run:\n' +
      '  npm i -D playwright && npx playwright install chromium     (recommended)\n' +
      '  npm i -D puppeteer\n' +
      'Or drive the harness\'s own browser tools instead — see references/harnesses.md.'
    );
    process.exit(3);
  }

  await mkdir(outDir, { recursive: true });
  if (wantShots) await mkdir(join(outDir, 'shots'), { recursive: true });

  const isPW = engine.kind === 'playwright';
  const browser = isPW
    ? await engine.chromium.launch({ headless: !has('headed') })
    : await engine.puppeteer.launch({ headless: 'new' });

  const context = isPW ? await browser.newContext({ viewport: { width: vw, height: vh }, userAgent: UA }) : null;
  const page = isPW ? await context.newPage() : await browser.newPage();
  if (!isPW) { await page.setViewport({ width: vw, height: vh }); await page.setUserAgent(UA); }

  const network = [];
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(String(m.text()).slice(0, 200)); });
  page.on('response', r => {
    const u = r.url();
    if (/\.(js|mjs|css|woff2?|json)(\?|$)/i.test(u) || /\/_(nuxt|next)\//.test(u)) {
      network.push({ url: u.slice(0, 200), status: r.status() });
    }
  });

  const result = { url, engine: engine.kind, engineFrom: engine.from, viewport: [vw, vh], inspectedAt: new Date().toISOString() };

  try {
    await page.goto(url, { waitUntil: isPW ? 'networkidle' : 'networkidle2', timeout });
  } catch (err) {
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout }); }
    catch (e2) {
      console.error('page failed:', e2.message);
      await browser.close();
      process.exit(2);
    }
    result.navigationNote = 'networkidle timed out; used domcontentloaded — page may still have been settling';
  }

  await sleep(2500);

  if (!keepOverlays) {
    result.overlaysHidden = await ev(page, PROBE_HIDE_OVERLAYS);
    if (result.overlaysHidden.length) {
      result.overlayNote = 'consent overlay hidden locally for analysis — nothing was clicked or accepted';
      await sleep(300);
    }
  }

  result.static = await ev(page, PROBE_STATIC);

  /* ---- route discovery: a "single route" claim has to survive opening the menu ---- */
  {
    const before = await ev(page, PROBE_ROUTES);
    const clicked = await ev(page, PROBE_OPEN_MENUS);
    await sleep(900);
    const after = await ev(page, PROBE_ROUTES);
    const fromScripts = (before.fromDom.length + after.fromDom.length) <= 2
      ? await page.evaluate(`(${PROBE_ROUTES_FROM_SCRIPTS.toString()})()`)
      : [];
    const merged = [...new Set([
      ...before.fromDom, ...after.fromDom,
      ...before.fromPayload, ...after.fromPayload,
      ...fromScripts,
    ])];
    result.routes = {
      beforeMenu: before.fromDom.length,
      afterMenu: after.fromDom.length,
      fromPayload: [...new Set([...before.fromPayload, ...after.fromPayload])],
      fromScripts,
      menuLabels: [...new Set([...(before.menuLabels || []), ...(after.menuLabels || [])])],
      togglesClicked: clicked,
      all: merged.sort(),
    };
    if (wantShots && clicked.length) await page.screenshot({ path: join(outDir, 'shots', '01-menu-open.png') });
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(400);
  }
  if (wantShots) await page.screenshot({ path: join(outDir, 'shots', '00-baseline.png') });

  /* ---- hover diff sweep: what actually changes when the pointer arrives ---- */
  if (hoverLimit > 0) {
    const candidates = await ev(page, PROBE_CANDIDATES, hoverLimit);
    const hovers = [];
    const skipped = [];
    for (const c of candidates) {
      try {
        const snap = await ev(page, PROBE_SNAPSHOT, c.id, WATCHED);
        // force: skip Playwright's actionability wait. Elements that are mid-animation
        // or overlapped still tell us what :hover changes; we only need the pointer
        // inside their box, not a click guarantee.
        await page.hover(`[data-uid-probe="${c.id}"]`, { timeout: 3000, force: true });
        await sleep(550);
        const after = await ev(page, PROBE_SNAPSHOT, c.id, WATCHED);
        const changes = diffSnapshots(snap, after);
        if (changes && changes.length) {
          hovers.push({ ...c, changeCount: changes.length, changes: changes.slice(0, 14) });
          if (wantShots && hovers.length <= 6) {
            await page.screenshot({ path: join(outDir, 'shots', `hover-${String(c.id).padStart(2, '0')}.png`) });
          }
        }
        await page.mouse.move(2, 2);
        await sleep(120);
      } catch (e) {
        skipped.push({ el: c.el, why: String(e.message || e).split('\n')[0].slice(0, 90) });
      }
    }
    hovers.sort((a, b) => b.changeCount - a.changeCount);
    result.hover = hovers;
    result.hoverProbed = candidates.length;
    result.hoverSkipped = skipped;
    if (verbose && skipped.length) {
      process.stderr.write('\nskipped hover probes:\n' + skipped.map(s => `  ${s.el}: ${s.why}`).join('\n') + '\n');
    }
  }

  /* ---- scroll sweep: what moves, and how far ---- */
  if (scrollSamples > 0) {
    result.scrollWatched = await ev(page, PROBE_MARK_SCROLL, 12);

    const height = result.static.scrollHeight;
    const samples = [];
    for (let i = 0; i < scrollSamples; i++) {
      const y = Math.round((height - vh) * (i / Math.max(1, scrollSamples - 1)));
      await page.evaluate(`scrollTo(0, ${y})`);
      await sleep(420);
      samples.push(await ev(page, PROBE_SCROLL_SAMPLE, ['transform', 'opacity', 'clip-path', 'filter']));
      if (wantShots && i % 2 === 0) {
        await page.screenshot({ path: join(outDir, 'shots', `scroll-${String(i).padStart(2, '0')}.png`) });
      }
    }
    result.scroll = samples;

    /* which of the watched elements actually changed across the sweep */
    const moved = {};
    for (const s of samples) {
      for (const item of s.items) {
        const key = item.el;
        (moved[key] ||= new Set());
        for (const p of ['transform', 'opacity', 'clip-path', 'filter']) if (item[p]) moved[key].add(p + '=' + item[p]);
      }
    }
    result.scrollMovers = Object.entries(moved)
      .map(([el, set]) => ({ el, distinctStates: set.size }))
      .filter(x => x.distinctStates > 1)
      .sort((a, b) => b.distinctStates - a.distinctStates);
  }

  await page.evaluate('scrollTo(0, 0)');
  await sleep(300);
  result.animationsAfterScroll = await page.evaluate('document.getAnimations().length');
  result.network = network.slice(0, 120);
  result.consoleErrors = consoleErrors.slice(0, 20);

  await writeFile(join(outDir, 'inspect.json'), JSON.stringify(result, null, 2));
  await browser.close();

  const s = result.static;
  process.stderr.write(
    `\ninspect.json → ${join(outDir, 'inspect.json')}\n` +
    `engine ${engine.kind} · "${s.title}"\n` +
    `libs: ${s.libs.join(', ') || '(none)'}\n` +
    `frameworks: ${Object.entries(s.frameworks).filter(([, v]) => v).map(([k]) => k).join(', ') || '(none)'}\n` +
    `platform css: ${Object.entries(s.capabilities).filter(([, v]) => v).map(([k]) => k).join(', ')}\n` +
    `stylesheets readable: ${s.styleSheets.readable}/${s.styleSheets.total}` +
    (s.styleSheets.note ? ' — cross-origin CSS, use probe.mjs for rule text' : '') + '\n' +
    `hover: ${result.hover?.length ?? 0} of ${result.hoverProbed ?? 0} candidates changed` +
    (result.hoverSkipped?.length ? `, ${result.hoverSkipped.length} unreachable` : '') +
    (result.hover?.length ? ` (top: ${result.hover.slice(0, 3).map(h => h.el + ' ×' + h.changeCount).join(', ')})` : '') + '\n' +
    `scroll movers: ${result.scrollMovers?.length ?? 0}\n` +
    `routes: ${result.routes?.all.length ?? 0} found` +
    (result.routes ? ` (${result.routes.beforeMenu} before opening menus, ${result.routes.afterMenu} after)` : '') +
    (result.routes?.all.length <= 1 ? ' — SUSPICIOUS on a client-routed site: check the menu, sitemap.xml and the route table in the JS chunks' : '') + '\n' +
    `console errors: ${result.consoleErrors.length}\n` +
    (result.overlaysHidden?.length ? `consent overlay hidden locally (not accepted): ${result.overlaysHidden.join(', ')}\n` : '') +
    (wantShots ? `shots → ${join(outDir, 'shots')}\n` : '')
  );
}

main().catch(err => { console.error(err); process.exit(1); });
