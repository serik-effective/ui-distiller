#!/usr/bin/env node
/**
 * UI Distiller — reference capture and screenshot comparison.
 *
 * Two jobs, one tool:
 *
 *   shoot   grab a page state as a PNG, at a fixed viewport, optionally after
 *           running a snippet that puts the page into the state you want
 *   diff    compare two PNGs and report how far apart they are, with a diff
 *           image and a coarse map of where the difference lives
 *
 * Usage:
 *   node scripts/compare.mjs shoot <url> <out.png> [options]
 *       --viewport 1440x900     viewport (default 1440x900)
 *       --wait 2500             ms to settle after load
 *       --script "<js>"         run in the page before the shot (hover, scroll, set state)
 *       --clip x,y,w,h          capture only this box — use it to compare one component
 *       --hide "sel,sel"        hide elements before the shot (consent walls, cursors)
 *
 *   node scripts/compare.mjs diff <a.png> <b.png> [options]
 *       --out diff.png          write a diff image (default alongside b)
 *       --mode edges|luma|raw   what to compare (default edges)
 *       --threshold 12          per-pixel difference that counts as "different"
 *       --json                  machine-readable result only
 *
 * On modes: a distilled demo uses placeholder imagery on purpose, so a raw pixel
 * comparison mostly measures the photographs. `edges` compares structure — where
 * shapes and type sit, how big they are, how they are angled — which is what a
 * recreation is supposed to match. Use `raw` only when both sides share content.
 *
 * Needs Playwright or Puppeteer for `shoot`; `diff` needs one too, because the
 * decoding and pixel work happen in the browser rather than in a dependency.
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { homedir } from 'node:os';
import { readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const cmd = argv[0];
if (!['shoot', 'diff'].includes(cmd)) {
  console.error('usage: node compare.mjs shoot <url> <out.png> [...] | diff <a.png> <b.png> [...]');
  process.exit(1);
}
const arg = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };
const has = n => argv.includes('--' + n);

/* ---------------------------------------------------------------- engine */
async function tryImport(spec) { try { return await import(spec); } catch { return null; } }

async function findPackage(name) {
  const direct = await tryImport(name);
  if (direct) return direct;
  const roots = [];
  try { roots.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()); } catch { /* no npm */ }
  roots.push(join(process.cwd(), 'node_modules'));
  const npx = join(homedir(), '.npm', '_npx');
  if (existsSync(npx)) { try { for (const e of await readdir(npx)) roots.push(join(npx, e, 'node_modules')); } catch { /* ignore */ } }
  for (const root of roots) {
    const dir = join(root, name);
    if (!existsSync(join(dir, 'package.json'))) continue;
    try { const require = createRequire(join(dir, 'package.json')); const m = require(name); if (m) return m; } catch { /* next */ }
    const entry = join(dir, 'index.js');
    if (existsSync(entry)) { const m = await tryImport(pathToFileURL(entry).href); if (m) return m; }
  }
  return null;
}

async function browser() {
  for (const name of ['playwright', 'playwright-core']) {
    const mod = await findPackage(name);
    const chromium = mod?.chromium ?? mod?.default?.chromium;
    if (chromium) return { kind: 'playwright', launch: () => chromium.launch({ headless: true }) };
  }
  const pup = await findPackage('puppeteer');
  const api = pup?.default ?? pup;
  if (api?.launch) return { kind: 'puppeteer', launch: () => api.launch({ headless: 'new' }) };
  console.error('No browser engine found. npm i -D playwright && npx playwright install chromium');
  process.exit(3);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/* ----------------------------------------------------------------- shoot */
async function shoot() {
  const url = argv[1];
  const out = resolve(argv[2] || 'shot.png');
  const [vw, vh] = String(arg('viewport', '1440x900')).split('x').map(Number);
  const wait = Number(arg('wait', 2500));
  const script = arg('script', '');
  const hide = arg('hide', '');
  const clip = arg('clip', '');

  const eng = await browser();
  const b = await eng.launch();
  const isPW = eng.kind === 'playwright';
  const ctx = isPW ? await b.newContext({ viewport: { width: vw, height: vh }, userAgent: UA }) : null;
  const page = isPW ? await ctx.newPage() : await b.newPage();
  if (!isPW) { await page.setViewport({ width: vw, height: vh }); await page.setUserAgent(UA); }

  try { await page.goto(url, { waitUntil: isPW ? 'networkidle' : 'networkidle2', timeout: 45000 }); }
  catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
  await sleep(wait);

  if (hide) {
    await page.evaluate(`document.querySelectorAll(${JSON.stringify(hide)}).forEach(e => e.style.setProperty('display','none','important'))`);
    await sleep(200);
  }
  if (script) { await page.evaluate(script); await sleep(Number(arg('after', 700))); }

  await mkdir(dirname(out), { recursive: true });
  const opts = { path: out };
  if (clip) { const [x, y, w, h] = clip.split(',').map(Number); opts.clip = { x, y, width: w, height: h }; }
  await page.screenshot(opts);
  await b.close();
  process.stderr.write(`shot → ${out}  (${vw}×${vh}${clip ? ', clipped ' + clip : ''})\n`);
}

/* ------------------------------------------------------------------ diff */
/* The comparison runs inside the browser: it can decode PNGs and do the pixel
   work without pulling an image library into this toolkit. */
const COMPARE = (aUrl, bUrl, mode, threshold) => new Promise(async (resolve, reject) => {
  // images arrive as data: URLs — a file:// image cannot be read from about:blank,
  // and a silently un-decoded image leaves this promise hanging for ever
  const load = src => new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('image failed to decode'));
    i.src = src;
  });
  setTimeout(() => reject(new Error('comparison timed out')), 20000);
  const [ia, ib] = await Promise.all([load(aUrl), load(bUrl)]);
  const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);

  const grab = img => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0, w, h);
    return x.getImageData(0, 0, w, h);
  };
  const A = grab(ia), B = grab(ib);

  const luma = d => { const out = new Float32Array(w * h);
    for (let i = 0, p = 0; i < d.data.length; i += 4, p++)
      out[p] = 0.2126 * d.data[i] + 0.7152 * d.data[i + 1] + 0.0722 * d.data[i + 2];
    return out; };

  const sobel = L => { const out = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -L[i - w - 1] - 2 * L[i - 1] - L[i + w - 1] + L[i - w + 1] + 2 * L[i + 1] + L[i + w + 1];
      const gy = -L[i - w - 1] - 2 * L[i - w] - L[i - w + 1] + L[i + w - 1] + 2 * L[i + w] + L[i + w + 1];
      out[i] = Math.min(255, Math.hypot(gx, gy) / 4);
    }
    return out; };

  let FA, FB;
  if (mode === 'raw') { FA = luma(A); FB = luma(B); }
  else { const la = luma(A), lb = luma(B); FA = mode === 'edges' ? sobel(la) : la; FB = mode === 'edges' ? sobel(lb) : lb; }

  // difference image + metrics
  const diff = document.createElement('canvas'); diff.width = w; diff.height = h;
  const dx = diff.getContext('2d');
  const out = dx.createImageData(w, h);
  const GRID = 8;
  const grid = Array.from({ length: GRID * GRID }, () => ({ sum: 0, n: 0 }));
  let sum = 0, sq = 0, over = 0;

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const d = Math.abs(FA[i] - FB[i]);
    sum += d; sq += d * d;
    if (d > threshold) over++;
    const g = Math.min(GRID - 1, Math.floor(y / h * GRID)) * GRID + Math.min(GRID - 1, Math.floor(x / w * GRID));
    grid[g].sum += d; grid[g].n++;
    const p = i * 4;
    // grey base, red where the two disagree
    const base = mode === 'raw' ? 255 - FA[i] * 0.35 : 235;
    out.data[p] = Math.min(255, base + d * 1.6);
    out.data[p + 1] = Math.max(0, base - d * 1.6);
    out.data[p + 2] = Math.max(0, base - d * 1.6);
    out.data[p + 3] = 255;
  }
  dx.putImageData(out, 0, 0);

  const n = w * h;
  const cells = grid.map((c, i) => ({ row: Math.floor(i / GRID), col: i % GRID, mean: c.n ? c.sum / c.n : 0 }));
  cells.sort((p, q) => q.mean - p.mean);

  resolve({
    size: [w, h],
    meanAbs: +(sum / n).toFixed(3),
    rmse: +Math.sqrt(sq / n).toFixed(3),
    pctOverThreshold: +(over / n * 100).toFixed(2),
    worstCells: cells.slice(0, 5).map(c => ({ row: c.row, col: c.col, mean: +c.mean.toFixed(2) })),
    diffPng: diff.toDataURL('image/png'),
  });
});

async function diffCmd() {
  const a = resolve(argv[1]), b = resolve(argv[2]);
  if (!existsSync(a) || !existsSync(b)) { console.error('both images must exist'); process.exit(2); }
  const mode = arg('mode', 'edges');
  const threshold = Number(arg('threshold', 12));
  const out = resolve(arg('out', b.replace(/\.png$/i, '') + '.diff.png'));

  const eng = await browser();
  const br = await eng.launch();
  const isPW = eng.kind === 'playwright';
  const ctx = isPW ? await br.newContext() : null;
  const page = isPW ? await ctx.newPage() : await br.newPage();
  await page.goto('about:blank');

  const asData = async p => 'data:image/png;base64,' + (await readFile(p)).toString('base64');
  const [aData, bData] = await Promise.all([asData(a), asData(b)]);
  const res = await page.evaluate(
    `(${COMPARE.toString()})(${JSON.stringify(aData)}, ${JSON.stringify(bData)}, ${JSON.stringify(mode)}, ${threshold})`
  );
  await br.close();

  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(res.diffPng.split(',')[1], 'base64'));
  const { diffPng, ...metrics } = res;

  if (has('json')) { console.log(JSON.stringify({ ...metrics, diff: out }, null, 2)); return; }
  const verdict = metrics.meanAbs < 4 ? 'very close'
    : metrics.meanAbs < 9 ? 'close — worth one more pass'
    : metrics.meanAbs < 18 ? 'recognisable but off' : 'structurally different';
  process.stderr.write(
    `\ncompare (${mode}) ${metrics.size[0]}×${metrics.size[1]}\n` +
    `  mean |Δ|            ${metrics.meanAbs}\n` +
    `  rmse                ${metrics.rmse}\n` +
    `  pixels over ${String(threshold).padEnd(3)}     ${metrics.pctOverThreshold}%\n` +
    `  worst 8×8 cells     ${metrics.worstCells.map(c => `r${c.row}c${c.col}=${c.mean}`).join('  ')}\n` +
    `  verdict             ${verdict}\n` +
    `  diff image          ${out}\n`
  );
}

await (cmd === 'shoot' ? shoot() : diffCmd());
