#!/usr/bin/env node
/**
 * UI Distiller — static acquisition pass.
 *
 * Fetches public HTML/CSS/JS for one or more pages, saves raw material,
 * and emits probe.json with library fingerprints, CSS feature usage,
 * keyframe and font inventories, and discovered same-origin routes.
 *
 * Usage:
 *   node scripts/probe.mjs <url> --out <dir> [--pages /a,/b] [--max-asset-kb 900]
 *                                [--timeout 20000] [--no-assets]
 *
 * Public pages only. No auth, no cookies, no retries against 401/403.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';

const argv = process.argv.slice(2);
if (!argv.length || argv[0].startsWith('-')) {
  console.error('usage: node probe.mjs <url> --out <dir> [--pages /a,/b] [--max-asset-kb 900] [--timeout 20000] [--no-assets]');
  process.exit(1);
}
const flag = (name, def) => {
  const i = argv.indexOf('--' + name);
  return i === -1 ? def : argv[i + 1];
};
const has = name => argv.includes('--' + name);

const startUrl = new URL(argv[0]);
const outDir = flag('out', join('ui-distilled', startUrl.hostname, '.work'));
const maxAsset = Number(flag('max-asset-kb', 900)) * 1024;
// The cap exists to stop one huge bundle dominating the capture. It must never
// apply to the page itself: a document over the cap would come back empty and
// take the whole run with it.
const maxPage = Math.max(maxAsset, 8 * 1024 * 1024);
const timeout = Number(flag('timeout', 20000));
const withAssets = !has('no-assets');
const extraPages = (flag('pages', '') || '').split(',').map(s => s.trim()).filter(Boolean);

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const LIBRARIES = [
  ['GSAP', /\bgsap\b|TweenMax|TimelineMax|greensock/i],
  ['ScrollTrigger', /ScrollTrigger/],
  ['ScrollSmoother', /ScrollSmoother/],
  ['GSAP Flip', /gsap[^\n]{0,40}\bFlip\b|\bFlip\.getState\b/],
  ['Lenis', /\blenis\b/i],
  ['Locomotive Scroll', /locomotive-scroll|LocomotiveScroll/i],
  ['Framer Motion', /framer-motion|framerMotion|motion-dom|\bm\.div\b/],
  ['Motion One', /motion\.dev|"motion"\s*:|animate\(\s*['"]/],
  ['anime.js', /anime\.js|animejs/i],
  ['Three.js', /\bTHREE\b|three\.module|three\.min/],
  ['React Three Fiber', /react-three-fiber|@react-three/],
  ['PixiJS', /\bPIXI\b|pixi\.js/i],
  ['p5.js', /\bp5\.js\b|p5\.min/i],
  ['Matter.js', /\bMatter\b\.Engine|matter-js/],
  ['Lottie', /lottie|bodymovin/i],
  ['Rive', /\brive\b.*canvas|@rive-app/i],
  ['Barba.js', /\bbarba\b/i],
  ['Swup', /\bswup\b/i],
  ['Highway', /highway\.core/i],
  ['Taxi.js', /@unseenco\/taxi/i],
  ['Splitting.js', /\bSplitting\b/],
  ['SplitType / SplitText', /SplitType|SplitText/],
  ['Swiper', /\bSwiper\b/],
  ['Embla', /embla-carousel/i],
  ['Splide', /\bSplide\b/],
  ['Flickity', /\bFlickity\b/],
  ['ScrollReveal', /ScrollReveal/],
  ['AOS', /\baos\.(js|css)\b|data-aos/],
  ['React', /__reactContainer|data-reactroot|react-dom|\bReactDOM\b/],
  ['Next.js', /__NEXT_DATA__|\/_next\//],
  ['Vue', /__VUE__|data-v-[a-f0-9]{8}|vue\.runtime/],
  ['Nuxt', /__NUXT__|\/_nuxt\//],
  ['Svelte', /svelte-[a-z0-9]{6}|__svelte/],
  ['SvelteKit', /\/_app\/immutable\//],
  ['Astro', /astro-island|astro-slot/],
  ['Alpine.js', /\bAlpine\b|x-data=/],
  ['Webflow', /webflow|w-webflow/i],
  ['Squarespace', /squarespace/i],
  ['WordPress', /wp-content|wp-includes/i],
  ['Shopify', /cdn\.shopify\.com/i],
  ['Tailwind', /tailwind|(?:^|[^-\w])(?:sm|md|lg):(?:flex|grid|hidden)\b/],
];

const CSS_FEATURES = [
  ['clip-path', /clip-path\s*:/g],
  ['mask', /(?:-webkit-)?mask(?:-image|-size|-position)?\s*:/g],
  ['mix-blend-mode', /mix-blend-mode\s*:/g],
  ['backdrop-filter', /backdrop-filter\s*:/g],
  ['filter', /filter\s*:\s*(?!none)/g],
  ['perspective', /perspective\s*:|perspective\(/g],
  ['transform-style: preserve-3d', /preserve-3d/g],
  ['custom properties', /--[a-z][\w-]*\s*:/gi],
  ['scroll-driven animations', /animation-timeline\s*:|scroll-timeline|view-timeline/g],
  ['view transitions', /::view-transition|view-transition-name/g],
  ['container queries', /@container/g],
  ['position: sticky', /position\s*:\s*sticky/g],
  ['scroll-snap', /scroll-snap-type/g],
  ['background-clip: text', /background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text/g],
  ['aspect-ratio', /aspect-ratio\s*:/g],
  ['grid', /display\s*:\s*grid|grid-template/g],
  ['will-change', /will-change\s*:/g],
  ['prefers-reduced-motion', /prefers-reduced-motion/g],
  ['@supports', /@supports/g],
  ['SVG filter', /feTurbulence|feDisplacementMap|feGaussianBlur/g],
];

const JS_FEATURES = [
  ['requestAnimationFrame', /requestAnimationFrame/g],
  ['IntersectionObserver', /IntersectionObserver/g],
  ['ResizeObserver', /ResizeObserver/g],
  ['MutationObserver', /MutationObserver/g],
  ['Web Animations API', /\.animate\(\s*\[/g],
  ['View Transitions API', /startViewTransition/g],
  ['WebGL', /getContext\(\s*['"]webgl/g],
  ['Canvas 2D', /getContext\(\s*['"]2d/g],
  ['pointermove', /pointermove|mousemove/g],
  ['wheel listener', /['"]wheel['"]/g],
  ['getBoundingClientRect', /getBoundingClientRect/g],
  ['lerp-ish interpolation', /\blerp\b|damp\b|\* *0\.0?[0-9] *\+/g],
  ['GLSL shader source', /gl_FragColor|varying vec2|uniform sampler2D/g],
];

const routeSet = new Set();
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Some networks let curl through where Node's fetch stalls (proxy handling,
   TLS fingerprinting, HTTP/2 quirks). Try fetch first, fall back to curl. */
function curlGet(url, cap = maxAsset) {
  return new Promise(resolve => {
    execFile('curl', [
      '-sS', '-L', '--max-time', String(Math.ceil(timeout / 1000)),
      '-A', UA, '-w', '\n__CURL_STATUS__%{http_code}', url,
    ], { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' }, (err, stdout, stderr) => {
      if (err && !stdout) {
        return resolve({ ok: false, status: 0, url, size: 0, body: null,
          error: 'curl: ' + String(stderr || err.message).trim().slice(0, 200) });
      }
      const MARK = '\n__CURL_STATUS__';
      const i = stdout.lastIndexOf(MARK);
      const status = i === -1 ? 0 : Number(stdout.slice(i + MARK.length).trim());
      const body = i === -1 ? stdout : stdout.slice(0, i);
      const size = Buffer.byteLength(body);
      resolve({
        ok: status >= 200 && status < 400, status, url, size, type: '', via: 'curl',
        body: size <= cap ? body : null, truncated: size > cap,
      });
    });
  });
}

async function get(url, { asText = true, cap = maxAsset } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: '*/*' },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      ok: res.ok, status: res.status, url: res.url, size: buf.length,
      type: res.headers.get('content-type') || '',
      body: asText && buf.length <= cap ? buf.toString('utf8') : null,
      truncated: buf.length > cap,
    };
  } catch (err) {
    const fallback = await curlGet(url, cap);
    if (fallback.ok || fallback.status) return fallback;
    return { ok: false, status: 0, url, size: 0, body: null,
      error: `fetch: ${String(err.message || err)} · ${fallback.error || 'curl also failed'}` };
  } finally {
    clearTimeout(t);
  }
}

const safeName = s => s.replace(/[^a-z0-9._-]+/gi, '_').slice(-120) || 'index';

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

function extract(html, pageUrl) {
  const css = [], js = [], inlineCss = [], inlineJs = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    const rel = (a.rel || '').toLowerCase();
    if (!a.href) continue;
    if (rel.includes('stylesheet') || (rel === 'preload' && a.as === 'style')) {
      css.push(new URL(a.href, pageUrl).href);
    } else if (rel === 'preload' && a.as === 'script') {
      js.push(new URL(a.href, pageUrl).href);
    }
  }
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const a = attrs('<script ' + m[1] + '>');
    const type = (a.type || '').toLowerCase();
    if (type && !/javascript|module/.test(type)) continue;
    if (a.src) js.push(new URL(a.src, pageUrl).href);
    else if (m[2].trim()) inlineJs.push(m[2]);
  }
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (m[1].trim()) inlineCss.push(m[1]);
  }
  const links = new Set();
  for (const m of html.matchAll(/<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const href = m[1] ?? m[2];
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    try {
      const u = new URL(href, pageUrl);
      if (u.hostname === startUrl.hostname) { u.hash = ''; links.add(u.href); }
    } catch { /* ignore */ }
  }
  return { css: [...new Set(css)], js: [...new Set(js)], inlineCss, inlineJs, links: [...links] };
}

function countAll(text, specs) {
  const out = {};
  for (const [name, re] of specs) {
    const n = (text.match(re) || []).length;
    if (n) out[name] = n;
  }
  return out;
}

function fingerprint(text) {
  return LIBRARIES.filter(([, re]) => re.test(text)).map(([name]) => name);
}

function inventory(css) {
  const keyframes = [...new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]))];
  const fonts = [...new Set([...css.matchAll(/font-family\s*:\s*([^;}]+)/g)]
    .map(m => m[1].trim().replace(/['"]/g, '')).filter(v => v.length < 90))].slice(0, 40);
  const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map(m => {
    const fam = /font-family\s*:\s*([^;]+)/.exec(m[1]);
    const src = /url\(([^)]+)\)/.exec(m[1]);
    const wght = /font-weight\s*:\s*([^;]+)/.exec(m[1]);
    return {
      family: fam ? fam[1].trim().replace(/['"]/g, '') : null,
      weight: wght ? wght[1].trim() : null,
      src: src ? src[1].replace(/['"]/g, '').slice(0, 160) : null,
    };
  });
  const easings = [...new Set([...css.matchAll(/cubic-bezier\([^)]*\)/g)].map(m => m[0]))].slice(0, 30);
  const durations = [...new Set([...css.matchAll(/(?:transition|animation)(?:-duration)?\s*:[^;}]*?(\d+(?:\.\d+)?m?s)/g)]
    .map(m => m[1]))].slice(0, 30);
  return { keyframes, fontFamilies: fonts, fontFaces: faces, easings, durations };
}

async function main() {
  await mkdir(join(outDir, 'raw', 'assets'), { recursive: true });

  const pageUrls = [startUrl.href, ...extraPages.map(p => new URL(p, startUrl).href)];
  const pages = [];
  const assetIndex = [];
  let allCss = '', allJs = '', allHtml = '';
  const seenAssets = new Set();

  for (const pageUrl of pageUrls) {
    process.stderr.write(`· page ${pageUrl}\n`);
    const res = await get(pageUrl, { cap: maxPage });
    if (!res.ok || !res.body) {
      pages.push({ url: pageUrl, ok: false, status: res.status, error: res.error || 'no body' });
      continue;
    }
    const html = res.body;
    allHtml += html;
    const name = safeName(new URL(pageUrl).pathname.replace(/\/$/, '') || 'index') + '.html';
    await writeFile(join(outDir, 'raw', name), html);

    const ex = extract(html, pageUrl);
    ex.inlineCss.forEach((c, i) => { allCss += '\n' + c; assetIndex.push({ kind: 'css', inline: true, page: pageUrl, index: i, size: c.length }); });
    ex.inlineJs.forEach((j, i) => { allJs += '\n' + j; assetIndex.push({ kind: 'js', inline: true, page: pageUrl, index: i, size: j.length }); });
    if (ex.inlineCss.length) await writeFile(join(outDir, 'raw', 'assets', safeName(name) + '.inline.css'), ex.inlineCss.join('\n/* --- */\n'));
    if (ex.inlineJs.length) await writeFile(join(outDir, 'raw', 'assets', safeName(name) + '.inline.js'), ex.inlineJs.join('\n/* --- */\n'));

    if (withAssets) {
      for (const url of [...ex.css, ...ex.js]) {
        if (seenAssets.has(url)) continue;
        seenAssets.add(url);
        const kind = ex.css.includes(url) ? 'css' : 'js';
        const a = await get(url);
        assetIndex.push({ kind, url, status: a.status, size: a.size, truncated: !!a.truncated, error: a.error });
        if (a.body) {
          if (kind === 'css') allCss += '\n' + a.body; else allJs += '\n' + a.body;
          const fname = safeName(new URL(url).pathname.split('/').pop() || kind) + (url.endsWith('.' + kind) ? '' : '.' + kind);
          await writeFile(join(outDir, 'raw', 'assets', fname), a.body);
        }
        await sleep(60);
      }
    }

    pages.push({
      url: pageUrl, ok: true, status: res.status, htmlBytes: res.size,
      stylesheets: ex.css.length, scripts: ex.js.length,
      inlineStyleBlocks: ex.inlineCss.length, inlineScriptBlocks: ex.inlineJs.length,
      links: ex.links.length, file: `raw/${name}`,
    });
    for (const l of ex.links) routeSet.add(l);
    await sleep(120);
  }

  const combined = allHtml + '\n' + allCss + '\n' + allJs;
  const probe = {
    site: startUrl.href,
    host: startUrl.hostname,
    probedAt: new Date().toISOString(),
    summary: {
      pages: pages.filter(p => p.ok).length,
      pagesFailed: pages.filter(p => !p.ok).length,
      assets: assetIndex.length,
      cssBytes: allCss.length,
      jsBytes: allJs.length,
    },
    pages,
    libraries: fingerprint(combined),
    cssFeatures: countAll(allCss + allHtml, CSS_FEATURES),
    jsFeatures: countAll(allJs, JS_FEATURES),
    inventory: inventory(allCss),
    routes: [...routeSet].sort().slice(0, 120),
    assets: assetIndex,
  };

  await writeFile(join(outDir, 'probe.json'), JSON.stringify(probe, null, 2));

  process.stderr.write(
    `\nprobe.json → ${join(outDir, 'probe.json')}\n` +
    `pages ${probe.summary.pages} · assets ${probe.summary.assets} · css ${(allCss.length / 1024 | 0)}kb · js ${(allJs.length / 1024 | 0)}kb\n` +
    `libraries: ${probe.libraries.join(', ') || '(none detected)'}\n` +
    `css features: ${Object.keys(probe.cssFeatures).join(', ') || '(none)'}\n` +
    `routes found: ${probe.routes.length}\n`
  );
}

main().catch(err => { console.error(err); process.exit(1); });
