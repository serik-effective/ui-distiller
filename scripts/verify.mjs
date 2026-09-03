#!/usr/bin/env node
/**
 * UI Distiller — static verification of a distillation output directory.
 *
 * Usage: node scripts/verify.mjs <root> [--max-file-kb 300]
 *
 * Checks structure, patterns.json integrity, README completeness, JS syntax of
 * every inline and local script, local asset resolution, gallery links, leftover
 * references to the source origin, and file sizes.
 *
 * Exit 0 = no errors (warnings allowed). Exit 1 = errors found.
 * Static only: motion and interaction still need a browser pass.
 */

import { readFile, stat, readdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = process.argv[2];
if (!root) { console.error('usage: node verify.mjs <root> [--max-file-kb 300]'); process.exit(1); }
const mi = process.argv.indexOf('--max-file-kb');
const maxFile = (mi === -1 ? 300 : Number(process.argv[mi + 1])) * 1024;

const errors = [], warns = [], notes = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warns.push(`${where}: ${msg}`);

const exists = async p => { try { await stat(p); return true; } catch { return false; } };
const read = async p => { try { return await readFile(p, 'utf8'); } catch { return null; } };

const REQUIRED_README = ['## What is interesting', '## Behavior', '## Trigger', '## Implementation',
  '## Distilled implementation', '## Key techniques', '## Parameters worth tuning', '## Fidelity',
  '## Difficulty', '## Tags'];
const REQUIRED_REPORT = ['## Design language', '## Motion language', '## Interaction philosophy',
  '## Technology observations', '## Best patterns', '## Patterns', '## What makes this site special'];

/* ---------- root ---------- */
for (const f of ['index.html', 'REPORT.md', 'patterns.json']) {
  if (!await exists(join(root, f))) err('root', `missing ${f}`);
}

const report = await read(join(root, 'REPORT.md'));
if (report) {
  for (const h of REQUIRED_REPORT) if (!report.includes(h)) err('REPORT.md', `missing section "${h}"`);
  if (/TODO|TBD|lorem ipsum/i.test(report)) warn('REPORT.md', 'contains TODO/TBD/lorem placeholder text');
}

let data = null;
const rawJson = await read(join(root, 'patterns.json'));
if (rawJson) {
  try { data = JSON.parse(rawJson); }
  catch (e) { err('patterns.json', `invalid JSON — ${e.message}`); }
}

/* ---------- patterns ---------- */
const sourceHost = data?.host || (data?.site ? new URL(data.site).hostname : null);
const patterns = data?.patterns || [];
if (data && !patterns.length) err('patterns.json', 'no patterns listed');

const seenSlugs = new Set();
let demoCount = 0;

for (const p of patterns) {
  const where = `pattern ${p.slug || p.name || '?'}`;
  for (const f of ['slug', 'number', 'name', 'categories', 'description', 'difficulty', 'fidelity']) {
    if (p[f] === undefined || p[f] === null || p[f] === '') err(where, `patterns.json missing field "${f}"`);
  }
  if (p.slug) {
    if (seenSlugs.has(p.slug)) err(where, 'duplicate slug');
    seenSlugs.add(p.slug);
    if (!/^\d{2}-[a-z0-9-]+$/.test(p.slug)) warn(where, `slug "${p.slug}" should look like 01-kebab-name`);
  }
  if (p.difficulty && !['Easy', 'Medium', 'Hard'].includes(p.difficulty)) err(where, `difficulty must be Easy/Medium/Hard, got "${p.difficulty}"`);
  if (p.fidelity && !['high', 'approximate'].includes(p.fidelity)) err(where, `fidelity must be high/approximate, got "${p.fidelity}"`);

  const dir = join(root, 'patterns', p.slug || '');
  const idx = join(dir, 'index.html');
  if (!await exists(idx)) { err(where, 'missing index.html'); continue; }
  demoCount++;

  const readme = await read(join(dir, 'README.md'));
  if (readme === null) err(where, 'missing README.md');
  else {
    for (const h of REQUIRED_README) if (!readme.includes(h)) err(where, `README missing section "${h}"`);
    if (!/https?:\/\//.test(readme)) warn(where, 'README has no source URL');
    if (/TODO|TBD|PATTERN NAME/.test(readme)) warn(where, 'README still contains template placeholder text');
    const fid = /## Fidelity\s*\n+\s*(\w+)/.exec(readme)?.[1];
    if (fid && p.fidelity && fid !== p.fidelity) err(where, `fidelity mismatch: README "${fid}" vs patterns.json "${p.fidelity}"`);
  }

  await checkHtml(idx, where, p, sourceHost);

  // stray files
  const files = await readdir(dir).catch(() => []);
  for (const f of files) {
    const s = await stat(join(dir, f)).catch(() => null);
    if (s?.isFile() && s.size > maxFile) warn(where, `${f} is ${(s.size / 1024 | 0)}KB — heavy for a distilled demo`);
  }
}

/* ---------- gallery ---------- */
const gallery = await read(join(root, 'index.html'));
if (gallery) {
  const hrefs = [...gallery.matchAll(/href="([^"]+)"/g)].map(m => m[1])
    .filter(h => !/^https?:|^#|^mailto:/.test(h));
  for (const h of [...new Set(hrefs)]) {
    if (!await exists(join(root, decodeURIComponent(h.split('#')[0])))) err('index.html', `broken link → ${h}`);
  }
  for (const p of patterns) {
    if (p.slug && !gallery.includes(`patterns/${p.slug}/index.html`)) err('index.html', `gallery does not link ${p.slug} (rerun gallery.mjs)`);
  }
  if (!gallery.includes('<title>')) warn('index.html', 'no <title>');
}

/* ---------- html checker ---------- */
async function checkHtml(file, where, p, host) {
  const html = await read(file);
  if (html === null) { err(where, 'index.html unreadable'); return; }
  const rel = file.slice(root.length + 1);

  if (!/<title>/i.test(html)) warn(where, 'demo has no <title>');
  if (!/<meta[^>]+viewport/i.test(html)) warn(where, 'demo has no viewport meta');
  if (!/prefers-reduced-motion/.test(html)) warn(where, 'demo does not handle prefers-reduced-motion');
  if (/PATTERN NAME|TRIGGER HINT|Replace with the isolated pattern/.test(html)) err(where, 'demo still contains template placeholder text');

  // inline scripts
  let i = 0;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attr = m[1] || '', code = m[2];
    if (/\bsrc\s*=/.test(attr)) continue;
    const type = /type\s*=\s*["']?([^"'\s>]+)/i.exec(attr)?.[1] || '';
    if (type && !/javascript|module/i.test(type)) continue;
    i++;
    if (!code.trim()) continue;
    // Global lexical declarations that collide with non-configurable window
    // properties throw a SyntaxError only in a browser — vm.Script cannot see it.
    if (!/module/i.test(type)) {
      // Only a declaration at top level collides with the global object; the same
      // name inside a function or block is ordinary and legal. Requiring column 0
      // is a coarse but effective stand-in for "not nested".
      const fatal = /^(?:const|let|class)\s+(top|window|location|document)\b/gm;
      for (const m of code.matchAll(fatal)) {
        err(where, `inline script ${i} declares global "${m[1]}" — collides with the non-configurable window.${m[1]} and throws a SyntaxError in the browser (Node cannot see this)`);
      }
      const shadow = /^(?:const|let|class)\s+(self|parent|name|status|history|length|closed|frames|origin|navigator|screen|event)\b/gm;
      for (const m of code.matchAll(shadow)) {
        warn(where, `inline script ${i} shadows global "${m[1]}" — legal, but confusing next to window.${m[1]}`);
      }
    }
    try { new vm.Script(code, { filename: `${rel}#inline${i}` }); }
    catch (e) {
      if (/import statement|export declaration|await is only valid/i.test(e.message) && /module/i.test(type)) continue;
      err(where, `inline script ${i} syntax error — ${e.message}`);
    }
  }

  // external references
  const refs = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
  let remote = false;
  for (const r of refs) {
    if (/^(#|data:|mailto:|javascript:)/i.test(r)) continue;
    if (/\$\{|\{\{|<%/.test(r)) continue;          // template placeholder, not a real reference
    if (/^https?:\/\//i.test(r)) {
      remote = true;
      const h = new URL(r).hostname;
      if (host && (h === host || h.endsWith('.' + host))) err(where, `demo loads a resource from the source site → ${r}`);
      else if (!/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com|placehold\.co|picsum\.photos/.test(h)) {
        warn(where, `demo loads from an unusual host → ${h}`);
      }
      if (/cdnjs|jsdelivr|unpkg/.test(h) && !/\d+\.\d+\.\d+/.test(r)) warn(where, `CDN dependency is not version-pinned → ${r}`);
      continue;
    }
    if (r.startsWith('//')) { remote = true; warn(where, `protocol-relative URL → ${r}`); continue; }
    const target = resolve(dirname(file), r.split('#')[0].split('?')[0]);
    if (!await exists(target)) err(where, `missing local file → ${r}`);
    else if (/\.js$/.test(r)) {
      const code = await read(target);
      try { new vm.Script(code, { filename: r }); }
      catch (e) {
        if (!/import statement|export declaration/i.test(e.message)) err(where, `${r} syntax error — ${e.message}`);
      }
    }
  }
  if (host && new RegExp(String.raw`https?://(?:[\w-]+\.)*${host.replace(/\./g, String.raw`\.`)}`, 'i').test(html.replace(/<!--[\s\S]*?-->/g, ''))) {
    notes.push(`${where}: mentions the source origin in markup (fine in a comment or credit link, not as a dependency)`);
  }
  // A demo may build its URLs in script rather than in markup, so check the code too
  // before deciding whether it really reaches the network.
  const remoteInScript = /https?:\/\/(?!localhost|127\.)[\w.-]+/.test(
    [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n'));
  const reachesNetwork = remote || remoteInScript;

  if (p.needsNetwork === false && reachesNetwork) err(where, 'patterns.json says needsNetwork:false but the demo loads remote resources');
  if (p.needsNetwork === true && !reachesNetwork) warn(where, 'patterns.json says needsNetwork:true but no remote resource found');
}

/* ---------- output ---------- */
const line = s => process.stdout.write(s + '\n');
line('');
line(`UI Distiller verify — ${root}`);
line(`patterns listed ${patterns.length} · demos found ${demoCount}`);
if (errors.length) { line(''); line(`ERRORS (${errors.length})`); errors.forEach(e => line('  ✗ ' + e)); }
if (warns.length) { line(''); line(`WARNINGS (${warns.length})`); warns.forEach(w => line('  ! ' + w)); }
if (notes.length) { line(''); line('NOTES'); notes.forEach(n => line('  · ' + n)); }
line('');
line(errors.length ? 'FAIL — fix errors before finishing.' : 'PASS (static). Now verify each demo in a browser: console errors, trigger, visible effect.');
process.exit(errors.length ? 1 : 0);
